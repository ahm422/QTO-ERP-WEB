"use client";

import { useParams } from "next/navigation";
import { adminUpload } from "@/lib/admin-fetch";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import {
  nullifyEmpty,
  str,
  useAdminResource,
  useSectionForm,
} from "@/components/admin/section-editor/useAdminResource";
import { SectionShell } from "@/components/admin/section-editor/SectionShell";
import {
  Field,
  ImageField,
  RepeatableList,
  StringListField,
  TextField,
} from "@/components/admin/section-editor/fields";
import type { AboutContentType } from "@/types/about";

type Section = AboutContentType & { imageUrl?: string };

/** Resolve a stored image value (R2 key or path) to a previewable URL. */
function previewOf(image?: string): string | undefined {
  if (!image) return undefined;
  if (image.startsWith("http") || image.startsWith("/")) return image;
  return `/api/media/${image}`;
}

type Form = {
  aboutTag: string;
  aboutTitle: string;
  aboutSectionHeadings: string[];
  aboutDescription: string[];
  aboutContents: Section[];
};

const toForm = (i: Record<string, unknown>): Form => ({
  aboutTag: str(i.aboutTag),
  aboutTitle: str(i.aboutTitle),
  aboutSectionHeadings: Array.isArray(i.aboutSectionHeadings)
    ? (i.aboutSectionHeadings as string[])
    : [],
  aboutDescription: Array.isArray(i.aboutDescription)
    ? (i.aboutDescription as string[])
    : [],
  aboutContents: Array.isArray(i.aboutContents)
    ? (i.aboutContents as Section[]).map((s) => ({
        ...s,
        imageUrl: previewOf(s.image),
      }))
    : [],
});

async function uploadModuleImageUrl(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const data = await adminUpload<{ imageUrl?: string }>(
    "/api/admin/modules/upload",
    fd,
  );
  if (!data.imageUrl) throw new Error("Upload failed");
  return data.imageUrl;
}

export default function ModuleAboutPage() {
  const { slug } = useParams<{ slug: string }>();
  const { item, loading, saving, save } = useAdminResource(
    `/api/admin/modules/${slug}`,
  );
  const [form, , patch] = useSectionForm(item, toForm);

  const onSave = () => {
    if (!form) return;
    void save(
      {
        aboutTag: nullifyEmpty(form.aboutTag),
        aboutTitle: form.aboutTitle.trim(),
        aboutSectionHeadings: form.aboutSectionHeadings
          .map((h) => h.trim())
          .filter(Boolean),
        aboutDescription: form.aboutDescription
          .map((p) => p.trim())
          .filter(Boolean),
        aboutContents: form.aboutContents.map((s, idx) => ({
          id: idx + 1,
          tag: s.tag ?? "",
          title: s.title ?? "",
          description: s.description ?? "",
          image: s.image || undefined,
          imageAlt: s.imageAlt || undefined,
        })),
      },
      "About section saved",
    );
  };

  return (
    <SectionShell
      title="About / Story"
      description="The narrative block. Each content section has a rich-text body and its own image. Section headings label the fallback tabs when no content sections are set."
      viewHref={`/erp/${slug}#about`}
      loading={loading || !form}
      saving={saving}
      onSave={onSave}
    >
      {form ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Section tag"
              placeholder="About"
              value={form.aboutTag}
              onChange={(v) => patch({ aboutTag: v })}
            />
            <TextField
              label="Section title"
              value={form.aboutTitle}
              onChange={(v) => patch({ aboutTitle: v })}
            />
          </div>

          <StringListField
            label="Fallback tab headings"
            hint="Used only when there are no rich content sections below (paired with the plain paragraphs)."
            values={form.aboutSectionHeadings}
            onChange={(v) => patch({ aboutSectionHeadings: v })}
          />
          <StringListField
            label="Fallback paragraphs"
            hint="Plain-text paragraphs shown when no rich content sections exist."
            values={form.aboutDescription}
            onChange={(v) => patch({ aboutDescription: v })}
          />

          <RepeatableList<Section>
            label="Content sections (rich)"
            hint="Each renders as a titled block with body copy and an image."
            items={form.aboutContents}
            onChange={(v) => patch({ aboutContents: v })}
            rowTitle={(s) => s.title || s.tag}
            addLabel="Add content section"
            makeEmpty={() => ({
              id: form.aboutContents.length + 1,
              tag: "",
              title: "",
              description: "",
            })}
            renderRow={(section, update) => (
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField
                    label="Tag"
                    value={section.tag}
                    onChange={(v) => update({ tag: v })}
                  />
                  <TextField
                    label="Title"
                    value={section.title}
                    onChange={(v) => update({ title: v })}
                  />
                </div>
                <Field label="Body">
                  <RichTextEditor
                    content={section.description}
                    onChange={(html) => update({ description: html })}
                    onUploadImage={uploadModuleImageUrl}
                    placeholder="Describe this part of the story…"
                  />
                </Field>
                <ImageField
                  label="Section image"
                  objectKey={section.image ?? ""}
                  previewUrl={section.imageUrl}
                  uploadEndpoint="/api/admin/modules/upload"
                  onChange={(key, url) =>
                    update({ image: key || undefined, imageUrl: url })
                  }
                />
                <TextField
                  label="Image alt text"
                  value={section.imageAlt ?? ""}
                  onChange={(v) => update({ imageAlt: v })}
                />
              </div>
            )}
          />
        </>
      ) : null}
    </SectionShell>
  );
}
