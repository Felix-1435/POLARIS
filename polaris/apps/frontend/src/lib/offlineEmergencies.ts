/**
 * Offline-first emergency queue (localStorage).
 * Works without network; auto-syncs when connectivity returns.
 */
export type EmergencyRecord = {
  id: string
  person_id: string
  person_name?: string
  type: string
  severity: string
  location: string
  lat?: number | null
  lng?: number | null
  description?: string
  status: 'active' | 'resolved' | 'pending_sync'
  sync_status: 'synced' | 'pending' | 'failed'
  created_at: string
  source: 'local' | 'server'
}

const KEY = 'polaris_emergency_queue_v1'
const INFO_KEY = 'polaris_emergency_info_v1'

export const STATIONS = [
  { id: 'maitri', name: 'Maitri Research Station', lat: -70.767, lng: 11.733, type: 'station' },
  { id: 'bharati', name: 'Bharati Research Station', lat: -69.407, lng: 76.187, type: 'station' },
  { id: 'camp-a', name: 'Field Camp A', lat: -70.55, lng: 11.9, type: 'camp' },
  { id: 'camp-b', name: 'Field Camp B', lat: -70.82, lng: 11.45, type: 'camp' },
  { id: 'ship', name: 'MV Sagar Kanya', lat: -60.0, lng: 40.0, type: 'ship' },
]

export const EMERGENCY_TYPES = ['Medical', 'Fire', 'Missing Person', 'Equipment Failure', 'Weather', 'Other'] as const
export const SEVERITIES = ['Critical', 'High', 'Medium', 'Low'] as const

export const OFFLINE_PROCEDURES = [
  {
    id: 'medical',
    title: 'Medical Emergency',
    steps: [
      'Ensure scene safety for responders',
      'Assess ABC (Airway, Breathing, Circulation)',
      'Activate SOS with person ID and severity',
      'Stabilize patient; do not move if spinal injury suspected',
      'Contact Medical Officer (P004) via HF/VHF',
      'Prepare for evacuation to nearest station medical bay',
    ],
  },
  {
    id: 'fire',
    title: 'Fire / Smoke',
    steps: [
      'Raise alarm — shout and radio',
      'Use nearest extinguisher only if safe',
      'Evacuate to muster point upwind',
      'Account for all personnel',
      'Report to Station In-Charge',
    ],
  },
  {
    id: 'missing',
    title: 'Missing Person',
    steps: [
      'Last known location and time',
      'Do not send lone searchers',
      'Activate SOS with type Missing Person',
      'Coordinate with Safety Officer (P003)',
      'Preserve tracks; mark search grid',
    ],
  },
  {
    id: 'evac',
    title: 'Evacuation',
    steps: [
      'Move to designated muster points',
      'Bring survival kit and radio',
      'Buddy system — never alone',
      'Follow marked safe corridors',
      'Report headcount to Command',
    ],
  },
]

export const OFFLINE_CONTACTS = [
  { role: 'Expedition Commander', name: 'Dr. Rajesh Mehta', id: 'P001', channel: 'HF Primary' },
  { role: 'Safety Officer', name: 'Capt. Vikram Singh', id: 'P003', channel: 'VHF Ch. 1' },
  { role: 'Medical Officer', name: 'Dr. Priya Nair', id: 'P004', channel: 'VHF Ch. 2 / Medical' },
  { role: 'Logistics Officer', name: 'Anita Sharma', id: 'P002', channel: 'HF Secondary' },
  { role: 'Station Engineer (Bharati)', name: 'Arjun Kumar', id: 'P005', channel: 'HF Bharati' },
]

function readQueue(): EmergencyRecord[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeQueue(list: EmergencyRecord[]) {
  localStorage.setItem(KEY, JSON.stringify(list))
}

export function getLocalEmergencies(): EmergencyRecord[] {
  return readQueue().sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function getPendingCount(): number {
  return readQueue().filter(e => e.sync_status === 'pending' || e.sync_status === 'failed').length
}

export function createLocalEmergency(input: {
  person_id: string
  person_name?: string
  type: string
  severity: string
  location: string
  lat?: number | null
  lng?: number | null
  description?: string
}): EmergencyRecord {
  const id = `E${Date.now().toString(36).toUpperCase()}`
  const rec: EmergencyRecord = {
    id,
    person_id: input.person_id,
    person_name: input.person_name,
    type: input.type,
    severity: input.severity,
    location: input.location,
    lat: input.lat ?? null,
    lng: input.lng ?? null,
    description: input.description || '',
    status: 'pending_sync',
    sync_status: 'pending',
    created_at: new Date().toISOString(),
    source: 'local',
  }
  const list = readQueue()
  list.unshift(rec)
  writeQueue(list)
  return rec
}

export function markSynced(id: string) {
  const list = readQueue().map(e =>
    e.id === id ? { ...e, sync_status: 'synced' as const, status: 'active' as const } : e
  )
  writeQueue(list)
}

export function markFailed(id: string) {
  const list = readQueue().map(e => (e.id === id ? { ...e, sync_status: 'failed' as const } : e))
  writeQueue(list)
}

export function isOnline(): boolean {
  return typeof navigator !== 'undefined' ? navigator.onLine : true
}

/** Attempt to push pending records to API. Returns number synced. */
export async function syncPending(apiUrl: string): Promise<{ synced: number; failed: number }> {
  const pending = readQueue().filter(e => e.sync_status === 'pending' || e.sync_status === 'failed')
  let synced = 0
  let failed = 0
  for (const rec of pending) {
    try {
      const res = await fetch(`${apiUrl}/api/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rec.id,
          type: rec.type,
          severity: rec.severity,
          person_id: rec.person_id,
          location: rec.location,
          description: rec.description || `${rec.type} at ${rec.location}`,
          lat: rec.lat,
          lng: rec.lng,
          status: 'active',
        }),
      })
      if (res.ok) {
        markSynced(rec.id)
        synced++
      } else {
        markFailed(rec.id)
        failed++
      }
    } catch {
      markFailed(rec.id)
      failed++
    }
  }
  return { synced, failed }
}

export function getGps(): Promise<{ lat: number; lng: number } | null> {
  return new Promise(resolve => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => resolve(null),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    )
  })
}
