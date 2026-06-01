import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { auth } from "@/auth";

type RequireAdminSuccess = { session: Session };
type RequireAdminFailure = { error: NextResponse };

export async function requireAdminApi(): Promise<
  RequireAdminSuccess | RequireAdminFailure
> {
  const session = await auth();

  if (!session?.user?.email) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }

  return { session };
}
