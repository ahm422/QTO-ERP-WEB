import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { getHomeFaqs } from "@/lib/content-db";

export async function GET() {
  try {
    const { section, faqs } = await getHomeFaqs();
    return NextResponse.json({
      ok: true,
      section,
      faqs,
    });
  } catch (err) {
    console.error("[api/home/faqs GET] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
