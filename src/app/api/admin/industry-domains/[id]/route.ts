import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  deleteIndustryDomainAdmin,
  getIndustryDomainByIdAdmin,
  syncIndustryDomainOrderIndexes,
  updateIndustryDomainAdmin,
} from "@/lib/content-db";
import { requireAdminApi } from "@/lib/require-admin-api";
import { updateIndustryDomainSchema } from "@/lib/validations/admin-industry-domains";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = updateIndustryDomainSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  if (Object.keys(parsed.data).length === 0) {
    return jsonError("No fields to update", 400);
  }

  try {
    const existing = await getIndustryDomainByIdAdmin(id);
    if (!existing) return jsonError("Industry domain not found", 404);

    const item = await updateIndustryDomainAdmin(id, parsed.data);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    console.error("[api/admin/industry-domains/[id] PATCH] Error:", err);
    const msg = err instanceof Error ? err.message : "";
    if (/UNIQUE constraint failed.*slug/i.test(msg)) {
      return jsonError("A domain with this slug already exists", 409);
    }
    return jsonError("Something went wrong.", 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  try {
    const deleted = await deleteIndustryDomainAdmin(id);
    if (!deleted) return jsonError("Industry domain not found", 404);
    await syncIndustryDomainOrderIndexes();
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/industry-domains/[id] DELETE] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
