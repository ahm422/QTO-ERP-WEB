"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { AdminFormWidth } from "@/components/admin/AdminFormWidth";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HOME_FINAL_CTA_DEFAULTS } from "@/lib/home-cta-defaults";
import type { HomeFinalCta } from "@/types/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function HomeCtaAdminPage() {
  const [cta, setCta] = useState<HomeFinalCta>({ ...HOME_FINAL_CTA_DEFAULTS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ ok: true; cta: HomeFinalCta }>(
        "/api/admin/home-cta",
      );
      setCta({ ...HOME_FINAL_CTA_DEFAULTS, ...data.cta });
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to load home CTA",
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
        "/api/admin/home-cta",
        {
          method: "PUT",
          json: cta,
        },
      );
      setCta({ ...HOME_FINAL_CTA_DEFAULTS, ...data.cta });
      toast.success("Home CTA saved");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to save home CTA",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <AdminPage>
      <AdminFormWidth size="md" className="space-y-8">
      <AdminPageHeader
        title="Home final CTA"
        description="Edit the closing CTA band on the home page (site_settings key home_final_cta)."
      />

      <section className="space-y-4">
        <div>
          <Label htmlFor="cta-tag">Tag / eyebrow</Label>
          <Input
            id="cta-tag"
            className="mt-1"
            value={cta.tag}
            onChange={(e) => setCta({ ...cta, tag: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="cta-title">Title</Label>
          <Input
            id="cta-title"
            className="mt-1"
            value={cta.title}
            onChange={(e) => setCta({ ...cta, title: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="cta-description">Description</Label>
          <Textarea
            id="cta-description"
            className="mt-1"
            rows={3}
            value={cta.description}
            onChange={(e) => setCta({ ...cta, description: e.target.value })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="cta-primary-label">Primary CTA label</Label>
            <Input
              id="cta-primary-label"
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
            <Label htmlFor="cta-primary-url">Primary CTA URL</Label>
            <Input
              id="cta-primary-url"
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
            <Label htmlFor="cta-secondary-label">Secondary CTA label</Label>
            <Input
              id="cta-secondary-label"
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
            <Label htmlFor="cta-secondary-url">Secondary CTA URL</Label>
            <Input
              id="cta-secondary-url"
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
      </section>
      </AdminFormWidth>
    </AdminPage>
  );
}
