import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { listAllPricingPlansAdmin } from "@/lib/content-db";
import { requireRole } from "@/lib/permissions";


export async function GET(request: Request) {
  const admin = await requireRole(request, "content:view");
  if ("error" in admin) return admin.error;

  try {
    const plans = await listAllPricingPlansAdmin();
    return NextResponse.json({
      ok: true,
      plans: plans.map((p) => ({
        ...p,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[api/admin/pricing/plans] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
