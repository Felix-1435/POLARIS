import { Route, Switch, useLocation } from 'wouter'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from './components/layout/Sidebar'
import Header from './components/layout/Header'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import Expeditions from './pages/Expeditions'
import ExpeditionDetail from './pages/ExpeditionDetail'
import CargoDashboard from './pages/cargo/CargoDashboard'
import CargoRegistry from './pages/cargo/CargoRegistry'
import CargoTracking from './pages/cargo/CargoTracking'
import CargoScan from './pages/cargo/CargoScan'
import InventoryDashboard from './pages/inventory/InventoryDashboard'
import PersonnelDashboard from './pages/personnel/PersonnelDashboard'
import EmergencyDashboard from './pages/emergency/EmergencyDashboard'
import AICommander from './pages/AICommander'
import Admin from './pages/Admin'

// Simple auth store
const useAuth = () => {
  const [user, setUser] = useState<{ name: string; role: string } | null>(() => {
    const saved = localStorage.getItem('polaris_user')
    return saved ? JSON.parse(saved) : null
  })
  
  const login = (name: string, role: string) => {
    const u = { name, role }
    localStorage.setItem('polaris_user', JSON.stringify(u))
    setUser(u)
  }
  
  const logout = () => {
    localStorage.removeItem('polaris_user')
    setUser(null)
  }
  
  return { user, login, logout }
}

export default function App() {
  const { user, login, logout } = useAuth()
  const [location] = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)

  if (!user) {
    return <LoginPage onLogin={login} />
  }

  return (
    <div className="flex h-screen overflow-hidden bg-ice-950">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header user={user} onLogout={logout} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={location}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/expeditions" component={Expeditions} />
                <Route path="/expeditions/:id" component={ExpeditionDetail} />
                <Route path="/cargo" component={CargoDashboard} />
                <Route path="/cargo/registry" component={CargoRegistry} />
                <Route path="/cargo/tracking" component={CargoTracking} />
                <Route path="/cargo/scan" component={CargoScan} />
                <Route path="/inventory" component={InventoryDashboard} />
                <Route path="/personnel" component={PersonnelDashboard} />
                <Route path="/emergency" component={EmergencyDashboard} />
                <Route path="/ai" component={AICommander} />
                <Route path="/admin" component={Admin} />
                <Route>
                  <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-ice-300">Page under construction</h2>
                    <p className="text-ice-500 mt-2">This module is being finalized for SIH demo.</p>
                  </div>
                </Route>
              </Switch>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
