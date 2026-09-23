"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { ConfidenceArc } from "./ConfidenceArc";
import { DeathMeter } from "./DeathMeter";
import type { AnalysisResult, GlutenStatus } from "@/lib/types";

type CatalogRow = {
  key: string;
  item: string;
  glutenStatus: GlutenStatus;
  riskScore: number;
  source: string;
  hits: number;
};

const EXAMPLES = [
  "soy sauce",
  "plain white rice",
  "McDonald's french fries",
  "certified gluten-free oats",
  "sushi",
  "tamari",
];

const STATUS_COPY: Record<GlutenStatus, string> = {
  safe: "Looks GF in spirit",
  risky: "Asterisk city",
  contains: "Gluten lives here",
  unknown: "The food is being coy",
};

export function BuddyApp() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [recent, setRecent] = useState<CatalogRow[]>([]);
  const [grokEnabled, setGrokEnabled] = useState(false);

  async function refreshCatalog() {
    const res = await fetch("/api/catalog");
    if (!res.ok) return;
    const data = await res.json();
    setRecent(data.recent ?? []);
    setGrokEnabled(Boolean(data.grokEnabled));
  }

  useEffect(() => {
    refreshCatalog().catch(() => undefined);
  }, []);

  async function runLookup(nextQuery: string) {
    const q = nextQuery.trim();
    if (q.length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Lookup failed");
      setResult(data.result);
      await refreshCatalog();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    runLookup(query);
  }

  const sourceLabel = useMemo(() => {
    if (!result) return "";
    if (result.source === "cache") return "Past cache";
    if (result.source === "seed") return "Cataloged DB";
    if (result.source === "grok") return "Grok just now";
    return "Offline fallback";
  }, [result]);

  return (
    <main className="pad mx-auto min-h-screen max-w-5xl px-4 py-8 sm:px-8">
      <header className="mb-8 pl-8">
        <p className="text-[11px] uppercase tracking-[0.28em] text-[var(--ink-soft)]">
          Automated allergy companion · Grok under the hood
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-5xl leading-[0.9] sm:text-6xl">
          Don't Die
        </h1>
        <p className="mt-1 font-[family-name:var(--font-display)] text-3xl italic text-[var(--margin)]">
          / GF Buddy
        </p>
        <p className="mt-4 max-w-xl text-sm leading-6 text-[var(--ink-soft)]">
          Type a food. We check the cataloged cache first. Misses go to Grok.
          You get a color meter, a confidence arc, the results, and the caveats
          — with a funny skin and a slightly dramatic death score.
        </p>
      </header>

      <div className="grid gap-6 pl-8 lg:grid-cols-[1.4fr_0.8fr]">
        <section className="ink-border bg-[rgba(255,250,238,0.86)] p-5 sm:p-6">
          <form onSubmit={onSubmit} className="space-y-3">
            <label className="text-[11px] uppercase tracking-[0.22em] text-[var(--ink-soft)]">
              Funny scan · what are you about to eat
            </label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="soy sauce, corn tortilla, Chipotle bowl..."
                className="w-full border-2 border-[var(--ink)] bg-[var(--paper)] px-3 py-3 font-medium outline-none placeholder:text-[var(--ink-soft)]"
              />
              <button
                type="submit"
                disabled={loading}
                className="shrink-0 border-2 border-[var(--ink)] bg-[var(--ink)] px-5 py-3 text-sm font-semibold uppercase tracking-wide text-[var(--paper)] disabled:opacity-60"
              >
                {loading ? "Sniffing..." : "Scan it"}
              </button>
            </div>
          </form>

          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => {
                  setQuery(ex);
                  runLookup(ex);
                }}
                className="border border-[var(--ink)] bg-transparent px-2 py-1 text-xs hover:bg-[var(--paper-deep)]"
              >
                {ex}
              </button>
            ))}
          </div>

          {error && (
            <p className="mt-4 border-2 border-[var(--bad)] bg-[#f8d4d0] px-3 py-2 text-sm">
              {error}
            </p>
          )}

          {result ? (
            <div className="mt-6 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--ink-soft)]">
                    Results
                  </p>
                  <h2 className="font-[family-name:var(--font-display)] text-3xl">
                    {result.item}
                  </h2>
                  {result.brand && (
                    <p className="text-sm text-[var(--ink-soft)]">{result.brand}</p>
                  )}
                </div>
                <div className="text-right">
                  <span className="inline-block border-2 border-[var(--ink)] px-2 py-1 text-xs uppercase tracking-wide">
                    {STATUS_COPY[result.glutenStatus]}
                  </span>
                  <p className="mt-1 text-xs text-[var(--ink-soft)]">{sourceLabel}</p>
                </div>
              </div>

              <DeathMeter score={result.riskScore} status={result.glutenStatus} />
              <ConfidenceArc confidence={result.confidence} />

              <blockquote className="border-l-4 border-[var(--margin)] pl-3 text-lg leading-7">
                {result.verdict}
              </blockquote>
              <p className="italic text-[var(--ink-soft)]">{result.punchline}</p>

              {result.reasons.length > 0 && (
                <div>
                  <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--ink-soft)]">
                    Why the meter moved
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6">
                    {result.reasons.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="ink-border bg-[#fff6e4] p-4">
                <p className="font-[family-name:var(--font-display)] text-xl">
                  Caveats section
                </p>
                <ul className="mt-2 space-y-2 text-sm leading-6">
                  {result.caveats.map((c) => (
                    <li key={c}>— {c}</li>
                  ))}
                  {result.ingredientsOfConcern.length > 0 && (
                    <li>— Watch: {result.ingredientsOfConcern.join(", ")}</li>
                  )}
                </ul>
              </div>
            </div>
          ) : (
            <div className="mt-8 border-2 border-dashed border-[var(--ink)] p-6 text-sm leading-6 text-[var(--ink-soft)]">
              The sketch lives here: color meter, confidence, results, caveats.
              Cache first. Grok second. Database remembers the hits.
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <section className="ink-border bg-[rgba(255,250,238,0.86)] p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--ink-soft)]">
              Engine
            </p>
            <p className="mt-2 font-[family-name:var(--font-display)] text-2xl">
              {grokEnabled ? "Grok is awake" : "Grok is unplugged"}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--ink-soft)]">
              {grokEnabled
                ? "New foods go to xAI, then get written into the cataloged DB."
                : "Add XAI_API_KEY to .env.local. Until then, seeded catalog + a nervous fallback."}
            </p>
          </section>

          <section className="ink-border bg-[rgba(255,250,238,0.86)] p-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[var(--ink-soft)]">
              Cataloged DB · past cache
            </p>
            <ul className="mt-3 space-y-2">
              {recent.map((row) => (
                <li key={row.key}>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery(row.item);
                      runLookup(row.item);
                    }}
                    className="flex w-full items-center justify-between gap-3 border-b border-[var(--rule)] py-2 text-left text-sm hover:bg-[var(--paper-deep)]"
                  >
                    <span>
                      {row.item}
                      <span className="block text-[11px] uppercase tracking-wide text-[var(--ink-soft)]">
                        {row.source} · {row.hits} hits
                      </span>
                    </span>
                    <span className="font-[family-name:var(--font-display)] text-lg">
                      {row.riskScore}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          <p className="px-1 text-[11px] leading-5 text-[var(--ink-soft)]">
            Not medical advice. Labels change. Restaurants lie with their fryers.
            If you have celiac disease, certified gluten-free and dedicated prep still win.
          </p>
        </aside>
      </div>
    </main>
  );
}
