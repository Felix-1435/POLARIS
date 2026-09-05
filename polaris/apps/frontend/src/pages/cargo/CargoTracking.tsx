import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Ship, Plane, MapPin, Package, Radio, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import CargoLiveMap from '@/components/map/CargoLiveMap'
import PageHeader from '@/components/shared/PageHeader'
import {
  loadShipments,
  saveShipments,
  setTransport,
  type CargoShipment,
  type TransportMode,
} from '@/lib/cargoShipments'

export default function CargoTracking() {
  const [list, setList] = useState<CargoShipment[]>([])
  const [selectedId, setSelectedId] = useState<string>('ANT-001')
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState({
    id: '',
    name: '',
    destination: 'Maitri',
    status: 'Pending' as CargoShipment['status'],
    progress: 0,
    transport: 'Sea' as TransportMode,
    vesselOrFlight: '',
  })

  useEffect(() => {
    const data = loadShipments()
    setList(data)
    if (data[0]) setSelectedId(data[0].id)
  }, [])

  const focus = list.find(c => c.id === selectedId) || list[0]

  const applyTransport = (id: string, mode: TransportMode) => {
    const vessel = mode === 'Air' ? 'Air lift / polar flight' : 'MV Sagar Kanya'
    const next = setTransport(id, mode, vessel)
    setList([...next])
    toast.success(`${id} set to ${mode} transport`)
  }

  const addShipment = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.id.trim() || !form.name.trim()) {
      toast.error('ID and name required')
      return
    }
    const item: CargoShipment = {
      id: form.id.trim().toUpperCase(),
      name: form.name.trim(),
      destination: form.destination,
      status: form.status,
      progress: Number(form.progress) || 0,
      transport: form.transport,
      vesselOrFlight:
        form.vesselOrFlight ||
        (form.transport === 'Air' ? 'Air lift' : 'MV Sagar Kanya'),
    }
    const next = [item, ...list.filter(x => x.id !== item.id)]
    saveShipments(next)
    setList(next)
    setSelectedId(item.id)
    setShowAdd(false)
    toast.success(`Added ${item.id} · ${item.transport}`)
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="Live Cargo Tracking"
        subtitle="Sea & air corridors · India → Antarctica"
        backTo="/cargo"
        backLabel="← Cargo & Logistics"
      />

      <div className="flex flex-wrap gap-2 justify-end">
        <button
          type="button"
          onClick={() => setShowAdd(v => !v)}
          className="inline-flex items-center gap-1.5 text-sm px-3 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-medium"
        >
          <Plus className="w-4 h-4" /> Add shipment
        </button>
      </div>

      {showAdd && (
        <motion.form
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={addShipment}
          className="glass rounded-2xl border border-cyan-500/25 p-5 grid sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          <div>
            <label className="text-[10px] uppercase text-ice-500">Cargo ID</label>
            <input
              className="mt-1 w-full rounded-lg bg-ice-900/60 border border-ice-700 px-3 py-2 text-sm text-ice-100"
              value={form.id}
              onChange={e => setForm({ ...form, id: e.target.value })}
              placeholder="ANT-100"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase text-ice-500">Item name</label>
            <input
              className="mt-1 w-full rounded-lg bg-ice-900/60 border border-ice-700 px-3 py-2 text-sm text-ice-100"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              placeholder="Scientific payload"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase text-ice-500">Destination</label>
            <select
              className="mt-1 w-full rounded-lg bg-ice-900/60 border border-ice-700 px-3 py-2 text-sm text-ice-100"
              value={form.destination}
              onChange={e => setForm({ ...form, destination: e.target.value })}
            >
              {['Maitri', 'Bharati', 'Field Camp A', 'Field Camp B'].map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase text-ice-500">Transport mode</label>
            <select
              className="mt-1 w-full rounded-lg bg-ice-900/60 border border-ice-700 px-3 py-2 text-sm text-ice-100"
              value={form.transport}
              onChange={e => setForm({ ...form, transport: e.target.value as TransportMode })}
            >
              <option value="Sea">Sea (ship / sealift)</option>
              <option value="Air">Air (flight / airdrop)</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase text-ice-500">Vessel / flight</label>
            <input
              className="mt-1 w-full rounded-lg bg-ice-900/60 border border-ice-700 px-3 py-2 text-sm text-ice-100"
              value={form.vesselOrFlight}
              onChange={e => setForm({ ...form, vesselOrFlight: e.target.value })}
              placeholder="MV Sagar Kanya or IL-76"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase text-ice-500">Status</label>
            <select
              className="mt-1 w-full rounded-lg bg-ice-900/60 border border-ice-700 px-3 py-2 text-sm text-ice-100"
              value={form.status}
              onChange={e => setForm({ ...form, status: e.target.value as CargoShipment['status'] })}
            >
              {['Pending', 'In Transit', 'Delayed', 'Delivered'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 lg:col-span-3 flex gap-2 justify-end pt-1">
            <button type="button" onClick={() => setShowAdd(false)} className="px-3 py-2 text-sm text-ice-400">Cancel</button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-cyan-600 text-white text-sm font-medium">Save shipment</button>
          </div>
        </motion.form>
      )}

      {focus && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl border border-cyan-500/25 overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-ice-800/50 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-cyan-500/10 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h2 className="font-bold text-ice-50 font-mono">{focus.id}</h2>
                <p className="text-sm text-ice-400">{focus.name}</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25 font-medium flex items-center gap-1.5">
              <Radio className="w-3 h-3 animate-pulse" /> {focus.status}
            </span>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 text-sm border-b border-ice-800/40">
            <div className="bg-ice-900/40 rounded-xl p-3 border border-ice-800/50">
              <p className="text-ice-500 text-[10px] uppercase tracking-wide">Transport mode</p>
              <p className="text-ice-100 font-medium mt-1 flex items-center gap-1.5">
                {(focus.transport || 'Sea') === 'Air' ? (
                  <Plane className="w-4 h-4 text-violet-400" />
                ) : (
                  <Ship className="w-4 h-4 text-sky-400" />
                )}
                {(focus.transport || 'Sea') === 'Air' ? 'Air transport' : 'Sea transport'}
              </p>
              <p className="text-[11px] text-ice-500 mt-1">{focus.vesselOrFlight || '—'}</p>
            </div>
            <div className="bg-ice-900/40 rounded-xl p-3 border border-ice-800/50">
              <p className="text-ice-500 text-[10px] uppercase tracking-wide">Destination</p>
              <p className="text-ice-100 font-medium mt-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-cyan-400" /> {focus.destination}
              </p>
            </div>
            <div className="bg-ice-900/40 rounded-xl p-3 border border-ice-800/50">
              <p className="text-ice-500 text-[10px] uppercase tracking-wide">Progress</p>
              <p className="text-cyan-300 font-bold mt-0.5 text-lg">{focus.progress}%</p>
            </div>
            <div className="bg-ice-900/40 rounded-xl p-3 border border-ice-800/50">
              <p className="text-ice-500 text-[10px] uppercase tracking-wide mb-2">Set transport</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => applyTransport(focus.id, 'Sea')}
                  className={cn(
                    'flex-1 text-xs py-1.5 rounded-lg border font-medium inline-flex items-center justify-center gap-1',
                    (focus.transport || 'Sea') === 'Sea'
                      ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                      : 'border-ice-700 text-ice-400 hover:bg-ice-800/50'
                  )}
                >
                  <Ship className="w-3.5 h-3.5" /> Sea
                </button>
                <button
                  type="button"
                  onClick={() => applyTransport(focus.id, 'Air')}
                  className={cn(
                    'flex-1 text-xs py-1.5 rounded-lg border font-medium inline-flex items-center justify-center gap-1',
                    focus.transport === 'Air'
                      ? 'bg-violet-500/20 text-violet-300 border-violet-500/40'
                      : 'border-ice-700 text-ice-400 hover:bg-ice-800/50'
                  )}
                >
                  <Plane className="w-3.5 h-3.5" /> Air
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="glass rounded-2xl border border-ice-800/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-ice-800/50 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold text-ice-100 text-sm">All shipments · select to track</h2>
          <div className="flex gap-3 text-[10px] text-ice-500">
            <span className="flex items-center gap-1"><Ship className="w-3 h-3 text-sky-400" /> Sea</span>
            <span className="flex items-center gap-1"><Plane className="w-3 h-3 text-violet-400" /> Air</span>
          </div>
        </div>
        <div className="divide-y divide-ice-800/40 max-h-56 overflow-y-auto">
          {list.map(c => (
            <button
              key={c.id}
              type="button"
              onClick={() => setSelectedId(c.id)}
              className={cn(
                'w-full px-5 py-2.5 flex items-center gap-3 text-left hover:bg-ice-900/40 transition-colors',
                selectedId === c.id && 'bg-cyan-500/10'
              )}
            >
              <span className="font-mono text-xs text-cyan-400 w-16">{c.id}</span>
              <span className="flex-1 text-sm text-ice-200 truncate">{c.name}</span>
              <span
                className={cn(
                  'text-[10px] px-2 py-0.5 rounded-full border inline-flex items-center gap-1',
                  c.transport === 'Air'
                    ? 'bg-violet-500/15 text-violet-300 border-violet-500/30'
                    : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                )}
              >
                {c.transport === 'Air' ? <Plane className="w-3 h-3" /> : <Ship className="w-3 h-3" />}
                {c.transport || 'Sea'}
              </span>
              <span className="text-xs text-ice-500 hidden sm:inline">{c.destination}</span>
              <span className="text-xs text-ice-400 w-16 text-right">{c.progress}%</span>
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-2xl border border-ice-800/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-ice-800/50">
          <h2 className="font-semibold text-ice-100 text-sm">Map · sea vs air pathways</h2>
        </div>
        <CargoLiveMap highlightId={selectedId} items={list} />
      </div>
    </div>
  )
}
