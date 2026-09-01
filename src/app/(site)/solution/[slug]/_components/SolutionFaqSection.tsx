import { FAQAccordion } from "@/components/ui/faq";
import { HeaderSections } from "@/components/ui/HeaderSections";
import type { SolutionFAQType } from "@/types/solution";

type SolutionFaqSectionProps = {
  tag: string;
  title: string;
  faqs: SolutionFAQType[];
};

export default function SolutionFaqSection({
  tag,
  title,
  faqs,
}: SolutionFaqSectionProps) {
  if (!faqs || faqs.length === 0) return null;
  return (
    <section className="section-padding bg-muted/30">
      <div className="container-main">
        <HeaderSections tag={tag} title={title} />
        <FAQAccordion faqs={faqs} />
      </div>
    </section>
  );
}
