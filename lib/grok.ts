import type { AnalysisResult, GlutenStatus } from "./types";

const XAI_URL = "https://api.x.ai/v1/chat/completions";

const SYSTEM_PROMPT = `You are GF Buddy, the slightly unhinged but careful gluten detective inside the Don't Die app.

Your job: estimate whether a food, drink, condiment, restaurant item, or ingredient is safe for someone avoiding gluten (including celiac-level caution).

Return ONLY valid JSON with this shape:
{
  "item": string,
  "brand": string | null,
  "glutenStatus": "safe" | "risky" | "contains" | "unknown",
  "riskScore": number,
  "confidence": number,
  "verdict": string,
  "punchline": string,
  "reasons": string[],
  "caveats": string[],
  "ingredientsOfConcern": string[]
}

Rules:
- riskScore is 0-10 "likelihood of dying" in the app's dark-humor skin. 0 = basically no gluten risk. 10 = wheat/barley/rye is the point of the food or extremely likely.
- confidence is 0-100 how sure you are.
- glutenStatus:
  - safe: naturally GF and typically low cross-contact when prepared plainly
  - risky: GF in theory but marinades, fryers, shared lines, or oats-style issues
  - contains: wheat, barley, rye, malt, or standard soy sauce is expected
  - unknown: not enough signal
- Be practical. Call out soy sauce, malt vinegar, imitation crab, shared fryers, "natural flavors", breadcrumbs, seitan, beer, soy sauce powders.
- Never claim medical certainty. Caveats should be specific, not generic "ask a doctor" spam. One medical disclaimer is enough elsewhere.
- Punchline: one short funny line. Dry, not cruel about illness.
- If the query is a brand + item, use public labeling patterns, not invented ingredient lists.
- If unsure, raise riskScore and lower confidence rather than pretending.`;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function asStatus(value: unknown): GlutenStatus {
  if (value === "safe" || value === "risky" || value === "contains" || value === "unknown") {
    return value;
  }
  return "unknown";
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => String(v)).filter(Boolean).slice(0, 8);
}

export function hasGrokKey(): boolean {
  return Boolean(process.env.XAI_API_KEY || process.env.GROK_API_KEY);
}

export async function analyzeWithGrok(query: string): Promise<AnalysisResult> {
  const apiKey = process.env.XAI_API_KEY || process.env.GROK_API_KEY;
  if (!apiKey) {
    throw new Error("Missing XAI_API_KEY");
  }

  const model = process.env.XAI_MODEL || "grok-4-fast-non-reasoning";

  const res = await fetch(XAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Analyze this item for gluten risk. Query: ${JSON.stringify(query)}`,
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Grok request failed (${res.status}): ${body.slice(0, 400)}`);
  }

  const data = await res.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new Error("Grok returned an empty response");
  }

  const parsed = JSON.parse(content) as Record<string, unknown>;
  const status = asStatus(parsed.glutenStatus);

  return {
    query,
    item: String(parsed.item || query),
    brand: parsed.brand ? String(parsed.brand) : undefined,
    glutenStatus: status,
    riskScore: clamp(Number(parsed.riskScore) || 5, 0, 10),
    confidence: clamp(Number(parsed.confidence) || 50, 0, 100),
    verdict: String(parsed.verdict || "Not enough to call it."),
    punchline: String(parsed.punchline || "The meter is humming nervously."),
    reasons: asStringArray(parsed.reasons),
    caveats: asStringArray(parsed.caveats),
    ingredientsOfConcern: asStringArray(parsed.ingredientsOfConcern),
    source: "grok",
    analyzedAt: new Date().toISOString(),
  };
}
