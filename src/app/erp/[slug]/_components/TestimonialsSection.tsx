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
          tag='Testimonials'
          title='What Our Users Say'
          description='See how organizations are transforming their operations with our platform.'
        />
        <TestimonialCarousel testimonials={app.testimonials} autoPlay={true} />
      </div>
    </section>
  );
}
