import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  getDemoPageContent,
  upsertDemoPageContentAdmin,
} from "@/lib/content-db";
import { requireRole } from "@/lib/permissions";
import { upsertDemoPageContentSchema } from "@/lib/validations/admin-demo-page";

export async function GET(request: Request) {
  const admin = await requireRole(request, "content:view");
  if ("error" in admin) return admin.error;

  try {
    const page = await getDemoPageContent();
    return NextResponse.json({ ok: true, page });
  } catch (err) {
    console.error("[api/admin/demo-page GET] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function PUT(request: Request) {
  const admin = await requireRole(request, "content:edit");
  if ("error" in admin) return admin.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = upsertDemoPageContentSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const page = await upsertDemoPageContentAdmin(parsed.data);
    revalidatePath("/", "layout");
    revalidatePath("/demo");
    return NextResponse.json({ ok: true, page });
  } catch (err) {
    console.error("[api/admin/demo-page PUT] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
