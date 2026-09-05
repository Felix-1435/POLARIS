import { motion } from 'framer-motion'
import { Package, Truck, CheckCircle, Clock, AlertTriangle, Ship } from 'lucide-react'
import { Link } from 'wouter'
import { cn } from '@/lib/utils'

const stats = [
  { label: 'Total Cargo', value: '248', icon: Package, color: 'cyan' },
  { label: 'In Transit', value: '17', icon: Ship, color: 'blue' },
  { label: 'Delivered', value: '186', icon: CheckCircle, color: 'emerald' },
  { label: 'Delayed', value: '5', icon: AlertTriangle, color: 'amber' },
  { label: 'Pending', value: '40', icon: Clock, color: 'purple' },
]

const recent = [
  { id: 'ANT-001', item: 'Satellite Equipment', dest: 'Maitri', status: 'In Transit', progress: 80 },
  { id: 'ANT-002', item: 'Diesel Fuel (20kL)', dest: 'Maitri', status: 'Delayed', progress: 45 },
  { id: 'ANT-003', item: 'Food Rations', dest: 'Bharati', status: 'Delivered', progress: 100 },
  { id: 'ANT-004', item: 'Medical Kits', dest: 'Field Camp B', status: 'Pending', progress: 10 },
  { id: 'ANT-045', item: 'Generator Spare Parts', dest: 'Maitri', status: 'In Transit', progress: 60 },
]

export default function CargoDashboard() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ice-50">Cargo & Logistics</h1>
          <p className="text-ice-500 text-sm">End-to-end tracking from India to Polar Stations</p>
        </div>
        <div className="flex gap-2">
          <Link href="/cargo/registry"><a className="px-4 py-2 rounded-lg bg-ice-800 text-sm text-ice-300 hover:bg-ice-700 border border-ice-700">Registry</a></Link>
          <Link href="/cargo/tracking"><a className="px-4 py-2 rounded-lg bg-ice-800 text-sm text-ice-300 hover:bg-ice-700 border border-ice-700">Live Tracking</a></Link>
          <Link href="/cargo/scan"><a className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-sm text-white font-medium shadow-lg shadow-cyan-600/20">Scan Cargo</a></Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {stats.map((s, i) => {
          const Icon = s.icon
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-4 border border-ice-800/50 card-3d">
              <Icon className="w-5 h-5 text-cyan-400 mb-2" />
              <p className="text-2xl font-bold text-ice-50">{s.value}</p>
              <p className="text-xs text-ice-400">{s.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="glass rounded-xl border border-ice-800/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-ice-800/50 font-semibold text-ice-100">Recent Shipments</div>
        <div className="divide-y divide-ice-800/50">
          {recent.map(r => (
            <div key={r.id} className="px-5 py-3 flex items-center gap-4 hover:bg-ice-900/30 transition-colors">
              <span className="font-mono text-sm text-cyan-400 w-20">{r.id}</span>
              <span className="flex-1 text-sm text-ice-200">{r.item}</span>
              <span className="text-xs text-ice-500 w-24">{r.dest}</span>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full font-medium w-24 text-center",
                r.status === 'Delivered' && "bg-emerald-500/15 text-emerald-400",
                r.status === 'In Transit' && "bg-blue-500/15 text-blue-400",
                r.status === 'Delayed' && "bg-amber-500/15 text-amber-400",
                r.status === 'Pending' && "bg-ice-700 text-ice-400",
              )}>{r.status}</span>
              <div className="w-24 h-1.5 bg-ice-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full progress-glow" style={{ width: `${r.progress}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
