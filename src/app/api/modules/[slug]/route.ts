import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { getPublishedModuleBySlug } from "@/lib/content-db";


type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  try {
    const module = await getPublishedModuleBySlug(slug);
    if (!module) {
      return jsonError("Not found", 404);
    }
    return NextResponse.json(module);
  } catch (err) {
    console.error("[api/modules/[slug]] Database error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
