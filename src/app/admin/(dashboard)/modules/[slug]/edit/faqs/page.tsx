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
  RepeatableList,
  TextAreaField,
  TextField,
} from "@/components/admin/section-editor/fields";
import type { FAQ } from "@/types/faq";

type Form = {
  faqSectionTag: string;
  faqSectionTitleTemplate: string;
  faqs: FAQ[];
};

const toForm = (i: Record<string, unknown>): Form => ({
  faqSectionTag: str(i.faqSectionTag),
  faqSectionTitleTemplate: str(i.faqSectionTitleTemplate),
  faqs: Array.isArray(i.faqs) ? (i.faqs as FAQ[]) : [],
});

export default function ModuleFaqsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { item, loading, saving, save } = useAdminResource(
    `/api/admin/modules/${slug}`,
  );
  const [form, , patch] = useSectionForm(item, toForm);

  const onSave = () => {
    if (!form) return;
    void save(
      {
        faqSectionTag: nullifyEmpty(form.faqSectionTag),
        faqSectionTitleTemplate: nullifyEmpty(form.faqSectionTitleTemplate),
        faqs: form.faqs.map((f) => ({
          question: f.question.trim(),
          answer: f.answer.trim(),
        })),
      },
      "FAQs saved",
    );
  };

  return (
    <SectionShell
      title="FAQs"
      description="Accordion questions at the bottom of the module page."
      viewHref={`/erp/${slug}#faq`}
      loading={loading || !form}
      saving={saving}
      onSave={onSave}
    >
      {form ? (
        <>
          <div className="contents">
            <TextField
              label="Section tag"
              placeholder="FAQ"
              value={form.faqSectionTag}
              onChange={(v) => patch({ faqSectionTag: v })}
            />
            <TextField
              label="Title template ({name} = module name)"
              placeholder="{name} FAQ"
              value={form.faqSectionTitleTemplate}
              onChange={(v) => patch({ faqSectionTitleTemplate: v })}
            />
          </div>
          <RepeatableList<FAQ>
            label="Questions"
            items={form.faqs}
            onChange={(v) => patch({ faqs: v })}
            rowTitle={(f) => f.question}
            addLabel="Add question"
            makeEmpty={() => ({ question: "", answer: "" })}
            renderRow={(f, update) => (
              <>
                <TextField
                  label="Question"
                  value={f.question}
                  onChange={(v) => update({ question: v })}
                />
                <TextAreaField
                  label="Answer"
                  rows={3}
                  value={f.answer}
                  onChange={(v) => update({ answer: v })}
                />
              </>
            )}
          />
        </>
      ) : null}
    </SectionShell>
  );
}
