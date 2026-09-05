import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  QrCode, CheckCircle2, Package, MapPin, Clock, User, 
  ArrowRight, Ship, Home, Search, LogIn, RefreshCw
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const API_URL = import.meta.env.VITE_API_URL || ''

// Role → Checkpoint mapping (this is the core of location-based scanning)
const ROLES = [
  { id: 'india_warehouse', label: 'India Warehouse Officer', location: 'Goa Warehouse, India', checkpoint: 0, color: 'cyan' },
  { id: 'port_officer', label: 'Port Supervisor', location: 'Mormugao Port', checkpoint: 1, color: 'blue' },
  { id: 'ship_master', label: 'Ship Cargo Master', location: 'MV Sagar Kanya', checkpoint: 2, color: 'indigo' },
  { id: 'landing_officer', label: 'Antarctica Landing Officer', location: 'Larsemann Hills', checkpoint: 3, color: 'purple' },
  { id: 'maitri_logistics', label: 'Maitri Station Logistics', location: 'Maitri Research Station', checkpoint: 4, color: 'emerald' },
  { id: 'field_ops', label: 'Field Operations', location: 'Field Camp', checkpoint: 5, color: 'amber' },
]

const CHECKPOINTS = [
  { id: 0, name: 'India Warehouse', location: 'Goa, India', icon: Package },
  { id: 1, name: 'Port Dispatch', location: 'Mormugao Port', icon: MapPin },
  { id: 2, name: 'Loaded on Ship', location: 'MV Sagar Kanya', icon: Ship },
  { id: 3, name: 'Antarctica Arrival', location: 'Larsemann Hills', icon: MapPin },
  { id: 4, name: 'Maitri Station', location: 'Maitri Research Station', icon: Home },
  { id: 5, name: 'Field Delivery', location: 'Field Camp', icon: Package },
]

const DEFAULT_CARGO = {
  id: 'ANT-001',
  item: 'Satellite Communication Equipment',
  priority: 'Critical',
  weight: '420 kg',
  expedition: 'ANT-47',
  currentCheckpoint: 0,
  status: 'Pending Dispatch',
  history: [] as { checkpoint: number; name: string; location: string; officer: string; role: string; time: string }[],
}

