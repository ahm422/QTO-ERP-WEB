import { NextResponse } from "next/server";
import { ContactAdminNotificationEmail } from "@/emails/contact-admin-notification";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  getAdminNotificationEmail,
  logEmailResults,
  sendEmail,
} from "@/lib/email";
import { getDb } from "@/lib/db";
import { contactInquiries } from "@/db/schema";
import { contactSchema } from "@/lib/validations/contact";


export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const data = parsed.data;

  try {
    const [inquiry] = await getDb()
      .insert(contactInquiries)
      .values({
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        subject: data.subject,
        companySize: data.companySize,
        message: data.message,
      })
      .returning();

    const adminEmail = getAdminNotificationEmail();
    if (adminEmail) {
      const emailResults = await Promise.allSettled([
        sendEmail({
          to: adminEmail,
          subject: `New contact inquiry: ${data.name}`,
          react: ContactAdminNotificationEmail({
            id: inquiry.id,
            ...data,
          }),
        }),
      ]);
      await logEmailResults("contact", emailResults);
    } else {
      console.error("[email] ADMIN_NOTIFICATION_EMAIL is not configured");
    }

    return NextResponse.json({ ok: true, id: inquiry.id }, { status: 201 });
  } catch (err) {
    console.error("[api/contact] Database error:", err);
    return jsonError("Something went wrong. Please try again.", 500);
  }
}
