import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { getHomeFinalCta } from "@/lib/content-db";

export async function GET() {
  try {
    const cta = await getHomeFinalCta();
    return NextResponse.json({ ok: true, cta });
  } catch (err) {
    console.error("[api/home/cta GET] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
