import { useEffect, useRef, useState } from 'react'
import { Download, Trash2, Wifi, WifiOff, Map as MapIcon, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  downloadOfflinePack,
  countCachedTiles,
  clearTileCache,
  getCachedTile,
  putTile,
  tileUrl,
  tileUrlEsri,
  TILE_ATTRIB,
  type PackProgress,
  type StationPack,
} from '@/lib/offlineMapTiles'
import { STATIONS } from '@/lib/offlineEmergencies'

declare global {
  interface Window {
    L: any
  }
}

type EmergencyPin = {
  id: string
  lat: number
  lng: number
  label: string
  type?: string
}

type Props = {
  emergencies?: EmergencyPin[]
  className?: string
  height?: number
}

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'

function loadLeaflet(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (window.L) {
      resolve(window.L)
      return
    }
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = LEAFLET_CSS
      document.head.appendChild(link)
    }
    const existing = document.querySelector(`script[src="${LEAFLET_JS}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(window.L))
      return
    }
    const script = document.createElement('script')
    script.src = LEAFLET_JS
    script.async = true
    script.onload = () => resolve(window.L)
    script.onerror = () => reject(new Error('Failed to load Leaflet'))
    document.head.appendChild(script)
  })
}

/** Leaflet tile layer that prefers IndexedDB cache, falls back to network and caches. */
function createOfflineTileLayer(L: any) {
  return L.GridLayer.extend({
    createTile: function (coords: { x: number; y: number; z: number }, done: (err: any, tile: HTMLElement) => void) {
      const tile = document.createElement('img')
      tile.alt = ''
      tile.setAttribute('role', 'presentation')
      tile.style.width = '100%'
      tile.style.height = '100%'
      // @ts-expect-error leaflet internal
      const size = this.getTileSize()
      tile.width = size.x
      tile.height = size.y

      const z = coords.z
      const x = coords.x
      const y = coords.y
      const key = `${z}/${x}/${y}`

      ;(async () => {
        try {
          const cached = await getCachedTile(key)
          if (cached) {
            const url = URL.createObjectURL(cached)
            tile.onload = () => {
              URL.revokeObjectURL(url)
              done(null, tile)
            }
            tile.onerror = () => {
              URL.revokeObjectURL(url)
              done(null, tile)
            }
            tile.src = url
            return
          }

          // Network fetch + cache (OSM, then Esri — no API key)
          if (!navigator.onLine) {
            tile.style.background = '#0f172a'
            done(null, tile)
            return
          }
          let blob: Blob | null = null
          for (const url of [tileUrl(z, x, y), tileUrlEsri(z, x, y)]) {
            try {
              const res = await fetch(url, { mode: 'cors', headers: { Accept: 'image/png,image/*' } })
              if (!res.ok) continue
              const b = await res.blob()
              if (b.size < 500) continue
              blob = b
              break
            } catch { /* try next */ }
          }
          if (!blob) {
            tile.style.background = '#0f172a'
            done(null, tile)
            return
          }
          await putTile(key, blob).catch(() => {})
          const obj = URL.createObjectURL(blob)
          tile.onload = () => {
            URL.revokeObjectURL(obj)
            done(null, tile)
          }
          tile.onerror = () => {
            URL.revokeObjectURL(obj)
            done(null, tile)
          }
          tile.src = obj
        } catch {
          tile.style.background = '#0f172a'
          done(null, tile)
        }
      })()

      return tile
    },
  })
}

const PACK_STATIONS: StationPack[] = [
  { id: 'maitri', name: 'Maitri', lat: -70.767, lng: 11.733, radius: 2 },
  { id: 'bharati', name: 'Bharati', lat: -69.407, lng: 76.187, radius: 2 },
  { id: 'camp-a', name: 'Field Camp A', lat: -70.55, lng: 11.9, radius: 1 },
  { id: 'camp-b', name: 'Field Camp B', lat: -70.82, lng: 11.45, radius: 1 },
  // Regional overview (Southern Ocean approach)
  { id: 'overview', name: 'Polar overview', lat: -70.0, lng: 40.0, radius: 1, zooms: [3, 4, 5, 6] },
]

export default function OfflineTileMap({ emergencies = [], className, height = 420 }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const [online, setOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [tileCount, setTileCount] = useState(0)
  const [progress, setProgress] = useState<PackProgress | null>(null)
  const [downloading, setDownloading] = useState(false)

  const refreshCount = async () => {
    setTileCount(await countCachedTiles())
  }

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    refreshCount()
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    let map: any

    ;(async () => {
      try {
        const L = await loadLeaflet()
        if (cancelled || !containerRef.current) return

        // Fix default marker icons when using CDN
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        })

        map = L.map(containerRef.current, {
          center: [-70.5, 30],
          zoom: 4,
          minZoom: 2,
          maxZoom: 12,
          zoomControl: true,
        })
        mapRef.current = map

        const OfflineLayer = createOfflineTileLayer(L)
        const layer = new OfflineLayer({
          attribution: TILE_ATTRIB,
          maxZoom: 12,
          minZoom: 2,
        })
        layer.addTo(map)

        // Station markers
        const stationIcon = (color: string) =>
          L.divIcon({
            className: '',
            html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 8px ${color}"></div>`,
            iconSize: [14, 14],
            iconAnchor: [7, 7],
          })

        STATIONS.forEach(s => {
          const color = s.type === 'station' ? '#10b981' : s.type === 'camp' ? '#f59e0b' : '#38bdf8'
          L.marker([s.lat, s.lng], { icon: stationIcon(color) })
            .bindPopup(`<strong>${s.name}</strong><br/><span style="font-size:11px;opacity:.8">${s.type} · ${s.lat.toFixed(3)}, ${s.lng.toFixed(3)}</span>`)
            .addTo(map)
        })

        // Emergency pins
        emergencies.forEach(e => {
          if (e.lat == null || e.lng == null) return
          L.marker([e.lat, e.lng], {
            icon: stationIcon('#ef4444'),
          })
            .bindPopup(`<strong style="color:#f87171">${e.id}</strong><br/>${e.label || e.type || 'Emergency'}`)
            .addTo(map)
        })

        setReady(true)
      } catch (err) {
        console.error(err)
        toast.error('Map failed to load')
      }
    })()

    return () => {
      cancelled = true
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Update emergency markers when list changes
  useEffect(() => {
    const map = mapRef.current
    const L = window.L
    if (!map || !L || !ready) return

    // Remove previous emergency layer group if any
    if ((map as any)._emGroup) {
      map.removeLayer((map as any)._emGroup)
    }
    const group = L.layerGroup()
    emergencies.forEach(e => {
      if (e.lat == null || e.lng == null) return
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:16px;height:16px;border-radius:50%;background:#ef4444;border:2px solid #fff;box-shadow:0 0 10px #ef4444;animation:pulse 1.5s infinite"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })
      L.marker([e.lat, e.lng], { icon })
        .bindPopup(`<strong style="color:#f87171">${e.id}</strong><br/>${e.label || 'Emergency'}`)
        .addTo(group)
    })
    group.addTo(map)
    ;(map as any)._emGroup = group
  }, [emergencies, ready])

  const handleDownload = async () => {
    if (!navigator.onLine) {
      toast.error('Need internet once to download the offline pack')
      return
    }
    setDownloading(true)
    try {
      await downloadOfflinePack(PACK_STATIONS, p => setProgress(p))
      await refreshCount()
      toast.success('Offline map pack saved on this device')
      // Force tile refresh
      if (mapRef.current) mapRef.current.invalidateSize()
    } catch (e: any) {
      toast.error(e.message || 'Pack download failed')
      setProgress({ done: 0, total: 0, status: 'error', message: e.message })
    } finally {
      setDownloading(false)
    }
  }

  const handleClear = async () => {
    await clearTileCache()
    await refreshCount()
    setProgress(null)
    toast.message('Offline tile cache cleared')
  }

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn(
          'inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border font-medium',
          online ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
        )}>
          {online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
          {online ? 'Online tiles' : 'Offline cache'}
        </span>
        <span className="text-xs text-ice-500 flex items-center gap-1">
          <MapIcon className="w-3.5 h-3.5" />
          {tileCount.toLocaleString()} tiles cached
        </span>
        <div className="flex-1" />
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium disabled:opacity-50"
        >
          {downloading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
          {downloading ? 'Downloading…' : 'Download offline pack'}
        </button>
        <button
          onClick={handleClear}
          className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-ice-700 text-ice-400 hover:text-ice-200 hover:bg-ice-800/50"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear
        </button>
      </div>

      {progress && progress.status === 'downloading' && (
        <div className="rounded-lg border border-cyan-500/30 bg-cyan-500/5 px-3 py-2">
          <div className="flex justify-between text-xs text-cyan-300 mb-1">
            <span>{progress.message}</span>
            <span>{progress.total ? Math.round((progress.done / progress.total) * 100) : 0}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-ice-800 overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all"
              style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      <div
        ref={containerRef}
        className="w-full rounded-xl overflow-hidden border border-ice-800/50 bg-ice-950"
        style={{ height }}
      />

      <p className="text-[11px] text-ice-500">
        Uses free OpenStreetMap + Esri tiles (no API key). If you still see "API KEY REQUIRED", click Clear then Download offline pack — that was old Carto cache.
      </p>
    </div>
  )
}
