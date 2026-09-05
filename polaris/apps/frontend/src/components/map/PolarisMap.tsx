import { useEffect, useRef, useState } from 'react'
import {
  getCachedTile,
  putTile,
  tileUrlEsri,
  tileUrlOsm,
  TILE_ATTRIB,
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

/** Polyline path: array of [lat, lng] */
export type MapRoute = {
  id: string
  path: [number, number][]
  color?: string
  dashed?: boolean
  weight?: number
}

type Props = {
  markers?: MapMarker[]
  routes?: MapRoute[]
  center?: [number, number]
  zoom?: number
  height?: number | string
  className?: string
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

function injectLeafletAssets(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = LEAFLET_CSS
      document.head.appendChild(link)
    }
    if (!document.getElementById('polaris-leaflet-fix')) {
      const style = document.createElement('style')
      style.id = 'polaris-leaflet-fix'
      style.textContent = `
        .leaflet-container { width: 100% !important; height: 100% !important; background: #0a1628 !important; }
        .leaflet-tile-container img, .leaflet-tile { width: 256px !important; height: 256px !important; max-width: none !important; max-height: none !important; }
        .leaflet-pane { z-index: auto; }
      `
      document.head.appendChild(style)
    }
    if (window.L) return resolve(window.L)
    const existing = document.querySelector(`script[src="${LEAFLET_JS}"]`) as HTMLScriptElement | null
    if (existing) {
      if (window.L) return resolve(window.L)
      existing.addEventListener('load', () => resolve(window.L))
      return
    }
    const s = document.createElement('script')
    s.src = LEAFLET_JS
    s.async = true
    s.onload = () => resolve(window.L)
    s.onerror = () => reject(new Error('Leaflet failed'))
    document.head.appendChild(s)
  })
}

function createSatelliteLayer(L: any) {
  return L.TileLayer.extend({
    createTile(coords: { x: number; y: number; z: number }, done: (e: any, t: HTMLElement) => void) {
      const tile = document.createElement('img')
      tile.alt = ''
      tile.style.cssText = 'width:256px;height:256px;display:block;'
      const { x, y, z } = coords
      const key = `${z}/${x}/${y}`

      const finish = (src: string | null) => {
        if (!src) {
          tile.style.background = '#0a1628'
          done(null, tile)
          return
        }
        let revoked = false
        const cleanup = () => {
          if (!revoked && src.startsWith('blob:')) {
            try { URL.revokeObjectURL(src) } catch {}
            revoked = true
          }
        }
        tile.onload = () => { cleanup(); done(null, tile) }
        tile.onerror = () => {
          cleanup()
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

function markerIcon(L: any, color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 10px ${color}"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  })
}

export default function PolarisMap({
  markers,
  routes = [],
  center = [-40, 50],
  zoom = 3,
  height = 400,
  className = '',
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const layersRef = useRef<any>(null)
  const [ready, setReady] = useState(false)

  const pins = markers && markers.length ? markers : STATION_MARKERS
  const hPx = typeof height === 'number' ? height : 400

  useEffect(() => {
    let cancelled = false
    let map: any
    let ro: ResizeObserver | null = null
    const timers: number[] = []

    const invalidate = () => {
      try {
        mapRef.current?.invalidateSize({ pan: false })
      } catch { /* */ }
    }

    ;(async () => {
      try {
        const L = await injectLeafletAssets()
        if (cancelled || !wrapRef.current) return

        const el = wrapRef.current
        // Force pixel size before Leaflet measures
        el.style.width = '100%'
        el.style.height = `${hPx}px`
        el.style.minHeight = `${hPx}px`

        map = L.map(el, {
          center,
          zoom,
          minZoom: 2,
          maxZoom: 13,
          zoomControl: true,
          worldCopyJump: true,
          maxBounds: L.latLngBounds(L.latLng(-85, -180), L.latLng(85, 180)),
          maxBoundsViscosity: 0.8,
        })
        mapRef.current = map

        const OfflineLayer = createSatelliteLayer(L)
        new OfflineLayer({
          attribution: TILE_ATTRIB,
          maxZoom: 13,
          minZoom: 2,
          tileSize: 256,
          keepBuffer: 4,
          updateWhenIdle: false,
          updateWhenZooming: true,
        }).addTo(map)

        // When zoom ends, force full redraw (fixes half-tiles at world zoom)
        map.on('zoomend moveend', () => {
          invalidate()
          try { map.eachLayer((ly: any) => ly.redraw && ly.redraw()) } catch { /* */ }
        })

        setReady(true)
        ;[0, 100, 300, 600, 1200, 2000].forEach(ms => {
          timers.push(window.setTimeout(invalidate, ms))
        })

        ro = new ResizeObserver(() => {
          invalidate()
        })
        ro.observe(el)
        window.addEventListener('resize', invalidate)
      } catch (e) {
        console.error('PolarisMap', e)
      }
    })()

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
      ro?.disconnect()
      window.removeEventListener('resize', invalidate)
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Markers + routes
  useEffect(() => {
    const map = mapRef.current
    const L = window.L
    if (!map || !L || !ready) return

    if (layersRef.current) map.removeLayer(layersRef.current)
    const group = L.layerGroup()

    routes.forEach(r => {
      if (!r.path?.length) return
      L.polyline(r.path, {
        color: r.color || '#22d3ee',
        weight: r.weight ?? 2.5,
        opacity: 0.85,
        dashArray: r.dashed ? '8 6' : undefined,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(group)
    })

    pins.forEach(m => {
      const color =
        m.color ||
        (m.kind === 'emergency' ? '#ef4444'
          : m.kind === 'station' ? '#10b981'
          : m.kind === 'camp' ? '#f59e0b'
          : m.kind === 'vessel' ? '#38bdf8'
          : m.kind === 'port' ? '#a78bfa'
          : '#22d3ee')
      L.marker([m.lat, m.lng], { icon: markerIcon(L, color) })
        .bindPopup(
          `<div style="min-width:130px"><strong>${m.label}</strong>${
            m.sub ? `<br/><span style="opacity:.8;font-size:12px">${m.sub}</span>` : ''
          }<br/><span style="font-size:11px;opacity:.55;font-family:monospace">${m.lat.toFixed(3)}, ${m.lng.toFixed(3)}</span></div>`
        )
        .addTo(group)
    })

    group.addTo(map)
    layersRef.current = group
    map.invalidateSize({ pan: false })
  }, [pins, routes, ready])

  return (
    <div
      ref={wrapRef}
      className={className}
      style={{
        width: '100%',
        height: hPx,
        minHeight: hPx,
        background: '#0a1628',
        position: 'relative',
        zIndex: 0,
        overflow: 'hidden',
      }}
    />
  )
}
