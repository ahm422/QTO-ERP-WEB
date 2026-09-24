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
import type { SolutionFAQType } from "@/types/solution";

type Form = {
  faqTag: string;
  faqTitle: string;
  solutionFaqs: SolutionFAQType[];
};

const toForm = (i: Record<string, unknown>): Form => ({
  faqTag: str(i.faqTag),
  faqTitle: str(i.faqTitle),
  solutionFaqs: Array.isArray(i.solutionFaqs)
    ? (i.solutionFaqs as SolutionFAQType[])
    : [],
});

export default function SolutionFaqsPage() {
  const { slug } = useParams<{ slug: string }>();
  const { item, loading, saving, save } = useAdminResource(
    `/api/admin/solutions/${slug}`,
  );
  const [form, , patch] = useSectionForm(item, toForm);

  const onSave = () => {
    if (!form) return;
    void save(
      {
        faqTag: nullifyEmpty(form.faqTag),
        faqTitle: nullifyEmpty(form.faqTitle),
        solutionFaqs: form.solutionFaqs.map((f) => ({
          question: f.question.trim(),
          answer: f.answer.trim(),
        })),
      },
      "FAQs saved",
    );
  };

  return (
    <SectionShell
      title="FAQ"
      description="Accordion questions. The whole block is hidden when there are none."
      viewHref={`/solution/${slug}`}
      loading={loading || !form}
      saving={saving}
      onSave={onSave}
    >
      {form ? (
        <>
          <div className="contents">
            <TextField
              label="Section tag"
              placeholder="Got Questions?"
              value={form.faqTag}
              onChange={(v) => patch({ faqTag: v })}
            />
            <TextField
              label="Section title"
              placeholder="Frequently Asked Questions"
              value={form.faqTitle}
              onChange={(v) => patch({ faqTitle: v })}
            />
          </div>
          <RepeatableList<SolutionFAQType>
            label="Questions"
            items={form.solutionFaqs}
            onChange={(v) => patch({ solutionFaqs: v })}
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
