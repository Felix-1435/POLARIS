import { useEffect, useState } from 'react'
import { Settings, Users, MapPin, Bell, RefreshCw, Database, Cloud, Bot, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const API_URL = import.meta.env.VITE_API_URL || 'https://polaris-api-ju9u.onrender.com'

type Health = {
  status?: string
  service?: string
  db?: string
  openrouter?: boolean
  time?: string
  error?: string
}

export default function Admin() {
  const [health, setHealth] = useState<Health | null>(null)
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)

  async function check() {
    setChecking(true)
    try {
      const res = await fetch(`${API_URL}/api/health`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setHealth(data)
      toast.success('API health OK')
    } catch (e: any) {
      setHealth({ status: 'error', error: e.message })
      toast.error('API unreachable')
    } finally {
      setLoading(false)
      setChecking(false)
    }
  }

  useEffect(() => { check() }, [])

  const ok = health?.status === 'ok'

  const cards = [
    {
      icon: Cloud,
      title: 'API Status',
      desc: loading ? 'Checking…' : ok ? `Online · ${health?.service || 'POLARIS API'}` : `Offline · ${health?.error || 'error'}`,
      ok,
    },
    {
      icon: Database,
      title: 'Database',
      desc: health?.db === 'neon' ? 'Neon PostgreSQL connected' : health?.db === 'memory' ? 'Memory fallback' : 'Unknown',
      ok: health?.db === 'neon' || health?.db === 'memory',
    },
    {
      icon: Bot,
      title: 'OpenRouter AI',
      desc: health?.openrouter ? 'Connected (server-side key)' : 'Not configured on API',
      ok: !!health?.openrouter,
    },
    {
      icon: Users,
      title: 'Users & Roles',
      desc: 'Demo: Commander · Logistics · Safety (session auth)',
      ok: true,
    },
    {
      icon: MapPin,
      title: 'API Endpoint',
      desc: API_URL,
      ok: true,
    },
    {
      icon: Bell,
      title: 'Last health check',
      desc: health?.time || '—',
      ok: true,
    },
    {
      icon: Settings,
      title: 'System',
      desc: 'SIH 2026 · PS 26062 · NCPOR POLARIS',
      ok: true,
    },
  ]

  return (
    <div className="space-y-6 max-w-[900px] mx-auto">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-ice-50">Admin & System Settings</h1>
          <p className="text-ice-500 text-sm mt-0.5">Live health from Render API</p>
        </div>
        <button
          onClick={check}
          disabled={checking}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-ice-800 border border-ice-700 text-sm text-ice-200 hover:border-cyan-500/40 disabled:opacity-50"
        >
          {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          Refresh health
        </button>
      </div>

      <div className="grid gap-3">
        {cards.map((item) => (
          <div key={item.title} className="glass rounded-xl border border-ice-800/50 p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-ice-800 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-ice-100">{item.title}</h3>
              <p className="text-xs text-ice-500 truncate">{item.desc}</p>
            </div>
            {item.ok ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 text-red-400 shrink-0" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
