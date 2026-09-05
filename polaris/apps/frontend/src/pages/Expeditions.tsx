import { motion } from 'framer-motion'
import { Map, Users, Package, Calendar, Plus } from 'lucide-react'
import { Link } from 'wouter'
import { cn } from '@/lib/utils'

const expeditions = [
  { id: 'ANT-47', name: 'Antarctica Summer Expedition 2026', status: 'Active', region: 'Antarctica', personnel: 82, cargo: 156, duration: '120 days', color: 'emerald' },
  { id: 'ARC-12', name: 'Arctic Climate Monitoring', status: 'Planning', region: 'Arctic', personnel: 24, cargo: 48, duration: '90 days', color: 'amber' },
  { id: 'ANT-46', name: 'Winter-over 2025-26', status: 'Completed', region: 'Antarctica', personnel: 45, cargo: 90, duration: '365 days', color: 'blue' },
  { id: 'ANT-45', name: 'Ice Core Research Mission', status: 'Suspended', region: 'Antarctica', personnel: 18, cargo: 32, duration: '60 days', color: 'red' },
]

export default function Expeditions() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ice-50">Expeditions</h1>
          <p className="text-ice-500 text-sm">Plan, monitor and resource polar missions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 text-sm text-white font-medium shadow-lg shadow-cyan-600/20">
          <Plus className="w-4 h-4" /> Create Expedition
        </button>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {expeditions.map((e, i) => (
          <motion.div key={e.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            className="glass rounded-xl border border-ice-800/50 p-5 card-3d hover:border-cyan-500/30 transition-colors">
            <div className="flex items-start justify-between mb-3">
              <div>
                <span className="font-mono text-xs text-cyan-400">{e.id}</span>
                <h3 className="font-semibold text-ice-50 mt-0.5">{e.name}</h3>
              </div>
              <span className={cn(
                "text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider",
                e.status === 'Active' && "bg-emerald-500/15 text-emerald-400",
                e.status === 'Planning' && "bg-amber-500/15 text-amber-400",
                e.status === 'Completed' && "bg-blue-500/15 text-blue-400",
                e.status === 'Suspended' && "bg-red-500/15 text-red-400",
              )}>{e.status}</span>
            </div>
            <div className="grid grid-cols-3 gap-3 text-xs text-ice-400 mb-4">
              <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> {e.personnel} personnel</div>
              <div className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5" /> {e.cargo} cargo</div>
              <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {e.duration}</div>
            </div>
            <Link href={`/expeditions/${e.id}`}>
              <a className="text-sm text-cyan-400 hover:text-cyan-300 font-medium">View Expedition →</a>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
