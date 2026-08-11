"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { AdminFormWidth } from "@/components/admin/AdminFormWidth";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  DEFAULT_MODULE_ROLLOUT_SECTION,
  DEFAULT_MODULE_ROLLOUT_STEPS,
} from "@/lib/contact-page-defaults";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewModulePage() {
  const router = useRouter();
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const create = async () => {
    if (!slug.trim() || !name.trim()) {
      toast.error("Slug and name are required");
      return;
    }
    setCreating(true);
    try {
      const data = await adminFetch<{ ok: true; item: { slug: string } }>(
        "/api/admin/modules",
        {
          method: "POST",
          json: {
            slug: slug.trim(),
            name: name.trim(),
            shortDescription: "Short description for this module.",
            highlights: ["Highlight one"],
            bestFor: "Teams looking for a modern ERP module",
            iconKey: "clock",
            videoUrl: "#",
            heroHeadline: name.trim(),
            heroSubheadline: "Module hero subheadline.",
            aboutTitle: `About ${name.trim()}`,
            aboutDescription: ["About paragraph one."],
            features: [
              {
                title: "Feature one",
                description: "Feature description.",
                icon: "clock",
              },
            ],
            capabilities: [],
            rolloutTag: DEFAULT_MODULE_ROLLOUT_SECTION.tag,
            rolloutTitleTemplate: DEFAULT_MODULE_ROLLOUT_SECTION.titleTemplate,
            rolloutDescription: DEFAULT_MODULE_ROLLOUT_SECTION.description,
            rolloutSteps: [...DEFAULT_MODULE_ROLLOUT_STEPS],
            problems: [],
            useCases: [],
            testimonials: [],
            faqs: [],
            published: false,
          },
        },
      );
      toast.success("Module created");
      router.push(`/admin/modules/${data.item.slug}/edit`);
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to create module",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <AdminPage spacing="md">
      <AdminFormWidth size="sm" className="space-y-6">
      <AdminPageHeader
        title="New module"
        description="Creates a draft module with placeholder content."
        actions={
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/modules">Back</Link>
          </Button>
        }
      />
      <div className="space-y-4 rounded-md border p-4">
        <div>
          <Label>Name</Label>
          <Input
            className="mt-1"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Attendance"
          />
        </div>
        <div>
          <Label>Slug</Label>
          <Input
            className="mt-1 font-mono text-sm"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="attendance"
          />
        </div>
        <Button type="button" onClick={create} disabled={creating}>
          {creating ? "Creating…" : "Create module"}
        </Button>
      </div>
      </AdminFormWidth>
    </AdminPage>
  );
}
