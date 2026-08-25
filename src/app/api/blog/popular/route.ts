import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { listPopularBlogPosts } from "@/lib/content-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get("limit") ?? "5");

  try {
    const posts = await listPopularBlogPosts(Number.isFinite(limit) ? limit : 5);
    return NextResponse.json({ posts });
  } catch (err) {
    console.error("[api/blog/popular] Database error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
