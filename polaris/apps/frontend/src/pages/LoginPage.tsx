import { useState, useEffect } from 'react'
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion'
import {
  Snowflake, Map, Package, Users, AlertTriangle, Bot,
  ArrowRight, Sun, Moon, Shield, Radar, Ship, Globe2
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth, useTheme } from '../App'

const DEMO_USERS = [
  { email: 'commander@ncpor.gov.in', password: 'polaris2026', name: 'Dr. Rajesh Mehta', role: 'Expedition Commander' },
  { email: 'logistics@ncpor.gov.in', password: 'polaris2026', name: 'Anita Sharma', role: 'Logistics Officer' },
  { email: 'safety@ncpor.gov.in', password: 'polaris2026', name: 'Capt. Vikram Singh', role: 'Safety Officer' },
  { email: 'medical@ncpor.gov.in', password: 'polaris2026', name: 'Dr. Priya Nair', role: 'Medical Officer' },
  { email: 'field@ncpor.gov.in', password: 'polaris2026', name: 'Suresh Reddy', role: 'Field Team Lead' },
  { email: 'admin@ncpor.gov.in', password: 'polaris2026', name: 'System Admin', role: 'Administrator' },
]

const FLOAT_ICONS = [
  { Icon: Snowflake, x: '8%', y: '15%', delay: 0, size: 28 },
  { Icon: Ship, x: '85%', y: '20%', delay: 0.4, size: 24 },
  { Icon: Globe2, x: '12%', y: '70%', delay: 0.8, size: 26 },
  { Icon: Radar, x: '78%', y: '65%', delay: 1.2, size: 22 },
  { Icon: Package, x: '90%', y: '45%', delay: 0.6, size: 20 },
  { Icon: Map, x: '5%', y: '40%', delay: 1.0, size: 22 },
]

