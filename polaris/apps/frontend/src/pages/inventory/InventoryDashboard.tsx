import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Boxes, AlertTriangle, Clock, TrendingDown, Plus, Search, RefreshCw,
  PackageMinus, PackagePlus, MapPin, Tag, History, X, CheckCircle2,
  Wrench, FlaskConical, Utensils, Fuel, HeartPulse
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { useAuth } from '@/App'

const API_URL = import.meta.env.VITE_API_URL || ''

const CATEGORIES = ['Fuel', 'Food', 'Medical', 'Spares', 'Scientific Equipment', 'Miscellaneous'] as const
const LOCATIONS = ['Maitri', 'Bharati', 'Field Camp A', 'Field Camp B', 'Himalaya'] as const
const CONDITIONS = ['Good', 'Damaged', 'Spoiled', 'Expiring Soon'] as const
const UNITS = ['L', 'kg', 'units', 'sets', 'packs', 'boxes'] as const

type InventoryItem = {
  id: number; item: string; category: string; subcategory?: string | null
  location: string; available: number; unit: string; minimum: number; status: string
  barcode?: string | null; batch_lot?: string | null; received_date?: string | null
  expiry_date?: string | null; storage_location?: string | null; condition?: string
  notes?: string | null; updated_at?: string
}

type UsageRow = {
  id: number; inventory_id: number; quantity: number; purpose: string
  staff_member: string; usage_date: string; notes?: string | null
  item?: string; unit?: string; location?: string; category?: string
}

type Summary = {
  total_items: number; low_stock: number; critical: number
  expiring_soon: number; damaged: number
  by_category: { category: string; count: number; total_qty: number }[]
}

const catIcon = (c: string) => {
  switch (c) {
    case 'Fuel': return Fuel
    case 'Food': return Utensils
    case 'Medical': return HeartPulse
    case 'Spares': return Wrench
    case 'Scientific Equipment': return FlaskConical
    default: return Boxes
  }
}

