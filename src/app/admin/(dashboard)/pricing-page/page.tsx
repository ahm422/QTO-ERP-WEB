"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { FAQ_PAGE_KEY_PRICING } from "@/lib/faqs-defaults";
import { PRICING_PAGE_CONTENT_DEFAULTS } from "@/lib/pricing-page-defaults";
import type { PricingPageContent } from "@/types/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

function pageFromDefaults(): PricingPageContent {
  const d = PRICING_PAGE_CONTENT_DEFAULTS;
  return {
    heroBadge: d.heroBadge,
    heroTitle: d.heroTitle,
    heroSubtitle: d.heroSubtitle,
    faqTag: d.faqTag,
    faqTitle: d.faqTitle,
  };
}

export default function PricingPageAdminPage() {
  const [page, setPage] = useState<PricingPageContent>(pageFromDefaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ ok: true; page: PricingPageContent }>(
        "/api/admin/pricing-page",
      );
      setPage(data.page);
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to load pricing page",
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
      const data = await adminFetch<{ ok: true; page: PricingPageContent }>(
        "/api/admin/pricing-page",
        {
          method: "PUT",
          json: page,
        },
      );
      setPage(data.page);
      toast.success("Pricing page saved");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to save pricing page",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold">Pricing page</h1>
        <p className="text-sm text-muted-foreground">
          Hero copy and FAQ section header for{" "}
          <code className="text-xs">/pricing</code>. Manage FAQ questions at{" "}
          <Link
            href={`/admin/faqs?pageKey=${FAQ_PAGE_KEY_PRICING}`}
            className="underline underline-offset-2"
          >
            FAQs (pricing)
          </Link>
          . Plans and comparison use their own screens.
        </p>
      </div>

      <section className="space-y-4 rounded-md border p-4">
        <h2 className="text-lg font-medium">Hero</h2>
        <div className="grid gap-4">
          <div>
            <Label htmlFor="hero-badge">Badge</Label>
            <Input
              id="hero-badge"
              className="mt-1"
              value={page.heroBadge}
              onChange={(e) =>
                setPage((p) => ({ ...p, heroBadge: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="hero-title">Title</Label>
            <Input
              id="hero-title"
              className="mt-1"
              value={page.heroTitle}
              onChange={(e) =>
                setPage((p) => ({ ...p, heroTitle: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="hero-subtitle">Subtitle</Label>
            <Textarea
              id="hero-subtitle"
              className="mt-1"
              rows={2}
              value={page.heroSubtitle}
              onChange={(e) =>
                setPage((p) => ({ ...p, heroSubtitle: e.target.value }))
              }
            />
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-md border p-4">
        <h2 className="text-lg font-medium">FAQ section header</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="faq-tag">Tag</Label>
            <Input
              id="faq-tag"
              className="mt-1"
              value={page.faqTag}
              onChange={(e) =>
                setPage((p) => ({ ...p, faqTag: e.target.value }))
              }
            />
          </div>
          <div>
            <Label htmlFor="faq-title">Title</Label>
            <Input
              id="faq-title"
              className="mt-1"
              value={page.faqTitle}
              onChange={(e) =>
                setPage((p) => ({ ...p, faqTitle: e.target.value }))
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
