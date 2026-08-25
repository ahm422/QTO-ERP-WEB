import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { listPublishedBlogCategories } from "@/lib/content-db";

export async function GET() {
  try {
    const categories = await listPublishedBlogCategories();
    return NextResponse.json({ categories });
  } catch (err) {
    console.error("[api/blog/categories] Database error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
