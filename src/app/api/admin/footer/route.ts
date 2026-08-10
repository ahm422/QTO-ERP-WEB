import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { getFooterContent, upsertFooterContentAdmin } from "@/lib/content-db";
import { requireAdminApi } from "@/lib/require-admin-api";
import { upsertFooterContentSchema } from "@/lib/validations/admin-footer";

export async function GET(request: Request) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  try {
    const footer = await getFooterContent();
    return NextResponse.json({ ok: true, footer });
  } catch (err) {
    console.error("[api/admin/footer GET] Error:", err);
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

  const parsed = upsertFooterContentSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const footer = await upsertFooterContentAdmin(parsed.data);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, footer });
  } catch (err) {
    console.error("[api/admin/footer PUT] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
