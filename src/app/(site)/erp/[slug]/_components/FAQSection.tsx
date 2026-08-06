'use client';
import { HeaderSections} from '@/components/ui/HeaderSections';
import { FAQAccordion } from '@/components/ui/faq';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQSectionProps {
  app: {
    name: string;
    faqs: FAQ[];
  };
}

export default function FAQSection({ app }: FAQSectionProps) {
  return (
    <section id="faq" className="section-padding bg-muted/30">
      <div className="container-main">
        <HeaderSections tag="FAQ" title={`${app.name} FAQ`} />
        <FAQAccordion faqs={app.faqs} />
      </div>
    </section>
  );
}
