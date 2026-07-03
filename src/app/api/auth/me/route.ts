import { NextResponse } from "next/server";
import { auth } from "@/auth";


export async function GET() {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    email: session.user.email,
    role: session.user.role,
  });
}
