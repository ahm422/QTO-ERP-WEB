"use client";

import { Environment, Float, OrbitControls } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";

/**
 * R3F 9 still constructs THREE.Clock; three ≥ r183 warns on every Canvas mount.
 * Filter that known upstream noise until R3F 10 ships (Clock → Timer).
 */
function silenceR3FClockDeprecation() {
  if (typeof window === "undefined") return;
  const setConsoleFunction = (
    THREE as typeof THREE & {
      setConsoleFunction?: (
        fn: (type: string, message: string, ...params: unknown[]) => void
      ) => void;
    }
  ).setConsoleFunction;
  if (!setConsoleFunction) return;

  setConsoleFunction((type, message, ...params) => {
    if (
      type === "warn" &&
      typeof message === "string" &&
      message.includes("Clock:") &&
      message.includes("deprecated")
    ) {
      return;
    }
    const sink =
      type === "error"
        ? console.error
        : type === "warn"
          ? console.warn
          : console.log;
    sink(message, ...params);
  });
}

silenceR3FClockDeprecation();

export type OrbitModuleDef = {
  id: string;
  label: string;
  blurb: string;
  /** [radius, tilt, phase, speed] */
  orbit: [number, number, number, number];
};

export type OrbitColors = {
  glow: string;
  ring: string;
  accentDark: string;
};

const DEFAULT_MODULES: OrbitModuleDef[] = [
  {
    id: "attendance",
    label: "Attendance",
    blurb: "Live clock-ins flowing into the shared API.",
    orbit: [2.05, 0.4, 0.4, 0.28],
  },
  {
    id: "hr",
    label: "HR",
    blurb: "People data synced across every module.",
    orbit: [2.05, -0.45, 2.1, 0.22],
  },
  {
    id: "pm",
    label: "Projects",
    blurb: "Delivery timelines on the same backbone.",
    orbit: [2.45, 0.55, 3.6, 0.18],
  },
  {
    id: "crm",
    label: "CRM",
    blurb: "Pipeline events streaming in real time.",
    orbit: [2.45, -0.3, 5.1, 0.24],
  },
];

/**
 * Bloom only on capable desktop: not mobile/coarse pointer, not narrow viewports,
 * not reduced-motion, and not very low DPR / save-data.
 */
function useBloomEnabled(reduced: boolean | null): boolean {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const evaluate = () => {
      if (reduced) {
        setEnabled(false);
        return;
      }
      const coarse = window.matchMedia("(pointer: coarse)").matches;
      const narrow = window.matchMedia("(max-width: 1023px)").matches;
      const dpr = window.devicePixelRatio || 1;
      const saveData =
        "connection" in navigator &&
        Boolean(
          (navigator as Navigator & { connection?: { saveData?: boolean } })
            .connection?.saveData
        );
      setEnabled(!coarse && !narrow && dpr >= 1.25 && !saveData);
    };
    evaluate();
    const mqNarrow = window.matchMedia("(max-width: 1023px)");
    const mqCoarse = window.matchMedia("(pointer: coarse)");
    mqNarrow.addEventListener("change", evaluate);
    mqCoarse.addEventListener("change", evaluate);
    return () => {
      mqNarrow.removeEventListener("change", evaluate);
      mqCoarse.removeEventListener("change", evaluate);
    };
  }, [reduced]);

  return enabled;
}

function cssToRgb(cssColor: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  try {
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return fallback;
    ctx.fillStyle = "#000000";
    ctx.fillStyle = cssColor;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  } catch {
    return fallback;
  }
}

