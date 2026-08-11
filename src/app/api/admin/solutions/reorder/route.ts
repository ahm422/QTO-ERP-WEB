import { NextResponse } from "next/server";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { listSolutionsAdmin, reorderSolutionsAdmin } from "@/lib/content-db";
import { revalidateSolutionPaths } from "@/lib/revalidate-content-paths";
import { requireRole } from "@/lib/permissions";
import { reorderSolutionsSchema } from "@/lib/validations/admin-solutions";

export async function POST(request: Request) {
  const admin = await requireRole(request, "content:edit");
  if ("error" in admin) return admin.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = reorderSolutionsSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    await reorderSolutionsAdmin(parsed.data.orderedIds);
    const items = await listSolutionsAdmin();
    revalidateSolutionPaths();
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("[api/admin/solutions/reorder POST] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
