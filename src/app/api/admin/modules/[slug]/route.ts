import { NextResponse } from "next/server";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  deleteModuleAdmin,
  getModuleAdminBySlug,
  updateModuleAdmin,
} from "@/lib/content-db";
import { revalidateModulePaths } from "@/lib/revalidate-content-paths";
import { requireRole } from "@/lib/permissions";
import { updateModuleSchema } from "@/lib/validations/admin-modules";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: Request, context: RouteContext) {
  const admin = await requireRole(request, "content:view");
  if ("error" in admin) return admin.error;

  const { slug } = await context.params;

  try {
    const item = await getModuleAdminBySlug(slug);
    if (!item) return jsonError("Module not found", 404);
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    console.error("[api/admin/modules/[slug] GET] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const admin = await requireRole(request, "content:edit");
  if ("error" in admin) return admin.error;

  const { slug } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = updateModuleSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  if (Object.keys(parsed.data).length === 0) {
    return jsonError("No fields to update", 400);
  }

  try {
    const existing = await getModuleAdminBySlug(slug);
    if (!existing) return jsonError("Module not found", 404);

    const item = await updateModuleAdmin(slug, parsed.data);
    if (!item) return jsonError("Module not found", 404);

    revalidateModulePaths(slug);
    if (item.slug !== slug) {
      revalidateModulePaths(item.slug);
    }

    return NextResponse.json({ ok: true, item });
  } catch (err) {
    console.error("[api/admin/modules/[slug] PUT] Error:", err);
    const msg = err instanceof Error ? err.message : "";
    if (/UNIQUE constraint failed.*slug/i.test(msg)) {
      return jsonError("A module with this slug already exists", 409);
    }
    return jsonError("Something went wrong.", 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const admin = await requireRole(request, "content:delete");
  if ("error" in admin) return admin.error;

  const { slug } = await context.params;

  try {
    const deleted = await deleteModuleAdmin(slug);
    if (!deleted) return jsonError("Module not found", 404);
    revalidateModulePaths(slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/modules/[slug] DELETE] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
