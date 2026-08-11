import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  getAboutStoryAdmin,
  upsertAboutStoryAdmin,
} from "@/lib/content-db";
import { requireRole } from "@/lib/permissions";
import { upsertAboutStorySchema } from "@/lib/validations/admin-about";

export async function GET(request: Request) {
  const admin = await requireRole(request, "content:view");
  if ("error" in admin) return admin.error;

  try {
    const story = await getAboutStoryAdmin();
    return NextResponse.json({ ok: true, story });
  } catch (err) {
    console.error("[api/admin/about/story GET] Error:", err);
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

  const parsed = upsertAboutStorySchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const story = await upsertAboutStoryAdmin(parsed.data);
    revalidatePath("/about");
    return NextResponse.json({ ok: true, story });
  } catch (err) {
    console.error("[api/admin/about/story PUT] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
