import { motion } from 'framer-motion'
import { Users, MapPin, Ship, CheckCircle, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

const people = [
  { id: 'P001', name: 'Dr. Sharma', role: 'Climate Scientist', loc: 'Maitri', status: 'active', checkin: '09:32' },
  { id: 'P002', name: 'A. Kumar', role: 'Engineer', loc: 'Bharati', status: 'active', checkin: '08:15' },
  { id: 'P003', name: 'R. Patel', role: 'Logistics', loc: 'Ship', status: 'transit', checkin: '—' },
  { id: 'P034', name: 'S. Reddy', role: 'Field Researcher', loc: 'Field Camp B', status: 'overdue', checkin: 'Missed' },
  { id: 'P045', name: 'M. Joshi', role: 'Medical Officer', loc: 'Maitri', status: 'active', checkin: '07:50' },
]

export default function PersonnelDashboard() {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-ice-50">Personnel & Movement</h1>
        <p className="text-ice-500 text-sm">Registry, locations, teams and daily check-ins</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: 'Total', value: '127', icon: Users },
          { label: 'At Stations', value: '82', icon: MapPin },
          { label: 'Field Teams', value: '31', icon: Users },
          { label: 'In Transit', value: '14', icon: Ship },
          { label: 'Check-in Overdue', value: '1', icon: AlertCircle },
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
        <table className="w-full text-sm">
          <thead className="text-xs text-ice-500 uppercase bg-ice-900/40">
            <tr>
              <th className="px-4 py-2 text-left">ID</th>
              <th className="px-4 py-2 text-left">Name</th>
              <th className="px-4 py-2 text-left">Role</th>
              <th className="px-4 py-2 text-left">Location</th>
              <th className="px-4 py-2 text-left">Last Check-in</th>
              <th className="px-4 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ice-800/40">
            {people.map(p => (
              <tr key={p.id} className="hover:bg-ice-900/30">
                <td className="px-4 py-3 font-mono text-cyan-400 text-xs">{p.id}</td>
                <td className="px-4 py-3 text-ice-200 font-medium">{p.name}</td>
                <td className="px-4 py-3 text-ice-400">{p.role}</td>
                <td className="px-4 py-3 text-ice-400">{p.loc}</td>
                <td className="px-4 py-3 text-ice-400">{p.checkin}</td>
                <td className="px-4 py-3">
                  <span className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full font-medium uppercase",
                    p.status === 'active' && "bg-emerald-500/15 text-emerald-400",
                    p.status === 'transit' && "bg-blue-500/15 text-blue-400",
                    p.status === 'overdue' && "bg-red-500/15 text-red-400",
                  )}>{p.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
