# Don't Die / GF Buddy

Automated gluten-free allergy companion. Fun on purpose.

The notebook sketch, now a Next.js app that runs locally and on Replit:

1. Type a food ("funny scan").
2. Check the **cataloged DB / past cache**.
3. On a miss, ask **Grok**.
4. Show a **color meter** (0–10 likelihood of dying), **confidence**, **results**, and a **caveats section**.

```
[ scan + meter + results + caveats ]  →  Grok cloud
                ↑                           ↓
          past cache  ↔→  cataloged DB
```

## Run locally

```bash
npm install
cp .env.example .env.local
# paste your xAI key so novel foods hit Grok
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without `XAI_API_KEY`, the seeded catalog still works (soy sauce, rice, oats, fries, sushi, etc.) and unknown items fall back to a cautious heuristic.

## Run on Replit

This repo is import-and-run ready.

1. On [replit.com](https://replit.com), click **Create Repl** → **Import from GitHub**.
2. Paste `https://github.com/jpetro416/dont-die-gf-buddy`.
3. Wait for `npm install` (Node 22 is set in `.replit` / `replit.nix`).
4. Open **Secrets** and add:
   - `XAI_API_KEY` = your key from [console.x.ai](https://console.x.ai)
   - `XAI_MODEL` = `grok-4-fast-non-reasoning` (optional)
5. Press **Run**. Preview should load on port 3000.

The Run button executes `npm run dev`, which binds **0.0.0.0:3000** so Replit’s proxy can reach it.

### Deploy (Publish)

1. Click **Deploy**.
2. Use **Autoscale** for a first public URL, or **Reserved VM** if you want the file cache (`data/catalog.json`) to stick around.
3. Add the same secrets under **Deployment secrets** — they do not copy over from the editor automatically.
4. Deploy uses `npm run build` then `npm run start` (also `0.0.0.0:3000` → public port 80).

If the published app says “Application failed to respond”, the process is not listening on `0.0.0.0:3000`. Do not change that host/port without also editing `[[ports]]` in `.replit`.

### Replit Agent

Point Agent at these files:

- `replit.md` — how to run, deploy, and change this app on Replit
- `AGENTS.md` — repo map and coding rules for any agent

A good first prompt:

> Read replit.md and AGENTS.md. Install deps if needed, then make sure Run serves the app on 0.0.0.0:3000. Do not change the stack.

## Stack

- Next.js 15 App Router + TypeScript + Tailwind v4
- File-backed catalog at `data/catalog.json`
- xAI Chat Completions (`/v1/chat/completions`)
- Replit: `.replit`, `replit.nix`, Node 22

This is not medical advice. Labels change. Shared fryers exist to humble us.
