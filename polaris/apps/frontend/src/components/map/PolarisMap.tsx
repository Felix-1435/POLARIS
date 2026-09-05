import { useEffect, useRef, useState } from 'react'
import {
  getCachedTile,
  putTile,
  tileUrlEsri,
  tileUrlOsm,
  TILE_ATTRIB,
  countCachedTiles,
  downloadOfflinePack,
  type StationPack,
} from '@/lib/offlineMapTiles'

declare global {
  interface Window { L: any }
}

export type MapMarker = {
  id: string
  lat: number
  lng: number
  label: string
  sub?: string
  color?: string
  kind?: 'station' | 'camp' | 'vessel' | 'port' | 'cargo' | 'emergency' | 'default'
}

type Props = {
  markers?: MapMarker[]
  center?: [number, number]
  zoom?: number
  height?: number | string
  className?: string
  showDownloadHint?: boolean
}

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'

const STATION_MARKERS: MapMarker[] = [
  { id: 'goa', lat: 15.4, lng: 73.8, label: 'Goa / Mormugao Port', kind: 'port', color: '#a78bfa' },
  { id: 'ship', lat: -55.0, lng: 40.0, label: 'MV Sagar Kanya', sub: 'In transit', kind: 'vessel', color: '#38bdf8' },
  { id: 'maitri', lat: -70.767, lng: 11.733, label: 'Maitri Research Station', kind: 'station', color: '#10b981' },
  { id: 'bharati', lat: -69.407, lng: 76.187, label: 'Bharati Research Station', kind: 'station', color: '#10b981' },
  { id: 'camp-a', lat: -70.55, lng: 11.9, label: 'Field Camp A', kind: 'camp', color: '#f59e0b' },
  { id: 'camp-b', lat: -70.82, lng: 11.45, label: 'Field Camp B', sub: 'Medical alert', kind: 'camp', color: '#ef4444' },
]

