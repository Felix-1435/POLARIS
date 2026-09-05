import PolarisMap, { type MapMarker, type MapRoute } from './PolarisMap'
import {
  CARGO_SHIPMENTS,
  posOnRoute,
  routePathFor,
  statusColor,
  type CargoShipment,
} from '@/lib/cargoShipments'

type Props = {
  items?: CargoShipment[]
  highlightId?: string
  compact?: boolean
}

export default function CargoLiveMap({
  items = CARGO_SHIPMENTS,
  highlightId,
  compact,
}: Props) {
  const base: MapMarker[] = [
    { id: 'goa', lat: 15.4, lng: 73.8, label: 'Goa Warehouse / Port', kind: 'port', color: '#a78bfa' },
    { id: 'maitri', lat: -70.767, lng: 11.733, label: 'Maitri Station', kind: 'station', color: '#10b981' },
    { id: 'bharati', lat: -69.407, lng: 76.187, label: 'Bharati Station', kind: 'station', color: '#10b981' },
    { id: 'camp-a', lat: -70.55, lng: 11.9, label: 'Field Camp A', kind: 'camp', color: '#f59e0b' },
    { id: 'camp-b', lat: -70.82, lng: 11.45, label: 'Field Camp B', kind: 'camp', color: '#f59e0b' },
  ]

  const active = items.filter(c => c.status !== 'Pending')

  const cargoMarkers: MapMarker[] = active.map(c => {
    const pos = posOnRoute(c.progress, c.destination)
    const isHi = highlightId === c.id
    return {
      id: c.id,
      lat: pos.lat,
      lng: pos.lng,
      label: `${c.id} · ${c.name}`,
      sub: `${c.status} · ${c.progress}% → ${c.destination}`,
      kind: 'cargo' as const,
      color: isHi ? '#f472b6' : statusColor(c.status),
    }
  })

  // One path per unique destination in active shipments (dashed = in progress)
  const seen = new Set<string>()
  const routes: MapRoute[] = []
  for (const c of active) {
    const key = c.destination
    if (seen.has(key)) continue
    seen.add(key)
    routes.push({
      id: `route-${key}`,
      path: routePathFor(c.destination),
      color: c.destination.includes('Bharati') ? '#38bdf8' : '#22d3ee',
      dashed: true,
      weight: 2.5,
    })
  }
  // Progress segment (solid) from Goa to current position for highlighted / each in-transit
  for (const c of active.filter(x => x.status === 'In Transit' || x.status === 'Delayed')) {
    const full = routePathFor(c.destination)
    const pos = posOnRoute(c.progress, c.destination)
    // path: waypoints until progress, then current pos
    const p = c.progress / 100
    const t = p * (full.length - 1)
    const i = Math.min(Math.floor(t), full.length - 2)
    const partial: [number, number][] = full.slice(0, i + 1)
    partial.push([pos.lat, pos.lng])
    routes.push({
      id: `prog-${c.id}`,
      path: partial,
      color: statusColor(c.status),
      dashed: false,
      weight: 3,
    })
  }

  const h = compact ? 300 : 420
  return (
    <div style={{ width: '100%', height: h, minHeight: h }}>
      <PolarisMap
        markers={[...base, ...cargoMarkers]}
        routes={routes}
        center={[-30, 50]}
        zoom={3}
        height={h}
      />
    </div>
  )
}
