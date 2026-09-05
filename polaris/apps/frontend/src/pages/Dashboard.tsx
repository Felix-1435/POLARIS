import { motion } from 'framer-motion'
import { 
  Map, Users, Package, Boxes, AlertTriangle, Activity, 
  Ship, MapPin, TrendingUp, Clock, Thermometer, Wind
} from 'lucide-react'
import { Link } from 'wouter'
import { cn } from '@/lib/utils'

const kpis = [
  { label: 'Active Expeditions', value: '04', icon: Map, color: 'cyan', change: '+1 this season' },
  { label: 'Personnel Deployed', value: '127', icon: Users, color: 'blue', change: '82 at stations' },
  { label: 'Cargo in Transit', value: '17', icon: Package, color: 'amber', change: '5 delayed' },
  { label: 'Inventory Health', value: '92%', icon: Boxes, color: 'emerald', change: '4 critical' },
  { label: 'Active Assets', value: '84', icon: Activity, color: 'purple', change: '3 in maintenance' },
  { label: 'Emergencies', value: '01', icon: AlertTriangle, color: 'red', change: 'Medical - Field Camp B' },
]

const alerts = [
  { type: 'critical', title: 'Fuel projected below threshold', desc: 'Maitri Station — Diesel expected to fall under minimum in 18 days', time: '2 min ago' },
  { type: 'warning', title: 'Cargo ANT-045 delayed', desc: 'Ship MV Sagar Kanya — ETA slipped by 14 hours due to weather', time: '28 min ago' },
  { type: 'info', title: 'Team Bravo check-in complete', desc: 'All 8 members of Research Team Bravo confirmed at Field Camp A', time: '1 hr ago' },
]

const locations = [
  { name: 'Maitri Station', type: 'station', personnel: 82, cargo: 124, status: 'operational', lat: -70.76, lon: 11.73 },
  { name: 'Bharati Station', type: 'station', personnel: 31, cargo: 68, status: 'operational', lat: -69.40, lon: 76.19 },
  { name: 'Field Camp B', type: 'camp', personnel: 8, cargo: 12, status: 'alert', lat: -71.2, lon: 12.1 },
  { name: 'MV Sagar Kanya', type: 'ship', personnel: 6, cargo: 17, status: 'transit', lat: -45.0, lon: 50.0 },
]

