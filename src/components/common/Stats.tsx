'use client'
import { useRef, useEffect, useState } from "react";
import { motion, useInView, useMotionValue, useTransform, animate } from "framer-motion";

function AnimatedNumber({ target, suffix, inView }:{ target: number; suffix?: string; inView: boolean }) {
  const motionVal = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionVal, target, {
      duration: 2,
      ease: [0.16, 1, 0.3, 1], // expo out — fast start, smooth stop
      onUpdate: (v) => setDisplay(Math.round(v).toString()),
    });
    return controls.stop;
  }, [inView, target]);

  return (
    <span>
      {display}
      {suffix}
    </span>
  );
}

function StatsStrip({ stats }: { stats: { value: number; suffix?: string; label: string; icon?: string }[] }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, delay: 0.1 }}
      style={{
        display: "flex",
        justifyContent: "center",
        gap: 0,
        marginTop: 64,
        flexWrap: "wrap",
        padding: "0 24px",
      }}
    >
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 24, scale: 0.92 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 + i * 0.15, ease: [0.16, 1, 0.3, 1] }}
          style={{
            textAlign: "center",
            padding: "40px 56px",
            flex: "1 1 220px",
            maxWidth: 300,
            position: "relative",
          }}
        >
          {/* Divider between items */}
          {i > 0 && (
            <motion.div
              initial={{ scaleY: 0 }}
              animate={inView ? { scaleY: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
              style={{
                position: "absolute",
                left: 0,
                top: "20%",
                height: "60%",
                width: 1,
                background: "linear-gradient(to bottom, transparent, #cbd5e1, transparent)",
                transformOrigin: "center",
              }}
            />
          )}

          {/* Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={inView ? { scale: 1, rotate: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.15, type: "spring", stiffness: 200 }}
            style={{
              fontSize: 36,
              marginBottom: 12,
              display: "block",
              lineHeight: 1,
            }}
          >
            {stat.icon}
          </motion.div>

          {/* Rolling number */}
          <div
            style={{
              fontSize: "clamp(52px, 6vw, 72px)",
              fontWeight: 900,
              letterSpacing: -3,
              lineHeight: 1,
              background: "linear-gradient(135deg, #f2b60f 0%, #cb9606 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              marginBottom: 10,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <AnimatedNumber target={stat.value} suffix={stat.suffix} inView={inView} />
          </div>

          {/* Label */}
          <div
            style={{
              fontSize: 15,
              fontWeight: 600,
              color: "#475569",
              letterSpacing: 0.5,
              textTransform: "uppercase",
            }}
          >
            {stat.label}
          </div>

          {/* Subtle underline bar */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={inView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.5 + i * 0.15 }}
            style={{
              width: 40,
              height: 3,
              background: "linear-gradient(90deg, #cb9606, #f2b60f)",
              borderRadius: 2,
              margin: "14px auto 0",
              transformOrigin: "left",
            }}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}

export default StatsStrip;