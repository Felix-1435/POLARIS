import { motion } from 'framer-motion'
import { Package, Ship, Plane, ScanLine, ArrowRight } from 'lucide-react'
import { Link } from 'wouter'
import { cn } from '@/lib/utils'
import CargoLiveMap from '@/components/map/CargoLiveMap'
import { CARGO_SHIPMENTS, loadShipments, type CargoShipment } from '@/lib/cargoShipments'
import { useEffect, useState } from 'react'

const stats = [
  { label: 'Total Cargo', value: '248', icon: Package },
  { label: 'Sea transport', value: '—', icon: Ship, key: 'Sea' as const },
  { label: 'Air transport', value: '—', icon: Plane, key: 'Air' as const },
]

export default function CargoDashboard() {
  const [list, setList] = useState<CargoShipment[]>(CARGO_SHIPMENTS)

  useEffect(() => {
    setList(loadShipments())
  }, [])

  const seaCount = list.filter(c => (c.transport || 'Sea') === 'Sea').length
  const airCount = list.filter(c => c.transport === 'Air').length
  const recent = list.map(c => ({
    id: c.id,
    item: c.name,
    dest: c.destination,
    status: c.status,
    progress: c.progress,
    transport: c.transport || 'Sea',
  }))

  const kpi = [
    { label: 'Total shipments', value: String(list.length), icon: Package },
    { label: 'Sea transport', value: String(seaCount), icon: Ship },
    { label: 'Air transport', value: String(airCount), icon: Plane },
  ]

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ice-50 tracking-tight">Cargo & Logistics</h1>
          <p className="text-sm text-ice-500 mt-0.5">Sea & air delivery · India → Antarctica</p>
        </div>
        <div className="flex gap-2">
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
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {kpi.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl border border-ice-800/50 p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-500/15 flex items-center justify-center">
                <Icon className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-ice-50">{s.value}</p>
                <p className="text-xs text-ice-500">{s.label}</p>
              </div>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl border border-ice-800/50 overflow-hidden"
      >
        <div className="px-5 py-3.5 border-b border-ice-800/50 font-semibold text-ice-100 text-sm flex items-center justify-between">
          <span>Recent Shipments</span>
          <Link href="/cargo/registry">
            <a className="text-xs text-cyan-400 font-normal flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </a>
          </Link>
        </div>
        <div className="divide-y divide-ice-800/40">
          {recent.map((r, i) => (
            <motion.div
              key={r.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.04 }}
              className="px-5 py-3 flex items-center gap-3 sm:gap-4 hover:bg-ice-900/30 transition-colors flex-wrap sm:flex-nowrap"
            >
              <span className="font-mono text-sm text-cyan-400 w-20 shrink-0">{r.id}</span>
              <span className="flex-1 text-sm text-ice-200 truncate min-w-[120px]">{r.item}</span>
              <span
                className={cn(
                  'text-[10px] px-2 py-0.5 rounded-full font-medium inline-flex items-center gap-1 border shrink-0',
                  r.transport === 'Air'
                    ? 'bg-violet-500/15 text-violet-300 border-violet-500/30'
                    : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                )}
                title={r.transport === 'Air' ? 'Air transport' : 'Sea transport'}
              >
                {r.transport === 'Air' ? <Plane className="w-3 h-3" /> : <Ship className="w-3 h-3" />}
                {r.transport}
              </span>
              <span className="text-xs text-ice-500 w-24 hidden md:block">{r.dest}</span>
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
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${r.progress}%` }}
                  transition={{ delay: 0.5 + i * 0.05, duration: 0.6 }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full"
                />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass rounded-2xl border border-ice-800/50 overflow-hidden"
      >
        <div className="px-5 py-3 border-b border-ice-800/50 flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-semibold text-ice-100 text-sm">Live cargo positions</h2>
          <div className="flex items-center gap-3 text-[10px] text-ice-500">
            <span className="flex items-center gap-1"><Ship className="w-3 h-3 text-sky-400" /> Sea route</span>
            <span className="flex items-center gap-1"><Plane className="w-3 h-3 text-violet-400" /> Air route</span>
            <Link href="/cargo/tracking">
              <a className="text-xs text-cyan-400 flex items-center gap-1">
                Open tracking <ArrowRight className="w-3 h-3" />
              </a>
            </Link>
          </div>
        </div>
        <CargoLiveMap compact items={list} />
      </motion.div>
    </div>
  )
}
