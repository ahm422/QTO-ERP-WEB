'use client';
import TestimonialCarousel from '@/components/common/TestimonialSection';
import { HeaderSections } from '@/components/ui/HeaderSections';
import { PlatformType } from '@/types';

interface TestimonialsSectionProps {
  app: PlatformType;
}

export default function TestimonialsSection({ app }: TestimonialsSectionProps) {
  return (
    <section id='testimonials' className='section-padding'>
      <div className='container-main'>
        <HeaderSections
          tag='Client Testimonials'
          title='Trusted by Growing Organizations'
          description='Discover how businesses improve efficiency, accuracy, and workforce visibility using QTO ERP.'
        />
        <TestimonialCarousel testimonials={app.testimonials} autoPlay={true} />
      </div>
    </section>
  );
}
