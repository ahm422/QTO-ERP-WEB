"use client";

import { useParams } from "next/navigation";
import {
  nullifyEmpty,
  str,
  useAdminResource,
  useSectionForm,
} from "@/components/admin/section-editor/useAdminResource";
import { SectionShell } from "@/components/admin/section-editor/SectionShell";
import {
  RepeatableList,
  TextAreaField,
  TextField,
} from "@/components/admin/section-editor/fields";
import type { TestimonialType } from "@/types/testimonial";

type Form = {
  testimonialsSectionTag: string;
  testimonialsSectionTitle: string;
  testimonialsSectionDescription: string;
  testimonials: TestimonialType[];
};

const toForm = (i: Record<string, unknown>): Form => ({
  testimonialsSectionTag: str(i.testimonialsSectionTag),
  testimonialsSectionTitle: str(i.testimonialsSectionTitle),
  testimonialsSectionDescription: str(i.testimonialsSectionDescription),
  testimonials: Array.isArray(i.testimonials)
    ? (i.testimonials as TestimonialType[])
    : [],
});

export default function ModuleTestimonialsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { item, loading, saving, save } = useAdminResource(
    `/api/admin/modules/${slug}`,
  );
  const [form, , patch] = useSectionForm(item, toForm);

  const onSave = () => {
    if (!form) return;
    void save(
      {
        testimonialsSectionTag: nullifyEmpty(form.testimonialsSectionTag),
        testimonialsSectionTitle: nullifyEmpty(form.testimonialsSectionTitle),
        testimonialsSectionDescription: nullifyEmpty(
          form.testimonialsSectionDescription,
        ),
        testimonials: form.testimonials.map((t) => ({
          content: t.content.trim(),
          name: t.name.trim(),
          role: t.role.trim(),
          company: t.company.trim(),
          selectedSolution: t.selectedSolution || undefined,
          rating: t.rating ?? undefined,
        })),
      },
      "Testimonials saved",
    );
  };

  return (
    <SectionShell
      title="Testimonials"
      description="Quotes shown in the testimonial carousel."
      viewHref={`/erp/${slug}`}
      loading={loading || !form}
      saving={saving}
      onSave={onSave}
    >
      {form ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Section tag"
              value={form.testimonialsSectionTag}
              onChange={(v) => patch({ testimonialsSectionTag: v })}
            />
            <TextField
              label="Section title"
              value={form.testimonialsSectionTitle}
              onChange={(v) => patch({ testimonialsSectionTitle: v })}
            />
          </div>
          <TextAreaField
            label="Section description"
            rows={2}
            value={form.testimonialsSectionDescription}
            onChange={(v) => patch({ testimonialsSectionDescription: v })}
          />
          <RepeatableList<TestimonialType>
            label="Testimonials"
            items={form.testimonials}
            onChange={(v) => patch({ testimonials: v })}
            rowTitle={(t) => [t.name, t.company].filter(Boolean).join(" · ")}
            addLabel="Add testimonial"
            makeEmpty={() => ({
              content: "",
              name: "",
              role: "",
              company: "",
            })}
            renderRow={(t, update) => (
              <div className="space-y-3">
                <TextAreaField
                  label="Quote"
                  rows={3}
                  value={t.content}
                  onChange={(v) => update({ content: v })}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    label="Name"
                    value={t.name}
                    onChange={(v) => update({ name: v })}
                  />
                  <TextField
                    label="Role"
                    value={t.role}
                    onChange={(v) => update({ role: v })}
                  />
                  <TextField
                    label="Company"
                    value={t.company}
                    onChange={(v) => update({ company: v })}
                  />
                  <TextField
                    label="Tag chip (optional)"
                    value={t.selectedSolution ?? ""}
                    onChange={(v) => update({ selectedSolution: v })}
                  />
                </div>
              </div>
            )}
          />
        </>
      ) : null}
    </SectionShell>
  );
}
