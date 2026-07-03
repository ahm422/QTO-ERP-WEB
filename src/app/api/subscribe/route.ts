import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { NewsletterWelcomeEmail } from "@/emails/newsletter-welcome";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import { logEmailResults, sendEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { subscribeSchema } from "@/lib/validations/subscribe";


export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = subscribeSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const { email } = parsed.data;

  try {
    const subscriber = await prisma.newsletterSubscriber.create({
      data: { email },
    });

    const emailResults = await Promise.allSettled([
      sendEmail({
        to: email,
        subject: "Welcome to QTO ERP updates",
        react: NewsletterWelcomeEmail(),
      }),
    ]);
    await logEmailResults("subscribe", emailResults);

    return NextResponse.json({ ok: true, id: subscriber.id }, { status: 201 });
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      return jsonError("Already subscribed", 409);
    }

    console.error("[api/subscribe] Database error:", err);
    return jsonError("Something went wrong. Please try again.", 500);
  }
}
