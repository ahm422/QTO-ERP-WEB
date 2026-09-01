"use client";

import { useParams } from "next/navigation";
import {
  str,
  useAdminResource,
  useSectionForm,
} from "@/components/admin/section-editor/useAdminResource";
import { SectionShell } from "@/components/admin/section-editor/SectionShell";
import {
  SwitchField,
  TextField,
} from "@/components/admin/section-editor/fields";

type Form = {
  slug: string;
  title: string;
  audience: string;
  published: boolean;
  sortOrder: string;
};

const toForm = (i: Record<string, unknown>): Form => ({
  slug: str(i.slug),
  title: str(i.title),
  audience: str(i.audience),
  published: Boolean(i.published),
  sortOrder: str(i.sortOrder ?? 0),
});

export default function SolutionBasicsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { item, loading, saving, save } = useAdminResource(
    `/api/admin/solutions/${slug}`,
  );
  const [form, , patch] = useSectionForm(item, toForm);

  const onSave = () => {
    if (!form) return;
    void save(
      {
        slug: form.slug.trim(),
        title: form.title.trim(),
        audience: form.audience.trim(),
        published: form.published,
        sortOrder: Number(form.sortOrder) || 0,
      },
      "Basics saved",
    );
  };

  return (
    <SectionShell
      title="Basics"
      description="Identity and listing placement."
      viewHref={`/solution/${slug}`}
      loading={loading || !form}
      saving={saving}
      onSave={onSave}
    >
      {form ? (
        <>
          <div className="contents">
            <TextField
              label="Slug"
              hint="URL segment — /solution/<slug>."
              mono
              value={form.slug}
              onChange={(v) => patch({ slug: v })}
            />
            <TextField
              label="Title"
              value={form.title}
              onChange={(v) => patch({ title: v })}
            />
          </div>
          <TextField
            label="Audience"
            hint="Short description of who this solution is for."
            value={form.audience}
            onChange={(v) => patch({ audience: v })}
          />
          <TextField
            label="Sort order"
            value={form.sortOrder}
            onChange={(v) => patch({ sortOrder: v })}
          />
          <SwitchField
            label="Published"
            hint="Unpublished solutions 404 on the public site."
            checked={form.published}
            onChange={(v) => patch({ published: v })}
          />
        </>
      ) : null}
    </SectionShell>
  );
}
