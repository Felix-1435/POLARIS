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

const ESRI =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'

const DEFAULT_MARKERS: MapMarker[] = [
  { id: 'goa', lat: 15.4, lng: 73.8, label: 'Goa Port', kind: 'port', color: '#a78bfa' },
  { id: 'maitri', lat: -70.767, lng: 11.733, label: 'Maitri', kind: 'station', color: '#10b981' },
  { id: 'bharati', lat: -69.407, lng: 76.187, label: 'Bharati', kind: 'station', color: '#10b981' },
]

function loadL(): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject(new Error('ssr'))
    if (window.L) return resolve(window.L)
    if (!document.querySelector('link[data-leaflet="css"]')) {
      const l = document.createElement('link')
      l.rel = 'stylesheet'
      l.href = LEAFLET_CSS
      l.setAttribute('data-leaflet', 'css')
      document.head.appendChild(l)
    }
    const ex = document.querySelector('script[data-leaflet="js"]') as HTMLScriptElement | null
    if (ex) {
      const wait = () => (window.L ? resolve(window.L) : setTimeout(wait, 40))
      ex.addEventListener('load', () => resolve(window.L))
      wait()
      return
    }
    const s = document.createElement('script')
    s.src = LEAFLET_JS
    s.async = true
    s.setAttribute('data-leaflet', 'js')
    s.onload = () => resolve(window.L)
    s.onerror = () => reject(new Error('leaflet blocked'))
    document.head.appendChild(s)
  })
}

export default function PolarisMap({
  markers,
  routes = [],
  center = [-35, 45],
  zoom = 3,
  height = 400,
  className = '',
}: Props) {
  // Fresh DOM node every mount — critical for no crash after navigation
  const [host, setHost] = useState<HTMLDivElement | null>(null)
  const mapRef = useRef<any>(null)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const pins = markers?.length ? markers : DEFAULT_MARKERS
  const h = height || 360

  // Init map when host div is attached
  useEffect(() => {
    if (!host) return
    let cancelled = false
    let map: any = null
    let ro: ResizeObserver | null = null

    const run = async () => {
      try {
        const L = await loadL()
        if (cancelled || !host.isConnected) return

        // Destroy any leftover instance on this node
        if ((host as any)._leaflet_id) {
          try {
            const old = (host as any)._leaflet
            old?.remove?.()
          } catch { /* */ }
          host.innerHTML = ''
          delete (host as any)._leaflet_id
        }

        map = L.map(host, {
          center,
          zoom,
          minZoom: 2,
          maxZoom: 12,
          preferCanvas: true,
        })
        mapRef.current = map
        ;(host as any)._leaflet = map

        L.tileLayer(ESRI, { maxZoom: 12, attribution: 'Esri' }).addTo(map)

        const fix = () => {
          try {
            map.invalidateSize(true)
          } catch { /* */ }
        }
        requestAnimationFrame(fix)
        setTimeout(fix, 200)
        setTimeout(fix, 600)
        ro = new ResizeObserver(fix)
        ro.observe(host)
        window.addEventListener('resize', fix)

        if (!cancelled) setReady(true)
      } catch (e) {
        console.error(e)
        if (!cancelled) setFailed(true)
      }
    }
    run()

    return () => {
      cancelled = true
      ro?.disconnect()
      window.removeEventListener('resize', () => {})
      try {
        map?.off?.()
        map?.remove?.()
      } catch { /* */ }
      mapRef.current = null
      try {
        if (host) {
          host.innerHTML = ''
          delete (host as any)._leaflet_id
          delete (host as any)._leaflet
        }
      } catch { /* */ }
      setReady(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [host])

  // Markers / routes
  useEffect(() => {
    const map = mapRef.current
    const L = window.L
    if (!map || !L || !ready) return
    try {
      // remove previous overlay pane layers we added (keep tile layer)
      map.eachLayer((ly: any) => {
        if (ly instanceof L.Marker || ly instanceof L.Polyline || ly instanceof L.LayerGroup) {
          try {
            map.removeLayer(ly)
          } catch { /* */ }
        }
      })
      const group = L.layerGroup()
      ;(routes || []).forEach(r => {
        if (!r.path || r.path.length < 2) return
        L.polyline(r.path, {
          color: r.color || '#22d3ee',
          weight: r.weight ?? 2.5,
          opacity: 0.85,
          dashArray: r.dashed ? '8 6' : undefined,
        }).addTo(group)
      })
      pins.forEach(m => {
        if (m?.lat == null || m?.lng == null) return
        const color = m.color || '#22d3ee'
        const icon = L.divIcon({
          className: '',
          html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid #fff"></div>`,
          iconSize: [12, 12],
          iconAnchor: [6, 6],
        })
        L.marker([m.lat, m.lng], { icon })
          .bindPopup(`<b>${m.label || m.id}</b>${m.sub ? `<br/>${m.sub}` : ''}`)
          .addTo(group)
      })
      group.addTo(map)
      map.invalidateSize(true)
    } catch (e) {
      console.error(e)
    }
  }, [pins, routes, ready])

  if (failed) {
    return (
      <div
        className={className}
        style={{ height: h, background: '#0a1628', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}
      >
        Map could not load
      </div>
    )
  }

  return (
    <div className={className} style={{ width: '100%', height: h, minHeight: h, background: '#0a1628' }}>
      <div ref={setHost} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}
