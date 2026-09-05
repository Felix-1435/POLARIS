/** Cargo list + offline updates + weather alternate routes */

export type CargoShipment = {
  id: string
  name: string
  destination: string
  status: 'In Transit' | 'Delayed' | 'Delivered' | 'Pending'
  progress: number
  routeId?: 'primary' | 'alternate'
  weatherHold?: boolean
  updatedAt?: string
  pendingSync?: boolean
}

export const CARGO_SHIPMENTS: CargoShipment[] = [
  { id: 'ANT-001', name: 'Satellite Equipment', destination: 'Maitri', status: 'In Transit', progress: 80, routeId: 'primary' },
  { id: 'ANT-002', name: 'Diesel Fuel (20kL)', destination: 'Maitri', status: 'Delayed', progress: 45, routeId: 'primary', weatherHold: true },
  { id: 'ANT-003', name: 'Food Rations', destination: 'Bharati', status: 'Delivered', progress: 100, routeId: 'primary' },
  { id: 'ANT-004', name: 'Medical Kits', destination: 'Field Camp B', status: 'Pending', progress: 10, routeId: 'primary' },
  { id: 'ANT-015', name: 'Aviation Fuel', destination: 'Maitri', status: 'Delayed', progress: 35, routeId: 'alternate', weatherHold: true },
  { id: 'ANT-045', name: 'Weather Sensors', destination: 'Field Camp A', status: 'In Transit', progress: 70, routeId: 'primary' },
]

const STORE_KEY = 'polaris_cargo_offline_v1'
const QUEUE_KEY = 'polaris_cargo_sync_queue_v1'

export function loadShipments(): CargoShipment[] {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as CargoShipment[]
      if (Array.isArray(parsed) && parsed.length) return parsed
    }
  } catch { /* */ }
  return CARGO_SHIPMENTS.map(c => ({ ...c }))
}

export function saveShipments(list: CargoShipment[]) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(list))
  } catch { /* */ }
}

export function updateShipmentOffline(id: string, patch: Partial<CargoShipment>): CargoShipment[] {
  const list = loadShipments()
  const i = list.findIndex(x => x.id === id)
  if (i < 0) return list
  const next = {
    ...list[i],
    ...patch,
    updatedAt: new Date().toISOString(),
    pendingSync: !navigator.onLine,
  }
  list[i] = next
  saveShipments(list)
  if (!navigator.onLine) {
    enqueueSync({ type: 'update', id, patch: next, at: next.updatedAt })
  }
  return list
}

type QueueItem = { type: string; id: string; patch: CargoShipment; at?: string }

function enqueueSync(item: QueueItem) {
  try {
    const q: QueueItem[] = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
    q.push(item)
    localStorage.setItem(QUEUE_KEY, JSON.stringify(q))
  } catch { /* */ }
}

export function getPendingSyncCount(): number {
  try {
    return (JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]') as any[]).length
  } catch {
    return 0
  }
}

/** When network returns, flush queue to API if available */
export async function syncCargoQueue(apiUrl: string): Promise<number> {
  if (!navigator.onLine || !apiUrl) return 0
  let q: QueueItem[] = []
  try {
    q = JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]')
  } catch {
    return 0
  }
  if (!q.length) return 0
  let ok = 0
  const remain: QueueItem[] = []
  for (const item of q) {
    try {
      const res = await fetch(`${apiUrl}/api/cargo/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.patch),
      })
      if (res.ok) ok++
      else remain.push(item)
    } catch {
      remain.push(item)
    }
  }
  localStorage.setItem(QUEUE_KEY, JSON.stringify(remain))
  // clear pendingSync flags for synced
  const list = loadShipments().map(c => {
    const still = remain.some(r => r.id === c.id)
    return still ? c : { ...c, pendingSync: false }
  })
  saveShipments(list)
  return ok
}

export const DEST_COORDS: Record<string, { lat: number; lng: number }> = {
  Maitri: { lat: -70.767, lng: 11.733 },
  Bharati: { lat: -69.407, lng: 76.187 },
  'Field Camp A': { lat: -70.55, lng: 11.9 },
  'Field Camp B': { lat: -70.82, lng: 11.45 },
}

export function routePathFor(dest: string): [number, number][] {
  const end = DEST_COORDS[dest] || DEST_COORDS.Maitri
  return [
    [15.4, 73.8],
    [-25, 55],
    [-55, 40],
    [end.lat, end.lng],
  ]
}

/** Alternate sealift when primary corridor has bad weather (more westerly) */
export function alternateRoutePathFor(dest: string): [number, number][] {
  const end = DEST_COORDS[dest] || DEST_COORDS.Maitri
  return [
    [15.4, 73.8],   // Goa
    [-20, 35],      // western Indian Ocean
    [-45, 20],      // Cape approach
    [-60, 15],      // polar approach west
    [end.lat, end.lng],
  ]
}

export function posOnRoute(progress: number, dest: string, alternate = false): { lat: number; lng: number } {
  const path = alternate ? alternateRoutePathFor(dest) : routePathFor(dest)
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

/** AI-style weather advisory for polar sealift */
export type WeatherAdvisory = {
  severity: 'moderate' | 'severe' | 'critical'
  area: string
  condition: string
  recommendation: string
  affectedIds: string[]
}

export function getWeatherAdvisories(list: CargoShipment[]): WeatherAdvisory[] {
  const delayed = list.filter(c => c.status === 'Delayed' || c.weatherHold)
  if (!delayed.length) {
    return [
      {
        severity: 'moderate',
        area: 'Southern Ocean · 50–60°S',
        condition: 'Moderate swell, visibility fair',
        recommendation: 'Primary India→Antarctica corridor remains open. Monitor 48h forecast.',
        affectedIds: [],
      },
    ]
  }
  return [
    {
      severity: 'severe',
      area: 'Southern Ocean primary corridor · ~55°S 40°E',
      condition: 'Force 8 gale · icing risk · wave height 6–8 m',
      recommendation:
        'AI plan: divert delayed cargo to ALTERNATE western route (Cape approach). Hold non-critical loads 24–48h if possible.',
      affectedIds: delayed.map(d => d.id),
    },
  ]
}

export function applyAlternateRoute(id: string): CargoShipment[] {
  return updateShipmentOffline(id, {
    routeId: 'alternate',
    weatherHold: false,
    status: 'In Transit',
  })
}
