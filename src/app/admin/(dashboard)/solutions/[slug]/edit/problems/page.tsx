"use client";

import { useParams } from "next/navigation";
import {
  useAdminResource,
  useSectionForm,
} from "@/components/admin/section-editor/useAdminResource";
import { SectionShell } from "@/components/admin/section-editor/SectionShell";
import {
  RepeatableList,
  TextAreaField,
  TextField,
} from "@/components/admin/section-editor/fields";
import type { SolutionProblem } from "@/types/solution";

type Form = { problems: SolutionProblem[] };

const toForm = (i: Record<string, unknown>): Form => ({
  problems: Array.isArray(i.problems)
    ? (i.problems as SolutionProblem[])
    : [],
});

export default function SolutionProblemsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { item, loading, saving, save } = useAdminResource(
    `/api/admin/solutions/${slug}`,
  );
  const [form, , patch] = useSectionForm(item, toForm);

  const onSave = () => {
    if (!form) return;
    void save(
      {
        problems: form.problems.map((p) => ({
          title: p.title.trim(),
          description: p.description.trim(),
        })),
      },
      "Problems saved",
    );
  };

  return (
    <SectionShell
      title="Problems"
      description="Pain points this solution addresses."
      viewHref={`/solution/${slug}`}
      loading={loading || !form}
      saving={saving}
      onSave={onSave}
    >
      {form ? (
        <RepeatableList<SolutionProblem>
          label="Problems"
          items={form.problems}
          onChange={(v) => patch({ problems: v })}
          rowTitle={(p) => p.title}
          addLabel="Add problem"
          makeEmpty={() => ({ title: "", description: "" })}
          renderRow={(p, update) => (
            <>
              <TextField
                label="Title"
                value={p.title}
                onChange={(v) => update({ title: v })}
              />
              <TextAreaField
                label="Description"
                rows={2}
                value={p.description}
                onChange={(v) => update({ description: v })}
              />
            </>
          )}
        />
      ) : null}
    </SectionShell>
  );
}
