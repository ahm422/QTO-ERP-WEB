import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { listPublishedPricingPlans } from "@/lib/content-db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const plans = await listPublishedPricingPlans();
    return NextResponse.json({ plans });
  } catch (err) {
    console.error("[api/pricing/plans] Database error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
