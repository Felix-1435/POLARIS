import PolarisMap, { type MapMarker, type MapRoute } from './PolarisMap'
import MapErrorBoundary from './MapErrorBoundary'
import {
  CARGO_SHIPMENTS,
  loadShipments,
  posOnRoute,
  routePathFor,
  alternateRoutePathFor,
  statusColor,
  type CargoShipment,
} from '@/lib/cargoShipments'
import { useEffect, useState } from 'react'

type Props = {
  items?: CargoShipment[]
  highlightId?: string
  compact?: boolean
}

export default function CargoLiveMap({ items, highlightId, compact }: Props) {
  const [list, setList] = useState<CargoShipment[]>(items || CARGO_SHIPMENTS)
  const h = compact ? 300 : 400

  useEffect(() => {
    if (items) setList(items)
    else {
      try {
        setList(loadShipments())
      } catch {
        setList(CARGO_SHIPMENTS)
      }
    }
  }, [items])

  let markers: MapMarker[] = []
  let routes: MapRoute[] = []
  try {
    const base: MapMarker[] = [
      { id: 'goa', lat: 15.4, lng: 73.8, label: 'Goa Port', kind: 'port', color: '#a78bfa' },
      { id: 'maitri', lat: -70.767, lng: 11.733, label: 'Maitri', kind: 'station', color: '#10b981' },
      { id: 'bharati', lat: -69.407, lng: 76.187, label: 'Bharati', kind: 'station', color: '#10b981' },
    ]
    const active = list.filter(c => c && c.status !== 'Pending')
    markers = [
      ...base,
      ...active.map(c => {
        const alt = c.routeId === 'alternate'
        const pos = posOnRoute(c.progress, c.destination, alt)
        return {
          id: c.id,
          lat: pos.lat,
          lng: pos.lng,
          label: `${c.id} · ${c.name}`,
          sub: `${c.status} · ${c.progress}%${alt ? ' · Alt route' : ''}`,
          kind: 'cargo' as const,
          color: highlightId === c.id ? '#f472b6' : statusColor(c.status),
        }
      }),
    ]
    const seen = new Set<string>()
    for (const c of active) {
      const alt = c.routeId === 'alternate'
      const key = `${alt ? 'a' : 'p'}-${c.destination}`
      if (seen.has(key)) continue
      seen.add(key)
      routes.push({
        id: key,
        path: alt ? alternateRoutePathFor(c.destination) : routePathFor(c.destination),
        color: alt ? '#a78bfa' : '#22d3ee',
        dashed: true,
        weight: 2,
      })
    }
  } catch {
    markers = []
    routes = []
  }

  return (
    <MapErrorBoundary height={h}>
      <div style={{ width: '100%', height: h }}>
        <PolarisMap markers={markers} routes={routes} center={[-30, 45]} zoom={3} height={h} />
      </div>
    </MapErrorBoundary>
  )
}
