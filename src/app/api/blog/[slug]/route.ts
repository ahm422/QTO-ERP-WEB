import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { getPublishedBlogPostBySlug } from "@/lib/content-db";


type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const { slug } = await context.params;
  try {
    const post = await getPublishedBlogPostBySlug(slug);
    if (!post) {
      return jsonError("Not found", 404);
    }
    return NextResponse.json(post);
  } catch (err) {
    console.error("[api/blog/[slug]] Database error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
