import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { listPublishedComparison } from "@/lib/content-db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const features = await listPublishedComparison();
    return NextResponse.json({ features });
  } catch (err) {
    console.error("[api/comparison] Database error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