function loadLeaflet(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (window.L) return resolve(window.L)
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = LEAFLET_CSS
      document.head.appendChild(link)
    }
    // Leaflet default CSS fix for broken tiles half-size
    if (!document.getElementById('polaris-leaflet-fix')) {
      const style = document.createElement('style')
      style.id = 'polaris-leaflet-fix'
      style.textContent = `
        .leaflet-container { width: 100% !important; height: 100% !important; background: #0a1628; font: inherit; }
        .leaflet-tile-pane { opacity: 1 !important; }
        .leaflet-tile { max-width: none !important; max-height: none !important; }
        .leaflet-container img.leaflet-tile { max-width: none !important; }
        .leaflet-pane { z-index: auto; }
      `
      document.head.appendChild(style)
    }
    const existing = document.querySelector(`script[src="${LEAFLET_JS}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve(window.L))
      if (window.L) resolve(window.L)
      return
    }
    const s = document.createElement('script')
    s.src = LEAFLET_JS
    s.async = true
    s.onload = () => resolve(window.L)
    s.onerror = () => reject(new Error('Leaflet load failed'))
    document.head.appendChild(s)
  })
}

function createSatelliteLayer(L: any) {
  return L.TileLayer.extend({
    createTile(coords: { x: number; y: number; z: number }, done: (e: any, t: HTMLElement) => void) {
      const tile = document.createElement('img')
      tile.alt = ''
      tile.setAttribute('role', 'presentation')
      // Critical: do NOT set width/height attributes that fight CSS — causes half tiles
      tile.style.cssText = 'width:256px;height:256px;display:block;'

      const { x, y, z } = coords
      const key = `${z}/${x}/${y}`

      const finish = (src: string | null) => {
        if (!src) {
          tile.style.background = '#0a1628'
          done(null, tile)
          return
        }
        tile.onload = () => done(null, tile)
        tile.onerror = () => {
          tile.style.background = '#0a1628'
          done(null, tile)
        }
        tile.src = src
      }

      ;(async () => {
        try {
          const cached = await getCachedTile(key)
          if (cached) {
            finish(URL.createObjectURL(cached))
            return
          }
          if (!navigator.onLine) {
            finish(null)
            return
          }
          let blob: Blob | null = null
          for (const url of [tileUrlEsri(z, x, y), tileUrlOsm(z, x, y)]) {
            try {
              const res = await fetch(url, { mode: 'cors', headers: { Accept: 'image/*' } })
              if (!res.ok) continue
              const b = await res.blob()
              if (b.size < 800) continue
              blob = b
              break
            } catch { /* next */ }
          }
          if (!blob) {
            finish(null)
            return
          }
          await putTile(key, blob).catch(() => {})
          finish(URL.createObjectURL(blob))
        } catch {
          finish(null)
        }
      })()

      return tile
    },
  })
}

function markerIcon(L: any, color: string, pulse = false) {
  return L.divIcon({
    className: '',
    html: `<div style="width:16px;height:16px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 12px ${color}${pulse ? ',0 0 20px ' + color : ''}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

export default function PolarisMap({
  markers,
  center = [-55, 40],
  zoom = 3,
  height = 400,
  className = '',
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const groupRef = useRef<any>(null)
  const [ready, setReady] = useState(false)

  const pins = markers && markers.length ? markers : STATION_MARKERS
  const h = typeof height === 'number' ? `${height}px` : height

  useEffect(() => {
    let cancelled = false
    let map: any
    let ro: ResizeObserver | null = null
    const timers: number[] = []

    const invalidate = () => {
      if (mapRef.current) {
        try {
          mapRef.current.invalidateSize(true)
        } catch { /* ignore */ }
      }
    }

    ;(async () => {
      try {
        const L = await loadLeaflet()
        if (cancelled || !wrapRef.current) return

        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        })

        // Ensure container has measurable size before init
        const el = wrapRef.current
        el.style.height = h
        el.style.width = '100%'
        el.style.minHeight = typeof height === 'number' ? `${height}px` : '320px'

        map = L.map(el, {
          center,
          zoom,
          minZoom: 2,
          maxZoom: 13,
          zoomControl: true,
          attributionControl: true,
          preferCanvas: false,
        })
        mapRef.current = map

        const OfflineLayer = createSatelliteLayer(L)
        // tileSize 256 is default; explicit helps half-load bugs
        new OfflineLayer({
          attribution: TILE_ATTRIB,
          maxZoom: 13,
          minZoom: 2,
          tileSize: 256,
          zoomOffset: 0,
          updateWhenIdle: false,
          updateWhenZooming: true,
          keepBuffer: 2,
        }).addTo(map)

        setReady(true)

        // Fix half-map: invalidate after layout settles
        ;[50, 150, 400, 800, 1500].forEach(ms => {
          timers.push(window.setTimeout(invalidate, ms))
        })

        ro = new ResizeObserver(() => invalidate())
        ro.observe(el)
        window.addEventListener('resize', invalidate)

        if (navigator.onLine) {
          const packs: StationPack[] = [
            { id: 'maitri', name: 'Maitri', lat: -70.767, lng: 11.733, radius: 1, zooms: [3, 4, 5, 6] },
            { id: 'bharati', name: 'Bharati', lat: -69.407, lng: 76.187, radius: 1, zooms: [3, 4, 5, 6] },
            { id: 'overview', name: 'Overview', lat: -50, lng: 40, radius: 1, zooms: [2, 3, 4] },
          ]
          countCachedTiles().then(n => {
            if (n < 40) downloadOfflinePack(packs).catch(() => {})
          })
        }
      } catch (e) {
        console.error(e)
      }
    })()

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      ro?.disconnect()
      window.removeEventListener('resize', () => {})
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const L = window.L
    if (!map || !L || !ready) return
    if (groupRef.current) map.removeLayer(groupRef.current)
    const group = L.layerGroup()
    pins.forEach(m => {
      const color = m.color || (m.kind === 'emergency' ? '#ef4444' : m.kind === 'station' ? '#10b981' : m.kind === 'camp' ? '#f59e0b' : m.kind === 'vessel' ? '#38bdf8' : m.kind === 'port' ? '#a78bfa' : '#22d3ee')
      const pulse = m.kind === 'emergency' || (m.sub || '').toLowerCase().includes('alert')
      L.marker([m.lat, m.lng], { icon: markerIcon(L, color, pulse) })
        .bindPopup(`<div style="min-width:120px"><strong>${m.label}</strong>${m.sub ? `<br/><span style="opacity:.75;font-size:12px">${m.sub}</span>` : ''}<br/><span style="font-size:11px;opacity:.6;font-family:monospace">${m.lat.toFixed(3)}, ${m.lng.toFixed(3)}</span></div>`)
        .addTo(group)
    })
    group.addTo(map)
    groupRef.current = group
    map.invalidateSize(true)
  }, [pins, ready])

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{
        height: h,
        width: '100%',
        minHeight: typeof height === 'number' ? height : 320,
        background: '#0a1628',
        position: 'relative',
        zIndex: 0,
      }}
    />
  )
}
