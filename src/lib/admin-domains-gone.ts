import { NextResponse } from "next/server";

/** Resend domain CRUD retired — use Wrangler Email Sending instead. */
export function adminDomainsGoneResponse() {
  return NextResponse.json(
    {
      error:
        "Domain management via Resend has been removed. Use Cloudflare Email Sending: npx wrangler email sending list",
    },
    { status: 410 },
  );
}
