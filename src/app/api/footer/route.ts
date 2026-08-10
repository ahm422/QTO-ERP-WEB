import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { getFooterContent } from "@/lib/content-db";

export async function GET() {
  try {
    const footer = await getFooterContent();
    return NextResponse.json({ ok: true, footer });
  } catch (err) {
    console.error("[api/footer GET] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
