"use client";

/**
 * Solution editor — audience, problems, and testimonial are admin-editable here
 * but not yet rendered on the public /solution/[slug] page. The hero visual is
 * an intentional decorative placeholder on the public page.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { AdminFetchError, adminFetch, adminUpload } from "@/lib/admin-fetch";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type {
  SolutionProblem,
  SolutionUseCase,
  SolutionUseCaseFeature,
} from "@/types/solution";

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
  problems: SolutionProblem[];
  recommendedModules: string[];
  useCases: SolutionUseCase[];
  testimonialJson: string;
  solutionFaqsJson: string;
  // CMS page-copy overrides (blank = use code default)
  heroEyebrow: string;
  heroImageKey: string;
  heroImageUrl: string;
  heroImageAlt: string;
  heroCaption: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaHref: string;
  tabsIntroTag: string;
  tabsIntroTitle: string;
  tabsIntroDescription: string;
  tabImageFallback: string;
  recommendedTag: string;
  recommendedTitle: string;
  recommendedDescription: string;
  faqTag: string;
  faqTitle: string;
  ctaEyebrow: string;
  ctaHeadline: string;
  ctaDescription: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  metaTitle: string;
  metaDescription: string;
  sortOrder: number;
  published: boolean;
};

/** Keys on SolutionForm that are plain optional copy-override strings. */
const SOLUTION_COPY_KEYS = [
  "heroEyebrow",
  "heroImageAlt",
  "heroCaption",
  "heroPrimaryCtaLabel",
  "heroPrimaryCtaHref",
  "heroSecondaryCtaLabel",
  "heroSecondaryCtaHref",
  "tabsIntroTag",
  "tabsIntroTitle",
  "tabsIntroDescription",
  "tabImageFallback",
  "recommendedTag",
  "recommendedTitle",
  "recommendedDescription",
  "faqTag",
  "faqTitle",
  "ctaEyebrow",
  "ctaHeadline",
  "ctaDescription",
  "ctaPrimaryLabel",
  "ctaPrimaryHref",
  "ctaSecondaryLabel",
  "ctaSecondaryHref",
  "metaTitle",
  "metaDescription",
] as const;

function stringifyJson(value: unknown): string {
  return JSON.stringify(value ?? null, null, 2);
}

function parseJsonField(raw: string, fallback: unknown): unknown {
  if (!raw.trim()) return fallback;
  return JSON.parse(raw) as unknown;
}

function asProblems(value: unknown): SolutionProblem[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (!item || typeof item !== "object") {
      return { title: "", description: "" };
    }
    const row = item as Record<string, unknown>;
    return {
      title: String(row.title ?? ""),
      description: String(row.description ?? ""),
    };
  });
}

function asUseCases(value: unknown): SolutionUseCase[] {
  if (!Array.isArray(value)) return [];
  return value.map((item) => {
    if (!item || typeof item !== "object") {
      return emptyUseCase();
    }
    const row = item as Record<string, unknown>;
    const useCase: SolutionUseCase = {
      slug: String(row.slug ?? ""),
      industry: String(row.industry ?? ""),
      description: String(row.description ?? ""),
      specificNeeds: Array.isArray(row.specificNeeds)
        ? row.specificNeeds.map((need) => String(need))
        : [],
    };
    if (Array.isArray(row.subNav)) {
      useCase.subNav = row.subNav.map((nav) => String(nav));
    }
    if (Array.isArray(row.features)) {
      useCase.features = row.features as SolutionUseCaseFeature[];
    }
    return useCase;
  });
}

function emptyUseCase(): SolutionUseCase {
  return {
    slug: "",
    industry: "",
    description: "",
    specificNeeds: [],
  };
}

function validateSolutionRows(form: SolutionForm): string | null {
  for (const problem of form.problems) {
    if (!problem.title.trim() || !problem.description.trim()) {
      return "Each problem needs a title and description. Remove empty rows or fill them in.";
    }
  }
  for (const useCase of form.useCases) {
    if (
      !useCase.slug.trim() ||
      !useCase.industry.trim() ||
      !useCase.description.trim()
    ) {
      return "Each use case needs a slug, industry, and description. Remove empty rows or fill them in.";
    }
  }
  return null;
}

