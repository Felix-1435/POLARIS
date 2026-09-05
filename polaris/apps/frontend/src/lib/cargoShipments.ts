/** Single source of truth for cargo list + map positions + transport mode */

export type TransportMode = 'Sea' | 'Air'

export type CargoShipment = {
  id: string
  name: string
  destination: string
  status: 'In Transit' | 'Delayed' | 'Delivered' | 'Pending'
  progress: number // 0–100 along route
  transport: TransportMode
  vesselOrFlight?: string // e.g. MV Sagar Kanya / IL-76 flight
}

export const CARGO_SHIPMENTS: CargoShipment[] = [
  { id: 'ANT-001', name: 'Satellite Equipment', destination: 'Maitri', status: 'In Transit', progress: 80, transport: 'Sea', vesselOrFlight: 'MV Sagar Kanya' },
  { id: 'ANT-002', name: 'Diesel Fuel (20kL)', destination: 'Maitri', status: 'Delayed', progress: 45, transport: 'Sea', vesselOrFlight: 'MV Sagar Kanya' },
  { id: 'ANT-003', name: 'Food Rations', destination: 'Bharati', status: 'Delivered', progress: 100, transport: 'Sea', vesselOrFlight: 'MV Sagar Kanya' },
  { id: 'ANT-004', name: 'Medical Kits', destination: 'Field Camp B', status: 'Pending', progress: 10, transport: 'Air', vesselOrFlight: 'IL-76 · Cape Town hop' },
  { id: 'ANT-015', name: 'Aviation Fuel', destination: 'Maitri', status: 'Delayed', progress: 35, transport: 'Sea', vesselOrFlight: 'MV Sagar Kanya' },
  { id: 'ANT-045', name: 'Weather Sensors', destination: 'Field Camp A', status: 'In Transit', progress: 70, transport: 'Air', vesselOrFlight: 'Basler BT-67' },
]

const STORAGE_KEY = 'polaris_cargo_shipments_v1'

export function loadShipments(): CargoShipment[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as CargoShipment[]
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch { /* */ }
  return [...CARGO_SHIPMENTS]
}

export function saveShipments(list: CargoShipment[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
  } catch { /* */ }
}

export function upsertShipment(item: CargoShipment) {
  const list = loadShipments()
  const i = list.findIndex(x => x.id === item.id)
  if (i >= 0) list[i] = item
  else list.unshift(item)
  saveShipments(list)
  return list
}

export function setTransport(id: string, transport: TransportMode, vesselOrFlight?: string) {
  const list = loadShipments()
  const i = list.findIndex(x => x.id === id)
  if (i < 0) return list
  list[i] = {
    ...list[i],
    transport,
    vesselOrFlight: vesselOrFlight ?? (transport === 'Air' ? 'Air lift' : 'Sealift'),
  }
  saveShipments(list)
  return list
}

export const DEST_COORDS: Record<string, { lat: number; lng: number }> = {
  Maitri: { lat: -70.767, lng: 11.733 },
  Bharati: { lat: -69.407, lng: 76.187 },
  'Field Camp A': { lat: -70.55, lng: 11.9 },
  'Field Camp B': { lat: -70.82, lng: 11.45 },
}

/** Sea: Goa port → ocean → station */
export function seaRouteFor(dest: string): [number, number][] {
  const end = DEST_COORDS[dest] || DEST_COORDS.Maitri
  return [
    [15.4, 73.8],   // Goa
    [-25, 55],      // mid ocean
    [-55, 40],      // south ocean
    [end.lat, end.lng],
  ]
}

/** Air: typically Cape Town / Pune staging → polar airstrip */
export function airRouteFor(dest: string): [number, number][] {
  const end = DEST_COORDS[dest] || DEST_COORDS.Maitri
  return [
    [18.5, 73.8],   // Pune / air staging near India
    [-5, 40],       // equatorial hop
    [-33.9, 18.4],  // Cape Town common Antarctic air bridge
    [-70.0, 12.0],  // polar approach
    [end.lat, end.lng],
  ]
}

export function routePathFor(dest: string, transport: TransportMode = 'Sea'): [number, number][] {
  return transport === 'Air' ? airRouteFor(dest) : seaRouteFor(dest)
}

export function posOnRoute(progress: number, dest: string, transport: TransportMode = 'Sea'): { lat: number; lng: number } {
  const path = routePathFor(dest, transport)
  const p = Math.max(0, Math.min(100, progress)) / 100
  const t = p * (path.length - 1)
  const i = Math.min(Math.floor(t), path.length - 2)
  const f = t - i
  return {
    lat: path[i][0] + (path[i + 1][0] - path[i][0]) * f,
    lng: path[i][1] + (path[i + 1][1] - path[i][1]) * f,
  }
}

export function statusColor(status: string): string {
  if (status === 'Delivered') return '#10b981'
  if (status === 'Delayed') return '#f59e0b'
  if (status === 'Pending') return '#64748b'
  return '#22d3ee'
}

export function transportColor(t: TransportMode): string {
  return t === 'Air' ? '#a78bfa' : '#38bdf8'
}

export function transportLabel(t: TransportMode): string {
  return t === 'Air' ? 'Air transport' : 'Sea transport'
}
