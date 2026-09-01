"use client";

import { useParams } from "next/navigation";
import {
  str,
  useAdminResource,
  useSectionForm,
} from "@/components/admin/section-editor/useAdminResource";
import { SectionShell } from "@/components/admin/section-editor/SectionShell";
import {
  RepeatableList,
  StringListField,
  TextAreaField,
  TextField,
} from "@/components/admin/section-editor/fields";
import type {
  SolutionUseCase,
  SolutionUseCaseFeature,
} from "@/types/solution";

type Form = { useCases: SolutionUseCase[] };

const toForm = (i: Record<string, unknown>): Form => ({
  useCases: Array.isArray(i.useCases)
    ? (i.useCases as SolutionUseCase[]).map((u) => ({
        slug: str(u.slug),
        industry: str(u.industry),
        description: str(u.description),
        specificNeeds: Array.isArray(u.specificNeeds)
          ? u.specificNeeds.map(String)
          : [],
        subNav: Array.isArray(u.subNav) ? u.subNav.map(String) : [],
        features: Array.isArray(u.features)
          ? (u.features as SolutionUseCaseFeature[])
          : [],
      }))
    : [],
});

export default function SolutionUseCasesPage() {
  const { slug } = useParams<{ slug: string }>();
  const { item, loading, saving, save } = useAdminResource(
    `/api/admin/solutions/${slug}`,
  );
  const [form, , patch] = useSectionForm(item, toForm);

  const onSave = () => {
    if (!form) return;
    void save(
      {
        useCases: form.useCases.map((u) => ({
          slug: u.slug.trim(),
          industry: u.industry.trim(),
          description: u.description.trim(),
          specificNeeds: (u.specificNeeds ?? [])
            .map((s) => s.trim())
            .filter(Boolean),
          subNav: (u.subNav ?? []).map((s) => s.trim()).filter(Boolean),
          features: (u.features ?? []).map((f) => ({
            tag: f.tag.trim(),
            title: f.title.trim(),
            desc: f.desc.trim(),
            imageUrl: f.imageUrl || undefined,
          })),
        })),
      },
      "Use cases saved",
    );
  };

  return (
    <SectionShell
      title="Use cases"
      description="Per-industry variants. Each drives the '?industry=' deep-link, the capability tabs and the checklist in the hero."
      viewHref={`/solution/${slug}`}
      loading={loading || !form}
      saving={saving}
      onSave={onSave}
    >
      {form ? (
        <RepeatableList<SolutionUseCase>
          label="Use cases"
          items={form.useCases}
          onChange={(v) => patch({ useCases: v })}
          rowTitle={(u) => u.industry}
          addLabel="Add use case"
          makeEmpty={() => ({
            slug: "",
            industry: "",
            description: "",
            specificNeeds: [],
            subNav: [],
            features: [],
          })}
          renderRow={(uc, update) => (
            <>
              <div className="contents">
                <TextField
                  label="Slug (used in ?industry=)"
                  mono
                  value={uc.slug}
                  onChange={(v) => update({ slug: v })}
                />
                <TextField
                  label="Industry name"
                  value={uc.industry}
                  onChange={(v) => update({ industry: v })}
                />
              </div>
              <TextAreaField
                label="Description"
                rows={2}
                value={uc.description}
                onChange={(v) => update({ description: v })}
              />
              <StringListField
                label="Specific needs (hero checklist)"
                values={uc.specificNeeds}
                onChange={(v) => update({ specificNeeds: v })}
              />
              <StringListField
                label="Tab labels (sub-nav)"
                hint="One per capability tab; falls back to the feature tag if empty."
                values={uc.subNav ?? []}
                onChange={(v) => update({ subNav: v })}
              />
              <RepeatableList<SolutionUseCaseFeature>
                label="Capability tabs / features"
                items={uc.features ?? []}
                onChange={(v) => update({ features: v })}
                addLabel="Add feature"
                makeEmpty={() => ({ tag: "", title: "", desc: "" })}
                renderRow={(f, updateF) => (
                  <>
                    <div className="contents">
                      <TextField
                        label="Tag"
                        value={f.tag}
                        onChange={(v) => updateF({ tag: v })}
                      />
                      <TextField
                        label="Title"
                        value={f.title}
                        onChange={(v) => updateF({ title: v })}
                      />
                    </div>
                    <TextAreaField
                      label="Description"
                      rows={2}
                      value={f.desc}
                      onChange={(v) => updateF({ desc: v })}
                    />
                    <TextField
                      label="Image URL / media key (optional)"
                      value={f.imageUrl ?? ""}
                      onChange={(v) => updateF({ imageUrl: v })}
                    />
                  </>
                )}
              />
            </>
          )}
        />
      ) : null}
    </SectionShell>
  );
}
