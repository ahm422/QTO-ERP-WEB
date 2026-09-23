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
  tabsIntroTag: string;
  tabsIntroTitle: string;
  tabsIntroDescription: string;
  tabImageFallback: string;
  ctaEyebrow: string;
  ctaHeadline: string;
  ctaDescription: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  metaTitle: string;
  metaDescription: string;
};

const KEYS: (keyof Form)[] = [
  "tabsIntroTag",
  "tabsIntroTitle",
  "tabsIntroDescription",
  "tabImageFallback",
  "ctaEyebrow",
  "ctaHeadline",
  "ctaDescription",
  "ctaPrimaryLabel",
  "ctaPrimaryHref",
  "ctaSecondaryLabel",
  "ctaSecondaryHref",
  "metaTitle",
  "metaDescription",
];

const toForm = (i: Record<string, unknown>): Form =>
  Object.fromEntries(KEYS.map((k) => [k, str(i[k])])) as Form;

export default function SolutionCtaSeoPage() {
  const { slug } = useParams<{ slug: string }>();
  const { item, loading, saving, save } = useAdminResource(
    `/api/admin/solutions/${slug}`,
  );
  const [form, , patch] = useSectionForm(item, toForm);

  const onSave = () => {
    if (!form) return;
    void save(
      Object.fromEntries(KEYS.map((k) => [k, nullifyEmpty(form[k])])),
      "Tabs, CTA & SEO saved",
    );
  };

  return (
    <SectionShell
      title="Tabs, CTA & SEO"
      description="The capability-tabs intro header, the bottom call-to-action band, the tab image fallback, and page metadata. Blank = default."
      viewHref={`/solution/${slug}`}
      loading={loading || !form}
      saving={saving}
      onSave={onSave}
    >
      {form ? (
        <>
          <FieldGroup title="Capability tabs intro">
            <div className="contents">
              <TextField
                label="Tag"
                placeholder="Capabilities"
                value={form.tabsIntroTag}
                onChange={(v) => patch({ tabsIntroTag: v })}
              />
              <TextField
                label="Title"
                placeholder="Explore the solution"
                value={form.tabsIntroTitle}
                onChange={(v) => patch({ tabsIntroTitle: v })}
              />
            </div>
            <TextAreaField
              label="Description"
              rows={2}
              value={form.tabsIntroDescription}
              onChange={(v) => patch({ tabsIntroDescription: v })}
            />
            <TextField
              label="Tab image fallback (path or media key)"
              value={form.tabImageFallback}
              onChange={(v) => patch({ tabImageFallback: v })}
            />
          </FieldGroup>

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

          <FieldGroup title="SEO">
            <TextField
              label="Meta title"
              value={form.metaTitle}
              onChange={(v) => patch({ metaTitle: v })}
            />
            <TextAreaField
              label="Meta description"
              rows={2}
              value={form.metaDescription}
              onChange={(v) => patch({ metaDescription: v })}
            />
          </FieldGroup>
        </>
      ) : null}
    </SectionShell>
  );
}
