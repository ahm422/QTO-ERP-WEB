import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { reorderContactChannelsAdmin } from "@/lib/content-db";
import { requireAdminApi } from "@/lib/require-admin-api";
import { reorderContactChannelsSchema } from "@/lib/validations/admin-contact";

export async function POST(request: Request) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = reorderContactChannelsSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    await reorderContactChannelsAdmin(parsed.data.orderedIds);
    revalidatePath("/contact");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/contact/channels/reorder POST] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
