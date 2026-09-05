import { useRoute } from 'wouter'
import { Users, Package, Fuel, Utensils, Heart, Wrench } from 'lucide-react'

export default function ExpeditionDetail() {
  const [, params] = useRoute('/expeditions/:id')
  return (
    <div className="space-y-6 max-w-[1000px] mx-auto">
      <div>
        <p className="text-cyan-400 font-mono text-sm">{params?.id}</p>
        <h1 className="text-2xl font-bold text-ice-50">Antarctica Summer Expedition 2026</h1>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: 'Personnel', value: '82/85', icon: Users, pct: 96 },
          { label: 'Cargo', value: '156/160', icon: Package, pct: 97 },
          { label: 'Fuel', value: '84%', icon: Fuel, pct: 84 },
          { label: 'Food', value: '91%', icon: Utensils, pct: 91 },
          { label: 'Medical', value: '100%', icon: Heart, pct: 100 },
          { label: 'Equipment', value: '94%', icon: Wrench, pct: 94 },
        ].map(r => (
          <div key={r.label} className="glass rounded-xl p-4 border border-ice-800/50">
            <div className="flex items-center gap-2 mb-2">
              <r.icon className="w-4 h-4 text-cyan-400" />
              <span className="text-xs text-ice-400">{r.label}</span>
            </div>
            <p className="text-xl font-bold text-ice-50">{r.value}</p>
            <div className="mt-2 h-1.5 bg-ice-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full" style={{ width: `${r.pct}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="glass rounded-xl border border-ice-800/50 p-5">
        <h3 className="font-semibold text-ice-100 mb-4">Mission Timeline</h3>
        <div className="space-y-3">
          {[
            { date: '10 Nov', event: 'Cargo Preparation', done: true },
            { date: '15 Nov', event: 'Cargo Dispatch', done: true },
            { date: '18 Nov', event: 'Ship Departure', done: true },
            { date: '08 Dec', event: 'Antarctica Arrival', done: false },
            { date: '09 Dec', event: 'Station Deployment', done: false },
            { date: '12 Dec', event: 'Field Operations Begin', done: false },
          ].map((t, i) => (
            <div key={i} className="flex items-center gap-4">
              <span className="font-mono text-xs text-ice-500 w-16">{t.date}</span>
              <div className={`w-3 h-3 rounded-full ${t.done ? 'bg-emerald-400' : 'bg-ice-700'}`} />
              <span className={`text-sm ${t.done ? 'text-ice-300' : 'text-ice-500'}`}>{t.event}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
