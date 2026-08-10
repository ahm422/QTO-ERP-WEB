import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  getPricingPageContent,
  upsertPricingPageContentAdmin,
} from "@/lib/content-db";
import { requireAdminApi } from "@/lib/require-admin-api";
import { upsertPricingPageContentSchema } from "@/lib/validations/admin-pricing-page";

export async function GET(request: Request) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  try {
    const page = await getPricingPageContent();
    return NextResponse.json({ ok: true, page });
  } catch (err) {
    console.error("[api/admin/pricing-page GET] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function PUT(request: Request) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = upsertPricingPageContentSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const page = await upsertPricingPageContentAdmin(parsed.data);
    revalidatePath("/", "layout");
    revalidatePath("/pricing");
    return NextResponse.json({ ok: true, page });
  } catch (err) {
    console.error("[api/admin/pricing-page PUT] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
