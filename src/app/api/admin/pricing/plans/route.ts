import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { listAllPricingPlansAdmin } from "@/lib/content-db";
import { requireAdminApi } from "@/lib/require-admin-api";


export async function GET(request: Request) {
  const admin = await requireAdminApi(request);
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
