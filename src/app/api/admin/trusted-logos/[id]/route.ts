import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  deleteTrustedLogoAdmin,
  getTrustedLogoByIdAdmin,
  updateTrustedLogoAdmin,
} from "@/lib/content-db";
import { requireRole } from "@/lib/permissions";
import { updateTrustedLogoSchema } from "@/lib/validations/admin-trusted-logos";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireRole(request, "content:edit");
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = updateTrustedLogoSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  if (Object.keys(parsed.data).length === 0) {
    return jsonError("No fields to update", 400);
  }

  try {
    const existing = await getTrustedLogoByIdAdmin(id);
    if (!existing) return jsonError("Trusted logo not found", 404);

    const item = await updateTrustedLogoAdmin(id, parsed.data);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    console.error("[api/admin/trusted-logos/[id] PATCH] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const admin = await requireRole(request, "content:delete");
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  try {
    const deleted = await deleteTrustedLogoAdmin(id);
    if (!deleted) return jsonError("Trusted logo not found", 404);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/trusted-logos/[id] DELETE] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