function useOrbitColors(): OrbitColors {
  const [colors, setColors] = useState<OrbitColors>({
    glow: "#E8733A",
    ring: "#F1B27C",
    accentDark: "#AE562B",
  });
  useEffect(() => {
    const read = () => {
      const s = getComputedStyle(document.documentElement);
      setColors({
        glow: cssToRgb(
          s.getPropertyValue("--motif-gradient-from").trim() ||
            s.getPropertyValue("--accent").trim() ||
            s.getPropertyValue("--hero-accent").trim(),
          "#E8733A"
        ),
        ring: cssToRgb(
          s.getPropertyValue("--motif-gradient-to").trim() ||
            s.getPropertyValue("--accent").trim(),
          "#F1B27C"
        ),
        accentDark: cssToRgb(
          s.getPropertyValue("--accent-dark").trim(),
          "#AE562B"
        ),
      });
    };
    read();
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);
  return colors;
}

function GlowSprite({
  color,
  scale = 1,
  opacity = 0.4,
}: {
  color: string;
  scale?: number;
  opacity?: number;
}) {
  const texture = useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.22, "rgba(255,255,255,0.55)");
    g.addColorStop(0.55, "rgba(255,255,255,0.12)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }, []);

  return (
    <sprite scale={[scale, scale, 1]}>
      <spriteMaterial
        map={texture}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </sprite>
  );
}

function OrbitalModule({
  def,
  colors,
  reduced,
  activeId,
  onActive,
}: {
  def: OrbitModuleDef;
  colors: OrbitColors;
  reduced: boolean;
  activeId: string | null;
  onActive: (id: string | null) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const ball = useRef<THREE.Mesh>(null);
  const phase = useRef(def.orbit[2]);
  const hovered = activeId === def.id;

  useFrame((_, dt) => {
    if (!group.current) return;
    if (!reduced) phase.current += dt * def.orbit[3];
    const [r, tilt] = def.orbit;
    const a = phase.current;
    group.current.position.set(
      Math.cos(a) * r,
      Math.sin(a * 0.9) * tilt * r * 0.55,
      Math.sin(a) * r * 0.75
    );
    if (ball.current) {
      const target = hovered ? 1.55 : 1;
      const s = THREE.MathUtils.damp(ball.current.scale.x, target, 12, dt);
      ball.current.scale.setScalar(s);
    }
  });

  return (
    <group ref={group}>
      <mesh
        ref={ball}
        onPointerOver={(e) => {
          e.stopPropagation();
          onActive(def.id);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onActive(null);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[0.075, 32, 32]} />
        <meshPhysicalMaterial
          color="#ffffff"
          emissive={colors.glow}
          emissiveIntensity={hovered ? 3.2 : 2.1}
          metalness={0.15}
          roughness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>
      <GlowSprite
        color={colors.glow}
        scale={hovered ? 0.4 : 0.22}
        opacity={hovered ? 0.6 : 0.32}
      />
    </group>
  );
}

function OrbitRing({
  radius,
  color,
  rotation,
  opacity = 0.55,
  tube = 0.012,
  emissiveIntensity = 0.85,
  /** Bright pinpoint flare at the ring's rightmost edge, echoing the reference render. */
  flare = false,
}: {
  radius: number;
  color: string;
  rotation: [number, number, number];
  opacity?: number;
  tube?: number;
  emissiveIntensity?: number;
  flare?: boolean;
}) {
  return (
    <group rotation={rotation}>
      <mesh>
        <torusGeometry args={[radius, tube, 24, 256]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={emissiveIntensity}
          transparent
          opacity={opacity}
          depthWrite={false}
          roughness={0.4}
          metalness={0.04}
        />
      </mesh>
      {flare ? (
        <group position={[radius, 0, 0]}>
          <mesh>
            <sphereGeometry args={[0.04, 24, 24]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <GlowSprite color={color} scale={0.5} opacity={0.5} />
        </group>
      ) : null}
    </group>
  );
}

function Core({
  colors,
  hot,
  reduced,
}: {
  colors: OrbitColors;
  hot: boolean;
  reduced: boolean;
}) {
  const core = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (!core.current || reduced) return;
    core.current.rotation.y += dt * 0.2;
    if (inner.current) {
      inner.current.rotation.y -= dt * 0.45;
      inner.current.rotation.x += dt * 0.2;
    }
  });

  return (
    <group ref={core}>
      <mesh>
        <sphereGeometry args={[0.72, 64, 64]} />
        <meshPhysicalMaterial
          color={colors.glow}
          metalness={0.02}
          roughness={0.04}
          transmission={0.95}
          thickness={1.05}
          ior={1.42}
          clearcoat={1}
          clearcoatRoughness={0.02}
          transparent
          envMapIntensity={2.4}
          attenuationColor={colors.accentDark}
          attenuationDistance={1.15}
        />
      </mesh>
      <mesh ref={inner} scale={0.34}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={colors.glow}
          emissive={colors.glow}
          emissiveIntensity={hot ? 2.2 : 1.3}
          metalness={0.6}
          roughness={0.15}
        />
      </mesh>
      <mesh scale={0.2}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      {/* Kept subtle so it reads as a light source inside glass, not a solid fill hiding the transmission. */}
      <GlowSprite color={colors.glow} scale={hot ? 2.4 : 1.7} opacity={0.18} />
      <GlowSprite color="#ffffff" scale={0.85} opacity={0.22} />
    </group>
  );
}

function Scene({
  colors,
  reduced,
  activeId,
  onActive,
  modules,
  interactive,
  bloom,
}: {
  colors: OrbitColors;
  reduced: boolean;
  activeId: string | null;
  onActive: (id: string | null) => void;
  modules: OrbitModuleDef[];
  interactive: boolean;
  bloom: boolean;
}) {
  // Scale so tilted outer rings (r≈2.45) + Float stay fully inside the canvas.
  const system = (
    <group scale={0.92}>
      {/* Dominant equatorial belt — bright, near-horizontal, flare at its edge. */}
      <OrbitRing
        radius={2.05}
        color={colors.ring}
        rotation={[1.48, 0.14, 0.04]}
        opacity={0.82}
        tube={0.013}
        emissiveIntensity={1.0}
        flare
      />
      {/* Thin crisscrossing trace lines — echo the reference's fine orbit threads. */}
      <OrbitRing
        radius={2.45}
        color={colors.ring}
        rotation={[1.4, -0.45, 0.55]}
        opacity={0.4}
        tube={0.007}
      />
      <OrbitRing
        radius={1.55}
        color={colors.ring}
        rotation={[0.4, 0.8, 0.2]}
        opacity={0.36}
        tube={0.007}
      />
      <OrbitRing
        radius={1.85}
        color={colors.ring}
        rotation={[-0.55, 0.35, -0.3]}
        opacity={0.32}
        tube={0.006}
      />
      <Core colors={colors} hot={!!activeId} reduced={reduced} />
      {modules.map((mod) => (
        <OrbitalModule
          key={mod.id}
          def={mod}
          colors={colors}
          reduced={reduced}
          activeId={activeId}
          onActive={onActive}
        />
      ))}
    </group>
  );

  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight
        position={[5.5, 7.5, 4.5]}
        angle={0.38}
        penumbra={0.8}
        intensity={3.2}
        color="#ffffff"
      />
      <pointLight
        position={[-4, -2, -3]}
        intensity={1.6}
        color={colors.glow}
        distance={14}
      />
      <Environment preset="studio" environmentIntensity={1.05} />
      {reduced ? (
        system
      ) : (
        <Float speed={1.4} rotationIntensity={0.15} floatIntensity={0.28}>
          {system}
        </Float>
      )}
      {!reduced && interactive ? (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.55}
          maxPolarAngle={Math.PI / 1.55}
          minPolarAngle={Math.PI / 3.2}
          rotateSpeed={0.55}
        />
      ) : null}
      {bloom ? (
        <EffectComposer multisampling={0}>
          <Bloom
            luminanceThreshold={0.55}
            luminanceSmoothing={0.35}
            intensity={0.9}
            mipmapBlur
          />
        </EffectComposer>
      ) : null}
    </>
  );
}

export type OrbitMotifProps = {
  className?: string;
  /** Enable OrbitControls + auto-rotate (disabled when prefers-reduced-motion). Default true. */
  interactive?: boolean;
  /** Override drifting module nodes. */
  modules?: OrbitModuleDef[];
  /** Show hover chip + drag hint overlay. Default true. */
  showHints?: boolean;
};

/**
 * Shared Orbit signature motif — glowing sphere, thin rings, drifting module nodes.
 * Driven by `--orbit-glow` / `--orbit-ring` / `--accent-dark` CSS tokens.
 * Respects `prefers-reduced-motion` (static frame, no auto-rotate / float).
 * Bloom is gated off on mobile / coarse pointer / narrow viewports / reduced-motion / save-data.
 */
export function OrbitMotif({
  className,
  interactive = true,
  modules = DEFAULT_MODULES,
  showHints = true,
}: OrbitMotifProps) {
  const reduced = useReducedMotion();
  const bloom = useBloomEnabled(reduced);
  const colors = useOrbitColors();
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = modules.find((m) => m.id === activeId) ?? null;

  return (
    <div
      className={cn("relative aspect-square w-full", className)}
      aria-hidden="true"
      data-orbit-bloom={bloom ? "on" : "off"}
    >
      <Canvas
        key={`${colors.glow}-${bloom ? "bloom" : "plain"}`}
        dpr={bloom ? [1, 1.75] : [1, 1.5]}
        // Framing: complete elliptical rings with margin around the canvas edge.
        camera={{ position: [0, 0.1, 7.1], fov: 36 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
        className="!overflow-visible"
        style={{ overflow: "visible" }}
      >
        <Suspense fallback={null}>
          <Scene
            colors={colors}
            reduced={!!reduced}
            activeId={activeId}
            onActive={setActiveId}
            modules={modules}
            interactive={interactive}
            bloom={bloom}
          />
        </Suspense>
      </Canvas>

      {showHints ? (
        <AnimatePresence mode="wait">
          {active ? (
            <motion.div
              key={active.id}
              initial={
                reduced
                  ? { opacity: 0 }
                  : { opacity: 0, y: 16, filter: "blur(6px)" }
              }
              animate={
                reduced
                  ? { opacity: 1 }
                  : { opacity: 1, y: 0, filter: "blur(0px)" }
              }
              exit={
                reduced
                  ? { opacity: 0 }
                  : { opacity: 0, y: 8, filter: "blur(4px)" }
              }
              transition={{
                duration: reduced ? 0.01 : 0.28,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="pointer-events-none absolute inset-x-6 bottom-2 rounded-2xl border border-hero-chip-border bg-hero-chip/90 px-4 py-3 shadow-2xl backdrop-blur-xl"
            >
              <p className="text-sm font-semibold tracking-wide text-hero-foreground">
                {active.label}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-hero-muted-foreground">
                {active.blurb}
              </p>
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-x-0 bottom-3 text-center text-[11px] tracking-[0.2em] uppercase text-hero-muted-foreground"
            >
              {reduced
                ? "Orbit motif · reduced motion"
                : interactive
                  ? "Drag to orbit · Hover a module"
                  : "Orbit motif"}
            </motion.p>
          )}
        </AnimatePresence>
      ) : null}
    </div>
  );
}

export { DEFAULT_MODULES as ORBIT_DEFAULT_MODULES };
