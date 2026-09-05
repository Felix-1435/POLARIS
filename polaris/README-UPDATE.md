# Auth + Theme + OpenRouter + Expanded Neon

## Files to overwrite on GitHub

```
apps/frontend/src/App.tsx
apps/frontend/src/pages/LoginPage.tsx
apps/frontend/src/components/layout/Header.tsx
apps/frontend/src/theme-additions.css   ← import this in index.css
apps/api/src/index.ts
apps/api/package.json
apps/api/tsconfig.json
```

## 1. Import light theme CSS

In `apps/frontend/src/index.css` add at the bottom:

```css
@import './theme-additions.css';
```

Or paste the contents of theme-additions.css at the end of index.css.

## 2. Render Environment Variables

Add these on Render:

| Key | Value |
|-----|-------|
| DATABASE_URL | your neon connection string |
| OPENROUTER_API_KEY | sk-or-v1-... (from openrouter.ai) |

## 3. Get OpenRouter key

1. Go to https://openrouter.ai
2. Sign in → Keys → Create key
3. Copy key → paste as OPENROUTER_API_KEY on Render
4. Redeploy API

## 4. Behaviour changes

- Any shared link → always lands on Login first
- Valid demo account required before dashboard
- Sun/Moon toggle in header and login for light/dark theme
- AI Commander uses OpenRouter (gpt-4o-mini) when key is set, else local rules
- Neon seeds: 4 expeditions, 10 cargo, 10 personnel, 10 inventory rows, 1 incident
