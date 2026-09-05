import { motion } from 'framer-motion'
import { Package, Ship, MapPin, Navigation } from 'lucide-react'

export type CargoMapItem = {
  id: string
  item: string
  status: string
  progress: number // 0–100 along route
  dest: string
}

const DEFAULT_CARGO: CargoMapItem[] = [
  { id: 'ANT-001', item: 'Satellite Equipment', status: 'In Transit', progress: 72, dest: 'Maitri' },
  { id: 'ANT-002', item: 'Diesel Fuel', status: 'Delayed', progress: 38, dest: 'Maitri' },
  { id: 'ANT-015', item: 'Aviation Fuel', status: 'Delayed', progress: 42, dest: 'Maitri' },
  { id: 'ANT-003', item: 'Food Rations', status: 'Delivered', progress: 100, dest: 'Bharati' },
  { id: 'ANT-004', item: 'Medical Kits', status: 'Pending', progress: 8, dest: 'Field Camp B' },
]

/** Approximate positions along sealift path (x%, y%) for progress 0–100 */
function posOnRoute(progress: number, dest: string): { x: number; y: number } {
  const p = Math.max(0, Math.min(100, progress)) / 100
  // Route waypoints: Goa -> Ocean -> Approach -> Station
  const goa = { x: 62, y: 24 }
  const midOcean = { x: 52, y: 48 }
  const approach = dest.toLowerCase().includes('bharati')
    ? { x: 68, y: 68 }
    : dest.toLowerCase().includes('field')
      ? { x: 40, y: 72 }
      : { x: 44, y: 70 }
  const station = dest.toLowerCase().includes('bharati')
    ? { x: 74, y: 76 }
    : dest.toLowerCase().includes('field')
      ? { x: 37, y: 82 }
      : { x: 42, y: 78 }

  const segs = [goa, midOcean, approach, station]
  const t = p * (segs.length - 1)
  const i = Math.min(Math.floor(t), segs.length - 2)
  const f = t - i
  return {
    x: segs[i].x + (segs[i + 1].x - segs[i].x) * f,
    y: segs[i].y + (segs[i + 1].y - segs[i].y) * f,
  }
}

const statusColor = (s: string) => {
  if (s === 'Delivered') return '#10b981'
  if (s === 'Delayed') return '#f59e0b'
  if (s === 'Pending') return '#64748b'
  return '#22d3ee' // In Transit
}

type Props = {
  items?: CargoMapItem[]
  highlightId?: string
  compact?: boolean
}

