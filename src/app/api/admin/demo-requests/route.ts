import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { LeadStatus } from "@/db/enums";
import { leadStatuses } from "@/db/enums";
import { demoRequests } from "@/db/schema";
import { jsonError } from "@/lib/api-errors";
import { getDb } from "@/lib/db";
import { requireAdminApi } from "@/lib/require-admin-api";


const validStatuses = new Set<string>(leadStatuses);

export async function GET(request: Request) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");

  const statusFilter =
    statusParam && validStatuses.has(statusParam)
      ? (statusParam as LeadStatus)
      : null;

  try {
    const requests = await getDb()
      .select()
      .from(demoRequests)
      .where(
        statusFilter ? eq(demoRequests.status, statusFilter) : undefined,
      )
      .orderBy(desc(demoRequests.createdAt));
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
