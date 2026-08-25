import type { BlogPostStatus } from "@/db/enums";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { users } from "@/db/schema";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  createBlogPostAdmin,
  getBlogPostByIdAdmin,
  listAllBlogPostsAdmin,
} from "@/lib/content-db";
import { serializeAdminBlogPost } from "@/lib/content-serializers";
import { getDb } from "@/lib/db";
import { isSqliteUniqueConstraintError } from "@/lib/db-errors";
import { requireRole } from "@/lib/permissions";
import { revalidateBlogPaths } from "@/lib/revalidate-content-paths";
import { sanitizeBlogHtml } from "@/lib/sanitize-blog-html";
import {
  computeReadTime,
  createBlogPostSchema,
} from "@/lib/validations/admin-blog";

export async function GET(request: Request) {
  const admin = await requireRole(request, "content:view");
  if ("error" in admin) return admin.error;

  try {
    const posts = await listAllBlogPostsAdmin();
    return NextResponse.json({
      ok: true,
      posts: posts.map(serializeAdminBlogPost),
    });
  } catch (err) {
    console.error("[api/admin/blog] GET Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function POST(request: Request) {
  const admin = await requireRole(request, "content:create");
  if ("error" in admin) return admin.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = createBlogPostSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  const [user] = await (await getDb())
    .select()
    .from(users)
    .where(eq(users.email, admin.user.email))
    .limit(1);
  if (!user) {
    return jsonError("Admin user not found", 404);
  }

  const status = (parsed.data.status ?? "DRAFT") as BlogPostStatus;
  let publishedAt: Date | null = null;
  if (parsed.data.publishedAt) {
    publishedAt = new Date(parsed.data.publishedAt);
  } else if (status === "PUBLISHED") {
    publishedAt = new Date();
  }

  const content = sanitizeBlogHtml(parsed.data.content);
  const readTimeMinutes = computeReadTime(content);

  try {
    const post = await createBlogPostAdmin({
      slug: parsed.data.slug,
      title: parsed.data.title,
      category: parsed.data.category,
      excerpt: parsed.data.excerpt ?? null,
      content,
      status,
      authorId: user.id,
      publishedAt,
      coverImageUrl: parsed.data.coverImageUrl ?? null,
      tags: parsed.data.tags ?? [],
      isFeatured: parsed.data.isFeatured ?? false,
      metaTitle: parsed.data.metaTitle ?? null,
      metaDescription: parsed.data.metaDescription ?? null,
      readTimeMinutes,
    });

    const withAuthor = await getBlogPostByIdAdmin(post.id);
    revalidateBlogPaths(post.slug);

    return NextResponse.json(
      { ok: true, post: serializeAdminBlogPost(withAuthor!) },
      { status: 201 },
    );
  } catch (err) {
    console.error("[api/admin/blog] POST Error:", err);
    if (isSqliteUniqueConstraintError(err)) {
      return jsonError("Slug already exists", 409);
    }
    return jsonError("Something went wrong.", 500);
  }
}
