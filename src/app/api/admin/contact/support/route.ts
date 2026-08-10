import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  getContactSupportContent,
  upsertContactSupportContentAdmin,
} from "@/lib/content-db";
import { requireAdminApi } from "@/lib/require-admin-api";
import { upsertContactSupportContentSchema } from "@/lib/validations/admin-contact";

export async function GET(request: Request) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  try {
    const support = await getContactSupportContent();
    return NextResponse.json({ ok: true, support });
  } catch (err) {
    console.error("[api/admin/contact/support GET] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function PUT(request: Request) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = upsertContactSupportContentSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const support = await upsertContactSupportContentAdmin(parsed.data);
    revalidatePath("/contact");
    return NextResponse.json({ ok: true, support });
  } catch (err) {
    console.error("[api/admin/contact/support PUT] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
