"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { ABOUT_FINAL_CTA_DEFAULTS } from "@/lib/about-cta-defaults";
import type { HomeFinalCta } from "@/types/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AboutCtaEditor() {
  const [cta, setCta] = useState<HomeFinalCta>({
    ...ABOUT_FINAL_CTA_DEFAULTS,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ ok: true; cta: HomeFinalCta }>(
        "/api/admin/about/cta",
      );
      setCta({ ...ABOUT_FINAL_CTA_DEFAULTS, ...data.cta });
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to load about CTA",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    try {
      const data = await adminFetch<{ ok: true; cta: HomeFinalCta }>(
        "/api/admin/about/cta",
        {
          method: "PUT",
          json: cta,
        },
      );
      setCta({ ...ABOUT_FINAL_CTA_DEFAULTS, ...data.cta });
      toast.success("About CTA saved");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to save about CTA",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Closing CTA on /about (site_settings key about_final_cta).
      </p>

      <div>
        <Label htmlFor="about-cta-tag">Tag / eyebrow</Label>
        <Input
          id="about-cta-tag"
          className="mt-1"
          value={cta.tag}
          onChange={(e) => setCta({ ...cta, tag: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="about-cta-title">Title</Label>
        <Input
          id="about-cta-title"
          className="mt-1"
          value={cta.title}
          onChange={(e) => setCta({ ...cta, title: e.target.value })}
        />
      </div>
      <div>
        <Label htmlFor="about-cta-description">Description</Label>
        <Textarea
          id="about-cta-description"
          className="mt-1"
          rows={3}
          value={cta.description}
          onChange={(e) => setCta({ ...cta, description: e.target.value })}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="about-cta-primary-label">Primary CTA label</Label>
          <Input
            id="about-cta-primary-label"
            className="mt-1"
            value={cta.primaryCta.label}
            onChange={(e) =>
              setCta({
                ...cta,
                primaryCta: { ...cta.primaryCta, label: e.target.value },
              })
            }
          />
        </div>
        <div>
          <Label htmlFor="about-cta-primary-url">Primary CTA URL</Label>
          <Input
            id="about-cta-primary-url"
            className="mt-1"
            value={cta.primaryCta.url}
            onChange={(e) =>
              setCta({
                ...cta,
                primaryCta: { ...cta.primaryCta, url: e.target.value },
              })
            }
          />
        </div>
        <div>
          <Label htmlFor="about-cta-secondary-label">Secondary CTA label</Label>
          <Input
            id="about-cta-secondary-label"
            className="mt-1"
            value={cta.secondaryCta.label}
            onChange={(e) =>
              setCta({
                ...cta,
                secondaryCta: { ...cta.secondaryCta, label: e.target.value },
              })
            }
          />
        </div>
        <div>
          <Label htmlFor="about-cta-secondary-url">Secondary CTA URL</Label>
          <Input
            id="about-cta-secondary-url"
            className="mt-1"
            value={cta.secondaryCta.url}
            onChange={(e) =>
              setCta({
                ...cta,
                secondaryCta: { ...cta.secondaryCta, url: e.target.value },
              })
            }
          />
        </div>
      </div>

      <Button type="button" onClick={save} disabled={saving}>
        {saving ? "Saving…" : "Save CTA"}
      </Button>
    </div>
  );
}