export default function CargoLiveMap({ items = DEFAULT_CARGO, highlightId, compact }: Props) {
  return (
    <div className={`relative w-full overflow-hidden rounded-b-2xl ${compact ? 'h-[280px]' : 'h-[360px] md:h-[400px]'} bg-[#061018]`}>
      {/* Atmosphere */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(14,165,233,0.12),transparent_55%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a1628] via-[#071525] to-[#030d18]" />

      {/* Grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.08]">
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={`${(i + 1) * 8}%`} x2="100%" y2={`${(i + 1) * 8}%`} stroke="#67e8f9" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 10 }).map((_, i) => (
          <line key={`v${i}`} x1={`${(i + 1) * 10}%`} y1="0" x2={`${(i + 1) * 10}%`} y2="100%" stroke="#67e8f9" strokeWidth="0.5" />
        ))}
      </svg>

      <svg viewBox="0 0 1000 560" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="cIndia" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="cAnt" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#64748b" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id="cOcean" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0e7490" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.3" />
          </linearGradient>
          <filter id="cGlow">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* India */}
        <path
          d="M575 85 C600 95 625 130 618 165 C612 200 598 225 575 242 C555 255 538 262 522 255 C505 246 498 225 505 195 C512 160 525 125 548 100 C560 90 568 86 575 85 Z"
          fill="url(#cIndia)" stroke="#64748b" strokeWidth="1.5"
        />
        <text x="548" y="160" fill="#e2e8f0" fontSize="11" fontFamily="system-ui" fontWeight="600">INDIA</text>
        <text x="538" y="173" fill="#64748b" fontSize="8" fontFamily="system-ui">Goa Port</text>

        <rect x="0" y="300" width="1000" height="65" fill="url(#cOcean)" />
        <text x="400" y="338" fill="#22d3ee" fontSize="10" fontFamily="system-ui" opacity="0.35" letterSpacing="3">SOUTHERN OCEAN</text>

        {/* Main route */}
        <path
          d="M590 240 C 540 300 510 360 480 420 C 460 455 440 475 420 485"
          fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeDasharray="10 7" opacity="0.5" filter="url(#cGlow)"
        />
        <path
          d="M590 240 C 600 310 680 380 740 450"
          fill="none" stroke="#22d3ee" strokeWidth="1.5" strokeDasharray="6 9" opacity="0.25"
        />

        {/* Antarctica */}
        <path
          d="M60 415 C140 395 230 385 320 392 C420 400 500 412 590 405 C680 398 780 412 900 435 C940 448 970 470 990 510 L990 560 L10 560 L10 490 C25 455 40 430 60 415 Z"
          fill="url(#cAnt)" stroke="#e2e8f0" strokeWidth="1.2" opacity="0.95"
        />
        <text x="400" y="518" fill="#94a3b8" fontSize="13" fontFamily="system-ui" opacity="0.5" letterSpacing="4">ANTARCTICA</text>
        <text x="370" y="534" fill="#64748b" fontSize="8" fontFamily="system-ui" opacity="0.6">Maitri · Bharati · Field Camps</text>

        {/* Fixed landmarks */}
        <circle cx="600" cy="230" r="5" fill="#a78bfa" stroke="#fff" strokeWidth="1.5" />
        <circle cx="420" cy="475" r="6" fill="#10b981" stroke="#fff" strokeWidth="1.5" opacity="0.9" />
        <circle cx="740" cy="455" r="6" fill="#10b981" stroke="#fff" strokeWidth="1.5" opacity="0.9" />
      </svg>

      {/* Live cargo markers */}
      {items.map((c, i) => {
        const pos = posOnRoute(c.progress, c.dest)
        const color = statusColor(c.status)
        const active = highlightId === c.id
        return (
          <motion.div
            key={c.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 + i * 0.08, type: 'spring' }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group"
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            {c.status === 'In Transit' && (
              <span className="absolute inset-0 -m-2 rounded-full animate-ping opacity-30" style={{ backgroundColor: color }} />
            )}
            <div
              className={`relative flex items-center justify-center rounded-full border-2 border-white shadow-lg ${active ? 'w-5 h-5' : 'w-3.5 h-3.5'}`}
              style={{ backgroundColor: color, boxShadow: `0 0 16px ${color}99` }}
            >
              {c.status === 'In Transit' && <Navigation className="w-2.5 h-2.5 text-white" />}
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
              <div className="rounded-lg px-3 py-2 text-[11px] whitespace-nowrap border border-white/10 bg-slate-950/95 shadow-xl">
                <p className="font-mono font-semibold text-cyan-300">{c.id}</p>
                <p className="text-white text-xs">{c.item}</p>
                <p className="text-slate-400 mt-0.5">{c.status} · {c.progress}% · → {c.dest}</p>
              </div>
            </div>
            <p className="absolute left-1/2 -translate-x-1/2 top-full mt-1 text-[9px] font-mono text-slate-400 group-hover:text-cyan-300 whitespace-nowrap">
              {c.id}
            </p>
          </motion.div>
        )
      })}

      {/* Legend */}
      <div className="absolute top-3 right-3 rounded-lg border border-white/10 bg-slate-950/80 backdrop-blur px-2.5 py-2 text-[10px] space-y-1">
        <p className="flex items-center gap-1.5 text-slate-300"><span className="w-2 h-2 rounded-full bg-cyan-400" /> In Transit</p>
        <p className="flex items-center gap-1.5 text-slate-300"><span className="w-2 h-2 rounded-full bg-amber-400" /> Delayed</p>
        <p className="flex items-center gap-1.5 text-slate-300"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Delivered</p>
        <p className="flex items-center gap-1.5 text-slate-300"><span className="w-2 h-2 rounded-full bg-slate-500" /> Pending</p>
      </div>

      <div className="absolute bottom-0 inset-x-0 px-3 py-1.5 flex justify-between text-[9px] text-slate-500 bg-gradient-to-t from-[#030d18] to-transparent">
        <span className="flex items-center gap-1"><Ship className="w-3 h-3" /> Live cargo positions along sealift corridor</span>
        <span>Schematic · updates with tracking data</span>
      </div>
    </div>
  )
}
