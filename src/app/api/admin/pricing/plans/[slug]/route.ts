import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { pricingPlans } from "@/db/schema";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { updatePricingPlanAdmin } from "@/lib/content-db";
import { getDb } from "@/lib/db";
import { requireAdminApi } from "@/lib/require-admin-api";
import { updatePricingPlanSchema } from "@/lib/validations/admin-pricing";


type RouteContext = { params: Promise<{ slug: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdminApi();
  if ("error" in admin) return admin.error;

  const { slug } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = updatePricingPlanSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  if (Object.keys(parsed.data).length === 0) {
    return jsonError("No fields to update", 400);
  }

  try {
    const [existing] = await getDb()
      .select()
      .from(pricingPlans)
      .where(eq(pricingPlans.slug, slug))
      .limit(1);
    if (!existing) {
      return jsonError("Pricing plan not found", 404);
    }

    const plan = await updatePricingPlanAdmin(slug, parsed.data);
    return NextResponse.json({
      ok: true,
      plan: {
        ...plan,
        createdAt: plan.createdAt.toISOString(),
        updatedAt: plan.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("[api/admin/pricing/plans/[slug]] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
