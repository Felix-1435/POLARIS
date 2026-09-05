import { 
  QrCode, CheckCircle2, Package, MapPin, Clock, User, 
  ArrowRight, Ship, Home, Search
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Shared cargo state via localStorage for multi-user demo
const CARGO_KEY = 'polaris_cargo_ant001'

const checkpoints = [
  { id: 1, name: 'India Warehouse', location: 'Goa, India', icon: Package, statusKey: 'warehouse' },
  { id: 2, name: 'Port Dispatch', location: 'Mormugao Port', icon: MapPin, statusKey: 'port' },
  { id: 3, name: 'Loaded on Ship', location: 'MV Sagar Kanya', icon: Ship, statusKey: 'ship' },
  { id: 4, name: 'Antarctica Arrival', location: 'Larsemann Hills', icon: MapPin, statusKey: 'antarctica' },
  { id: 5, name: 'Maitri Station', location: 'Maitri Research Station', icon: Home, statusKey: 'maitri' },
]

const defaultCargo = {
  id: 'ANT-001',
  item: 'Satellite Communication Equipment',
  priority: 'Critical',
  weight: '420 kg',
  expedition: 'ANT-47',
  currentCheckpoint: 0,
  history: [] as { checkpoint: string; time: string; officer: string }[],
}

function loadCargo() {
  try {
    const raw = localStorage.getItem(CARGO_KEY)
    return raw ? JSON.parse(raw) : { ...defaultCargo }
  } catch {
    return { ...defaultCargo }
  }
}

function saveCargo(data: typeof defaultCargo) {
  localStorage.setItem(CARGO_KEY, JSON.stringify(data))
  // Dispatch event so other tabs update
  window.dispatchEvent(new Event('polaris-cargo-update'))
}

export default function CargoSearch() {
  const [cargo, setCargo] = useState(loadCargo)
  const [scanning, setSearchning] = useState(false)
  const [scanSuccess, setSearchSuccess] = useState(false)
  const [officer, setOfficer] = useState('Logistics Officer')

  // Listen for updates from other tabs/users
  useEffect(() => {
    const handler = () => setCargo(loadCargo())
    window.addEventListener('polaris-cargo-update', handler)
    window.addEventListener('storage', handler)
    // Poll every 2s for demo reliability across devices
    const interval = setInterval(() => setCargo(loadCargo()), 2000)
    return () => {
      window.removeEventListener('polaris-cargo-update', handler)
      window.removeEventListener('storage', handler)
      clearInterval(interval)
    }
  }, [])

  const nextCheckpoint = checkpoints[cargo.currentCheckpoint]
  const isComplete = cargo.currentCheckpoint >= checkpoints.length

  const handleSearch = () => {
    if (isComplete) {
      toast.info('Cargo already fully delivered to Maitri')
      return
    }
    setSearchning(true)
    setSearchSuccess(false)

    setTimeout(() => {
      const cp = checkpoints[cargo.currentCheckpoint]
      const now = new Date().toLocaleString('en-IN', { 
        day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
      })
      const updated = {
        ...cargo,
        currentCheckpoint: cargo.currentCheckpoint + 1,
        history: [
          ...cargo.history,
          { checkpoint: cp.name, time: now, officer }
        ]
      }
      saveCargo(updated)
      setCargo(updated)
      setSearchning(false)
      setSearchSuccess(true)
      toast.success(`✅ Confirmed: ${cp.name}`, {
        description: `${cargo.id} scanned at ${cp.location}`,
      })
      setTimeout(() => setSearchSuccess(false), 3000)
    }, 1800)
  }

  const resetDemo = () => {
    saveCargo({ ...defaultCargo })
    setCargo({ ...defaultCargo })
    toast.message('Demo reset — cargo ready at India Warehouse')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ice-50">Cargo Checkpoint Searchner</h1>
          <p className="text-ice-500 text-sm">Multi-user live demo • Search to advance progress</p>
        </div>
        <button onClick={resetDemo} className="text-xs px-3 py-1.5 rounded-lg bg-ice-800 text-ice-400 hover:text-ice-200 border border-ice-700">
          Reset Demo
        </button>
      </div>

      {/* Cargo Card */}
      <motion.div layout className="glass rounded-xl border border-cyan-500/20 overflow-hidden">
        <div className="bg-gradient-to-r from-cyan-500/10 to-blue-500/10 px-6 py-4 border-b border-ice-800/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Package className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h2 className="font-bold text-lg text-ice-50 font-mono">{cargo.id}</h2>
              <p className="text-sm text-ice-400">{cargo.item}</p>
            </div>
          </div>
          <div className="text-right text-xs text-ice-500">
            <p>Priority: <span className="text-red-400 font-medium">{cargo.priority}</span></p>
            <p>{cargo.weight} · {cargo.expedition}</p>
          </div>
        </div>

        {/* Progress Timeline */}
        <div className="p-6">
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-ice-800" />
            <div 
              className="absolute top-5 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-emerald-500 transition-all duration-700"
              style={{ width: `${(cargo.currentCheckpoint / checkpoints.length) * 100}%` }}
            />
            <div className="relative flex justify-between">
              {checkpoints.map((cp, i) => {
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
                    )}>
                      {cp.name}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Searchner Area */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass rounded-xl border border-ice-800/50 p-6">
          <h3 className="font-semibold text-ice-100 mb-4 flex items-center gap-2">
            <Search className="w-4 h-4 text-cyan-400" /> Checkpoint Searchner
          </h3>

          {!isComplete ? (
            <>
              <div className="relative aspect-square max-w-[240px] mx-auto mb-4 rounded-xl overflow-hidden border-2 border-dashed border-cyan-500/40 bg-ice-900/50">
                {/* Simulated camera view */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <QrCode className="w-24 h-24 text-ice-700" />
                </div>
                {scanning && (
                  <div className="absolute inset-0 bg-cyan-500/10">
                    <div className="scan-line" />
                  </div>
                )}
                {scanSuccess && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center"
                  >
                    <CheckCircle2 className="w-16 h-16 text-emerald-400" />
                  </motion.div>
                )}
                {/* Corner brackets */}
                <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-cyan-400" />
                <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-400" />
                <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-cyan-400" />
                <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-cyan-400" />
              </div>

              <div className="text-center mb-4">
                <p className="text-sm text-ice-300">Next Checkpoint</p>
                <p className="text-lg font-bold text-cyan-300">{nextCheckpoint?.name}</p>
                <p className="text-xs text-ice-500">{nextCheckpoint?.location}</p>
              </div>

              <div className="mb-4">
                <label className="text-xs text-ice-500 block mb-1">Searchning Officer</label>
                <select 
                  value={officer} 
                  onChange={e => setOfficer(e.target.value)}
                  className="w-full bg-ice-900 border border-ice-700 rounded-lg px-3 py-2 text-sm text-ice-200"
                >
                  <option>Logistics Officer — Team India</option>
                  <option>Port Supervisor — Mormugao</option>
                  <option>Ship Cargo Master — MV Sagar Kanya</option>
                  <option>Landing Officer — Antarctica</option>
                  <option>Station Logistics — Maitri</option>
                  <option>Team Member 6 — Field Ops</option>
                </select>
              </div>

              <button
                onClick={handleSearch}
                disabled={scanning}
                className={cn(
                  "w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all",
                  scanning 
                    ? "bg-ice-700 cursor-wait" 
                    : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-600/30"
                )}
              >
                {scanning ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Searchning QR...
                  </>
                ) : (
                  <>
                    <QrCode className="w-5 h-5" /> Confirm Search & Advance
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="text-center py-8">
              <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-emerald-300">Delivery Complete</h3>
              <p className="text-ice-400 text-sm mt-1">ANT-001 successfully received at Maitri Station</p>
            </div>
          )}
        </div>

        {/* History */}
        <div className="glass rounded-xl border border-ice-800/50 p-6">
          <h3 className="font-semibold text-ice-100 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" /> Search History
          </h3>
          {cargo.history.length === 0 ? (
            <p className="text-ice-600 text-sm text-center py-8">No scans yet. Be the first to confirm dispatch from India Warehouse.</p>
          ) : (
            <div className="space-y-3">
              <AnimatePresence>
                {[...cargo.history].reverse().map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-start gap-3 p-3 rounded-lg bg-ice-900/50 border border-ice-800"
                  >
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ice-100">{h.checkpoint}</p>
                      <p className="text-xs text-ice-500 flex items-center gap-1 mt-0.5">
                        <User className="w-3 h-3" /> {h.officer}
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

      <div className="glass rounded-xl border border-amber-500/20 p-4 bg-amber-500/5">
        <p className="text-sm text-amber-200/90">
          <strong>Demo Tip for Google Meet:</strong> Share this page. Each of the 6 team members selects a different officer role and clicks “Confirm Search” in sequence. Everyone’s browser updates live within 2 seconds via shared localStorage + polling. Perfect for showing end-to-end cargo flow.
        </p>
      </div>
    </div>
  )
}
