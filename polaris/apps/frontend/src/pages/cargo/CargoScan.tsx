import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  QrCode, CheckCircle2, Package, MapPin, Clock, User, 
  Ship, Home, Search, LogIn, RefreshCw, ChevronDown
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import PageHeader from '@/components/shared/PageHeader'

const API_URL = import.meta.env.VITE_API_URL || ''

const ROLES = [
  { id: 'india_warehouse', label: 'India Warehouse Officer', location: 'Goa Warehouse, India', checkpoint: 0 },
  { id: 'port_officer', label: 'Port Supervisor', location: 'Mormugao Port', checkpoint: 1 },
  { id: 'ship_master', label: 'Ship Cargo Master', location: 'MV Sagar Kanya', checkpoint: 2 },
  { id: 'landing_officer', label: 'Antarctica Landing Officer', location: 'Larsemann Hills', checkpoint: 3 },
  { id: 'maitri_logistics', label: 'Maitri Station Logistics', location: 'Maitri Research Station', checkpoint: 4 },
  { id: 'field_ops', label: 'Field Operations', location: 'Field Camp', checkpoint: 5 },
]

const CHECKPOINTS = [
  { id: 0, name: 'India Warehouse', location: 'Goa, India', icon: Package },
  { id: 1, name: 'Port Dispatch', location: 'Mormugao Port', icon: MapPin },
  { id: 2, name: 'Loaded on Ship', location: 'MV Sagar Kanya', icon: Ship },
  { id: 3, name: 'Antarctica Arrival', location: 'Larsemann Hills', icon: MapPin },
  { id: 4, name: 'Maitri Station', location: 'Maitri Research Station', icon: Home },
  { id: 5, name: 'Field Delivery', location: 'Field Camp', icon: Package },
]

