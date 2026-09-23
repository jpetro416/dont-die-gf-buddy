# Don't Die / GF Buddy — Replit Agent notes

Read this before changing the app. This file is for Replit Agent.

## What this is

A Next.js 15 App Router gluten-free companion. Fun dark-humor skin ("likelihood of dying" 0–10). Users type a food. We check a local catalog cache first. Misses go to Grok (xAI). Results show a color meter, confidence, verdict, and caveats.

This is not medical advice. Do not promise safety. Prefer higher risk + lower confidence when unsure.

## Stack — do not replace

- Next.js 15 App Router + TypeScript + Tailwind v4
- npm (not yarn, not pnpm, not bun)
- File catalog at `data/catalog.json` (created at runtime from `lib/seed.ts`)
- xAI Chat Completions in `lib/grok.ts`
- No Docker. No Express. No separate backend.

## Replit run / deploy

Config lives in `.replit` and `replit.nix`.

- Run button: `npm run dev` → `0.0.0.0:3000`
- Deploy build: `npm run build`
- Deploy run: `npm run start` → `0.0.0.0:3000`
- Port map: local 3000 → external 80
- Node: 22 via `modules = ["nodejs-22"]`

The server **must** listen on `0.0.0.0`, not `127.0.0.1`. Do not change the port away from 3000 unless you also change `[[ports]]` in `.replit`.

## Secrets

Set these in the Replit **Secrets** pane (and again in Deployment secrets — they are separate):

- `XAI_API_KEY` — required for novel foods. Get it at https://console.x.ai
- `XAI_MODEL` — optional. Default `grok-4-fast-non-reasoning`

Do not commit keys. Do not put secrets in `.replit`. `.env.local` works locally; on Replit, Secrets become `process.env`.

Without `XAI_API_KEY` the seeded catalog still works and unknown items use the cautious fallback in `lib/analyze.ts`.

## Where code lives

- UI: `components/BuddyApp.tsx`, `DeathMeter.tsx`, `ConfidenceArc.tsx`
- Look: legal-pad paper theme in `app/globals.css` (cream, red margin, ink borders). Keep that skin.
- API: `app/api/lookup/route.ts` (POST), `app/api/catalog/route.ts` (GET)
- Engine: `lib/analyze.ts` → cache (`lib/catalog.ts`) → Grok (`lib/grok.ts`) or fallback
- Seeded foods: `lib/seed.ts`

## Agent rules

1. After `npm install`, click Run. Do not start a second dev server in the shell.
2. Keep TypeScript strict. Keep the funny voice. Do not get cruel about illness.
3. New foods belong in `lib/seed.ts` if they are common, or let Grok + cache handle them.
4. `data/catalog.json` is runtime state. Do not commit it. Autoscale disks are ephemeral — cache will reset. That is OK unless the user asks for a real database.
5. If adding a database, prefer Replit Postgres / SQLite only after the user confirms. Do not rip out the file catalog unprompted.
6. Do not add auth, ads, or extra allergen types unless asked.
7. Verify publish config: long-running `next start`, host `0.0.0.0`, port 3000, `.replit` ports `localPort = 3000` / `externalPort = 80`.
8. If Preview says "Application failed to respond", the process is not bound to `0.0.0.0:3000`.

## Deploy checklist for Agent

1. App runs in Preview via the Run button.
2. `XAI_API_KEY` is in both development Secrets and deployment Secrets.
3. Click Deploy → Autoscale is fine for a first ship; Reserved VM if they want the file cache to last.
4. After deploy, hit the public URL and scan `soy sauce` and `plain white rice`.
