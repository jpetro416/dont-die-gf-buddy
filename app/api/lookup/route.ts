import { NextResponse } from "next/server";
import { lookupItem } from "@/lib/analyze";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const query = String(body?.query ?? "").trim();
    if (!query) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }
    const result = await lookupItem(query);
    return NextResponse.json({ result });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Lookup failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
