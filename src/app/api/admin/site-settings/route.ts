import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { requireAdminApi } from "@/lib/require-admin-api";
import { getSiteSettings, setSiteSetting } from "@/lib/site-settings";
import { updateSiteSettingsSchema } from "@/lib/validations/admin-site-settings";


export async function GET(request: Request) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  try {
    const settings = await getSiteSettings();
    return NextResponse.json({ ok: true, settings });
  } catch (err) {
    console.error("[api/admin/site-settings GET] Error:", err);
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

  const parsed = updateSiteSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  if (Object.keys(parsed.data).length === 0) {
    return jsonError("No fields to update", 400);
  }

  try {
    await Promise.all(
      Object.entries(parsed.data).map(([key, value]) =>
        setSiteSetting(key, value as string),
      ),
    );

    revalidatePath("/", "layout");

    const settings = await getSiteSettings();
    return NextResponse.json({ ok: true, settings });
  } catch (err) {
    console.error("[api/admin/site-settings PATCH] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
