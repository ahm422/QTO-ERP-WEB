'use client';

import { motion } from "framer-motion";
import { ExternalLink } from "lucide-react";
import { QTO_DEV_URL } from "@/lib/constants";

const QTODev = () => {
  return (
  <>
   <section className="section-padding bg-[#E18700] border-t border-border">
        <div className="container-main">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h2 className="text-2xl md:text-3xl font-bold text-foreground text-white mb-4">
              A Product by <span className="text-black">QTO Dev</span>
            </h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              QTO Dev builds modern, scalable SaaS solutions for growing businesses. We're passionate about creating tools that simplify complex workflows and empower teams worldwide.
            </p>
             <a
              href={QTO_DEV_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Visit QTO Dev <ExternalLink className="h-4 w-4" />
            </a>
          </motion.div>
        </div>
      </section>
      </>
  )
}

export default QTODev