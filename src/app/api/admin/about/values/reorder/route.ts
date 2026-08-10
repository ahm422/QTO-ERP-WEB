import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { reorderAboutValuesAdmin } from "@/lib/content-db";
import { requireAdminApi } from "@/lib/require-admin-api";
import { reorderAboutValuesSchema } from "@/lib/validations/admin-about";

export async function PUT(request: Request) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = reorderAboutValuesSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const items = await reorderAboutValuesAdmin(parsed.data.ids);
    revalidatePath("/about");
    return NextResponse.json({ ok: true, items });
  } catch (err) {
    console.error("[api/admin/about/values/reorder PUT] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
