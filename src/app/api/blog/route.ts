import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { listPublishedBlogPosts } from "@/lib/content-db";

export const runtime = "nodejs";

export async function GET() {
  try {
    const posts = await listPublishedBlogPosts();
    return NextResponse.json({ posts });
  } catch (err) {
    console.error("[api/blog] Database error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
