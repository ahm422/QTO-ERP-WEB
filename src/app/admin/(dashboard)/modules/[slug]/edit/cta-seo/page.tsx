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
  allAppsTag: string;
  allAppsTitle: string;
  ctaHeadline: string;
  ctaPrimaryLabel: string;
  ctaPrimaryHref: string;
  ctaSecondaryLabel: string;
  ctaSecondaryHref: string;
  defaultImage: string;
  metaTitle: string;
  metaDescription: string;
};

const KEYS: (keyof Form)[] = [
  "allAppsTag",
  "allAppsTitle",
  "ctaHeadline",
  "ctaPrimaryLabel",
  "ctaPrimaryHref",
  "ctaSecondaryLabel",
  "ctaSecondaryHref",
  "defaultImage",
  "metaTitle",
  "metaDescription",
];

const toForm = (i: Record<string, unknown>): Form =>
  Object.fromEntries(KEYS.map((k) => [k, str(i[k])])) as Form;

export default function ModuleCtaSeoPage() {
  const { slug } = useParams<{ slug: string }>();
  const { item, loading, saving, save } = useAdminResource(
    `/api/admin/modules/${slug}`,
  );
  const [form, , patch] = useSectionForm(item, toForm);

  const onSave = () => {
    if (!form) return;
    void save(
      Object.fromEntries(KEYS.map((k) => [k, nullifyEmpty(form[k])])),
      "CTA & SEO saved",
    );
  };

  return (
    <SectionShell
      title="CTA & SEO"
      description="The 'explore more' header, the bottom call-to-action band, the fallback image, and page metadata. Blank = built-in default."
      viewHref={`/erp/${slug}`}
      loading={loading || !form}
      saving={saving}
      onSave={onSave}
    >
      {form ? (
        <>
          <FieldGroup title="&ldquo;All applications&rdquo; header">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label="Tag"
                placeholder="Explore More"
                value={form.allAppsTag}
                onChange={(v) => patch({ allAppsTag: v })}
              />
              <TextField
                label="Title"
                placeholder="See All Applications"
                value={form.allAppsTitle}
                onChange={(v) => patch({ allAppsTitle: v })}
              />
            </div>
          </FieldGroup>

          <FieldGroup title="Bottom call-to-action band">
            <TextField
              label="Headline"
              value={form.ctaHeadline}
              onChange={(v) => patch({ ctaHeadline: v })}
            />
            <div className="grid gap-4 sm:grid-cols-2">
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
                placeholder="/pricing"
                value={form.ctaSecondaryHref}
                onChange={(v) => patch({ ctaSecondaryHref: v })}
              />
            </div>
          </FieldGroup>

          <TextField
            label="Fallback image (path or media key)"
            hint="Used for feature/about blocks that don't set their own image."
            value={form.defaultImage}
            onChange={(v) => patch({ defaultImage: v })}
          />

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
