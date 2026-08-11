import { and, eq, isNull } from "drizzle-orm";
import { NextResponse } from "next/server";
import { users } from "@/db/schema";
import { PasswordResetEmail } from "@/emails/password-reset";
import { getDb } from "@/lib/db";
import { sendEmail } from "@/lib/email";
import {
  PASSWORD_RESET_TTL_SECONDS,
  buildSetPasswordUrl,
  createPasswordResetToken,
} from "@/lib/password-reset";

const GENERIC_MESSAGE =
  "If an account exists for that email, a reset link has been sent.";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
  }

  const emailRaw =
    typeof (body as { email?: unknown }).email === "string"
      ? (body as { email: string }).email
      : null;

  if (!emailRaw || !emailRaw.trim()) {
    return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
  }

  const email = normalizeEmail(emailRaw);

  try {
    const [user] = await (await getDb())
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        disabledAt: users.disabledAt,
      })
      .from(users)
      .where(and(eq(users.email, email), isNull(users.disabledAt)))
      .limit(1);

    if (user) {
      const raw = await createPasswordResetToken(user.id);
      const resetUrl = buildSetPasswordUrl(raw);
      const expiresInMinutes = Math.floor(PASSWORD_RESET_TTL_SECONDS / 60);

      const result = await sendEmail({
        to: user.email,
        subject: "Reset your QTO Admin password",
        react: PasswordResetEmail({
          name: user.name,
          resetUrl,
          expiresInMinutes,
        }),
      });

      if (!result.ok) {
        console.error(
          "[api/auth/forgot-password] email send failed:",
          result.error,
        );
      }
    }
  } catch (err) {
    console.error("[api/auth/forgot-password] Error:", err);
  }

  return NextResponse.json({ message: GENERIC_MESSAGE }, { status: 200 });
}
