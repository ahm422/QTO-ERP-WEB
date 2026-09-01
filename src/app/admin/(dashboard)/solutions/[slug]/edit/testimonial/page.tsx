"use client";

import { useParams } from "next/navigation";
import {
  str,
  useAdminResource,
  useSectionForm,
} from "@/components/admin/section-editor/useAdminResource";
import { SectionShell } from "@/components/admin/section-editor/SectionShell";
import {
  TextAreaField,
  TextField,
} from "@/components/admin/section-editor/fields";
import type { TestimonialType } from "@/types/testimonial";

type Form = {
  content: string;
  name: string;
  role: string;
  company: string;
  selectedSolution: string;
};

const toForm = (i: Record<string, unknown>): Form => {
  const t = (i.testimonial ?? {}) as Partial<TestimonialType>;
  return {
    content: str(t.content),
    name: str(t.name),
    role: str(t.role),
    company: str(t.company),
    selectedSolution: str(t.selectedSolution),
  };
};

export default function SolutionTestimonialPage() {
  const { slug } = useParams<{ slug: string }>();
  const { item, loading, saving, save } = useAdminResource(
    `/api/admin/solutions/${slug}`,
  );
  const [form, , patch] = useSectionForm(item, toForm);

  const onSave = () => {
    if (!form) return;
    void save(
      {
        testimonial: {
          content: form.content.trim(),
          name: form.name.trim(),
          role: form.role.trim(),
          company: form.company.trim(),
          selectedSolution: form.selectedSolution.trim() || undefined,
        },
      },
      "Testimonial saved",
    );
  };

  return (
    <SectionShell
      title="Testimonial"
      description="The single customer quote associated with this solution."
      viewHref={`/solution/${slug}`}
      loading={loading || !form}
      saving={saving}
      onSave={onSave}
    >
      {form ? (
        <>
          <TextAreaField
            label="Quote"
            rows={3}
            value={form.content}
            onChange={(v) => patch({ content: v })}
          />
          <div className="contents">
            <TextField
              label="Name"
              value={form.name}
              onChange={(v) => patch({ name: v })}
            />
            <TextField
              label="Role"
              value={form.role}
              onChange={(v) => patch({ role: v })}
            />
            <TextField
              label="Company"
              value={form.company}
              onChange={(v) => patch({ company: v })}
            />
            <TextField
              label="Tag chip (optional)"
              value={form.selectedSolution}
              onChange={(v) => patch({ selectedSolution: v })}
            />
          </div>
        </>
      ) : null}
    </SectionShell>
  );
}
