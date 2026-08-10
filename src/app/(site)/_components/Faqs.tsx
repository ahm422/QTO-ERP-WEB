'use client';

import { HeaderSections } from '@/components/ui/HeaderSections';
import { FAQAccordion } from '@/components/ui/faq';
import type { FaqItem, HomeSectionHeader } from '@/types/content';

type FaqsProps = {
  section: HomeSectionHeader;
  faqs: FaqItem[];
};

const Faqs = ({ section, faqs }: FaqsProps) => {
  return (
    <section id="faq" className="section-padding">
      <div className="container-main">
        <HeaderSections
          tag={section.tag}
          title={section.title}
          accent={section.accent}
        />
        <FAQAccordion faqs={faqs} showNumbers={false} />
      </div>
    </section>
  );
};

export default Faqs;
