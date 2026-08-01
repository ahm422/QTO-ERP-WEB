import {
  TESTIMONIALS_SECTION_DESCRIPTION,
  TESTIMONIALS_SECTION_TAG,
  TESTIMONIALS_SECTION_TITLE,
} from '@/lib/copy';
import ClientsMarquee from './Clientsmarquee';
import TestimonialCarousel from '@/components/common/TestimonialSection';
import { HeaderSections } from '@/components/ui/HeaderSections';

const testimonials = [
  {
    content:
      'This ERP platform has completely transformed how we manage our team. The intuitive interface and powerful features have saved us countless hours every week.',
    name: 'Sarah Johnson',
    role: 'CEO',
    company: 'TechCorp Inc.',
    rating: 5,
  },
  {
    content:
      "The best investment we've made for our business. The attendance tracking and project management features are game-changers.",
    name: 'Michael Chen',
    role: 'Operations Director',
    company: 'Global Solutions',
    rating: 5,
  },
  {
    content:
      "We've tried many ERP solutions, but this one stands out. The customer support is exceptional and the platform keeps getting better.",
    name: 'Emily Rodriguez',
    role: 'HR Manager',
    company: 'Innovate Labs',
    rating: 5,
  },
];
const Customers = () => {
  return (
    <>
      <section className='section-padding bg-accent/5'>
        <div className='max-w-360 mx-auto px-4'>
          <div className='pb-20'>
          <ClientsMarquee />
          </div>
          <HeaderSections
            tag={TESTIMONIALS_SECTION_TAG}
            title={TESTIMONIALS_SECTION_TITLE}
            description={TESTIMONIALS_SECTION_DESCRIPTION}
          />
          <TestimonialCarousel
            testimonials={testimonials}
            autoPlay={false}
          />
        </div>
      </section>
    </>
  );
};

export default Customers;