function solutionToForm(item: Record<string, unknown>): SolutionForm {
  return {
    id: String(item.id),
    slug: String(item.slug),
    title: String(item.title),
    audience: String(item.audience ?? ""),
    heroHeadline: String(item.heroHeadline ?? ""),
    heroSubheadline: String(item.heroSubheadline ?? ""),
    problems: asProblems(item.problems),
    recommendedModules: (item.recommendedModules as string[]) ?? [],
    useCases: asUseCases(item.useCases),
    testimonialJson: stringifyJson(item.testimonial),
    solutionFaqsJson: stringifyJson(item.solutionFaqs),
    heroEyebrow: String(item.heroEyebrow ?? ""),
    heroImageKey: String(item.heroImage ?? ""),
    heroImageUrl: String(item.heroImageUrl ?? ""),
    heroImageAlt: String(item.heroImageAlt ?? ""),
    heroCaption: String(item.heroCaption ?? ""),
    heroPrimaryCtaLabel: String(item.heroPrimaryCtaLabel ?? ""),
    heroPrimaryCtaHref: String(item.heroPrimaryCtaHref ?? ""),
    heroSecondaryCtaLabel: String(item.heroSecondaryCtaLabel ?? ""),
    heroSecondaryCtaHref: String(item.heroSecondaryCtaHref ?? ""),
    tabsIntroTag: String(item.tabsIntroTag ?? ""),
    tabsIntroTitle: String(item.tabsIntroTitle ?? ""),
    tabsIntroDescription: String(item.tabsIntroDescription ?? ""),
    tabImageFallback: String(item.tabImageFallback ?? ""),
    recommendedTag: String(item.recommendedTag ?? ""),
    recommendedTitle: String(item.recommendedTitle ?? ""),
    recommendedDescription: String(item.recommendedDescription ?? ""),
    faqTag: String(item.faqTag ?? ""),
    faqTitle: String(item.faqTitle ?? ""),
    ctaEyebrow: String(item.ctaEyebrow ?? ""),
    ctaHeadline: String(item.ctaHeadline ?? ""),
    ctaDescription: String(item.ctaDescription ?? ""),
    ctaPrimaryLabel: String(item.ctaPrimaryLabel ?? ""),
    ctaPrimaryHref: String(item.ctaPrimaryHref ?? ""),
    ctaSecondaryLabel: String(item.ctaSecondaryLabel ?? ""),
    ctaSecondaryHref: String(item.ctaSecondaryHref ?? ""),
    metaTitle: String(item.metaTitle ?? ""),
    metaDescription: String(item.metaDescription ?? ""),
    sortOrder: Number(item.sortOrder ?? 0),
    published: Boolean(item.published),
  };
}

async function uploadSolutionImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  const data = await adminUpload<{
    ok?: boolean;
    objectKey?: string;
    imageUrl?: string;
  }>("/api/admin/solutions/upload", formData);
  if (!data.objectKey || !data.imageUrl) {
    throw new Error("Upload failed");
  }
  return { objectKey: data.objectKey, imageUrl: data.imageUrl };
}

