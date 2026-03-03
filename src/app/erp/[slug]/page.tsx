'use client';
import NotFound from '@/components/ui/notfound';
import { apps, getAppBySlug } from '@/lib/apps';
import { CTASection } from '@/components/ui//CTASection';
import { VideoModal } from '@/components/ui/VedioModal';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import HeroSection from './_components/HeroSection';
import AboutSection from './_components/AboutSection';
import FeaturesSection from './_components/FeaturesSection';
import TestimonialsSection from './_components/TestimonialsSection';
import FAQSection from './_components/FAQSection';
import AllAppsSection from './_components/AllAppsSection';

export default function PlatformDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const app = getAppBySlug(slug);

  const [videoOpen, setVideoOpen] = useState(false);
  if (!app) return <NotFound />;

  return (
    <>
      <HeroSection app={app} onVideoOpen={() => setVideoOpen(true)} />
      <AboutSection app={app} />
      <FeaturesSection app={app} onVideoOpen={() => setVideoOpen(true)} />
      <TestimonialsSection app={app} />
      <FAQSection app={app} />
      <AllAppsSection apps={apps} />
      <CTASection />
      <VideoModal isOpen={videoOpen} onClose={() => setVideoOpen(false)} />
    </>
  );
}
