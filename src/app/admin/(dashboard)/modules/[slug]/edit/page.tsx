"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { ALLOWED_ROLLOUT_ICON_KEYS } from "@/lib/icon-map";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ModuleCapability, ModuleRolloutStep } from "@/types/module-cms";
import type { Feature } from "@/types/feature";

const MODULE_ICON_KEYS = [
  "clock",
  "users",
  "folder-kanban",
  "building-2",
  "dollar-sign",
  "trending-up",
] as const;

type ModuleForm = {
  id: string;
  slug: string;
  name: string;
  shortDescription: string;
  imageKey: string | null;
  imageUrl: string;
  highlights: string[];
  bestFor: string;
  cardTagline: string;
  iconKey: string;
  videoUrl: string;
  videoCtaTitle: string;
  videoCtaDescription: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaLabel: string;
  aboutTitle: string;
  aboutTag: string;
  aboutDescription: string[];
  aboutContentsJson: string;
  featuresSectionTitle: string;
  features: Feature[];
  capabilities: ModuleCapability[];
  rolloutTag: string;
  rolloutTitleTemplate: string;
  rolloutDescription: string;
  rolloutSteps: ModuleRolloutStep[];
  problemsJson: string;
  useCasesJson: string;
  testimonialsJson: string;
  faqsJson: string;
  testimonialsSectionTag: string;
  testimonialsSectionTitle: string;
  testimonialsSectionDescription: string;
  sortOrder: number;
  published: boolean;
  showInHeroOrbit: boolean;
  orbitRadius: string;
  orbitTilt: string;
  orbitPhase: string;
  orbitSpeed: string;
};

function parseJsonField(raw: string, fallback: unknown): unknown {
  if (!raw.trim()) return fallback;
  return JSON.parse(raw) as unknown;
}

function stringifyJson(value: unknown): string {
  return JSON.stringify(value ?? null, null, 2);
}

function moduleToForm(item: Record<string, unknown>): ModuleForm {
  return {
    id: String(item.id),
    slug: String(item.slug),
    name: String(item.name),
    shortDescription: String(item.shortDescription ?? ""),
    imageKey: (item.imageKey as string | null) ?? null,
    imageUrl: String(item.image ?? ""),
    highlights: (item.highlights as string[]) ?? [],
    bestFor: String(item.bestFor ?? ""),
    cardTagline: String(item.cardTagline ?? ""),
    iconKey: String(item.iconKey ?? "clock"),
    videoUrl: String(item.videoUrl ?? "#"),
    videoCtaTitle: String(item.videoCtaTitle ?? ""),
    videoCtaDescription: String(item.videoCtaDescription ?? ""),
    heroHeadline: String(item.heroHeadline ?? ""),
    heroSubheadline: String(item.heroSubheadline ?? ""),
    heroCtaLabel: String(item.heroCtaLabel ?? ""),
    aboutTitle: String(item.aboutTitle ?? ""),
    aboutTag: String(item.aboutTag ?? ""),
    aboutDescription: (item.aboutDescription as string[]) ?? [],
    aboutContentsJson: stringifyJson(item.aboutContents),
    featuresSectionTitle: String(item.featuresSectionTitle ?? ""),
    features: (item.features as Feature[]) ?? [],
    capabilities: (item.capabilities as ModuleCapability[]) ?? [],
    rolloutTag: String(item.rolloutTag ?? ""),
    rolloutTitleTemplate: String(item.rolloutTitleTemplate ?? ""),
    rolloutDescription: String(item.rolloutDescription ?? ""),
    rolloutSteps: (item.rolloutSteps as ModuleRolloutStep[]) ?? [],
    problemsJson: stringifyJson(item.problems),
    useCasesJson: stringifyJson(item.useCases),
    testimonialsJson: stringifyJson(item.testimonials),
    faqsJson: stringifyJson(item.faqs),
    testimonialsSectionTag: String(item.testimonialsSectionTag ?? ""),
    testimonialsSectionTitle: String(item.testimonialsSectionTitle ?? ""),
    testimonialsSectionDescription: String(
      item.testimonialsSectionDescription ?? "",
    ),
    sortOrder: Number(item.sortOrder ?? 0),
    published: Boolean(item.published),
    showInHeroOrbit: Boolean(item.showInHeroOrbit),
    orbitRadius:
      item.orbitRadius != null ? String(item.orbitRadius) : "",
    orbitTilt: item.orbitTilt != null ? String(item.orbitTilt) : "",
    orbitPhase: item.orbitPhase != null ? String(item.orbitPhase) : "",
    orbitSpeed: item.orbitSpeed != null ? String(item.orbitSpeed) : "",
  };
}

