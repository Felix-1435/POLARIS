import { IndianRupee, TrendingUp, AlertCircle } from 'lucide-react'

const items = [
  { category: 'Ship Charter', allocated: 4.2, spent: 3.1, unit: 'Cr' },
  { category: 'Cargo & Logistics', allocated: 1.8, spent: 1.2, unit: 'Cr' },
  { category: 'Personnel & Training', allocated: 0.95, spent: 0.7, unit: 'Cr' },
  { category: 'Fuel & Consumables', allocated: 1.4, spent: 0.9, unit: 'Cr' },
  { category: 'Scientific Equipment', allocated: 2.1, spent: 1.6, unit: 'Cr' },
  { category: 'Emergency Contingency', allocated: 0.5, spent: 0.05, unit: 'Cr' },
]

export default function Budget() {
  const totalAlloc = items.reduce((s, i) => s + i.allocated, 0)
  const totalSpent = items.reduce((s, i) => s + i.spent, 0)
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ice-50">Expedition Budget</h1>
        <p className="text-ice-500 text-sm">Track expenses against allocated budget for ANT-47</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-xl p-4 border border-ice-800/50">
          <p className="text-xs text-ice-500">Allocated</p>
          <p className="text-2xl font-bold text-ice-50">₹{totalAlloc.toFixed(1)} Cr</p>
        </div>
        <div className="glass rounded-xl p-4 border border-ice-800/50">
          <p className="text-xs text-ice-500">Spent</p>
          <p className="text-2xl font-bold text-cyan-300">₹{totalSpent.toFixed(1)} Cr</p>
        </div>
        <div className="glass rounded-xl p-4 border border-ice-800/50">
          <p className="text-xs text-ice-500">Remaining</p>
          <p className="text-2xl font-bold text-emerald-400">₹{(totalAlloc - totalSpent).toFixed(1)} Cr</p>
        </div>
      </div>
      <div className="glass rounded-xl border border-ice-800/50 p-5 space-y-3">
        {items.map(i => (
          <div key={i.category}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-ice-300">{i.category}</span>
              <span className="text-ice-500">₹{i.spent} / ₹{i.allocated} {i.unit}</span>
            </div>
            <div className="h-2 bg-ice-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 rounded-full" style={{ width: `${(i.spent / i.allocated) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
