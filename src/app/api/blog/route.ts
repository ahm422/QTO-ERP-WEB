import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { listPublishedBlogPosts } from "@/lib/content-db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "9");
  const category = searchParams.get("category") ?? undefined;
  const tag = searchParams.get("tag") ?? undefined;
  const search = searchParams.get("q") ?? undefined;

  try {
    const result = await listPublishedBlogPosts({
      page: Number.isFinite(page) ? page : 1,
      limit: Number.isFinite(limit) ? limit : 9,
      category,
      tag,
      search,
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/blog] Database error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
