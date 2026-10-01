"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { AdminFetchError, adminFetch, adminUpload } from "@/lib/admin-fetch";
import { Badge } from "@/components/ui/badge";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const MAX_BYTES = 500 * 1024 * 1024;
const ALLOWED_TYPES = ["video/mp4", "video/webm"] as const;

function resolveVideoContentType(file: File): (typeof ALLOWED_TYPES)[number] | null {
  if (ALLOWED_TYPES.includes(file.type as (typeof ALLOWED_TYPES)[number])) {
    return file.type as (typeof ALLOWED_TYPES)[number];
  }
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext === "mp4") return "video/mp4";
  if (ext === "webm") return "video/webm";
  return null;
}

type DemoVideo = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  moduleSlug: string | null;
  status: "DRAFT" | "PUBLISHED";
  sortOrder: number;
  contentType: string;
  publishedAt: string | null;
};

export default function DemoVideosAdminPage() {
  const [videos, setVideos] = useState<DemoVideo[]>([]);
  const [moduleSlugs, setModuleSlugs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [moduleSlug, setModuleSlug] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [videoData, modulesData] = await Promise.all([
        adminFetch<{ ok: true; videos: DemoVideo[] }>(
          "/api/demo-videos/admin",
        ),
        fetch("/api/modules")
          .then((r) =>
            r.json() as Promise<{ modules?: { slug: string }[] }>,
          )
          .catch(() => ({ modules: [] as { slug: string }[] })),
      ]);
      setVideos(videoData.videos);
      const slugs = (modulesData.modules ?? []).map(
        (m: { slug: string }) => m.slug,
      );
      setModuleSlugs(slugs);
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to load videos",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const uploadFile = async (file: File) => {
    const contentType = resolveVideoContentType(file);
    if (!contentType) {
      toast.error("Only MP4 and WebM videos are allowed");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("File must be under 500MB");
      return;
    }
    if (!slug.trim() || !title.trim()) {
      toast.error("Slug and title are required before upload");
      return;
    }

    setUploading(true);
    try {
      const init = await adminFetch<{
        ok: true;
        video: { id: string };
      }>("/api/demo-videos/upload", {
        method: "POST",
        json: {
          slug: slug.trim(),
          title: title.trim(),
          contentType,
          fileName: file.name,
          ...(moduleSlug ? { moduleSlug } : {}),
        },
      });

      const formData = new FormData();
      formData.append("file", file);

      await adminUpload(`/api/demo-videos/${init.video.id}/upload`, formData);

      await adminFetch(`/api/demo-videos/${init.video.id}`, {
        method: "PATCH",
        json: { status: "PUBLISHED" },
      });

      toast.success("Video uploaded and published");
      setSlug("");
      setTitle("");
      setModuleSlug("");
      await load();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Upload failed",
      );
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const togglePublish = async (video: DemoVideo) => {
    const next = video.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
    try {
      const data = await adminFetch<{ ok: true; video: DemoVideo }>(
        `/api/demo-videos/${video.id}`,
        { method: "PATCH", json: { status: next } },
      );
      setVideos((prev) =>
        prev.map((v) => (v.id === video.id ? data.video : v)),
      );
      toast.success(next === "PUBLISHED" ? "Published" : "Unpublished");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to update video",
      );
    }
  };

  const updateMeta = async (
    video: DemoVideo,
    fields: { title?: string; sortOrder?: number },
  ) => {
    try {
      const data = await adminFetch<{ ok: true; video: DemoVideo }>(
        `/api/demo-videos/${video.id}`,
        { method: "PATCH", json: fields },
      );
      setVideos((prev) =>
        prev.map((v) => (v.id === video.id ? data.video : v)),
      );
      toast.success("Video updated");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to update video",
      );
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Demo videos</h1>
        <p className="text-sm text-muted-foreground">
          Upload videos to R2 via server upload.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <Label>Slug (kebab-case)</Label>
          <Input
            className="mt-1"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="my-demo-video"
          />
        </div>
        <div>
          <Label>Title</Label>
          <Input
            className="mt-1"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <Label>Module (optional)</Label>
          <Select
            value={moduleSlug || "__none__"}
            onValueChange={(v) => setModuleSlug(v === "__none__" ? "" : v)}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="None" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">None</SelectItem>
              {moduleSlugs.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div
        role="button"
        tabIndex={0}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") fileRef.current?.click();
        }}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors ${
          dragOver ? "border-primary bg-muted" : "border-border"
        }`}
      >
        <input
          ref={fileRef}
          type="file"
          accept="video/mp4,video/webm"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadFile(file);
            e.target.value = "";
          }}
        />
        <p className="font-medium">
          {uploading ? "Uploading…" : "Drop MP4/WebM here or click to browse"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Max 500MB</p>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading videos…</p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Order</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {videos.map((video) => (
                <TableRow key={video.id}>
                  <TableCell data-label="Title">
                    <Input
                      defaultValue={video.title}
                      onBlur={(e) => {
                        if (e.target.value !== video.title) {
                          updateMeta(video, { title: e.target.value });
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-sm" data-label="Slug">
                    {video.slug}
                  </TableCell>
                  <TableCell data-label="Module">
                    {video.moduleSlug ?? "—"}
                  </TableCell>
                  <TableCell data-label="Status">
                    <Badge
                      variant={
                        video.status === "PUBLISHED" ? "default" : "outline"
                      }
                    >
                      {video.status}
                    </Badge>
                  </TableCell>
                  <TableCell data-label="Order">
                    <Input
                      type="number"
                      className="w-20"
                      defaultValue={video.sortOrder}
                      onBlur={(e) => {
                        const n = Number(e.target.value);
                        if (n !== video.sortOrder) {
                          updateMeta(video, { sortOrder: n });
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell className="max-md:justify-end">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => togglePublish(video)}
                    >
                      {video.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
