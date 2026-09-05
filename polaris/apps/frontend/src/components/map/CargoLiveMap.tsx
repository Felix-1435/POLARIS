import PolarisMap, { type MapMarker } from './PolarisMap'

export type CargoMapItem = {
  id: string
  name: string
  status: string
  progress: number
  destination: string
}

type Props = {
  items?: CargoMapItem[]
  highlightId?: string
  compact?: boolean
}

function posOnRoute(progress: number, dest: string): { lat: number; lng: number } {
  const p = Math.max(0, Math.min(100, progress)) / 100
  const goa = { lat: 15.4, lng: 73.8 }
  const mid = { lat: -25, lng: 55 }
  const approach = { lat: -55, lng: 40 }
  const station = dest.toLowerCase().includes('bharati')
    ? { lat: -69.407, lng: 76.187 }
    : dest.toLowerCase().includes('field')
      ? { lat: -70.82, lng: 11.45 }
      : { lat: -70.767, lng: 11.733 }
  const segs = [goa, mid, approach, station]
  const t = p * (segs.length - 1)
  const i = Math.min(Math.floor(t), segs.length - 2)
  const f = t - i
  return {
    lat: segs[i].lat + (segs[i + 1].lat - segs[i].lat) * f,
    lng: segs[i].lng + (segs[i + 1].lng - segs[i].lng) * f,
  }
}

const DEFAULT: CargoMapItem[] = [
  { id: 'ANT-001', name: 'SatCom Equipment', status: 'In Transit', progress: 45, destination: 'Maitri' },
  { id: 'ANT-002', name: 'Diesel Fuel', status: 'In Transit', progress: 30, destination: 'Maitri' },
  { id: 'ANT-015', name: 'Aviation Fuel', status: 'Delayed', progress: 20, destination: 'Maitri' },
  { id: 'ANT-045', name: 'Weather Sensors', status: 'In Transit', progress: 70, destination: 'Field Camp A' },
]

export default function CargoLiveMap({ items = DEFAULT, highlightId, compact }: Props) {
  const base: MapMarker[] = [
    { id: 'goa', lat: 15.4, lng: 73.8, label: 'Goa Warehouse / Port', kind: 'port', color: '#a78bfa' },
    { id: 'maitri', lat: -70.767, lng: 11.733, label: 'Maitri Station', kind: 'station', color: '#10b981' },
    { id: 'bharati', lat: -69.407, lng: 76.187, label: 'Bharati Station', kind: 'station', color: '#10b981' },
  ]

  const cargoMarkers: MapMarker[] = items.map(c => {
    const pos = posOnRoute(c.progress, c.destination)
    const isHi = highlightId === c.id
    return {
      id: c.id,
      lat: pos.lat,
      lng: pos.lng,
      label: `${c.id} · ${c.name}`,
      sub: `${c.status} · ${c.progress}% → ${c.destination}`,
      kind: 'cargo' as const,
      color: c.status === 'Delayed' ? '#f59e0b' : isHi ? '#f472b6' : '#22d3ee',
    }
  })

  const h = compact ? 280 : 400
  return (
    <div className={`w-full ${compact ? 'h-[280px]' : 'h-[360px] md:h-[400px]'}`}>
      <PolarisMap
        markers={[...base, ...cargoMarkers]}
        center={[-25, 50]}
        zoom={3}
        height={h}
        className="w-full h-full"
      />
    </div>
  )
}
