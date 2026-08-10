import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { getHomeSection, updateHomeSectionAdmin } from "@/lib/content-db";
import { FAQ_SECTION_KEY } from "@/lib/home-sections-defaults";
import { requireAdminApi } from "@/lib/require-admin-api";
import { updateHomeSectionSchema } from "@/lib/validations/admin-built-for";

export async function GET(request: Request) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  try {
    const section = await getHomeSection(FAQ_SECTION_KEY);
    return NextResponse.json({
      ok: true,
      section: { sectionKey: FAQ_SECTION_KEY, ...section },
    });
  } catch (err) {
    console.error("[api/admin/home-sections/faq GET] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function PATCH(request: Request) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = updateHomeSectionSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  if (Object.keys(parsed.data).length === 0) {
    return jsonError("No fields to update", 400);
  }

  try {
    const section = await updateHomeSectionAdmin(FAQ_SECTION_KEY, parsed.data);
    revalidatePath("/", "layout");
    return NextResponse.json({
      ok: true,
      section: { sectionKey: FAQ_SECTION_KEY, ...section },
    });
  } catch (err) {
    console.error("[api/admin/home-sections/faq PATCH] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
