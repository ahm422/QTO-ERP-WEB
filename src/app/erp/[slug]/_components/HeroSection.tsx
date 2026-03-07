"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  app: {
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    heroHeadline: string;
    heroSubheadline: string;
    heroCtaLabel?: string;
  };
  onVideoOpen: () => void;
}

export default function HeroSection({ app, onVideoOpen }: HeroSectionProps){
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative min-h-[94vh] flex items-center justify-center overflow-hidden hero-gradient from-slate-900 via-purple-900/30 to-slate-900">
      {/* Animated SVG Background Elements */}
      <div className="absolute inset-0">
        {/* Floating geometric shapes with shadows and animations */}
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-linear-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-xl shadow-2xl shadow-blue-500/25"
          animate={{
            y: [0, -30, 0],
            rotate: [0, 10, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-32 left-20 w-64 h-64 bg-linear-to-r from-indigo-500/15 to-pink-500/15 rounded-full blur-3xl shadow-2xl shadow-indigo-500/20"
          animate={{
            x: [-20, 20, -20],
            y: [0, -20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* SVG Wave Pattern */}
        <svg
          className="pointer-events-none absolute bottom-0 left-0 w-full h-40 -mb-px"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <defs>
            {/* soft highlight that fades out */}
            <linearGradient id="waveHighlight" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.22)" />
              <stop offset="70%" stopColor="rgba(255,255,255,0.10)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.00)" />
            </linearGradient>
          </defs>

          {/* blend keeps the same orange hue, only adds highlight */}
          <path
            d="M0,96.522483C267.181818,77.522483 532.363636,0.522483 800.545455,0.522483C1067.72727,0.522483 1333.90909,77.522483 1600,96.522483L1600,120L0,120Z"
            fill="url(#waveHighlight)"
            className="mix-blend-soft-light"
          />
        </svg>
      </div>

      {/* Main Content Container */}
      <div className="container-main relative z-10 text-center px-4">
        <AnimatePresence mode="wait">
          {isVisible && (
            <motion.div
              key="content"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              {/* Audience Badge with glassmorphism */}
              {/* <motion.span
                className="inline-block px-4 py-2 text-black bg-white/10 backdrop-blur-xl border border-white/20 rounded-full text-xs font-semibold uppercase tracking-wider text-accent mb-6 shadow-2xl shadow-white/5 hover:shadow-3xl hover:shadow-blue-500/10 transition-all duration-300 "
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 400 }}
              >
                {audience}
              </motion.span> */}

              {/* Headline with staggered letter animation */}
              <motion.h1
                className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-normal font-sans [word-spacing:0.22em] bg-linear-to-b from-white via-white to-white/70 bg-clip-text text-transparent mb-6 leading-[1.02] drop-shadow-[0_18px_50px_rgba(0,0,0,0.55)]"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                      delayChildren: 0.4,
                    },
                  },
                }}
              >
                <motion.span
                  variants={{
                    hidden: { opacity: 0, y: 50 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="tracking-tight space-x-6 leading-[1.3]"
                >
                  { app.heroHeadline
                  .split(" ").map((word, i) => (
                    <span key={i} className="inline-block">
                      {word}{" "}
                    </span>
                  ))
                  }
                </motion.span>
              </motion.h1>

              {/* Subheadline with subtle glow */}
              <motion.p
                className="text-xl md:text-2xl text-accent-foreground/70 max-w-3xl mx-auto mb-12 px-4 leading-relaxed drop-shadow-lg"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.6 }}
              >
                {app.heroSubheadline}
              </motion.p>

              {/* CTA Button with advanced hover effects */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link
                  href="/demo"
                  className=""
                >
                  <Button className="group" size={'lg'} icon={ArrowRight}>
                    {app.heroCtaLabel ?? "Schedule a Demo"}
                  </Button>
                </Link>
                  {/* <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform -translate-x-60 group-hover:translate-x-60 transition-transform duration-1000" /> */}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Scroll Indicator */}
      {/* <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="flex flex-col items-center space-y-2">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full">
            <div className="w-1 h-3 bg-white/60 rounded-full mx-auto mt-2 animate-bounce" />
          </div>
          <span className="text-xs font-medium tracking-wider">Scroll</span>
        </div>
      </motion.div> */}
    </section>
  );
}
