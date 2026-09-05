import { motion } from 'framer-motion'
import { Ship, MapPin, Package, Radio } from 'lucide-react'
import CargoLiveMap from '@/components/map/CargoLiveMap'
import PageHeader from '@/components/shared/PageHeader'

const focus = {
  id: 'ANT-001',
  item: 'Satellite Communication Equipment',
  location: 'MV Sagar Kanya · Southern Ocean',
  status: 'IN TRANSIT',
  progress: 72,
  eta: '15 Dec 2026',
  condition: 'GOOD',
}

export default function CargoTracking() {
  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="Live Cargo Tracking"
        subtitle="Real-time positions on the India → Antarctica sealift corridor"
        backTo="/cargo"
        backLabel="← Cargo & Logistics"
      />

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
              <p className="text-sm text-ice-400">{focus.item}</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/25 font-medium flex items-center gap-1.5">
            <Radio className="w-3 h-3 animate-pulse" /> {focus.status}
          </span>
        </div>

        <div className="grid sm:grid-cols-4 gap-3 p-4 text-sm border-b border-ice-800/40">
          <div className="bg-ice-900/40 rounded-xl p-3 border border-ice-800/50">
            <p className="text-ice-500 text-[10px] uppercase tracking-wide">Current location</p>
            <p className="text-ice-100 font-medium mt-0.5 flex items-center gap-1">
              <Ship className="w-3.5 h-3.5 text-cyan-400" /> {focus.location}
            </p>
          </div>
          <div className="bg-ice-900/40 rounded-xl p-3 border border-ice-800/50">
            <p className="text-ice-500 text-[10px] uppercase tracking-wide">Progress</p>
            <p className="text-cyan-300 font-bold mt-0.5 text-lg">{focus.progress}%</p>
          </div>
          <div className="bg-ice-900/40 rounded-xl p-3 border border-ice-800/50">
            <p className="text-ice-500 text-[10px] uppercase tracking-wide">ETA</p>
            <p className="text-ice-100 font-medium mt-0.5">{focus.eta}</p>
          </div>
          <div className="bg-ice-900/40 rounded-xl p-3 border border-ice-800/50">
            <p className="text-ice-500 text-[10px] uppercase tracking-wide">Condition</p>
            <p className="text-emerald-400 font-medium mt-0.5">{focus.condition}</p>
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="relative flex justify-between">
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-ice-800" />
            <div className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-400" style={{ width: '72%' }} />
            {['India Warehouse', 'Port', 'Ship', 'Antarctica', 'Maitri'].map((s, i) => (
              <div key={s} className="relative flex flex-col items-center z-[1] flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                    i < 3
                      ? 'bg-cyan-500 border-cyan-400 text-white'
                      : i === 3
                        ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300'
                        : 'bg-ice-900 border-ice-600 text-ice-500'
                  }`}
                >
                  {i === 2 ? <Ship className="w-3.5 h-3.5" /> : <MapPin className="w-3.5 h-3.5" />}
                </div>
                <p className="text-[10px] mt-1.5 text-ice-500 text-center leading-tight px-0.5">{s}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass rounded-2xl border border-ice-800/50 overflow-hidden"
      >
        <div className="px-5 py-3 border-b border-ice-800/50 flex items-center justify-between">
          <h2 className="font-semibold text-ice-100 text-sm flex items-center gap-2">
            <MapPin className="w-4 h-4 text-cyan-400" /> Live cargo map
          </h2>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Tracking active
          </span>
        </div>
        <CargoLiveMap highlightId="ANT-001" />
      </motion.div>
    </div>
  )
}
