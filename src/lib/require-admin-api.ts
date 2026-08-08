import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { Role } from "@/db/enums";
import { users } from "@/db/schema";
import { getDb } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";

type RequireAdminSuccess = {
  user: { id: string; email: string; role: Role };
};
type RequireAdminFailure = { error: NextResponse };

export async function requireAdminApi(
  request: Request,
): Promise<RequireAdminSuccess | RequireAdminFailure> {
  const header = request.headers.get("authorization");
  const accessToken =
    header?.startsWith("Bearer ") ? header.slice(7).trim() : null;

  if (!accessToken) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const payload = await verifyAccessToken(accessToken);
  if (!payload) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const [user] = await (await getDb())
    .select({ id: users.id, email: users.email, role: users.role })
    .from(users)
    .where(eq(users.id, payload.sub))
    .limit(1);

  if (!user?.email) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (user.role !== "ADMIN") {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return {
    user: { id: user.id, email: user.email, role: user.role },
  };
}
