import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  createBuiltForCardAdmin,
  listBuiltForCardsAdmin,
} from "@/lib/content-db";
import { requireAdminApi } from "@/lib/require-admin-api";
import { createBuiltForCardSchema } from "@/lib/validations/admin-built-for";

export async function GET(request: Request) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  try {
    const items = await listBuiltForCardsAdmin();
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("[api/admin/built-for-cards GET] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function POST(request: Request) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = createBuiltForCardSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const item = await createBuiltForCardAdmin(parsed.data);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (err) {
    console.error("[api/admin/built-for-cards POST] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
