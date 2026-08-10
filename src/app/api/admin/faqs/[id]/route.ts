import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  deleteFaqAdmin,
  getFaqByIdAdmin,
  updateFaqAdmin,
} from "@/lib/content-db";
import { requireAdminApi } from "@/lib/require-admin-api";
import { updateFaqSchema } from "@/lib/validations/admin-faqs";

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

  const parsed = updateFaqSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  if (Object.keys(parsed.data).length === 0) {
    return jsonError("No fields to update", 400);
  }

  try {
    const existing = await getFaqByIdAdmin(id);
    if (!existing) return jsonError("FAQ not found", 404);

    const item = await updateFaqAdmin(id, parsed.data);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    console.error("[api/admin/faqs/[id] PATCH] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  try {
    const deleted = await deleteFaqAdmin(id);
    if (!deleted) return jsonError("FAQ not found", 404);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/faqs/[id] DELETE] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
