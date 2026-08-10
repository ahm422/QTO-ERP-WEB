"use client";

/**
 * Solution editor — audience, problems, and testimonial are admin-editable here
 * but not yet rendered on the public /solution/[slug] page. The hero visual is
 * an intentional decorative placeholder on the public page.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type ModuleOption = {
  id: string;
  slug: string;
  name: string;
};

type SolutionForm = {
  id: string;
  slug: string;
  title: string;
  audience: string;
  heroHeadline: string;
  heroSubheadline: string;
  problemsJson: string;
  recommendedModules: string[];
  useCasesJson: string;
  testimonialJson: string;
  solutionFaqsJson: string;
  sortOrder: number;
  published: boolean;
};

function stringifyJson(value: unknown): string {
  return JSON.stringify(value ?? null, null, 2);
}

function parseJsonField(raw: string, fallback: unknown): unknown {
  if (!raw.trim()) return fallback;
  return JSON.parse(raw) as unknown;
}

function solutionToForm(item: Record<string, unknown>): SolutionForm {
  return {
    id: String(item.id),
    slug: String(item.slug),
    title: String(item.title),
    audience: String(item.audience ?? ""),
    heroHeadline: String(item.heroHeadline ?? ""),
    heroSubheadline: String(item.heroSubheadline ?? ""),
    problemsJson: stringifyJson(item.problems),
    recommendedModules: (item.recommendedModules as string[]) ?? [],
    useCasesJson: stringifyJson(item.useCases),
    testimonialJson: stringifyJson(item.testimonial),
    solutionFaqsJson: stringifyJson(item.solutionFaqs),
    sortOrder: Number(item.sortOrder ?? 0),
    published: Boolean(item.published),
  };
}

export default function EditSolutionPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [form, setForm] = useState<SolutionForm | null>(null);
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [solutionData, modulesData] = await Promise.all([
        adminFetch<{ ok: true; item: Record<string, unknown> }>(
          `/api/admin/solutions/${slug}`,
        ),
        adminFetch<{ ok: true; items: ModuleOption[] }>("/api/admin/modules"),
      ]);
      setForm(solutionToForm(solutionData.item));
      setModules(modulesData.items);
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to load solution",
      );
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleModule = (moduleSlug: string, checked: boolean) => {
    if (!form) return;
    setForm({
      ...form,
      recommendedModules: checked
        ? [...form.recommendedModules, moduleSlug]
        : form.recommendedModules.filter((s) => s !== moduleSlug),
    });
  };

  const save = async () => {
    if (!form) return;
    setSaving(true);
    try {
      let problems: unknown;
      let useCases: unknown;
      let testimonial: unknown;
      let solutionFaqs: unknown;
      try {
        problems = parseJsonField(form.problemsJson, []);
        useCases = parseJsonField(form.useCasesJson, []);
        testimonial = parseJsonField(form.testimonialJson, {
          quote: "",
          author: "",
          role: "",
        });
        solutionFaqs = parseJsonField(form.solutionFaqsJson, []);
      } catch {
        toast.error("Invalid JSON in one of the JSON fields");
        return;
      }

      const data = await adminFetch<{ ok: true; item: Record<string, unknown> }>(
        `/api/admin/solutions/${slug}`,
        {
          method: "PUT",
          json: {
            slug: form.slug,
            title: form.title,
            audience: form.audience,
            heroHeadline: form.heroHeadline,
            heroSubheadline: form.heroSubheadline,
            problems,
            recommendedModules: form.recommendedModules,
            useCases,
            testimonial,
            solutionFaqs,
            sortOrder: form.sortOrder,
            published: form.published,
          },
        },
      );
      setForm(solutionToForm(data.item));
      toast.success("Solution saved");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError ? err.message : "Failed to save solution",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Edit {form.title}</h1>
          <p className="font-mono text-sm text-muted-foreground">{form.slug}</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/solutions">Back</Link>
          </Button>
          <Button type="button" onClick={save} disabled={saving}>
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
          <Label>Title</Label>
          <Input
            className="mt-1"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div className="sm:col-span-2">
          <Label>Audience</Label>
          <Input
            className="mt-1"
            value={form.audience}
            onChange={(e) => setForm({ ...form, audience: e.target.value })}
          />
        </div>
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
      </div>

      <div className="space-y-3 rounded-md border p-4">
        <Label>Recommended modules</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {modules.map((mod) => (
            <label
              key={mod.id}
              className="flex items-center gap-2 text-sm"
            >
              <Checkbox
                checked={form.recommendedModules.includes(mod.slug)}
                onCheckedChange={(checked) =>
                  toggleModule(mod.slug, checked === true)
                }
              />
              <span>
                {mod.name}{" "}
                <span className="font-mono text-xs text-muted-foreground">
                  ({mod.slug})
                </span>
              </span>
            </label>
          ))}
        </div>
        {modules.length === 0 ? (
          <p className="text-sm text-muted-foreground">No modules available.</p>
        ) : null}
      </div>

      <div>
        <Label>Problems (JSON)</Label>
        <Textarea
          className="mt-1 font-mono text-sm"
          rows={6}
          value={form.problemsJson}
          onChange={(e) => setForm({ ...form, problemsJson: e.target.value })}
        />
      </div>
      <div>
        <Label>Use cases (JSON)</Label>
        <Textarea
          className="mt-1 font-mono text-sm"
          rows={6}
          value={form.useCasesJson}
          onChange={(e) => setForm({ ...form, useCasesJson: e.target.value })}
        />
      </div>
      <div>
        <Label>Testimonial (JSON)</Label>
        <Textarea
          className="mt-1 font-mono text-sm"
          rows={4}
          value={form.testimonialJson}
          onChange={(e) =>
            setForm({ ...form, testimonialJson: e.target.value })
          }
        />
      </div>
      <div>
        <Label>Solution FAQs (JSON)</Label>
        <Textarea
          className="mt-1 font-mono text-sm"
          rows={6}
          value={form.solutionFaqsJson}
          onChange={(e) =>
            setForm({ ...form, solutionFaqsJson: e.target.value })
          }
        />
      </div>
    </div>
  );
}
