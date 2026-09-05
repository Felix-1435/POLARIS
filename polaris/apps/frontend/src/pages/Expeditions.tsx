import { motion } from 'framer-motion'
import { Map, Users, Package, Calendar, Plus, ArrowRight } from 'lucide-react'
import { Link } from 'wouter'
import { cn } from '@/lib/utils'

const expeditions = [
  { id: 'ANT-47', name: 'Antarctica Summer Expedition 2026', status: 'Active', region: 'Antarctica', personnel: 82, cargo: 156, duration: '120 days', objective: 'Climate monitoring & ice-core research' },
  { id: 'ARC-12', name: 'Arctic Climate Monitoring', status: 'Planning', region: 'Arctic', personnel: 24, cargo: 48, duration: '90 days', objective: 'Sea-ice & permafrost studies' },
  { id: 'ANT-46', name: 'Winter-over 2025-26', status: 'Completed', region: 'Antarctica', personnel: 45, cargo: 90, duration: '365 days', objective: 'Year-round station operations' },
  { id: 'ANT-48', name: 'Bharati Resupply Mission', status: 'Planning', region: 'Antarctica', personnel: 18, cargo: 62, duration: '45 days', objective: 'Critical fuel & supply run' },
]

const statusStyle: Record<string, string> = {
  Active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  Planning: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  Completed: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  Suspended: 'bg-red-500/15 text-red-400 border-red-500/25',
}

export default function Expeditions() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ice-50 tracking-tight">Expeditions</h1>
          <p className="text-ice-500 text-sm mt-0.5">Plan, monitor and resource polar missions</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-sm text-white font-medium shadow-lg shadow-cyan-600/25">
          <Plus className="w-4 h-4" /> Create Expedition
        </motion.button>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4">
        {expeditions.map((e, i) => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            whileHover={{ y: -4 }}
            className="group glass rounded-2xl border border-ice-800/50 p-5 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-mono text-xs text-cyan-400">{e.id}</span>
                  <h3 className="font-semibold text-ice-50 mt-0.5 group-hover:text-cyan-200 transition-colors">{e.name}</h3>
                  <p className="text-xs text-ice-500 mt-1">{e.objective}</p>
                </div>
                <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider border', statusStyle[e.status])}>
                  {e.status}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-3 text-xs text-ice-400 mb-4">
                <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-cyan-500/70" /> {e.personnel} pax</div>
                <div className="flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-cyan-500/70" /> {e.cargo} cargo</div>
                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-cyan-500/70" /> {e.duration}</div>
              </div>
              <Link href={`/expeditions/${e.id}`}>
                <a className="inline-flex items-center gap-1 text-sm text-cyan-400 hover:text-cyan-300 font-medium">
                  View Expedition <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
