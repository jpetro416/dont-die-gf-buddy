# Don't Die / GF Buddy

Automated gluten-free allergy companion. Fun on purpose.

The notebook sketch, now a Next.js app:

1. Type a food ("funny scan").
2. Check the **cataloged DB / past cache**.
3. On a miss, ask **Grok**.
4. Show a **color meter** (0–10 likelihood of dying), **confidence**, **results**, and a **caveats section**.

```
[ scan + meter + results + caveats ]  →  Grok cloud
                ↑                           ↓
          past cache  ↔→  cataloged DB
```

## Run it

```bash
npm install
cp .env.example .env.local
# paste your xAI key so novel foods hit Grok
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without `XAI_API_KEY`, the seeded catalog still works (soy sauce, rice, oats, fries, sushi, etc.) and unknown items fall back to a cautious heuristic.

## Stack

- Next.js 15 App Router + TypeScript + Tailwind v4
- File-backed catalog at `data/catalog.json`
- xAI Chat Completions (`/v1/chat/completions`)

This is not medical advice. Labels change. Shared fryers exist to humble us.
