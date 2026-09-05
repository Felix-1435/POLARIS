# Inventory Manager — Update Notes

## What was added

Full **Inventory Manager** so station staff can update live stock when supplies are used. Changes are stored in Neon and reflected on the Inventory page (and summary/alerts) for every connected client.

### API (`apps/api/src/index.ts`)

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/inventory` | List stock (filters: category, location, status, q) |
| GET | `/api/inventory/summary` | KPIs + by-category counts |
| GET | `/api/inventory/:id` | Single item |
| POST | `/api/inventory` | **Stock intake** (new item) |
| PUT | `/api/inventory/:id` | **Update** qty, location, min, condition, etc. |
| POST | `/api/inventory/:id/use` | **Usage / consumption** — auto-deducts available |
| POST | `/api/inventory/:id/condition` | Mark Damaged/Spoiled and optionally remove qty |
| GET | `/api/inventory/usage/history` | Recent usage log |
| GET | `/api/inventory/:id/usage` | Usage for one item |
| GET | `/api/inventory/alerts` | Low/critical/expiry/damage alerts |
| DELETE | `/api/inventory/:id` | Remove SKU |

Schema extensions on `inventory`: category, subcategory, barcode, batch_lot, received_date, expiry_date, storage_location, condition, notes, updated_at.

New tables: `inventory_usage`, `inventory_audit`.

### Frontend (`apps/frontend/src/pages/inventory/InventoryDashboard.tsx`)

Tabs:

1. **Dashboard** — live KPIs, category cards, quick stock table, Use / Edit actions  
2. **Stock List** — search + filters, full table, Use / Edit / Condition  
3. **Stock Intake** — register incoming items (name, category, qty, unit, batch, expiry, storage…)  
4. **Usage Log** — who used what, when, purpose  
5. **Alerts** — critical / low / expiring / damaged  

Polling every 20s keeps multiple open sessions in sync after updates.

### How to use (demo)

1. Open **Inventory & Assets** in the sidebar.  
2. Click **Use** on Diesel (Maitri) → enter litres used → Deduct.  
3. Stock count and status update immediately; Usage Log shows the entry.  
4. **Stock Intake** to add a new shipment.  
5. **Condition** to mark damage/spoilage and optionally remove that quantity from usable stock.

### Deploy

1. Push these files to GitHub.  
2. Redeploy **Render** API service (uses same `DATABASE_URL` Neon).  
3. Redeploy **Vercel** frontend if needed (same `VITE_API_URL`).  

Existing Neon DB is migrated with `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` on API start — no manual migration required.
