import { Cloud, Wind, Thermometer, Eye, AlertTriangle } from 'lucide-react'

const stations = [
  { name: 'Maitri Station', temp: -22, wind: 38, vis: 4.2, condition: 'Moderate Snow', ops: 'Caution', color: 'amber' },
  { name: 'Bharati Station', temp: -18, wind: 22, vis: 8.5, condition: 'Clear', ops: 'Normal', color: 'emerald' },
  { name: 'Field Camp B', temp: -28, wind: 52, vis: 1.1, condition: 'Blizzard Risk', ops: 'Not Recommended', color: 'red' },
  { name: 'MV Sagar Kanya', temp: -4, wind: 45, vis: 6.0, condition: 'Rough Seas', ops: 'Delayed', color: 'amber' },
]

export default function Weather() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ice-50">Polar Weather</h1>
        <p className="text-ice-500 text-sm">Live conditions affecting operations, cargo and personnel movement</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {stations.map(s => (
          <div key={s.name} className={`glass rounded-xl border p-5 ${s.color === 'red' ? 'border-red-500/30 bg-red-500/5' : s.color === 'amber' ? 'border-amber-500/30' : 'border-ice-800/50'}`}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-ice-100">{s.name}</h3>
              <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-medium ${
                s.color === 'red' ? 'bg-red-500/15 text-red-400' : s.color === 'amber' ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'
              }`}>{s.ops}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-ice-300"><Thermometer className="w-4 h-4 text-cyan-400" /> {s.temp}°C</div>
              <div className="flex items-center gap-2 text-ice-300"><Wind className="w-4 h-4 text-cyan-400" /> {s.wind} km/h</div>
              <div className="flex items-center gap-2 text-ice-300"><Eye className="w-4 h-4 text-cyan-400" /> {s.vis} km</div>
              <div className="flex items-center gap-2 text-ice-300"><Cloud className="w-4 h-4 text-cyan-400" /> {s.condition}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
