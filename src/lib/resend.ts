import { Resend } from "resend";

const globalForResend = globalThis as unknown as {
  resend: Resend | undefined;
  resendApiKey: string | undefined;
};

export function getResend(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  if (
    globalForResend.resend &&
    globalForResend.resendApiKey === apiKey
  ) {
    return globalForResend.resend;
  }

  globalForResend.resendApiKey = apiKey;
  globalForResend.resend = new Resend(apiKey);
  return globalForResend.resend;
}
