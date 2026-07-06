import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { users } from "@/db/schema";
import { getDb } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";
import { loadUserByAccessSub } from "@/lib/refresh-session";

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

export async function GET(request: Request) {
  const bearerToken = getBearerToken(request);
  const user = await resolveUserFromAccessToken(bearerToken);

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [dbUser] = await getDb()
    .select({ email: users.email, role: users.role })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  if (!dbUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    email: dbUser.email,
    role: dbUser.role,
  });
}
