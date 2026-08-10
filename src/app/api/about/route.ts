import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { getAboutPageContent } from "@/lib/content-db";

export async function GET() {
  try {
    const content = await getAboutPageContent();
    return NextResponse.json({ ok: true, ...content });
  } catch (err) {
    console.error("[api/about GET] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
