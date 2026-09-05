/** Single source of truth for cargo list + map positions */

export type CargoShipment = {
  id: string
  name: string
  destination: string
  status: 'In Transit' | 'Delayed' | 'Delivered' | 'Pending'
  progress: number // 0–100 along India → Antarctica route
}

export const CARGO_SHIPMENTS: CargoShipment[] = [
  { id: 'ANT-001', name: 'Satellite Equipment', destination: 'Maitri', status: 'In Transit', progress: 80 },
  { id: 'ANT-002', name: 'Diesel Fuel (20kL)', destination: 'Maitri', status: 'Delayed', progress: 45 },
  { id: 'ANT-003', name: 'Food Rations', destination: 'Bharati', status: 'Delivered', progress: 100 },
  { id: 'ANT-004', name: 'Medical Kits', destination: 'Field Camp B', status: 'Pending', progress: 10 },
  { id: 'ANT-015', name: 'Aviation Fuel', destination: 'Maitri', status: 'Delayed', progress: 35 },
  { id: 'ANT-045', name: 'Weather Sensors', destination: 'Field Camp A', status: 'In Transit', progress: 70 },
]

export const DEST_COORDS: Record<string, { lat: number; lng: number }> = {
  Maitri: { lat: -70.767, lng: 11.733 },
  Bharati: { lat: -69.407, lng: 76.187 },
  'Field Camp A': { lat: -70.55, lng: 11.9 },
  'Field Camp B': { lat: -70.82, lng: 11.45 },
}

export const ROUTE_WAYPOINTS = {
  goa: { lat: 15.4, lng: 73.8 },
  midOcean: { lat: -25, lng: 55 },
  southOcean: { lat: -55, lng: 40 },
}

/** Build path Goa → ocean → destination */
export function routePathFor(dest: string): [number, number][] {
  const end = DEST_COORDS[dest] || DEST_COORDS.Maitri
  return [
    [ROUTE_WAYPOINTS.goa.lat, ROUTE_WAYPOINTS.goa.lng],
    [ROUTE_WAYPOINTS.midOcean.lat, ROUTE_WAYPOINTS.midOcean.lng],
    [ROUTE_WAYPOINTS.southOcean.lat, ROUTE_WAYPOINTS.southOcean.lng],
    [end.lat, end.lng],
  ]
}

/** Position along route by progress 0–100 */
export function posOnRoute(progress: number, dest: string): { lat: number; lng: number } {
  const path = routePathFor(dest)
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
