import { Ship, MapPin, Package } from 'lucide-react'
export default function CargoTracking() {
  return (
    <div className="space-y-6 max-w-[1000px] mx-auto">
      <h1 className="text-2xl font-bold text-ice-50">Live Cargo Tracking</h1>
      <div className="glass rounded-xl border border-ice-800/50 p-6">
        <div className="flex items-center gap-4 mb-6">
          <Package className="w-8 h-8 text-cyan-400" />
          <div>
            <h2 className="font-bold text-lg text-ice-50 font-mono">ANT-001</h2>
            <p className="text-sm text-ice-400">Satellite Communication Equipment</p>
          </div>
        </div>
        <div className="relative py-8">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-ice-800 -translate-y-1/2" />
          <div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-400 -translate-y-1/2" style={{ width: '80%' }} />
          <div className="relative flex justify-between">
            {['India Warehouse', 'Port', 'Ship', 'Antarctica', 'Maitri'].map((s, i) => (
              <div key={s} className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 z-10 ${i < 4 ? 'bg-cyan-500 border-cyan-400 text-white' : 'bg-ice-900 border-ice-600 text-ice-500'}`}>
                  {i === 2 ? <Ship className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                </div>
                <p className="text-[10px] mt-2 text-ice-400 text-center w-16">{s}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
          <div className="bg-ice-900/50 rounded-lg p-3">
            <p className="text-ice-500 text-xs">Current Location</p>
            <p className="text-ice-100 font-medium">MV Sagar Kanya</p>
          </div>
          <div className="bg-ice-900/50 rounded-lg p-3">
            <p className="text-ice-500 text-xs">Progress</p>
            <p className="text-cyan-300 font-medium">80%</p>
          </div>
          <div className="bg-ice-900/50 rounded-lg p-3">
            <p className="text-ice-500 text-xs">ETA</p>
            <p className="text-ice-100 font-medium">15 Dec 2026</p>
          </div>
        </div>
      </div>
    </div>
  )
}
