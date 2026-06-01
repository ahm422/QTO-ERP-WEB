import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { listPublishedModules } from "@/lib/content-db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const modules = await listPublishedModules();
    return NextResponse.json({ modules });
  } catch (err) {
    console.error("[api/modules] Database error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
