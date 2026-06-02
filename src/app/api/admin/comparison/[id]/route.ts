import { NextResponse } from "next/server";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  deleteComparisonAdmin,
  updateComparisonAdmin,
} from "@/lib/content-db";
import { getPrisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin-api";
import { updateComparisonSchema } from "@/lib/validations/admin-comparison";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdminApi();
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = updateComparisonSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  if (Object.keys(parsed.data).length === 0) {
    return jsonError("No fields to update", 400);
  }

  try {
    const existing = await getPrisma().comparisonFeature.findUnique({
      where: { id },
    });
    if (!existing) {
      return jsonError("Comparison row not found", 404);
    }

    const row = await updateComparisonAdmin(id, parsed.data);
    return NextResponse.json({
      ok: true,
      feature: {
        ...row,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("[api/admin/comparison/[id]] PATCH Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const admin = await requireAdminApi();
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  try {
    const existing = await getPrisma().comparisonFeature.findUnique({
      where: { id },
    });
    if (!existing) {
      return jsonError("Comparison row not found", 404);
    }

    await deleteComparisonAdmin(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/comparison/[id]] DELETE Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
