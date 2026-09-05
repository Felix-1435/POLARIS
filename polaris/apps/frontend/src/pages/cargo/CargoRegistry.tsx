import PageHeader from '@/components/shared/PageHeader'

const rows = [
  { id: 'ANT-001', item: 'Satellite Equipment', dest: 'Maitri', status: 'In Transit', priority: 'Critical' },
  { id: 'ANT-002', item: 'Diesel Fuel', dest: 'Maitri', status: 'Delayed', priority: 'Critical' },
  { id: 'ANT-003', item: 'Food Rations', dest: 'Bharati', status: 'Delivered', priority: 'High' },
  { id: 'ANT-004', item: 'Medical Kits', dest: 'Field Camp', status: 'Pending', priority: 'Critical' },
  { id: 'ANT-005', item: 'Research Instruments', dest: 'Maitri', status: 'Delivered', priority: 'Medium' },
  { id: 'ANT-006', item: 'Communication Radios', dest: 'Bharati', status: 'In Transit', priority: 'High' },
  { id: 'ANT-015', item: 'Aviation Fuel', dest: 'Maitri', status: 'Delayed', priority: 'Critical' },
]

export default function CargoRegistry() {
  return (
    <div className="space-y-4 max-w-[1200px] mx-auto">
      <PageHeader
        title="Cargo Registry"
        subtitle="All expedition cargo items and status"
        backTo="/cargo"
        backLabel="← Cargo & Logistics"
      />
      <div className="glass rounded-xl border border-ice-800/50 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-ice-900/50 text-ice-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3 text-left">ID</th>
              <th className="px-4 py-3 text-left">Item</th>
              <th className="px-4 py-3 text-left">Destination</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Priority</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ice-800/50">
            {rows.map(r => (
              <tr key={r.id} className="hover:bg-ice-900/30">
                <td className="px-4 py-3 font-mono text-cyan-400">{r.id}</td>
                <td className="px-4 py-3 text-ice-200">{r.item}</td>
                <td className="px-4 py-3 text-ice-400">{r.dest}</td>
                <td className="px-4 py-3">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400">{r.status}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-red-400">{r.priority}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
