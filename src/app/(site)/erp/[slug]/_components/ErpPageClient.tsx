"use client";

import { useCallback, useEffect, useState } from "react";
import { CTASection } from "@/components/ui//CTASection";
import { VideoModal } from "@/components/ui/VedioModal";
import HeroSection from "./HeroSection";
import AboutSection from "./AboutSection";
import FeaturesSection from "./FeaturesSection";
import TestimonialsSection from "./TestimonialsSection";
import FAQSection from "./FAQSection";
import AllAppsSection from "./AllAppsSection";
import type { ModuleDetail, ModuleSummary } from "@/types/content";

type DemoVideoItem = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  moduleSlug: string | null;
  contentType: string;
  playbackUrl: string;
  publishedAt: string | null;
};

type ErpPageClientProps = {
  app: ModuleDetail;
  allModules: ModuleSummary[];
};

export default function ErpPageClient({ app, allModules }: ErpPageClientProps) {
  const [videoOpen, setVideoOpen] = useState(false);
  const [playbackUrl, setPlaybackUrl] = useState<string | null>(null);
  const [videoTitle, setVideoTitle] = useState<string | null>(null);
  const [contentType, setContentType] = useState<string | null>(null);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const pickVideo = useCallback(
    (videos: DemoVideoItem[]) => {
      const forModule = videos.find((v) => v.moduleSlug === app.slug);
      return forModule ?? videos[0] ?? null;
    },
    [app.slug],
  );

  useEffect(() => {
    if (!videoOpen) return;

    let cancelled = false;

    async function loadVideo() {
      setVideoLoading(true);
      setVideoError(null);
      setPlaybackUrl(null);

      try {
        const moduleRes = await fetch(
          `/api/demo-videos?moduleSlug=${encodeURIComponent(app.slug)}`,
        );
        if (!moduleRes.ok) {
          throw new Error("Could not load demo video.");
        }
        const moduleData = (await moduleRes.json()) as { videos: DemoVideoItem[] };
        let video = pickVideo(moduleData.videos ?? []);

        if (!video) {
          const allRes = await fetch("/api/demo-videos");
          if (!allRes.ok) {
            throw new Error("Could not load demo video.");
          }
          const allData = (await allRes.json()) as { videos: DemoVideoItem[] };
          video = pickVideo(allData.videos ?? []);
        }

        if (cancelled) return;

        if (!video?.playbackUrl) {
          setVideoError("No demo video has been published yet.");
          return;
        }

        setPlaybackUrl(video.playbackUrl);
        setVideoTitle(video.title);
        setContentType(video.contentType);
      } catch {
        if (!cancelled) {
          setVideoError("Could not load demo video. Try again later.");
        }
      } finally {
        if (!cancelled) {
          setVideoLoading(false);
        }
      }
    }

    void loadVideo();

    return () => {
      cancelled = true;
    };
  }, [videoOpen, app.slug, pickVideo]);

  const handleVideoOpen = () => setVideoOpen(true);
  const handleVideoClose = () => {
    setVideoOpen(false);
    setPlaybackUrl(null);
    setVideoError(null);
  };

  return (
    <>
      <HeroSection app={app} onVideoOpen={handleVideoOpen} />
      <AboutSection app={app} />
      <FeaturesSection app={app} onVideoOpen={handleVideoOpen} />
      <TestimonialsSection app={app} />
      <FAQSection app={app} />
      <AllAppsSection apps={allModules} />
      <CTASection
        headline="Ready to Simplify Your Operations with QTO ERP?"
        primaryLabel="Schedule a Demo"
        primaryHref="/demo"
        secondaryLabel="View Pricing"
        secondaryHref="/pricing"
      />
      <VideoModal
        isOpen={videoOpen}
        onClose={handleVideoClose}
        playbackUrl={playbackUrl}
        title={videoTitle ?? undefined}
        contentType={contentType ?? undefined}
        loading={videoLoading}
        error={videoError}
      />
    </>
  );
}
