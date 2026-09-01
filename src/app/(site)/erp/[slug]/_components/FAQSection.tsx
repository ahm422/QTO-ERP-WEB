'use client';
import { HeaderSections} from '@/components/ui/HeaderSections';
import { FAQAccordion } from '@/components/ui/faq';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  app: {
    faqs: FAQ[];
    faqSectionTag: string;
    faqSectionTitle: string;
  };
}

export default function FAQSection({ app }: FAQSectionProps) {
  return (
    <section id="faq" className="section-padding bg-muted/30">
      <div className="container-main">
        <HeaderSections tag={app.faqSectionTag} title={app.faqSectionTitle} />
        <FAQAccordion faqs={app.faqs} />
      </div>
    </section>
  );
}
