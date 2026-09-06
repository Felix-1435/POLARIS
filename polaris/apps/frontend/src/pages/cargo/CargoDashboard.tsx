import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ScanLine, ArrowRight, CloudLightning, Route, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { Link } from 'wouter'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import CargoLiveMap from '@/components/map/CargoLiveMap'
import {
  CARGO_SHIPMENTS,
  loadShipments,
  getWeatherAdvisories,
  applyAlternateRouteAndSync,
  syncCargoQueue,
  getPendingSyncCount,
  type CargoShipment,
} from '@/lib/cargoShipments'

const API_URL = import.meta.env.VITE_API_URL || 'https://polaris-api-ju9u.onrender.com'

/** Merge API row onto curated shipment — keeps original cargo UI, live progress/status/route */
function mapApiRow(r: any): CargoShipment {
  const hist = Array.isArray(r.history) ? r.history : []
  const lastRoute = [...hist].reverse().find((h: any) => h && (h.routeId || h.type === 'route'))
  const alt =
    lastRoute?.routeId === 'alternate' ||
    String(r.status || '').toLowerCase().includes('alternate')
  const st = String(r.status || '')
  const status: CargoShipment['status'] = st.includes('Deliver')
    ? 'Delivered'
    : st.includes('Delay')
      ? 'Delayed'
      : st.includes('Pending')
        ? 'Pending'
        : 'In Transit'
  return {
    id: r.id,
    name: r.item || r.name || r.id,
    destination: r.destination || 'Maitri',
    status,
    progress: Math.min(100, Math.round(((Number(r.current_checkpoint) || 0) / 5) * 100)),
    routeId: alt ? 'alternate' : 'primary',
    weatherHold: status === 'Delayed',
  }
}

/**
 * Keep original curated multi-route list look.
 * Overlay live API for same IDs; only add extra API rows if actively moving (not pure pending).
 */
async function buildShipmentList(): Promise<CargoShipment[]> {
  const base = loadShipments()
  if (!API_URL || !navigator.onLine) return base

  try {
    const res = await fetch(`${API_URL}/api/cargo`)
    if (!res.ok) return base
    const rows = await res.json()
    if (!Array.isArray(rows) || !rows.length) return base

    const byId = new Map<string, any>()
    for (const r of rows) byId.set(r.id, r)

    // Overlay API onto curated / offline list
    const merged = base.map(b => {
      const r = byId.get(b.id)
      if (!r) return b
      const live = mapApiRow(r)
      return {
        ...b,
        ...live,
        name: b.name || live.name, // keep familiar names when possible
        destination: live.destination || b.destination,
      }
    })

    // Add active API shipments not in base (in transit / delayed / delivered with progress)
    for (const r of rows) {
      if (merged.some(m => m.id === r.id)) continue
      const live = mapApiRow(r)
      const cp = Number(r.current_checkpoint) || 0
      if (live.status === 'Pending' && cp === 0) continue // skip pure pending noise
      merged.push(live)
    }

    // Prefer offline queue patches
    try {
      const raw = localStorage.getItem('polaris_cargo_offline_v1')
      if (raw) {
        const offline = JSON.parse(raw) as CargoShipment[]
        for (const o of offline) {
          const i = merged.findIndex(m => m.id === o.id)
          if (i >= 0 && o.routeId === 'alternate') {
            merged[i] = { ...merged[i], routeId: 'alternate', weatherHold: false, status: 'In Transit' }
          }
        }
      }
    } catch { /* */ }

    return merged
  } catch {
    return base
  }
}

