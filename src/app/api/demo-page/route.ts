import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { getDemoPageContent } from "@/lib/content-db";

export async function GET() {
  try {
    const page = await getDemoPageContent();
    return NextResponse.json({ ok: true, page });
  } catch (err) {
    console.error("[api/demo-page GET] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
