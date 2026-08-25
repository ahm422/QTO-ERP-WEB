import type { BlogPostStatus } from "@/db/enums";
import { NextResponse } from "next/server";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  deleteBlogPostAdmin,
  getBlogPostByIdAdmin,
  updateBlogPostAdmin,
} from "@/lib/content-db";
import { serializeAdminBlogPost } from "@/lib/content-serializers";
import { isSqliteUniqueConstraintError } from "@/lib/db-errors";
import { requireRole } from "@/lib/permissions";
import { revalidateBlogPaths } from "@/lib/revalidate-content-paths";
import { sanitizeBlogHtml } from "@/lib/sanitize-blog-html";
import {
  computeReadTime,
  updateBlogPostSchema,
} from "@/lib/validations/admin-blog";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const admin = await requireRole(request, "content:view");
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  try {
    const post = await getBlogPostByIdAdmin(id);
    if (!post) {
      return jsonError("Blog post not found", 404);
    }
    return NextResponse.json({ ok: true, post: serializeAdminBlogPost(post) });
  } catch (err) {
    console.error("[api/admin/blog/[id]] GET Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}

export async function PATCH(request: Request, context: RouteContext) {
  const admin = await requireRole(request, "content:edit");
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

    const { publishedAt: publishedAtRaw, content, ...rest } = parsed.data;
    const data: Parameters<typeof updateBlogPostAdmin>[1] = { ...rest };

    if (publishedAtRaw !== undefined) {
      data.publishedAt =
        publishedAtRaw === null ? null : new Date(publishedAtRaw);
    }

    if (content !== undefined) {
      const sanitized = sanitizeBlogHtml(content);
      data.content = sanitized;
      data.readTimeMinutes = computeReadTime(sanitized);
    }

    if (parsed.data.status === "PUBLISHED") {
      data.status = "PUBLISHED" as BlogPostStatus;
      const effective =
        data.publishedAt !== undefined
          ? data.publishedAt
          : existing.publishedAt;
      if (!effective) {
        data.publishedAt = new Date();
      }
    } else if (parsed.data.status === "DRAFT") {
      data.status = "DRAFT" as BlogPostStatus;
    }

    const post = await updateBlogPostAdmin(id, data);
    const withAuthor = await getBlogPostByIdAdmin(post.id);

    revalidateBlogPaths(existing.slug);
    if (post.slug !== existing.slug) {
      revalidateBlogPaths(post.slug);
    }

    return NextResponse.json({
      ok: true,
      post: serializeAdminBlogPost(withAuthor!),
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
  const admin = await requireRole(request, "content:delete");
  if ("error" in admin) return admin.error;

  const { id } = await context.params;

  try {
    const existing = await getBlogPostByIdAdmin(id);
    if (!existing) {
      return jsonError("Blog post not found", 404);
    }

    await deleteBlogPostAdmin(id);
    revalidateBlogPaths(existing.slug);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/admin/blog/[id]] DELETE Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
