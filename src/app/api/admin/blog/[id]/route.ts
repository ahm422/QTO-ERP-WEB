import type { BlogPostStatus } from "@/db/enums";
import { NextResponse } from "next/server";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  deleteBlogPostAdmin,
  getBlogPostByIdAdmin,
  updateBlogPostAdmin,
} from "@/lib/content-db";
import { isSqliteUniqueConstraintError } from "@/lib/db-errors";
import { requireAdminApi } from "@/lib/require-admin-api";
import { updateBlogPostSchema } from "@/lib/validations/admin-blog";


type RouteContext = { params: Promise<{ id: string }> };

function serializePost(
  post: NonNullable<Awaited<ReturnType<typeof getBlogPostByIdAdmin>>>,
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

export async function GET(request: Request, context: RouteContext) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  try {
    const post = await getBlogPostByIdAdmin(id);
    if (!post) {
      return jsonError("Blog post not found", 404);
    }
    return NextResponse.json({ ok: true, post: serializePost(post) });
  } catch (err) {
    console.error("[api/admin/blog/[id]] GET Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError("Invalid JSON body", 400);
  }

  const parsed = updateBlogPostSchema.safeParse(body);
  if (!parsed.success) {
    return validationErrorResponse(parsed.error);
  }

  if (Object.keys(parsed.data).length === 0) {
    return jsonError("No fields to update", 400);
  }

  try {
    const existing = await getBlogPostByIdAdmin(id);
    if (!existing) {
      return jsonError("Blog post not found", 404);
    }

    const data: Parameters<typeof updateBlogPostAdmin>[1] = { ...parsed.data };

    if (parsed.data.status === "PUBLISHED") {
      data.status = "PUBLISHED" as BlogPostStatus;
      if (!existing.publishedAt) {
        data.publishedAt = new Date();
      }
    } else if (parsed.data.status === "DRAFT") {
      data.status = "DRAFT" as BlogPostStatus;
    }

    const post = await updateBlogPostAdmin(id, data);
    const withAuthor = await getBlogPostByIdAdmin(post.id);
    return NextResponse.json({
      ok: true,
      post: serializePost(withAuthor!),
    });
  } catch (err) {
    console.error("[api/admin/blog/[id]] PATCH Error:", err);
    if (isSqliteUniqueConstraintError(err)) {
      return jsonError("Slug already exists", 409);
    }
    return jsonError("Something went wrong.", 500);
  }
}

export async function DELETE(request: Request, context: RouteContext) {
  const admin = await requireAdminApi(request);
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  try {
    const existing = await getBlogPostByIdAdmin(id);
    if (!existing) {
      return jsonError("Blog post not found", 404);
    }

    await deleteBlogPostAdmin(id);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/blog/[id]] DELETE Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
