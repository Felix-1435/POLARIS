import { useState } from 'react'
import { motion } from 'framer-motion'
import { Snowflake, Shield, Map, Package, Users, AlertTriangle, Bot, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'

const demoUsers = [
  { email: 'commander@ncpor.gov.in', password: 'polaris2026', name: 'Dr. Rajesh Mehta', role: 'Expedition Commander' },
  { email: 'logistics@ncpor.gov.in', password: 'polaris2026', name: 'Anita Sharma', role: 'Logistics Officer' },
  { email: 'safety@ncpor.gov.in', password: 'polaris2026', name: 'Capt. Vikram Singh', role: 'Safety Officer' },
]

interface Props {
  onLogin: (name: string, role: string) => void
}

export default function LoginPage({ onLogin }: Props) {
  const [email, setEmail] = useState('commander@ncpor.gov.in')
  const [password, setPassword] = useState('polaris2026')
  const [loading, setLoading] = useState(false)

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      const user = demoUsers.find(u => u.email === email && u.password === password)
      if (user) {
        toast.success(`Welcome back, ${user.name}`)
        onLogin(user.name, user.role)
      } else {
        toast.error('Invalid credentials. Use demo accounts.')
      }
      setLoading(false)
    }, 800)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 aurora-bg opacity-60" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#020617_70%)]" />
      
      {/* Floating ice crystals */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-cyan-400/20"
          style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.5, 0.2], rotate: [0, 180, 360] }}
          transition={{ duration: 8 + Math.random() * 6, repeat: Infinity, delay: i * 0.5 }}
        >
          <Snowflake className="w-6 h-6" />
        </motion.div>
      ))}

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-strong rounded-2xl p-8 shadow-2xl border border-cyan-500/20">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/40 mb-4">
              <Snowflake className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-cyan-200 bg-clip-text text-transparent">
              POLARIS
            </h1>
            <p className="text-ice-400 text-sm mt-1">NCPOR Polar Expedition Command System</p>
            <p className="text-ice-600 text-xs mt-0.5">Ministry of Earth Sciences • SIH 26062</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ice-400 mb-1.5">Email / ID</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-ice-900/70 border border-ice-700 rounded-lg px-3 py-2.5 text-sm text-ice-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
                placeholder="commander@ncpor.gov.in"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-ice-400 mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full bg-ice-900/70 border border-ice-700 rounded-lg px-3 py-2.5 text-sm text-ice-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-600/25 disabled:opacity-60"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Enter Command Center <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-ice-800">
            <p className="text-[11px] text-ice-500 text-center mb-3">Demo Accounts (click to fill)</p>
            <div className="grid gap-1.5">
              {demoUsers.map(u => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => { setEmail(u.email); setPassword(u.password) }}
                  className="text-left text-xs px-3 py-2 rounded-lg bg-ice-900/40 hover:bg-ice-800/60 border border-ice-800/50 text-ice-400 hover:text-ice-200 transition-colors"
                >
                  <span className="font-medium text-ice-300">{u.name}</span>
                  <span className="text-ice-600 mx-1.5">·</span>
                  <span>{u.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Feature pills */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {[
            { icon: Map, label: 'Expeditions' },
            { icon: Package, label: 'Cargo' },
            { icon: Users, label: 'Personnel' },
            { icon: AlertTriangle, label: 'Emergency' },
            { icon: Bot, label: 'AI' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-1.5 text-[11px] text-ice-500 bg-ice-900/40 px-2.5 py-1 rounded-full border border-ice-800/50">
              <Icon className="w-3 h-3" /> {label}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