export default function CargoScan() {
  const [cargo, setCargo] = useState(DEFAULT_CARGO)
  const [selectedRole, setSelectedRole] = useState(ROLES[0])
  const [scanning, setScanning] = useState(false)
  const [scanSuccess, setScanSuccess] = useState(false)
  const [officerName, setOfficerName] = useState('')
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  // Online/Offline detection
  useEffect(() => {
    const goOnline = () => setIsOnline(true)
    const goOffline = () => setIsOnline(false)
    window.addEventListener('online', goOnline)
    window.addEventListener('offline', goOffline)
    return () => {
      window.removeEventListener('online', goOnline)
      window.removeEventListener('offline', goOffline)
    }
  }, [])

  // Load cargo state (API first, fallback localStorage)
  const loadCargo = useCallback(async () => {
    try {
      if (API_URL && isOnline) {
        const res = await fetch(`${API_URL}/api/cargo/ANT-001`)
        if (res.ok) {
          const data = await res.json()
          setCargo(data)
          localStorage.setItem('polaris_cargo_ant001', JSON.stringify(data))
          setLastSync(new Date())
          return
        }
      }
    } catch {}
    // Offline / fallback
    try {
      const raw = localStorage.getItem('polaris_cargo_ant001')
      if (raw) setCargo(JSON.parse(raw))
    } catch {}
  }, [isOnline])

  useEffect(() => {
    loadCargo()
    const interval = setInterval(loadCargo, 2500) // poll every 2.5s for multi-user
    return () => clearInterval(interval)
  }, [loadCargo])

  const saveCargo = async (updated: typeof DEFAULT_CARGO) => {
    localStorage.setItem('polaris_cargo_ant001', JSON.stringify(updated))
    setCargo(updated)
    window.dispatchEvent(new Event('polaris-cargo-update'))

    if (API_URL && isOnline) {
      try {
        await fetch(`${API_URL}/api/cargo/ANT-001`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updated),
        })
        setLastSync(new Date())
      } catch {
        toast.message('Saved offline — will sync when online')
      }
    }
  }

  const handleScan = async () => {
    if (!officerName.trim()) {
      toast.error('Enter your name / credentials first')
      return
    }

    const expected = selectedRole.checkpoint
    if (cargo.currentCheckpoint !== expected) {
      if (cargo.currentCheckpoint > expected) {
        toast.error(`This checkpoint is already completed. Cargo is currently at: ${CHECKPOINTS[cargo.currentCheckpoint]?.name}`)
      } else {
        toast.error(`Cargo has not reached your location yet. Current: ${CHECKPOINTS[cargo.currentCheckpoint]?.name}`)
      }
      return
    }

    if (cargo.currentCheckpoint >= CHECKPOINTS.length) {
      toast.info('Cargo already fully delivered')
      return
    }

    setScanning(true)
    setScanSuccess(false)

    // Simulate scan delay
    await new Promise(r => setTimeout(r, 1600))

    const cp = CHECKPOINTS[cargo.currentCheckpoint]
    const now = new Date().toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' })

    const updated = {
      ...cargo,
      currentCheckpoint: cargo.currentCheckpoint + 1,
      status: cargo.currentCheckpoint + 1 >= CHECKPOINTS.length ? 'Delivered' : `In Transit — ${CHECKPOINTS[cargo.currentCheckpoint + 1]?.name || 'Next'}`,
      history: [
        ...cargo.history,
        {
          checkpoint: cargo.currentCheckpoint,
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
    toast.success(`✅ Confirmed at ${cp.name}`, {
      description: `${selectedRole.label} · ${officerName}`,
    })
    setTimeout(() => setScanSuccess(false), 2500)
  }

  const resetDemo = async () => {
    await saveCargo({ ...DEFAULT_CARGO })
    toast.message('Demo reset — cargo ready at India Warehouse')
  }

  const isComplete = cargo.currentCheckpoint >= CHECKPOINTS.length
  const canScan = cargo.currentCheckpoint === selectedRole.checkpoint && !isComplete

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ice-50">Cargo Checkpoint Scanner</h1>
          <p className="text-ice-500 text-sm">Role-based scanning · Multi-user live updates · Online + Offline</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-xs px-2.5 py-1 rounded-full border font-medium",
            isOnline ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"
          )}>
            {isOnline ? '● Online' : '○ Offline'}
          </span>
          {lastSync && <span className="text-[10px] text-ice-600">Synced {lastSync.toLocaleTimeString()}</span>}
          <button onClick={resetDemo} className="text-xs px-3 py-1.5 rounded-lg bg-ice-800 text-ice-400 hover:text-ice-200 border border-ice-700 flex items-center gap-1">
            <RefreshCw className="w-3 h-3" /> Reset
          </button>
        </div>
      </div>

      {/* Cargo Status Card */}
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
          <div className="text-right text-xs">
            <p className="text-ice-500">Status</p>
            <p className="text-cyan-300 font-medium">{cargo.status}</p>
            <p className="text-ice-600 mt-0.5">{cargo.weight} · {cargo.expedition}</p>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="p-6 overflow-x-auto">
          <div className="relative min-w-[600px]">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-ice-800" />
            <div 
              className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-700"
              style={{ width: `${(cargo.currentCheckpoint / CHECKPOINTS.length) * 100}%` }}
            />
            <div className="relative flex justify-between">
              {CHECKPOINTS.map((cp, i) => {
                const done = i < cargo.currentCheckpoint
                const current = i === cargo.currentCheckpoint
                const Icon = cp.icon
                return (
                  <div key={cp.id} className="flex flex-col items-center w-20">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all z-10",
                      done && "bg-emerald-500 border-emerald-400 text-white",
                      current && "bg-cyan-500/20 border-cyan-400 text-cyan-300 ring-4 ring-cyan-500/20",
                      !done && !current && "bg-ice-900 border-ice-700 text-ice-600"
                    )}>
                      {done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-4 h-4" />}
                    </div>
                    <p className={cn(
                      "text-[10px] mt-2 text-center leading-tight font-medium",
                      done ? "text-emerald-400" : current ? "text-cyan-300" : "text-ice-600"
                    )}>{cp.name}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Scanner / Credentials */}
        <div className="glass rounded-xl border border-ice-800/50 p-6 space-y-5">
          <h3 className="font-semibold text-ice-100 flex items-center gap-2">
            <LogIn className="w-4 h-4 text-cyan-400" /> Officer Credentials & Role
          </h3>

          <div>
            <label className="text-xs text-ice-500 block mb-1.5">Your Name / ID</label>
            <input
              value={officerName}
              onChange={e => setOfficerName(e.target.value)}
              placeholder="e.g. Anita Sharma / LOG-042"
              className="w-full bg-ice-900 border border-ice-700 rounded-lg px-3 py-2.5 text-sm text-ice-100 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
            />
          </div>

          <div>
            <label className="text-xs text-ice-500 block mb-1.5">Select Your Role / Location</label>
            <div className="grid gap-1.5">
              {ROLES.map(role => (
                <button
                  key={role.id}
                  onClick={() => setSelectedRole(role)}
                  className={cn(
                    "text-left px-3 py-2.5 rounded-lg border text-sm transition-all",
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

          {/* Scanner visual */}
          <div className="relative aspect-video max-h-40 rounded-xl overflow-hidden border-2 border-dashed border-cyan-500/30 bg-ice-900/50 flex items-center justify-center">
            <QrCode className="w-16 h-16 text-ice-700" />
            {scanning && <div className="absolute inset-0 bg-cyan-500/10"><div className="scan-line" /></div>}
            {scanSuccess && (
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-14 h-14 text-emerald-400" />
              </motion.div>
            )}
            <div className="absolute top-2 left-2 w-5 h-5 border-t-2 border-l-2 border-cyan-400" />
            <div className="absolute top-2 right-2 w-5 h-5 border-t-2 border-r-2 border-cyan-400" />
            <div className="absolute bottom-2 left-2 w-5 h-5 border-b-2 border-l-2 border-cyan-400" />
            <div className="absolute bottom-2 right-2 w-5 h-5 border-b-2 border-r-2 border-cyan-400" />
          </div>

          <div className="text-center text-sm">
            {isComplete ? (
              <p className="text-emerald-400 font-medium">✅ Fully Delivered</p>
            ) : canScan ? (
              <p className="text-cyan-300">Ready to scan at <strong>{CHECKPOINTS[selectedRole.checkpoint]?.name}</strong></p>
            ) : (
              <p className="text-amber-400/90">
                Cargo is currently at <strong>{CHECKPOINTS[cargo.currentCheckpoint]?.name}</strong>. 
                Your role expects checkpoint #{selectedRole.checkpoint + 1}.
              </p>
            )}
          </div>

          <button
            onClick={handleScan}
            disabled={scanning || !canScan || isComplete}
            className={cn(
              "w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all",
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
            <Clock className="w-4 h-4 text-cyan-400" /> Live Scan History
          </h3>
          {cargo.history.length === 0 ? (
            <p className="text-ice-600 text-sm text-center py-12">No scans yet. First officer (India Warehouse) should scan to start the chain.</p>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto">
              <AnimatePresence>
                {[...cargo.history].reverse().map((h, i) => (
                  <motion.div
                    key={`${h.time}-${i}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-ice-900/50 border border-ice-800"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ice-100">{h.name}</p>
                      <p className="text-xs text-ice-400">{h.location}</p>
                      <p className="text-xs text-cyan-400/80 mt-0.5 flex items-center gap-1">
                        <User className="w-3 h-3" /> {h.officer} · {h.role}
                      </p>
                      <p className="text-[10px] text-ice-600 mt-0.5">{h.time}</p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <div className="glass rounded-xl border border-amber-500/20 p-4 bg-amber-500/5 text-sm text-amber-100/90">
        <strong>Google Meet Demo Instructions:</strong>
        <ol className="list-decimal ml-5 mt-1 space-y-0.5 text-amber-200/80">
          <li>Each of the 6 team members opens this page and selects a <strong>different Role</strong>.</li>
          <li>Enter your name → Click “Confirm Scan” only when it is your turn (when cargo reaches your checkpoint).</li>
          <li>Everyone’s screen updates within ~2.5 seconds automatically.</li>
          <li>Works offline too (localStorage) and syncs when back online.</li>
        </ol>
      </div>
    </div>
  )
}
