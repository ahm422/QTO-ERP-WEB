"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AdminFetchError, adminFetch } from "@/lib/admin-fetch";
import { AdminFormWidth } from "@/components/admin/AdminFormWidth";
import { AdminPage } from "@/components/admin/AdminPage";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DEMO_PAGE_CONTENT_DEFAULTS } from "@/lib/demo-page-defaults";
import { ALLOWED_DEMO_ICON_KEYS } from "@/lib/icon-map";
import type {
  DemoFormFieldOptionsDto,
  DemoIconStepDto,
  DemoPageContent,
} from "@/types/content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const emptyStep = (): DemoIconStepDto => ({
  iconKey: "clock",
  title: "",
  description: "",
});

const emptyBusinessType = () => ({ value: "", label: "" });

function pageFromDefaults(): DemoPageContent {
  const d = DEMO_PAGE_CONTENT_DEFAULTS;
  return {
    heroBadge: d.heroBadge,
    heroTitle: d.heroTitle,
    heroAccent: d.heroAccent,
    heroDescription: d.heroDescription,
    heroBadges: [...d.heroBadges],
    processTag: d.processTag,
    processTitle: d.processTitle,
    processDescription: d.processDescription,
    whatToExpect: d.whatToExpect.map((s) => ({ ...s })),
    sideTitle: d.sideTitle,
    sideDescription: d.sideDescription,
    benefits: d.benefits.map((s) => ({ ...s })),
    testimonialQuote: d.testimonialQuote,
    testimonialAuthor: d.testimonialAuthor,
    testimonialRole: d.testimonialRole,
    formFieldOptions: {
      ...d.formFieldOptions,
      labels: { ...d.formFieldOptions.labels },
      placeholders: { ...d.formFieldOptions.placeholders },
      countries: [...d.formFieldOptions.countries],
      businessTypes: d.formFieldOptions.businessTypes.map((b) => ({ ...b })),
    },
  };
}

function moveItem<T>(list: T[], index: number, dir: -1 | 1): T[] | null {
  const j = index + dir;
  if (j < 0 || j >= list.length) return null;
  const next = [...list];
  const tmp = next[index];
  next[index] = next[j];
  next[j] = tmp;
  return next;
}

