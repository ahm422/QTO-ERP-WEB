import { NextResponse } from "next/server";

type ResendErrorShape = {
  message?: string;
  name?: string;
};

export function resendErrorResponse(
  error: ResendErrorShape | null | undefined,
  fallbackStatus = 502,
) {
  const message = error?.message ?? "Resend API request failed";
  return NextResponse.json({ error: message }, { status: fallbackStatus });
}
