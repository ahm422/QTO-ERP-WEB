import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  createTrustedLogoAdmin,
  listTrustedLogosAdmin,
} from "@/lib/content-db";
import { requireRole } from "@/lib/permissions";
import { createTrustedLogoSchema } from "@/lib/validations/admin-trusted-logos";

export async function GET(request: Request) {
  const admin = await requireRole(request, "content:view");
  if ("error" in admin) return admin.error;

  try {
    const items = await listTrustedLogosAdmin();
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("[api/admin/trusted-logos GET] Error:", err);
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

  const parsed = createTrustedLogoSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const item = await createTrustedLogoAdmin(parsed.data);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (err) {
    console.error("[api/admin/trusted-logos POST] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
