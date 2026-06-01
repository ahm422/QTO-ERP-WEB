import { NextResponse } from "next/server";
import type { Resend } from "resend";
import { getResend } from "@/lib/resend";

type RequireResendSuccess = { resend: Resend };
type RequireResendFailure = { error: NextResponse };

export function requireResend(): RequireResendSuccess | RequireResendFailure {
  const resend = getResend();
  if (!resend) {
    return {
      error: NextResponse.json(
        { error: "Email service not configured" },
        { status: 503 },
      ),
    };
  }
  return { resend };
}
