import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000

app.use(cors({ origin: true }))
app.use(express.json())

// In-memory store (works for demo; replace with Neon later)
const store: Record<string, any> = {
  cargo: {
    'ANT-001': {
      id: 'ANT-001',
      item: 'Satellite Communication Equipment',
      priority: 'Critical',
      weight: '420 kg',
      expedition: 'ANT-47',
      currentCheckpoint: 0,
      status: 'Pending Dispatch',
      history: [],
    }
  },
  expeditions: {},
  alerts: [],
}

// Health
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'POLARIS API', time: new Date().toISOString() })
})

// Cargo
app.get('/api/cargo/:id', (req, res) => {
  const item = store.cargo[req.params.id]
  if (!item) return res.status(404).json({ error: 'Not found' })
  res.json(item)
})

app.put('/api/cargo/:id', (req, res) => {
  store.cargo[req.params.id] = req.body
  res.json(store.cargo[req.params.id])
})

app.get('/api/cargo', (_req, res) => {
  res.json(Object.values(store.cargo))
})

// Simple AI endpoint (rule-based for demo)
app.post('/api/ai/ask', (req, res) => {
  const q = (req.body.question || '').toLowerCase()
  let answer = "I've analysed current operational data. All systems nominal with noted exceptions on the command dashboard."

  if (q.includes('cargo') && q.includes('delay')) {
    answer = "3 critical shipments are delayed. ANT-015 (fuel) and ANT-007 (medical) should be prioritised. ANT-045 is delayed 14h due to Southern Ocean weather."
  } else if (q.includes('fuel') || q.includes('diesel') || q.includes('supply') || q.includes('run out')) {
    answer = "Diesel at Maitri: 8,500 L remaining, ~420 L/day burn → projected shortage in 18 days. Recommend prioritising next fuel shipment and reducing non-critical generator load."
  } else if (q.includes('personnel') || q.includes('check-in') || q.includes('team')) {
    answer = "31 field personnel deployed. 30 checked in. P-034 at Field Camp B missed check-in by 42 min → Incident INC-0042 activated."
  } else if (q.includes('priorit') || q.includes('shipment')) {
    answer = "Resupply priority: 1) Medical supplies 2) Diesel fuel 3) Communication spares 4) Research instruments."
  } else if (q.includes('risk') || q.includes('summar')) {
    answer = "Overall risk: ELEVATED. Primary: active medical emergency at Field Camp B, fuel timeline at Maitri (18 days), weather cargo delay. ANT-47 still within acceptable parameters."
  }

  res.json({ answer, model: 'polaris-rules-v1', timestamp: new Date().toISOString() })
})

// AI Expedition Planner
app.post('/api/ai/plan-expedition', (req, res) => {
  const { teamSize = 40, durationDays = 120, destination = 'Maitri', mission = 'research' } = req.body

  const foodKg = Math.round(teamSize * durationDays * 1.8)
  const fuelL = Math.round(teamSize * durationDays * 3.5 + 15000)
  const medicalKits = Math.ceil(teamSize / 8) + 10
  const cargoItems = Math.round(teamSize * 2.2 + 40)

  res.json({
    summary: `AI-generated plan for ${teamSize} personnel, ${durationDays} days at ${destination}`,
    requirements: {
      personnel: teamSize,
      foodKg,
      dieselLitres: fuelL,
      medicalKits,
      estimatedCargoItems: cargoItems,
      recommendedVessels: fuelL > 40000 ? 2 : 1,
      contingencyDays: 15,
    },
    notes: [
      'Includes 15-day weather contingency',
      'Medical kits sized for remote field teams',
      'Fuel includes station generators + vehicles + contingency',
      'Review with Logistics Officer before finalising',
    ]
  })
})

// Dashboard KPIs
app.get('/api/dashboard', (_req, res) => {
  res.json({
    activeExpeditions: 4,
    personnelDeployed: 127,
    cargoInTransit: 17,
    inventoryHealth: 92,
    activeAssets: 84,
    emergencies: 1,
    alerts: [
      { type: 'critical', title: 'Fuel projected below threshold', desc: 'Maitri — Diesel under minimum in 18 days' },
      { type: 'warning', title: 'Cargo ANT-045 delayed', desc: '14 hours due to weather' },
    ]
  })
})

app.listen(PORT, () => {
  console.log(`POLARIS API running on :${PORT}`)
})
