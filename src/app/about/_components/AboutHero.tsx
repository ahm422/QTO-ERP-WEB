"use client";
import { motion } from "framer-motion";

export default function AboutHero() {
  return (
    <section className="hero-gradient section-padding min-h-[60vh] flex items-center">
      <div className="container-main text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-primary-foreground mb-4">
            About QTO-ERP
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-2xl mx-auto">
            We're building the modern ERP that growing teams actually love to
            use.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
