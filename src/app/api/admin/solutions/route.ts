import { NextResponse } from "next/server";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { createSolutionAdmin, listSolutionsAdmin } from "@/lib/content-db";
import { revalidateSolutionPaths } from "@/lib/revalidate-content-paths";
import { requireRole } from "@/lib/permissions";
import { createSolutionSchema } from "@/lib/validations/admin-solutions";

export async function GET(request: Request) {
  const admin = await requireRole(request, "content:view");
  if ("error" in admin) return admin.error;

  try {
    const items = await listSolutionsAdmin();
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("[api/admin/solutions GET] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function POST(request: Request) {
  const admin = await requireRole(request, "content:create");
  if ("error" in admin) return admin.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = createSolutionSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const item = await createSolutionAdmin(parsed.data);
    if (!item) return jsonError("Something went wrong.", 500);
    revalidateSolutionPaths(item.slug);
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (err) {
    console.error("[api/admin/solutions POST] Error:", err);
    const msg = err instanceof Error ? err.message : "";
    if (/UNIQUE constraint failed.*slug/i.test(msg)) {
      return jsonError("A solution with this slug already exists", 409);
    }
    return jsonError("Something went wrong.", 500);
  }
}
