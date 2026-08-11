import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { hashRefreshToken, verifyAccessToken } from "@/lib/jwt";
import {
  getAllRefreshTokensFromRequest,
  listActiveSessionsForUser,
  loadUserByAccessSub,
  revokeAllRefreshTokensForUser,
  revokeRefreshTokenById,
} from "@/lib/refresh-session";

function getBearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  return header?.startsWith("Bearer ") ? header.slice(7).trim() : null;
}

async function resolveUserFromAccessToken(accessToken: string | null) {
  if (!accessToken) return null;
  const payload = await verifyAccessToken(accessToken);
  if (!payload) return null;
  return loadUserByAccessSub(payload.sub);
}

async function currentRefreshTokenHashes(request: Request): Promise<Set<string>> {
  const hashes = new Set<string>();
  for (const raw of getAllRefreshTokensFromRequest(request)) {
    hashes.add(await hashRefreshToken(raw));
  }
  return hashes;
}

export async function GET(request: Request) {
  const bearerToken = getBearerToken(request);
  const user = await resolveUserFromAccessToken(bearerToken);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const rows = await listActiveSessionsForUser(user.id);
    const currentHashes = await currentRefreshTokenHashes(request);

    const sessions = rows.map((row) => ({
      id: row.id,
      userAgent: row.userAgent,
      ip: row.ip,
      createdAt: row.createdAt.toISOString(),
      isCurrent: currentHashes.has(row.tokenHash),
    }));

    return NextResponse.json({ ok: true, sessions });
  } catch (err) {
    console.error("[api/auth/sessions] GET Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function DELETE(request: Request) {
  const bearerToken = getBearerToken(request);
  const user = await resolveUserFromAccessToken(bearerToken);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown = {};
  try {
    const text = await request.text();
    if (text.trim()) {
      body = JSON.parse(text);
    }
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const url = new URL(request.url);
  const queryId = url.searchParams.get("id");
  const queryAll = url.searchParams.get("all");

  const revokeAll =
    (body as { all?: unknown }).all === true || queryAll === "true";
  const id =
    typeof (body as { id?: unknown }).id === "string"
      ? (body as { id: string }).id.trim()
      : (queryId?.trim() ?? "");

  try {
    if (revokeAll) {
      await revokeAllRefreshTokensForUser(user.id);
      return NextResponse.json({ ok: true });
    }

    if (!id) {
      return jsonError("Provide a session id or all: true.", 400);
    }

    const revoked = await revokeRefreshTokenById(user.id, id);
    if (!revoked) {
      return jsonError("Session not found.", 404);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/auth/sessions] DELETE Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
