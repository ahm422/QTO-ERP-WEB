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
} from "@/components/admin/section-editor/fields";
import type { Problem } from "@/types/problem";

type Form = { problems: Problem[] };

const toForm = (i: Record<string, unknown>): Form => ({
  problems: Array.isArray(i.problems) ? (i.problems as Problem[]) : [],
});

export default function ModuleProblemsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { item, loading, saving, save } = useAdminResource(
    `/api/admin/modules/${slug}`,
  );
  const [form, , patch] = useSectionForm(item, toForm);

  const onSave = () => {
    if (!form) return;
    void save(
      {
        problems: form.problems.map((p) => ({
          problem: p.problem.trim(),
          solution: p.solution.trim(),
        })),
      },
      "Problems saved",
    );
  };

  return (
    <SectionShell
      title="Problems"
      description="Problem → solution pairs powering the pain-point block."
      viewHref={`/erp/${slug}`}
      loading={loading || !form}
      saving={saving}
      onSave={onSave}
    >
      {form ? (
        <RepeatableList<Problem>
          label="Problem / solution pairs"
          items={form.problems}
          onChange={(v) => patch({ problems: v })}
          rowTitle={(p) => p.problem}
          addLabel="Add pair"
          makeEmpty={() => ({ problem: "", solution: "" })}
          renderRow={(row, update) => (
            <>
              <TextAreaField
                label="Problem"
                rows={2}
                value={row.problem}
                onChange={(v) => update({ problem: v })}
              />
              <TextAreaField
                label="Solution"
                rows={2}
                value={row.solution}
                onChange={(v) => update({ solution: v })}
              />
            </>
          )}
        />
      ) : null}
    </SectionShell>
  );
}