export default function Dashboard() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-ice-50 tracking-tight">Polar Command Center</h1>
          <p className="text-ice-500 text-sm mt-0.5">Real-time operational overview • ANT-47 Active Season</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
          </span>
          <span className="text-ice-600">Updated just now</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon
          const colorMap: Record<string, string> = {
            cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/30 text-cyan-400',
            blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400',
            amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400',
            emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
            purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400',
            red: 'from-red-500/20 to-red-600/5 border-red-500/30 text-red-400',
          }
          return (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                "card-3d glass rounded-xl p-4 border bg-gradient-to-br",
                colorMap[kpi.color]
              )}
            >
              <div className="flex items-start justify-between">
                <Icon className="w-5 h-5 opacity-80" />
                <span className="text-[10px] opacity-60">{kpi.change}</span>
              </div>
              <p className="text-2xl font-bold mt-3 text-ice-50">{kpi.value}</p>
              <p className="text-xs text-ice-400 mt-0.5">{kpi.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Map Section */}
        <div className="xl:col-span-2 glass rounded-xl border border-ice-800/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-ice-800/50 flex items-center justify-between">
            <h2 className="font-semibold text-ice-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-cyan-400" /> Operational Map
            </h2>
            <div className="flex gap-2 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Station</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Camp</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> Vessel</span>
            </div>
          </div>
          <div className="relative h-[340px] bg-gradient-to-b from-ice-900/80 to-ice-950 flex items-center justify-center overflow-hidden">
            {/* Simplified polar map visualization */}
            <div className="absolute inset-0 opacity-30">
              <svg viewBox="0 0 800 400" className="w-full h-full">
                <defs>
                  <radialGradient id="polarGrad" cx="50%" cy="70%" r="60%">
                    <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#020617" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <ellipse cx="400" cy="280" rx="280" ry="120" fill="url(#polarGrad)" />
                {/* Antarctica shape simplified */}
                <path d="M200,300 Q300,200 400,220 T600,300 Q500,350 400,340 T200,300" fill="rgba(148,163,184,0.15)" stroke="rgba(148,163,184,0.3)" strokeWidth="1" />
              </svg>
            </div>
            
            {/* Location markers */}
            {locations.map((loc, i) => {
              const positions: Record<string, { left: string; top: string }> = {
                'Maitri Station': { left: '42%', top: '58%' },
                'Bharati Station': { left: '68%', top: '52%' },
                'Field Camp B': { left: '38%', top: '62%' },
                'MV Sagar Kanya': { left: '55%', top: '32%' },
              }
              const pos = positions[loc.name]
              const color = loc.status === 'alert' ? 'bg-red-500' : loc.type === 'ship' ? 'bg-blue-500' : 'bg-emerald-500'
              return (
                <motion.div
                  key={loc.name}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                  style={pos}
                >
                  <div className={cn("w-4 h-4 rounded-full border-2 border-white shadow-lg pin-pulse", color)} />
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <div className="glass-strong rounded-lg px-3 py-2 text-xs whitespace-nowrap border border-ice-700 shadow-xl">
                      <p className="font-semibold text-ice-100">{loc.name}</p>
                      <p className="text-ice-400">{loc.personnel} personnel · {loc.cargo} cargo</p>
                    </div>
                  </div>
                </motion.div>
              )
            })}

            {/* Legend labels */}
            <div className="absolute bottom-4 left-4 text-[10px] text-ice-500 space-y-0.5">
              <p>🇮🇳 India → 🚢 Southern Ocean → 🇦🇶 Antarctica</p>
            </div>
          </div>
        </div>

        {/* Alerts Panel */}
        <div className="glass rounded-xl border border-ice-800/50 flex flex-col">
          <div className="px-5 py-3 border-b border-ice-800/50">
            <h2 className="font-semibold text-ice-100 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Alert Panel
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {alerts.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className={cn(
                  "rounded-lg p-3 border text-sm",
                  a.type === 'critical' && "bg-red-500/10 border-red-500/30",
                  a.type === 'warning' && "bg-amber-500/10 border-amber-500/30",
                  a.type === 'info' && "bg-blue-500/10 border-blue-500/30",
                )}
              >
                <div className="flex items-start gap-2">
                  <span className={cn(
                    "mt-0.5 w-2 h-2 rounded-full shrink-0",
                    a.type === 'critical' && "bg-red-500 status-critical",
                    a.type === 'warning' && "bg-amber-500",
                    a.type === 'info' && "bg-blue-500",
                  )} />
                  <div>
                    <p className="font-medium text-ice-100 text-xs">{a.title}</p>
                    <p className="text-ice-400 text-[11px] mt-0.5 leading-relaxed">{a.desc}</p>
                    <p className="text-ice-600 text-[10px] mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {a.time}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="p-3 border-t border-ice-800/50">
            <Link href="/ai">
              <a className="block text-center text-xs text-cyan-400 hover:text-cyan-300 font-medium py-1.5 rounded-lg hover:bg-cyan-500/10 transition-colors">
                View AI Operational Summary →
              </a>
            </Link>
          </div>
        </div>
      </div>

      {/* AI Summary + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-xl border border-cyan-500/20 p-5 bg-gradient-to-br from-cyan-500/5 to-transparent">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-cyan-400" />
            </div>
            <h3 className="font-semibold text-ice-100">AI Operational Summary</h3>
          </div>
          <div className="space-y-2 text-sm text-ice-300 leading-relaxed">
            <p>Expedition <span className="text-cyan-300 font-medium">ANT-47</span> is operating normally across both stations.</p>
            <p><span className="text-emerald-400 font-medium">92%</span> of critical supplies are available. One high-priority cargo shipment (ANT-045) is delayed by weather.</p>
            <p className="text-amber-300">⚠️ Diesel at Maitri projected to reach minimum threshold in ~18 days. Recommend prioritising next fuel shipment.</p>
            <p className="text-red-300">🚨 1 active medical incident at Field Camp B. Response Team Alpha deployed. ETA 18 min.</p>
          </div>
        </div>

        <div className="glass rounded-xl border border-ice-800/50 p-5">
          <h3 className="font-semibold text-ice-100 mb-3">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { href: '/cargo/scan', label: 'Scan Cargo', icon: Package, color: 'cyan' },
              { href: '/emergency', label: 'Emergency Desk', icon: AlertTriangle, color: 'red' },
              { href: '/personnel', label: 'Check-ins', icon: Users, color: 'blue' },
              { href: '/ai', label: 'Ask AI Commander', icon: Activity, color: 'purple' },
            ].map(a => {
              const Icon = a.icon
              return (
                <Link key={a.href} href={a.href}>
                  <a className="flex items-center gap-2 p-3 rounded-lg bg-ice-900/50 border border-ice-800 hover:border-cyan-500/40 hover:bg-ice-800/50 transition-all text-sm text-ice-300 hover:text-ice-100">
                    <Icon className="w-4 h-4 text-cyan-400" />
                    {a.label}
                  </a>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
