import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { Role } from "@/db/enums";
import { users } from "@/db/schema";
import { getDb } from "@/lib/db";
import { verifyAccessToken } from "@/lib/jwt";
import {
  hasCapability,
  type Capability,
} from "@/lib/permission-matrix";

export {
  capabilities,
  ROLE_PERMISSIONS,
  hasCapability,
  type Capability,
} from "@/lib/permission-matrix";

type RequireRoleSuccess = {
  user: { id: string; email: string; role: Role };
};
type RequireRoleFailure = { error: NextResponse };

/**
 * Authenticate via Bearer JWT, load user from DB (DB role is authoritative),
 * then enforce the capability matrix.
 */
export async function requireRole(
  request: Request,
  capability: Capability,
): Promise<RequireRoleSuccess | RequireRoleFailure> {
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
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      disabledAt: users.disabledAt,
    })
    .from(users)
    .where(eq(users.id, payload.sub))
    .limit(1);

  if (!user?.email || user.disabledAt != null) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (!hasCapability(user.role, capability)) {
    return {
      error: NextResponse.json(
        {
          error: "Forbidden",
          message: `Missing capability: ${capability}`,
        },
        { status: 403 },
      ),
    };
  }

  return {
    user: { id: user.id, email: user.email, role: user.role },
  };
}
