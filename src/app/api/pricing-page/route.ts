import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { getPricingPageContent } from "@/lib/content-db";

export async function GET() {
  try {
    const page = await getPricingPageContent();
    return NextResponse.json({ ok: true, page });
  } catch (err) {
    console.error("[api/pricing-page GET] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
