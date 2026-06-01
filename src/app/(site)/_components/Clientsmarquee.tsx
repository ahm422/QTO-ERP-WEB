'use client'
import { HeaderSections } from "@/components/ui/HeaderSections";
import { motion,  } from "framer-motion";

const row1 = [
  { name: "Nesma", bg: "#fff", color: "#1a3a2a", emoji: "🟢" },
  { name: "ibex.", bg: "#fff", color: "#e8003d", font: "900 italic" },
  { name: "Nando's", bg: "#fff", color: "#c8102e" },
  { name: "deel.", bg: "#fff", color: "#1a1a2e", font: "700" },
  { name: "Amreli Steels", bg: "#fff", color: "#555" },
  { name: "KAPC", bg: "#fff", color: "#2e7d32" },
];

const row2 = [
  { name: "foodpanda", bg: "#fff", color: "#e8003d" },
  { name: "COMSATS University", bg: "#fff", color: "#1a3a6e" },
  { name: "ChenOne", bg: "#fff", color: "#1a237e", font: "700 italic" },
  { name: "ZERO", bg: "#fff", color: "#e65100", sub: "beyond wellness" },
  { name: "Omar Hospital", bg: "#fff", color: "#0277bd", sub: "& Cardiac Centre" },
  { name: "Interwood", bg: "#fff", color: "#2e7d32" },
];

const row3 = [
  { name: "PIA", bg: "#fff", color: "#006400" },
  { name: "Chicken Tikka", bg: "#fff", color: "#c8102e" },
  { name: "OPPO", bg: "#fff", color: "#111", font: "300" },
  { name: "Mahmood Pharmacy", bg: "#fff", color: "#006400" },
  { name: "Haier", bg: "#fff", color: "#003087", font: "300" },
  { name: "Honda Ring Road", bg: "#fff", color: "#cc0000" },
  { name: "AkzoNobel", bg: "#fff", color: "#1565c0" },
];

const LogoCard = ({ item }:{ item: { name: string; bg?: string; color?: string; font?: string; sub?: string; emoji?: string; }}) => (
  <div
    style={{
      display: "inline-flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minWidth: 160,
      height: 80,
      margin: "0 16px",
      padding: "12px 24px",
      background: item.bg || "#fff",
      borderRadius: 12,
      boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
      border: "1px solid #f0f0f0",
      flexShrink: 0,
      userSelect: "none",
    }}
  >
    <span
      style={{
        color: item.color || "#333",
        fontWeight: item.font ? item.font.split(" ")[0] : 700,
        fontStyle: item.font?.includes("italic") ? "italic" : "normal",
        fontSize: item.sub ? 18 : 22,
        letterSpacing: item.name === "OPPO" ? 4 : 0,
        lineHeight: 1.2,
        fontFamily:
          item.name === "ibex."
            ? "Georgia, serif"
            : item.name === "deel."
            ? "'Arial Black', sans-serif"
            : item.name === "Haier"
            ? "Trebuchet MS, sans-serif"
            : "inherit",
      }}
    >
      {item.name}
    </span>
    {item.sub && (
      <span
        style={{
          color: item.color,
          fontSize: 10,
          opacity: 0.75,
          marginTop: 2,
          letterSpacing: 1,
        }}
      >
        {item.sub}
      </span>
    )}
  </div>
);

const MarqueeRow = ({ items, speed = 35, reverse = false }:{ items: { name: string; bg?: string; color?: string; font?: string; sub?: string; emoji?: string; }[]; speed?: number; reverse?: boolean;}) => {
  // Duplicate items for seamless loop
  const doubled = [...items, ...items, ...items];
  const totalWidth = items.length * 192; // approx width per card

  return (
    <div
      style={{
        overflow: "hidden",
        width: "100%",
        position: "relative",
      }}
    >
      {/* Fade edges */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          bottom: 0,
          width: 80,
          background: "linear-gradient(to right, #fefbf3, transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          right: 0,
          top: 0,
          bottom: 0,
          width: 80,
          background: "linear-gradient(to left, #fefbf3, transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      <motion.div
        style={{
          display: "flex",
          width: "max-content",
        }}
        animate={{
          x: reverse ? [0, totalWidth] : [0, -totalWidth],
        }}
        transition={{
          duration: speed,
          ease: "linear",
          repeat: Infinity,
          repeatType: "loop",
        }}
      >
        {doubled.map((item, i) => (
          <LogoCard key={`${item.name}-${i}`} item={item} />
        ))}
      </motion.div>
    </div>
  );
};

export default function ClientsMarquee() {
  return (
    <section
      style={{
        padding: "72px 0",
        fontFamily: "'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* Header */}
     <HeaderSections title=" Trusted by industry leaders" tag="Customers" />

      {/* Three marquee rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <MarqueeRow items={row1} speed={30} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.35 }}
        >
          <MarqueeRow items={row2} speed={40} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
        >
          <MarqueeRow items={row3} speed={25} />
        </motion.div>
      </div>

    </section>
  );
}




