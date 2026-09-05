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
      category TEXT DEFAULT 'Miscellaneous',
      subcategory TEXT,
      location TEXT,
      available NUMERIC DEFAULT 0,
      unit TEXT DEFAULT 'units',
      minimum NUMERIC DEFAULT 0,
      status TEXT DEFAULT 'ok',
      barcode TEXT,
      batch_lot TEXT,
      received_date DATE,
      expiry_date DATE,
      storage_location TEXT,
      condition TEXT DEFAULT 'Good',
      notes TEXT,
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS inventory_usage (
      id SERIAL PRIMARY KEY,
      inventory_id INT REFERENCES inventory(id) ON DELETE CASCADE,
      quantity NUMERIC NOT NULL,
      purpose TEXT,
      staff_member TEXT,
      usage_date TIMESTAMPTZ DEFAULT NOW(),
      notes TEXT
    );
    CREATE TABLE IF NOT EXISTS inventory_audit (
      id SERIAL PRIMARY KEY,
      inventory_id INT,
      action TEXT NOT NULL,
      old_value JSONB,
      new_value JSONB,
      user_id TEXT,
      timestamp TIMESTAMPTZ DEFAULT NOW()
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


  try {
    await pool.query(`ALTER TABLE inventory ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Miscellaneous'`)
    await pool.query(`ALTER TABLE inventory ADD COLUMN IF NOT EXISTS subcategory TEXT`)
    await pool.query(`ALTER TABLE inventory ADD COLUMN IF NOT EXISTS barcode TEXT`)
    await pool.query(`ALTER TABLE inventory ADD COLUMN IF NOT EXISTS batch_lot TEXT`)
    await pool.query(`ALTER TABLE inventory ADD COLUMN IF NOT EXISTS received_date DATE`)
    await pool.query(`ALTER TABLE inventory ADD COLUMN IF NOT EXISTS expiry_date DATE`)
    await pool.query(`ALTER TABLE inventory ADD COLUMN IF NOT EXISTS storage_location TEXT`)
    await pool.query(`ALTER TABLE inventory ADD COLUMN IF NOT EXISTS condition TEXT DEFAULT 'Good'`)
    await pool.query(`ALTER TABLE inventory ADD COLUMN IF NOT EXISTS notes TEXT`)
    await pool.query(`ALTER TABLE inventory ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW()`)
  } catch (e) { /* ignore */ }

  const { rows } = await pool.query('SELECT COUNT(*) FROM expeditions')
  if (parseInt(rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO expeditions (id, name, status, region, personnel, start_date, end_date, objective) VALUES
      ('ANT-47', 'Antarctica Summer Expedition 2026', 'Active', 'Antarctica', 82, '2026-11-10', '2027-03-10', 'Climate monitoring, ice-core sampling, atmospheric research at Maitri & Bharati'),
      ('ANT-46', 'Winter-over 2025-26', 'Completed', 'Antarctica', 45, '2025-03-01', '2026-02-28', 'Year-round station maintenance and continuous meteorological observations'),
      ('ARC-12', 'Arctic Climate Monitoring', 'Planning', 'Arctic', 24, '2026-06-15', '2026-09-15', 'Arctic sea-ice extent and permafrost studies'),
      ('ANT-48', 'Bharati Resupply Mission', 'Planning', 'Antarctica', 18, '2026-12-01', '2027-01-15', 'Critical resupply of fuel, food and equipment to Bharati')
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
      ('ANT-008', 'ANT-47', 'Cold-weather Clothing', 'Personnel', 'Medium', '220 kg', 'Maitri', 0, 'Pending Dispatch'),
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
      INSERT INTO inventory (item, category, subcategory, location, available, unit, minimum, status, barcode, batch_lot, received_date, expiry_date, storage_location, condition) VALUES
      ('Diesel', 'Fuel', NULL, 'Maitri', 8500, 'L', 10000, 'critical', 'FUEL-DSL-001', 'LOT-2025-A', '2025-11-01', NULL, 'Fuel Depot A', 'Good'),
      ('Diesel', 'Fuel', NULL, 'Bharati', 12000, 'L', 8000, 'ok', 'FUEL-DSL-002', 'LOT-2025-B', '2025-11-15', NULL, 'Fuel Depot B', 'Good'),
      ('Food Rations', 'Food', 'Non-perishable', 'Maitri', 1250, 'kg', 800, 'ok', 'FOOD-RAT-001', 'BATCH-FD-44', '2025-10-20', '2027-10-20', 'Cold Store 1', 'Good'),
      ('Food Rations', 'Food', 'Non-perishable', 'Bharati', 980, 'kg', 600, 'ok', 'FOOD-RAT-002', 'BATCH-FD-45', '2025-10-25', '2027-10-25', 'Cold Store 2', 'Good'),
      ('Fresh Produce', 'Food', 'Perishable', 'Maitri', 85, 'kg', 40, 'ok', 'FOOD-FRS-001', 'BATCH-FP-12', '2026-02-01', '2026-03-15', 'Cold Store 1', 'Good'),
      ('Medical Kits', 'Medical', NULL, 'Maitri', 42, 'units', 20, 'ok', 'MED-KIT-001', 'LOT-MED-09', '2025-09-10', '2028-09-10', 'Medical Bay', 'Good'),
      ('Medical Kits', 'Medical', NULL, 'Bharati', 18, 'units', 15, 'ok', 'MED-KIT-002', 'LOT-MED-10', '2025-09-12', '2028-09-12', 'Medical Bay', 'Good'),
      ('Antibiotics Pack', 'Medical', NULL, 'Maitri', 12, 'packs', 8, 'ok', 'MED-ABX-001', 'LOT-ABX-03', '2025-08-01', '2026-08-01', 'Medical Bay', 'Good'),
      ('Batteries (Li-ion)', 'Spares', NULL, 'Field Camp B', 42, 'units', 50, 'low', 'SPR-BAT-001', 'LOT-BAT-22', '2025-12-01', NULL, 'Equipment Shed', 'Good'),
      ('Oxygen Cylinders', 'Medical', NULL, 'Maitri', 28, 'units', 15, 'ok', 'MED-OXY-001', 'LOT-OXY-07', '2025-07-15', NULL, 'Medical Bay', 'Good'),
      ('HF Radio Spares', 'Spares', NULL, 'Maitri', 8, 'sets', 5, 'ok', 'SPR-RAD-001', 'LOT-RAD-05', '2025-11-20', NULL, 'Comms Room', 'Good'),
      ('Generator Oil', 'Spares', NULL, 'Bharati', 45, 'L', 30, 'ok', 'SPR-OIL-001', 'LOT-OIL-11', '2025-10-05', NULL, 'Generator Shed', 'Good'),
      ('Ice-Core Drill Bits', 'Scientific Equipment', NULL, 'Maitri', 6, 'sets', 3, 'ok', 'SCI-DRL-001', 'LOT-DRL-02', '2025-12-10', NULL, 'Science Lab', 'Good'),
      ('Weather Sensors', 'Scientific Equipment', NULL, 'Bharati', 14, 'units', 8, 'ok', 'SCI-WTH-001', 'LOT-WTH-04', '2025-11-28', NULL, 'Science Lab', 'Good')
    `)
    await pool.query(`
      INSERT INTO incidents (id, type, severity, person_id, location, status, description) VALUES
      ('INC-0042', 'Medical', 'Critical', 'P006', 'Field Camp B', 'active', 'Field team member reported severe symptoms. Response Team Alpha deployed.')
    `)
    console.log('Seeded rich demo data')
  }
  console.log('Neon ready')
}

// Memory fallback — typed loosely to avoid TS index errors
const mem: {
  expeditions: any[]
  cargo: Record<string, any>
  personnel: any[]
  inventory: any[]
  inventory_usage: any[]
  inventory_audit: any[]
  nextInvId: number
  nextUsageId: number
  incidents: any[]
} = {
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
  },
  personnel: [],
  inventory: [
    { id: 1, item: 'Diesel', category: 'Fuel', location: 'Maitri', available: 8500, unit: 'L', minimum: 10000, status: 'critical', barcode: 'FUEL-DSL-001', batch_lot: 'LOT-2025-A', storage_location: 'Fuel Depot A', condition: 'Good', updated_at: new Date().toISOString() },
    { id: 2, item: 'Diesel', category: 'Fuel', location: 'Bharati', available: 12000, unit: 'L', minimum: 8000, status: 'ok', barcode: 'FUEL-DSL-002', batch_lot: 'LOT-2025-B', storage_location: 'Fuel Depot B', condition: 'Good', updated_at: new Date().toISOString() },
    { id: 3, item: 'Food Rations', category: 'Food', subcategory: 'Non-perishable', location: 'Maitri', available: 1250, unit: 'kg', minimum: 800, status: 'ok', barcode: 'FOOD-RAT-001', batch_lot: 'BATCH-FD-44', storage_location: 'Cold Store 1', condition: 'Good', expiry_date: '2027-10-20', updated_at: new Date().toISOString() },
    { id: 4, item: 'Food Rations', category: 'Food', subcategory: 'Non-perishable', location: 'Bharati', available: 980, unit: 'kg', minimum: 600, status: 'ok', barcode: 'FOOD-RAT-002', batch_lot: 'BATCH-FD-45', storage_location: 'Cold Store 2', condition: 'Good', expiry_date: '2027-10-25', updated_at: new Date().toISOString() },
    { id: 5, item: 'Fresh Produce', category: 'Food', subcategory: 'Perishable', location: 'Maitri', available: 85, unit: 'kg', minimum: 40, status: 'ok', barcode: 'FOOD-FRS-001', batch_lot: 'BATCH-FP-12', storage_location: 'Cold Store 1', condition: 'Good', expiry_date: '2026-03-15', updated_at: new Date().toISOString() },
    { id: 6, item: 'Medical Kits', category: 'Medical', location: 'Maitri', available: 42, unit: 'units', minimum: 20, status: 'ok', barcode: 'MED-KIT-001', batch_lot: 'LOT-MED-09', storage_location: 'Medical Bay', condition: 'Good', expiry_date: '2028-09-10', updated_at: new Date().toISOString() },
    { id: 7, item: 'Medical Kits', category: 'Medical', location: 'Bharati', available: 18, unit: 'units', minimum: 15, status: 'ok', barcode: 'MED-KIT-002', batch_lot: 'LOT-MED-10', storage_location: 'Medical Bay', condition: 'Good', expiry_date: '2028-09-12', updated_at: new Date().toISOString() },
    { id: 8, item: 'Antibiotics Pack', category: 'Medical', location: 'Maitri', available: 12, unit: 'packs', minimum: 8, status: 'ok', barcode: 'MED-ABX-001', batch_lot: 'LOT-ABX-03', storage_location: 'Medical Bay', condition: 'Good', expiry_date: '2026-08-01', updated_at: new Date().toISOString() },
    { id: 9, item: 'Batteries (Li-ion)', category: 'Spares', location: 'Field Camp B', available: 42, unit: 'units', minimum: 50, status: 'low', barcode: 'SPR-BAT-001', batch_lot: 'LOT-BAT-22', storage_location: 'Equipment Shed', condition: 'Good', updated_at: new Date().toISOString() },
    { id: 10, item: 'Oxygen Cylinders', category: 'Medical', location: 'Maitri', available: 28, unit: 'units', minimum: 15, status: 'ok', barcode: 'MED-OXY-001', batch_lot: 'LOT-OXY-07', storage_location: 'Medical Bay', condition: 'Good', updated_at: new Date().toISOString() },
    { id: 11, item: 'HF Radio Spares', category: 'Spares', location: 'Maitri', available: 8, unit: 'sets', minimum: 5, status: 'ok', barcode: 'SPR-RAD-001', batch_lot: 'LOT-RAD-05', storage_location: 'Comms Room', condition: 'Good', updated_at: new Date().toISOString() },
    { id: 12, item: 'Generator Oil', category: 'Spares', location: 'Bharati', available: 45, unit: 'L', minimum: 30, status: 'ok', barcode: 'SPR-OIL-001', batch_lot: 'LOT-OIL-11', storage_location: 'Generator Shed', condition: 'Good', updated_at: new Date().toISOString() },
    { id: 13, item: 'Ice-Core Drill Bits', category: 'Scientific Equipment', location: 'Maitri', available: 6, unit: 'sets', minimum: 3, status: 'ok', barcode: 'SCI-DRL-001', batch_lot: 'LOT-DRL-02', storage_location: 'Science Lab', condition: 'Good', updated_at: new Date().toISOString() },
    { id: 14, item: 'Weather Sensors', category: 'Scientific Equipment', location: 'Bharati', available: 14, unit: 'units', minimum: 8, status: 'ok', barcode: 'SCI-WTH-001', batch_lot: 'LOT-WTH-04', storage_location: 'Science Lab', condition: 'Good', updated_at: new Date().toISOString() },
  ],
  inventory_usage: [] as any[],
  inventory_audit: [] as any[],
  nextInvId: 15,
  nextUsageId: 1,
  incidents: [],
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'POLARIS API', db: pool ? 'neon' : 'memory', openrouter: !!OPENROUTER_KEY, time: new Date().toISOString() })
})

app.get('/api/expeditions', async (_req, res) => {
  try {
    if (pool) { const { rows } = await pool.query('SELECT * FROM expeditions ORDER BY created_at DESC'); return res.json(rows) }
    res.json(mem.expeditions)
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
      await pool.query(
        `UPDATE cargo SET current_checkpoint=$1, status=$2, history=$3, updated_at=NOW() WHERE id=$4`,
        [b.current_checkpoint ?? b.currentCheckpoint, b.status, JSON.stringify(b.history || []), req.params.id]
      )
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
    res.json(mem.personnel)
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})


function computeStatus(available: number, minimum: number, condition?: string): string {
  if (condition === 'Damaged' || condition === 'Spoiled') return 'unusable'
  if (available <= 0) return 'critical'
  if (available < minimum * 0.5) return 'critical'
  if (available < minimum) return 'low'
  return 'ok'
}

app.get('/api/inventory', async (req, res) => {
  try {
    const { category, location, status, q } = req.query
    if (pool) {
      let sql = 'SELECT * FROM inventory WHERE 1=1'
      const params: any[] = []
      if (category) { params.push(category); sql += ` AND category=$${params.length}` }
      if (location) { params.push(location); sql += ` AND location=$${params.length}` }
      if (status) { params.push(status); sql += ` AND status=$${params.length}` }
      if (q) { params.push(`%${q}%`); sql += ` AND (item ILIKE $${params.length} OR barcode ILIKE $${params.length} OR storage_location ILIKE $${params.length})` }
      sql += ' ORDER BY id'
      const { rows } = await pool.query(sql, params)
      return res.json(rows)
    }
    let list = [...mem.inventory]
    if (category) list = list.filter((i: any) => i.category === category)
    if (location) list = list.filter((i: any) => i.location === location)
    if (status) list = list.filter((i: any) => i.status === status)
    if (q) {
      const qq = String(q).toLowerCase()
      list = list.filter((i: any) => (i.item || '').toLowerCase().includes(qq) || (i.barcode || '').toLowerCase().includes(qq) || (i.storage_location || '').toLowerCase().includes(qq))
    }
    res.json(list)
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.get('/api/inventory/summary', async (_req, res) => {
  try {
    if (pool) {
      const { rows } = await pool.query(`
        SELECT COUNT(*)::int AS total_items,
          COALESCE(SUM(CASE WHEN status='low' THEN 1 ELSE 0 END),0)::int AS low_stock,
          COALESCE(SUM(CASE WHEN status='critical' OR status='unusable' THEN 1 ELSE 0 END),0)::int AS critical,
          COALESCE(SUM(CASE WHEN expiry_date IS NOT NULL AND expiry_date <= CURRENT_DATE + INTERVAL '30 days' THEN 1 ELSE 0 END),0)::int AS expiring_soon,
          COALESCE(SUM(CASE WHEN condition IN ('Damaged','Spoiled') THEN 1 ELSE 0 END),0)::int AS damaged
        FROM inventory`)
      const byCat = await pool.query(`SELECT category, COUNT(*)::int AS count, COALESCE(SUM(available),0)::float AS total_qty FROM inventory GROUP BY category ORDER BY category`)
      return res.json({ ...rows[0], by_category: byCat.rows })
    }
    const list = mem.inventory
    const catMap: Record<string, { count: number; total_qty: number }> = {}
    list.forEach((i: any) => {
      const c = i.category || 'Miscellaneous'
      if (!catMap[c]) catMap[c] = { count: 0, total_qty: 0 }
      catMap[c].count++; catMap[c].total_qty += Number(i.available) || 0
    })
    const now = Date.now()
    res.json({
      total_items: list.length,
      low_stock: list.filter((i: any) => i.status === 'low').length,
      critical: list.filter((i: any) => i.status === 'critical' || i.status === 'unusable').length,
      expiring_soon: list.filter((i: any) => i.expiry_date && new Date(i.expiry_date).getTime() - now < 30*86400000 && new Date(i.expiry_date).getTime() > now).length,
      damaged: list.filter((i: any) => i.condition === 'Damaged' || i.condition === 'Spoiled').length,
      by_category: Object.entries(catMap).map(([category, v]) => ({ category, ...v }))
    })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.get('/api/inventory/alerts', async (_req, res) => {
  try {
    const list = pool ? (await pool.query('SELECT * FROM inventory')).rows : mem.inventory
    const alerts: any[] = []
    const now = Date.now()
    list.forEach((i: any) => {
      if (i.status === 'critical' || i.status === 'unusable') alerts.push({ type: 'critical', title: `${i.item} critical`, desc: `${i.location}: ${i.available} ${i.unit} (min ${i.minimum})`, inventory_id: i.id })
      else if (i.status === 'low') alerts.push({ type: 'warning', title: `${i.item} low stock`, desc: `${i.location}: ${i.available} ${i.unit}`, inventory_id: i.id })
      if (i.condition === 'Damaged' || i.condition === 'Spoiled') alerts.push({ type: 'warning', title: `${i.item} ${i.condition}`, desc: `${i.location}`, inventory_id: i.id })
      if (i.expiry_date) {
        const d = new Date(i.expiry_date).getTime() - now
        if (d < 0) alerts.push({ type: 'critical', title: `${i.item} expired`, desc: `Expired ${i.expiry_date}`, inventory_id: i.id })
        else if (d < 30*86400000) alerts.push({ type: 'warning', title: `${i.item} expiring soon`, desc: `Expires ${i.expiry_date}`, inventory_id: i.id })
      }
    })
    res.json(alerts)
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.get('/api/inventory/usage/history', async (req, res) => {
  try {
    const limit = Math.min(parseInt(String(req.query.limit || '50')), 200)
    if (pool) {
      const { rows } = await pool.query(`SELECT u.*, i.item, i.unit, i.location, i.category FROM inventory_usage u LEFT JOIN inventory i ON i.id=u.inventory_id ORDER BY u.usage_date DESC LIMIT $1`, [limit])
      return res.json(rows)
    }
    const enriched = (mem.inventory_usage || []).slice().sort((a: any, b: any) => new Date(b.usage_date).getTime() - new Date(a.usage_date).getTime()).slice(0, limit).map((u: any) => {
      const item = mem.inventory.find((i: any) => i.id === u.inventory_id)
      return { ...u, item: item?.item, unit: item?.unit, location: item?.location, category: item?.category }
    })
    res.json(enriched)
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.get('/api/inventory/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    if (pool) {
      const { rows } = await pool.query('SELECT * FROM inventory WHERE id=$1', [id])
      if (!rows[0]) return res.status(404).json({ error: 'Not found' })
      return res.json(rows[0])
    }
    const item = mem.inventory.find((i: any) => i.id === id)
    if (!item) return res.status(404).json({ error: 'Not found' })
    res.json(item)
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.post('/api/inventory', async (req, res) => {
  try {
    const b = req.body
    const available = Number(b.available ?? b.quantity ?? 0)
    const minimum = Number(b.minimum ?? 0)
    const condition = b.condition || 'Good'
    const status = computeStatus(available, minimum, condition)
    if (pool) {
      const { rows } = await pool.query(
        `INSERT INTO inventory (item, category, subcategory, location, available, unit, minimum, status, barcode, batch_lot, received_date, expiry_date, storage_location, condition, notes, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,NOW()) RETURNING *`,
        [b.item, b.category || 'Miscellaneous', b.subcategory || null, b.location || 'Maitri', available, b.unit || 'units', minimum, status,
         b.barcode || null, b.batch_lot || b.batch || null, b.received_date || new Date().toISOString().slice(0,10), b.expiry_date || null,
         b.storage_location || null, condition, b.notes || null]
      )
      return res.status(201).json(rows[0])
    }
    const row = {
      id: mem.nextInvId++, item: b.item, category: b.category || 'Miscellaneous', subcategory: b.subcategory || null,
      location: b.location || 'Maitri', available, unit: b.unit || 'units', minimum, status,
      barcode: b.barcode || null, batch_lot: b.batch_lot || b.batch || null,
      received_date: b.received_date || new Date().toISOString().slice(0,10), expiry_date: b.expiry_date || null,
      storage_location: b.storage_location || null, condition, notes: b.notes || null, updated_at: new Date().toISOString()
    }
    mem.inventory.push(row)
    res.status(201).json(row)
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.put('/api/inventory/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const b = req.body
    if (pool) {
      const { rows: existing } = await pool.query('SELECT * FROM inventory WHERE id=$1', [id])
      if (!existing[0]) return res.status(404).json({ error: 'Not found' })
      const old = existing[0]
      const available = b.available !== undefined ? Number(b.available) : Number(old.available)
      const minimum = b.minimum !== undefined ? Number(b.minimum) : Number(old.minimum)
      const condition = b.condition !== undefined ? b.condition : old.condition
      const status = computeStatus(available, minimum, condition)
      const { rows } = await pool.query(
        `UPDATE inventory SET item=COALESCE($1,item), category=COALESCE($2,category), subcategory=COALESCE($3,subcategory),
          location=COALESCE($4,location), available=$5, unit=COALESCE($6,unit), minimum=$7, status=$8,
          barcode=COALESCE($9,barcode), batch_lot=COALESCE($10,batch_lot), received_date=COALESCE($11,received_date),
          expiry_date=COALESCE($12,expiry_date), storage_location=COALESCE($13,storage_location), condition=$14,
          notes=COALESCE($15,notes), updated_at=NOW() WHERE id=$16 RETURNING *`,
        [b.item ?? null, b.category ?? null, b.subcategory ?? null, b.location ?? null, available, b.unit ?? null, minimum, status,
         b.barcode ?? null, b.batch_lot ?? b.batch ?? null, b.received_date ?? null, b.expiry_date ?? null,
         b.storage_location ?? null, condition, b.notes ?? null, id]
      )
      return res.json(rows[0])
    }
    const idx = mem.inventory.findIndex((i: any) => i.id === id)
    if (idx < 0) return res.status(404).json({ error: 'Not found' })
    const old = mem.inventory[idx]
    const available = b.available !== undefined ? Number(b.available) : Number(old.available)
    const minimum = b.minimum !== undefined ? Number(b.minimum) : Number(old.minimum)
    const condition = b.condition !== undefined ? b.condition : old.condition
    mem.inventory[idx] = { ...old, ...b, available, minimum, condition, status: computeStatus(available, minimum, condition), updated_at: new Date().toISOString() }
    res.json(mem.inventory[idx])
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.post('/api/inventory/:id/use', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const qty = Number(req.body.quantity)
    if (!qty || qty <= 0) return res.status(400).json({ error: 'quantity must be > 0' })
    const purpose = req.body.purpose || 'General use'
    const staff = req.body.staff_member || req.body.user_id || 'unknown'
    const notes = req.body.notes || null
    if (pool) {
      const client = await pool.connect()
      try {
        await client.query('BEGIN')
        const { rows: existing } = await client.query('SELECT * FROM inventory WHERE id=$1 FOR UPDATE', [id])
        if (!existing[0]) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Not found' }) }
        const available = Number(existing[0].available)
        if (qty > available) { await client.query('ROLLBACK'); return res.status(400).json({ error: `Insufficient stock. Available: ${available}` }) }
        const newAvail = available - qty
        const status = computeStatus(newAvail, Number(existing[0].minimum), existing[0].condition)
        const { rows: updated } = await client.query(`UPDATE inventory SET available=$1, status=$2, updated_at=NOW() WHERE id=$3 RETURNING *`, [newAvail, status, id])
        const { rows: usage } = await client.query(`INSERT INTO inventory_usage (inventory_id, quantity, purpose, staff_member, notes) VALUES ($1,$2,$3,$4,$5) RETURNING *`, [id, qty, purpose, staff, notes])
        await client.query('COMMIT')
        return res.json({ item: updated[0], usage: usage[0] })
      } catch (e) { await client.query('ROLLBACK'); throw e }
      finally { client.release() }
    }
    const idx = mem.inventory.findIndex((i: any) => i.id === id)
    if (idx < 0) return res.status(404).json({ error: 'Not found' })
    const available = Number(mem.inventory[idx].available)
    if (qty > available) return res.status(400).json({ error: `Insufficient stock. Available: ${available}` })
    const newAvail = available - qty
    mem.inventory[idx] = { ...mem.inventory[idx], available: newAvail, status: computeStatus(newAvail, Number(mem.inventory[idx].minimum), mem.inventory[idx].condition), updated_at: new Date().toISOString() }
    const usage = { id: mem.nextUsageId++, inventory_id: id, quantity: qty, purpose, staff_member: staff, usage_date: new Date().toISOString(), notes }
    mem.inventory_usage.push(usage)
    res.json({ item: mem.inventory[idx], usage })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.post('/api/inventory/:id/condition', async (req, res) => {
  try {
    const id = parseInt(req.params.id)
    const condition = req.body.condition
    const removeQty = Number(req.body.remove_quantity || 0)
    const staff = req.body.staff_member || req.body.user_id || 'system'
    const notes = req.body.notes || null
    if (!condition) return res.status(400).json({ error: 'condition required' })
    if (pool) {
      const { rows: existing } = await pool.query('SELECT * FROM inventory WHERE id=$1', [id])
      if (!existing[0]) return res.status(404).json({ error: 'Not found' })
      let available = Number(existing[0].available)
      if (removeQty > 0) {
        if (removeQty > available) return res.status(400).json({ error: 'remove_quantity exceeds available' })
        available -= removeQty
        await pool.query(`INSERT INTO inventory_usage (inventory_id, quantity, purpose, staff_member, notes) VALUES ($1,$2,$3,$4,$5)`, [id, removeQty, `Condition: ${condition}`, staff, notes])
      }
      const status = computeStatus(available, Number(existing[0].minimum), condition)
      const { rows } = await pool.query(`UPDATE inventory SET condition=$1, available=$2, status=$3, notes=COALESCE($4,notes), updated_at=NOW() WHERE id=$5 RETURNING *`, [condition, available, status, notes, id])
      return res.json(rows[0])
    }
    const idx = mem.inventory.findIndex((i: any) => i.id === id)
    if (idx < 0) return res.status(404).json({ error: 'Not found' })
    let available = Number(mem.inventory[idx].available)
    if (removeQty > 0) {
      if (removeQty > available) return res.status(400).json({ error: 'remove_quantity exceeds available' })
      available -= removeQty
      mem.inventory_usage.push({ id: mem.nextUsageId++, inventory_id: id, quantity: removeQty, purpose: `Condition: ${condition}`, staff_member: staff, usage_date: new Date().toISOString(), notes })
    }
    mem.inventory[idx] = { ...mem.inventory[idx], condition, available, status: computeStatus(available, Number(mem.inventory[idx].minimum), condition), notes: notes || mem.inventory[idx].notes, updated_at: new Date().toISOString() }
    res.json(mem.inventory[idx])
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.get('/api/incidents', async (_req, res) => {
  try {
    if (pool) { const { rows } = await pool.query('SELECT * FROM incidents ORDER BY created_at DESC'); return res.json(rows) }
    res.json(mem.incidents)
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.post('/api/incidents', async (req, res) => {
  try {
    const b = req.body
    const id = b.id || `INC-${Date.now().toString(36).toUpperCase()}`
    const row = {
      id,
      type: b.type || 'Medical',
      severity: b.severity || 'High',
      person_id: b.person_id || null,
      location: b.location || 'Unknown',
      status: b.status || 'active',
      description: b.description || null,
      created_at: new Date().toISOString(),
    }
    if (pool) {
      // Extend table if needed for lat/lng notes
      try {
        await pool.query(`ALTER TABLE incidents ADD COLUMN IF NOT EXISTS lat DOUBLE PRECISION`)
        await pool.query(`ALTER TABLE incidents ADD COLUMN IF NOT EXISTS lng DOUBLE PRECISION`)
      } catch {}
      await pool.query(
        `INSERT INTO incidents (id, type, severity, person_id, location, status, description)
         VALUES ($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT (id) DO UPDATE SET status=EXCLUDED.status, description=EXCLUDED.description`,
        [row.id, row.type, row.severity, row.person_id, row.location, row.status, row.description]
      )
      if (b.lat != null || b.lng != null) {
        try {
          await pool.query(`UPDATE incidents SET lat=$1, lng=$2 WHERE id=$3`, [b.lat ?? null, b.lng ?? null, row.id])
        } catch {}
      }
      const { rows } = await pool.query('SELECT * FROM incidents WHERE id=$1', [row.id])
      return res.status(201).json(rows[0] || row)
    }
    const existing = mem.incidents.findIndex((i: any) => i.id === id)
    if (existing >= 0) mem.incidents[existing] = { ...mem.incidents[existing], ...row, lat: b.lat, lng: b.lng }
    else mem.incidents.unshift({ ...row, lat: b.lat, lng: b.lng })
    res.status(201).json({ ...row, lat: b.lat, lng: b.lng })
  } catch (e: any) { res.status(500).json({ error: e.message }) }
})

app.post('/api/ai/ask', async (req, res) => {
  const question = req.body.question || ''
  const systemPrompt = `You are POLARIS AI Commander for NCPOR polar expedition management.
Context: Expedition ANT-47 active (82 personnel). Diesel at Maitri 8500L (critical, ~18 days left). P006 overdue check-in at Field Camp B (INC-0042 medical). Cargo moving India→Port→Ship→Antarctica. Stations: Maitri, Bharati. Ship: MV Sagar Kanya.
Answer concisely and actionably.`

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
          model: 'openai/gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question }
          ],
          max_tokens: 500,
          temperature: 0.4,
        }),
      })
      if (r.ok) {
        const data = await r.json() as any
        const answer = data.choices?.[0]?.message?.content || 'No response'
        return res.json({ answer, model: data.model || 'openrouter', source: 'openrouter', timestamp: new Date().toISOString() })
      }
    } catch (err) {
      console.error('OpenRouter error', err)
    }
  }

  const q = question.toLowerCase()
  let answer = "I've analysed current operational data. Systems nominal with exceptions noted on the command dashboard."
  if (q.includes('cargo') && (q.includes('delay') || q.includes('critical'))) answer = "Critical cargo: ANT-015 (Aviation Fuel) delayed; prioritise ANT-002 (Diesel) and ANT-007 (Generator Spares) for Maitri."
  else if (q.includes('fuel') || q.includes('diesel')) answer = "Diesel at Maitri: 8,500 L vs 10,000 L minimum. ~18 days remaining. Prioritise next fuel shipment."
  else if (q.includes('personnel') || q.includes('check-in')) answer = "P006 (Suresh Reddy) at Field Camp B missed check-in. Incident INC-0042 (Medical, Critical) is active. Response Team Alpha deployed."
  else if (q.includes('priorit') || q.includes('resupply')) answer = "Priority: 1) Medical 2) Diesel fuel 3) Generator/comms spares 4) Research instruments."
  else if (q.includes('risk') || q.includes('summar')) answer = "Risk: ELEVATED. Active medical emergency at Field Camp B, fuel timeline at Maitri (~18 days), weather cargo delay. ANT-47 still operational."
  else if (q.includes('weather')) answer = "Maitri: -22°C, wind 38 km/h. Field Camp B: blizzard risk. Bharati: clearer. Ship: rough seas."

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
            content: `Polar logistics planner for NCPOR. team=${teamSize}, duration=${durationDays} days, destination=${destination}, mission=${mission}.
Reply ONLY valid JSON: {"summary":"...","requirements":{"personnel":n,"foodKg":n,"dieselLitres":n,"medicalKits":n,"estimatedCargoItems":n,"recommendedVessels":n,"contingencyDays":n},"notes":["..."]}`
          }],
          max_tokens: 400,
          temperature: 0.3,
        }),
      })
      if (r.ok) {
        const data = await r.json() as any
        const text = data.choices?.[0]?.message?.content || ''
        const match = text.match(/\{[\s\S]*\}/)
        if (match) return res.json(JSON.parse(match[0]))
      }
    } catch {}
  }
  const foodKg = Math.round(teamSize * durationDays * 1.8)
  const fuelL = Math.round(teamSize * durationDays * 3.5 + 15000)
  res.json({
    summary: `AI plan for ${teamSize} personnel, ${durationDays} days at ${destination}`,
    requirements: { personnel: teamSize, foodKg, dieselLitres: fuelL, medicalKits: Math.ceil(teamSize / 8) + 10, estimatedCargoItems: Math.round(teamSize * 2.2 + 40), recommendedVessels: fuelL > 40000 ? 2 : 1, contingencyDays: 15 },
    notes: ['15-day weather contingency included', 'Review with Logistics Officer']
  })
})

app.get('/api/dashboard', (_req, res) => {
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
