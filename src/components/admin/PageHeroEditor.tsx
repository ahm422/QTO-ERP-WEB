"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import {
  pageHeroFromDefaults,
  type PageHeroPageKey,
} from "@/lib/page-hero-defaults";
import type { PageHeroContent } from "@/types/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type PageHeroEditorProps = {
  pageKey: PageHeroPageKey;
};

export function PageHeroEditor({ pageKey }: PageHeroEditorProps) {
  const [hero, setHero] = useState<PageHeroContent>(() =>
    pageHeroFromDefaults(pageKey),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{
        ok: true;
        pageKey: string;
        hero: PageHeroContent;
      }>(`/api/admin/page-hero?pageKey=${encodeURIComponent(pageKey)}`);
      setHero(data.hero);
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to load page hero",
      );
      setHero(pageHeroFromDefaults(pageKey));
    } finally {
      setLoading(false);
    }
  }, [pageKey]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const data = await adminFetch<{
        ok: true;
        pageKey: string;
        hero: PageHeroContent;
      }>(`/api/admin/page-hero?pageKey=${encodeURIComponent(pageKey)}`, {
        method: "PUT",
        json: hero,
      });
      setHero(data.hero);
      toast.success("Page hero saved");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to save page hero",
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
      <section className="space-y-4 rounded-md border p-4">
        <h2 className="text-lg font-medium">Hero copy</h2>
        <div className="grid gap-4">
          <div>
            <Label htmlFor={`eyebrow-${pageKey}`}>Eyebrow</Label>
            <Input
              id={`eyebrow-${pageKey}`}
              className="mt-1"
              value={hero.eyebrow}
              onChange={(e) =>
                setHero((h) => ({ ...h, eyebrow: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor={`title-${pageKey}`}>Title</Label>
            <Input
              id={`title-${pageKey}`}
              className="mt-1"
              value={hero.title}
              onChange={(e) =>
                setHero((h) => ({ ...h, title: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor={`subtitle-${pageKey}`}>Subtitle</Label>
            <Textarea
              id={`subtitle-${pageKey}`}
              className="mt-1"
              rows={3}
              value={hero.subtitle}
              onChange={(e) =>
                setHero((h) => ({ ...h, subtitle: e.target.value }))
              }
            />
          </div>
        </div>
      </section>

      <Button type="button" onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save"}
      </Button>
    </div>
  );
}
