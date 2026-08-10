import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  deleteAboutValueAdmin,
  getAboutValueByIdAdmin,
  updateAboutValueAdmin,
} from "@/lib/content-db";
import { requireAdminApi } from "@/lib/require-admin-api";
import { updateAboutValueSchema } from "@/lib/validations/admin-about";

type RouteContext = { params: Promise<{ id: string }> };

export async function PUT(request: Request, context: RouteContext) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = updateAboutValueSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  if (Object.keys(parsed.data).length === 0) {
    return jsonError("No fields to update", 400);
  }

  try {
    const existing = await getAboutValueByIdAdmin(id);
    if (!existing) return jsonError("About value not found", 404);

    const item = await updateAboutValueAdmin(id, parsed.data);
    revalidatePath("/about");
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    console.error("[api/admin/about/values/[id] PUT] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  try {
    const deleted = await deleteAboutValueAdmin(id);
    if (!deleted) return jsonError("About value not found", 404);
    revalidatePath("/about");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/about/values/[id] DELETE] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
