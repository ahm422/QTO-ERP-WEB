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
import { getDb } from "@/lib/db";
import { isSqliteUniqueConstraintError } from "@/lib/db-errors";
import { requireAdminApi } from "@/lib/require-admin-api";
import { createBlogPostSchema } from "@/lib/validations/admin-blog";


function serializePost(
  post: Awaited<ReturnType<typeof listAllBlogPostsAdmin>>[number],
) {
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    category: post.category,
    excerpt: post.excerpt,
    content: post.content,
    status: post.status,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    author: post.author,
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
}

export async function GET(request: Request) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  try {
    const posts = await listAllBlogPostsAdmin();
    return NextResponse.json({
      ok: true,
      posts: posts.map(serializePost),
    });
  } catch (err) {
    console.error("[api/admin/blog] GET Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function POST(request: Request) {
  const admin = await requireAdminApi(request);
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

  try {
    const post = await createBlogPostAdmin({
      slug: parsed.data.slug,
      title: parsed.data.title,
      category: parsed.data.category,
      excerpt: parsed.data.excerpt ?? null,
      content: parsed.data.content,
      status,
      authorId: user.id,
      publishedAt,
    });

    const withAuthor = await getBlogPostByIdAdmin(post.id);

    return NextResponse.json(
      { ok: true, post: serializePost(withAuthor!) },
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
