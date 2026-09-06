import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ScanLine, ArrowRight, CloudLightning, Route, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { Link } from 'wouter'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import CargoLiveMap from '@/components/map/CargoLiveMap'
import {
  loadShipments,
  getWeatherAdvisories,
  applyAlternateRoute,
  syncCargoQueue,
  getPendingSyncCount,
  type CargoShipment,
} from '@/lib/cargoShipments'

const API_URL = import.meta.env.VITE_API_URL || 'https://polaris-api-ju9u.onrender.com'

export default function CargoDashboard() {
  const [list, setList] = useState<CargoShipment[]>([])
  const [online, setOnline] = useState(true)
  const [pending, setPending] = useState(0)

  const refresh = async () => {
    setPending(getPendingSyncCount())
    // Prefer live API cargo when available
    if (API_URL && navigator.onLine) {
      try {
        const res = await fetch(`${API_URL}/api/cargo`)
        if (res.ok) {
          const rows = await res.json()
          if (Array.isArray(rows) && rows.length) {
            const mapped = rows.map((r: any) => ({
              id: r.id,
              name: r.item || r.name || r.id,
              destination: r.destination || 'Maitri',
              status: String(r.status || 'Pending').includes('Deliver')
                ? 'Delivered'
                : String(r.status || '').includes('Delay')
                  ? 'Delayed'
                  : String(r.status || '').includes('Pending')
                    ? 'Pending'
                    : 'In Transit',
              progress: Math.min(100, Math.round(((Number(r.current_checkpoint) || 0) / 5) * 100)),
              routeId: 'primary' as const,
            }))
            setList(mapped)
            return
          }
        }
      } catch { /* fall through */ }
    }
    setList(loadShipments())
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

  const setAlt = (id: string) => {
    setList(applyAlternateRoute(id))
    toast.success(`${id} switched to alternate weather route`)
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
            <p className="text-2xl font-bold text-ice-50">{s.value}</p>
            <p className="text-xs text-ice-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* AI weather alternate routes */}
      {advisories.map((a, i) => (
        <div
          key={i}
          className={cn(
            'rounded-2xl border p-4 space-y-3',
            a.severity === 'severe' || a.severity === 'critical'
              ? 'border-amber-500/40 bg-amber-500/5'
              : 'border-ice-800/50 bg-ice-900/30'
          )}
        >
          <div className="flex items-start gap-3">
            <CloudLightning className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ice-100">AI weather plan · {a.area}</p>
              <p className="text-xs text-ice-400 mt-0.5">{a.condition}</p>
              <p className="text-sm text-ice-200 mt-2">{a.recommendation}</p>
              {a.affectedIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {a.affectedIds.map(id => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setAlt(id)}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-medium inline-flex items-center gap-1"
                    >
                      <Route className="w-3 h-3" /> Set alternate route · {id}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      <div className="glass rounded-2xl border border-ice-800/50 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-ice-800/50 font-semibold text-ice-100 text-sm flex items-center justify-between">
          <span>Recent Shipments</span>
          <div className="flex items-center gap-3">
            <button type="button" onClick={refresh} className="text-ice-500 hover:text-cyan-400" title="Refresh">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <Link href="/cargo/registry">
              <a className="text-xs text-cyan-400 font-normal flex items-center gap-1">
                View all <ArrowRight className="w-3 h-3" />
              </a>
            </Link>
          </div>
        </div>
        <div className="divide-y divide-ice-800/40">
          {recent.map(r => (
            <div key={r.id} className="px-5 py-3 flex items-center gap-3 sm:gap-4 hover:bg-ice-900/30 transition-colors flex-wrap sm:flex-nowrap">
              <span className="font-mono text-sm text-cyan-400 w-20 shrink-0">{r.id}</span>
              <span className="flex-1 text-sm text-ice-200 truncate min-w-[100px]">{r.name}</span>
              {r.routeId === 'alternate' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-500/15 text-violet-300 border border-violet-500/30">
                  Alt route
                </span>
              )}
              {r.pendingSync && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                  Offline save
                </span>
              )}
              <span className="text-xs text-ice-500 w-24 hidden md:block">{r.destination}</span>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium w-24 text-center shrink-0',
                  r.status === 'Delivered' && 'bg-emerald-500/15 text-emerald-400',
                  r.status === 'In Transit' && 'bg-blue-500/15 text-blue-400',
                  r.status === 'Delayed' && 'bg-amber-500/15 text-amber-400',
                  r.status === 'Pending' && 'bg-ice-700 text-ice-400'
                )}
              >
                {r.status}
              </span>
              <div className="w-20 h-1.5 bg-ice-800 rounded-full overflow-hidden hidden lg:block">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full" style={{ width: `${r.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl border border-ice-800/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-ice-800/50 flex items-center justify-between">
          <h2 className="font-semibold text-ice-100 text-sm">Live cargo map</h2>
          <Link href="/cargo/tracking">
            <a className="text-xs text-cyan-400">Open tracking →</a>
          </Link>
        </div>
        <CargoLiveMap compact items={list} />
      </div>
    </div>
  )
}
