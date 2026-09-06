import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Map, Users, Package, Calendar, Plus, ArrowRight, X, Loader2 } from 'lucide-react'
import { Link } from 'wouter'
import { cn } from '@/lib/utils'

const API_URL = import.meta.env.VITE_API_URL || 'https://polaris-api-ju9u.onrender.com'

type Expedition = {
  id: string
  name: string
  status: string
  region?: string
  personnel?: number
  cargo?: number
  duration?: string
  objective?: string | null
  start_date?: string | null
  end_date?: string | null
}

const FALLBACK: Expedition[] = [
  { id: 'ANT-47', name: 'Antarctica Summer Expedition 2026', status: 'Active', region: 'Antarctica', personnel: 82, cargo: 156, duration: '120 days', objective: 'Climate monitoring & ice-core research' },
  { id: 'ARC-12', name: 'Arctic Climate Monitoring', status: 'Planning', region: 'Arctic', personnel: 24, cargo: 48, duration: '90 days', objective: 'Sea-ice & permafrost studies' },
  { id: 'ANT-46', name: 'Winter-over 2025-26', status: 'Completed', region: 'Antarctica', personnel: 45, cargo: 90, duration: '365 days', objective: 'Year-round station operations' },
]

const statusStyle: Record<string, string> = {
  Active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  Planning: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
  Completed: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  Suspended: 'bg-red-500/15 text-red-400 border-red-500/25',
  'In Transit': 'bg-cyan-500/15 text-cyan-400 border-cyan-500/25',
}

export default function Expeditions() {
  const [list, setList] = useState<Expedition[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    id: '',
    name: '',
    region: 'Antarctica',
    personnel: '24',
    status: 'Planning',
    objective: '',
  })

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/expeditions`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setList(Array.isArray(data) ? data : FALLBACK)
    } catch (e: any) {
      setError(e.message || 'Failed to load')
      setList(FALLBACK)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!form.id.trim() || !form.name.trim()) {
      setError('ID and Name are required')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`${API_URL}/api/expeditions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: form.id.trim(),
          name: form.name.trim(),
          region: form.region.trim() || 'Antarctica',
          personnel: Number(form.personnel) || 0,
          status: form.status,
          objective: form.objective.trim() || null,
        }),
      })
      if (!res.ok) {
        const body = await res.text()
        throw new Error(`Create failed (${res.status}): ${body}`)
      }
      setShowCreate(false)
      setForm({ id: '', name: '', region: 'Antarctica', personnel: '24', status: 'Planning', objective: '' })
      await load()
    } catch (err: any) {
      setError(err.message || 'Create failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto relative">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-ice-50 tracking-tight">Expeditions</h1>
          <p className="text-ice-500 text-sm mt-0.5">
            Plan, monitor and resource polar missions
            {loading ? ' · loading…' : ` · ${list.length} missions`}
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => { setError(null); setShowCreate(true) }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-sm text-white font-medium shadow-lg shadow-cyan-600/25"
        >
          <Plus className="w-4 h-4" /> Create Expedition
        </motion.button>
      </motion.div>

      {error && !showCreate && (
        <div className="text-amber-400 text-sm glass border border-amber-500/30 rounded-xl px-4 py-2">
          {error} — showing cached/fallback data
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {list.map((e, i) => (
            <motion.div
              key={e.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.35 }}
              whileHover={{ y: -4 }}
              className="group glass rounded-2xl border border-ice-800/50 p-5 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="relative">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="font-mono text-xs text-cyan-400">{e.id}</span>
                    <h3 className="font-semibold text-ice-50 mt-0.5 group-hover:text-cyan-200 transition-colors">{e.name}</h3>
                    {e.objective && <p className="text-xs text-ice-500 mt-1">{e.objective}</p>}
                  </div>
                  <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wider border', statusStyle[e.status] || statusStyle.Planning)}>
                    {e.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs text-ice-400 mb-4">
                  <div className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-cyan-500/70" /> {e.personnel ?? '—'} pax</div>
                  <div className="flex items-center gap-1.5"><Map className="w-3.5 h-3.5 text-cyan-500/70" /> {e.region || '—'}</div>
                  <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-cyan-500/70" /> {e.duration || '—'}</div>
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
      )}

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => !saving && setShowCreate(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              onClick={(ev) => ev.stopPropagation()}
              className="w-full max-w-lg glass-strong border border-ice-700/60 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="text-lg font-bold text-ice-50">Create Expedition</h2>
                  <p className="text-xs text-ice-500 mt-0.5">Saved to Neon via POLARIS API</p>
                </div>
                <button
                  type="button"
                  onClick={() => !saving && setShowCreate(false)}
                  className="p-2 rounded-lg hover:bg-ice-800/60 text-ice-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-3">
                <div>
                  <label className="text-xs text-ice-400 mb-1 block">Expedition ID *</label>
                  <input
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                    placeholder="e.g. ANT-48"
                    className="w-full px-3 py-2.5 rounded-xl bg-ice-900/80 border border-ice-700 text-ice-50 text-sm focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs text-ice-400 mb-1 block">Name *</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Bharati Resupply Mission"
                    className="w-full px-3 py-2.5 rounded-xl bg-ice-900/80 border border-ice-700 text-ice-50 text-sm focus:outline-none focus:border-cyan-500"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-ice-400 mb-1 block">Region</label>
                    <input
                      value={form.region}
                      onChange={(e) => setForm({ ...form, region: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-ice-900/80 border border-ice-700 text-ice-50 text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-ice-400 mb-1 block">Personnel</label>
                    <input
                      type="number"
                      min={0}
                      value={form.personnel}
                      onChange={(e) => setForm({ ...form, personnel: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl bg-ice-900/80 border border-ice-700 text-ice-50 text-sm focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-ice-400 mb-1 block">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl bg-ice-900/80 border border-ice-700 text-ice-50 text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option>Planning</option>
                    <option>Active</option>
                    <option>In Transit</option>
                    <option>Completed</option>
                    <option>Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-ice-400 mb-1 block">Objective</label>
                  <textarea
                    value={form.objective}
                    onChange={(e) => setForm({ ...form, objective: e.target.value })}
                    rows={2}
                    placeholder="Critical fuel & supply run"
                    className="w-full px-3 py-2.5 rounded-xl bg-ice-900/80 border border-ice-700 text-ice-50 text-sm focus:outline-none focus:border-cyan-500 resize-none"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-xs">{error}</p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    disabled={saving}
                    onClick={() => setShowCreate(false)}
                    className="flex-1 py-2.5 rounded-xl border border-ice-700 text-ice-300 text-sm hover:bg-ice-800/50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {saving ? 'Creating…' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
