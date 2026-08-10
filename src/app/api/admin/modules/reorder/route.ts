import { NextResponse } from "next/server";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { listModulesAdmin, reorderModulesAdmin } from "@/lib/content-db";
import { revalidateModulePaths } from "@/lib/revalidate-content-paths";
import { requireAdminApi } from "@/lib/require-admin-api";
import { reorderModulesSchema } from "@/lib/validations/admin-modules";

export async function POST(request: Request) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = reorderModulesSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    await reorderModulesAdmin(parsed.data.orderedIds);
    const items = await listModulesAdmin();
    revalidateModulePaths();
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("[api/admin/modules/reorder POST] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
