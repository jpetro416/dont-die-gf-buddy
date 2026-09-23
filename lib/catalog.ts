import { promises as fs } from "fs";
import path from "path";
import type { AnalysisResult, CatalogRecord } from "./types";
import { SEED_CATALOG } from "./seed";

const DATA_DIR = path.join(process.cwd(), "data");
const CATALOG_PATH = path.join(DATA_DIR, "catalog.json");

function normalizeKey(query: string): string {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s+&/-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function ensureStore(): Promise<CatalogRecord[]> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    const raw = await fs.readFile(CATALOG_PATH, "utf8");
    const parsed = JSON.parse(raw) as CatalogRecord[];
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // first run
  }
  const seeded: CatalogRecord[] = SEED_CATALOG.map((result) => ({
    key: normalizeKey(result.query),
    result: { ...result, source: "seed" as const },
    hits: 0,
    createdAt: result.analyzedAt,
    updatedAt: result.analyzedAt,
  }));
  await fs.writeFile(CATALOG_PATH, JSON.stringify(seeded, null, 2));
  return seeded;
}

async function writeStore(records: CatalogRecord[]) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(CATALOG_PATH, JSON.stringify(records, null, 2));
}

export async function findCached(query: string): Promise<CatalogRecord | null> {
  const key = normalizeKey(query);
  const records = await ensureStore();
  const exact = records.find((r) => r.key === key);
  if (exact) return exact;

  const tokens = key.split(" ").filter((t) => t.length > 2);
  if (!tokens.length) return null;

  const scored = records
    .map((r) => {
      const overlap = tokens.filter((t) => r.key.includes(t)).length;
      return { r, overlap };
    })
    .filter((x) => x.overlap >= Math.min(2, tokens.length) && x.overlap / tokens.length >= 0.7)
    .sort((a, b) => b.overlap - a.overlap);

  return scored[0]?.r ?? null;
}

export async function saveResult(result: AnalysisResult): Promise<CatalogRecord> {
  const key = normalizeKey(result.query);
  const records = await ensureStore();
  const now = new Date().toISOString();
  const existing = records.find((r) => r.key === key);
  if (existing) {
    existing.result = { ...result, cachedAt: now };
    existing.hits += 1;
    existing.updatedAt = now;
    await writeStore(records);
    return existing;
  }
  const created: CatalogRecord = {
    key,
    result: { ...result, cachedAt: now },
    hits: 1,
    createdAt: now,
    updatedAt: now,
  };
  records.unshift(created);
  await writeStore(records);
  return created;
}

export async function bumpHit(key: string): Promise<void> {
  const records = await ensureStore();
  const found = records.find((r) => r.key === key);
  if (!found) return;
  found.hits += 1;
  found.updatedAt = new Date().toISOString();
  await writeStore(records);
}

export async function listRecent(limit = 12): Promise<CatalogRecord[]> {
  const records = await ensureStore();
  return [...records]
    .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt))
    .slice(0, limit);
}

export { normalizeKey };
