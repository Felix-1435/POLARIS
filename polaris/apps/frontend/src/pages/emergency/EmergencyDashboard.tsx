import { motion } from 'framer-motion'
import { AlertTriangle, Users, MapPin, Heart, Plane } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function EmergencyDashboard() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ice-50 flex items-center gap-2">
            <span className="relative">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            </span>
            Emergency Response
          </h1>
          <p className="text-ice-500 text-sm mt-0.5">SOS · Incidents · Response teams · Evacuation</p>
        </div>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold shadow-lg shadow-red-600/30 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Activate SOS
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Incidents', value: '01', danger: true },
          { label: 'Critical', value: '01', danger: true },
          { label: 'Response Teams', value: '06', danger: false },
          { label: 'Personnel at Risk', value: '02', danger: true },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            whileHover={{ y: -3 }}
            className={cn('glass rounded-2xl p-4 border', s.danger ? 'border-red-500/30 bg-red-500/5' : 'border-ice-800/50')}>
            <p className="text-2xl font-bold text-ice-50 tracking-tight">{s.value}</p>
            <p className="text-xs text-ice-400 mt-0.5">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
        className="glass rounded-2xl border border-red-500/30 overflow-hidden relative">
        <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
        <div className="relative bg-red-500/10 px-5 py-3.5 border-b border-red-500/20 flex items-center justify-between">
          <h2 className="font-semibold text-red-300 flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> INC-0042 — Medical Emergency
          </h2>
          <span className="text-xs text-red-400/80 font-mono">ACTIVE · 14:32 IST</span>
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
            <motion.button whileHover={{ scale: 1.01 }} className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium flex items-center justify-center gap-2">
              <Users className="w-4 h-4" /> Assign / Update Team
            </motion.button>
            <motion.button whileHover={{ scale: 1.01 }} className="w-full py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium flex items-center justify-center gap-2">
              <Plane className="w-4 h-4" /> Start Evacuation
            </motion.button>
            <motion.button whileHover={{ scale: 1.01 }} className="w-full py-2.5 rounded-xl bg-ice-700 hover:bg-ice-600 text-ice-200 text-sm font-medium flex items-center justify-center gap-2">
              <Heart className="w-4 h-4" /> Notify Medical Facility
            </motion.button>
            <button className="w-full py-2.5 rounded-xl border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-sm font-medium">
              Mark Resolved
            </button>
          </div>
        </div>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass rounded-2xl border border-ice-800/50 p-5">
          <h3 className="font-semibold text-ice-100 mb-3 text-sm">Response Team Alpha</h3>
          <div className="space-y-2 text-sm">
            {[['Members', '5'], ['Distance', '4.2 km'], ['Status', 'Responding'], ['Equipment', 'Medical ✓ Comm ✓ Transport ✓']].map(([k, v]) => (
              <div key={k} className="flex justify-between"><span className="text-ice-500">{k}</span><span className="text-ice-200">{v}</span></div>
            ))}
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="glass rounded-2xl border border-ice-800/50 p-5">
          <h3 className="font-semibold text-ice-100 mb-3 text-sm">Evacuation Route</h3>
          <div className="flex items-center gap-2 text-sm text-ice-300 flex-wrap">
            <MapPin className="w-4 h-4 text-red-400" /> Field Camp B
            <span className="text-ice-600">→</span>
            <span>Safe Corridor</span>
            <span className="text-ice-600">→</span>
            <MapPin className="w-4 h-4 text-emerald-400" /> Maitri Medical
          </div>
          <p className="text-xs text-ice-500 mt-3">4.2 km · ETA 18 min · Weather moderate · Vis 3.1 km</p>
        </motion.div>
      </div>
    </div>
  )
}
