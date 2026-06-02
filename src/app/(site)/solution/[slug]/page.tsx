import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import {
  getPublishedSolutionBySlug,
  listPublishedModulesBySlugs,
  listPublishedSolutionSlugs,
} from "@/lib/content-db";
import { notFound } from "next/navigation";
import SolutionTabsContent from "./_components/SolutionTabsContent";
import RecommendedModulesSection from "./_components/RecommendedModulesSection";
import { FAQAccordion } from "@/components/ui/faq";
import { CTASection } from "@/components/ui/CTASection";
import type { SolutionUseCase } from "@/types/solution";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ industry?: string }>;
};

export const runtime = "nodejs";
export const dynamicParams = true; // serve unknown slugs dynamically

export async function generateStaticParams() {
  try {
    const slugs = await listPublishedSolutionSlugs();
    return slugs.map((slug) => ({ slug }));
  } catch {
    // graceful fallback — build succeeds without DB
    return [];
  }
}

export default async function HRSoftwareLandingFullWidth({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const { industry } = await searchParams;
  const solution = await getPublishedSolutionBySlug(slug);
  
  if (!solution) {
    notFound();
  }

  // Find the specific use case if industry is provided
  const useCases = (solution.useCases ?? []) as SolutionUseCase[];
  const defaultUseCase = useCases[0];

  const selectedUseCase = industry
    ? useCases.find((uc) => uc.slug === industry)
    : null;

  if (industry && !selectedUseCase) {
    notFound();
  }

  const heroTitle = selectedUseCase
    ? `${solution.title} for ${selectedUseCase.industry}`
    : solution.heroHeadline;

  const heroSubtitle = selectedUseCase
    ? selectedUseCase.description
    : solution.heroSubheadline;

  const tabSource = selectedUseCase ?? defaultUseCase;
  const activeSubNav = tabSource?.subNav ?? [];
  const activeFeatures = tabSource?.features ?? [];

  const recommendedModules = await listPublishedModulesBySlugs(
    solution.recommendedModules,
  );

  return (
    <main className="min-h-screen bg-white text-black">
      {/* HERO (FULL WIDTH) */}
      
      <section className="relative overflow-hidden">
        {/* Decorative blob (top-right) */}
        <div className="pointer-events-none absolute right-0 top-0 h-[460px] w-[620px] rounded-bl-[170px] bg-[#EE7D2B]/20" />
        <div className="pointer-events-none absolute right-[-120px] top-[-80px] h-[520px] w-[520px] rounded-full bg-[#EE7D2B]/10 blur-2xl" />

        {/* Full width padding */}
        <div className="px-6 pb-12 pt-16 md:px-16 lg:px-24">
          <div className="grid items-center gap-10 md:grid-cols-2">
            {/* Left copy */}
            <div>
              {selectedUseCase && (
                <div className="mb-4">
                  <Link
                    href={`/solution/${slug}`}
                    className="inline-flex items-center gap-2 text-sm text-[#EE7D2B] hover:underline"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back to {solution.title}
                  </Link>
                </div>
              )}
              <h1 className="text-[34px] font-extrabold leading-[1.12] tracking-tight md:text-[46px] lg:text-[52px]">
                {heroTitle}
              </h1>

              <p className="mt-5 max-w-[560px] text-[13.5px] leading-6 text-black/60 md:text-[14px]">
                {heroSubtitle}
              </p>

              {selectedUseCase && selectedUseCase.specificNeeds && (
                <div className="mt-6">
                  <ul className="grid grid-flow-col ">
                    {selectedUseCase.specificNeeds.map((need, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-[13px] text-black/60">
                        <Check className="h-4 w-4 shrink-0 text-[#EE7D2B]" aria-hidden />
                        {need}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-7 flex flex-wrap gap-3">

                <Link
                  href="#"
                  className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-7 py-2.5 text-[12px] font-semibold text-black shadow-sm transition hover:bg-black/5"
                >
                  Request a Demo
                </Link>
              </div>
            </div>

            {/* Right illustration (fake image via SVG) */}
            <div className="relative">
              <div className="mx-auto w-full max-w-[720px]">
                <HeroIllustrationFake />
              </div>
            </div>
          </div>
        </div>
      </section>

      {activeFeatures.length > 0 && (
        <SolutionTabsContent subNav={activeSubNav} features={activeFeatures} />
      )}

      <RecommendedModulesSection modules={recommendedModules} />

      {/* FAQ SECTION */}
      {solution.solutionFaqs && solution.solutionFaqs.length > 0 && (
        <section className="px-6 py-20 md:px-16 lg:px-24 bg-slate-50/60">
          <div className="max-w-3xl mx-auto">
            <p className="text-center text-[11px] font-bold uppercase tracking-widest text-[#EE7D2B] mb-3">
              Got Questions?
            </p>
            <h2 className="text-center text-[28px] font-extrabold leading-tight tracking-tight text-black mb-10 md:text-[36px]">
              Frequently Asked Questions
            </h2>
            <FAQAccordion faqs={solution.solutionFaqs} variant="orange" />
          </div>
        </section>
      )}

      {/* CTA */}
      <CTASection />
    </main>
  );
}



/** Fake HERO Illustration SVG */
function HeroIllustrationFake() {
  return (
    <svg
      viewBox="0 0 900 620"
      className="h-auto w-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="g1" x1="0" x2="1">
          <stop offset="0" stopColor="#EE7D2B" stopOpacity="0.20" />
          <stop offset="1" stopColor="#EE7D2B" stopOpacity="0.05" />
        </linearGradient>
        <linearGradient id="g2" x1="0" x2="1">
          <stop offset="0" stopColor="#000" stopOpacity="0.08" />
          <stop offset="1" stopColor="#000" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* background card */}
      <rect x="130" y="120" rx="28" ry="28" width="640" height="380" fill="white" stroke="rgba(0,0,0,0.08)" />
      <rect x="150" y="140" rx="18" ry="18" width="600" height="340" fill="url(#g2)" />

      {/* laptop */}
      <rect x="235" y="165" rx="16" width="430" height="250" fill="white" stroke="rgba(0,0,0,0.10)" />
      <rect x="255" y="185" rx="12" width="390" height="210" fill="url(#g1)" />
      <rect x="300" y="420" rx="18" width="300" height="26" fill="rgba(0,0,0,0.10)" />

      {/* UI blocks */}
      <rect x="275" y="205" rx="10" width="130" height="80" fill="white" opacity="0.85" />
      <rect x="420" y="205" rx="10" width="200" height="14" fill="white" opacity="0.75" />
      <rect x="420" y="230" rx="10" width="180" height="14" fill="white" opacity="0.55" />
      <rect x="420" y="255" rx="10" width="160" height="14" fill="white" opacity="0.40" />

      {/* charts */}
      <circle cx="330" cy="330" r="34" fill="#EE7D2B" opacity="0.35" />
      <circle cx="330" cy="330" r="18" fill="white" opacity="0.75" />
      <rect x="420" y="305" rx="10" width="210" height="85" fill="white" opacity="0.70" />
      <rect x="440" y="325" rx="6" width="46" height="45" fill="#EE7D2B" opacity="0.35" />
      <rect x="495" y="335" rx="6" width="46" height="35" fill="#EE7D2B" opacity="0.25" />
      <rect x="550" y="345" rx="6" width="46" height="25" fill="#EE7D2B" opacity="0.18" />

      {/* small floating accents */}
      <circle cx="760" cy="165" r="20" fill="#EE7D2B" opacity="0.18" />
      <circle cx="195" cy="470" r="16" fill="#EE7D2B" opacity="0.16" />
      <rect x="725" y="420" rx="14" width="80" height="36" fill="#EE7D2B" opacity="0.20" />

      {/* simple "people" silhouettes */}
      <circle cx="210" cy="305" r="16" fill="rgba(0,0,0,0.18)" />
      <rect x="195" y="323" rx="10" width="30" height="55" fill="rgba(0,0,0,0.12)" />
      <circle cx="720" cy="330" r="16" fill="rgba(0,0,0,0.18)" />
      <rect x="705" y="348" rx="10" width="30" height="55" fill="rgba(0,0,0,0.12)" />
    </svg>
  );
}

/** Fake Screenshot SVGs (3 variants) */
function FakeScreenshotSVG({ variant }: { variant: number }) {
  if (variant === 1) return <ScreenshotVariant1 />;
  if (variant === 2) return <ScreenshotVariant2 />;
  return <ScreenshotVariant3 />;
}

function ScreenshotVariant1() {
  return (
    <svg viewBox="0 0 1600 700" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="1600" height="700" fill="white" />
      <rect x="40" y="40" width="220" height="620" rx="16" fill="rgba(0,0,0,0.04)" />
      <rect x="290" y="40" width="1270" height="70" rx="16" fill="rgba(0,0,0,0.03)" />
      <rect x="290" y="130" width="1270" height="530" rx="16" fill="rgba(0,0,0,0.02)" />

      {/* table rows */}
      {Array.from({ length: 9 }).map((_, i) => (
        <g key={i}>
          <rect x="320" y={160 + i * 52} width="1210" height="34" rx="10" fill="rgba(0,0,0,0.035)" />
          <rect x="340" y={170 + i * 52} width="180" height="14" rx="7" fill="rgba(0,0,0,0.10)" />
          <rect x="540" y={170 + i * 52} width="220" height="14" rx="7" fill="rgba(0,0,0,0.07)" />
          <rect x="790" y={170 + i * 52} width="140" height="14" rx="7" fill="rgba(0,0,0,0.06)" />
          <rect x="1320" y={166 + i * 52} width="160" height="22" rx="11" fill="#EE7D2B" opacity="0.22" />
        </g>
      ))}
    </svg>
  );
}

function ScreenshotVariant2() {
  return (
    <svg viewBox="0 0 1600 700" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="1600" height="700" fill="white" />
      <rect x="50" y="50" width="1500" height="80" rx="18" fill="rgba(0,0,0,0.03)" />
      <rect x="50" y="160" width="980" height="490" rx="18" fill="rgba(0,0,0,0.02)" />
      <rect x="1070" y="160" width="480" height="490" rx="18" fill="rgba(0,0,0,0.02)" />

      {/* left panel content */}
      <rect x="90" y="200" width="420" height="26" rx="13" fill="rgba(0,0,0,0.08)" />
      <rect x="90" y="240" width="620" height="18" rx="9" fill="rgba(0,0,0,0.05)" />
      {Array.from({ length: 7 }).map((_, i) => (
        <rect
          key={i}
          x="90"
          y={290 + i * 48}
          width="900"
          height="30"
          rx="10"
          fill="rgba(0,0,0,0.035)"
        />
      ))}

      {/* right panel cards */}
      <rect x="1110" y="200" width="400" height="120" rx="16" fill="#EE7D2B" opacity="0.16" />
      <rect x="1110" y="340" width="400" height="120" rx="16" fill="rgba(0,0,0,0.035)" />
      <rect x="1110" y="480" width="400" height="120" rx="16" fill="rgba(0,0,0,0.035)" />
    </svg>
  );
}

function ScreenshotVariant3() {
  return (
    <svg viewBox="0 0 1600 700" className="h-full w-full" xmlns="http://www.w3.org/2000/svg">
      <rect width="1600" height="700" fill="white" />
      <rect x="60" y="60" width="1480" height="90" rx="18" fill="rgba(0,0,0,0.03)" />
      <rect x="60" y="180" width="1480" height="460" rx="18" fill="rgba(0,0,0,0.02)" />

      {/* dashboard cards */}
      <rect x="110" y="220" width="430" height="160" rx="18" fill="#EE7D2B" opacity="0.14" />
      <rect x="580" y="220" width="430" height="160" rx="18" fill="rgba(0,0,0,0.035)" />
      <rect x="1050" y="220" width="430" height="160" rx="18" fill="rgba(0,0,0,0.035)" />

      {/* charts */}
      <rect x="110" y="410" width="900" height="190" rx="18" fill="rgba(0,0,0,0.03)" />
      <rect x="1050" y="410" width="430" height="190" rx="18" fill="rgba(0,0,0,0.03)" />

      {/* bars */}
      {Array.from({ length: 8 }).map((_, i) => (
        <rect
          key={i}
          x={150 + i * 95}
          y={560 - i * 18}
          width="48"
          height={70 + i * 18}
          rx="10"
          fill="#EE7D2B"
          opacity={0.10 + i * 0.03}
        />
      ))}
    </svg>
    
  );
}