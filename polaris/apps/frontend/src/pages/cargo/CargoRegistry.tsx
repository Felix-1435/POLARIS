import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Ship, Plane, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import PageHeader from '@/components/shared/PageHeader'
import { loadShipments, type CargoShipment } from '@/lib/cargoShipments'

export default function CargoRegistry() {
  const [rows, setRows] = useState<CargoShipment[]>([])

  useEffect(() => {
    setRows(loadShipments())
  }, [])

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      <PageHeader
        title="Cargo Registry"
        subtitle="All consignments with sea / air transport mode"
        backTo="/cargo"
        backLabel="← Cargo & Logistics"
      />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border border-ice-800/50 overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-ice-500 border-b border-ice-800/50 text-xs uppercase tracking-wide">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-5 py-3 font-medium">Item</th>
                <th className="px-5 py-3 font-medium">Transport</th>
                <th className="px-5 py-3 font-medium">Vessel / Flight</th>
                <th className="px-5 py-3 font-medium">Destination</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ice-800/40">
              {rows.map(r => (
                <tr key={r.id} className="hover:bg-ice-900/30">
                  <td className="px-5 py-3 font-mono text-cyan-400">{r.id}</td>
                  <td className="px-5 py-3 text-ice-100">
                    <span className="inline-flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-ice-500" />
                      {r.name}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        'text-[11px] px-2 py-0.5 rounded-full border inline-flex items-center gap-1 font-medium',
                        r.transport === 'Air'
                          ? 'bg-violet-500/15 text-violet-300 border-violet-500/30'
                          : 'bg-sky-500/15 text-sky-300 border-sky-500/30'
                      )}
                    >
                      {r.transport === 'Air' ? <Plane className="w-3 h-3" /> : <Ship className="w-3 h-3" />}
                      {r.transport || 'Sea'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ice-400 text-xs">{r.vesselOrFlight || '—'}</td>
                  <td className="px-5 py-3 text-ice-300">{r.destination}</td>
                  <td className="px-5 py-3">
                    <span
                      className={cn(
                        'text-xs px-2 py-0.5 rounded-full font-medium',
                        r.status === 'Delivered' && 'bg-emerald-500/15 text-emerald-400',
                        r.status === 'In Transit' && 'bg-blue-500/15 text-blue-400',
                        r.status === 'Delayed' && 'bg-amber-500/15 text-amber-400',
                        r.status === 'Pending' && 'bg-ice-700 text-ice-400'
                      )}
                    >
                      {r.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-ice-300">{r.progress}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
