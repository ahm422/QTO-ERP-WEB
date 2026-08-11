import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import type { LeadStatus } from "@/db/enums";
import { leadStatuses } from "@/db/enums";
import { contactInquiries } from "@/db/schema";
import { jsonError } from "@/lib/api-errors";
import { getDb } from "@/lib/db";
import { requireRole } from "@/lib/permissions";

const validStatuses = new Set<string>(leadStatuses);

export async function GET(request: Request) {
  const admin = await requireRole(request, "content:view");
  if ("error" in admin) return admin.error;

  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");

  const statusFilter =
    statusParam && validStatuses.has(statusParam)
      ? (statusParam as LeadStatus)
      : null;

  try {
    const inquiries = await (await getDb())
      .select()
      .from(contactInquiries)
      .where(
        statusFilter ? eq(contactInquiries.status, statusFilter) : undefined,
      )
      .orderBy(desc(contactInquiries.createdAt));
    return NextResponse.json({
      ok: true,
      inquiries: inquiries.map((r) => ({
        ...r,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (err) {
    console.error("[api/admin/contact-inquiries] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
