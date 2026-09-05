import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import pg from 'pg'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 4000
const { Pool } = pg

app.use(cors({ origin: true }))
app.use(express.json())

// ---------- Neon / Postgres ----------
const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : null

async function initDB() {
  if (!pool) {
    console.log('No DATABASE_URL — using in-memory store')
    return
  }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS expeditions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'Active',
      region TEXT,
      personnel INT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS cargo (
      id TEXT PRIMARY KEY,
      expedition_id TEXT REFERENCES expeditions(id),
      item TEXT NOT NULL,
      priority TEXT DEFAULT 'Medium',
      weight TEXT,
      current_checkpoint INT DEFAULT 0,
      status TEXT DEFAULT 'Pending Dispatch',
      history JSONB DEFAULT '[]',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `)

  // Seed if empty
  const { rows } = await pool.query('SELECT COUNT(*) FROM expeditions')
  if (parseInt(rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO expeditions (id, name, status, region, personnel) VALUES
      ('ANT-47', 'Antarctica Summer Expedition 2026', 'Active', 'Antarctica', 82),
      ('ANT-46', 'Winter-over 2025-26', 'Completed', 'Antarctica', 45),
      ('ARC-12', 'Arctic Climate Monitoring', 'Planning', 'Arctic', 24)
    `)
    await pool.query(`
      INSERT INTO cargo (id, expedition_id, item, priority, weight, current_checkpoint, status, history) VALUES
      ('ANT-001', 'ANT-47', 'Satellite Communication Equipment', 'Critical', '420 kg', 0, 'Pending Dispatch', '[]'),
      ('ANT-002', 'ANT-47', 'Diesel Fuel (20kL)', 'Critical', '20,000 L', 0, 'Pending Dispatch', '[]'),
      ('ANT-003', 'ANT-47', 'Food Rations', 'High', '1,250 kg', 0, 'Pending Dispatch', '[]'),
      ('ANT-004', 'ANT-47', 'Medical Kits', 'Critical', '85 kg', 0, 'Pending Dispatch', '[]'),
      ('ANT-005', 'ANT-47', 'Research Instruments', 'Medium', '310 kg', 0, 'Pending Dispatch', '[]')
    `)
    console.log('Seeded expeditions + cargo')
  }
  console.log('Neon database ready')
}

// In-memory fallback
const mem = {
  expeditions: [
    { id: 'ANT-47', name: 'Antarctica Summer Expedition 2026', status: 'Active', region: 'Antarctica', personnel: 82 },
    { id: 'ANT-46', name: 'Winter-over 2025-26', status: 'Completed', region: 'Antarctica', personnel: 45 },
    { id: 'ARC-12', name: 'Arctic Climate Monitoring', status: 'Planning', region: 'Arctic', personnel: 24 },
  ],
  cargo: {
    'ANT-001': { id: 'ANT-001', expedition_id: 'ANT-47', item: 'Satellite Communication Equipment', priority: 'Critical', weight: '420 kg', current_checkpoint: 0, status: 'Pending Dispatch', history: [] },
    'ANT-002': { id: 'ANT-002', expedition_id: 'ANT-47', item: 'Diesel Fuel (20kL)', priority: 'Critical', weight: '20,000 L', current_checkpoint: 0, status: 'Pending Dispatch', history: [] },
    'ANT-003': { id: 'ANT-003', expedition_id: 'ANT-47', item: 'Food Rations', priority: 'High', weight: '1,250 kg', current_checkpoint: 0, status: 'Pending Dispatch', history: [] },
    'ANT-004': { id: 'ANT-004', expedition_id: 'ANT-47', item: 'Medical Kits', priority: 'Critical', weight: '85 kg', current_checkpoint: 0, status: 'Pending Dispatch', history: [] },
    'ANT-005': { id: 'ANT-005', expedition_id: 'ANT-47', item: 'Research Instruments', priority: 'Medium', weight: '310 kg', current_checkpoint: 0, status: 'Pending Dispatch', history: [] },
  }
}

// ---------- Routes ----------
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'POLARIS API', db: pool ? 'neon' : 'memory', time: new Date().toISOString() })
})

