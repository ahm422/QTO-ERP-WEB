"use client";

import { useParams } from "next/navigation";
import { ALLOWED_ROLLOUT_ICON_KEYS } from "@/lib/icon-map";
import {
  nullifyEmpty,
  str,
  useAdminResource,
  useSectionForm,
} from "@/components/admin/section-editor/useAdminResource";
import { SectionShell } from "@/components/admin/section-editor/SectionShell";
import {
  RepeatableList,
  SelectField,
  TextAreaField,
  TextField,
} from "@/components/admin/section-editor/fields";
import type { ModuleRolloutStep } from "@/types/module-cms";

type Form = {
  rolloutTag: string;
  rolloutTitleTemplate: string;
  rolloutDescription: string;
  rolloutSteps: ModuleRolloutStep[];
};

const toForm = (i: Record<string, unknown>): Form => ({
  rolloutTag: str(i.rolloutTag),
  rolloutTitleTemplate: str(i.rolloutTitleTemplate),
  rolloutDescription: str(i.rolloutDescription),
  rolloutSteps: Array.isArray(i.rolloutSteps)
    ? (i.rolloutSteps as ModuleRolloutStep[])
    : [],
});

export default function ModuleRolloutPage() {
  const { slug } = useParams<{ slug: string }>();
  const { item, loading, saving, save } = useAdminResource(
    `/api/admin/modules/${slug}`,
  );
  const [form, , patch] = useSectionForm(item, toForm);

  const onSave = () => {
    if (!form) return;
    void save(
      {
        rolloutTag: nullifyEmpty(form.rolloutTag),
        rolloutTitleTemplate: nullifyEmpty(form.rolloutTitleTemplate),
        rolloutDescription: nullifyEmpty(form.rolloutDescription),
        rolloutSteps: form.rolloutSteps.map((s, idx) => ({
          step: idx + 1,
          title: s.title.trim(),
          description: s.description.trim(),
          iconKey: s.iconKey || "clipboard-check",
        })),
      },
      "Rollout saved",
    );
  };

  return (
    <SectionShell
      title="Rollout"
      description="The implementation-timeline block. Steps are auto-numbered by order."
      viewHref={`/erp/${slug}`}
      loading={loading || !form}
      saving={saving}
      onSave={onSave}
    >
      {form ? (
        <>
          <div className="contents">
            <TextField
              label="Section tag"
              value={form.rolloutTag}
              onChange={(v) => patch({ rolloutTag: v })}
            />
            <TextField
              label="Title template ({name} = module name)"
              value={form.rolloutTitleTemplate}
              onChange={(v) => patch({ rolloutTitleTemplate: v })}
            />
          </div>
          <TextAreaField
            label="Description"
            rows={2}
            value={form.rolloutDescription}
            onChange={(v) => patch({ rolloutDescription: v })}
          />
          <RepeatableList<ModuleRolloutStep>
            label="Steps"
            items={form.rolloutSteps}
            onChange={(v) => patch({ rolloutSteps: v })}
            rowTitle={(s) => s.title}
            addLabel="Add step"
            makeEmpty={() => ({
              step: form.rolloutSteps.length + 1,
              title: "",
              description: "",
              iconKey: "clipboard-check",
            })}
            renderRow={(step, update) => (
              <>
                <SelectField
                  label="Icon"
                  value={step.iconKey}
                  options={ALLOWED_ROLLOUT_ICON_KEYS}
                  onChange={(v) => update({ iconKey: v })}
                />
                <TextField
                  label="Title"
                  value={step.title}
                  onChange={(v) => update({ title: v })}
                />
                <TextAreaField
                  label="Description"
                  rows={2}
                  value={step.description}
                  onChange={(v) => update({ description: v })}
                />
              </>
            )}
          />
        </>
      ) : null}
    </SectionShell>
  );
}
