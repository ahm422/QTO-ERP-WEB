import { NextResponse } from "next/server";
import { DemoConfirmationEmail } from "@/emails/demo-confirmation";
import { DemoAdminNotificationEmail } from "@/emails/demo-admin-notification";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  getAdminNotificationEmail,
  logEmailResults,
  sendEmail,
} from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { demoSchema } from "@/lib/validations/demo";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = demoSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const data = parsed.data;

  try {
    const demoRequest = await prisma.demoRequest.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        country: data.country,
        company: data.company,
        businessType: data.businessType,
      },
    });

    const adminEmail = getAdminNotificationEmail();
    const emailTasks = [
      sendEmail({
        to: data.email,
        subject: "We received your demo request — QTO ERP",
        react: DemoConfirmationEmail({ name: data.name }),
      }),
    ];

    if (adminEmail) {
      emailTasks.push(
        sendEmail({
          to: adminEmail,
          subject: `New demo request: ${data.name}`,
          react: DemoAdminNotificationEmail({
            id: demoRequest.id,
            ...data,
          }),
        }),
      );
    } else {
      console.error("[email] ADMIN_NOTIFICATION_EMAIL is not configured");
    }

    const emailResults = await Promise.allSettled(emailTasks);
    await logEmailResults("demo", emailResults);

    return NextResponse.json({ ok: true, id: demoRequest.id }, { status: 201 });
  } catch (err) {
    console.error("[api/demo] Database error:", err);
    return jsonError("Something went wrong. Please try again.", 500);
  }
}
