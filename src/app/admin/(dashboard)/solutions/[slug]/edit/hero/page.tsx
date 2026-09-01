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
  ImageField,
  TextAreaField,
  TextField,
} from "@/components/admin/section-editor/fields";

type Form = {
  heroEyebrow: string;
  heroHeadline: string;
  heroSubheadline: string;
  heroImageKey: string;
  heroImageUrl: string;
  heroImageAlt: string;
  heroCaption: string;
  heroPrimaryCtaLabel: string;
  heroPrimaryCtaHref: string;
  heroSecondaryCtaLabel: string;
  heroSecondaryCtaHref: string;
};

function previewOf(image?: string): string | undefined {
  if (!image) return undefined;
  if (image.startsWith("http") || image.startsWith("/")) return image;
  return `/api/media/${image}`;
}

const toForm = (i: Record<string, unknown>): Form => ({
  heroEyebrow: str(i.heroEyebrow),
  heroHeadline: str(i.heroHeadline),
  heroSubheadline: str(i.heroSubheadline),
  heroImageKey: str(i.heroImage),
  heroImageUrl: str(i.heroImageUrl) || previewOf(str(i.heroImage)) || "",
  heroImageAlt: str(i.heroImageAlt),
  heroCaption: str(i.heroCaption),
  heroPrimaryCtaLabel: str(i.heroPrimaryCtaLabel),
  heroPrimaryCtaHref: str(i.heroPrimaryCtaHref),
  heroSecondaryCtaLabel: str(i.heroSecondaryCtaLabel),
  heroSecondaryCtaHref: str(i.heroSecondaryCtaHref),
});

export default function SolutionHeroPage() {
  const { slug } = useParams<{ slug: string }>();
  const { item, loading, saving, save } = useAdminResource(
    `/api/admin/solutions/${slug}`,
  );
  const [form, , patch] = useSectionForm(item, toForm);

  const onSave = () => {
    if (!form) return;
    void save(
      {
        heroEyebrow: nullifyEmpty(form.heroEyebrow),
        heroHeadline: form.heroHeadline.trim(),
        heroSubheadline: form.heroSubheadline.trim(),
        heroImage: form.heroImageKey.trim() || null,
        heroImageAlt: nullifyEmpty(form.heroImageAlt),
        heroCaption: nullifyEmpty(form.heroCaption),
        heroPrimaryCtaLabel: nullifyEmpty(form.heroPrimaryCtaLabel),
        heroPrimaryCtaHref: nullifyEmpty(form.heroPrimaryCtaHref),
        heroSecondaryCtaLabel: nullifyEmpty(form.heroSecondaryCtaLabel),
        heroSecondaryCtaHref: nullifyEmpty(form.heroSecondaryCtaHref),
      },
      "Hero saved",
    );
  };

  return (
    <SectionShell
      title="Hero"
      description="Top of the solution page. With no image the gradient placeholder is shown. Blank fields fall back to defaults."
      viewHref={`/solution/${slug}`}
      loading={loading || !form}
      saving={saving}
      onSave={onSave}
    >
      {form ? (
        <>
          <TextField
            label="Eyebrow badge"
            placeholder="Solution"
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
            rows={2}
            value={form.heroSubheadline}
            onChange={(v) => patch({ heroSubheadline: v })}
          />
          <ImageField
            label="Hero image (optional)"
            objectKey={form.heroImageKey}
            previewUrl={form.heroImageUrl}
            uploadEndpoint="/api/admin/solutions/upload"
            onChange={(key, url) =>
              patch({ heroImageKey: key, heroImageUrl: url })
            }
          />
          <div className="contents">
            <TextField
              label="Image alt text"
              value={form.heroImageAlt}
              onChange={(v) => patch({ heroImageAlt: v })}
            />
            <TextField
              label="Caption ({title} = solution title)"
              value={form.heroCaption}
              onChange={(v) => patch({ heroCaption: v })}
            />
          </div>
          <div className="contents">
            <TextField
              label="Primary CTA label"
              placeholder="Request a Demo"
              value={form.heroPrimaryCtaLabel}
              onChange={(v) => patch({ heroPrimaryCtaLabel: v })}
            />
            <TextField
              label="Primary CTA link"
              placeholder="/demo"
              value={form.heroPrimaryCtaHref}
              onChange={(v) => patch({ heroPrimaryCtaHref: v })}
            />
            <TextField
              label="Secondary CTA label"
              placeholder="See Pricing"
              value={form.heroSecondaryCtaLabel}
              onChange={(v) => patch({ heroSecondaryCtaLabel: v })}
            />
            <TextField
              label="Secondary CTA link"
              placeholder="/pricing"
              value={form.heroSecondaryCtaHref}
              onChange={(v) => patch({ heroSecondaryCtaHref: v })}
            />
          </div>
        </>
      ) : null}
    </SectionShell>
  );
}
