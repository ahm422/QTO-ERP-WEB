import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { listAllDemoVideos } from "@/lib/demo-videos-db";
import { requireAdminApi } from "@/lib/require-admin-api";

export const runtime = "nodejs";

export async function GET() {
  const admin = await requireAdminApi();
  if ("error" in admin) return admin.error;

  try {
    const videos = await listAllDemoVideos();
    return NextResponse.json({ ok: true, videos });
  } catch (err) {
    console.error("[api/demo-videos/admin] Database error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
