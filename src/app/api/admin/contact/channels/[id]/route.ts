import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  deleteContactChannelAdmin,
  updateContactChannelAdmin,
} from "@/lib/content-db";
import { requireAdminApi } from "@/lib/require-admin-api";
import { updateContactChannelSchema } from "@/lib/validations/admin-contact";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = updateContactChannelSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  if (Object.keys(parsed.data).length === 0) {
    return jsonError("No fields to update", 400);
  }

  try {
    const channel = await updateContactChannelAdmin(id, parsed.data);
    if (!channel) return jsonError("Contact channel not found", 404);
    revalidatePath("/contact");
    return NextResponse.json({ ok: true, channel });
  } catch (err) {
    console.error("[api/admin/contact/channels/[id] PATCH] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  try {
    const deleted = await deleteContactChannelAdmin(id);
    if (!deleted) return jsonError("Contact channel not found", 404);
    revalidatePath("/contact");
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/contact/channels/[id] DELETE] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
