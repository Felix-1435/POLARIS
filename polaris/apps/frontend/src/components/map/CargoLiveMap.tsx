import { useEffect, useState } from 'react'
import PolarisMap, { type MapMarker, type MapRoute } from './PolarisMap'
import {
  loadShipments,
  posOnRoute,
  routePathFor,
  statusColor,
  transportColor,
  type CargoShipment,
} from '@/lib/cargoShipments'

type Props = {
  items?: CargoShipment[]
  highlightId?: string
  compact?: boolean
}

export default function CargoLiveMap({ items, highlightId, compact }: Props) {
  const [list, setList] = useState<CargoShipment[]>(items || [])

  useEffect(() => {
    if (items) setList(items)
    else setList(loadShipments())
  }, [items])

  const base: MapMarker[] = [
    { id: 'goa', lat: 15.4, lng: 73.8, label: 'Goa Port (Sea)', kind: 'port', color: '#a78bfa' },
    { id: 'cpt', lat: -33.9, lng: 18.4, label: 'Cape Town (Air bridge)', kind: 'port', color: '#c084fc' },
    { id: 'maitri', lat: -70.767, lng: 11.733, label: 'Maitri Station', kind: 'station', color: '#10b981' },
    { id: 'bharati', lat: -69.407, lng: 76.187, label: 'Bharati Station', kind: 'station', color: '#10b981' },
    { id: 'camp-a', lat: -70.55, lng: 11.9, label: 'Field Camp A', kind: 'camp', color: '#f59e0b' },
    { id: 'camp-b', lat: -70.82, lng: 11.45, label: 'Field Camp B', kind: 'camp', color: '#f59e0b' },
  ]

  const active = list.filter(c => c.status !== 'Pending')

  const cargoMarkers: MapMarker[] = active.map(c => {
    const pos = posOnRoute(c.progress, c.destination, c.transport || 'Sea')
    return {
      id: c.id,
      lat: pos.lat,
      lng: pos.lng,
      label: `${c.id} · ${c.name}`,
      sub: `${c.transport || 'Sea'} · ${c.status} · ${c.progress}% → ${c.destination}`,
      kind: 'cargo',
      color: highlightId === c.id ? '#f472b6' : transportColor(c.transport || 'Sea'),
    }
  })

  const routes: MapRoute[] = []
  const seen = new Set<string>()
  for (const c of active) {
    const key = `${c.transport}-${c.destination}`
    if (seen.has(key)) continue
    seen.add(key)
    routes.push({
      id: `route-${key}`,
      path: routePathFor(c.destination, c.transport || 'Sea'),
      color: transportColor(c.transport || 'Sea'),
      dashed: true,
      weight: 2,
    })
  }
  for (const c of active.filter(x => x.status === 'In Transit' || x.status === 'Delayed')) {
    const full = routePathFor(c.destination, c.transport || 'Sea')
    const pos = posOnRoute(c.progress, c.destination, c.transport || 'Sea')
    const p = c.progress / 100
    const t = p * (full.length - 1)
    const i = Math.min(Math.floor(t), full.length - 2)
    const partial: [number, number][] = full.slice(0, i + 1).map(pt => [pt[0], pt[1]] as [number, number])
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
        center={[-30, 40]}
        zoom={3}
        height={h}
      />
    </div>
  )
}
