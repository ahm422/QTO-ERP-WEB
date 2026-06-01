"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type Feature = {
  tag: string;
  title: string;
  desc: string;
  reverse?: boolean;
};

type Props = {
  subNav: string[];
  features: Feature[];
};

/** Convert a tab label to a scroll-safe id */
function toId(label: string) {
  return label
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// Solution feature images for visual demonstrations
const solutionImages = [
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1552664730-d307ca884978?q=80&w=1000&auto=format&fit=crop",
];
// ─── Main exported component ──────────────────────────────────────────────────
export default function SolutionTabsContent({ subNav, features }: Props) {
  const sectionTabs = features.map(
    (feature, idx) => subNav[idx] ?? feature.tag,
  );
  const [activeTab, setActiveTab] = useState(sectionTabs[0] ?? "");
  const tabBarRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const isClickScrolling = useRef(false);

  // Slugify the first tab for initialisation
  useEffect(() => {
    setActiveTab(sectionTabs[0] ?? "");
  }, [sectionTabs]);

  // IntersectionObserver — watches each feature section
  useEffect(() => {
    if (observerRef.current) observerRef.current.disconnect();

    const NAVBAR_HEIGHT = 128; // px — accounts for main nav + tab bar

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (isClickScrolling.current) return;
        // Pick the entry closest to the top of the viewport
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length > 0) {
          const id = visible[0].target.getAttribute("data-tab");
          if (id) setActiveTab(id);
        }
      },
      {
        rootMargin: `-${NAVBAR_HEIGHT}px 0px -40% 0px`,
        threshold: 0,
      },
    );

    sectionTabs.forEach((label) => {
      const el = document.getElementById(`section-${toId(label)}`);
      if (el) observerRef.current!.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [sectionTabs]);

  function scrollToTab(label: string) {
    setActiveTab(label);
    isClickScrolling.current = true;
    const el = document.getElementById(`section-${toId(label)}`);
    if (el) {
      const OFFSET = 128; // main navbar + tab bar height
      const top = el.getBoundingClientRect().top + window.scrollY - OFFSET;
      window.scrollTo({ top, behavior: "smooth" });
    }
    // Re-enable observer after scroll animation completes
    setTimeout(() => {
      isClickScrolling.current = false;
    }, 900);
  }

  return (
    <>
      {/* ── STICKY TAB BAR ─────────────────────────────────────────────── */}
      <div
        ref={tabBarRef}
        className="sticky top-16 z-40 border-b border-black/8 bg-white/95 backdrop-blur-md"
      >
        <div className="px-6 md:px-16 lg:px-24 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-1 py-3 min-w-max">
            {sectionTabs.map((label) => {
              const isActive = activeTab === label;
              return (
                <button
                  key={label}
                  onClick={() => scrollToTab(label)}
                  className={[
                    "relative px-4 py-2 rounded-full text-[12.5px] font-semibold whitespace-nowrap transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-[#EE7D2B]/60",
                    isActive
                      ? "bg-[#EE7D2B] text-white shadow-md shadow-[#EE7D2B]/30"
                      : "text-black/50 hover:text-black hover:bg-black/5",
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── FEATURE SECTIONS ───────────────────────────────────────────── */}
      <section className="px-6 pb-24 pt-12 md:px-16 lg:px-24">
        <div className="space-y-28">
          {features.map((f, idx) => {
            const tabLabel = sectionTabs[idx] ?? f.tag;
            const imageUrl = solutionImages[idx % solutionImages.length];
            return (
              <div
                key={idx}
                id={`section-${toId(tabLabel)}`}
                data-tab={tabLabel}
                className={[
                  "grid items-center gap-12 md:grid-cols-2 scroll-mt-32",
                  f.reverse ? "md:[&>div:first-child]:order-2" : "",
                ].join(" ")}
              >
                {/* Screenshot side */}
                <div className="relative">
                  <div className="pointer-events-none absolute -right-4 -top-7 h-20 w-52 rotate-[-7deg] rounded-[28px] bg-gradient-to-r from-[#EE7D2B]/30 via-[#EE7D2B]/12 to-transparent" />
                  <div className="pointer-events-none absolute -bottom-7 -left-5 h-20 w-64 rotate-[10deg] rounded-[28px] bg-gradient-to-r from-[#EE7D2B]/30 via-[#EE7D2B]/12 to-transparent" />
                  <div className="relative overflow-hidden rounded-[14px] border border-black/10 bg-white shadow-[0_12px_34px_rgba(0,0,0,0.07)]">
                    <div className="aspect-[16/7] w-full relative">
                      <Image
                        src={imageUrl}
                        alt={f.title}
                        fill
                        className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>{" "}
                </div>

                {/* Text side */}
                <div className={f.reverse ? "md:pr-6" : "md:pl-6"}>
                  <p className="text-[11px] font-semibold tracking-widest text-[#EE7D2B]">
                    {f.tag}
                  </p>
                  <h3 className="mt-3 whitespace-pre-line text-[26px] font-extrabold leading-[1.15] tracking-tight md:text-[32px]">
                    {f.title}
                  </h3>
                  <p className="mt-4 max-w-[560px] text-[13.5px] leading-6 text-black/60 md:text-[14px]">
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}
