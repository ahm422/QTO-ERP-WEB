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
  TextAreaField,
  TextField,
  previewMediaSrc,
  storedImageFromPicker,
} from "@/components/admin/section-editor/fields";

type Form = {
  tabsIntroTag: string;
  tabsIntroTitle: string;
  tabsIntroDescription: string;
  tabImageFallback: string;
};

const toForm = (i: Record<string, unknown>): Form => ({
  tabsIntroTag: str(i.tabsIntroTag),
  tabsIntroTitle: str(i.tabsIntroTitle),
  tabsIntroDescription: str(i.tabsIntroDescription),
  tabImageFallback: str(i.tabImageFallback),
});

export default function SolutionTabsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { item, loading, saving, save } = useAdminResource(
    `/api/admin/solutions/${slug}`,
  );
  const [form, , patch] = useSectionForm(item, toForm);

  const onSave = () => {
    if (!form) return;
    void save(
      {
        tabsIntroTag: nullifyEmpty(form.tabsIntroTag),
        tabsIntroTitle: nullifyEmpty(form.tabsIntroTitle),
        tabsIntroDescription: nullifyEmpty(form.tabsIntroDescription),
        tabImageFallback: nullifyEmpty(form.tabImageFallback),
      },
      "Tabs saved",
    );
  };

  return (
    <SectionShell
      title="Tabs"
      description="Capability-tabs intro and the image used when a feature has none. Blank = default."
      viewHref={`/solution/${slug}`}
      loading={loading || !form}
      saving={saving}
      onSave={onSave}
    >
      {form ? (
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
          <ImageField
            label="Tab image fallback"
            library
            objectKey={form.tabImageFallback}
            previewUrl={previewMediaSrc(form.tabImageFallback)}
            uploadEndpoint="/api/admin/solutions/upload"
            onChange={(key, url) =>
              patch({ tabImageFallback: storedImageFromPicker(key, url) })
            }
          />
        </FieldGroup>
      ) : null}
    </SectionShell>
  );
}
