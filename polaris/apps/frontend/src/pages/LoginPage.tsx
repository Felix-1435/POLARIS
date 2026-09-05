import { useState } from 'react'
import { motion } from 'framer-motion'
import { Snowflake, Map, Package, Users, AlertTriangle, Bot, ArrowRight, Sun, Moon } from 'lucide-react'
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

export default function LoginPage() {
  const { login } = useAuth()
  const { theme, toggle } = useTheme()
  const [email, setEmail] = useState('commander@ncpor.gov.in')
  const [password, setPassword] = useState('polaris2026')
  const [loading, setLoading] = useState(false)

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
    }, 600)
  }

  const isDark = theme === 'dark'

  return (
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden ${isDark ? 'bg-ice-950' : 'bg-slate-100'}`}>
      {isDark && <div className="absolute inset-0 aurora-bg opacity-50" />}
      <div className={`absolute inset-0 ${isDark ? 'bg-[radial-gradient(ellipse_at_center,transparent_0%,#020617_70%)]' : 'bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.8)_0%,#f1f5f9_70%)]'}`} />

      {/* Theme toggle */}
      <button
        onClick={toggle}
        className={`absolute top-4 right-4 z-20 p-2.5 rounded-xl border transition-colors ${
          isDark ? 'bg-ice-900/80 border-ice-700 text-ice-300 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm'
        }`}
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-md mx-4">
        <div className={`rounded-2xl p-8 shadow-2xl border ${
          isDark ? 'glass-strong border-cyan-500/20' : 'bg-white border-slate-200 shadow-xl'
        }`}>
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30 mb-4">
              <Snowflake className="w-8 h-8 text-white" />
            </div>
            <h1 className={`text-3xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent`}>
              POLARIS
            </h1>
            <p className={`text-sm mt-1 ${isDark ? 'text-ice-400' : 'text-slate-500'}`}>NCPOR Polar Expedition Command System</p>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-ice-600' : 'text-slate-400'}`}>Ministry of Earth Sciences · SIH 26062</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-ice-400' : 'text-slate-500'}`}>Email / ID</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className={`w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-cyan-500/40 ${
                  isDark ? 'bg-ice-900/70 border-ice-700 text-ice-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${isDark ? 'text-ice-400' : 'text-slate-500'}`}>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className={`w-full rounded-lg px-3 py-2.5 text-sm border focus:outline-none focus:ring-2 focus:ring-cyan-500/40 ${
                  isDark ? 'bg-ice-900/70 border-ice-700 text-ice-100' : 'bg-slate-50 border-slate-200 text-slate-900'
                }`}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-cyan-600/25 disabled:opacity-60"
            >
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Enter Command Center <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className={`mt-6 pt-5 border-t ${isDark ? 'border-ice-800' : 'border-slate-200'}`}>
            <p className={`text-[11px] text-center mb-3 ${isDark ? 'text-ice-500' : 'text-slate-400'}`}>Demo Accounts (click to fill)</p>
            <div className="grid gap-1.5">
              {DEMO_USERS.map(u => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => { setEmail(u.email); setPassword(u.password) }}
                  className={`text-left text-xs px-3 py-2 rounded-lg border transition-colors ${
                    isDark
                      ? 'bg-ice-900/40 hover:bg-ice-800/60 border-ice-800/50 text-ice-400 hover:text-ice-200'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span className={`font-medium ${isDark ? 'text-ice-300' : 'text-slate-800'}`}>{u.name}</span>
                  <span className="mx-1.5 opacity-40">·</span>
                  <span>{u.role}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {[
            { icon: Map, label: 'Expeditions' },
            { icon: Package, label: 'Cargo' },
            { icon: Users, label: 'Personnel' },
            { icon: AlertTriangle, label: 'Emergency' },
            { icon: Bot, label: 'AI' },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className={`flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full border ${
              isDark ? 'text-ice-500 bg-ice-900/40 border-ice-800/50' : 'text-slate-500 bg-white border-slate-200'
            }`}>
              <Icon className="w-3 h-3" /> {label}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
