"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { ABOUT_STORY_DEFAULTS } from "@/lib/about-story-defaults";
import { ALLOWED_ABOUT_ICON_KEYS } from "@/lib/icon-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type StoryForm = {
  imageKey: string | null;
  imageUrl: string;
  imageAlt: string;
  badge: string;
  title: string;
  paragraph1: string;
  paragraph2: string;
  calloutIconKey: string;
  calloutTitle: string;
  calloutBody: string;
  calloutLinkLabel: string;
  calloutLinkUrl: string;
};

const defaultsForm = (): StoryForm => ({
  imageKey: ABOUT_STORY_DEFAULTS.imageKey,
  imageUrl: "",
  imageAlt: ABOUT_STORY_DEFAULTS.imageAlt,
  badge: ABOUT_STORY_DEFAULTS.badge,
  title: ABOUT_STORY_DEFAULTS.title,
  paragraph1: ABOUT_STORY_DEFAULTS.paragraph1,
  paragraph2: ABOUT_STORY_DEFAULTS.paragraph2,
  calloutIconKey: ABOUT_STORY_DEFAULTS.calloutIconKey,
  calloutTitle: ABOUT_STORY_DEFAULTS.calloutTitle,
  calloutBody: ABOUT_STORY_DEFAULTS.calloutBody,
  calloutLinkLabel: ABOUT_STORY_DEFAULTS.calloutLinkLabel,
  calloutLinkUrl: ABOUT_STORY_DEFAULTS.calloutLinkUrl,
});

export function AboutStoryEditor() {
  const [story, setStory] = useState<StoryForm>(defaultsForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{
        ok: true;
        story: StoryForm;
      }>("/api/admin/about/story");
      setStory({
        ...defaultsForm(),
        ...data.story,
        imageKey: data.story.imageKey ?? null,
      });
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to load about story",
      );
      setStory(defaultsForm());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const uploadImage = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    setUploading(true);
    try {
      const res = await fetch("/api/admin/about/story/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      const data = (await res.json()) as {
        ok?: boolean;
        objectKey?: string;
        imageUrl?: string;
        error?: string;
      };
      if (!res.ok || !data.objectKey || !data.imageUrl) {
        throw new Error(data.error ?? "Upload failed");
      }
      setStory((s) => ({
        ...s,
        imageKey: data.objectKey!,
        imageUrl: data.imageUrl!,
      }));
      toast.success("Image uploaded — save to apply");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const data = await adminFetch<{ ok: true; story: StoryForm }>(
        "/api/admin/about/story",
        {
          method: "PUT",
          json: {
            imageKey: story.imageKey,
            imageAlt: story.imageAlt,
            badge: story.badge,
            title: story.title,
            paragraph1: story.paragraph1,
            paragraph2: story.paragraph2,
            calloutIconKey: story.calloutIconKey,
            calloutTitle: story.calloutTitle,
            calloutBody: story.calloutBody,
            calloutLinkLabel: story.calloutLinkLabel,
            calloutLinkUrl: story.calloutLinkUrl,
          },
        },
      );
      setStory({
        ...defaultsForm(),
        ...data.story,
        imageKey: data.story.imageKey ?? null,
      });
      toast.success("Story saved");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to save story",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <div>
          <Label>Story image</Label>
          <div className="mt-2 space-y-3">
            {story.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={story.imageUrl}
                alt={story.imageAlt}
                className="h-40 w-full max-w-md rounded-md border object-cover"
              />
            ) : (
              <p className="text-xs text-muted-foreground">
                Using public Unsplash fallback until an image is uploaded.
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              <Input
                type="file"
                accept="image/avif,image/png,image/webp,image/jpeg"
                disabled={uploading}
                className="max-w-xs"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (!file) return;
                  await uploadImage(file);
                }}
              />
              {story.imageKey ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setStory((s) => ({ ...s, imageKey: null, imageUrl: "" }))
                  }
                >
                  Clear image
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div>
          <Label htmlFor="story-image-alt">Image alt</Label>
          <Input
            id="story-image-alt"
            className="mt-1"
            value={story.imageAlt}
            onChange={(e) => setStory({ ...story, imageAlt: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="story-badge">Badge</Label>
          <Input
            id="story-badge"
            className="mt-1"
            value={story.badge}
            onChange={(e) => setStory({ ...story, badge: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="story-title">Title</Label>
          <Input
            id="story-title"
            className="mt-1"
            value={story.title}
            onChange={(e) => setStory({ ...story, title: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="story-p1">Paragraph 1</Label>
          <Textarea
            id="story-p1"
            className="mt-1"
            rows={4}
            value={story.paragraph1}
            onChange={(e) =>
              setStory({ ...story, paragraph1: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="story-p2">Paragraph 2</Label>
          <Textarea
            id="story-p2"
            className="mt-1"
            rows={4}
            value={story.paragraph2}
            onChange={(e) =>
              setStory({ ...story, paragraph2: e.target.value })
            }
          />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium">Callout</h2>
        <div>
          <Label htmlFor="callout-icon">Icon key</Label>
          <select
            id="callout-icon"
            className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs"
            value={story.calloutIconKey}
            onChange={(e) =>
              setStory({ ...story, calloutIconKey: e.target.value })
            }
          >
            {ALLOWED_ABOUT_ICON_KEYS.map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label htmlFor="callout-title">Title</Label>
          <Input
            id="callout-title"
            className="mt-1"
            value={story.calloutTitle}
            onChange={(e) =>
              setStory({ ...story, calloutTitle: e.target.value })
            }
          />
        </div>
        <div>
          <Label htmlFor="callout-body">
            Body (use {"{link}"} where the link should appear)
          </Label>
          <Textarea
            id="callout-body"
            className="mt-1"
            rows={3}
            value={story.calloutBody}
            onChange={(e) =>
              setStory({ ...story, calloutBody: e.target.value })
            }
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="callout-link-label">Link label</Label>
            <Input
              id="callout-link-label"
              className="mt-1"
              value={story.calloutLinkLabel}
              onChange={(e) =>
                setStory({ ...story, calloutLinkLabel: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="callout-link-url">Link URL</Label>
            <Input
              id="callout-link-url"
              className="mt-1"
              value={story.calloutLinkUrl}
              onChange={(e) =>
                setStory({ ...story, calloutLinkUrl: e.target.value })
              }
            />
          </div>
        </div>
      </section>

      <Button type="button" onClick={save} disabled={saving || uploading}>
        {saving ? "Saving…" : "Save story"}
      </Button>
    </div>
  );
}
