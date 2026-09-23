import { bumpHit, findCached, saveResult } from "./catalog";
import { analyzeWithGrok, hasGrokKey } from "./grok";
import type { AnalysisResult } from "./types";

function heuristicFallback(query: string): AnalysisResult {
  const q = query.toLowerCase();
  const containsHits = [
    "wheat", "barley", "rye", "malt", "seitan", "soy sauce", "flour tortilla",
    "bread", "pasta", "ramen", "beer", "pretzel", "couscous", "orzo", "panko", "graham",
  ];
  const safeHits = [
    "white rice", "brown rice", "quinoa", "apple", "banana", "egg",
    "plain yogurt", "water", "black coffee", "steamed broccoli",
  ];

  const isContains = containsHits.some((h) => q.includes(h));
  const isSafe = safeHits.some((h) => q.includes(h));

  if (isContains) {
    return {
      query,
      item: query,
      glutenStatus: "contains",
      riskScore: 9,
      confidence: 62,
      verdict: "This looks like it includes a gluten grain or a classic gluten vehicle. Grok is offline, so this is a blunt heuristic.",
      punchline: "The fallback brain just screamed WHEAT and dove under the table.",
      reasons: ["The name itself usually implies wheat, barley, rye, or malt."],
      caveats: [
        "Heuristic only — not a label read.",
        "Add an XAI_API_KEY so Grok can actually inspect the item.",
      ],
      ingredientsOfConcern: ["likely gluten grain"],
      source: "fallback",
      analyzedAt: new Date().toISOString(),
    };
  }

  if (isSafe) {
    return {
      query,
      item: query,
      glutenStatus: "safe",
      riskScore: 1,
      confidence: 64,
      verdict: "This is usually naturally gluten-free when plain. Grok is offline, so treat this as a hint, not a blessing.",
      punchline: "Looks edible. Still don't lick the shared cutting board.",
      reasons: ["The item is typically a naturally gluten-free whole food."],
      caveats: [
        "Sauces, coatings, and restaurant prep can flip this instantly.",
        "Add an XAI_API_KEY for a real analysis.",
      ],
      ingredientsOfConcern: [],
      source: "fallback",
      analyzedAt: new Date().toISOString(),
    };
  }

  return {
    query,
    item: query,
    glutenStatus: "unknown",
    riskScore: 6,
    confidence: 28,
    verdict: "No catalog match and Grok is not configured, so the meter stays suspicious on purpose.",
    punchline: "Unknown food walks into a celiac bar. Nobody laughs.",
    reasons: ["Nothing in the local catalog matched this query closely."],
    caveats: [
      "Set XAI_API_KEY to let Grok analyze novel items.",
      "Until then, assume restaurant prep and mystery sauces are guilty.",
    ],
    ingredientsOfConcern: [],
    source: "fallback",
    analyzedAt: new Date().toISOString(),
  };
}

export async function lookupItem(query: string): Promise<AnalysisResult> {
  const cleaned = query.replace(/\s+/g, " ").trim();
  if (cleaned.length < 2) {
    throw new Error("Ask me about an actual food.");
  }

  const cached = await findCached(cleaned);
  if (cached) {
    await bumpHit(cached.key);
    return {
      ...cached.result,
      query: cleaned,
      source: cached.result.source === "seed" ? "seed" : "cache",
      cachedAt: cached.updatedAt,
    };
  }

  if (hasGrokKey()) {
    const analyzed = await analyzeWithGrok(cleaned);
    const stored = await saveResult(analyzed);
    return stored.result;
  }

  return heuristicFallback(cleaned);
}
