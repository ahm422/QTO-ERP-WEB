"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { slugifyTitle } from "@/lib/validations/admin-blog";
import { BlogEditor } from "@/components/admin/BlogEditor";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

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

type BlogPostFormProps = {
  mode: "create" | "edit";
  initial?: BlogPost;
};

function toDatetimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function fromDatetimeLocalValue(value: string): string | null {
  if (!value.trim()) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toISOString();
}

export function BlogPostForm({ mode, initial }: BlogPostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [category, setCategory] = useState(initial?.category ?? "General");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(
    initial?.content ?? "<p></p>",
  );
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    initial?.status ?? "DRAFT",
  );
  const [publishedAtLocal, setPublishedAtLocal] = useState(
    toDatetimeLocalValue(initial?.publishedAt),
  );
  const [saving, setSaving] = useState(false);
  const [postId, setPostId] = useState(initial?.id ?? "");

  const ensureDraftForImages = async (): Promise<string> => {
    if (postId) return postId;

    const draftSlug = slug.trim() || slugifyTitle(title) || "draft-post";
    const data = await adminFetch<{ ok: true; post: BlogPost }>(
      "/api/admin/blog",
      {
        method: "POST",
        json: {
          slug: draftSlug,
          title: title.trim() || "Untitled draft",
          category,
          excerpt: excerpt || null,
          content,
          status: "DRAFT",
          publishedAt: fromDatetimeLocalValue(publishedAtLocal),
        },
      },
    );
    setPostId(data.post.id);
    setSlug(data.post.slug);
    setPublishedAtLocal(toDatetimeLocalValue(data.post.publishedAt));
    router.replace(`/admin/blog/${data.post.id}/edit`);
    return data.post.id;
  };

  const save = async (publish: boolean) => {
    setSaving(true);
    try {
      const nextStatus = publish ? "PUBLISHED" : status;
      const publishedAtIso = fromDatetimeLocalValue(publishedAtLocal);
      const body: {
        title: string;
        slug: string;
        category: string;
        excerpt: string | null;
        content: string;
        status: "DRAFT" | "PUBLISHED";
        publishedAt?: string | null;
      } = {
        title: title.trim(),
        slug: slug.trim(),
        category,
        excerpt: excerpt || null,
        content,
        status: nextStatus,
      };
      // Only send an explicit date when set; omit empty on edit so we do not
      // clear an existing publishedAt (first-publish fallback stays server-side).
      if (publishedAtIso !== null) {
        body.publishedAt = publishedAtIso;
      } else if (mode === "create" && !postId) {
        body.publishedAt = null;
      }

      if (mode === "create" && !postId) {
        await adminFetch<{ ok: true; post: BlogPost }>(
          "/api/admin/blog",
          { method: "POST", json: body },
        );
        toast.success(publish ? "Post published" : "Draft saved");
        router.push("/admin/blog");
        return;
      }

      const id = postId || initial?.id;
      if (!id) {
        await ensureDraftForImages();
        return;
      }

      await adminFetch(`/api/admin/blog/${id}`, {
        method: "PATCH",
        json: body,
      });
      toast.success(publish ? "Post published" : "Post saved");
      router.push("/admin/blog");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to save post",
      );
    } finally {
      setSaving(false);
    }
  };

  const editorPostId = postId || initial?.id;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label>Title</Label>
          <Input
            className="mt-1"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (mode === "create" && !slug) {
                setSlug(slugifyTitle(e.target.value));
              }
            }}
          />
        </div>
        <div>
          <Label>Slug</Label>
          <Input
            className="mt-1 font-mono text-sm"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </div>
        <div>
          <Label>Category</Label>
          <Input
            className="mt-1"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Excerpt</Label>
          <Textarea
            className="mt-1"
            rows={2}
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
          />
        </div>
        <div>
          <Label>Status</Label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as "DRAFT" | "PUBLISHED")}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Draft</SelectItem>
              <SelectItem value="PUBLISHED">Published</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="published-at">Published date</Label>
          <Input
            id="published-at"
            type="datetime-local"
            className="mt-1"
            value={publishedAtLocal}
            onChange={(e) => setPublishedAtLocal(e.target.value)}
          />
          <p className="mt-1 text-xs text-muted-foreground">
            Leave empty to set automatically on first publish.
          </p>
        </div>
      </div>

      <div>
        <Label>Content</Label>
        {editorPostId ? (
          <div className="mt-2">
            <BlogEditor
              postId={editorPostId}
              content={content}
              onChange={setContent}
            />
          </div>
        ) : (
          <div className="mt-2 space-y-2">
            <p className="text-sm text-muted-foreground">
              Save a draft first to enable image uploads in the editor.
            </p>
            <Textarea
              rows={12}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="font-mono text-sm"
            />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={saving}
          onClick={() => save(false)}
        >
          Save draft
        </Button>
        <Button type="button" disabled={saving} onClick={() => save(true)}>
          {saving ? "Saving…" : "Save & publish"}
        </Button>
        {mode === "create" && !postId && (
          <Button
            type="button"
            variant="secondary"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await ensureDraftForImages();
                toast.success("Draft created — image upload enabled");
              } catch (err) {
                toast.error(
                  err instanceof AdminFetchError
                    ? err.message
                    : "Failed to create draft",
                );
              } finally {
                setSaving(false);
              }
            }}
          >
            Create draft for images
          </Button>
        )}
      </div>
    </div>
  );
}
