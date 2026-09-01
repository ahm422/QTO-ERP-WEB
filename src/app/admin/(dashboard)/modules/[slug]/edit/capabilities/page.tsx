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
  RepeatableList,
  TextAreaField,
  TextField,
} from "@/components/admin/section-editor/fields";
import type { ModuleCapability } from "@/types/module-cms";

type Form = {
  capabilitiesTag: string;
  capabilitiesDescription: string;
  capabilities: ModuleCapability[];
};

const toForm = (i: Record<string, unknown>): Form => ({
  capabilitiesTag: str(i.capabilitiesTag),
  capabilitiesDescription: str(i.capabilitiesDescription),
  capabilities: Array.isArray(i.capabilities)
    ? (i.capabilities as ModuleCapability[])
    : [],
});

export default function ModuleCapabilitiesPage() {
  const { slug } = useParams<{ slug: string }>();
  const { item, loading, saving, save } = useAdminResource(
    `/api/admin/modules/${slug}`,
  );
  const [form, , patch] = useSectionForm(item, toForm);

  const onSave = () => {
    if (!form) return;
    void save(
      {
        capabilitiesTag: nullifyEmpty(form.capabilitiesTag),
        capabilitiesDescription: nullifyEmpty(form.capabilitiesDescription),
        capabilities: form.capabilities.map((c) => ({
          iconKey: c.iconKey || undefined,
          title: c.title.trim(),
          description: c.description.trim(),
          href: c.href || undefined,
        })),
      },
      "Capabilities saved",
    );
  };

  return (
    <SectionShell
      title="Capabilities"
      description="The three-card highlights row under the hero."
      viewHref={`/erp/${slug}`}
      loading={loading || !form}
      saving={saving}
      onSave={onSave}
    >
      {form ? (
        <>
          <FieldGroup
            title="Section header"
            hint="Leave blank to use the built-in defaults."
          >
            <TextField
              label="Section tag"
              placeholder="Capabilities"
              value={form.capabilitiesTag}
              onChange={(v) => patch({ capabilitiesTag: v })}
            />
            <TextAreaField
              label="Section description"
              value={form.capabilitiesDescription}
              rows={2}
              onChange={(v) => patch({ capabilitiesDescription: v })}
            />
          </FieldGroup>
          <RepeatableList<ModuleCapability>
            label="Capability cards"
            items={form.capabilities}
            onChange={(v) => patch({ capabilities: v })}
            rowTitle={(c) => c.title}
            addLabel="Add capability"
            makeEmpty={() => ({ title: "", description: "" })}
            renderRow={(cap, update) => (
              <>
                <TextField
                  label="Icon key (optional)"
                  value={cap.iconKey ?? ""}
                  onChange={(v) => update({ iconKey: v })}
                />
                <TextField
                  label="Title"
                  value={cap.title}
                  onChange={(v) => update({ title: v })}
                />
                <TextAreaField
                  label="Description"
                  rows={2}
                  value={cap.description}
                  onChange={(v) => update({ description: v })}
                />
                <TextField
                  label="Link (optional, default #features)"
                  value={cap.href ?? ""}
                  onChange={(v) => update({ href: v })}
                />
              </>
            )}
          />
        </>
      ) : null}
    </SectionShell>
  );
}
