import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  AlertTriangle, Users, MapPin, Heart, Plane, Wifi, WifiOff,
  RefreshCw, BookOpen, Phone, Navigation, X, CheckCircle2, Clock, Radio
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAuth } from '@/App'
import {
  createLocalEmergency, getLocalEmergencies, getPendingCount, syncPending,
  isOnline, getGps, STATIONS, EMERGENCY_TYPES, SEVERITIES,
  OFFLINE_PROCEDURES, OFFLINE_CONTACTS, type EmergencyRecord,
} from '@/lib/offlineEmergencies'

const API_URL = import.meta.env.VITE_API_URL || ''

export default function EmergencyDashboard() {
  const { user } = useAuth()
  const [online, setOnline] = useState(isOnline())
  const [localList, setLocalList] = useState<EmergencyRecord[]>([])
  const [pending, setPending] = useState(0)
  const [serverIncidents, setServerIncidents] = useState<any[]>([])
  const [tab, setTab] = useState<'active' | 'queue' | 'map' | 'procedures' | 'contacts'>('active')
  const [sosOpen, setSosOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [form, setForm] = useState({
    type: 'Medical',
    severity: 'Critical',
    person_id: 'P006',
    person_name: 'Suresh Reddy',
    location: 'Field Camp B',
    description: '',
  })
  const [gps, setGps] = useState<{ lat: number; lng: number } | null>(null)

  const refreshLocal = useCallback(() => {
    setLocalList(getLocalEmergencies())
    setPending(getPendingCount())
  }, [])

  const loadServer = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/incidents`)
      if (res.ok) setServerIncidents(await res.json())
    } catch { /* offline ok */ }
  }, [])

  const runSync = useCallback(async () => {
    if (!isOnline()) {
      toast.message('Still offline — will sync when connected')
      return
    }
    setSyncing(true)
    try {
      const { synced, failed } = await syncPending(API_URL)
      refreshLocal()
      await loadServer()
      if (synced) toast.success(`Synced ${synced} emergency record(s) to server`)
      if (failed) toast.error(`${failed} failed to sync — will retry`)
      if (!synced && !failed) toast.message('Nothing pending')
    } finally {
      setSyncing(false)
    }
  }, [refreshLocal, loadServer])

  useEffect(() => {
    refreshLocal()
    loadServer()
    const on = () => { setOnline(true); runSync() }
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    const t = setInterval(() => {
      setOnline(isOnline())
      if (isOnline() && getPendingCount() > 0) runSync()
    }, 30000)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
      clearInterval(t)
    }
  }, [refreshLocal, loadServer, runSync])

  const openSos = async () => {
    setSosOpen(true)
    const pos = await getGps()
    setGps(pos)
  }

  const submitSos = async () => {
    setSaving(true)
    try {
      const pos = gps || (await getGps())
      const rec = createLocalEmergency({
        person_id: form.person_id,
        person_name: form.person_name || user?.name,
        type: form.type,
        severity: form.severity,
        location: form.location,
        lat: pos?.lat ?? null,
        lng: pos?.lng ?? null,
        description: form.description || `${form.type} emergency — ${form.severity}`,
      })
      refreshLocal()
      toast.success(`Emergency ${rec.id} saved locally`, {
        description: isOnline() ? 'Attempting server sync…' : 'Offline — queued for sync',
      })
      setSosOpen(false)
      setTab('queue')

      // Try immediate sync if online
      if (isOnline()) {
        const { synced } = await syncPending(API_URL)
        refreshLocal()
        if (synced) {
          toast.success('Emergency delivered to Control Center')
          await loadServer()
        }
      }
    } catch (e: any) {
      toast.error(e.message || 'Failed to record emergency')
    } finally {
      setSaving(false)
    }
  }

  const activeServer = serverIncidents.filter((i: any) => i.status === 'active')
  const criticalLocal = localList.filter(e => e.severity === 'Critical' && e.sync_status !== 'synced')

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ice-50 flex items-center gap-2">
            <span className="relative">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </span>
            Emergency Response
          </h1>
          <p className="text-ice-500 text-sm mt-0.5">Offline-first SOS · Local queue · Auto-sync · Procedures</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn(
            'inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full border font-medium',
            online ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
          )}>
            {online ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            {online ? 'Online' : 'Offline'}
          </span>
          {pending > 0 && (
            <button onClick={runSync} disabled={syncing || !online}
              className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 disabled:opacity-50">
              <RefreshCw className={cn('w-3.5 h-3.5', syncing && 'animate-spin')} />
              {pending} pending sync
            </button>
          )}
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }} onClick={openSos}
            className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold shadow-lg shadow-red-600/30 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Activate SOS
          </motion.button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active (server)', value: String(activeServer.length || 1), danger: true },
          { label: 'Local queue', value: String(localList.length), danger: localList.length > 0 },
          { label: 'Pending sync', value: String(pending), danger: pending > 0 },
          { label: 'Response teams', value: '06', danger: false },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={cn('glass rounded-2xl p-4 border', s.danger ? 'border-red-500/30 bg-red-500/5' : 'border-ice-800/50')}>
            <p className="text-2xl font-bold text-ice-50">{s.value}</p>
            <p className="text-xs text-ice-400 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-ice-900/50 border border-ice-800/50">
        {[
          { id: 'active' as const, label: 'Active', icon: AlertTriangle },
          { id: 'queue' as const, label: 'Local Queue', icon: Clock },
          { id: 'map' as const, label: 'Offline Map', icon: MapPin },
          { id: 'procedures' as const, label: 'Procedures', icon: BookOpen },
          { id: 'contacts' as const, label: 'Contacts', icon: Phone },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={cn('flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition',
              tab === t.id ? 'bg-red-500/15 text-red-300 border border-red-500/30' : 'text-ice-400 hover:text-ice-200 hover:bg-ice-800/40')}>
            <t.icon className="w-4 h-4" />{t.label}
            {t.id === 'queue' && pending > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400">{pending}</span>
            )}
          </button>
        ))}
      </div>

      {/* ACTIVE */}
      {tab === 'active' && (
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
            className="glass rounded-2xl border border-red-500/30 overflow-hidden relative">
            <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
            <div className="relative bg-red-500/10 px-5 py-3.5 border-b border-red-500/20 flex items-center justify-between">
              <h2 className="font-semibold text-red-300 flex items-center gap-2 text-sm">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> INC-0042 — Medical Emergency
              </h2>
              <span className="text-xs text-red-400/80 font-mono">ACTIVE</span>
            </div>
            <div className="relative p-5 grid md:grid-cols-2 gap-6">
              <div className="space-y-3 text-sm">
                {[
                  ['Person', 'P-006 · Suresh Reddy'],
                  ['Location', 'Field Camp B'],
                  ['Type', 'Medical · Critical'],
                  ['Response Team', 'Alpha (5 members)'],
                  ['ETA', '18 min'],
                  ['Evacuation', 'Required → Maitri Medical'],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4">
                    <span className="text-ice-500">{k}</span>
                    <span className="text-ice-100 text-right font-medium">{v}</span>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <button className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium flex items-center justify-center gap-2">
                  <Users className="w-4 h-4" /> Assign / Update Team
                </button>
                <button className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium flex items-center justify-center gap-2">
                  <Plane className="w-4 h-4" /> Start Evacuation
                </button>
                <button className="w-full py-2.5 rounded-xl bg-ice-700 hover:bg-ice-600 text-ice-200 text-sm font-medium flex items-center justify-center gap-2">
                  <Heart className="w-4 h-4" /> Notify Medical Facility
                </button>
              </div>
            </div>
          </motion.div>

          {criticalLocal.map(e => (
            <div key={e.id} className="glass rounded-xl border border-amber-500/30 p-4 bg-amber-500/5">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-amber-200">{e.id} — {e.type} (local)</p>
                <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300">{e.sync_status}</span>
              </div>
              <p className="text-sm text-ice-400 mt-1">{e.person_id} · {e.location} · {e.severity}</p>
            </div>
          ))}

          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass rounded-2xl border border-ice-800/50 p-5">
              <h3 className="font-semibold text-ice-100 mb-3 text-sm">Response Team Alpha</h3>
              <div className="space-y-2 text-sm">
                {[['Members', '5'], ['Distance', '4.2 km'], ['Status', 'Responding'], ['Equipment', 'Medical ✓ Comm ✓ Transport ✓']].map(([k, v]) => (
                  <div key={k} className="flex justify-between"><span className="text-ice-500">{k}</span><span className="text-ice-200">{v}</span></div>
                ))}
              </div>
            </div>
            <div className="glass rounded-2xl border border-ice-800/50 p-5">
              <h3 className="font-semibold text-ice-100 mb-3 text-sm">Evacuation Route</h3>
              <div className="flex items-center gap-2 text-sm text-ice-300 flex-wrap">
                <MapPin className="w-4 h-4 text-red-400" /> Field Camp B
                <span className="text-ice-600">→</span>
                <span>Safe Corridor</span>
                <span className="text-ice-600">→</span>
                <MapPin className="w-4 h-4 text-emerald-400" /> Maitri Medical
              </div>
              <p className="text-xs text-ice-500 mt-3">4.2 km · ETA 18 min · Weather moderate</p>
            </div>
          </div>
        </div>
      )}

      {/* LOCAL QUEUE */}
      {tab === 'queue' && (
        <div className="glass rounded-xl border border-ice-800/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-ice-800/50 flex items-center justify-between">
            <h3 className="font-semibold text-ice-100 text-sm">Local emergency queue (device storage)</h3>
            <button onClick={runSync} disabled={!online || syncing || pending === 0}
              className="text-xs px-3 py-1.5 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-white disabled:opacity-40 flex items-center gap-1">
              <RefreshCw className={cn('w-3.5 h-3.5', syncing && 'animate-spin')} /> Sync now
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-ice-500 uppercase">
                <tr>
                  <th className="px-4 py-2 text-left">ID</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Person</th>
                  <th className="px-4 py-2 text-left">Location / GPS</th>
                  <th className="px-4 py-2 text-left">Time</th>
                  <th className="px-4 py-2 text-left">Sync</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ice-800/40">
                {localList.map(e => (
                  <tr key={e.id} className="hover:bg-ice-900/30">
                    <td className="px-4 py-2.5 font-mono text-ice-200">{e.id}</td>
                    <td className="px-4 py-2.5 text-ice-300">{e.type} · {e.severity}</td>
                    <td className="px-4 py-2.5 text-ice-300">{e.person_id}{e.person_name ? ` · ${e.person_name}` : ''}</td>
                    <td className="px-4 py-2.5 text-ice-400 text-xs">
                      {e.location}
                      {e.lat != null && e.lng != null && (
                        <div className="font-mono text-ice-500">{e.lat.toFixed(4)}, {e.lng.toFixed(4)}</div>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-ice-500 text-xs whitespace-nowrap">{new Date(e.created_at).toLocaleString()}</td>
                    <td className="px-4 py-2.5">
                      <span className={cn('text-[10px] uppercase px-2 py-0.5 rounded-full font-medium',
                        e.sync_status === 'synced' && 'bg-emerald-500/15 text-emerald-400',
                        e.sync_status === 'pending' && 'bg-amber-500/15 text-amber-400',
                        e.sync_status === 'failed' && 'bg-red-500/15 text-red-400',
                      )}>{e.sync_status === 'pending' ? 'Pending Sync' : e.sync_status}</span>
                    </td>
                  </tr>
                ))}
                {localList.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-ice-500">No local emergencies. Use Activate SOS — works offline.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* OFFLINE MAP */}
      {tab === 'map' && (
        <div className="glass rounded-xl border border-ice-800/50 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Navigation className="w-5 h-5 text-cyan-400" />
            <h3 className="font-semibold text-ice-100">Offline locations (preloaded)</h3>
          </div>
          <p className="text-xs text-ice-500">Station and camp coordinates stored on-device — no map tiles required.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {STATIONS.map(s => (
              <div key={s.id} className="rounded-xl border border-ice-800/50 bg-ice-900/40 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className={cn('w-4 h-4', s.type === 'station' ? 'text-emerald-400' : s.type === 'camp' ? 'text-amber-400' : 'text-cyan-400')} />
                  <span className="font-medium text-ice-100 text-sm">{s.name}</span>
                </div>
                <p className="text-[11px] font-mono text-ice-500">{s.lat.toFixed(3)}, {s.lng.toFixed(3)}</p>
                <p className="text-[10px] text-ice-600 uppercase mt-1">{s.type}</p>
              </div>
            ))}
          </div>
          {localList.filter(e => e.lat != null).slice(0, 5).map(e => (
            <div key={e.id} className="rounded-lg border border-red-500/30 bg-red-500/5 p-3 flex items-center gap-3">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <p className="text-sm text-red-200">{e.id} emergency pin</p>
                <p className="text-xs font-mono text-ice-500">{e.lat?.toFixed(4)}, {e.lng?.toFixed(4)} · {e.location}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PROCEDURES */}
      {tab === 'procedures' && (
        <div className="grid md:grid-cols-2 gap-4">
          {OFFLINE_PROCEDURES.map(p => (
            <div key={p.id} className="glass rounded-xl border border-ice-800/50 p-5">
              <h3 className="font-semibold text-ice-100 mb-3 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />{p.title}
              </h3>
              <ol className="space-y-2 text-sm text-ice-300 list-decimal list-inside">
                {p.steps.map((s, i) => <li key={i}>{s}</li>)}
              </ol>
            </div>
          ))}
        </div>
      )}

      {/* CONTACTS */}
      {tab === 'contacts' && (
        <div className="glass rounded-xl border border-ice-800/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-ice-800/50 font-semibold text-ice-100 text-sm flex items-center gap-2">
            <Radio className="w-4 h-4 text-cyan-400" /> Preloaded emergency contacts (offline)
          </div>
          <div className="divide-y divide-ice-800/40">
            {OFFLINE_CONTACTS.map(c => (
              <div key={c.id} className="px-5 py-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-ice-100 font-medium text-sm">{c.name}</p>
                  <p className="text-xs text-ice-500">{c.role} · {c.id}</p>
                </div>
                <span className="text-xs font-mono px-2 py-1 rounded bg-ice-900/60 text-cyan-300 border border-ice-800">{c.channel}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SOS MODAL */}
      <AnimatePresence>
        {sosOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSosOpen(false)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="w-full max-w-md glass-strong rounded-2xl border border-red-500/40 p-5 space-y-3 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-red-300 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" /> Activate SOS
                </h3>
                <button onClick={() => setSosOpen(false)} className="text-ice-500 hover:text-ice-200"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-xs text-ice-500">
                {online ? 'Will save locally and sync to server.' : 'Offline mode — saved on device, auto-syncs when online.'}
              </p>
              <label className="block space-y-1 text-xs text-ice-400">Type
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm">
                  {EMERGENCY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label className="block space-y-1 text-xs text-ice-400">Severity
                <select value={form.severity} onChange={e => setForm({ ...form, severity: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm">
                  {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <label className="block space-y-1 text-xs text-ice-400">Person ID
                  <input value={form.person_id} onChange={e => setForm({ ...form, person_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm" />
                </label>
                <label className="block space-y-1 text-xs text-ice-400">Name
                  <input value={form.person_name} onChange={e => setForm({ ...form, person_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm" />
                </label>
              </div>
              <label className="block space-y-1 text-xs text-ice-400">Last known location
                <select value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm">
                  {STATIONS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  <option value="Unknown">Unknown</option>
                </select>
              </label>
              <label className="block space-y-1 text-xs text-ice-400">Notes
                <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm" />
              </label>
              <div className="text-xs text-ice-500 font-mono rounded-lg bg-ice-900/50 border border-ice-800 p-2">
                GPS: {gps ? `${gps.lat.toFixed(5)}, ${gps.lng.toFixed(5)}` : 'Acquiring… (or unavailable)'}
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button onClick={() => setSosOpen(false)} className="px-3 py-2 text-sm text-ice-400">Cancel</button>
                <button onClick={submitSos} disabled={saving}
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold disabled:opacity-50 flex items-center gap-2">
                  {saving ? 'Saving…' : <><CheckCircle2 className="w-4 h-4" /> Confirm SOS</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
