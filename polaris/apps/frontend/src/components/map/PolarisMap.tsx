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
const ESRI =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const OSM = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png'

const DEFAULT_MARKERS: MapMarker[] = [
  { id: 'goa', lat: 15.4, lng: 73.8, label: 'Goa / Mormugao Port', kind: 'port', color: '#a78bfa' },
  { id: 'ship', lat: -55.0, lng: 40.0, label: 'MV Sagar Kanya', kind: 'vessel', color: '#38bdf8' },
  { id: 'maitri', lat: -70.767, lng: 11.733, label: 'Maitri Research Station', kind: 'station', color: '#10b981' },
  { id: 'bharati', lat: -69.407, lng: 76.187, label: 'Bharati Research Station', kind: 'station', color: '#10b981' },
  { id: 'camp-a', lat: -70.55, lng: 11.9, label: 'Field Camp A', kind: 'camp', color: '#f59e0b' },
  { id: 'camp-b', lat: -70.82, lng: 11.45, label: 'Field Camp B', kind: 'camp', color: '#ef4444' },
]

function ensureLeaflet(): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      if (typeof window === 'undefined') return reject(new Error('SSR'))
      if (window.L) return resolve(window.L)

      if (!document.querySelector('link[data-leaflet="css"]')) {
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = LEAFLET_CSS
        link.setAttribute('data-leaflet', 'css')
        document.head.appendChild(link)
      }
      if (!document.getElementById('polaris-leaflet-fix')) {
        const st = document.createElement('style')
        st.id = 'polaris-leaflet-fix'
        st.textContent =
          '.leaflet-container{background:#0a1628;width:100%;height:100%}.leaflet-tile{max-width:none!important;max-height:none!important}'
        document.head.appendChild(st)
      }

      const existing = document.querySelector('script[data-leaflet="js"]') as HTMLScriptElement | null
      if (existing) {
        const poll = () => {
          if (window.L) resolve(window.L)
          else setTimeout(poll, 30)
        }
        existing.addEventListener('load', () => resolve(window.L))
        poll()
        return
      }

      const script = document.createElement('script')
      script.src = LEAFLET_JS
      script.async = true
      script.setAttribute('data-leaflet', 'js')
      script.onload = () => resolve(window.L)
      script.onerror = () => reject(new Error('Leaflet CDN blocked'))
      document.head.appendChild(script)
    } catch (e) {
      reject(e)
    }
  })
}

function pinIcon(L: any, color: string) {
  return L.divIcon({
    className: '',
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
  const boxRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const layerRef = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  const pins = markers && markers.length > 0 ? markers : DEFAULT_MARKERS
  const h = height || 400

  useEffect(() => {
    let dead = false
    let map: any = null
    const timers: number[] = []
    const onResize = () => {
      try {
        mapRef.current?.invalidateSize?.(true)
      } catch { /* */ }
    }

    ;(async () => {
      try {
        const L = await ensureLeaflet()
        if (dead || !boxRef.current) return

        const el = boxRef.current
        // Avoid "Map container is already initialized"
        if ((el as any)._leaflet_id) {
          el.innerHTML = ''
          delete (el as any)._leaflet_id
        }

        map = L.map(el, {
          center,
          zoom,
          minZoom: 2,
          maxZoom: 12,
          zoomControl: true,
        })
        mapRef.current = map

        L.tileLayer(ESRI, {
          attribution: 'Tiles &copy; Esri',
          maxZoom: 12,
          errorTileUrl:
            'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
        }).addTo(map)

        // Silent OSM fallback if many tile errors
        let errors = 0
        map.on('tileerror', () => {
          errors++
          if (errors === 8) {
            try {
              L.tileLayer(OSM, { maxZoom: 12 }).addTo(map)
            } catch { /* */ }
          }
        })

        ;[100, 400, 1000].forEach(ms => {
          timers.push(window.setTimeout(onResize, ms) as unknown as number)
        })
        window.addEventListener('resize', onResize)

        if (!dead) setReady(true)
      } catch (e: any) {
        console.error(e)
        if (!dead) setErr(e?.message || 'Map failed')
      }
    })()

    return () => {
      dead = true
      timers.forEach(clearTimeout)
      window.removeEventListener('resize', onResize)
      try {
        mapRef.current?.remove?.()
      } catch { /* */ }
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const map = mapRef.current
    const L = typeof window !== 'undefined' ? window.L : null
    if (!map || !L || !ready) return

    try {
      if (layerRef.current) {
        map.removeLayer(layerRef.current)
        layerRef.current = null
      }
      const group = L.layerGroup()

      ;(routes || []).forEach(r => {
        if (!r?.path || r.path.length < 2) return
        try {
          L.polyline(r.path, {
            color: r.color || '#22d3ee',
            weight: r.weight ?? 2.5,
            opacity: 0.85,
            dashArray: r.dashed ? '8 6' : undefined,
          }).addTo(group)
        } catch { /* */ }
      })

      pins.forEach(m => {
        if (m == null || Number.isNaN(m.lat) || Number.isNaN(m.lng)) return
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
        try {
          L.marker([m.lat, m.lng], { icon: pinIcon(L, color) })
            .bindPopup(
              `<strong>${m.label || m.id}</strong>${
                m.sub ? `<br/>${m.sub}` : ''
              }`
            )
            .addTo(group)
        } catch { /* */ }
      })

      group.addTo(map)
      layerRef.current = group
      map.invalidateSize?.(true)
    } catch (e) {
      console.error('overlay', e)
    }
  }, [pins, routes, ready])

  if (err) {
    return (
      <div
        className={className}
        style={{
          width: '100%',
          height: h,
          minHeight: h,
          background: '#0a1628',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          textAlign: 'center',
          padding: 12,
        }}
      >
        Map unavailable ({err})
      </div>
    )
  }

  return (
    <div className={className} style={{ width: '100%', height: h, minHeight: h, background: '#0a1628', position: 'relative' }}>
      <div ref={boxRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
