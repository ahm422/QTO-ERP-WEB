import Hero from './_components/Hero';
import TrustedBy from './_components/TrustedBy';
import HomeStats from './_components/HomeStats';
import BuiltFor from './_components/BuiltFor';
import IntegratedModules from './_components/IntegratedModules';
import IndustryEcosystems from './_components/IndustryEcosystems';
import Faqs from './_components/Faqs';
import { CTASection } from '@/components/ui/CTASection';
import {
  getHomeHero,
  listHeroOrbitModules,
  listPublishedModules,
} from '@/lib/content-db';
import { toOrbitModuleDefs } from '@/lib/hero-orbit';
import { ORBIT_DEFAULT_MODULES } from '@/components/ui/orbit-motif';

export default async function Home() {
  const [hero, modules, orbitSource] = await Promise.all([
    getHomeHero(),
    listPublishedModules(),
    listHeroOrbitModules(),
  ]);
  const mapped = toOrbitModuleDefs(orbitSource);
  const orbitModules = mapped.length > 0 ? mapped : ORBIT_DEFAULT_MODULES;

  return (
    <>
      <Hero hero={hero} orbitModules={orbitModules} />
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
