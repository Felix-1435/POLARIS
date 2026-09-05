import { motion } from 'framer-motion'
import {
  Map, Users, Package, Boxes, AlertTriangle, Activity,
  MapPin, Clock, Ship, ArrowUpRight, Sparkles
} from 'lucide-react'
import { Link } from 'wouter'
import { cn } from '@/lib/utils'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }
  })
}

const kpis = [
  { label: 'Active Expeditions', value: '04', icon: Map, color: 'cyan', change: '+1 this season' },
  { label: 'Personnel Deployed', value: '127', icon: Users, color: 'blue', change: '82 at stations' },
  { label: 'Cargo in Transit', value: '17', icon: Package, color: 'amber', change: '5 delayed' },
  { label: 'Inventory Health', value: '92%', icon: Boxes, color: 'emerald', change: '4 critical' },
  { label: 'Active Assets', value: '84', icon: Activity, color: 'purple', change: '3 maintenance' },
  { label: 'Emergencies', value: '01', icon: AlertTriangle, color: 'red', change: 'Medical — Camp B' },
]

const alerts = [
  { type: 'critical', title: 'Fuel projected below threshold', desc: 'Maitri Station — Diesel under minimum in ~18 days', time: '2 min ago' },
  { type: 'warning', title: 'Cargo ANT-015 delayed', desc: 'Aviation fuel — ETA slipped due to Southern Ocean weather', time: '28 min ago' },
  { type: 'info', title: 'Team Bravo check-in complete', desc: 'All 8 members confirmed at Field Camp A', time: '1 hr ago' },
]

const locations = [
  { name: 'Maitri', personnel: 82, cargo: 124, status: 'operational', left: '42%', top: '58%' },
  { name: 'Bharati', personnel: 31, cargo: 68, status: 'operational', left: '68%', top: '52%' },
  { name: 'Field Camp B', personnel: 8, cargo: 12, status: 'alert', left: '38%', top: '62%' },
  { name: 'MV Sagar Kanya', personnel: 6, cargo: 17, status: 'transit', left: '55%', top: '32%' },
]

const colorMap: Record<string, string> = {
  cyan: 'from-cyan-500/20 to-cyan-600/5 border-cyan-500/30 text-cyan-400',
  blue: 'from-blue-500/20 to-blue-600/5 border-blue-500/30 text-blue-400',
  amber: 'from-amber-500/20 to-amber-600/5 border-amber-500/30 text-amber-400',
  emerald: 'from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 text-emerald-400',
  purple: 'from-purple-500/20 to-purple-600/5 border-purple-500/30 text-purple-400',
  red: 'from-red-500/20 to-red-600/5 border-red-500/30 text-red-400',
}

