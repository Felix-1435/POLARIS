# POLARIS — Deploy to Vercel + GitHub (Frontend-first)

This version is a **frontend-only rich prototype** optimised for SIH demo.  
All data is simulated + localStorage (perfect for the 6-person cargo scan demo on Google Meet).

---

## 1. Push to GitHub

1. Open the `polaris` folder in **GitHub Desktop** → Add local repository → Create repository → name it `polaris`.
2. Publish repository (public or private).

Or via CLI:
```bash
cd polaris
git init
git add .
git commit -m "POLARIS SIH 26062 - NCPOR Polar Command System"
gh repo create polaris --public --source=. --push
```

---

## 2. Deploy Frontend to Vercel (Recommended)

1. Go to [vercel.com](https://vercel.com) → Sign in with GitHub.
2. **Add New Project** → Import the `polaris` repository.
3. Configure:
   - **Root Directory**: `apps/frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (or `pnpm build`)
   - **Output Directory**: `dist`
4. Click **Deploy**.

You will get a live URL like `https://polaris-xxxx.vercel.app`.

### Optional Environment Variables
None required for the current demo (everything runs client-side).

---

## 3. (Optional) Backend + Neon for future real data

If you later want a real API:

### Neon
1. neon.tech → Create project → copy `DATABASE_URL`.

### Render
1. render.com → New Web Service → connect repo.
2. Root: `apps/api` (once you add the Express server).
3. Add env `DATABASE_URL`.

### Update Frontend
Set `VITE_API_URL=https://your-api.onrender.com` in Vercel.

---

## 4. Share for SIH Presentation

- Open the Vercel URL on the presenter’s laptop and share screen on Google Meet.
- For the **cargo scan demo**: ask 5 teammates to open the same `/cargo/scan` URL on their phones/laptops.
- Each person picks a different officer role and scans in turn.
- Everyone sees the progress bar and history update in real time.

---

## Updating later

Any push to `main` auto-redeploys on Vercel.

---

## Demo Storyline (recommended)

1. Login as Commander → Command Center
2. Show KPIs + Map + Alerts + AI Summary
3. Expeditions → ANT-47 → Resources & Timeline
4. Cargo → Scan page → team performs sequential scans
5. Inventory → show fuel forecast warning
6. Personnel → highlight overdue check-in
7. Emergency → active medical incident + response
8. AI Commander → ask the 5 suggested questions
9. Back to Dashboard — full circle

Pitch line:  
**“An AI-powered centralized command and decision-support platform for planning, monitoring and safely executing polar expeditions.”**
