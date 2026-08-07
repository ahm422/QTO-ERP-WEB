'use client';
import { HeaderSections } from '@/components/ui/HeaderSections'
import { FAQAccordion } from '@/components/ui/faq'
import { generalFaqs } from '@/lib/testimonials'

const Faqs = () => {
  return (
    <>
    {/* FAQ */}
      <section id="faq" className="section-padding">
        <div className="container-main">
          <HeaderSections tag="FAQ" title="Common" accent="Questions" />
          <FAQAccordion faqs={generalFaqs.slice(0, 5)} showNumbers={false} />
        </div>
      </section>

</>
  )
}

export default Faqs