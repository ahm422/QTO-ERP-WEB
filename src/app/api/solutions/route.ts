import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { listPublishedSolutions } from "@/lib/content-db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const solutions = await listPublishedSolutions();
    return NextResponse.json({ solutions });
  } catch (err) {
    console.error("[api/solutions] Database error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
