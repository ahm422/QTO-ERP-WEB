import { LeadStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { getPrisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/require-admin-api";


const validStatuses = new Set<string>(Object.values(LeadStatus));

export async function GET(request: Request) {
  const admin = await requireAdminApi();
  if ("error" in admin) return admin.error;

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");

  const where =
    statusParam && validStatuses.has(statusParam)
      ? { status: statusParam as LeadStatus }
      : {};

  try {
    const requests = await getPrisma().demoRequest.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      ok: true,
      requests: requests.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[api/admin/demo-requests] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
