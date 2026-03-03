'use client';
import { CTASection } from '@/components/ui/CTASection';
import AboutHero from './_components/AboutHero';
import StorySection from './_components/StorySection';
import ValuesSection from './_components/ValuesSection';

export default function About() {
  return (
    <>
      <AboutHero />
      <StorySection />
      <ValuesSection />
      <CTASection />
    </>
  );
}
