"use client";

import { useParams } from "next/navigation";
import {
  nullifyEmpty,
  str,
  useAdminResource,
  useSectionForm,
} from "@/components/admin/section-editor/useAdminResource";
import {
  FieldGroup,
  SectionShell,
} from "@/components/admin/section-editor/SectionShell";
import { TextAreaField, TextField } from "@/components/admin/section-editor/fields";

type Form = {
  ctaEyebrow: string;
  ctaHeadline: string;
  ctaDescription: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
};

const toForm = (i: Record<string, unknown>): Form => ({
  ctaEyebrow: str(i.ctaEyebrow),
  ctaHeadline: str(i.ctaHeadline),
  ctaDescription: str(i.ctaDescription),
  ctaPrimaryLabel: str(i.ctaPrimaryLabel),
  ctaPrimaryHref: str(i.ctaPrimaryHref),
  ctaSecondaryLabel: str(i.ctaSecondaryLabel),
  ctaSecondaryHref: str(i.ctaSecondaryHref),
});

export default function SolutionCtaPage() {
  const { slug } = useParams<{ slug: string }>();
  const { item, loading, saving, save } = useAdminResource(
    `/api/admin/solutions/${slug}`,
  );
  const [form, , patch] = useSectionForm(item, toForm);

  const onSave = () => {
    if (!form) return;
    void save(
      {
        ctaEyebrow: nullifyEmpty(form.ctaEyebrow),
        ctaHeadline: nullifyEmpty(form.ctaHeadline),
        ctaDescription: nullifyEmpty(form.ctaDescription),
        ctaPrimaryLabel: nullifyEmpty(form.ctaPrimaryLabel),
        ctaPrimaryHref: nullifyEmpty(form.ctaPrimaryHref),
        ctaSecondaryLabel: nullifyEmpty(form.ctaSecondaryLabel),
        ctaSecondaryHref: nullifyEmpty(form.ctaSecondaryHref),
      },
      "CTA saved",
    );
  };

  return (
    <SectionShell
      title="CTA"
      description="Bottom call-to-action band. Blank = default."
      viewHref={`/solution/${slug}`}
      loading={loading || !form}
      saving={saving}
      onSave={onSave}
    >
      {form ? (
        <FieldGroup title="Bottom call-to-action band">
          <TextField
            label="Eyebrow"
            value={form.ctaEyebrow}
            onChange={(v) => patch({ ctaEyebrow: v })}
          />
          <TextField
            label="Headline"
            value={form.ctaHeadline}
            onChange={(v) => patch({ ctaHeadline: v })}
          />
          <TextAreaField
            label="Description"
            rows={2}
            value={form.ctaDescription}
            onChange={(v) => patch({ ctaDescription: v })}
          />
          <div className="contents">
            <TextField
              label="Primary button label"
              value={form.ctaPrimaryLabel}
              onChange={(v) => patch({ ctaPrimaryLabel: v })}
            />
            <TextField
              label="Primary button link"
              placeholder="/demo"
              value={form.ctaPrimaryHref}
              onChange={(v) => patch({ ctaPrimaryHref: v })}
            />
            <TextField
              label="Secondary button label"
              value={form.ctaSecondaryLabel}
              onChange={(v) => patch({ ctaSecondaryLabel: v })}
            />
            <TextField
              label="Secondary button link"
              placeholder="/contact"
              value={form.ctaSecondaryHref}
              onChange={(v) => patch({ ctaSecondaryHref: v })}
            />
          </div>
        </FieldGroup>
      ) : null}
    </SectionShell>
  );
}