export default function EditSolutionPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const [form, setForm] = useState<SolutionForm | null>(null);
  const [modules, setModules] = useState<ModuleOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const rowError = useMemo(
    () => (form ? validateSolutionRows(form) : null),
    [form],
  );

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
    const error = validateSolutionRows(form);
    if (error) {
      toast.error(error);
      return;
    }
    setSaving(true);
    try {
      let testimonial: unknown;
      let solutionFaqs: unknown;
      try {
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

      const problems = form.problems.map((problem) => ({
        title: problem.title.trim(),
        description: problem.description.trim(),
      }));
      const useCases = form.useCases.map((useCase) => ({
        ...useCase,
        slug: useCase.slug.trim(),
        industry: useCase.industry.trim(),
        description: useCase.description.trim(),
      }));

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
            heroImage: form.heroImageKey.trim() || null,
            ...Object.fromEntries(
              SOLUTION_COPY_KEYS.map((key) => [
                key,
                form[key].trim() || null,
              ]),
            ),
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
          <Button
            type="button"
            onClick={save}
            disabled={saving || Boolean(rowError)}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>

      {rowError ? (
        <p className="text-sm text-destructive" role="alert">
          {rowError}
        </p>
      ) : null}

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

      <details className="rounded-md border p-4" open>
        <summary className="cursor-pointer text-sm font-medium">
          Page copy &amp; SEO
        </summary>
        <p className="mt-2 text-sm text-muted-foreground">
          Section labels and marketing copy for this solution&apos;s page. Leave
          a field blank to use the built-in default.
        </p>

        <div className="mt-4 space-y-3 rounded-md border p-3">
          <Label>Hero image</Label>
          {form.heroImageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={form.heroImageUrl}
              alt=""
              className="h-32 w-full rounded-md object-cover"
            />
          ) : (
            <p className="text-xs text-muted-foreground">
              No image — the gradient placeholder is shown.
            </p>
          )}
          <input
            type="file"
            accept="image/avif,image/png,image/webp,image/jpeg"
            className="block text-sm"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              try {
                const { objectKey, imageUrl } = await uploadSolutionImage(file);
                setForm((f) =>
                  f
                    ? { ...f, heroImageKey: objectKey, heroImageUrl: imageUrl }
                    : f,
                );
                toast.success("Hero image uploaded — save to apply");
              } catch (err) {
                toast.error(err instanceof Error ? err.message : "Upload failed");
              }
            }}
          />
          {form.heroImageKey ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setForm((f) =>
                  f ? { ...f, heroImageKey: "", heroImageUrl: "" } : f,
                )
              }
            >
              Remove image
            </Button>
          ) : null}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {SOLUTION_COPY_KEYS.map((key) => (
            <div key={key}>
              <Label htmlFor={`copy-${key}`} className="text-xs">
                {key}
              </Label>
              <Input
                id={`copy-${key}`}
                className="mt-1"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </div>
          ))}
        </div>
      </details>

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

      <div className="space-y-3">
        <Label>Problems</Label>
        {form.problems.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No problems yet — add one
          </p>
        ) : null}
        {form.problems.map((problem, i) => (
          <div key={i} className="space-y-3 rounded-md border p-4">
            <div className="flex justify-between gap-2">
              <p className="text-sm font-medium">Problem {i + 1}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setForm({
                    ...form,
                    problems: form.problems.filter((_, j) => j !== i),
                  })
                }
              >
                Remove
              </Button>
            </div>
            <Input
              placeholder="Title"
              value={problem.title}
              onChange={(e) => {
                const problems = [...form.problems];
                problems[i] = { ...problem, title: e.target.value };
                setForm({ ...form, problems });
              }}
            />
            <Textarea
              placeholder="Description"
              rows={3}
              value={problem.description}
              onChange={(e) => {
                const problems = [...form.problems];
                problems[i] = { ...problem, description: e.target.value };
                setForm({ ...form, problems });
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
              problems: [...form.problems, { title: "", description: "" }],
            })
          }
        >
          Add problem
        </Button>
      </div>

      <div className="space-y-3">
        <Label>Use cases</Label>
        {form.useCases.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No use cases yet — add one
          </p>
        ) : null}
        {form.useCases.map((useCase, i) => (
          <div key={i} className="space-y-3 rounded-md border p-4">
            <div className="flex justify-between gap-2">
              <p className="text-sm font-medium">Use case {i + 1}</p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() =>
                  setForm({
                    ...form,
                    useCases: form.useCases.filter((_, j) => j !== i),
                  })
                }
              >
                Remove
              </Button>
            </div>
            <Input
              className="font-mono text-sm"
              placeholder="Slug"
              value={useCase.slug}
              onChange={(e) => {
                const useCases = [...form.useCases];
                useCases[i] = { ...useCase, slug: e.target.value };
                setForm({ ...form, useCases });
              }}
            />
            <Input
              placeholder="Industry"
              value={useCase.industry}
              onChange={(e) => {
                const useCases = [...form.useCases];
                useCases[i] = { ...useCase, industry: e.target.value };
                setForm({ ...form, useCases });
              }}
            />
            <Textarea
              placeholder="Description"
              rows={3}
              value={useCase.description}
              onChange={(e) => {
                const useCases = [...form.useCases];
                useCases[i] = { ...useCase, description: e.target.value };
                setForm({ ...form, useCases });
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
              useCases: [...form.useCases, emptyUseCase()],
            })
          }
        >
          Add use case
        </Button>
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