export default function Dashboard() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      {/* Hero header */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-cyan-500/20 p-6 md:p-8"
        style={{
          background: 'linear-gradient(135deg, rgba(14,165,233,0.12) 0%, rgba(37,99,235,0.08) 50%, rgba(79,70,229,0.06) 100%)',
        }}
      >
        <div className="absolute inset-0 opacity-30 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(34,211,238,0.25), transparent 50%)' }} />
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 text-[11px] font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
              </span>
              <span className="text-[11px] text-ice-500">ANT-47 Active Season</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-ice-50 tracking-tight">Polar Command Center</h1>
            <p className="text-ice-400 text-sm mt-1 max-w-lg">Real-time operational overview across expeditions, logistics, personnel and emergency response.</p>
          </div>
          <Link href="/ai">
            <a className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium shadow-lg shadow-cyan-600/25 hover:shadow-cyan-500/40 transition-shadow">
              <Sparkles className="w-4 h-4" /> Ask AI Commander
            </a>
          </Link>
        </div>
      </motion.div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {kpis.map((kpi, i) => {
          const Icon = kpi.icon
          return (
            <motion.div
              key={kpi.label}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              animate="show"
              whileHover={{ y: -4, scale: 1.02 }}
              className={cn(
                'card-3d glass rounded-2xl p-4 border bg-gradient-to-br cursor-default',
                colorMap[kpi.color]
              )}
            >
              <div className="flex items-start justify-between">
                <div className="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center">
                  <Icon className="w-4.5 h-4.5 opacity-90" />
                </div>
                <span className="text-[10px] opacity-60 text-right max-w-[70px] leading-tight">{kpi.change}</span>
              </div>
              <p className="text-2xl font-bold mt-3 text-ice-50 tracking-tight">{kpi.value}</p>
              <p className="text-xs text-ice-400 mt-0.5">{kpi.label}</p>
            </motion.div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Map */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="xl:col-span-2 glass rounded-2xl border border-ice-800/50 overflow-hidden"
        >
          <div className="px-5 py-3.5 border-b border-ice-800/50 flex items-center justify-between">
            <h2 className="font-semibold text-ice-100 flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-cyan-400" /> Operational Theatre
            </h2>
            <div className="flex gap-3 text-[10px] text-ice-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Station</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" /> Camp</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400" /> Vessel</span>
            </div>
          </div>
          <div className="relative h-[340px] bg-gradient-to-b from-ice-900/60 to-ice-950 overflow-hidden">
            <svg viewBox="0 0 800 400" className="absolute inset-0 w-full h-full opacity-40">
              <defs>
                <radialGradient id="pg" cx="50%" cy="70%" r="55%">
                  <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#020617" stopOpacity="0" />
                </radialGradient>
              </defs>
              <ellipse cx="400" cy="280" rx="300" ry="130" fill="url(#pg)" />
              <path d="M180,300 Q300,190 400,210 T620,300 Q500,360 400,350 T180,300" fill="rgba(148,163,184,0.12)" stroke="rgba(34,211,238,0.2)" strokeWidth="1" />
            </svg>
            {locations.map((loc, i) => (
              <motion.div
                key={loc.name}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1, type: 'spring', stiffness: 200 }}
                className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
                style={{ left: loc.left, top: loc.top }}
              >
                <div className={cn(
                  'w-4 h-4 rounded-full border-2 border-white shadow-lg pin-pulse',
                  loc.status === 'alert' ? 'bg-red-500' : loc.status === 'transit' ? 'bg-blue-500' : 'bg-emerald-500'
                )} />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="glass-strong rounded-lg px-3 py-2 text-xs whitespace-nowrap border border-ice-700 shadow-xl">
                    <p className="font-semibold text-ice-100">{loc.name}</p>
                    <p className="text-ice-400">{loc.personnel} pax · {loc.cargo} cargo</p>
                  </div>
                </div>
              </motion.div>
            ))}
            <div className="absolute bottom-3 left-4 text-[10px] text-ice-600 flex items-center gap-1.5">
              <Ship className="w-3 h-3" /> India → Southern Ocean → Antarctica
            </div>
          </div>
        </motion.div>

        {/* Alerts */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl border border-ice-800/50 flex flex-col"
        >
          <div className="px-5 py-3.5 border-b border-ice-800/50">
            <h2 className="font-semibold text-ice-100 flex items-center gap-2 text-sm">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Alert Feed
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {alerts.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                whileHover={{ scale: 1.01 }}
                className={cn(
                  'rounded-xl p-3 border text-sm',
                  a.type === 'critical' && 'bg-red-500/10 border-red-500/25',
                  a.type === 'warning' && 'bg-amber-500/10 border-amber-500/25',
                  a.type === 'info' && 'bg-blue-500/10 border-blue-500/25',
                )}
              >
                <div className="flex items-start gap-2">
                  <span className={cn(
                    'mt-1 w-2 h-2 rounded-full shrink-0',
                    a.type === 'critical' && 'bg-red-500 animate-pulse',
                    a.type === 'warning' && 'bg-amber-500',
                    a.type === 'info' && 'bg-blue-500',
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
              <a className="flex items-center justify-center gap-1 text-center text-xs text-cyan-400 hover:text-cyan-300 font-medium py-1.5 rounded-lg hover:bg-cyan-500/10 transition-colors">
                AI Operational Summary <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* AI strip + quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="glass rounded-2xl border border-cyan-500/20 p-5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              <h3 className="font-semibold text-ice-100 text-sm">AI Operational Summary</h3>
            </div>
            <div className="space-y-2 text-sm text-ice-300 leading-relaxed">
              <p>Expedition <span className="text-cyan-300 font-medium">ANT-47</span> operating normally across both stations.</p>
              <p><span className="text-emerald-400 font-medium">92%</span> critical supplies available. One high-priority shipment delayed by weather.</p>
              <p className="text-amber-300/90">⚠️ Diesel at Maitri — shortage projected in ~18 days.</p>
              <p className="text-red-300/90">🚨 1 active medical incident at Field Camp B. Response Team Alpha deployed.</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-2xl border border-ice-800/50 p-5"
        >
          <h3 className="font-semibold text-ice-100 mb-3 text-sm">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { href: '/cargo/scan', label: 'Scan Cargo', icon: Package },
              { href: '/emergency', label: 'Emergency Desk', icon: AlertTriangle },
              { href: '/personnel', label: 'Personnel', icon: Users },
              { href: '/ai', label: 'AI Commander', icon: Sparkles },
            ].map(a => {
              const Icon = a.icon
              return (
                <Link key={a.href} href={a.href}>
                  <motion.a
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2.5 p-3.5 rounded-xl bg-ice-900/40 border border-ice-800 hover:border-cyan-500/40 hover:bg-cyan-500/5 transition-colors text-sm text-ice-300 hover:text-ice-100 cursor-pointer"
                  >
                    <Icon className="w-4 h-4 text-cyan-400" />
                    {a.label}
                  </motion.a>
                </Link>
              )
            })}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
