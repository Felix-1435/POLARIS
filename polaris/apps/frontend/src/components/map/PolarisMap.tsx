import { useEffect, useRef, useState } from 'react'

declare global {
  interface Window {
    L: any
  }
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
  height?: number
  className?: string
}

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'

/** Esri World Imagery — realistic satellite, no API key */
const ESRI_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
/** OSM fallback */
const OSM_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

const DEFAULT_MARKERS: MapMarker[] = [
  { id: 'goa', lat: 15.4, lng: 73.8, label: 'Goa / Mormugao Port', kind: 'port', color: '#a78bfa' },
  { id: 'ship', lat: -55.0, lng: 40.0, label: 'MV Sagar Kanya', sub: 'In transit', kind: 'vessel', color: '#38bdf8' },
  { id: 'maitri', lat: -70.767, lng: 11.733, label: 'Maitri Research Station', kind: 'station', color: '#10b981' },
  { id: 'bharati', lat: -69.407, lng: 76.187, label: 'Bharati Research Station', kind: 'station', color: '#10b981' },
  { id: 'camp-a', lat: -70.55, lng: 11.9, label: 'Field Camp A', kind: 'camp', color: '#f59e0b' },
  { id: 'camp-b', lat: -70.82, lng: 11.45, label: 'Field Camp B', kind: 'camp', color: '#ef4444' },
]

function loadLeaflet(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('no window'))
    if (window.L) return resolve(window.L)

    if (!document.querySelector(`link[data-leaflet="1"]`)) {
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = LEAFLET_CSS
      link.setAttribute('data-leaflet', '1')
      document.head.appendChild(link)
    }
    if (!document.getElementById('polaris-leaflet-css-fix')) {
      const st = document.createElement('style')
      st.id = 'polaris-leaflet-css-fix'
      st.textContent = `
        .leaflet-container { background:#0a1628; width:100%; height:100%; }
        .leaflet-tile { max-width:none !important; max-height:none !important; }
      `
      document.head.appendChild(st)
    }

    const existing = document.querySelector('script[data-leaflet="1"]') as HTMLScriptElement | null
    if (existing) {
      const wait = () => (window.L ? resolve(window.L) : setTimeout(wait, 40))
      existing.addEventListener('load', () => resolve(window.L))
      wait()
      return
    }
    const script = document.createElement('script')
    script.src = LEAFLET_JS
    script.async = true
    script.setAttribute('data-leaflet', '1')
    script.onload = () => resolve(window.L)
    script.onerror = () => reject(new Error('Failed to load Leaflet from CDN'))
    document.head.appendChild(script)
  })
}

function pinIcon(L: any, color: string) {
  return L.divIcon({
    className: 'polaris-pin',
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 0 8px ${color}"></div>`,
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
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const overlayRef = useRef<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  const pins = markers && markers.length > 0 ? markers : DEFAULT_MARKERS

  // Init map once
  useEffect(() => {
    let cancelled = false
    let map: any = null
    let ro: ResizeObserver | null = null

    const run = async () => {
      try {
        const L = await loadLeaflet()
        if (cancelled || !containerRef.current) return

        // Clear any leftover leaflet id on remount
        const el = containerRef.current
        if ((el as any)._leaflet_id) {
          try {
            const old = (window.L as any).map?.(el)
            old?.remove?.()
          } catch { /* */ }
          delete (el as any)._leaflet_id
          el.innerHTML = ''
        }

        map = L.map(el, {
          center,
          zoom,
          minZoom: 2,
          maxZoom: 12,
          zoomControl: true,
          attributionControl: true,
        })
        mapRef.current = map

        // Standard layers — most reliable
        const esri = L.tileLayer(ESRI_URL, {
          attribution: 'Tiles &copy; Esri',
          maxZoom: 12,
          maxNativeZoom: 12,
          errorTileUrl:
            'data:image/svg+xml,' +
            encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect fill="#0a1628" width="256" height="256"/></svg>'),
        })
        const osm = L.tileLayer(OSM_URL, {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 12,
          maxNativeZoom: 19,
        })

        esri.addTo(map)
        // If Esri fails repeatedly, user can still pan; OSM as alternate base
        esri.on('tileerror', () => {
          if (!map.hasLayer(osm)) {
            try {
              map.removeLayer(esri)
              osm.addTo(map)
            } catch { /* */ }
          }
        })

        const fixSize = () => {
          try {
            map.invalidateSize(true)
          } catch { /* */ }
        }
        ;[50, 200, 500, 1000, 2000].forEach(t => setTimeout(fixSize, t))
        ro = new ResizeObserver(fixSize)
        ro.observe(el)
        window.addEventListener('resize', fixSize)
        map.on('zoomend moveend', fixSize)

        if (!cancelled) setReady(true)
      } catch (e: any) {
        console.error(e)
        if (!cancelled) setError(e?.message || 'Map failed to load')
      }
    }

    run()

    return () => {
      cancelled = true
      ro?.disconnect()
      try {
        mapRef.current?.remove()
      } catch { /* */ }
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Markers & routes when ready or data changes
  useEffect(() => {
    const map = mapRef.current
    const L = window.L
    if (!map || !L || !ready) return

    if (overlayRef.current) {
      try {
        map.removeLayer(overlayRef.current)
      } catch { /* */ }
    }
    const group = L.layerGroup()

    ;(routes || []).forEach(r => {
      if (!r.path || r.path.length < 2) return
      L.polyline(r.path, {
        color: r.color || '#22d3ee',
        weight: r.weight ?? 2.5,
        opacity: 0.9,
        dashArray: r.dashed ? '8 6' : undefined,
      }).addTo(group)
    })

    pins.forEach(m => {
      if (m.lat == null || m.lng == null || Number.isNaN(m.lat) || Number.isNaN(m.lng)) return
      const color =
        m.color ||
        ({
          emergency: '#ef4444',
          station: '#10b981',
          camp: '#f59e0b',
          vessel: '#38bdf8',
          port: '#a78bfa',
          cargo: '#22d3ee',
        } as Record<string, string>)[m.kind || ''] ||
        '#22d3ee'
      L.marker([m.lat, m.lng], { icon: pinIcon(L, color) })
        .bindPopup(
          `<strong>${m.label}</strong>${m.sub ? `<br/><span style="opacity:.8">${m.sub}</span>` : ''}<br/><span style="font-size:11px;opacity:.5">${m.lat.toFixed(3)}, ${m.lng.toFixed(3)}</span>`
        )
        .addTo(group)
    })

    group.addTo(map)
    overlayRef.current = group
    try {
      map.invalidateSize(true)
    } catch { /* */ }
  }, [pins, routes, ready])

  return (
    <div className={className} style={{ width: '100%', height, minHeight: height, position: 'relative', background: '#0a1628' }}>
      {error && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            color: '#94a3b8',
            fontSize: 13,
            textAlign: 'center',
            background: '#0a1628',
          }}
        >
          Map could not load: {error}. Check network / ad-blocker blocking unpkg.com or Esri tiles.
        </div>
      )}
      <div ref={containerRef} style={{ width: '100%', height: '100%', minHeight: height }} />
    </div>
  )
}
