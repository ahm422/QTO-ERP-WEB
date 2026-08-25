"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";
import { AdminFetchError, adminFetch, adminUpload } from "@/lib/admin-fetch";
import { BLOG_PROSE_CLASS } from "@/lib/blog-prose";
import { slugifyTitle } from "@/lib/validations/admin-blog";
import { AdminFormWidth } from "@/components/admin/AdminFormWidth";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
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
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

export type AdminBlogPost = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string | null;
  content: string;
  status: "DRAFT" | "PUBLISHED";
  publishedAt: string | null;
  coverImageUrl?: string | null;
  tags?: string[];
  isFeatured?: boolean;
  isCompanyNews?: boolean;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

type BlogPostFormProps = {
  mode: "create" | "edit";
  initial?: AdminBlogPost;
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

function formatSavedAt(date: Date): string {
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function BlogPostForm({ mode, initial }: BlogPostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [category, setCategory] = useState(initial?.category ?? "General");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "<p></p>");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(
    initial?.status ?? "DRAFT",
  );
  const [publishedAtLocal, setPublishedAtLocal] = useState(
    toDatetimeLocalValue(initial?.publishedAt),
  );
  const [coverImageUrl, setCoverImageUrl] = useState(
    initial?.coverImageUrl ?? "",
  );
  const [tags, setTags] = useState<string[]>(initial?.tags ?? []);
  const [tagDraft, setTagDraft] = useState("");
  const [isFeatured, setIsFeatured] = useState(initial?.isFeatured ?? false);
  const [isCompanyNews, setIsCompanyNews] = useState(
    initial?.isCompanyNews ?? false,
  );
  const [metaTitle, setMetaTitle] = useState(initial?.metaTitle ?? "");
  const [metaDescription, setMetaDescription] = useState(
    initial?.metaDescription ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [postId, setPostId] = useState(initial?.id ?? "");
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(
    initial ? new Date() : null,
  );
  const latestRef = useRef({
    title,
    slug,
    category,
    excerpt,
    content,
    status,
    publishedAtLocal,
    coverImageUrl,
    tags,
    isFeatured,
    isCompanyNews,
    metaTitle,
    metaDescription,
    postId,
  });

  latestRef.current = {
    title,
    slug,
    category,
    excerpt,
    content,
    status,
    publishedAtLocal,
    coverImageUrl,
    tags,
    isFeatured,
    isCompanyNews,
    metaTitle,
    metaDescription,
    postId,
  };

  const addTags = (raw: string) => {
    const next = raw
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (next.length === 0) return;
    setTags((prev) => {
      const merged = [...prev];
      for (const tag of next) {
        if (merged.length >= 12) break;
        if (!merged.includes(tag) && tag.length <= 40) merged.push(tag);
      }
      return merged;
    });
    setTagDraft("");
  };

  const buildBody = (publish: boolean) => {
    const snapshot = latestRef.current;
    const nextStatus = publish ? "PUBLISHED" : snapshot.status;
    const publishedAtIso = fromDatetimeLocalValue(snapshot.publishedAtLocal);
    const body: Record<string, unknown> = {
      title: snapshot.title.trim(),
      slug: snapshot.slug.trim(),
      category: snapshot.category,
      excerpt: snapshot.excerpt || null,
      content: snapshot.content,
      status: nextStatus,
      coverImageUrl: snapshot.coverImageUrl || null,
      tags: snapshot.tags,
      isFeatured: snapshot.isFeatured,
      isCompanyNews: snapshot.isCompanyNews,
      metaTitle: snapshot.metaTitle.trim() || null,
      metaDescription: snapshot.metaDescription.trim() || null,
    };
    if (publishedAtIso !== null) {
      body.publishedAt = publishedAtIso;
    } else if (mode === "create" && !snapshot.postId) {
      body.publishedAt = null;
    }
    return body;
  };

  const ensureDraftForImages = async (): Promise<string> => {
    if (postId) return postId;

    const draftSlug = slug.trim() || slugifyTitle(title) || "draft-post";
    const data = await adminFetch<{ ok: true; post: AdminBlogPost }>(
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
          coverImageUrl: coverImageUrl || null,
          tags,
          isFeatured,
          isCompanyNews,
          metaTitle: metaTitle.trim() || null,
          metaDescription: metaDescription.trim() || null,
        },
      },
    );
    setPostId(data.post.id);
    setSlug(data.post.slug);
    setPublishedAtLocal(toDatetimeLocalValue(data.post.publishedAt));
    setLastSavedAt(new Date());
    router.replace(`/admin/blog/${data.post.id}/edit`);
    return data.post.id;
  };

  /** Lets the editor be fully usable (including image upload) before a draft exists yet. */
  const uploadInlineImage = async (file: File): Promise<string> => {
    const id = await ensureDraftForImages();
    const formData = new FormData();
    formData.append("file", file);
    formData.append("postId", id);
    formData.append("kind", "inline");
    const result = await adminUpload<{ ok: true; imageUrl: string }>(
      "/api/admin/blog/upload-image",
      formData,
    );
    return result.imageUrl;
  };

  const save = async (publish: boolean) => {
    setSaving(true);
    try {
      const body = buildBody(publish);

      if (mode === "create" && !postId) {
        await adminFetch<{ ok: true; post: AdminBlogPost }>(
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
      setLastSavedAt(new Date());
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

  useEffect(() => {
    if (!postId) return;
    const timer = window.setInterval(() => {
      const snapshot = latestRef.current;
      if (!snapshot.postId || snapshot.status !== "DRAFT") return;
      const body = buildBody(false);
      void adminFetch(`/api/admin/blog/${snapshot.postId}`, {
        method: "PATCH",
        json: body,
      })
        .then(() => setLastSavedAt(new Date()))
        .catch((err) => console.error("[blog autosave]", err));
    }, 30_000);
    return () => window.clearInterval(timer);
    // Latest form values are read from latestRef; do not restart on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const uploadCover = async (file: File) => {
    setUploadingCover(true);
    try {
      const id = await ensureDraftForImages();
      const formData = new FormData();
      formData.append("file", file);
      formData.append("postId", id);
      formData.append("kind", "cover");
      const result = await adminUpload<{ ok: true; imageUrl: string }>(
        "/api/admin/blog/upload-image",
        formData,
      );
      setCoverImageUrl(result.imageUrl);
      toast.success("Cover uploaded");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Cover upload failed",
      );
    } finally {
      setUploadingCover(false);
    }
  };

  return (
    <AdminFormWidth size="lg" className="space-y-6">
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
        <div className="sm:col-span-2">
          <Label>Cover image</Label>
          {coverImageUrl ? (
            <div className="mt-2 overflow-hidden rounded-md border">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImageUrl}
                alt=""
                className="h-40 w-full object-cover"
              />
            </div>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              No cover yet. Upload a JPEG, PNG, or WebP image.
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={uploadingCover || saving}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = "image/jpeg,image/png,image/webp";
                input.onchange = () => {
                  const file = input.files?.[0];
                  if (file) void uploadCover(file);
                };
                input.click();
              }}
            >
              {uploadingCover ? "Uploading…" : "Upload cover"}
            </Button>
            {coverImageUrl ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setCoverImageUrl("")}
              >
                Remove
              </Button>
            ) : null}
          </div>
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="blog-tags">Tags</Label>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs"
              >
                {tag}
                <button
                  type="button"
                  aria-label={`Remove ${tag}`}
                  onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <Input
            id="blog-tags"
            className="mt-2"
            value={tagDraft}
            placeholder="Type a tag and press Enter or comma"
            onChange={(e) => setTagDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTags(tagDraft);
              }
            }}
            onBlur={() => {
              if (tagDraft.trim()) addTags(tagDraft);
            }}
          />
        </div>
        <div className="flex items-center gap-3 sm:col-span-2">
          <Switch
            id="featured"
            checked={isFeatured}
            onCheckedChange={setIsFeatured}
          />
          <Label htmlFor="featured">Featured post</Label>
        </div>
        <div className="flex items-center gap-3 sm:col-span-2">
          <Switch
            id="company-news"
            checked={isCompanyNews}
            onCheckedChange={setIsCompanyNews}
          />
          <Label htmlFor="company-news">Company news</Label>
        </div>
      </div>

      <details className="rounded-md border p-4">
        <summary className="cursor-pointer text-sm font-medium">SEO</summary>
        <div className="mt-4 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="meta-title">Meta title</Label>
              <span className="text-xs text-muted-foreground">
                {metaTitle.length}/70
              </span>
            </div>
            <Input
              id="meta-title"
              className="mt-1"
              maxLength={70}
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
            />
          </div>
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="meta-description">Meta description</Label>
              <span className="text-xs text-muted-foreground">
                {metaDescription.length}/160
              </span>
            </div>
            <Textarea
              id="meta-description"
              className="mt-1"
              maxLength={160}
              rows={3}
              value={metaDescription}
              onChange={(e) => setMetaDescription(e.target.value)}
            />
          </div>
        </div>
      </details>

      <Tabs defaultValue="edit">
        <TabsList>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        <TabsContent value="edit">
          <Label>Content</Label>
          <div className="mt-2">
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Write your post…"
              onUploadImage={uploadInlineImage}
            />
          </div>
        </TabsContent>
        <TabsContent value="preview">
          <div
            className={`${BLOG_PROSE_CLASS} rounded-md border p-4`}
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </TabsContent>
      </Tabs>

      <div className="flex flex-wrap items-center gap-2">
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
        {lastSavedAt ? (
          <span className="text-xs text-muted-foreground">
            Last saved {formatSavedAt(lastSavedAt)}
          </span>
        ) : null}
      </div>
    </AdminFormWidth>
  );
}
