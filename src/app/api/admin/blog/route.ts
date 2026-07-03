import { BlogPostStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { jsonError, validationErrorResponse } from "@/lib/api-errors";
import {
  createBlogPostAdmin,
  listAllBlogPostsAdmin,
} from "@/lib/content-db";
import { getPrisma } from "@/lib/prisma";
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

export async function GET() {
  const admin = await requireAdminApi();
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
  const admin = await requireAdminApi();
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

  const user = await getPrisma().user.findUnique({
    where: { email: admin.session.user.email! },
  });
  if (!user) {
    return jsonError("Admin user not found", 404);
  }

  const status = parsed.data.status ?? BlogPostStatus.DRAFT;
  const publishedAt =
    status === BlogPostStatus.PUBLISHED ? new Date() : null;

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

    const withAuthor = await getPrisma().blogPost.findUnique({
      where: { id: post.id },
      include: { author: { select: { email: true, name: true } } },
    });

    return NextResponse.json(
      { ok: true, post: serializePost(withAuthor!) },
      { status: 201 },
    );
  } catch (err) {
    console.error("[api/admin/blog] POST Error:", err);
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      err.code === "P2002"
    ) {
      return jsonError("Slug already exists", 409);
    }
    return jsonError("Something went wrong.", 500);
  }
}
