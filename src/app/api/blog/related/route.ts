import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { listRelatedBlogPosts } from "@/lib/content-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug")?.trim();
  if (!slug) {
    return jsonError("slug is required", 400);
  }
  const category = searchParams.get("category") ?? undefined;
  const limit = Number(searchParams.get("limit") ?? "3");

  try {
    const posts = await listRelatedBlogPosts({
      slug,
      category,
      limit: Number.isFinite(limit) ? limit : 3,
    });
    return NextResponse.json({ posts });
  } catch (err) {
    console.error("[api/blog/related] Database error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