// Expeditions list
app.get('/api/expeditions', async (_req, res) => {
  try {
    if (pool) {
      const { rows } = await pool.query('SELECT * FROM expeditions ORDER BY created_at DESC')
      return res.json(rows)
    }
    res.json(mem.expeditions)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Cargo by expedition
app.get('/api/expeditions/:id/cargo', async (req, res) => {
  try {
    if (pool) {
      const { rows } = await pool.query('SELECT * FROM cargo WHERE expedition_id = $1 ORDER BY id', [req.params.id])
      return res.json(rows)
    }
    const list = Object.values(mem.cargo).filter((c: any) => c.expedition_id === req.params.id)
    res.json(list)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Single cargo
app.get('/api/cargo/:id', async (req, res) => {
  try {
    if (pool) {
      const { rows } = await pool.query('SELECT * FROM cargo WHERE id = $1', [req.params.id])
      if (!rows[0]) return res.status(404).json({ error: 'Not found' })
      return res.json(rows[0])
    }
    const item = mem.cargo[req.params.id]
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json(item)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// Update cargo (scan)
app.put('/api/cargo/:id', async (req, res) => {
  try {
    const body = req.body
    if (pool) {
      await pool.query(
        `UPDATE cargo SET current_checkpoint=$1, status=$2, history=$3, updated_at=NOW() WHERE id=$4`,
        [body.current_checkpoint, body.status, JSON.stringify(body.history || []), req.params.id]
      )
      const { rows } = await pool.query('SELECT * FROM cargo WHERE id = $1', [req.params.id])
      return res.json(rows[0])
    }
    mem.cargo[req.params.id] = { ...mem.cargo[req.params.id], ...body }
    res.json(mem.cargo[req.params.id])
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// All cargo
app.get('/api/cargo', async (_req, res) => {
  try {
    if (pool) {
      const { rows } = await pool.query('SELECT * FROM cargo ORDER BY id')
      return res.json(rows)
    }
    res.json(Object.values(mem.cargo))
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// AI
app.post('/api/ai/ask', (req, res) => {
  const q = (req.body.question || '').toLowerCase()
  let answer = "I've analysed current operational data across all modules."
  if (q.includes('cargo') && q.includes('delay')) answer = "Critical delayed cargo: prioritise medical (ANT-007) then fuel (ANT-015)."
  else if (q.includes('fuel') || q.includes('diesel')) answer = "Diesel at Maitri: ~18 days remaining at current burn rate. Prioritise next shipment."
  else if (q.includes('personnel') || q.includes('check-in')) answer = "P-034 missed check-in at Field Camp B. Incident INC-0042 active."
  else if (q.includes('priorit')) answer = "Resupply priority: Medical → Diesel → Comms → Research."
  res.json({ answer, model: 'polaris-v1', timestamp: new Date().toISOString() })
})

app.post('/api/ai/plan-expedition', (req, res) => {
  const { teamSize = 40, durationDays = 120, destination = 'Maitri' } = req.body
  const foodKg = Math.round(teamSize * durationDays * 1.8)
  const fuelL = Math.round(teamSize * durationDays * 3.5 + 15000)
  res.json({
    summary: `Plan for ${teamSize} pax, ${durationDays} days @ ${destination}`,
    requirements: {
      personnel: teamSize, foodKg, dieselLitres: fuelL,
      medicalKits: Math.ceil(teamSize / 8) + 10,
      estimatedCargoItems: Math.round(teamSize * 2.2 + 40),
      recommendedVessels: fuelL > 40000 ? 2 : 1, contingencyDays: 15,
    },
    notes: ['15-day weather contingency included', 'Review with Logistics before finalising']
  })
})

app.get('/api/dashboard', (_req, res) => {
  res.json({
    activeExpeditions: 4, personnelDeployed: 127, cargoInTransit: 17,
    inventoryHealth: 92, activeAssets: 84, emergencies: 1
  })
})

// Start
initDB().then(() => {
  app.listen(PORT, () => console.log(`POLARIS API on :${PORT} | DB: ${pool ? 'Neon' : 'memory'}`))
}).catch(err => {
  console.error('DB init failed, starting with memory', err.message)
  app.listen(PORT, () => console.log(`POLARIS API on :${PORT} | DB: memory (fallback)`))
})
