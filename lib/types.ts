export type GlutenStatus = "safe" | "risky" | "contains" | "unknown";

export type LookupSource = "cache" | "seed" | "grok" | "fallback";

export interface AnalysisResult {
  query: string;
  item: string;
  brand?: string;
  glutenStatus: GlutenStatus;
  riskScore: number;
  confidence: number;
  verdict: string;
  punchline: string;
  reasons: string[];
  caveats: string[];
  ingredientsOfConcern: string[];
  source: LookupSource;
  cachedAt?: string;
  analyzedAt: string;
}

export interface CatalogRecord {
  key: string;
  result: AnalysisResult;
  hits: number;
  createdAt: string;
  updatedAt: string;
}
