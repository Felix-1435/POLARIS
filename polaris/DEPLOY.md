# POLARIS Full Deployment Guide

## Architecture
- **Frontend**: Vercel (Vite + React)
- **API**: Render (Express)
- **Database**: Neon (Postgres) — optional for now, API works in-memory

## 1. Deploy API on Render

1. Push this repo to GitHub
2. Go to render.com → New → Web Service → connect repo
3. Settings:
   - Root Directory: `apps/api`
   - Build: `npm install && npm run build`
   - Start: `npm start`
4. After deploy, copy the URL (e.g. `https://polaris-api.onrender.com`)

## 2. Deploy Frontend on Vercel

1. Import repo on Vercel
2. Root Directory: `apps/frontend`
3. Framework: Vite
4. Build: `npm run build` / Output: `dist`
5. Environment Variable:
   ```
   VITE_API_URL = https://your-render-url.onrender.com
   ```
   (no trailing slash)

## 3. Neon (optional later)

When you want persistent data:
1. Create project on neon.tech
2. Add `DATABASE_URL` to Render env
3. Replace in-memory store in API with Drizzle queries

## Multi-user Cargo Scan

Works with or without API:
- With API: true shared state across all devices
- Without API: localStorage + polling (same browser profile / same device network)

Each officer selects their **Role**. They can only scan when the cargo has reached their checkpoint.
