import Hero from './_components/Hero';
import Platforms from './_components/Platforms';
import IndustryEcosystems from './_components/IndustryEcosystems';
import EvaluationWorkflow from './_components/EvaluationWorkflow';
import Customers from './_components/Customers';
import Faqs from './_components/Faqs';
import QTODev from './_components/QTODev';
import { CTASection } from '@/components/ui/CTASection';
import Subscribe from './_components/Subscribe';
import HomeStats from './_components/HomeStats';
import { listPublishedModules } from '@/lib/content-db';

export default async function Home() {
  const modules = await listPublishedModules();
  return (
    <>
      <Hero />
      <Platforms modules={modules} />
      <IndustryEcosystems />
      <EvaluationWorkflow />
      <Customers />
      <HomeStats />
      <Faqs />
      <QTODev />
      <CTASection
        eyebrow="Next step"
        headline="Ready to Transform Your Operations?"
        description="See how QTO-ERP fits your workflows — book a demo or compare plans."
      />
      <Subscribe />
    </>
  );
}
