import { motion } from 'framer-motion'

type Loc = {
  id: string
  name: string
  type: 'station' | 'camp' | 'vessel' | 'port'
  personnel: number
  cargo: number
  status: 'operational' | 'alert' | 'transit'
  x: number
  y: number
}

const LOCS: Loc[] = [
  { id: 'goa', name: 'Goa / Mormugao Port', type: 'port', personnel: 12, cargo: 40, status: 'operational', x: 62, y: 26 },
  { id: 'ship', name: 'MV Sagar Kanya', type: 'vessel', personnel: 6, cargo: 17, status: 'transit', x: 50, y: 48 },
  { id: 'maitri', name: 'Maitri Station', type: 'station', personnel: 82, cargo: 124, status: 'operational', x: 42, y: 78 },
  { id: 'campb', name: 'Field Camp B', type: 'camp', personnel: 8, cargo: 12, status: 'alert', x: 37, y: 83 },
  { id: 'bharati', name: 'Bharati Station', type: 'station', personnel: 31, cargo: 68, status: 'operational', x: 74, y: 76 },
]

const pinColor = (l: Loc) => {
  if (l.status === 'alert') return '#ef4444'
  if (l.type === 'vessel') return '#3b82f6'
  if (l.type === 'camp') return '#f59e0b'
  if (l.type === 'port') return '#a78bfa'
  return '#10b981'
}

export default function OperationalMap() {
  return (
    <div className="relative w-full h-[360px] md:h-[400px] overflow-hidden bg-[#0a1628]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c1929] via-[#0a2035] to-[#071525]" />

      <svg className="absolute inset-0 w-full h-full opacity-[0.1]" xmlns="http://www.w3.org/2000/svg">
        {Array.from({ length: 14 }).map((_, i) => (
          <line key={`h${i}`} x1="0" y1={`${(i + 1) * 7}%`} x2="100%" y2={`${(i + 1) * 7}%`} stroke="#67e8f9" strokeWidth="0.5" />
        ))}
        {Array.from({ length: 12 }).map((_, i) => (
          <line key={`v${i}`} x1={`${(i + 1) * 8}%`} y1="0" x2={`${(i + 1) * 8}%`} y2="100%" stroke="#67e8f9" strokeWidth="0.5" />
        ))}
      </svg>

      <svg viewBox="0 0 1000 560" className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0e7490" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#020617" stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id="indiaFill" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          <linearGradient id="antFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f1f5f9" stopOpacity="0.28" />
            <stop offset="55%" stopColor="#94a3b8" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#64748b" stopOpacity="0.1" />
          </linearGradient>
          <filter id="routeGlow">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        <ellipse cx="500" cy="36" rx="400" ry="42" fill="#1e293b" opacity="0.35" />

        {/* India */}
        <path
          d="M575 85
             C600 95 625 130 618 165
             C612 200 598 225 575 242
             C555 255 538 262 522 255
             C505 246 498 225 505 195
             C512 160 525 125 548 100
             C560 90 568 86 575 85 Z"
          fill="url(#indiaFill)"
          stroke="#64748b"
          strokeWidth="1.5"
        />
        <text x="548" y="165" fill="#cbd5e1" fontSize="12" fontFamily="system-ui,sans-serif" fontWeight="600">INDIA</text>
        <text x="545" y="178" fill="#64748b" fontSize="8" fontFamily="system-ui,sans-serif">Goa · Mormugao Port</text>
        <text x="470" y="195" fill="#0e7490" fontSize="8" fontFamily="system-ui,sans-serif" opacity="0.55">Arabian Sea</text>

        {/* Southern Ocean */}
        <rect x="0" y="295" width="1000" height="70" fill="url(#oceanGrad)" />
        <text x="390" y="338" fill="#22d3ee" fontSize="11" fontFamily="system-ui,sans-serif" opacity="0.4" letterSpacing="4">
          SOUTHERN OCEAN
        </text>

        {/* Sealift routes */}
        <path
          d="M590 240 C 540 300 510 360 480 420 C 460 455 440 475 420 485"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="2.2"
          strokeDasharray="9 7"
          opacity="0.55"
          filter="url(#routeGlow)"
        />
        <path
          d="M590 240 C 600 310 680 380 740 450"
          fill="none"
          stroke="#22d3ee"
          strokeWidth="1.5"
          strokeDasharray="6 9"
          opacity="0.28"
        />

        {/* Antarctica */}
        <path
          d="M60 415
             C140 395 230 385 320 392
             C420 400 500 412 590 405
             C680 398 780 412 900 435
             C940 448 970 470 990 510
             L990 560 L10 560 L10 490
             C25 455 40 430 60 415 Z"
          fill="url(#antFill)"
          stroke="#e2e8f0"
          strokeWidth="1.3"
          opacity="0.95"
        />
        <path d="M180 440 C280 428 360 435 450 448" fill="none" stroke="#f8fafc" strokeWidth="0.9" opacity="0.2" />
        <path d="M480 450 C580 438 680 450 820 465" fill="none" stroke="#f8fafc" strokeWidth="0.8" opacity="0.15" />

        <text x="400" y="515" fill="#94a3b8" fontSize="14" fontFamily="system-ui,sans-serif" opacity="0.55" letterSpacing="5">
          ANTARCTICA
        </text>
        <text x="355" y="532" fill="#64748b" fontSize="8" fontFamily="system-ui,sans-serif" opacity="0.65">
          East Antarctica · Larsemann Hills · Princess Elizabeth Land
        </text>

        <circle cx="420" cy="475" r="32" fill="#10b981" opacity="0.07" />
        <circle cx="740" cy="458" r="26" fill="#10b981" opacity="0.07" />
      </svg>

      {LOCS.map((loc, i) => (
        <motion.div
          key={loc.id}
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.25 + i * 0.09, type: 'spring', stiffness: 220 }}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group"
          style={{ left: `${loc.x}%`, top: `${loc.y}%` }}
        >
          <span
            className="absolute inset-0 -m-1.5 rounded-full animate-ping opacity-25"
            style={{
              backgroundColor: pinColor(loc),
              animationDuration: loc.status === 'alert' ? '1.1s' : '2.4s',
            }}
          />
          <div
            className="relative w-3.5 h-3.5 rounded-full border-2 border-white"
            style={{
              backgroundColor: pinColor(loc),
              boxShadow: `0 0 14px ${pinColor(loc)}88`,
            }}
          />
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
            <div className="rounded-lg px-3 py-2 text-[11px] whitespace-nowrap border border-white/10 bg-slate-900/95 shadow-xl backdrop-blur-md">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: pinColor(loc) }} />
                {loc.name}
              </p>
              <p className="text-slate-400 mt-0.5 capitalize">{loc.type} · {loc.status}</p>
              <p className="text-slate-500">{loc.personnel} personnel · {loc.cargo} cargo</p>
            </div>
          </div>
          <p className="absolute left-1/2 -translate-x-1/2 top-full mt-1.5 text-[9px] text-slate-400 whitespace-nowrap font-medium group-hover:text-cyan-300 transition-colors">
            {loc.name.replace(' Station', '').replace(' / Mormugao Port', '')}
          </p>
        </motion.div>
      ))}

      <div className="absolute bottom-0 inset-x-0 px-4 py-2 flex items-center justify-between text-[10px] text-slate-500 bg-gradient-to-t from-[#071525] via-[#071525]/90 to-transparent">
        <span className="text-cyan-700/80">dashed line = primary sealift route</span>
        <span>Schematic · not to scale</span>
      </div>
    </div>
  )
}
