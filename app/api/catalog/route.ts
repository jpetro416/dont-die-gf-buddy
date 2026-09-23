import { NextResponse } from "next/server";
import { listRecent } from "@/lib/catalog";
import { hasGrokKey } from "@/lib/grok";

export async function GET() {
  const recent = await listRecent(16);
  return NextResponse.json({
    grokEnabled: hasGrokKey(),
    recent: recent.map((r) => ({
      key: r.key,
      item: r.result.item,
      glutenStatus: r.result.glutenStatus,
      riskScore: r.result.riskScore,
      source: r.result.source,
      hits: r.hits,
      updatedAt: r.updatedAt,
    })),
  });
}
