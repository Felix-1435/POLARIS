import { Link, useLocation } from 'wouter'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, Map, Package, Boxes, Users, AlertTriangle, 
  Bot, Settings, ChevronLeft, Snowflake, Ship, Activity
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Command Center', icon: LayoutDashboard, section: null },
  { 
    section: 'OPERATIONS',
    items: [
      { href: '/expeditions', label: 'Expeditions', icon: Map },
      { href: '/cargo', label: 'Cargo & Logistics', icon: Package },
      { href: '/inventory', label: 'Inventory & Assets', icon: Boxes },
      { href: '/personnel', label: 'Personnel', icon: Users },
    ]
  },
  {
    section: 'RESPONSE',
    items: [
      { href: '/emergency', label: 'Emergency', icon: AlertTriangle },
      { href: '/ai', label: 'AI Commander', icon: Bot },
    ]
  },
  {
    section: 'SYSTEM',
    items: [
      { href: '/admin', label: 'Admin', icon: Settings },
    ]
  }
]

interface SidebarProps {
  open: boolean
  setOpen: (v: boolean) => void
}

export default function Sidebar({ open, setOpen }: SidebarProps) {
  const [location] = useLocation()

  return (
    <motion.aside
      initial={false}
      animate={{ width: open ? 260 : 72 }}
      className="relative z-30 flex flex-col glass-strong border-r border-ice-800/50 h-full"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 h-16 border-b border-ice-800/50">
        <div className="relative">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Snowflake className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-ice-900 animate-pulse" />
        </div>
        {open && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <h1 className="font-bold text-lg tracking-tight bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              POLARIS
            </h1>
            <p className="text-[10px] text-ice-500 font-medium tracking-wider">NCPOR COMMAND</p>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navItems.map((group, gi) => (
          <div key={gi}>
            {group.section && open && (
              <p className="px-3 pt-4 pb-1 text-[10px] font-semibold tracking-widest text-ice-600 uppercase">
                {group.section}
              </p>
            )}
            {(group.items || [group]).map((item: any) => {
              if (!item.href) return null
              const active = location === item.href || (item.href !== '/' && location.startsWith(item.href))
              const Icon = item.icon
              return (
                <Link key={item.href} href={item.href}>
                  <a className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                    active 
                      ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm shadow-cyan-500/10" 
                      : "text-ice-400 hover:text-ice-100 hover:bg-ice-800/50"
                  )}>
                    <Icon className={cn("w-5 h-5 shrink-0", active ? "text-cyan-400" : "text-ice-500 group-hover:text-ice-300")} />
                    {open && <span>{item.label}</span>}
                    {active && open && (
                      <motion.div layoutId="active-pill" className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    )}
                  </a>
                </Link>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Status footer */}
      {open && (
        <div className="p-3 border-t border-ice-800/50">
          <div className="glass rounded-lg p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="text-ice-400">System Status</span>
              <span className="ml-auto text-emerald-400 font-medium">ONLINE</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-ice-500">
              <Ship className="w-3.5 h-3.5" />
              <span>Expedition ANT-47 Active</span>
            </div>
          </div>
        </div>
      )}

      {/* Collapse */}
      <button
        onClick={() => setOpen(!open)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-ice-800 border border-ice-700 flex items-center justify-center text-ice-400 hover:text-white hover:bg-ice-700 transition-colors"
      >
        <ChevronLeft className={cn("w-3.5 h-3.5 transition-transform", !open && "rotate-180")} />
      </button>
    </motion.aside>
  )
}
