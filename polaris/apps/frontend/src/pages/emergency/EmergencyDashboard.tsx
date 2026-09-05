import { motion } from 'framer-motion'
import { AlertTriangle, Users, Clock, MapPin, Siren, Ambulance, Helicopter } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function EmergencyDashboard() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ice-50 flex items-center gap-2">
            <Siren className="w-6 h-6 text-red-400 animate-pulse" /> Emergency Response
          </h1>
          <p className="text-ice-500 text-sm">SOS, incidents, response teams & evacuation</p>
        </div>
        <button className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-semibold shadow-lg shadow-red-600/30 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Activate SOS
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Active Incidents', value: '01', color: 'red' },
          { label: 'Critical', value: '01', color: 'red' },
          { label: 'Response Teams', value: '06', color: 'blue' },
          { label: 'Personnel at Risk', value: '02', color: 'amber' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className={cn("glass rounded-xl p-4 border", s.color === 'red' ? "border-red-500/30 bg-red-500/5" : "border-ice-800/50")}>
            <p className="text-2xl font-bold text-ice-50">{s.value}</p>
            <p className="text-xs text-ice-400">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Active Incident */}
      <div className="glass rounded-xl border border-red-500/30 overflow-hidden glow-red">
        <div className="bg-red-500/10 px-5 py-3 border-b border-red-500/20 flex items-center justify-between">
          <h2 className="font-semibold text-red-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> INC-0042 — Medical Emergency
          </h2>
          <span className="text-xs text-red-400 font-mono">ACTIVE · 14:32 IST</span>
        </div>
        <div className="p-5 grid md:grid-cols-2 gap-6">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-ice-500">Person</span><span className="text-ice-100">P-034 · S. Reddy</span></div>
            <div className="flex justify-between"><span className="text-ice-500">Location</span><span className="text-ice-100">Field Camp B</span></div>
            <div className="flex justify-between"><span className="text-ice-500">Type</span><span className="text-red-300">Medical · Critical</span></div>
            <div className="flex justify-between"><span className="text-ice-500">Response Team</span><span className="text-cyan-300">Alpha (5 members)</span></div>
            <div className="flex justify-between"><span className="text-ice-500">ETA</span><span className="text-amber-300 font-medium">18 min</span></div>
            <div className="flex justify-between"><span className="text-ice-500">Evacuation</span><span className="text-ice-100">Required → Maitri Medical</span></div>
          </div>
          <div className="space-y-2">
            <button className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium flex items-center justify-center gap-2">
              <Users className="w-4 h-4" /> Assign / Update Team
            </button>
            <button className="w-full py-2.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium flex items-center justify-center gap-2">
              <Helicopter className="w-4 h-4" /> Start Evacuation
            </button>
            <button className="w-full py-2.5 rounded-lg bg-ice-700 hover:bg-ice-600 text-ice-200 text-sm font-medium flex items-center justify-center gap-2">
              <Ambulance className="w-4 h-4" /> Notify Medical Facility
            </button>
            <button className="w-full py-2.5 rounded-lg border border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 text-sm font-medium">
              Mark Resolved
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="glass rounded-xl border border-ice-800/50 p-5">
          <h3 className="font-semibold text-ice-100 mb-3">Response Team Alpha</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-ice-500">Members</span><span className="text-ice-200">5</span></div>
            <div className="flex justify-between"><span className="text-ice-500">Distance</span><span className="text-ice-200">4.2 km</span></div>
            <div className="flex justify-between"><span className="text-ice-500">Status</span><span className="text-amber-300">Responding</span></div>
            <div className="flex justify-between"><span className="text-ice-500">Equipment</span><span className="text-emerald-400">Medical Kit ✓ Comm ✓ Transport ✓</span></div>
          </div>
        </div>
        <div className="glass rounded-xl border border-ice-800/50 p-5">
          <h3 className="font-semibold text-ice-100 mb-3">Evacuation Route</h3>
          <div className="flex items-center gap-2 text-sm text-ice-300">
            <MapPin className="w-4 h-4 text-red-400" /> Field Camp B
            <span className="text-ice-600">→</span>
            <span>Safe Corridor</span>
            <span className="text-ice-600">→</span>
            <MapPin className="w-4 h-4 text-emerald-400" /> Maitri Medical
          </div>
          <p className="text-xs text-ice-500 mt-3">Distance: 4.2 km · ETA: 18 min · Weather: Moderate · Visibility: 3.1 km</p>
        </div>
      </div>
    </div>
  )
}
