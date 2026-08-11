import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { ContactReplyEmail } from "@/emails/contact-reply";
import { contactInquiries } from "@/db/schema";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { sendEmail } from "@/lib/email";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import { contactInquiryReplySchema } from "@/lib/validations/admin-contact";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(request: Request, context: RouteContext) {
  const admin = await requireRole(request, "content:edit");
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = contactInquiryReplySchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const [inquiry] = await (await getDb())
    .select()
    .from(contactInquiries)
    .where(eq(contactInquiries.id, id))
    .limit(1);
  if (!inquiry) {
    return jsonError("Contact inquiry not found", 404);
  }

  const emailResult = await sendEmail({
    to: inquiry.email,
    subject: parsed.data.subject,
    react: ContactReplyEmail({
      name: inquiry.name,
      body: parsed.data.body,
    }),
  });

  if (!emailResult.ok) {
    return NextResponse.json(
      { ok: false, error: emailResult.error },
      { status: 502 },
    );
  }

  try {
    const [updated] = await (await getDb())
      .update(contactInquiries)
      .set({ status: "READ" })
      .where(eq(contactInquiries.id, id))
      .returning();

    return NextResponse.json({
      ok: true,
      inquiry: {
        ...updated,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (err) {
    console.error("[api/admin/contact-inquiries/[id]/reply] Error:", err);
    return jsonError("Email sent but status update failed.", 500);
  }
}
