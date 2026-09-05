import { motion } from 'framer-motion'
import { Package, CheckCircle, Clock, AlertTriangle, Ship, ArrowRight } from 'lucide-react'
import { Link } from 'wouter'
import { cn } from '@/lib/utils'
import CargoLiveMap from '@/components/map/CargoLiveMap'

const stats = [
  { label: 'Total Cargo', value: '248', icon: Package },
  { label: 'In Transit', value: '17', icon: Ship },
  { label: 'Delivered', value: '186', icon: CheckCircle },
  { label: 'Delayed', value: '5', icon: AlertTriangle },
  { label: 'Pending', value: '40', icon: Clock },
]

const recent = [
  { id: 'ANT-001', item: 'Satellite Equipment', dest: 'Maitri', status: 'In Transit', progress: 80 },
  { id: 'ANT-002', item: 'Diesel Fuel (20kL)', dest: 'Maitri', status: 'Delayed', progress: 45 },
  { id: 'ANT-003', item: 'Food Rations', dest: 'Bharati', status: 'Delivered', progress: 100 },
  { id: 'ANT-004', item: 'Medical Kits', dest: 'Field Camp B', status: 'Pending', progress: 10 },
  { id: 'ANT-015', item: 'Aviation Fuel', dest: 'Maitri', status: 'Delayed', progress: 35 },
]

export default function CargoDashboard() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ice-50 tracking-tight">Cargo & Logistics</h1>
          <p className="text-ice-500 text-sm">End-to-end tracking from India to polar stations</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link href="/cargo/registry">
            <a className="px-3.5 py-2 rounded-xl bg-ice-800/80 text-sm text-ice-300 hover:bg-ice-700 border border-ice-700">Registry</a>
          </Link>
          <Link href="/cargo/tracking">
            <a className="px-3.5 py-2 rounded-xl bg-ice-800/80 text-sm text-ice-300 hover:bg-ice-700 border border-ice-700">Live Tracking</a>
          </Link>
          <Link href="/cargo/scan">
            <a className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-sm text-white font-medium shadow-lg shadow-cyan-600/20">
              Scan Cargo
            </a>
          </Link>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4, scale: 1.02 }}
              className="card-3d glass rounded-2xl p-4 border border-ice-800/50"
            >
              <Icon className="w-5 h-5 text-cyan-400 mb-2" />
              <p className="text-2xl font-bold text-ice-50 tracking-tight">{s.value}</p>
              <p className="text-xs text-ice-400">{s.label}</p>
            </motion.div>
          )
        })}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass rounded-2xl border border-ice-800/50 overflow-hidden"
      >
        <div className="px-5 py-3.5 border-b border-ice-800/50 font-semibold text-ice-100 text-sm flex items-center justify-between">
          Recent Shipments
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
              className="px-5 py-3 flex items-center gap-4 hover:bg-ice-900/30 transition-colors"
            >
              <span className="font-mono text-sm text-cyan-400 w-20">{r.id}</span>
              <span className="flex-1 text-sm text-ice-200 truncate">{r.item}</span>
              <span className="text-xs text-ice-500 w-24 hidden sm:block">{r.dest}</span>
              <span
                className={cn(
                  'text-xs px-2 py-0.5 rounded-full font-medium w-24 text-center',
                  r.status === 'Delivered' && 'bg-emerald-500/15 text-emerald-400',
                  r.status === 'In Transit' && 'bg-blue-500/15 text-blue-400',
                  r.status === 'Delayed' && 'bg-amber-500/15 text-amber-400',
                  r.status === 'Pending' && 'bg-ice-700 text-ice-400'
                )}
              >
                {r.status}
              </span>
              <div className="w-20 h-1.5 bg-ice-800 rounded-full overflow-hidden hidden md:block">
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
        <div className="px-5 py-3 border-b border-ice-800/50 flex items-center justify-between">
          <h2 className="font-semibold text-ice-100 text-sm">Live cargo positions</h2>
          <Link href="/cargo/tracking">
            <a className="text-xs text-cyan-400 flex items-center gap-1">
              Open tracking <ArrowRight className="w-3 h-3" />
            </a>
          </Link>
        </div>
        <CargoLiveMap compact />
      </motion.div>
    </div>
  )
}
