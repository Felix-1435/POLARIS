/**
 * Offline map tile cache (IndexedDB).
 * Tiles are stored as blobs keyed by "z/x/y".
 * "Download pack" prefetches a grid around each station for offline use.
 */

const DB_NAME = 'polaris_map_tiles_v1'
const STORE = 'tiles'
const META = 'meta'
const DB_VERSION = 1

export type TileKey = string // `${z}/${x}/${y}`

export type PackProgress = {
  done: number
  total: number
  station?: string
  status: 'idle' | 'downloading' | 'done' | 'error'
  message?: string
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onerror = () => reject(req.error)
    req.onsuccess = () => resolve(req.result)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE)
      }
      if (!db.objectStoreNames.contains(META)) {
        db.createObjectStore(META)
      }
    }
  })
}

export async function getCachedTile(key: TileKey): Promise<Blob | null> {
  try {
    const db = await openDb()
    return await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly')
      const req = tx.objectStore(STORE).get(key)
      req.onsuccess = () => resolve((req.result as Blob) || null)
      req.onerror = () => reject(req.error)
    })
  } catch {
    return null
  }
}

export async function putTile(key: TileKey, blob: Blob): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(blob, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function countCachedTiles(): Promise<number> {
  try {
    const db = await openDb()
    return await new Promise((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).count()
      req.onsuccess = () => resolve(req.result)
      req.onerror = () => reject(req.error)
    })
  } catch {
    return 0
  }
}

export async function clearTileCache(): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).clear()
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/** Web Mercator helpers */
export function latLngToTile(lat: number, lng: number, z: number): { x: number; y: number } {
  const n = Math.pow(2, z)
  const x = Math.floor(((lng + 180) / 360) * n)
  const latRad = (lat * Math.PI) / 180
  const y = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n)
  return { x: Math.max(0, Math.min(n - 1, x)), y: Math.max(0, Math.min(n - 1, y)) }
}

/** Default tile URL template (Carto dark — good for polar UI). {s} subdomain optional. */
export const TILE_URL = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'
export const TILE_SUBDOMAINS = ['a', 'b', 'c', 'd']
export const TILE_ATTRIB = '&copy; OpenStreetMap &copy; CARTO'

export function tileUrl(z: number, x: number, y: number, s = 'a'): string {
  return TILE_URL
    .replace('{s}', s)
    .replace('{z}', String(z))
    .replace('{x}', String(x))
    .replace('{y}', String(y))
}

async function fetchAndCache(z: number, x: number, y: number): Promise<boolean> {
  const key = `${z}/${x}/${y}`
  const existing = await getCachedTile(key)
  if (existing) return true
  try {
    const s = TILE_SUBDOMAINS[(x + y) % TILE_SUBDOMAINS.length]
    const res = await fetch(tileUrl(z, x, y, s), { mode: 'cors' })
    if (!res.ok) return false
    const blob = await res.blob()
    await putTile(key, blob)
    return true
  } catch {
    return false
  }
}

export type StationPack = {
  id: string
  name: string
  lat: number
  lng: number
  /** radius in tiles at each zoom */
  radius?: number
  zooms?: number[]
}

/**
 * Download a rectangular pack of tiles around stations for offline use.
 * Keep radius/zooms modest to avoid huge downloads (~few hundred tiles).
 */
export async function downloadOfflinePack(
  stations: StationPack[],
  onProgress?: (p: PackProgress) => void
): Promise<PackProgress> {
  const zoomsDefault = [4, 5, 6, 7, 8, 9, 10]
  const jobs: { z: number; x: number; y: number; station: string }[] = []

  for (const st of stations) {
    const zooms = st.zooms || zoomsDefault
    const radius = st.radius ?? 2
    for (const z of zooms) {
      const { x: cx, y: cy } = latLngToTile(st.lat, st.lng, z)
      // Wider radius at low zoom for regional context
      const r = z <= 5 ? radius + 2 : z <= 7 ? radius + 1 : radius
      for (let dx = -r; dx <= r; dx++) {
        for (let dy = -r; dy <= r; dy++) {
          const n = Math.pow(2, z)
          const x = ((cx + dx) % n + n) % n
          const y = cy + dy
          if (y < 0 || y >= n) continue
          jobs.push({ z, x, y, station: st.name })
        }
      }
    }
  }

  // Dedupe
  const seen = new Set<string>()
  const unique = jobs.filter(j => {
    const k = `${j.z}/${j.x}/${j.y}`
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })

  let done = 0
  const total = unique.length
  onProgress?.({ done, total, status: 'downloading', message: 'Starting pack download…' })

  // Concurrency-limited fetch
  const concurrency = 6
  let i = 0
  async function worker() {
    while (i < unique.length) {
      const idx = i++
      const j = unique[idx]
      await fetchAndCache(j.z, j.x, j.y)
      done++
      if (done % 5 === 0 || done === total) {
        onProgress?.({
          done,
          total,
          station: j.station,
          status: 'downloading',
          message: `Cached ${done}/${total} tiles`,
        })
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, () => worker()))

  const final: PackProgress = { done: total, total, status: 'done', message: `Offline pack ready (${total} tiles)` }
  onProgress?.(final)

  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(META, 'readwrite')
      tx.objectStore(META).put({ at: Date.now(), tiles: total, stations: stations.map(s => s.id) }, 'lastPack')
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  } catch { /* ignore */ }

  return final
}

/** Create object URL for a cached tile (caller should revoke when done). */
export async function getTileObjectUrl(z: number, x: number, y: number): Promise<string | null> {
  const blob = await getCachedTile(`${z}/${x}/${y}`)
  if (!blob) return null
  return URL.createObjectURL(blob)
}
