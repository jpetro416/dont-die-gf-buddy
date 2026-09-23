# AGENTS.md

Instructions for any coding agent (Replit Agent, Grok, Cursor, Codex) working in this repo.

## Project

**Don't Die / GF Buddy** — Next.js 15 App Router app that estimates gluten risk for a typed food.

Flow: UI scan → catalog cache → Grok (xAI) on miss → persist result → show death meter 0–10, confidence, results, caveats.

## Commands

```bash
npm install
npm run dev      # 0.0.0.0:3000  (Replit Run button)
npm run build
npm run start    # production server, same host/port
npm run lint
```

Use **npm only**.

## Replit

This repo is Replit-ready:

- `.replit` — Run, Deploy, port 3000→80, Node 22
- `replit.nix` — `nodejs_22`
- `replit.md` — Replit Agent playbook (read it)

Bind `0.0.0.0:3000`. Never `localhost` only.

Secrets: `XAI_API_KEY` (required for live Grok), optional `XAI_MODEL`.

## Layout

```
app/page.tsx                 # renders BuddyApp
app/layout.tsx
app/globals.css              # legal-pad "funny skin"
app/api/lookup/route.ts      # POST { query }
app/api/catalog/route.ts     # GET recent + grokEnabled
components/BuddyApp.tsx
components/DeathMeter.tsx
components/ConfidenceArc.tsx
lib/analyze.ts               # cache → grok → fallback
lib/catalog.ts               # data/catalog.json
lib/grok.ts                  # xAI chat completions, JSON mode
lib/seed.ts                  # built-in food catalog
lib/types.ts
```

## Conventions

- TypeScript. App Router. Tailwind v4 `@import "tailwindcss"`.
- Keep the notebook / ink / cream paper UI.
- Copy is dry and funny, not mean about disease.
- Never claim medical certainty. Caveats stay specific.
- Do not swap Next.js for Express/Vite unless the user asks.
- Do not commit `.env*`, `data/catalog.json`, or API keys.

## Safe change pattern

1. Read the existing file.
2. Match its style.
3. If you add an API route, return JSON `{ result }` or `{ error }` and handle errors.
4. If you add a seed item, follow `stamp({...})` in `lib/seed.ts`.
5. Do not start extra servers. On Replit, use the Run button / workflows.
