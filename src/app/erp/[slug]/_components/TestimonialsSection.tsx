'use client';
import TestimonialCarousel from '@/components/common/TestimonialSection';
import { HeaderSections } from '@/components/ui/HeaderSections';
import {
  TESTIMONIALS_SECTION_DESCRIPTION,
  TESTIMONIALS_SECTION_TAG,
  TESTIMONIALS_SECTION_TITLE,
} from '@/lib/copy';
import { PlatformType } from '@/types';

interface TestimonialsSectionProps {
  app: PlatformType;
}

export default function TestimonialsSection({ app }: TestimonialsSectionProps) {
  return (
    <section id='testimonials' className='section-padding'>
      <div className='container-main'>
        <HeaderSections
          tag={app.testimonialsSectionTag ?? TESTIMONIALS_SECTION_TAG}
          title={app.testimonialsSectionTitle ?? TESTIMONIALS_SECTION_TITLE}
          description={app.testimonialsSectionDescription ?? TESTIMONIALS_SECTION_DESCRIPTION}
        />
        <TestimonialCarousel testimonials={app.testimonials} autoPlay={true} />
      </div>
    </section>
  );
}
