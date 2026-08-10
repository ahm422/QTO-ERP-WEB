import { NextResponse } from "next/server";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  deleteSolutionAdmin,
  getSolutionAdminBySlug,
  updateSolutionAdmin,
} from "@/lib/content-db";
import { revalidateSolutionPaths } from "@/lib/revalidate-content-paths";
import { requireAdminApi } from "@/lib/require-admin-api";
import { updateSolutionSchema } from "@/lib/validations/admin-solutions";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(request: Request, context: RouteContext) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  const { slug } = await context.params;

  try {
    const item = await getSolutionAdminBySlug(slug);
    if (!item) return jsonError("Solution not found", 404);
    return NextResponse.json({ ok: true, item });
  } catch (err) {
    console.error("[api/admin/solutions/[slug] GET] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  const { slug } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = updateSolutionSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  if (Object.keys(parsed.data).length === 0) {
    return jsonError("No fields to update", 400);
  }

  try {
    const existing = await getSolutionAdminBySlug(slug);
    if (!existing) return jsonError("Solution not found", 404);

    const item = await updateSolutionAdmin(slug, parsed.data);
    if (!item) return jsonError("Solution not found", 404);

    revalidateSolutionPaths(slug);
    if (item.slug !== slug) {
      revalidateSolutionPaths(item.slug);
    }

    return NextResponse.json({ ok: true, item });
  } catch (err) {
    console.error("[api/admin/solutions/[slug] PUT] Error:", err);
    const msg = err instanceof Error ? err.message : "";
    if (/UNIQUE constraint failed.*slug/i.test(msg)) {
      return jsonError("A solution with this slug already exists", 409);
    }
    return jsonError("Something went wrong.", 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  const { slug } = await context.params;

  try {
    const deleted = await deleteSolutionAdmin(slug);
    if (!deleted) return jsonError("Solution not found", 404);
    revalidateSolutionPaths(slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/solutions/[slug] DELETE] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
