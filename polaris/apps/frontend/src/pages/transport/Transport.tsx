import { Ship, Helicopter, Truck, MapPin } from 'lucide-react'

const assets = [
  { id: 'VES-01', name: 'MV Sagar Kanya', type: 'Ship', status: 'En Route', location: 'Southern Ocean', capacity: '120 pax / 800 T' },
  { id: 'HEL-03', name: 'Chetak Helicopter', type: 'Helicopter', status: 'Available', location: 'Maitri', capacity: '5 pax' },
  { id: 'VEH-12', name: 'PistenBully 300', type: 'Tracked Vehicle', status: 'In Use', location: 'Field Camp A', capacity: 'Cargo + 3' },
  { id: 'VEH-07', name: 'Snowmobile Unit', type: 'Vehicle', status: 'Maintenance', location: 'Bharati', capacity: '2 pax' },
]

export default function Transport() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ice-50">Transport Assets</h1>
        <p className="text-ice-500 text-sm">Ships, helicopters and ground vehicles for the expedition</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        {assets.map(a => (
          <div key={a.id} className="glass rounded-xl border border-ice-800/50 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-xs text-cyan-400">{a.id}</p>
                <h3 className="font-semibold text-ice-100 mt-0.5">{a.name}</h3>
                <p className="text-xs text-ice-500 mt-1">{a.type} · {a.capacity}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                a.status === 'Available' ? 'bg-emerald-500/15 text-emerald-400' :
                a.status === 'En Route' || a.status === 'In Use' ? 'bg-blue-500/15 text-blue-400' :
                'bg-amber-500/15 text-amber-400'
              }`}>{a.status}</span>
            </div>
            <p className="text-xs text-ice-400 mt-3 flex items-center gap-1"><MapPin className="w-3 h-3" /> {a.location}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
