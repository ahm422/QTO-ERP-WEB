import { NextResponse } from "next/server";
import {
  getRefreshTokenFromRequest,
  revokeRefreshSession,
} from "@/lib/refresh-session";
import { clearRefreshCookie } from "@/lib/session-cookies";

export async function POST(request: Request) {
  const rawRefresh = getRefreshTokenFromRequest(request);
  if (rawRefresh) {
    await revokeRefreshSession(rawRefresh);
  }

  const response = NextResponse.json({ ok: true });
  clearRefreshCookie(response, request);
  return response;
}
