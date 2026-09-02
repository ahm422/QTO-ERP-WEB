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
import {
  ImageField,
  RepeatableList,
  TextAreaField,
  TextField,
  VideoField,
} from "@/components/admin/section-editor/fields";
import type { Feature } from "@/types/feature";

function previewOf(image?: string): string | undefined {
  if (!image) return undefined;
  if (image === "#") return undefined;
  if (image.startsWith("http") || image.startsWith("/")) return image;
  return `/api/media/${image}`;
}

type Form = {
  featuresTag: string;
  featuresSectionTitle: string;
  featuresSectionDescription: string;
  videoUrl: string;
  videoPreview?: string;
  videoCtaTitle: string;
  videoCtaDescription: string;
  videoCtaButtonLabel: string;
  features: Feature[];
};

const toForm = (i: Record<string, unknown>): Form => ({
  featuresTag: str(i.featuresTag),
  featuresSectionTitle: str(i.featuresSectionTitle),
  featuresSectionDescription: str(i.featuresSectionDescription),
  videoUrl: str(i.videoUrl) === "#" ? "" : str(i.videoUrl),
  videoPreview: previewOf(str(i.videoUrl)),
  videoCtaTitle: str(i.videoCtaTitle),
  videoCtaDescription: str(i.videoCtaDescription),
  videoCtaButtonLabel: str(i.videoCtaButtonLabel),
  features: Array.isArray(i.features)
    ? (i.features as Feature[]).map((f) => ({
        ...f,
        imageUrl: f.imageUrl || previewOf(f.imageKey),
      }))
    : [],
});

export default function ModuleFeaturesPage() {
  const { slug } = useParams<{ slug: string }>();
  const { item, loading, saving, save } = useAdminResource(
    `/api/admin/modules/${slug}`,
  );
  const [form, , patch] = useSectionForm(item, toForm);

  const onSave = () => {
    if (!form) return;
    void save(
      {
        featuresTag: nullifyEmpty(form.featuresTag),
        featuresSectionTitle: nullifyEmpty(form.featuresSectionTitle),
        featuresSectionDescription: nullifyEmpty(
          form.featuresSectionDescription,
        ),
        videoUrl: form.videoUrl.trim() || "#",
        videoCtaTitle: nullifyEmpty(form.videoCtaTitle),
        videoCtaDescription: nullifyEmpty(form.videoCtaDescription),
        videoCtaButtonLabel: nullifyEmpty(form.videoCtaButtonLabel),
        features: form.features.map((f) => ({
          title: f.title.trim(),
          description: f.description.trim(),
          icon: f.icon || "sparkles",
          imageKey: f.imageKey || undefined,
        })),
      },
      "Features saved",
    );
  };

  return (
    <SectionShell
      title="Features"
      description="The zig-zag feature list plus the 'watch demo' card."
      viewHref={`/erp/${slug}#features`}
      loading={loading || !form}
      saving={saving}
      onSave={onSave}
    >
      {form ? (
        <>
          <FieldGroup title="Section header">
            <div className="contents">
              <TextField
                label="Section tag"
                placeholder="Features"
                value={form.featuresTag}
                onChange={(v) => patch({ featuresTag: v })}
              />
              <TextField
                label="Section title (optional)"
                value={form.featuresSectionTitle}
                onChange={(v) => patch({ featuresSectionTitle: v })}
              />
            </div>
            <TextAreaField
              label="Section description"
              rows={2}
              value={form.featuresSectionDescription}
              onChange={(v) => patch({ featuresSectionDescription: v })}
            />
          </FieldGroup>

          <FieldGroup title="Demo video card">
            <VideoField
              label="Demo video"
              hint="MP4 or WebM, up to 500MB. Plays in the module page's 'Watch Demo' modal."
              objectKey={form.videoUrl}
              previewUrl={form.videoPreview}
              uploadEndpoint="/api/admin/modules/upload-video"
              onChange={(key, url) =>
                patch({ videoUrl: key, videoPreview: url || undefined })
              }
            />
            <TextField
              label="Card title (optional)"
              value={form.videoCtaTitle}
              onChange={(v) => patch({ videoCtaTitle: v })}
            />
            <TextAreaField
              label="Card description (optional)"
              rows={2}
              value={form.videoCtaDescription}
              onChange={(v) => patch({ videoCtaDescription: v })}
            />
            <TextField
              label="Button label (optional)"
              placeholder="Watch Demo"
              value={form.videoCtaButtonLabel}
              onChange={(v) => patch({ videoCtaButtonLabel: v })}
            />
          </FieldGroup>

          <RepeatableList<Feature>
            label="Features"
            items={form.features}
            onChange={(v) => patch({ features: v })}
            rowTitle={(f) => f.title}
            addLabel="Add feature"
            makeEmpty={() => ({ title: "", description: "", icon: "sparkles" })}
            renderRow={(feat, update) => (
              <>
                <TextField
                  label="Title"
                  value={feat.title}
                  onChange={(v) => update({ title: v })}
                />
                <TextAreaField
                  label="Description"
                  rows={3}
                  value={feat.description}
                  onChange={(v) => update({ description: v })}
                />
                <TextField
                  label="Icon key"
                  value={feat.icon}
                  onChange={(v) => update({ icon: v })}
                />
                <ImageField
                  label="Feature image"
                  objectKey={feat.imageKey ?? ""}
                  previewUrl={feat.imageUrl}
                  uploadEndpoint="/api/admin/modules/upload"
                  onChange={(key, url) =>
                    update({ imageKey: key || undefined, imageUrl: url })
                  }
                />
              </>
            )}
          />
        </>
      ) : null}
    </SectionShell>
  );
}
