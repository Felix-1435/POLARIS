import { Bell, Search, LogOut, Menu, Cloud, Thermometer, Sun, Moon } from 'lucide-react'
import { useTheme } from '../../App'

interface HeaderProps {
  user: { name: string; role: string }
  onLogout: () => void
  onMenuClick: () => void
}

export default function Header({ user, onLogout, onMenuClick }: HeaderProps) {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <header className={`h-14 border-b flex items-center justify-between px-4 md:px-6 shrink-0 ${
      isDark ? 'border-ice-800/50 glass-strong' : 'border-slate-200 bg-white/90 backdrop-blur'
    }`}>
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className={`md:hidden p-2 rounded-lg ${isDark ? 'hover:bg-ice-800/50 text-ice-400' : 'hover:bg-slate-100 text-slate-500'}`}>
          <Menu className="w-5 h-5" />
        </button>
        <div className={`hidden sm:flex items-center gap-2 text-xs px-3 py-1.5 rounded-full border ${
          isDark ? 'text-ice-400 bg-ice-900/50 border-ice-800' : 'text-slate-600 bg-slate-50 border-slate-200'
        }`}>
          <Cloud className="w-3.5 h-3.5 text-cyan-500" />
          <span>Maitri: -22°C</span>
          <span className="opacity-40">|</span>
          <Thermometer className="w-3.5 h-3.5 text-amber-500" />
          <span>Wind 38 km/h</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? 'text-ice-500' : 'text-slate-400'}`} />
          <input
            type="text"
            placeholder="Search..."
            className={`w-56 rounded-lg pl-9 pr-3 py-1.5 text-sm border focus:outline-none focus:ring-1 focus:ring-cyan-500/40 ${
              isDark ? 'bg-ice-900/50 border-ice-800 text-ice-200 placeholder:text-ice-600' : 'bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400'
            }`}
          />
        </div>

        <button onClick={toggle} className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-ice-800/50 text-ice-400 hover:text-amber-300' : 'hover:bg-slate-100 text-slate-500 hover:text-slate-800'}`} title="Toggle theme">
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        <button className={`relative p-2 rounded-lg ${isDark ? 'hover:bg-ice-800/50 text-ice-400' : 'hover:bg-slate-100 text-slate-500'}`}>
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        </button>

        <div className={`flex items-center gap-2 pl-2 border-l ${isDark ? 'border-ice-800' : 'border-slate-200'}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
            {user.name.charAt(0)}
          </div>
          <div className="hidden sm:block text-left">
            <p className={`text-sm font-medium leading-tight ${isDark ? 'text-ice-100' : 'text-slate-800'}`}>{user.name}</p>
            <p className={`text-[10px] ${isDark ? 'text-ice-500' : 'text-slate-400'}`}>{user.role}</p>
          </div>
          <button onClick={onLogout} className={`p-1.5 rounded-lg ${isDark ? 'hover:bg-ice-800/50 text-ice-500 hover:text-red-400' : 'hover:bg-slate-100 text-slate-400 hover:text-red-500'}`} title="Logout">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
