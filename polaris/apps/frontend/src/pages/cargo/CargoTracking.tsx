import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Ship, MapPin, Package, Radio, CloudLightning, Route } from 'lucide-react'
import { toast } from 'sonner'
import PageHeader from '@/components/shared/PageHeader'
import {
  loadShipments,
  applyAlternateRoute,
  applyAlternateRouteAndSync,
  getWeatherAdvisories,
  type CargoShipment,
} from '@/lib/cargoShipments'

const API_URL = import.meta.env.VITE_API_URL || 'https://polaris-api-ju9u.onrender.com'

export default function CargoTracking() {
  const [list, setList] = useState<CargoShipment[]>([])
  const focus = list.find(c => c.id === 'ANT-001') || list[0]

  useEffect(() => {
    setList(loadShipments())
    if (!API_URL || !navigator.onLine) return
    ;(async () => {
      try {
        const res = await fetch(`${API_URL}/api/cargo`)
        if (!res.ok) return
        const rows = await res.json()
        if (!Array.isArray(rows)) return
        setList(prev => prev.map(b => {
          const r = rows.find((x: any) => x.id === b.id)
          if (!r) return b
          const hist = Array.isArray(r.history) ? r.history : []
          const lastRoute = [...hist].reverse().find((h: any) => h && (h.routeId || h.type === 'route'))
          const alt = b.routeId === 'alternate' || lastRoute?.routeId === 'alternate'
          const st = String(r.status || '')
          return {
            ...b,
            progress: Math.min(100, Math.round(((Number(r.current_checkpoint) || 0) / 5) * 100)),
            status: (st.includes('Deliver') ? 'Delivered' : st.includes('Delay') ? 'Delayed' : st.includes('Pending') ? 'Pending' : 'In Transit') as CargoShipment['status'],
            routeId: alt ? 'alternate' : b.routeId || 'primary',
          }
        }))
      } catch { /* keep local */ }
    })()
  }, [])

  const advisories = getWeatherAdvisories(list)

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="Live Cargo Tracking"
        subtitle="Positions · weather routes · works offline with local saves"
        backTo="/cargo"
        backLabel="← Cargo & Logistics"
      />

      {advisories.filter(a => a.affectedIds.length).map((a, i) => (
        <div key={i} className="rounded-2xl border border-amber-500/40 bg-amber-500/5 p-4">
          <div className="flex gap-3">
            <CloudLightning className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-ice-100">AI alternate route plan</p>
              <p className="text-xs text-ice-400 mt-1">{a.condition}</p>
              <p className="text-sm text-ice-200 mt-2">{a.recommendation}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {a.affectedIds.map(id => (
                  <button
                    key={id}
                    type="button"
                    onClick={async () => {
                      const next = await applyAlternateRouteAndSync(id, API_URL)
                      setList(next)
                      toast.success(`${id} → alternate route (synced)`)
                    }}
                    className="text-xs px-2.5 py-1.5 rounded-lg bg-cyan-600 text-white inline-flex items-center gap-1"
                  >
                    <Route className="w-3 h-3" /> {id} alternate
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}

      {focus && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl border border-cyan-500/25 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-ice-800/50 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-cyan-500/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="font-bold text-ice-50 font-mono">{focus.id}</h2>
                <p className="text-sm text-ice-400">{focus.name}</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25 font-medium flex items-center gap-1.5">
              <Radio className="w-3 h-3" /> {focus.status}
            </span>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 p-4 text-sm">
            <div className="bg-ice-900/40 rounded-xl p-3 border border-ice-800/50">
              <p className="text-ice-500 text-[10px] uppercase">Route</p>
              <p className="text-ice-100 font-medium mt-0.5 flex items-center gap-1">
                <Ship className="w-3.5 h-3.5 text-cyan-400" />
                {focus.routeId === 'alternate' ? 'Alternate (weather)' : 'Primary sealift'}
              </p>
            </div>
            <div className="bg-ice-900/40 rounded-xl p-3 border border-ice-800/50">
              <p className="text-ice-500 text-[10px] uppercase">Progress</p>
              <p className="text-cyan-300 font-bold mt-0.5 text-lg">{focus.progress}%</p>
            </div>
            <div className="bg-ice-900/40 rounded-xl p-3 border border-ice-800/50">
              <p className="text-ice-500 text-[10px] uppercase">Destination</p>
              <p className="text-ice-100 font-medium mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {focus.destination}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="glass rounded-2xl border border-ice-800/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-ice-800/50 text-sm font-semibold text-ice-100">All shipments</div>
        <div className="divide-y divide-ice-800/40">
          {list.map(c => (
            <div key={c.id} className="px-5 py-2.5 flex items-center gap-3 text-sm">
              <span className="font-mono text-cyan-400 w-16">{c.id}</span>
              <span className="flex-1 text-ice-200 truncate">{c.name}</span>
              <span className="text-xs text-ice-500">{c.routeId === 'alternate' ? 'Alt route' : 'Primary'}</span>
              <span className="text-xs text-ice-400 w-16 text-right">{c.progress}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