export default function InventoryDashboard() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'dashboard' | 'stock' | 'intake' | 'usage' | 'alerts'>('dashboard')
  const [items, setItems] = useState<InventoryItem[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [usage, setUsage] = useState<UsageRow[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('')
  const [filterLoc, setFilterLoc] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [useModal, setUseModal] = useState<InventoryItem | null>(null)
  const [editModal, setEditModal] = useState<InventoryItem | null>(null)
  const [conditionModal, setConditionModal] = useState<InventoryItem | null>(null)
  const [useForm, setUseForm] = useState({ quantity: '', purpose: '', notes: '' })
  const [condForm, setCondForm] = useState({ condition: 'Damaged', remove_quantity: '', notes: '' })
  const [editForm, setEditForm] = useState<Partial<InventoryItem>>({})
  const [saving, setSaving] = useState(false)
  const [intake, setIntake] = useState({
    item: '', category: 'Food', subcategory: '', location: 'Maitri', available: '', unit: 'kg',
    minimum: '', barcode: '', batch_lot: '', received_date: new Date().toISOString().slice(0, 10),
    expiry_date: '', storage_location: '', condition: 'Good', notes: '',
  })

  const staffName = user?.name || 'Station Staff'

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterCat) params.set('category', filterCat)
      if (filterLoc) params.set('location', filterLoc)
      if (filterStatus) params.set('status', filterStatus)
      if (search.trim()) params.set('q', search.trim())
      const [invRes, sumRes, useRes, alertRes] = await Promise.all([
        fetch(`${API_URL}/api/inventory?${params}`),
        fetch(`${API_URL}/api/inventory/summary`),
        fetch(`${API_URL}/api/inventory/usage/history?limit=40`),
        fetch(`${API_URL}/api/inventory/alerts`),
      ])
      if (invRes.ok) setItems(await invRes.json())
      if (sumRes.ok) setSummary(await sumRes.json())
      if (useRes.ok) setUsage(await useRes.json())
      if (alertRes.ok) setAlerts(await alertRes.json())
    } catch {
      toast.error('Failed to load inventory')
    } finally {
      setLoading(false)
    }
  }, [filterCat, filterLoc, filterStatus, search])

  useEffect(() => { loadAll() }, [loadAll])
  useEffect(() => {
    const t = setInterval(loadAll, 20000)
    return () => clearInterval(t)
  }, [loadAll])

  const submitIntake = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!intake.item || !intake.available) { toast.error('Item name and quantity required'); return }
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/api/inventory`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...intake, available: Number(intake.available), minimum: Number(intake.minimum || 0),
          subcategory: intake.subcategory || null, expiry_date: intake.expiry_date || null,
          staff_member: staffName, user_id: staffName,
        }),
      })
      if (!res.ok) { const err = await res.json().catch(() => ({})); throw new Error(err.error || 'Failed') }
      toast.success('Stock intake recorded — inventory updated')
      setIntake({ item: '', category: 'Food', subcategory: '', location: 'Maitri', available: '', unit: 'kg', minimum: '', barcode: '', batch_lot: '', received_date: new Date().toISOString().slice(0, 10), expiry_date: '', storage_location: '', condition: 'Good', notes: '' })
      setTab('stock'); await loadAll()
    } catch (err: any) { toast.error(err.message || 'Intake failed') }
    finally { setSaving(false) }
  }

  const submitUsage = async () => {
    if (!useModal) return
    const qty = Number(useForm.quantity)
    if (!qty || qty <= 0) { toast.error('Enter a valid quantity'); return }
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/api/inventory/${useModal.id}/use`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: qty, purpose: useForm.purpose || 'General use', notes: useForm.notes || null, staff_member: staffName, user_id: staffName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Usage failed')
      toast.success(`Deducted ${qty} ${useModal.unit} of ${useModal.item}`)
      setUseModal(null); setUseForm({ quantity: '', purpose: '', notes: '' }); await loadAll()
    } catch (err: any) { toast.error(err.message || 'Usage failed') }
    finally { setSaving(false) }
  }

  const submitEdit = async () => {
    if (!editModal) return
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/api/inventory/${editModal.id}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...editForm,
          available: editForm.available !== undefined ? Number(editForm.available) : undefined,
          minimum: editForm.minimum !== undefined ? Number(editForm.minimum) : undefined,
          staff_member: staffName, user_id: staffName,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Update failed')
      toast.success('Inventory updated'); setEditModal(null); await loadAll()
    } catch (err: any) { toast.error(err.message || 'Update failed') }
    finally { setSaving(false) }
  }

  const submitCondition = async () => {
    if (!conditionModal) return
    setSaving(true)
    try {
      const res = await fetch(`${API_URL}/api/inventory/${conditionModal.id}/condition`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ condition: condForm.condition, remove_quantity: Number(condForm.remove_quantity || 0), notes: condForm.notes || null, staff_member: staffName, user_id: staffName }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Condition update failed')
      toast.success(`Condition set to ${condForm.condition}`)
      setConditionModal(null); setCondForm({ condition: 'Damaged', remove_quantity: '', notes: '' }); await loadAll()
    } catch (err: any) { toast.error(err.message || 'Failed') }
    finally { setSaving(false) }
  }

  const openEdit = (item: InventoryItem) => {
    setEditForm({ item: item.item, category: item.category, subcategory: item.subcategory || '', location: item.location, available: item.available, unit: item.unit, minimum: item.minimum, barcode: item.barcode || '', batch_lot: item.batch_lot || '', storage_location: item.storage_location || '', expiry_date: item.expiry_date || '', condition: item.condition || 'Good', notes: item.notes || '' })
    setEditModal(item)
  }

  const statusBadge = (status: string) => (
    <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-medium uppercase',
      status === 'critical' && 'bg-red-500/15 text-red-400',
      status === 'low' && 'bg-amber-500/15 text-amber-400',
      status === 'ok' && 'bg-emerald-500/15 text-emerald-400',
      status === 'unusable' && 'bg-slate-500/20 text-slate-400')}>{status}</span>
  )

  const tabs = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: Boxes },
    { id: 'stock' as const, label: 'Stock List', icon: Tag },
    { id: 'intake' as const, label: 'Stock Intake', icon: PackagePlus },
    { id: 'usage' as const, label: 'Usage Log', icon: History },
    { id: 'alerts' as const, label: 'Alerts', icon: AlertTriangle },
  ]

  return (
    <div className="space-y-5 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ice-50">Inventory Manager</h1>
          <p className="text-ice-500 text-sm">Live stock · usage logging · intake · condition tracking</p>
        </div>
        <button onClick={() => loadAll()} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-ice-800/60 border border-ice-700 text-ice-300 hover:text-ice-100">
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} /> Refresh
        </button>
      </div>

      <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-ice-900/50 border border-ice-800/50">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} className={cn('flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition',
            tab === t.id ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30' : 'text-ice-400 hover:text-ice-200 hover:bg-ice-800/40')}>
            <t.icon className="w-4 h-4" />{t.label}
            {t.id === 'alerts' && alerts.length > 0 && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-red-500/20 text-red-400">{alerts.length}</span>}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {[
              { label: 'Total Items', value: summary?.total_items ?? '—', icon: Boxes, color: 'text-cyan-400' },
              { label: 'Low Stock', value: summary?.low_stock ?? '—', icon: TrendingDown, color: 'text-amber-400' },
              { label: 'Critical', value: summary?.critical ?? '—', icon: AlertTriangle, color: 'text-red-400' },
              { label: 'Expiring Soon', value: summary?.expiring_soon ?? '—', icon: Clock, color: 'text-orange-400' },
              { label: 'Damaged/Spoiled', value: summary?.damaged ?? '—', icon: PackageMinus, color: 'text-slate-400' },
            ].map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="glass rounded-xl p-4 border border-ice-800/50">
                <s.icon className={cn('w-5 h-5 mb-2', s.color)} />
                <p className="text-2xl font-bold text-ice-50">{s.value}</p>
                <p className="text-xs text-ice-400">{s.label}</p>
              </motion.div>
            ))}
          </div>

          <div>
            <h2 className="text-sm font-semibold text-ice-300 mb-3">By Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {(summary?.by_category || CATEGORIES.map(c => ({ category: c, count: 0, total_qty: 0 }))).map((c, i) => {
                const Icon = catIcon(c.category)
                return (
                  <motion.button key={c.category} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}
                    onClick={() => { setFilterCat(c.category); setTab('stock') }}
                    className="glass rounded-xl p-4 border border-ice-800/50 text-left hover:border-cyan-500/30 transition group">
                    <Icon className="w-5 h-5 text-cyan-400 mb-2 group-hover:scale-110 transition" />
                    <p className="text-sm font-medium text-ice-100 truncate">{c.category}</p>
                    <p className="text-xs text-ice-500">{c.count} SKUs</p>
                  </motion.button>
                )
              })}
            </div>
          </div>

          <div className="glass rounded-xl border border-ice-800/50 overflow-hidden">
            <div className="px-5 py-3 border-b border-ice-800/50 font-semibold text-ice-100 flex justify-between">
              <span>Live Stock Levels</span>
              <button onClick={() => setTab('stock')} className="text-xs text-cyan-400 hover:underline">View all</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-ice-500 uppercase"><tr>
                  <th className="px-4 py-2 text-left">Item</th><th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Location</th><th className="px-4 py-2 text-left">Available</th>
                  <th className="px-4 py-2 text-left">Min</th><th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-ice-800/40">
                  {items.slice(0, 8).map(s => (
                    <tr key={s.id} className="hover:bg-ice-900/30">
                      <td className="px-4 py-3 text-ice-200 font-medium">{s.item}</td>
                      <td className="px-4 py-3 text-ice-400">{s.category}</td>
                      <td className="px-4 py-3 text-ice-400">{s.location}</td>
                      <td className="px-4 py-3 text-ice-300">{Number(s.available)} {s.unit}</td>
                      <td className="px-4 py-3 text-ice-500">{Number(s.minimum)} {s.unit}</td>
                      <td className="px-4 py-3">{statusBadge(s.status)}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => { setUseModal(s); setUseForm({ quantity: '', purpose: '', notes: '' }) }}
                            className="text-[10px] px-2 py-1 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20">Use</button>
                          <button onClick={() => openEdit(s)} className="text-[10px] px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20">Edit</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && <tr><td colSpan={7} className="px-4 py-8 text-center text-ice-500">No inventory data</td></tr>}
                </tbody>
              </table>
            </div>
          </div>

          <div className="glass rounded-xl border border-amber-500/20 p-5 bg-amber-500/5">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-amber-400" />
              <h3 className="font-semibold text-amber-200">Stock Forecast</h3>
            </div>
            <p className="text-sm text-ice-300">Log every fuel/food draw via <strong className="text-amber-300">Use</strong> so live levels and alerts stay accurate across Command Center and Logistics.</p>
          </div>
        </div>
      )}

      {tab === 'stock' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ice-500" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search item, barcode, storage..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm placeholder:text-ice-600 focus:outline-none focus:border-cyan-500/50" />
            </div>
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} className="px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-200 text-sm">
              <option value="">All categories</option>{CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterLoc} onChange={e => setFilterLoc(e.target.value)} className="px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-200 text-sm">
              <option value="">All locations</option>{LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-200 text-sm">
              <option value="">All status</option>
              <option value="ok">OK</option><option value="low">Low</option>
              <option value="critical">Critical</option><option value="unusable">Unusable</option>
            </select>
          </div>
          <div className="glass rounded-xl border border-ice-800/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-ice-500 uppercase bg-ice-900/40"><tr>
                  <th className="px-3 py-2.5 text-left">Item</th><th className="px-3 py-2.5 text-left">Category</th>
                  <th className="px-3 py-2.5 text-left">Location / Storage</th><th className="px-3 py-2.5 text-left">Qty</th>
                  <th className="px-3 py-2.5 text-left">Batch</th><th className="px-3 py-2.5 text-left">Expiry</th>
                  <th className="px-3 py-2.5 text-left">Condition</th><th className="px-3 py-2.5 text-left">Status</th>
                  <th className="px-3 py-2.5 text-left">Actions</th>
                </tr></thead>
                <tbody className="divide-y divide-ice-800/40">
                  {items.map(s => (
                    <tr key={s.id} className="hover:bg-ice-900/30">
                      <td className="px-3 py-2.5"><div className="font-medium text-ice-200">{s.item}</div>
                        {s.barcode && <div className="text-[10px] text-ice-600 font-mono">{s.barcode}</div>}</td>
                      <td className="px-3 py-2.5 text-ice-400">{s.category}{s.subcategory && <span className="text-ice-600"> · {s.subcategory}</span>}</td>
                      <td className="px-3 py-2.5 text-ice-400">
                        <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />{s.location}</div>
                        {s.storage_location && <div className="text-[10px] text-ice-600">{s.storage_location}</div>}
                      </td>
                      <td className="px-3 py-2.5 text-ice-200 font-medium">{Number(s.available)} <span className="text-ice-500 font-normal">{s.unit}</span></td>
                      <td className="px-3 py-2.5 text-ice-500 text-xs">{s.batch_lot || '—'}</td>
                      <td className="px-3 py-2.5 text-ice-500 text-xs">{s.expiry_date || '—'}</td>
                      <td className="px-3 py-2.5 text-ice-400 text-xs">{s.condition || 'Good'}</td>
                      <td className="px-3 py-2.5">{statusBadge(s.status)}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex flex-wrap gap-1">
                          <button onClick={() => { setUseModal(s); setUseForm({ quantity: '', purpose: '', notes: '' }) }}
                            className="text-[10px] px-2 py-1 rounded bg-amber-500/10 text-amber-400 hover:bg-amber-500/20">Use</button>
                          <button onClick={() => openEdit(s)} className="text-[10px] px-2 py-1 rounded bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20">Edit</button>
                          <button onClick={() => { setConditionModal(s); setCondForm({ condition: 'Damaged', remove_quantity: '', notes: '' }) }}
                            className="text-[10px] px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20">Condition</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {items.length === 0 && <tr><td colSpan={9} className="px-4 py-10 text-center text-ice-500">No matching stock</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'intake' && (
        <form onSubmit={submitIntake} className="glass rounded-xl border border-ice-800/50 p-5 space-y-4 max-w-3xl">
          <div className="flex items-center gap-2"><PackagePlus className="w-5 h-5 text-cyan-400" /><h2 className="font-semibold text-ice-100">Register Incoming Stock</h2></div>
          <p className="text-xs text-ice-500">New stock is added to live inventory and appears on all connected pages after save.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="space-y-1"><span className="text-xs text-ice-400">Item name *</span>
              <input required value={intake.item} onChange={e => setIntake({ ...intake, item: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm focus:outline-none focus:border-cyan-500/50" /></label>
            <label className="space-y-1"><span className="text-xs text-ice-400">Category *</span>
              <select value={intake.category} onChange={e => setIntake({ ...intake, category: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
            <label className="space-y-1"><span className="text-xs text-ice-400">Sub-category</span>
              <input value={intake.subcategory} onChange={e => setIntake({ ...intake, subcategory: e.target.value })} placeholder="e.g. Perishable" className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm focus:outline-none focus:border-cyan-500/50" /></label>
            <label className="space-y-1"><span className="text-xs text-ice-400">Station / Location</span>
              <select value={intake.location} onChange={e => setIntake({ ...intake, location: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm">
                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}</select></label>
            <label className="space-y-1"><span className="text-xs text-ice-400">Quantity *</span>
              <input required type="number" min="0" step="any" value={intake.available} onChange={e => setIntake({ ...intake, available: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm focus:outline-none focus:border-cyan-500/50" /></label>
            <label className="space-y-1"><span className="text-xs text-ice-400">Unit</span>
              <select value={intake.unit} onChange={e => setIntake({ ...intake, unit: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm">
                {UNITS.map(u => <option key={u} value={u}>{u}</option>)}</select></label>
            <label className="space-y-1"><span className="text-xs text-ice-400">Minimum threshold</span>
              <input type="number" min="0" step="any" value={intake.minimum} onChange={e => setIntake({ ...intake, minimum: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm focus:outline-none focus:border-cyan-500/50" /></label>
            <label className="space-y-1"><span className="text-xs text-ice-400">Storage location</span>
              <input value={intake.storage_location} onChange={e => setIntake({ ...intake, storage_location: e.target.value })} placeholder="e.g. Cold Store 1" className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm focus:outline-none focus:border-cyan-500/50" /></label>
            <label className="space-y-1"><span className="text-xs text-ice-400">Barcode / QR</span>
              <input value={intake.barcode} onChange={e => setIntake({ ...intake, barcode: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm font-mono focus:outline-none focus:border-cyan-500/50" /></label>
            <label className="space-y-1"><span className="text-xs text-ice-400">Batch / Lot</span>
              <input value={intake.batch_lot} onChange={e => setIntake({ ...intake, batch_lot: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm focus:outline-none focus:border-cyan-500/50" /></label>
            <label className="space-y-1"><span className="text-xs text-ice-400">Received date</span>
              <input type="date" value={intake.received_date} onChange={e => setIntake({ ...intake, received_date: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm focus:outline-none focus:border-cyan-500/50" /></label>
            <label className="space-y-1"><span className="text-xs text-ice-400">Expiry date</span>
              <input type="date" value={intake.expiry_date} onChange={e => setIntake({ ...intake, expiry_date: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm focus:outline-none focus:border-cyan-500/50" /></label>
            <label className="space-y-1 md:col-span-2"><span className="text-xs text-ice-400">Notes</span>
              <input value={intake.notes} onChange={e => setIntake({ ...intake, notes: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm focus:outline-none focus:border-cyan-500/50" /></label>
          </div>
          <button type="submit" disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium disabled:opacity-50">
            <Plus className="w-4 h-4" />{saving ? 'Saving…' : 'Add to Inventory'}
          </button>
        </form>
      )}

      {tab === 'usage' && (
        <div className="glass rounded-xl border border-ice-800/50 overflow-hidden">
          <div className="px-5 py-3 border-b border-ice-800/50 font-semibold text-ice-100 flex items-center gap-2">
            <History className="w-4 h-4 text-cyan-400" /> Recent consumption / deductions
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-xs text-ice-500 uppercase"><tr>
                <th className="px-4 py-2 text-left">When</th><th className="px-4 py-2 text-left">Item</th>
                <th className="px-4 py-2 text-left">Qty</th><th className="px-4 py-2 text-left">Purpose</th>
                <th className="px-4 py-2 text-left">Staff</th><th className="px-4 py-2 text-left">Location</th>
              </tr></thead>
              <tbody className="divide-y divide-ice-800/40">
                {usage.map(u => (
                  <tr key={u.id} className="hover:bg-ice-900/30">
                    <td className="px-4 py-2.5 text-ice-400 text-xs whitespace-nowrap">{u.usage_date ? new Date(u.usage_date).toLocaleString() : '—'}</td>
                    <td className="px-4 py-2.5 text-ice-200 font-medium">{u.item || `#${u.inventory_id}`}</td>
                    <td className="px-4 py-2.5 text-amber-300">−{Number(u.quantity)} {u.unit || ''}</td>
                    <td className="px-4 py-2.5 text-ice-400">{u.purpose}</td>
                    <td className="px-4 py-2.5 text-ice-300">{u.staff_member}</td>
                    <td className="px-4 py-2.5 text-ice-500">{u.location || '—'}</td>
                  </tr>
                ))}
                {usage.length === 0 && <tr><td colSpan={6} className="px-4 py-10 text-center text-ice-500">No usage logged yet. Use the “Use” action on stock items.</td></tr>}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'alerts' && (
        <div className="space-y-3">
          {alerts.length === 0 && (
            <div className="glass rounded-xl border border-emerald-500/20 p-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-ice-200 font-medium">No active inventory alerts</p>
            </div>
          )}
          {alerts.map((a, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className={cn('glass rounded-xl border p-4 flex gap-3', a.type === 'critical' ? 'border-red-500/30 bg-red-500/5' : 'border-amber-500/30 bg-amber-500/5')}>
              <AlertTriangle className={cn('w-5 h-5 shrink-0 mt-0.5', a.type === 'critical' ? 'text-red-400' : 'text-amber-400')} />
              <div>
                <p className={cn('font-medium', a.type === 'critical' ? 'text-red-200' : 'text-amber-200')}>{a.title}</p>
                <p className="text-sm text-ice-400">{a.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {useModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setUseModal(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="w-full max-w-md glass-strong rounded-2xl border border-ice-700 p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-ice-50">Log usage — {useModal.item}</h3>
                <button onClick={() => setUseModal(null)} className="text-ice-500 hover:text-ice-200"><X className="w-5 h-5" /></button>
              </div>
              <p className="text-xs text-ice-500">Available: <strong className="text-ice-200">{Number(useModal.available)} {useModal.unit}</strong> at {useModal.location}</p>
              <label className="block space-y-1"><span className="text-xs text-ice-400">Quantity used *</span>
                <input type="number" min="0.01" step="any" value={useForm.quantity} onChange={e => setUseForm({ ...useForm, quantity: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm focus:outline-none focus:border-cyan-500/50" autoFocus /></label>
              <label className="block space-y-1"><span className="text-xs text-ice-400">Purpose</span>
                <input value={useForm.purpose} onChange={e => setUseForm({ ...useForm, purpose: e.target.value })} placeholder="e.g. Generator run, Kitchen"
                  className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm focus:outline-none focus:border-cyan-500/50" /></label>
              <label className="block space-y-1"><span className="text-xs text-ice-400">Notes</span>
                <input value={useForm.notes} onChange={e => setUseForm({ ...useForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm focus:outline-none focus:border-cyan-500/50" /></label>
              <p className="text-[11px] text-ice-600">Logged as: {staffName}</p>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setUseModal(null)} className="px-3 py-2 rounded-lg text-sm text-ice-400">Cancel</button>
                <button onClick={submitUsage} disabled={saving} className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium disabled:opacity-50">
                  {saving ? 'Saving…' : 'Deduct from stock'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {editModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setEditModal(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="w-full max-w-lg glass-strong rounded-2xl border border-ice-700 p-5 space-y-3 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-ice-50">Update inventory</h3>
                <button onClick={() => setEditModal(null)} className="text-ice-500 hover:text-ice-200"><X className="w-5 h-5" /></button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="space-y-1 col-span-2"><span className="text-xs text-ice-400">Item</span>
                  <input value={editForm.item || ''} onChange={e => setEditForm({ ...editForm, item: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm" /></label>
                <label className="space-y-1"><span className="text-xs text-ice-400">Available qty</span>
                  <input type="number" step="any" value={editForm.available ?? ''} onChange={e => setEditForm({ ...editForm, available: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm" /></label>
                <label className="space-y-1"><span className="text-xs text-ice-400">Minimum</span>
                  <input type="number" step="any" value={editForm.minimum ?? ''} onChange={e => setEditForm({ ...editForm, minimum: Number(e.target.value) })} className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm" /></label>
                <label className="space-y-1"><span className="text-xs text-ice-400">Location</span>
                  <select value={editForm.location || ''} onChange={e => setEditForm({ ...editForm, location: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm">
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}</select></label>
                <label className="space-y-1"><span className="text-xs text-ice-400">Storage</span>
                  <input value={editForm.storage_location || ''} onChange={e => setEditForm({ ...editForm, storage_location: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm" /></label>
                <label className="space-y-1"><span className="text-xs text-ice-400">Category</span>
                  <select value={editForm.category || ''} onChange={e => setEditForm({ ...editForm, category: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
                <label className="space-y-1"><span className="text-xs text-ice-400">Condition</span>
                  <select value={editForm.condition || 'Good'} onChange={e => setEditForm({ ...editForm, condition: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm">
                    {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
              </div>
              <div className="flex gap-2 justify-end pt-2">
                <button onClick={() => setEditModal(null)} className="px-3 py-2 rounded-lg text-sm text-ice-400">Cancel</button>
                <button onClick={submitEdit} disabled={saving} className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-sm font-medium disabled:opacity-50">{saving ? 'Saving…' : 'Save changes'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {conditionModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setConditionModal(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()} className="w-full max-w-md glass-strong rounded-2xl border border-ice-700 p-5 space-y-4 shadow-2xl">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-ice-50">Condition — {conditionModal.item}</h3>
                <button onClick={() => setConditionModal(null)} className="text-ice-500 hover:text-ice-200"><X className="w-5 h-5" /></button>
              </div>
              <label className="block space-y-1"><span className="text-xs text-ice-400">New condition</span>
                <select value={condForm.condition} onChange={e => setCondForm({ ...condForm, condition: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm">
                  {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
              <label className="block space-y-1"><span className="text-xs text-ice-400">Remove unusable qty (optional)</span>
                <input type="number" min="0" step="any" value={condForm.remove_quantity} onChange={e => setCondForm({ ...condForm, remove_quantity: e.target.value })}
                  placeholder={`Max ${conditionModal.available}`} className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm" /></label>
              <label className="block space-y-1"><span className="text-xs text-ice-400">Notes</span>
                <input value={condForm.notes} onChange={e => setCondForm({ ...condForm, notes: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-ice-900/60 border border-ice-800 text-ice-100 text-sm" /></label>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setConditionModal(null)} className="px-3 py-2 rounded-lg text-sm text-ice-400">Cancel</button>
                <button onClick={submitCondition} disabled={saving} className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium disabled:opacity-50">{saving ? 'Saving…' : 'Update condition'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
