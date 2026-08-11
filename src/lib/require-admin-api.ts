import type { NextResponse } from "next/server";
import type { Role } from "@/db/enums";
import { requireRole } from "@/lib/permissions";

type RequireAdminSuccess = {
  user: { id: string; email: string; role: Role };
};
type RequireAdminFailure = { error: NextResponse };

/**
 * @deprecated Prefer `requireRole(request, capability)` with an explicit capability.
 * Kept as a thin alias meaning "any staff role with at least content:view".
 */
export async function requireAdminApi(
  request: Request,
): Promise<RequireAdminSuccess | RequireAdminFailure> {
  return requireRole(request, "content:view");
}
