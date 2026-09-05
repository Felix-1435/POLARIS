import { Settings, Users, MapPin, Bell } from 'lucide-react'
export default function Admin() {
  return (
    <div className="space-y-6 max-w-[800px] mx-auto">
      <h1 className="text-2xl font-bold text-ice-50">Admin & System Settings</h1>
      <div className="grid gap-3">
        {[
          { icon: Users, title: 'Users & Roles', desc: 'Manage access for commanders, logistics, medical and field officers' },
          { icon: MapPin, title: 'Locations', desc: 'Stations, field camps, ports and vessel positions' },
          { icon: Bell, title: 'Notifications', desc: 'Alert rules, escalation chains and channel preferences' },
          { icon: Settings, title: 'System Settings', desc: 'Integrations, data retention, AI model preferences' },
        ].map(item => (
          <div key={item.title} className="glass rounded-xl border border-ice-800/50 p-4 flex items-center gap-4 hover:border-cyan-500/30 transition-colors cursor-pointer">
            <div className="w-10 h-10 rounded-lg bg-ice-800 flex items-center justify-center">
              <item.icon className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-medium text-ice-100">{item.title}</h3>
              <p className="text-xs text-ice-500">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
