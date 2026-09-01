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
  TextAreaField,
  TextField,
} from "@/components/admin/section-editor/fields";

type Form = {
  heroEyebrow: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroCtaLabel: string;
};

const toForm = (i: Record<string, unknown>): Form => ({
  heroEyebrow: str(i.heroEyebrow),
  heroHeadline: str(i.heroHeadline),
  heroSubheadline: str(i.heroSubheadline),
  heroCtaLabel: str(i.heroCtaLabel),
});

export default function ModuleHeroPage() {
  const { slug } = useParams<{ slug: string }>();
  const { item, loading, saving, save } = useAdminResource(
    `/api/admin/modules/${slug}`,
  );
  const [form, , patch] = useSectionForm(item, toForm);

  const onSave = () => {
    if (!form) return;
    void save(
      {
        heroEyebrow: nullifyEmpty(form.heroEyebrow),
        heroHeadline: form.heroHeadline.trim(),
        heroSubheadline: form.heroSubheadline.trim(),
        heroCtaLabel: nullifyEmpty(form.heroCtaLabel),
      },
      "Hero saved",
    );
  };

  return (
    <SectionShell
      title="Hero"
      description="The top of the module page. Blank eyebrow / CTA label fall back to defaults."
      viewHref={`/erp/${slug}`}
      loading={loading || !form}
      saving={saving}
      onSave={onSave}
    >
      {form ? (
        <>
          <TextField
            label="Eyebrow badge"
            placeholder="ERP Module"
            value={form.heroEyebrow}
            onChange={(v) => patch({ heroEyebrow: v })}
          />
          <TextField
            label="Headline"
            value={form.heroHeadline}
            onChange={(v) => patch({ heroHeadline: v })}
          />
          <TextAreaField
            label="Subheadline"
            value={form.heroSubheadline}
            onChange={(v) => patch({ heroSubheadline: v })}
          />
          <TextField
            label="CTA button label"
            placeholder="Schedule a Demo"
            hint="Links to the bottom-CTA primary link (set in CTA & SEO)."
            value={form.heroCtaLabel}
            onChange={(v) => patch({ heroCtaLabel: v })}
          />
        </>
      ) : null}
    </SectionShell>
  );
}
