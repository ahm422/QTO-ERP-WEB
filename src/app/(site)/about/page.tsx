import AboutHero from "./_components/AboutHero";
import StorySection from "./_components/StorySection";
import ValuesSection from "./_components/ValuesSection";
import { CTASection } from "@/components/ui/CTASection";
import { getAboutPageContent } from "@/lib/content-db";

export default async function About() {
  const { hero, story, values, cta } = await getAboutPageContent();

  return (
    <>
      <AboutHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        subtitle={hero.subtitle}
      />
      <StorySection story={story} />
      <ValuesSection values={values} />
      <CTASection
        eyebrow={cta.tag}
        headline={cta.title}
        description={cta.description}
        primaryLabel={cta.primaryCta.label}
        primaryHref={cta.primaryCta.url}
        secondaryLabel={cta.secondaryCta.label}
        secondaryHref={cta.secondaryCta.url}
      />
    </>
  );
}
