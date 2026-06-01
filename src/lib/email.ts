import type { ReactElement } from "react";
import { getResend } from "@/lib/resend";

type SendEmailParams = {
  to: string | string[];
  subject: string;
  react: ReactElement;
};

export type SendEmailResult = { ok: true } | { ok: false; error: string };

export async function sendEmail({
  to,
  subject,
  react,
}: SendEmailParams): Promise<SendEmailResult> {
  const from = process.env.EMAIL_FROM;
  if (!from) {
    console.error("[email] EMAIL_FROM is not configured");
    return { ok: false, error: "Email not configured" };
  }

  const resend = getResend();
  if (!resend) {
    console.error("[email] RESEND_API_KEY is not configured");
    return { ok: false, error: "Email service not configured" };
  }

  try {
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      react,
    });

    if (error) {
      console.error("[email] Resend error:", error.message);
      return { ok: false, error: error.message };
    }

    return { ok: true };
  } catch (err) {
    console.error("[email] Unexpected error:", err);
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Unknown email error",
    };
  }
}

export function getAdminNotificationEmail(): string | null {
  const email = process.env.ADMIN_NOTIFICATION_EMAIL?.trim();
  return email || null;
}

export async function logEmailResults(
  label: string,
  results: PromiseSettledResult<SendEmailResult>[],
): Promise<void> {
  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(`[email] ${label}[${index}] rejected:`, result.reason);
      return;
    }
    if (!result.value.ok) {
      console.error(`[email] ${label}[${index}] failed:`, result.value.error);
    }
  });
}
