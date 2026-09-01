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
  SelectField,
  StringListField,
  SwitchField,
  TextAreaField,
  TextField,
} from "@/components/admin/section-editor/fields";

const ICON_KEYS = [
  "clock",
  "users",
  "folder-kanban",
  "building-2",
  "dollar-sign",
  "trending-up",
] as const;

type Form = {
  slug: string;
  name: string;
  shortDescription: string;
  cardTagline: string;
  bestFor: string;
  iconKey: string;
  imageKey: string;
  imageUrl: string;
  highlights: string[];
  published: boolean;
  sortOrder: string;
  orbitRadius: string;
  orbitTilt: string;
  orbitPhase: string;
  orbitSpeed: string;
};

const toForm = (i: Record<string, unknown>): Form => ({
  slug: str(i.slug),
  name: str(i.name),
  shortDescription: str(i.shortDescription),
  cardTagline: str(i.cardTagline),
  bestFor: str(i.bestFor),
  iconKey: str(i.iconKey) || "clock",
  imageKey: str(i.imageKey),
  imageUrl: str(i.imageUrl),
  highlights: Array.isArray(i.highlights) ? (i.highlights as string[]) : [],
  published: Boolean(i.published),
  sortOrder: str(i.sortOrder ?? 0),
  orbitRadius: str(i.orbitRadius),
  orbitTilt: str(i.orbitTilt),
  orbitPhase: str(i.orbitPhase),
  orbitSpeed: str(i.orbitSpeed),
});

const num = (v: string) => (v.trim() ? Number(v) : null);

export default function ModuleBasicsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { item, loading, saving, save } = useAdminResource(
    `/api/admin/modules/${slug}`,
  );
  const [form, , patch] = useSectionForm(item, toForm);

  const onSave = () => {
    if (!form) return;
    void save(
      {
        slug: form.slug.trim(),
        name: form.name.trim(),
        shortDescription: form.shortDescription.trim(),
        cardTagline: nullifyEmpty(form.cardTagline),
        bestFor: form.bestFor.trim(),
        iconKey: form.iconKey,
        image: form.imageKey || null,
        highlights: form.highlights.map((h) => h.trim()).filter(Boolean),
        published: form.published,
        sortOrder: Number(form.sortOrder) || 0,
        orbitRadius: num(form.orbitRadius),
        orbitTilt: num(form.orbitTilt),
        orbitPhase: num(form.orbitPhase),
        orbitSpeed: num(form.orbitSpeed),
      },
      "Basics saved",
    );
  };

  return (
    <SectionShell
      title="Basics"
      description="Identity, card copy, listing image and hero-orbit placement."
      viewHref={`/erp/${slug}`}
      loading={loading || !form}
      saving={saving}
      onSave={onSave}
    >
      {form ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Slug"
              hint="URL segment — changing it moves the page (/erp/<slug>)."
              mono
              value={form.slug}
              onChange={(v) => patch({ slug: v })}
            />
            <TextField
              label="Name"
              value={form.name}
              onChange={(v) => patch({ name: v })}
            />
          </div>
          <TextAreaField
            label="Short description"
            hint="Used on listing cards and as the meta-description fallback."
            value={form.shortDescription}
            rows={2}
            onChange={(v) => patch({ shortDescription: v })}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Card tagline (optional)"
              value={form.cardTagline}
              onChange={(v) => patch({ cardTagline: v })}
            />
            <TextField
              label="Best for"
              value={form.bestFor}
              onChange={(v) => patch({ bestFor: v })}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Icon"
              value={form.iconKey}
              options={ICON_KEYS}
              onChange={(v) => patch({ iconKey: v })}
            />
            <TextField
              label="Sort order"
              value={form.sortOrder}
              onChange={(v) => patch({ sortOrder: v })}
            />
          </div>
          <ImageField
            label="Listing / fallback image"
            objectKey={form.imageKey}
            previewUrl={form.imageUrl}
            uploadEndpoint="/api/admin/modules/upload"
            onChange={(key, url) => patch({ imageKey: key, imageUrl: url })}
          />
          <StringListField
            label="Highlights"
            hint="Short bullet phrases shown on the module card."
            values={form.highlights}
            onChange={(v) => patch({ highlights: v })}
          />
          <SwitchField
            label="Published"
            hint="Unpublished modules 404 on the public site."
            checked={form.published}
            onChange={(v) => patch({ published: v })}
          />
          <div className="rounded-md border p-4">
            <p className="mb-3 text-sm font-medium">Hero-orbit placement</p>
            <div className="grid gap-4 sm:grid-cols-4">
              <TextField
                label="Radius"
                value={form.orbitRadius}
                onChange={(v) => patch({ orbitRadius: v })}
              />
              <TextField
                label="Tilt"
                value={form.orbitTilt}
                onChange={(v) => patch({ orbitTilt: v })}
              />
              <TextField
                label="Phase"
                value={form.orbitPhase}
                onChange={(v) => patch({ orbitPhase: v })}
              />
              <TextField
                label="Speed"
                value={form.orbitSpeed}
                onChange={(v) => patch({ orbitSpeed: v })}
              />
            </div>
          </div>
        </>
      ) : null}
    </SectionShell>
  );
}