export default function CargoDashboard() {
  const [list, setList] = useState<CargoShipment[]>(CARGO_SHIPMENTS.map(c => ({ ...c })))
  const [online, setOnline] = useState(true)
  const [pending, setPending] = useState(0)

  const refresh = async () => {
    setPending(getPendingSyncCount())
    const next = await buildShipmentList()
    setList(next)
  }

  useEffect(() => {
    refresh()
    setOnline(navigator.onLine)
    const on = async () => {
      setOnline(true)
      const n = await syncCargoQueue(API_URL)
      if (n > 0) toast.success(`Synced ${n} offline cargo update(s)`)
      refresh()
    }
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])

  const advisories = getWeatherAdvisories(list)
  const recent = list

  const setAlt = async (id: string) => {
    const next = await applyAlternateRouteAndSync(id, API_URL)
    // rebuild so map + list stay consistent
    const rebuilt = await buildShipmentList()
    // ensure alt flag sticks from offline list
    const withAlt = rebuilt.map(c => (c.id === id ? { ...c, routeId: 'alternate' as const, status: 'In Transit' as const, weatherHold: false } : c))
    setList(withAlt.length ? withAlt : next)
    toast.success(`${id} → alternate route (synced to API)`)
    setPending(getPendingSyncCount())
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ice-50 tracking-tight">Cargo & Logistics</h1>
          <p className="text-sm text-ice-500 mt-0.5">Sealift corridor · India → Antarctica</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span
            className={cn(
              'text-xs px-2.5 py-1 rounded-full border font-medium inline-flex items-center gap-1',
              online
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            )}
          >
            {online ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
            {online ? 'Online' : 'Offline — updates saved locally'}
          </span>
          {pending > 0 && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              {pending} pending sync
            </span>
          )}
          <button
            type="button"
            onClick={() => refresh()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-ice-700 text-ice-300 text-sm hover:bg-ice-800/50"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <Link href="/cargo/scan">
            <a className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-ice-700 text-ice-300 text-sm hover:bg-ice-800/50">
              <ScanLine className="w-4 h-4" /> Scan Cargo
            </a>
          </Link>
          <Link href="/cargo/tracking">
            <a className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-cyan-600 text-white text-sm font-medium hover:bg-cyan-500">
              Live tracking
            </a>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Active shipments', value: String(list.filter(c => c.status !== 'Delivered').length) },
          { label: 'In transit', value: String(list.filter(c => c.status === 'In Transit').length) },
          { label: 'Delayed / weather', value: String(list.filter(c => c.status === 'Delayed' || c.weatherHold).length) },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl border border-ice-800/50 p-4">
            <p className="text-xs text-ice-500 uppercase tracking-wider">{s.label}</p>
            <p className="text-2xl font-bold text-ice-50 mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {advisories.filter(a => a.affectedIds.length).map((a, i) => (
        <div key={i} className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-4">
          <div className="flex gap-3">
            <CloudLightning className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-ice-100">Weather advisory · alternate routes</p>
              <p className="text-xs text-ice-400 mt-1">{a.area} · {a.condition}</p>
              <p className="text-sm text-ice-200 mt-2">{a.recommendation}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {a.affectedIds.map(id => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setAlt(id)}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-cyan-600 text-white inline-flex items-center gap-1"
                  >
                    <Route className="w-3 h-3" /> {id} → alternate
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Multi-route live map — original look */}
      <div className="glass rounded-2xl border border-ice-800/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-ice-800/50 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-ice-100">Operational sealift map</p>
            <p className="text-xs text-ice-500">Multi-route · Goa → Maitri / Bharati · camps · live cargo</p>
          </div>
          <Link href="/cargo/tracking">
            <a className="text-xs text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1">
              Full tracking <ArrowRight className="w-3 h-3" />
            </a>
          </Link>
        </div>
        <CargoLiveMap items={list} />
      </div>

      {/* Recent shipments — curated + live overlay */}
      <div className="glass rounded-2xl border border-ice-800/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-ice-800/50 flex items-center justify-between">
          <p className="text-sm font-semibold text-ice-100">Recent shipments</p>
          <span className="text-[10px] text-ice-500">Live API when online</span>
        </div>
        <div className="divide-y divide-ice-800/40">
          {recent.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="px-5 py-3 flex flex-wrap items-center gap-3 text-sm"
            >
              <span className="font-mono text-cyan-400 text-xs w-16">{c.id}</span>
              <span className="text-ice-100 flex-1 min-w-[120px]">{c.name}</span>
              <span className="text-xs text-ice-500">{c.destination}</span>
              <span
                className={cn(
                  'text-[10px] px-2 py-0.5 rounded-full border font-medium',
                  c.status === 'Delivered' && 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
                  c.status === 'Delayed' && 'bg-amber-500/15 text-amber-400 border-amber-500/30',
                  c.status === 'In Transit' && 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
                  c.status === 'Pending' && 'bg-ice-800 text-ice-400 border-ice-700',
                )}
              >
                {c.status}
              </span>
              <span className="text-xs text-ice-500 w-10 text-right">{c.progress}%</span>
              {c.routeId === 'alternate' && (
                <span className="text-[10px] text-violet-300 border border-violet-500/30 px-1.5 py-0.5 rounded">ALT</span>
              )}
              {(c.status === 'Delayed' || c.weatherHold) && c.routeId !== 'alternate' && (
                <button
                  type="button"
                  onClick={() => setAlt(c.id)}
                  className="text-[10px] px-2 py-1 rounded-lg bg-violet-600/80 text-white"
                >
                  Alt route
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