export default function LoginPage() {
  const { login } = useAuth()
  const { theme, toggle } = useTheme()
  const [email, setEmail] = useState('commander@ncpor.gov.in')
  const [password, setPassword] = useState('polaris2026')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)

  // Subtle 3D tilt on card
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const rotateX = useTransform(my, [-80, 80], [6, -6])
  const rotateY = useTransform(mx, [-80, 80], [-6, 6])

  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % 3), 4000)
    return () => clearInterval(t)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      const user = DEMO_USERS.find(u => u.email === email && u.password === password)
      if (user) {
        toast.success(`Welcome, ${user.name}`)
        login({ name: user.name, role: user.role, email: user.email })
      } else {
        toast.error('Invalid credentials. Select a demo account.')
      }
      setLoading(false)
    }, 700)
  }

  const isDark = theme === 'dark'

  const headlines = [
    'Plan · Track · Respond',
    'AI-Powered Polar Command',
    'From Goa to Maitri — One System',
  ]

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden ${isDark ? 'bg-[#020617]' : 'bg-slate-100'}`}>
      {/* Deep space / ice gradient */}
      <div className={`absolute inset-0 ${isDark
        ? 'bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(14,165,233,0.25),transparent),radial-gradient(ellipse_60%_40%_at_80%_60%,rgba(99,102,241,0.12),transparent)]'
        : 'bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(14,165,233,0.15),transparent)]'
      }`} />

      {/* Animated aurora band */}
      {isDark && (
        <motion.div
          className="absolute inset-x-0 top-0 h-64 opacity-30 pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(34,211,238,0.4), rgba(167,139,250,0.3), rgba(34,211,238,0.4), transparent)',
            filter: 'blur(40px)',
          }}
          animate={{ x: ['-20%', '20%', '-20%'] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Grid floor perspective */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: isDark
            ? 'linear-gradient(rgba(34,211,238,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.5) 1px, transparent 1px)'
            : 'linear-gradient(rgba(14,165,233,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(14,165,233,0.3) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          transform: 'perspective(500px) rotateX(60deg) translateY(-10%) scale(2)',
          transformOrigin: 'center top',
        }}
      />

      {/* Floating 3D-ish icons */}
      {FLOAT_ICONS.map(({ Icon, x, y, delay, size }, i) => (
        <motion.div
          key={i}
          className={`absolute pointer-events-none ${isDark ? 'text-cyan-400/20' : 'text-cyan-600/15'}`}
          style={{ left: x, top: y }}
          animate={{
            y: [0, -18, 0],
            rotateZ: [0, 8, -8, 0],
            opacity: [0.15, 0.35, 0.15],
          }}
          transition={{ duration: 5 + i, repeat: Infinity, delay, ease: 'easeInOut' }}
        >
          <Icon style={{ width: size, height: size }} />
        </motion.div>
      ))}

      {/* Theme toggle */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={toggle}
        className={`absolute top-5 right-5 z-20 p-2.5 rounded-xl border backdrop-blur-md transition-colors ${
          isDark
            ? 'bg-white/5 border-white/10 text-ice-300 hover:text-amber-300 hover:bg-white/10'
            : 'bg-white/80 border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
        }`}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </motion.button>

      {/* SIH badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`absolute top-5 left-5 z-20 text-[11px] px-3 py-1.5 rounded-full border backdrop-blur-md ${
          isDark ? 'bg-white/5 border-white/10 text-ice-400' : 'bg-white/80 border-slate-200 text-slate-500'
        }`}
      >
        SIH 26062 · MoES · NCPOR
      </motion.div>

      <div className="relative z-10 w-full max-w-5xl mx-4 grid lg:grid-cols-2 gap-10 items-center py-12">
        {/* Left — branding / story */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:block space-y-6"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-xl shadow-cyan-500/40">
                <Snowflake className="w-7 h-7 text-white" />
              </div>
              <motion.div
                className="absolute -inset-1 rounded-2xl border border-cyan-400/40"
                animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-300 bg-clip-text text-transparent">
                POLARIS
              </h1>
              <p className={`text-xs font-medium tracking-widest uppercase ${isDark ? 'text-ice-500' : 'text-slate-400'}`}>
                Polar Command System
              </p>
            </div>
          </div>

          <div className="h-16 overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.h2
                key={step}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`text-2xl font-semibold leading-snug ${isDark ? 'text-white' : 'text-slate-800'}`}
              >
                {headlines[step]}
              </motion.h2>
            </AnimatePresence>
          </div>

          <p className={`text-sm leading-relaxed max-w-md ${isDark ? 'text-ice-400' : 'text-slate-500'}`}>
            Centralized digital platform for expedition planning, cargo tracking, inventory,
            personnel movement and emergency response — built for NCPOR polar operations.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            {[
              { icon: Map, label: 'Expedition Planning', sub: 'AI-assisted logistics' },
              { icon: Package, label: 'Cargo & Containers', sub: 'End-to-end visibility' },
              { icon: Users, label: 'Personnel', sub: 'Live movement & check-in' },
              { icon: AlertTriangle, label: 'Emergency', sub: 'Real-time command' },
            ].map(({ icon: Icon, label, sub }) => (
              <motion.div
                key={label}
                whileHover={{ scale: 1.03, y: -2 }}
                className={`p-3 rounded-xl border backdrop-blur-sm ${
                  isDark
                    ? 'bg-white/[0.03] border-white/10 hover:border-cyan-500/30'
                    : 'bg-white/70 border-slate-200 hover:border-cyan-300 shadow-sm'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1.5 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                <p className={`text-xs font-semibold ${isDark ? 'text-ice-100' : 'text-slate-800'}`}>{label}</p>
                <p className={`text-[10px] ${isDark ? 'text-ice-500' : 'text-slate-400'}`}>{sub}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Right — 3D login card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          style={{ perspective: 1000 }}
          className="w-full max-w-md mx-auto"
        >
          <motion.div
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            onMouseMove={e => {
              const rect = e.currentTarget.getBoundingClientRect()
              mx.set(e.clientX - rect.left - rect.width / 2)
              my.set(e.clientY - rect.top - rect.height / 2)
            }}
            onMouseLeave={() => { mx.set(0); my.set(0) }}
            className={`relative rounded-3xl p-8 border backdrop-blur-xl shadow-2xl ${
              isDark
                ? 'bg-slate-900/80 border-white/10 shadow-cyan-500/10'
                : 'bg-white/90 border-slate-200/80 shadow-slate-300/40'
            }`}
          >
            {/* Glow ring */}
            <div className={`absolute -inset-px rounded-3xl opacity-60 pointer-events-none ${
              isDark
                ? 'bg-gradient-to-b from-cyan-500/20 via-transparent to-indigo-500/10'
                : 'bg-gradient-to-b from-cyan-400/15 via-transparent to-blue-400/10'
            }`} />

            <div className="relative" style={{ transform: 'translateZ(20px)' }}>
              {/* Mobile logo */}
              <div className="lg:hidden text-center mb-6">
                <div className="inline-flex w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 items-center justify-center shadow-lg shadow-cyan-500/30 mb-2">
                  <Snowflake className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">POLARIS</h1>
              </div>

              <div className="flex items-center gap-2 mb-6">
                <Shield className={`w-4 h-4 ${isDark ? 'text-cyan-400' : 'text-cyan-600'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-ice-200' : 'text-slate-700'}`}>
                  Secure Command Access
                </span>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-ice-400' : 'text-slate-500'}`}>
                    Email / Officer ID
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-shadow ${
                      isDark
                        ? 'bg-slate-950/60 border-white/10 text-white placeholder:text-slate-600'
                        : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                    }`}
                    placeholder="commander@ncpor.gov.in"
                  />
                </div>
                <div>
                  <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-ice-400' : 'text-slate-500'}`}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className={`w-full rounded-xl px-3.5 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-cyan-500/40 transition-shadow ${
                      isDark
                        ? 'bg-slate-950/60 border-white/10 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full relative overflow-hidden rounded-xl py-3 font-semibold text-white flex items-center justify-center gap-2 disabled:opacity-60"
                  style={{
                    background: 'linear-gradient(135deg, #0891b2, #2563eb, #4f46e5)',
                    boxShadow: '0 8px 32px rgba(14,165,233,0.35)',
                  }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>Enter Command Center <ArrowRight className="w-4 h-4" /></>
                  )}
                </motion.button>
              </form>

              <div className={`mt-6 pt-5 border-t ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                <p className={`text-[11px] text-center mb-3 ${isDark ? 'text-ice-500' : 'text-slate-400'}`}>
                  Demo accounts — click to fill
                </p>
                <div className="grid gap-1.5 max-h-40 overflow-y-auto pr-1">
                  {DEMO_USERS.map(u => (
                    <button
                      key={u.email}
                      type="button"
                      onClick={() => { setEmail(u.email); setPassword(u.password) }}
                      className={`text-left text-xs px-3 py-2 rounded-lg border transition-all ${
                        isDark
                          ? 'bg-white/[0.03] hover:bg-cyan-500/10 border-white/5 hover:border-cyan-500/30 text-ice-400 hover:text-ice-100'
                          : 'bg-slate-50 hover:bg-cyan-50 border-slate-100 hover:border-cyan-200 text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <span className={`font-medium ${isDark ? 'text-ice-200' : 'text-slate-800'}`}>{u.name}</span>
                      <span className="mx-1.5 opacity-40">·</span>
                      <span>{u.role}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {[
              { icon: Map, label: 'Expeditions' },
              { icon: Package, label: 'Cargo' },
              { icon: Users, label: 'Personnel' },
              { icon: AlertTriangle, label: 'Emergency' },
              { icon: Bot, label: 'AI' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border backdrop-blur-sm ${
                  isDark ? 'text-ice-500 bg-white/5 border-white/10' : 'text-slate-500 bg-white/80 border-slate-200'
                }`}
              >
                <Icon className="w-3 h-3" /> {label}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  )
}
