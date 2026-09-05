import { Box, MapPin, Ship, AlertTriangle } from 'lucide-react'

const containers = [
  { id: 'CNT-2041', contents: 'Scientific Instruments', location: 'MV Sagar Kanya', status: 'In Transit', eta: '12 Dec', risk: 'Low' },
  { id: 'CNT-2042', contents: 'Diesel Drums', location: 'Mormugao Port', status: 'Loaded', eta: '18 Dec', risk: 'Medium' },
  { id: 'CNT-1988', contents: 'Food + Medical', location: 'Maitri Station', status: 'Delivered', eta: '—', risk: 'None' },
  { id: 'CNT-2103', contents: 'Generator Spares', location: 'Southern Ocean', status: 'Delayed', eta: '15 Dec', risk: 'High' },
]

export default function Containers() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ice-50">Container Tracking</h1>
        <p className="text-ice-500 text-sm">Live location, route, ETA and delay prediction for expedition containers</p>
      </div>
      <div className="glass rounded-xl border border-ice-800/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="text-xs text-ice-500 uppercase bg-ice-900/40">
            <tr>
              <th className="px-4 py-3 text-left">Container</th>
              <th className="px-4 py-3 text-left">Contents</th>
              <th className="px-4 py-3 text-left">Location</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">ETA</th>
              <th className="px-4 py-3 text-left">Risk</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ice-800/40">
            {containers.map(c => (
              <tr key={c.id} className="hover:bg-ice-900/30">
                <td className="px-4 py-3 font-mono text-cyan-400">{c.id}</td>
                <td className="px-4 py-3 text-ice-200">{c.contents}</td>
                <td className="px-4 py-3 text-ice-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.location}</td>
                <td className="px-4 py-3 text-ice-300">{c.status}</td>
                <td className="px-4 py-3 text-ice-400">{c.eta}</td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                    c.risk === 'High' ? 'bg-red-500/15 text-red-400' : c.risk === 'Medium' ? 'bg-amber-500/15 text-amber-400' : 'bg-emerald-500/15 text-emerald-400'
                  }`}>{c.risk}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
