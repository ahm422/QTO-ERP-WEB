import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  createAboutValueAdmin,
  listAboutValuesAdmin,
} from "@/lib/content-db";
import { requireRole } from "@/lib/permissions";
import { createAboutValueSchema } from "@/lib/validations/admin-about";

export async function GET(request: Request) {
  const admin = await requireRole(request, "content:view");
  if ("error" in admin) return admin.error;

  try {
    const items = await listAboutValuesAdmin();
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("[api/admin/about/values GET] Error:", err);
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

  const parsed = createAboutValueSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const item = await createAboutValueAdmin(parsed.data);
    revalidatePath("/about");
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (err) {
    console.error("[api/admin/about/values POST] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