async function uploadModuleImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/admin/modules/upload", {
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
  return { objectKey: data.objectKey, imageUrl: data.imageUrl };
}

export default function EditModulePage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [form, setForm] = useState<ModuleForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ ok: true; item: Record<string, unknown> }>(
        `/api/admin/modules/${slug}`,
      );
      setForm(moduleToForm(data.item));
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to load module",
      );
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      let aboutContents: unknown = null;
      let problems: unknown;
      let useCases: unknown;
      let testimonials: unknown;
      let faqs: unknown;
      try {
        aboutContents = parseJsonField(form.aboutContentsJson, null);
        problems = parseJsonField(form.problemsJson, []);
        useCases = parseJsonField(form.useCasesJson, []);
        testimonials = parseJsonField(form.testimonialsJson, []);
        faqs = parseJsonField(form.faqsJson, []);
      } catch {
        toast.error("Invalid JSON in one of the JSON fields");
        return;
      }

      const payload = {
        slug: form.slug,
        name: form.name,
        shortDescription: form.shortDescription,
        image: form.imageKey,
        highlights: form.highlights.filter((h) => h.trim()),
        bestFor: form.bestFor,
        cardTagline: form.cardTagline.trim() || null,
        iconKey: form.iconKey,
        videoUrl: form.videoUrl,
        videoCtaTitle: form.videoCtaTitle.trim() || null,
        videoCtaDescription: form.videoCtaDescription.trim() || null,
        heroHeadline: form.heroHeadline,
        heroSubheadline: form.heroSubheadline,
        heroCtaLabel: form.heroCtaLabel.trim() || null,
        aboutTitle: form.aboutTitle,
        aboutTag: form.aboutTag.trim() || null,
        aboutDescription: form.aboutDescription.filter((p) => p.trim()),
        aboutContents,
        featuresSectionTitle: form.featuresSectionTitle.trim() || null,
        features: form.features.map((f) => ({
          title: f.title,
          description: f.description,
          icon: f.icon,
          imageKey: f.imageKey,
        })),
        capabilities: form.capabilities,
        rolloutTag: form.rolloutTag.trim() || null,
        rolloutTitleTemplate: form.rolloutTitleTemplate.trim() || null,
        rolloutDescription: form.rolloutDescription.trim() || null,
        rolloutSteps: form.rolloutSteps,
        problems,
        useCases,
        testimonials,
        faqs,
        testimonialsSectionTag: form.testimonialsSectionTag.trim() || null,
        testimonialsSectionTitle: form.testimonialsSectionTitle.trim() || null,
        testimonialsSectionDescription:
          form.testimonialsSectionDescription.trim() || null,
        sortOrder: form.sortOrder,
        published: form.published,
        showInHeroOrbit: form.showInHeroOrbit,
        orbitRadius: form.orbitRadius.trim()
          ? Number(form.orbitRadius)
          : null,
        orbitTilt: form.orbitTilt.trim() ? Number(form.orbitTilt) : null,
        orbitPhase: form.orbitPhase.trim() ? Number(form.orbitPhase) : null,
        orbitSpeed: form.orbitSpeed.trim() ? Number(form.orbitSpeed) : null,
      };

      const data = await adminFetch<{ ok: true; item: Record<string, unknown> }>(
        `/api/admin/modules/${slug}`,
        { method: "PUT", json: payload },
      );
      setForm(moduleToForm(data.item));
      toast.success("Module saved");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to save module",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleModuleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const { objectKey, imageUrl } = await uploadModuleImage(file);
      setForm((f) =>
        f ? { ...f, imageKey: objectKey, imageUrl } : f,
      );
      toast.success("Module image uploaded — save to apply");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleFeatureImageUpload = async (index: number, file: File) => {
    setUploading(true);
    try {
      const { objectKey, imageUrl } = await uploadModuleImage(file);
      setForm((f) => {
        if (!f) return f;
        const features = [...f.features];
        features[index] = {
          ...features[index],
          imageKey: objectKey,
          imageUrl,
        };
        return { ...f, features };
      });
      toast.success("Feature image uploaded — save to apply");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (loading || !form) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Edit {form.name}</h1>
          <p className="font-mono text-sm text-muted-foreground">{form.slug}</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/modules">Back</Link>
          </Button>
          <Button type="button" onClick={save} disabled={saving || uploading}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={form.published}
          onCheckedChange={(v) => setForm({ ...form, published: v })}
        />
        <Label>Published</Label>
      </div>

      <Tabs defaultValue="basics">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="basics">Basics</TabsTrigger>
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="capabilities">Capabilities</TabsTrigger>
          <TabsTrigger value="rollout">Rollout</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="json">JSON</TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="space-y-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Slug</Label>
              <Input
                className="mt-1 font-mono text-sm"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>
            <div>
              <Label>Name</Label>
              <Input
                className="mt-1"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Short description</Label>
              <Textarea
                className="mt-1"
                rows={2}
                value={form.shortDescription}
                onChange={(e) =>
                  setForm({ ...form, shortDescription: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Icon key</Label>
              <select
                className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={form.iconKey}
                onChange={(e) => setForm({ ...form, iconKey: e.target.value })}
              >
                {MODULE_ICON_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Sort order</Label>
              <Input
                className="mt-1"
                type="number"
                value={form.sortOrder}
                onChange={(e) =>
                  setForm({ ...form, sortOrder: Number(e.target.value) || 0 })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Best for</Label>
              <Input
                className="mt-1"
                value={form.bestFor}
                onChange={(e) => setForm({ ...form, bestFor: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Card tagline</Label>
              <Input
                className="mt-1"
                value={form.cardTagline}
                onChange={(e) =>
                  setForm({ ...form, cardTagline: e.target.value })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Highlights (one per line)</Label>
              <Textarea
                className="mt-1 font-mono text-sm"
                rows={4}
                value={form.highlights.join("\n")}
                onChange={(e) =>
                  setForm({
                    ...form,
                    highlights: e.target.value.split("\n"),
                  })
                }
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <Label>Module image</Label>
              {form.imageUrl ? (
                <p className="text-xs text-muted-foreground break-all">
                  {form.imageUrl}
                </p>
              ) : null}
              <Input
                type="file"
                accept="image/avif,image/png,image/webp,image/jpeg"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleModuleImageUpload(file);
                }}
              />
            </div>
            <div className="flex items-center gap-3 sm:col-span-2">
              <Switch
                checked={form.showInHeroOrbit}
                onCheckedChange={(v) =>
                  setForm({ ...form, showInHeroOrbit: v })
                }
              />
              <Label>Show in hero orbit</Label>
            </div>
            {form.showInHeroOrbit ? (
              <>
                <div>
                  <Label>Orbit radius</Label>
                  <Input
                    className="mt-1"
                    value={form.orbitRadius}
                    onChange={(e) =>
                      setForm({ ...form, orbitRadius: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Orbit tilt</Label>
                  <Input
                    className="mt-1"
                    value={form.orbitTilt}
                    onChange={(e) =>
                      setForm({ ...form, orbitTilt: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Orbit phase</Label>
                  <Input
                    className="mt-1"
                    value={form.orbitPhase}
                    onChange={(e) =>
                      setForm({ ...form, orbitPhase: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Orbit speed</Label>
                  <Input
                    className="mt-1"
                    value={form.orbitSpeed}
                    onChange={(e) =>
                      setForm({ ...form, orbitSpeed: e.target.value })
                    }
                  />
                </div>
              </>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="hero" className="space-y-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Hero headline</Label>
              <Input
                className="mt-1"
                value={form.heroHeadline}
                onChange={(e) =>
                  setForm({ ...form, heroHeadline: e.target.value })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Hero subheadline</Label>
              <Textarea
                className="mt-1"
                rows={2}
                value={form.heroSubheadline}
                onChange={(e) =>
                  setForm({ ...form, heroSubheadline: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Hero CTA label</Label>
              <Input
                className="mt-1"
                value={form.heroCtaLabel}
                onChange={(e) =>
                  setForm({ ...form, heroCtaLabel: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Video URL</Label>
              <Input
                className="mt-1"
                value={form.videoUrl}
                onChange={(e) => setForm({ ...form, videoUrl: e.target.value })}
              />
            </div>
            <div>
              <Label>Video CTA title</Label>
              <Input
                className="mt-1"
                value={form.videoCtaTitle}
                onChange={(e) =>
                  setForm({ ...form, videoCtaTitle: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Video CTA description</Label>
              <Textarea
                className="mt-1"
                rows={2}
                value={form.videoCtaDescription}
                onChange={(e) =>
                  setForm({ ...form, videoCtaDescription: e.target.value })
                }
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="about" className="space-y-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>About tag</Label>
              <Input
                className="mt-1"
                value={form.aboutTag}
                onChange={(e) => setForm({ ...form, aboutTag: e.target.value })}
              />
            </div>
            <div>
              <Label>About title</Label>
              <Input
                className="mt-1"
                value={form.aboutTitle}
                onChange={(e) =>
                  setForm({ ...form, aboutTitle: e.target.value })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Label>About description (one paragraph per line)</Label>
              <Textarea
                className="mt-1"
                rows={4}
                value={form.aboutDescription.join("\n")}
                onChange={(e) =>
                  setForm({
                    ...form,
                    aboutDescription: e.target.value.split("\n"),
                  })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Label>About contents (JSON)</Label>
              <Textarea
                className="mt-1 font-mono text-sm"
                rows={8}
                value={form.aboutContentsJson}
                onChange={(e) =>
                  setForm({ ...form, aboutContentsJson: e.target.value })
                }
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="capabilities" className="space-y-4 pt-4">
          {form.capabilities.map((cap, i) => (
            <div key={i} className="space-y-3 rounded-md border p-4">
              <div className="flex justify-between gap-2">
                <p className="text-sm font-medium">Capability {i + 1}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setForm({
                      ...form,
                      capabilities: form.capabilities.filter((_, j) => j !== i),
                    })
                  }
                >
                  Remove
                </Button>
              </div>
              <Input
                placeholder="Title"
                value={cap.title}
                onChange={(e) => {
                  const capabilities = [...form.capabilities];
                  capabilities[i] = { ...cap, title: e.target.value };
                  setForm({ ...form, capabilities });
                }}
              />
              <Textarea
                placeholder="Description"
                rows={2}
                value={cap.description}
                onChange={(e) => {
                  const capabilities = [...form.capabilities];
                  capabilities[i] = { ...cap, description: e.target.value };
                  setForm({ ...form, capabilities });
                }}
              />
              <Input
                placeholder="Href (optional, default #features)"
                value={cap.href ?? ""}
                onChange={(e) => {
                  const capabilities = [...form.capabilities];
                  capabilities[i] = {
                    ...cap,
                    href: e.target.value || undefined,
                  };
                  setForm({ ...form, capabilities });
                }}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setForm({
                ...form,
                capabilities: [
                  ...form.capabilities,
                  { title: "", description: "" },
                ],
              })
            }
          >
            Add capability
          </Button>
        </TabsContent>

        <TabsContent value="rollout" className="space-y-4 pt-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Rollout tag</Label>
              <Input
                className="mt-1"
                value={form.rolloutTag}
                onChange={(e) =>
                  setForm({ ...form, rolloutTag: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Title template ({`{name}`} = module name)</Label>
              <Input
                className="mt-1"
                value={form.rolloutTitleTemplate}
                onChange={(e) =>
                  setForm({ ...form, rolloutTitleTemplate: e.target.value })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Rollout description</Label>
              <Textarea
                className="mt-1"
                rows={2}
                value={form.rolloutDescription}
                onChange={(e) =>
                  setForm({ ...form, rolloutDescription: e.target.value })
                }
              />
            </div>
          </div>
          {form.rolloutSteps.map((step, i) => (
            <div key={i} className="space-y-3 rounded-md border p-4">
              <div className="flex justify-between gap-2">
                <p className="text-sm font-medium">Step {step.step}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setForm({
                      ...form,
                      rolloutSteps: form.rolloutSteps.filter((_, j) => j !== i),
                    })
                  }
                >
                  Remove
                </Button>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input
                  type="number"
                  placeholder="Step number"
                  value={step.step}
                  onChange={(e) => {
                    const rolloutSteps = [...form.rolloutSteps];
                    rolloutSteps[i] = {
                      ...step,
                      step: Number(e.target.value) || 1,
                    };
                    setForm({ ...form, rolloutSteps });
                  }}
                />
                <select
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                  value={step.iconKey}
                  onChange={(e) => {
                    const rolloutSteps = [...form.rolloutSteps];
                    rolloutSteps[i] = { ...step, iconKey: e.target.value };
                    setForm({ ...form, rolloutSteps });
                  }}
                >
                  {ALLOWED_ROLLOUT_ICON_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>
              <Input
                placeholder="Title"
                value={step.title}
                onChange={(e) => {
                  const rolloutSteps = [...form.rolloutSteps];
                  rolloutSteps[i] = { ...step, title: e.target.value };
                  setForm({ ...form, rolloutSteps });
                }}
              />
              <Textarea
                placeholder="Description"
                rows={2}
                value={step.description}
                onChange={(e) => {
                  const rolloutSteps = [...form.rolloutSteps];
                  rolloutSteps[i] = { ...step, description: e.target.value };
                  setForm({ ...form, rolloutSteps });
                }}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setForm({
                ...form,
                rolloutSteps: [
                  ...form.rolloutSteps,
                  {
                    step: form.rolloutSteps.length + 1,
                    title: "",
                    description: "",
                    iconKey: "clipboard-check",
                  },
                ],
              })
            }
          >
            Add rollout step
          </Button>
        </TabsContent>

        <TabsContent value="features" className="space-y-4 pt-4">
          <div>
            <Label>Features section title</Label>
            <Input
              className="mt-1"
              value={form.featuresSectionTitle}
              onChange={(e) =>
                setForm({ ...form, featuresSectionTitle: e.target.value })
              }
            />
          </div>
          {form.features.map((feature, i) => (
            <div key={i} className="space-y-3 rounded-md border p-4">
              <div className="flex justify-between gap-2">
                <p className="text-sm font-medium">Feature {i + 1}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={form.features.length <= 1}
                  onClick={() =>
                    setForm({
                      ...form,
                      features: form.features.filter((_, j) => j !== i),
                    })
                  }
                >
                  Remove
                </Button>
              </div>
              <Input
                placeholder="Title"
                value={feature.title}
                onChange={(e) => {
                  const features = [...form.features];
                  features[i] = { ...feature, title: e.target.value };
                  setForm({ ...form, features });
                }}
              />
              <Textarea
                placeholder="Description"
                rows={3}
                value={feature.description}
                onChange={(e) => {
                  const features = [...form.features];
                  features[i] = { ...feature, description: e.target.value };
                  setForm({ ...form, features });
                }}
              />
              <Input
                placeholder="Icon key"
                value={feature.icon}
                onChange={(e) => {
                  const features = [...form.features];
                  features[i] = { ...feature, icon: e.target.value };
                  setForm({ ...form, features });
                }}
              />
              {feature.imageUrl ? (
                <p className="text-xs text-muted-foreground break-all">
                  {feature.imageUrl}
                </p>
              ) : null}
              <Input
                type="file"
                accept="image/avif,image/png,image/webp,image/jpeg"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleFeatureImageUpload(i, file);
                }}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              setForm({
                ...form,
                features: [
                  ...form.features,
                  { title: "", description: "", icon: "clock" },
                ],
              })
            }
          >
            Add feature
          </Button>
        </TabsContent>

        <TabsContent value="json" className="space-y-4 pt-4">
          <div>
            <Label>Problems (JSON)</Label>
            <Textarea
              className="mt-1 font-mono text-sm"
              rows={6}
              value={form.problemsJson}
              onChange={(e) =>
                setForm({ ...form, problemsJson: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Use cases (JSON)</Label>
            <Textarea
              className="mt-1 font-mono text-sm"
              rows={6}
              value={form.useCasesJson}
              onChange={(e) =>
                setForm({ ...form, useCasesJson: e.target.value })
              }
            />
          </div>
          <div>
            <Label>Testimonials (JSON)</Label>
            <Textarea
              className="mt-1 font-mono text-sm"
              rows={6}
              value={form.testimonialsJson}
              onChange={(e) =>
                setForm({ ...form, testimonialsJson: e.target.value })
              }
            />
          </div>
          <div>
            <Label>FAQs (JSON)</Label>
            <Textarea
              className="mt-1 font-mono text-sm"
              rows={6}
              value={form.faqsJson}
              onChange={(e) => setForm({ ...form, faqsJson: e.target.value })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Testimonials section tag</Label>
              <Input
                className="mt-1"
                value={form.testimonialsSectionTag}
                onChange={(e) =>
                  setForm({ ...form, testimonialsSectionTag: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Testimonials section title</Label>
              <Input
                className="mt-1"
                value={form.testimonialsSectionTitle}
                onChange={(e) =>
                  setForm({
                    ...form,
                    testimonialsSectionTitle: e.target.value,
                  })
                }
              />
            </div>
            <div className="sm:col-span-2">
              <Label>Testimonials section description</Label>
              <Textarea
                className="mt-1"
                rows={2}
                value={form.testimonialsSectionDescription}
                onChange={(e) =>
                  setForm({
                    ...form,
                    testimonialsSectionDescription: e.target.value,
                  })
                }
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
