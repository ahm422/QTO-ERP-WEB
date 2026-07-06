import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { listAllDemoVideos } from "@/lib/demo-videos-db";
import { requireAdminApi } from "@/lib/require-admin-api";


export async function GET(request: Request) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  try {
    const videos = await listAllDemoVideos();
    return NextResponse.json({ ok: true, videos });
  } catch (err) {
    console.error("[api/demo-videos/admin] Database error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
