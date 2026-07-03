import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { getPublishedSolutionBySlug } from "@/lib/content-db";


type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  try {
    const solution = await getPublishedSolutionBySlug(slug);
    if (!solution) {
      return jsonError("Not found", 404);
    }
    return NextResponse.json(solution);
  } catch (err) {
    console.error("[api/solutions/[slug]] Database error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
