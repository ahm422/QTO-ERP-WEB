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
import { ImageIcon } from "lucide-react";
import {
  FieldGroup,
  SectionShell,
} from "@/components/admin/section-editor/SectionShell";
import {
  Field,
  ImageField,
  RepeatableList,
  StringListField,
  TextField,
} from "@/components/admin/section-editor/fields";
import { Button } from "@/components/ui/button";
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

  /** Seed rich content sections from the plain fallback paragraphs. */
  const convertParagraphs = () => {
    if (!form) return;
    const headings = form.aboutSectionHeadings;
    const sections: Section[] = form.aboutDescription
      .map((p) => p.trim())
      .filter(Boolean)
      .map((para, idx) => ({
        id: idx + 1,
        tag: headings[idx] ?? headings[0] ?? "",
        title: headings[idx] ?? headings[0] ?? "",
        description: `<p>${para
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")}</p>`,
      }));
    patch({ aboutContents: [...form.aboutContents, ...sections] });
  };

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
          <div className="contents">
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

          <div className="flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm text-muted-foreground lg:col-span-2">
            <ImageIcon className="mt-0.5 size-4 shrink-0 text-accent" />
            <p>
              <span className="font-medium text-foreground">
                Images live in the content sections below.
              </span>{" "}
              Add a section, then use the image button in the <em>Body</em>{" "}
              toolbar for inline images, and the <em>Section image</em> field for
              the block&apos;s main visual. The plain fallback paragraphs are
              text-only.
            </p>
          </div>

          <RepeatableList<Section>
            label="Content sections"
            hint="Each renders as a titled block with a rich-text body and an image. This is what shows on the page when set."
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
              <>
                <div className="contents">
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
                <Field label="Body" full>
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
              </>
            )}
          />

          <FieldGroup
            title="Fallback (text-only)"
            hint="Shown on the page only while there are no content sections above. No images here."
          >
            {form.aboutDescription.length > 0 &&
            form.aboutContents.length === 0 ? (
              <div className="lg:col-span-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={convertParagraphs}
                >
                  <ImageIcon className="mr-1.5 size-3.5" />
                  Convert paragraphs to content sections
                </Button>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  Copies each paragraph into a content section so you can add
                  images. Review, then Save.
                </p>
              </div>
            ) : null}
            <StringListField
              label="Fallback tab headings"
              values={form.aboutSectionHeadings}
              onChange={(v) => patch({ aboutSectionHeadings: v })}
            />
            <StringListField
              label="Fallback paragraphs"
              values={form.aboutDescription}
              onChange={(v) => patch({ aboutDescription: v })}
            />
          </FieldGroup>
        </>
      ) : null}
    </SectionShell>
  );
}
