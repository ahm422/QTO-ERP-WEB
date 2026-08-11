import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { createFaqAdmin, listFaqsAdmin } from "@/lib/content-db";
import { FAQ_PAGE_KEY_HOME } from "@/lib/faqs-defaults";
import { requireRole } from "@/lib/permissions";
import { createFaqSchema } from "@/lib/validations/admin-faqs";

export async function GET(request: Request) {
  const admin = await requireRole(request, "content:view");
  if ("error" in admin) return admin.error;

  const { searchParams } = new URL(request.url);
  const pageKey = searchParams.get("pageKey")?.trim() || FAQ_PAGE_KEY_HOME;

  try {
    const items = await listFaqsAdmin(pageKey);
    return NextResponse.json({ ok: true, pageKey, items });
  } catch (err) {
    console.error("[api/admin/faqs GET] Error:", err);
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

  const parsed = createFaqSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const item = await createFaqAdmin(parsed.data);
    revalidatePath("/", "layout");
    return NextResponse.json({ ok: true, item }, { status: 201 });
  } catch (err) {
    console.error("[api/admin/faqs POST] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
