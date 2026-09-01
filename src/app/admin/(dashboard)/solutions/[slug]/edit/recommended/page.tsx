"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { adminFetch } from "@/lib/admin-fetch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  nullifyEmpty,
  str,
  useAdminResource,
  useSectionForm,
} from "@/components/admin/section-editor/useAdminResource";
import { SectionShell } from "@/components/admin/section-editor/SectionShell";
import {
  Field,
  TextAreaField,
  TextField,
} from "@/components/admin/section-editor/fields";

type ModuleOption = { slug: string; name: string };

type Form = {
  recommendedTag: string;
  recommendedTitle: string;
  recommendedDescription: string;
  recommendedModules: string[];
};

const toForm = (i: Record<string, unknown>): Form => ({
  recommendedTag: str(i.recommendedTag),
  recommendedTitle: str(i.recommendedTitle),
  recommendedDescription: str(i.recommendedDescription),
  recommendedModules: Array.isArray(i.recommendedModules)
    ? (i.recommendedModules as string[])
    : [],
});

export default function SolutionRecommendedPage() {
  const { slug } = useParams<{ slug: string }>();
  const { item, loading, saving, save } = useAdminResource(
    `/api/admin/solutions/${slug}`,
  );
  const [form, , patch] = useSectionForm(item, toForm);
  const [modules, setModules] = useState<ModuleOption[]>([]);

  useEffect(() => {
    void adminFetch<{ items: ModuleOption[] }>("/api/admin/modules")
      .then((d) => setModules(d.items ?? []))
      .catch(() => setModules([]));
  }, []);

  const onSave = () => {
    if (!form) return;
    void save(
      {
        recommendedTag: nullifyEmpty(form.recommendedTag),
        recommendedTitle: nullifyEmpty(form.recommendedTitle),
        recommendedDescription: nullifyEmpty(form.recommendedDescription),
        recommendedModules: form.recommendedModules,
      },
      "Recommended modules saved",
    );
  };

  const toggle = (moduleSlug: string) => {
    if (!form) return;
    const set = new Set(form.recommendedModules);
    if (set.has(moduleSlug)) set.delete(moduleSlug);
    else set.add(moduleSlug);
    patch({ recommendedModules: [...set] });
  };

  return (
    <SectionShell
      title="Recommended modules"
      description="The header and module cards shown near the bottom of the page."
      viewHref={`/solution/${slug}`}
      loading={loading || !form}
      saving={saving}
      onSave={onSave}
    >
      {form ? (
        <>
          <div className="contents">
            <TextField
              label="Section tag"
              placeholder="Recommended"
              value={form.recommendedTag}
              onChange={(v) => patch({ recommendedTag: v })}
            />
            <TextField
              label="Section title"
              placeholder="Platform For You"
              value={form.recommendedTitle}
              onChange={(v) => patch({ recommendedTitle: v })}
            />
          </div>
          <TextAreaField
            label="Section description"
            rows={2}
            value={form.recommendedDescription}
            onChange={(v) => patch({ recommendedDescription: v })}
          />
          <Field
            label="Modules"
            hint="Order on the page follows each module's own sort order."
            full
          >
            <div className="grid gap-2 rounded-lg border border-border bg-card p-3 sm:grid-cols-2 lg:grid-cols-3">
              {modules.map((m) => (
                <label
                  key={m.slug}
                  className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted"
                >
                  <Checkbox
                    checked={form.recommendedModules.includes(m.slug)}
                    onCheckedChange={() => toggle(m.slug)}
                  />
                  {m.name}
                </label>
              ))}
              {modules.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  No modules found.
                </p>
              ) : null}
            </div>
          </Field>
        </>
      ) : null}
    </SectionShell>
  );
}
