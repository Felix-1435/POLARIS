import { motion } from 'framer-motion'
import { Boxes, AlertTriangle, Clock, Wrench, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const stocks = [
  { item: 'Diesel', loc: 'Maitri', avail: '8,500 L', min: '10,000 L', status: 'critical', days: 18 },
  { item: 'Food Rations', loc: 'Maitri', avail: '1,250 kg', min: '800 kg', status: 'ok', days: 45 },
  { item: 'Medical Kits', loc: 'Bharati', avail: '35', min: '20', status: 'ok', days: 60 },
  { item: 'Batteries', loc: 'Field Camp', avail: '42', min: '50', status: 'low', days: 12 },
  { item: 'Oxygen Cylinders', loc: 'Maitri', avail: '28', min: '15', status: 'ok', days: 90 },
]

export default function InventoryDashboard() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-ice-50">Inventory & Assets</h1>
        <p className="text-ice-500 text-sm">Consumables, equipment and predictive stock management</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Items', value: '1,248', icon: Boxes },
          { label: 'Low Stock', value: '12', icon: TrendingDown },
          { label: 'Critical', value: '4', icon: AlertTriangle },
          { label: 'Expiring Soon', value: '7', icon: Clock },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-4 border border-ice-800/50">
            <s.icon className="w-5 h-5 text-cyan-400 mb-2" />
            <p className="text-2xl font-bold text-ice-50">{s.value}</p>
            <p className="text-xs text-ice-400">{s.label}</p>
          </motion.div>
        ))}
      </div>
      <div className="glass rounded-xl border border-ice-800/50 overflow-hidden">
        <div className="px-5 py-3 border-b border-ice-800/50 font-semibold text-ice-100">Stock Levels</div>
        <table className="w-full text-sm">
          <thead className="text-xs text-ice-500 uppercase">
            <tr>
              <th className="px-4 py-2 text-left">Item</th>
              <th className="px-4 py-2 text-left">Location</th>
              <th className="px-4 py-2 text-left">Available</th>
              <th className="px-4 py-2 text-left">Minimum</th>
              <th className="px-4 py-2 text-left">Days Left</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ice-800/40">
            {stocks.map(s => (
              <tr key={s.item} className="hover:bg-ice-900/30">
                <td className="px-4 py-3 text-ice-200 font-medium">{s.item}</td>
                <td className="px-4 py-3 text-ice-400">{s.loc}</td>
                <td className="px-4 py-3 text-ice-300">{s.avail}</td>
                <td className="px-4 py-3 text-ice-500">{s.min}</td>
                <td className="px-4 py-3 text-ice-300">{s.days}d</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-medium uppercase",
                    s.status === 'critical' && "bg-red-500/15 text-red-400",
                    s.status === 'low' && "bg-amber-500/15 text-amber-400",
                    s.status === 'ok' && "bg-emerald-500/15 text-emerald-400",
                  )}>{s.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="glass rounded-xl border border-amber-500/20 p-5 bg-amber-500/5">
        <div className="flex items-center gap-2 mb-2">
          <TrendingDown className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-amber-200">AI Stock Forecast</h3>
        </div>
        <p className="text-sm text-ice-300">Diesel at Maitri: Current 8,500 L → Day 10: 4,300 L → Day 15: 2,100 L → Day 20: 0 L. <strong className="text-amber-300">Shortage predicted in ~18 days.</strong> Recommended action: Prioritise next fuel shipment.</p>
      </div>
    </div>
  )
}
