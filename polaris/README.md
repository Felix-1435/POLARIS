# POLARIS — NCPOR Polar Expedition Command System

**SIH 2026 · Problem Statement 26062**  
Integrated Polar Expedition Logistics and Asset Management System  
Ministry of Earth Sciences · National Centre for Polar and Ocean Research (NCPOR)

## Demo Logins

| Email | Password | Role |
|-------|----------|------|
| commander@ncpor.gov.in | polaris2026 | Expedition Commander |
| logistics@ncpor.gov.in | polaris2026 | Logistics Officer |
| safety@ncpor.gov.in | polaris2026 | Safety Officer |

## Quick Start (Local)

```bash
cd apps/frontend
npm install   # or pnpm install
npm run dev
```

Open http://localhost:5173

## Multi-user Cargo Scan Demo (Google Meet)

1. Open **/cargo/scan** on every team member’s browser.
2. Each person selects a different “Scanning Officer” role.
3. Click **Confirm Scan & Advance** in sequence.
4. Progress and history update live across all screens (localStorage + polling).

## Modules

- 🏠 Command Center Dashboard (KPIs, map, alerts, AI summary)
- 🗺️ Expeditions (list, detail, timeline, resources)
- 📦 Cargo & Logistics (dashboard, registry, live tracking, **checkpoint scanner**)
- 📊 Inventory & Assets (stock levels, low/critical, AI forecast)
- 👥 Personnel (registry, locations, check-in status)
- 🚨 Emergency (active incident, SOS, response teams, evacuation)
- 🤖 AI Commander (cross-domain Q&A + predictions)
- ⚙️ Admin

## Tech Stack

- React 19 + Vite + TypeScript
- Tailwind CSS + Framer Motion
- Wouter (routing)
- Dark polar / aurora theme with glassmorphism

## Deployment

See **DEPLOY.md** for full Vercel + Render + Neon + GitHub steps.
