import { Bell, Search, LogOut, Menu, Cloud, Thermometer } from 'lucide-react'
import { motion } from 'framer-motion'

interface HeaderProps {
  user: { name: string; role: string }
  onLogout: () => void
  onMenuClick: () => void
}

export default function Header({ user, onLogout, onMenuClick }: HeaderProps) {
  return (
    <header className="h-14 border-b border-ice-800/50 glass-strong flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="md:hidden p-2 rounded-lg hover:bg-ice-800/50 text-ice-400">
          <Menu className="w-5 h-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 text-xs text-ice-400 bg-ice-900/50 px-3 py-1.5 rounded-full border border-ice-800">
          <Cloud className="w-3.5 h-3.5 text-cyan-400" />
          <span>Maitri: -22°C</span>
          <span className="text-ice-600">|</span>
          <Thermometer className="w-3.5 h-3.5 text-amber-400" />
          <span>Wind 38 km/h</span>
          <span className="text-ice-600">|</span>
          <span className="text-emerald-400">Vis 4.2 km</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ice-500" />
          <input 
            type="text" 
            placeholder="Search expeditions, cargo, personnel..."
            className="w-64 bg-ice-900/50 border border-ice-800 rounded-lg pl-9 pr-3 py-1.5 text-sm text-ice-200 placeholder:text-ice-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
          />
        </div>

        <button className="relative p-2 rounded-lg hover:bg-ice-800/50 text-ice-400 hover:text-ice-200 transition-colors">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </button>

        <div className="flex items-center gap-2 pl-2 border-l border-ice-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
            {user.name.charAt(0)}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-ice-100 leading-tight">{user.name}</p>
            <p className="text-[10px] text-ice-500">{user.role}</p>
          </div>
          <button onClick={onLogout} className="p-1.5 rounded-lg hover:bg-ice-800/50 text-ice-500 hover:text-red-400 transition-colors" title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
