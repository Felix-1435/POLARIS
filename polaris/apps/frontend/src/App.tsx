import { Route, Switch, useLocation, Redirect } from 'wouter'
import { useState, useEffect, createContext, useContext } from 'react'
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

// ---------- Auth (sessionStorage = clears when tab/window closes) ----------
type User = { name: string; role: string; email: string }
type AuthCtx = { user: User | null; login: (u: User) => void; logout: () => void }
const AuthContext = createContext<AuthCtx>({ user: null, login: () => {}, logout: () => {} })
export const useAuth = () => useContext(AuthContext)

// ---------- Theme ----------
type ThemeCtx = { theme: 'dark' | 'light'; toggle: () => void }
const ThemeContext = createContext<ThemeCtx>({ theme: 'dark', toggle: () => {} })
export const useTheme = () => useContext(ThemeContext)

const AUTH_KEY = 'polaris_session_user'
const THEME_KEY = 'polaris_theme'

function readSessionUser(): User | null {
  try {
    const s = sessionStorage.getItem(AUTH_KEY)
    return s ? JSON.parse(s) : null
  } catch {
    return null
  }
}

export default function App() {
  // Always start from sessionStorage (empty on new tab / after close)
  const [user, setUser] = useState<User | null>(() => readSessionUser())
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem(THEME_KEY) as 'dark' | 'light') || 'dark'
  })
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [location, setLocation] = useLocation()

  // Clear any OLD localStorage auth leftover from previous versions
  useEffect(() => {
    localStorage.removeItem('polaris_user')
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
    document.documentElement.classList.toggle('light', theme === 'light')
    localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  // If not logged in and not already on a public path, force login view
  useEffect(() => {
    if (!user && location !== '/login') {
      // stay on login UI (we render LoginPage below)
    }
  }, [user, location])

  const login = (u: User) => {
    sessionStorage.setItem(AUTH_KEY, JSON.stringify(u))
    setUser(u)
    setLocation('/')
  }

  const logout = () => {
    sessionStorage.removeItem(AUTH_KEY)
    localStorage.removeItem('polaris_user') // cleanup legacy
    setUser(null)
    setLocation('/login')
  }

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'))

  // ========== NOT LOGGED IN → ALWAYS SHOW LOGIN ==========
  if (!user) {
    return (
      <ThemeContext.Provider value={{ theme, toggle: toggleTheme }}>
        <AuthContext.Provider value={{ user: null, login, logout }}>
          <LoginPage />
        </AuthContext.Provider>
      </ThemeContext.Provider>
    )
  }

  // ========== LOGGED IN → APP SHELL ==========
  return (
    <ThemeContext.Provider value={{ theme, toggle: toggleTheme }}>
      <AuthContext.Provider value={{ user, login, logout }}>
        <div className={`flex h-screen overflow-hidden ${theme === 'dark' ? 'bg-ice-950' : 'bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-100'}`}>
          <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header user={user} onLogout={logout} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
            <main className={`flex-1 overflow-y-auto p-4 md:p-6 ${theme === 'dark' ? '' : 'bg-gradient-to-b from-sky-50/80 via-blue-50/60 to-cyan-50/40'}`}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Switch>
                    <Route path="/" component={Dashboard} />
                    <Route path="/expeditions" component={Expeditions} />
                    <Route path="/expeditions/:id" component={ExpeditionDetail} />
                    <Route path="/cargo/scan" component={CargoScan} />
                    <Route path="/cargo/registry" component={CargoRegistry} />
                    <Route path="/cargo/tracking" component={CargoTracking} />
                    <Route path="/cargo" component={CargoDashboard} />
                    <Route path="/inventory" component={InventoryDashboard} />
                    <Route path="/personnel" component={PersonnelDashboard} />
                    <Route path="/emergency" component={EmergencyDashboard} />
                    <Route path="/ai" component={AICommander} />
                    <Route path="/admin" component={Admin} />
                    <Route path="/login">
                      <Redirect to="/" />
                    </Route>
                    <Route>
                      <div className="text-center py-20">
                        <h2 className="text-2xl font-bold opacity-60">Page under construction</h2>
                      </div>
                    </Route>
                  </Switch>
                </motion.div>
              </AnimatePresence>
            </main>
          </div>
        </div>
      </AuthContext.Provider>
    </ThemeContext.Provider>
  )
}
