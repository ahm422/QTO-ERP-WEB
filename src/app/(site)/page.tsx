import Hero from "./_components/Hero";
import TrustedBy from "./_components/TrustedBy";
import HomeStats from "./_components/HomeStats";
import BuiltFor from "./_components/BuiltFor";
import IntegratedModules from "./_components/IntegratedModules";
import IndustryEcosystems from "./_components/IndustryEcosystems";
import Faqs from "./_components/Faqs";
import { CTASection } from "@/components/ui/CTASection";
import {
  getBuiltForSection,
  getHomeFaqs,
  getHomeFinalCta,
  getHomeHero,
  getIndustryEcosystemSection,
  listHeroOrbitModules,
  listPublishedHomeStats,
  listPublishedModules,
  listPublishedTrustedLogos,
} from "@/lib/content-db";
import { toOrbitModuleDefs } from "@/lib/hero-orbit";
import { ORBIT_DEFAULT_MODULES } from "@/components/ui/orbit-motif";

export default async function Home() {
  const [
    hero,
    modules,
    orbitSource,
    trustedLogos,
    stats,
    builtFor,
    ecosystem,
    homeFaqs,
    finalCta,
  ] = await Promise.all([
    getHomeHero(),
    listPublishedModules(),
    listHeroOrbitModules(),
    listPublishedTrustedLogos(),
    listPublishedHomeStats(),
    getBuiltForSection(),
    getIndustryEcosystemSection(),
    getHomeFaqs(),
    getHomeFinalCta(),
  ]);
  const mapped = toOrbitModuleDefs(orbitSource);
  const orbitModules = mapped.length > 0 ? mapped : ORBIT_DEFAULT_MODULES;

  return (
    <>
      <Hero hero={hero} orbitModules={orbitModules} />
      <TrustedBy logos={trustedLogos} />
      <HomeStats stats={stats} />
      <BuiltFor data={builtFor} />
      <IntegratedModules modules={modules} />
      <IndustryEcosystems data={ecosystem} />
      <Faqs section={homeFaqs.section} faqs={homeFaqs.faqs} />
      <CTASection
        eyebrow={finalCta.tag}
        headline={finalCta.title}
        description={finalCta.description}
        primaryLabel={finalCta.primaryCta.label}
        primaryHref={finalCta.primaryCta.url}
        secondaryLabel={finalCta.secondaryCta.label}
        secondaryHref={finalCta.secondaryCta.url}
      />
    </>
  );
}
