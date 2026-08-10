"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { BlogPostForm } from "@/components/admin/BlogPostForm";
import { Button } from "@/components/ui/button";

type BlogPost = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string | null;
  content: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
};

export default function EditBlogPostPage() {
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ ok: true; post: BlogPost }>(
        `/api/admin/blog/${params.id}`,
      );
      setPost(data.post);
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to load post",
      );
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!post) {
    return <p className="text-sm text-muted-foreground">Post not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit post</h1>
        <Button type="button" variant="outline" asChild>
          <Link href="/admin/blog">Back</Link>
        </Button>
      </div>
      <BlogPostForm mode="edit" initial={post} />
    </div>
  );
}
