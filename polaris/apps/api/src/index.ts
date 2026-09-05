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

const pool = process.env.DATABASE_URL
  ? new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } })
  : null

const OPENROUTER_KEY = process.env.OPENROUTER_API_KEY || ''

async function initDB() {
  if (!pool) { console.log('No DATABASE_URL — memory mode'); return }
  await pool.query(`
    CREATE TABLE IF NOT EXISTS expeditions (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'Active',
      region TEXT,
      personnel INT DEFAULT 0,
      start_date DATE,
      end_date DATE,
      objective TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS cargo (
      id TEXT PRIMARY KEY,
      expedition_id TEXT REFERENCES expeditions(id),
      item TEXT NOT NULL,
      category TEXT,
      priority TEXT DEFAULT 'Medium',
      weight TEXT,
      origin TEXT DEFAULT 'Goa, India',
      destination TEXT,
      current_checkpoint INT DEFAULT 0,
      status TEXT DEFAULT 'Pending Dispatch',
      history JSONB DEFAULT '[]',
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS personnel (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT,
      expedition_id TEXT,
      location TEXT,
      status TEXT DEFAULT 'active',
      last_checkin TIMESTAMPTZ,
      team TEXT
    );
    CREATE TABLE IF NOT EXISTS inventory (
      id SERIAL PRIMARY KEY,
      item TEXT NOT NULL,
      location TEXT,
      available NUMERIC,
      unit TEXT,
      minimum NUMERIC,
      status TEXT DEFAULT 'ok'
    );
    CREATE TABLE IF NOT EXISTS incidents (
      id TEXT PRIMARY KEY,
      type TEXT,
      severity TEXT,
      person_id TEXT,
      location TEXT,
      status TEXT DEFAULT 'active',
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `)

  const { rows } = await pool.query('SELECT COUNT(*) FROM expeditions')
  if (parseInt(rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO expeditions (id, name, status, region, personnel, start_date, end_date, objective) VALUES
      ('ANT-47', 'Antarctica Summer Expedition 2026', 'Active', 'Antarctica', 82, '2026-11-10', '2027-03-10', 'Climate monitoring, ice-core sampling, atmospheric research at Maitri & Bharati'),
      ('ANT-46', 'Winter-over 2025-26', 'Completed', 'Antarctica', 45, '2025-03-01', '2026-02-28', 'Year-round station maintenance and continuous meteorological observations'),
      ('ARC-12', 'Arctic Climate Monitoring', 'Planning', 'Arctic', 24, '2026-06-15', '2026-09-15', 'Arctic sea-ice extent and permafrost studies in collaboration with international partners'),
      ('ANT-48', 'Bharati Resupply Mission', 'Planning', 'Antarctica', 18, '2026-12-01', '2027-01-15', 'Critical resupply of fuel, food and scientific equipment to Bharati Station')
    `)
    await pool.query(`
      INSERT INTO cargo (id, expedition_id, item, category, priority, weight, destination, current_checkpoint, status) VALUES
      ('ANT-001', 'ANT-47', 'Satellite Communication Equipment', 'Communications', 'Critical', '420 kg', 'Maitri', 0, 'Pending Dispatch'),
      ('ANT-002', 'ANT-47', 'Diesel Fuel (20kL)', 'Fuel', 'Critical', '20,000 L', 'Maitri', 0, 'Pending Dispatch'),
      ('ANT-003', 'ANT-47', 'Food Rations (freeze-dried)', 'Consumables', 'High', '1,250 kg', 'Bharati', 0, 'Pending Dispatch'),
      ('ANT-004', 'ANT-47', 'Medical Kits & Emergency Supplies', 'Medical', 'Critical', '85 kg', 'Field Camp B', 0, 'Pending Dispatch'),
      ('ANT-005', 'ANT-47', 'Ice-Core Drill & Scientific Instruments', 'Research', 'High', '310 kg', 'Maitri', 0, 'Pending Dispatch'),
      ('ANT-006', 'ANT-47', 'HF/VHF Radio Sets (12 units)', 'Communications', 'High', '48 kg', 'Bharati', 0, 'Pending Dispatch'),
      ('ANT-007', 'ANT-47', 'Generator Spares & Batteries', 'Equipment', 'Critical', '190 kg', 'Maitri', 0, 'Pending Dispatch'),
      ('ANT-008', 'ANT-47', 'Cold-weather Clothing & Sleeping Systems', 'Personnel', 'Medium', '220 kg', 'Maitri', 0, 'Pending Dispatch'),
      ('ANT-045', 'ANT-47', 'Weather Station Sensors', 'Research', 'Medium', '65 kg', 'Field Camp A', 2, 'In Transit'),
      ('ANT-015', 'ANT-47', 'Aviation Fuel (Jet-A1)', 'Fuel', 'Critical', '5,000 L', 'Maitri', 1, 'Delayed')
    `)
    await pool.query(`
      INSERT INTO personnel (id, name, role, expedition_id, location, status, team) VALUES
      ('P001', 'Dr. Rajesh Mehta', 'Expedition Commander', 'ANT-47', 'Maitri', 'active', 'Command'),
      ('P002', 'Anita Sharma', 'Logistics Officer', 'ANT-47', 'Maitri', 'active', 'Logistics'),
      ('P003', 'Capt. Vikram Singh', 'Safety Officer', 'ANT-47', 'Maitri', 'active', 'Safety'),
      ('P004', 'Dr. Priya Nair', 'Medical Officer', 'ANT-47', 'Maitri', 'active', 'Medical'),
      ('P005', 'Arjun Kumar', 'Station Engineer', 'ANT-47', 'Bharati', 'active', 'Engineering'),
      ('P006', 'Suresh Reddy', 'Field Team Lead', 'ANT-47', 'Field Camp B', 'overdue', 'Research Team A'),
      ('P007', 'Meera Iyer', 'Climate Scientist', 'ANT-47', 'Field Camp A', 'active', 'Research Team A'),
      ('P008', 'Ravi Patel', 'Logistics (Ship)', 'ANT-47', 'MV Sagar Kanya', 'transit', 'Ship Crew'),
      ('P009', 'Dr. Ananya Rao', 'Glaciologist', 'ANT-47', 'Maitri', 'active', 'Research Team B'),
      ('P010', 'Karan Malhotra', 'Communications Tech', 'ANT-47', 'Bharati', 'active', 'Comms')
    `)
    await pool.query(`
      INSERT INTO inventory (item, location, available, unit, minimum, status) VALUES
      ('Diesel', 'Maitri', 8500, 'L', 10000, 'critical'),
      ('Diesel', 'Bharati', 12000, 'L', 8000, 'ok'),
      ('Food Rations', 'Maitri', 1250, 'kg', 800, 'ok'),
      ('Food Rations', 'Bharati', 980, 'kg', 600, 'ok'),
      ('Medical Kits', 'Maitri', 42, 'units', 20, 'ok'),
      ('Medical Kits', 'Bharati', 18, 'units', 15, 'ok'),
      ('Batteries (Li-ion)', 'Field Camp B', 42, 'units', 50, 'low'),
      ('Oxygen Cylinders', 'Maitri', 28, 'units', 15, 'ok'),
      ('HF Radio Spares', 'Maitri', 8, 'sets', 5, 'ok'),
      ('Generator Oil', 'Bharati', 45, 'L', 30, 'ok')
    `)
    await pool.query(`
      INSERT INTO incidents (id, type, severity, person_id, location, status, description) VALUES
      ('INC-0042', 'Medical', 'Critical', 'P006', 'Field Camp B', 'active', 'Field team member reported severe symptoms. Response Team Alpha deployed. Evacuation to Maitri medical facility recommended.')
    `)
    console.log('Seeded rich demo data')
  }
  console.log('Neon ready')
}

// Memory fallback
const mem: any = { expeditions: [], cargo: {}, personnel: [], inventory: [], incidents: [] }

// ---- Routes ----
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'POLARIS API', db: pool ? 'neon' : 'memory', openrouter: !!OPENROUTER_KEY, time: new Date().toISOString() })
})

app.get('/api/expeditions', async (_req, res) => {
  try {
    if (pool) { const { rows } = await pool.query('SELECT * FROM expeditions ORDER BY created_at DESC'); return res.json(rows) }
    res.json(mem.expeditions.length ? mem.expeditions : [
      { id: 'ANT-47', name: 'Antarctica Summer Expedition 2026', status: 'Active', region: 'Antarctica', personnel: 82 }
    ])
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.get('/api/expeditions/:id/cargo', async (req, res) => {
  try {
    if (pool) { const { rows } = await pool.query('SELECT * FROM cargo WHERE expedition_id=$1 ORDER BY id', [req.params.id]); return res.json(rows) }
    res.json(Object.values(mem.cargo).filter((c: any) => c.expedition_id === req.params.id))
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.get('/api/cargo/:id', async (req, res) => {
  try {
    if (pool) {
      const { rows } = await pool.query('SELECT * FROM cargo WHERE id=$1', [req.params.id])
      if (!rows[0]) return res.status(404).json({ error: 'Not found' })
      return res.json(rows[0])
    }
    const item = mem.cargo[req.params.id]
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json(item)
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.put('/api/cargo/:id', async (req, res) => {
  try {
    const b = req.body
    if (pool) {
      await pool.query(`UPDATE cargo SET current_checkpoint=$1, status=$2, history=$3, updated_at=NOW() WHERE id=$4`,
        [b.current_checkpoint ?? b.currentCheckpoint, b.status, JSON.stringify(b.history || []), req.params.id])
      const { rows } = await pool.query('SELECT * FROM cargo WHERE id=$1', [req.params.id])
      return res.json(rows[0])
    }
    mem.cargo[req.params.id] = { ...mem.cargo[req.params.id], ...b }
    res.json(mem.cargo[req.params.id])
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.get('/api/cargo', async (_req, res) => {
  try {
    if (pool) { const { rows } = await pool.query('SELECT * FROM cargo ORDER BY id'); return res.json(rows) }
    res.json(Object.values(mem.cargo))
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.get('/api/personnel', async (_req, res) => {
  try {
    if (pool) { const { rows } = await pool.query('SELECT * FROM personnel ORDER BY id'); return res.json(rows) }
    res.json([])
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.get('/api/inventory', async (_req, res) => {
  try {
    if (pool) { const { rows } = await pool.query('SELECT * FROM inventory ORDER BY id'); return res.json(rows) }
    res.json([])
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.get('/api/incidents', async (_req, res) => {
  try {
    if (pool) { const { rows } = await pool.query('SELECT * FROM incidents ORDER BY created_at DESC'); return res.json(rows) }
    res.json([])
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

// ---- AI with OpenRouter ----
app.post('/api/ai/ask', async (req, res) => {
  const question = req.body.question || ''
  const systemPrompt = `You are POLARIS AI Commander, the intelligence layer for NCPOR (National Centre for Polar and Ocean Research) polar expedition management system.
You have access to real-time operational data about:
- Expeditions (ANT-47 active in Antarctica with 82 personnel)
- Cargo tracking (items moving India → Port → Ship → Antarctica → Stations)
- Inventory (Diesel at Maitri critically low: 8500L vs 10000L minimum, ~18 days remaining)
- Personnel (P006 Suresh Reddy overdue check-in at Field Camp B)
- Active incident INC-0042 medical emergency at Field Camp B
- Weather: Maitri -22°C, Field Camp B blizzard risk

Answer concisely, professionally, and actionably. Use Indian expedition context (Maitri, Bharati stations, MV Sagar Kanya). If asked about something outside polar ops, still try to relate or say you focus on expedition command.`

  // Try OpenRouter first
  if (OPENROUTER_KEY) {
    try {
      const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://polaris-ncpor.vercel.app',
          'X-Title': 'POLARIS NCPOR Command',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini', // cost-effective; change to preferred model
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question }
          ],
          max_tokens: 500,
          temperature: 0.4,
        }),
      })
      if (r.ok) {
        const data = await r.json()
        const answer = data.choices?.[0]?.message?.content || 'No response'
        return res.json({ answer, model: data.model || 'openrouter', source: 'openrouter', timestamp: new Date().toISOString() })
      }
    } catch (err) {
      console.error('OpenRouter error', err)
    }
  }

  // Local fallback
  const q = question.toLowerCase()
  let answer = "I've analysed current operational data across Expeditions, Cargo, Inventory, Personnel and Emergency modules. All systems within acceptable parameters with noted exceptions on the command dashboard."
  if (q.includes('cargo') && (q.includes('delay') || q.includes('critical'))) answer = "Critical delayed/priority cargo: ANT-015 (Aviation Fuel) is delayed; ANT-007 (Generator Spares) and ANT-002 (Diesel) should be prioritised for Maitri given the 18-day fuel horizon."
  else if (q.includes('fuel') || q.includes('diesel') || q.includes('run out')) answer = "Diesel at Maitri: 8,500 L available vs 10,000 L minimum. Daily burn ~420 L → projected shortage in approximately 18 days. Recommend prioritising next fuel shipment and reducing non-critical generator load."
  else if (q.includes('personnel') || q.includes('check-in') || q.includes('team')) answer = "31 field personnel deployed. P006 (Suresh Reddy) at Field Camp B has missed scheduled check-in. This triggered Incident INC-0042 (Medical, Critical). Response Team Alpha is deployed."
  else if (q.includes('priorit') || q.includes('shipment') || q.includes('resupply')) answer = "Resupply priority ranking: 1) Medical supplies (active incident) 2) Diesel fuel (18-day horizon at Maitri) 3) Generator/comms spares 4) Research instruments."
  else if (q.includes('risk') || q.includes('summar')) answer = "Overall risk: ELEVATED. Primary concerns: (1) Active medical emergency INC-0042 at Field Camp B, (2) Fuel depletion timeline at Maitri (~18 days), (3) Weather-related cargo delay on ANT-015. Expedition ANT-47 remains operationally viable."
  else if (q.includes('weather')) answer = "Maitri: -22°C, wind 38 km/h, visibility moderate. Field Camp B: blizzard risk, operations not recommended. Bharati: clearer conditions. Ship: rough seas contributing to cargo delay."

  res.json({ answer, model: 'polaris-rules-v1', source: 'local', timestamp: new Date().toISOString() })
})

app.post('/api/ai/plan-expedition', async (req, res) => {
  const { teamSize = 40, durationDays = 120, destination = 'Maitri', mission = 'research' } = req.body
  if (OPENROUTER_KEY) {
    try {
      const r = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://polaris-ncpor.vercel.app',
          'X-Title': 'POLARIS Planner',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [{
            role: 'user',
            content: `You are a polar logistics planner for NCPOR India. Calculate requirements for: team=${teamSize}, duration=${durationDays} days, destination=${destination}, mission=${mission}.
Reply ONLY with valid JSON: {"summary":"...","requirements":{"personnel":n,"foodKg":n,"dieselLitres":n,"medicalKits":n,"estimatedCargoItems":n,"recommendedVessels":n,"contingencyDays":n},"notes":["...","..."]}`
          }],
          max_tokens: 400,
          temperature: 0.3,
        }),
      })
      if (r.ok) {
        const data = await r.json()
        const text = data.choices?.[0]?.message?.content || ''
        const match = text.match(/\{[\s\S]*\}/)
        if (match) return res.json(JSON.parse(match[0]))
      }
    } catch {}
  }
  // fallback calc
  const foodKg = Math.round(teamSize * durationDays * 1.8)
  const fuelL = Math.round(teamSize * durationDays * 3.5 + 15000)
  res.json({
    summary: `AI plan for ${teamSize} personnel, ${durationDays} days at ${destination}`,
    requirements: { personnel: teamSize, foodKg, dieselLitres: fuelL, medicalKits: Math.ceil(teamSize / 8) + 10, estimatedCargoItems: Math.round(teamSize * 2.2 + 40), recommendedVessels: fuelL > 40000 ? 2 : 1, contingencyDays: 15 },
    notes: ['15-day weather contingency included', 'Fuel includes station generators + vehicles', 'Review with Logistics Officer']
  })
})

app.get('/api/dashboard', async (_req, res) => {
  res.json({
    activeExpeditions: 4, personnelDeployed: 127, cargoInTransit: 17,
    inventoryHealth: 92, activeAssets: 84, emergencies: 1,
    alerts: [
      { type: 'critical', title: 'Fuel projected below threshold', desc: 'Maitri — Diesel under minimum in ~18 days' },
      { type: 'warning', title: 'Cargo ANT-015 delayed', desc: 'Aviation fuel delayed due to weather' },
      { type: 'critical', title: 'Personnel check-in overdue', desc: 'P006 at Field Camp B — INC-0042 active' },
    ]
  })
})

initDB().then(() => {
  app.listen(PORT, () => console.log(`POLARIS API :${PORT} | DB:${pool ? 'neon' : 'memory'} | OpenRouter:${!!OPENROUTER_KEY}`))
}).catch(err => {
  console.error('DB init error', err.message)
  app.listen(PORT, () => console.log(`POLARIS API :${PORT} | memory fallback`))
})
