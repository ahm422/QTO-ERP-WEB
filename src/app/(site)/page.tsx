import Hero from './_components/Hero';
import Platforms from './_components/Platforms';
import Customers from './_components/Customers';
import Faqs from './_components/Faqs';
import QTODev from './_components/QTODev';
import { CTASection } from '@/components/ui/CTASection';
import Subscribe from './_components/Subscribe';
import StatsStrip from '@/components/common/Stats';
import { listPublishedModules } from '@/lib/content-db';

const stats = [
    { value: 10, suffix: 'K+', label: 'Active Users', icon: '' },
    { value: 4.9, suffix: '+', label: 'Average Rating', icon: '' },
    { value: 99, suffix: '%', label: 'Satisfaction', icon: '' },
  ];

export default async function Home() {
  const modules = await listPublishedModules();
  return (
    <>
      <Hero />
      <Platforms modules={modules} />
      <Customers />
      <StatsStrip stats={stats} />
      <Faqs />
      <QTODev />
      <CTASection />
      <Subscribe />
    </>
  );
}
