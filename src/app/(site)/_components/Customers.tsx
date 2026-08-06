import {
  TESTIMONIALS_SECTION_DESCRIPTION,
  TESTIMONIALS_SECTION_TAG,
  TESTIMONIALS_SECTION_TITLE,
} from '@/lib/copy';
import { globalTestimonials } from '@/lib/testimonials';
import ClientsMarquee from './Clientsmarquee';
import TestimonialCarousel from '@/components/common/TestimonialSection';
import { HeaderSections } from '@/components/ui/HeaderSections';

const Customers = () => {
  return (
    <>
      <section className='section-padding bg-accent/5'>
        <div className='container-main'>
          <div className='pb-16 md:pb-20'>
            <ClientsMarquee />
          </div>
          <HeaderSections
            tag={TESTIMONIALS_SECTION_TAG}
            title={TESTIMONIALS_SECTION_TITLE}
            description={TESTIMONIALS_SECTION_DESCRIPTION}
          />
          <TestimonialCarousel
            testimonials={globalTestimonials}
            showStats
            autoPlay={true}
          />
        </div>
      </section>
    </>
  );
};

export default Customers;
