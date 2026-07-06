import { NextResponse } from "next/server";
import { revokeAllRefreshSessionsFromRequest } from "@/lib/refresh-session";
import { clearRefreshCookie } from "@/lib/session-cookies";

export async function POST(request: Request) {
  await revokeAllRefreshSessionsFromRequest(request);

  const response = NextResponse.json({ ok: true });
  clearRefreshCookie(response, request);
  return response;
}