export default function CargoScan() {
  const [expeditions, setExpeditions] = useState<any[]>([])
  const [cargoList, setCargoList] = useState<any[]>([])
  const [selectedExp, setSelectedExp] = useState('')
  const [selectedCargoId, setSelectedCargoId] = useState('')
  const [cargo, setCargo] = useState<any>(null)
  const [selectedRole, setSelectedRole] = useState(ROLES[0])
  const [scanning, setScanning] = useState(false)
  const [scanSuccess, setScanSuccess] = useState(false)
  const [officerName, setOfficerName] = useState('')
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' && navigator.onLine)
  const [showQR, setShowQR] = useState(false)

  // Detect cargo id from URL (?id=ANT-001) — for QR scan on phone
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const idFromUrl = params.get('id')
      if (idFromUrl) setSelectedCargoId(idFromUrl)
    } catch { /* ignore */ }
  }, [])

  useEffect(() => {
    const on = () => setIsOnline(true)
    const off = () => setIsOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  // Load expeditions (always fill dropdown — API empty → fallback)
  useEffect(() => {
    async function load() {
      const fallback = [
        { id: 'ANT-47', name: 'Antarctica Summer Expedition 2026', status: 'Active' },
        { id: 'ANT-46', name: 'Winter-over 2025-26', status: 'Completed' },
        { id: 'ARC-12', name: 'Arctic Climate Monitoring', status: 'Planning' },
      ]
      try {
        if (API_URL) {
          const res = await fetch(`${API_URL}/api/expeditions`)
          if (res.ok) {
            const data = await res.json()
            if (Array.isArray(data) && data.length > 0) {
              setExpeditions(data)
              setSelectedExp(prev => prev || data[0].id)
              return
            }
          }
        }
      } catch {}
      setExpeditions(fallback)
      setSelectedExp(prev => prev || 'ANT-47')
    }
    load()
  }, [])

  // Load cargo when expedition changes (API empty → fallback list)
  useEffect(() => {
    if (!selectedExp) return
    async function loadCargo() {
      const fallback = [
        { id: 'ANT-001', expedition_id: selectedExp, item: 'Satellite Communication Equipment', priority: 'Critical', weight: '420 kg', current_checkpoint: 0, status: 'Pending Dispatch', history: [] },
        { id: 'ANT-002', expedition_id: selectedExp, item: 'Diesel Fuel (20kL)', priority: 'Critical', weight: '20,000 L', current_checkpoint: 0, status: 'Pending Dispatch', history: [] },
        { id: 'ANT-003', expedition_id: selectedExp, item: 'Food Rations', priority: 'High', weight: '1,250 kg', current_checkpoint: 0, status: 'Pending Dispatch', history: [] },
        { id: 'ANT-004', expedition_id: selectedExp, item: 'Medical Kits', priority: 'Critical', weight: '85 kg', current_checkpoint: 0, status: 'Pending Dispatch', history: [] },
      ]
      try {
        if (API_URL) {
          const res = await fetch(`${API_URL}/api/expeditions/${selectedExp}/cargo`)
          if (res.ok) {
            const data = await res.json()
            if (Array.isArray(data) && data.length > 0) {
              setCargoList(data)
              setSelectedCargoId(prev => {
                if (prev && data.some((c: any) => c.id === prev)) return prev
                return data[0].id
              })
              setCargo(data[0])
              return
            }
          }
        }
      } catch {}
      setCargoList(fallback)
      setSelectedCargoId(fallback[0].id)
      setCargo(fallback[0])
    }
    loadCargo()
  }, [selectedExp])

  // Poll selected cargo for live updates
  const loadSingleCargo = useCallback(async (id: string) => {
    if (!id) return
    try {
      if (API_URL && isOnline) {
        const res = await fetch(`${API_URL}/api/cargo/${id}`)
        if (res.ok) {
          const data = await res.json()
          // history may come as string from JSONB
          if (typeof data.history === 'string') {
            try { data.history = JSON.parse(data.history) } catch { data.history = [] }
          }
          if (!Array.isArray(data.history)) data.history = []
          setCargo(data)
          localStorage.setItem(`polaris_cargo_${id}`, JSON.stringify(data))
          return
        }
      }
    } catch {}
    try {
      const raw = localStorage.getItem(`polaris_cargo_${id}`)
      if (raw) setCargo(JSON.parse(raw))
    } catch {}
  }, [isOnline])

  useEffect(() => {
    if (!selectedCargoId) return
    loadSingleCargo(selectedCargoId)
    const t = setInterval(() => loadSingleCargo(selectedCargoId), 2500)
    return () => clearInterval(t)
  }, [selectedCargoId, loadSingleCargo])

  const saveCargo = async (updated: any) => {
    setCargo(updated)
    localStorage.setItem(`polaris_cargo_${updated.id}`, JSON.stringify(updated))
    if (API_URL && isOnline) {
      try {
        await fetch(`${API_URL}/api/cargo/${updated.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        })
      } catch {
        toast.message('Saved offline — will sync later')
      }
    }
  }

  const handleScan = async () => {
    if (!cargo) return
    if (!officerName.trim()) {
      toast.error('Enter your name / ID')
      return
    }
    const expected = selectedRole.checkpoint
    if (cargo.current_checkpoint !== expected) {
      const curName = CHECKPOINTS[cargo.current_checkpoint]?.name || 'Unknown'
      if (cargo.current_checkpoint > expected) {
        toast.error(`Already completed. Cargo is at: ${curName}`)
      } else {
        toast.error(`Cargo not yet at your location. Current: ${curName}`)
      }
      return
    }
    if (cargo.current_checkpoint >= CHECKPOINTS.length) {
      toast.info('Already fully delivered')
      return
    }

    setScanning(true)
    await new Promise(r => setTimeout(r, 1400))

    const cp = CHECKPOINTS[cargo.current_checkpoint]
    const now = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    const history = Array.isArray(cargo.history) ? cargo.history : []

    const updated = {
      ...cargo,
      current_checkpoint: cargo.current_checkpoint + 1,
      status: cargo.current_checkpoint + 1 >= CHECKPOINTS.length
        ? 'Delivered'
        : `In Transit — ${CHECKPOINTS[cargo.current_checkpoint + 1]?.name || 'Next'}`,
      history: [
        ...history,
        {
          checkpoint: cargo.current_checkpoint,
          name: cp.name,
          location: selectedRole.location,
          officer: officerName.trim(),
          role: selectedRole.label,
          time: now,
        }
      ]
    }
    await saveCargo(updated)
    setScanning(false)
    setScanSuccess(true)
    toast.success(`Confirmed at ${cp.name}`, { description: `${selectedRole.label} · ${officerName}` })
    setTimeout(() => setScanSuccess(false), 2200)
  }

  const resetCargo = async () => {
    if (!cargo) return
    const reset = {
      ...cargo,
      current_checkpoint: 0,
      status: 'Pending Dispatch',
      history: [],
    }
    await saveCargo(reset)
    toast.message('Cargo reset to India Warehouse')
  }

  // QR points to this same page with ?id=
  const qrValue = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?id=${selectedCargoId || 'ANT-001'}`
    : ''

  const isComplete = cargo && cargo.current_checkpoint >= CHECKPOINTS.length
  const canScan = cargo && cargo.current_checkpoint === selectedRole.checkpoint && !isComplete
  const history = cargo && Array.isArray(cargo.history) ? cargo.history : []

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Cargo Checkpoint Scanner"
        subtitle="Select expedition & cargo · Role-based scan · Live sync"
        backTo="/cargo"
        backLabel="← Cargo & Logistics"
      />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ice-50">Cargo Checkpoint Scanner</h1>
          <p className="text-ice-500 text-sm">Select expedition & cargo · Role-based scan · Live sync</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs px-2.5 py-1 rounded-full border font-medium",
            isOnline ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"
          )}>
            {isOnline ? '● Online' : '○ Offline'}
          </span>
          <button onClick={resetCargo} className="text-xs px-3 py-1.5 rounded-lg bg-ice-800 text-ice-400 hover:text-ice-200 border border-ice-700 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      {/* Expedition + Cargo Selectors */}
      <div className="glass rounded-xl border border-ice-800/50 p-4 grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-ice-500 mb-1.5 block">Expedition</label>
          <div className="relative">
            <select
              value={selectedExp}
              onChange={e => { setSelectedExp(e.target.value); setSelectedCargoId(''); setCargo(null) }}
              className="w-full appearance-none bg-ice-900 border border-ice-700 rounded-lg px-3 py-2.5 text-sm text-ice-100 pr-8 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            >
              {expeditions.map(e => (
                <option key={e.id} value={e.id}>{e.id} — {e.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ice-500 pointer-events-none" />
          </div>
        </div>
        <div>
          <label className="text-xs text-ice-500 mb-1.5 block">Cargo Item</label>
          <div className="relative">
            <select
              value={selectedCargoId}
              onChange={e => setSelectedCargoId(e.target.value)}
              className="w-full appearance-none bg-ice-900 border border-ice-700 rounded-lg px-3 py-2.5 text-sm text-ice-100 pr-8 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            >
              {cargoList.map(c => (
                <option key={c.id} value={c.id}>{c.id} — {c.item}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ice-500 pointer-events-none" />
          </div>
        </div>
      </div>

      {cargo && (
        <>
          {/* Status + QR */}
          <motion.div layout className="glass rounded-xl border border-cyan-500/20 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-6 py-4 border-b border-ice-800/50 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                  <Package className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="font-bold text-lg text-ice-50 font-mono">{cargo.id}</h2>
                  <p className="text-sm text-ice-400">{cargo.item}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right text-xs">
                  <p className="text-ice-500">Status</p>
                  <p className="text-cyan-300 font-medium">{cargo.status}</p>
                </div>
                <button
                  onClick={() => setShowQR(!showQR)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-ice-800 border border-ice-700 text-xs text-ice-300 hover:text-white hover:border-cyan-500/40"
                >
                  <QrCode className="w-4 h-4" /> {showQR ? 'Hide QR' : 'Show QR'}
                </button>
              </div>
            </div>

            {/* QR Code Panel */}
            {showQR && (
              <div className="p-6 border-b border-ice-800/50 flex flex-col sm:flex-row items-center gap-6 bg-ice-900/30">
                <div className="bg-white p-3 rounded-xl">
                  {/* Simple QR using external API for reliability */}
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrValue)}`}
                    alt="Cargo QR"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                    referrerPolicy="no-referrer"
                    alt="Cargo QR"
                    width={160}
                    height={160}
                    className="rounded"
                  />
                </div>
                <div className="text-sm text-ice-300 space-y-1">
                  <p className="font-medium text-ice-100">Scan this QR on any phone</p>
                  <p className="text-ice-500">Opens the scan page with <span className="font-mono text-cyan-400">{cargo.id}</span> pre-selected.</p>
                  <p className="text-xs text-ice-600 break-all">{qrValue}</p>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="p-6 overflow-x-auto">
              <div className="relative min-w-[600px]">
                <div className="absolute top-5 left-0 right-0 h-0.5 bg-ice-800" />
                <div
                  className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-700"
                  style={{ width: `${((cargo.current_checkpoint || 0) / CHECKPOINTS.length) * 100}%` }}
                />
                <div className="relative flex justify-between">
                  {CHECKPOINTS.map((cp, i) => {
                    const done = i < (cargo.current_checkpoint || 0)
                    const current = i === (cargo.current_checkpoint || 0)
                    const Icon = cp.icon
                    return (
                      <div key={cp.id} className="flex flex-col items-center w-20">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 transition-all",
                          done && "bg-emerald-500 border-emerald-400 text-white",
                          current && "bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-4 ring-cyan-500/20",
                          !done && !current && "bg-ice-900 border-ice-700 text-ice-600"
                        )}>
                          {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                        </div>
                        <p className={cn("text-[10px] mt-2 text-center font-medium", done ? "text-emerald-400" : current ? "text-cyan-300" : "text-ice-600")}>
                          {cp.name}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Credentials + Scan */}
            <div className="glass rounded-xl border border-ice-800/50 p-6 space-y-4">
              <h3 className="font-semibold text-ice-100 flex items-center gap-2">
                <LogIn className="w-4 h-4 text-cyan-400" /> Officer Details
              </h3>
              <div>
                <label className="text-xs text-ice-500 block mb-1">Name / ID</label>
                <input
                  value={officerName}
                  onChange={e => setOfficerName(e.target.value)}
                  placeholder="e.g. Anita Sharma"
                  className="w-full bg-ice-900 border border-ice-700 rounded-lg px-3 py-2.5 text-sm text-ice-100 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </div>
              <div>
                <label className="text-xs text-ice-500 block mb-1.5">Your Role / Location</label>
                <div className="grid gap-1.5 max-h-48 overflow-y-auto">
                  {ROLES.map(role => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role)}
                      className={cn(
                        "text-left px-3 py-2 rounded-lg border text-sm transition-all",
                        selectedRole.id === role.id
                          ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-200"
                          : "bg-ice-900/40 border-ice-800 text-ice-400 hover:border-ice-600"
                      )}
                    >
                      <span className="font-medium">{role.label}</span>
                      <span className="text-ice-600 text-xs ml-2">→ {role.location}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative aspect-video max-h-36 rounded-xl overflow-hidden border-2 border-dashed border-cyan-500/30 bg-ice-900/50 flex items-center justify-center">
                <QrCode className="w-14 h-14 text-ice-700" />
                {scanning && <div className="absolute inset-0 bg-cyan-500/10"><div className="scan-line" /></div>}
                {scanSuccess && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400" />
                  </motion.div>
                )}
              </div>

              <p className="text-center text-sm text-ice-400">
                {isComplete ? '✅ Fully Delivered' :
                  canScan ? <>Ready at <strong className="text-cyan-300">{CHECKPOINTS[selectedRole.checkpoint]?.name}</strong></> :
                  <>Cargo at <strong>{CHECKPOINTS[cargo.current_checkpoint]?.name}</strong> — your role is later</>}
              </p>

              <button
                onClick={handleScan}
                disabled={scanning || !canScan || isComplete}
                className={cn(
                  "w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2",
                  canScan && !scanning
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-600/30"
                    : "bg-ice-700 cursor-not-allowed opacity-60"
                )}
              >
                {scanning ? (
                  <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Scanning...</>
                ) : (
                  <><Search className="w-5 h-5" /> Confirm Scan at My Location</>
                )}
              </button>
            </div>

            {/* History */}
            <div className="glass rounded-xl border border-ice-800/50 p-6">
              <h3 className="font-semibold text-ice-100 mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" /> Scan History
              </h3>
              {history.length === 0 ? (
                <p className="text-ice-600 text-sm text-center py-12">No scans yet</p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto">
                  <AnimatePresence>
                    {[...history].reverse().map((h: any, i: number) => (
                      <motion.div key={`${h.time}-${i}`} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className="flex items-start gap-3 p-3 rounded-lg bg-ice-900/50 border border-ice-800">
                        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-ice-100">{h.name}</p>
                          <p className="text-xs text-ice-400">{h.location}</p>
                          <p className="text-xs text-cyan-400/80 mt-0.5 flex items-center gap-1">
                            <User className="w-3 h-3" /> {h.officer} · {h.role}
                          </p>
                          <p className="text-[10px] text-ice-600">{h.time}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
