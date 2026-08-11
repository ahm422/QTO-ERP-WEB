import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  createContactChannelAdmin,
  listContactChannelsAdmin,
} from "@/lib/content-db";
import { requireRole } from "@/lib/permissions";
import { createContactChannelSchema } from "@/lib/validations/admin-contact";

export async function GET(request: Request) {
  const admin = await requireRole(request, "content:view");
  if ("error" in admin) return admin.error;

  try {
    const channels = await listContactChannelsAdmin();
    return NextResponse.json({ ok: true, channels });
  } catch (err) {
    console.error("[api/admin/contact/channels GET] Error:", err);
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

  const parsed = createContactChannelSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  try {
    const channel = await createContactChannelAdmin(parsed.data);
    revalidatePath("/contact");
    return NextResponse.json({ ok: true, channel }, { status: 201 });
  } catch (err) {
    console.error("[api/admin/contact/channels POST] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
