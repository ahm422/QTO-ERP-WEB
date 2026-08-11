import { NextResponse } from "next/server";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { createModuleAdmin, listModulesAdmin } from "@/lib/content-db";
import { revalidateModulePaths } from "@/lib/revalidate-content-paths";
import { requireRole } from "@/lib/permissions";
import { createModuleSchema } from "@/lib/validations/admin-modules";

export async function GET(request: Request) {
  const admin = await requireRole(request, "content:view");
  if ("error" in admin) return admin.error;

  try {
    const items = await listModulesAdmin();
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("[api/admin/modules GET] Error:", err);
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

  const parsed = createModuleSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const item = await createModuleAdmin(parsed.data);
    if (!item) return jsonError("Something went wrong.", 500);
    revalidateModulePaths(item.slug);
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (err) {
    console.error("[api/admin/modules POST] Error:", err);
    const msg = err instanceof Error ? err.message : "";
    if (/UNIQUE constraint failed.*slug/i.test(msg)) {
      return jsonError("A module with this slug already exists", 409);
    }
    return jsonError("Something went wrong.", 500);
  }
}
