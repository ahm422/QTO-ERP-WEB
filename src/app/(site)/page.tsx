import Hero from './_components/Hero';
import TrustedBy from './_components/TrustedBy';
import HomeStats from './_components/HomeStats';
import BuiltFor from './_components/BuiltFor';
import IntegratedModules from './_components/IntegratedModules';
import IndustryEcosystems from './_components/IndustryEcosystems';
import Faqs from './_components/Faqs';
import { CTASection } from '@/components/ui/CTASection';
import { listPublishedModules } from '@/lib/content-db';

export default async function Home() {
  const modules = await listPublishedModules();
  return (
    <>
      <Hero />
      <TrustedBy />
      <HomeStats />
      <BuiltFor />
      <IntegratedModules modules={modules} />
      <IndustryEcosystems />
      <Faqs />
      <CTASection
        eyebrow="Next step"
        headline="Ready to Transform Your Operations?"
        description="See how QTO-ERP fits your workflows — book a demo or compare plans."
      />
    </>
  );
}
