import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import {
  getBuiltForSection,
  listPublishedHomeStats,
  listPublishedTrustedLogos,
} from "@/lib/content-db";

export async function GET() {
  try {
    const [trustedLogos, stats, builtFor] = await Promise.all([
      listPublishedTrustedLogos(),
      listPublishedHomeStats(),
      getBuiltForSection(),
    ]);

    return NextResponse.json({
      ok: true,
      trustedLogos,
      stats,
      builtFor: {
        tag: builtFor.section.tag,
        title: builtFor.section.title,
        accent: builtFor.section.accent,
        description: builtFor.section.description,
        cards: builtFor.cards,
      },
    });
  } catch (err) {
    console.error("[api/home/sections GET] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
