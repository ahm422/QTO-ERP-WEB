import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { getHomeFinalCta, upsertHomeFinalCtaAdmin } from "@/lib/content-db";
import { requireRole } from "@/lib/permissions";
import { upsertHomeFinalCtaSchema } from "@/lib/validations/admin-home-cta";

export async function GET(request: Request) {
  const admin = await requireRole(request, "content:view");
  if ("error" in admin) return admin.error;

  try {
    const cta = await getHomeFinalCta();
    return NextResponse.json({ ok: true, cta });
  } catch (err) {
    console.error("[api/admin/home-cta GET] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function PUT(request: Request) {
  const admin = await requireRole(request, "content:edit");
  if ("error" in admin) return admin.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = upsertHomeFinalCtaSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const cta = await upsertHomeFinalCtaAdmin(parsed.data);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, cta });
  } catch (err) {
    console.error("[api/admin/home-cta PUT] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