export default function DemoPageAdminPage() {
  const [page, setPage] = useState<DemoPageContent>(pageFromDefaults);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminFetch<{ ok: true; page: DemoPageContent }>(
        "/api/admin/demo-page",
      );
      setPage(data.page);
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to load demo page",
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
      const data = await adminFetch<{ ok: true; page: DemoPageContent }>(
        "/api/admin/demo-page",
        {
          method: "PUT",
          json: page,
        },
      );
      setPage(data.page);
      toast.success("Demo page saved");
    } catch (err) {
      toast.error(
        err instanceof AdminFetchError
          ? err.message
          : "Failed to save demo page",
      );
    } finally {
      setSaving(false);
    }
  };

  const setFormOptions = (patch: Partial<DemoFormFieldOptionsDto>) => {
    setPage((prev) => ({
      ...prev,
      formFieldOptions: { ...prev.formFieldOptions, ...patch },
    }));
  };

  const updateStep = (
    field: "whatToExpect" | "benefits",
    index: number,
    patch: Partial<DemoIconStepDto>,
  ) => {
    setPage((prev) => ({
      ...prev,
      [field]: prev[field].map((s, i) =>
        i === index ? { ...s, ...patch } : s,
      ),
    }));
  };

  const moveStep = (
    field: "whatToExpect" | "benefits",
    index: number,
    dir: -1 | 1,
  ) => {
    setPage((prev) => {
      const next = moveItem(prev[field], index, dir);
      if (!next) return prev;
      return { ...prev, [field]: next };
    });
  };

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  const opts = page.formFieldOptions;

  return (
    <AdminPage>
      <AdminFormWidth size="lg" className="space-y-8">
      <AdminPageHeader
        title="Demo page"
        description="Hero, process steps, form-side copy, testimonial, and select lists for /demo. Lead submissions stay in Demo requests."
        actions={
          <Button onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        }
      />

      <section className="space-y-4 rounded-md border p-4">
        <h2 className="text-lg font-medium">Hero</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="hero-badge">Badge</Label>
            <Input
              id="hero-badge"
              className="mt-1"
              value={page.heroBadge}
              onChange={(e) =>
                setPage({ ...page, heroBadge: e.target.value })
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
                setPage({ ...page, heroTitle: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="hero-accent">Accent</Label>
            <Input
              id="hero-accent"
              className="mt-1"
              value={page.heroAccent}
              onChange={(e) =>
                setPage({ ...page, heroAccent: e.target.value })
              }
            />
          </div>
        </div>
        <div>
          <Label htmlFor="hero-description">Description</Label>
          <Textarea
            id="hero-description"
            className="mt-1"
            rows={3}
            value={page.heroDescription}
            onChange={(e) =>
              setPage({ ...page, heroDescription: e.target.value })
            }
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Hero chips</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setPage({
                  ...page,
                  heroBadges: [...page.heroBadges, ""],
                })
              }
            >
              <Plus className="size-4" /> Add
            </Button>
          </div>
          {page.heroBadges.map((badge, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={badge}
                onChange={(e) => {
                  const next = [...page.heroBadges];
                  next[index] = e.target.value;
                  setPage({ ...page, heroBadges: next });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  setPage({
                    ...page,
                    heroBadges: page.heroBadges.filter((_, i) => i !== index),
                  })
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-md border p-4">
        <h2 className="text-lg font-medium">Process</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="process-tag">Tag</Label>
            <Input
              id="process-tag"
              className="mt-1"
              value={page.processTag}
              onChange={(e) =>
                setPage({ ...page, processTag: e.target.value })
              }
            />
          </div>
          <div>
            <Label htmlFor="process-title">Title</Label>
            <Input
              id="process-title"
              className="mt-1"
              value={page.processTitle}
              onChange={(e) =>
                setPage({ ...page, processTitle: e.target.value })
              }
            />
          </div>
        </div>
        <div>
          <Label htmlFor="process-description">Description</Label>
          <Textarea
            id="process-description"
            className="mt-1"
            rows={2}
            value={page.processDescription}
            onChange={(e) =>
              setPage({ ...page, processDescription: e.target.value })
            }
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>What to expect</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setPage({
                  ...page,
                  whatToExpect: [...page.whatToExpect, emptyStep()],
                })
              }
            >
              <Plus className="size-4" /> Add step
            </Button>
          </div>
          {page.whatToExpect.map((step, index) => (
            <div
              key={index}
              className="space-y-2 rounded-md border bg-muted/30 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  Step {index + 1}
                </span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => moveStep("whatToExpect", index, -1)}
                    disabled={index === 0}
                  >
                    <ChevronUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => moveStep("whatToExpect", index, 1)}
                    disabled={index === page.whatToExpect.length - 1}
                  >
                    <ChevronDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setPage({
                        ...page,
                        whatToExpect: page.whatToExpect.filter(
                          (_, i) => i !== index,
                        ),
                      })
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label>Icon</Label>
                  <select
                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={step.iconKey}
                    onChange={(e) =>
                      updateStep("whatToExpect", index, {
                        iconKey: e.target.value,
                      })
                    }
                  >
                    {ALLOWED_DEMO_ICON_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    className="mt-1"
                    value={step.title}
                    onChange={(e) =>
                      updateStep("whatToExpect", index, {
                        title: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  className="mt-1"
                  rows={2}
                  value={step.description}
                  onChange={(e) =>
                    updateStep("whatToExpect", index, {
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 rounded-md border p-4">
        <h2 className="text-lg font-medium">Form side</h2>
        <div>
          <Label htmlFor="side-title">Title</Label>
          <Input
            id="side-title"
            className="mt-1"
            value={page.sideTitle}
            onChange={(e) => setPage({ ...page, sideTitle: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="side-description">Description</Label>
          <Textarea
            id="side-description"
            className="mt-1"
            rows={2}
            value={page.sideDescription}
            onChange={(e) =>
              setPage({ ...page, sideDescription: e.target.value })
            }
          />
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Benefits</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setPage({
                  ...page,
                  benefits: [...page.benefits, emptyStep()],
                })
              }
            >
              <Plus className="size-4" /> Add
            </Button>
          </div>
          {page.benefits.map((step, index) => (
            <div
              key={index}
              className="space-y-2 rounded-md border bg-muted/30 p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground">
                  Benefit {index + 1}
                </span>
                <div className="flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => moveStep("benefits", index, -1)}
                    disabled={index === 0}
                  >
                    <ChevronUp className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => moveStep("benefits", index, 1)}
                    disabled={index === page.benefits.length - 1}
                  >
                    <ChevronDown className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setPage({
                        ...page,
                        benefits: page.benefits.filter((_, i) => i !== index),
                      })
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <Label>Icon</Label>
                  <select
                    className="mt-1 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                    value={step.iconKey}
                    onChange={(e) =>
                      updateStep("benefits", index, {
                        iconKey: e.target.value,
                      })
                    }
                  >
                    {ALLOWED_DEMO_ICON_KEYS.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Title</Label>
                  <Input
                    className="mt-1"
                    value={step.title}
                    onChange={(e) =>
                      updateStep("benefits", index, { title: e.target.value })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Description</Label>
                <Input
                  className="mt-1"
                  value={step.description}
                  onChange={(e) =>
                    updateStep("benefits", index, {
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t pt-4">
          <h3 className="text-sm font-medium">Testimonial</h3>
          <div>
            <Label htmlFor="testimonial-quote">Quote</Label>
            <Textarea
              id="testimonial-quote"
              className="mt-1"
              rows={2}
              value={page.testimonialQuote}
              onChange={(e) =>
                setPage({ ...page, testimonialQuote: e.target.value })
              }
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="testimonial-author">Author</Label>
              <Input
                id="testimonial-author"
                className="mt-1"
                value={page.testimonialAuthor}
                onChange={(e) =>
                  setPage({ ...page, testimonialAuthor: e.target.value })
                }
              />
            </div>
            <div>
              <Label htmlFor="testimonial-role">Role</Label>
              <Input
                id="testimonial-role"
                className="mt-1"
                value={page.testimonialRole}
                onChange={(e) =>
                  setPage({ ...page, testimonialRole: e.target.value })
                }
              />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4 rounded-md border p-4">
        <h2 className="text-lg font-medium">Form fields</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {(
            [
              "name",
              "email",
              "phone",
              "country",
              "company",
              "businessType",
            ] as const
          ).map((key) => (
            <div key={key} className="space-y-2 rounded-md border p-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">
                {key}
              </p>
              <div>
                <Label>Label</Label>
                <Input
                  className="mt-1"
                  value={opts.labels[key]}
                  onChange={(e) =>
                    setFormOptions({
                      labels: { ...opts.labels, [key]: e.target.value },
                    })
                  }
                />
              </div>
              <div>
                <Label>Placeholder</Label>
                <Input
                  className="mt-1"
                  value={opts.placeholders[key]}
                  onChange={(e) =>
                    setFormOptions({
                      placeholders: {
                        ...opts.placeholders,
                        [key]: e.target.value,
                      },
                    })
                  }
                />
              </div>
            </div>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="submit-label">Submit label</Label>
            <Input
              id="submit-label"
              className="mt-1"
              value={opts.submitLabel ?? ""}
              onChange={(e) =>
                setFormOptions({ submitLabel: e.target.value || undefined })
              }
            />
          </div>
          <div>
            <Label htmlFor="success-message">Success message</Label>
            <Input
              id="success-message"
              className="mt-1"
              value={opts.successMessage ?? ""}
              onChange={(e) =>
                setFormOptions({
                  successMessage: e.target.value || undefined,
                })
              }
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Countries</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setFormOptions({ countries: [...opts.countries, ""] })
              }
            >
              <Plus className="size-4" /> Add
            </Button>
          </div>
          {opts.countries.map((country, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={country}
                onChange={(e) => {
                  const next = [...opts.countries];
                  next[index] = e.target.value;
                  setFormOptions({ countries: next });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  setFormOptions({
                    countries: opts.countries.filter((_, i) => i !== index),
                  })
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Business types</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setFormOptions({
                  businessTypes: [...opts.businessTypes, emptyBusinessType()],
                })
              }
            >
              <Plus className="size-4" /> Add
            </Button>
          </div>
          {opts.businessTypes.map((bt, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder="value"
                value={bt.value}
                onChange={(e) => {
                  const next = opts.businessTypes.map((b, i) =>
                    i === index ? { ...b, value: e.target.value } : b,
                  );
                  setFormOptions({ businessTypes: next });
                }}
              />
              <Input
                placeholder="label"
                value={bt.label}
                onChange={(e) => {
                  const next = opts.businessTypes.map((b, i) =>
                    i === index ? { ...b, label: e.target.value } : b,
                  );
                  setFormOptions({ businessTypes: next });
                }}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() =>
                  setFormOptions({
                    businessTypes: opts.businessTypes.filter(
                      (_, i) => i !== index,
                    ),
                  })
                }
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
      </section>

      <div className="flex justify-end">
        <Button onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
      </AdminFormWidth>
    </AdminPage>
  );
}
