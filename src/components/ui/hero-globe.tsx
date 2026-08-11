"use client";

import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { AnimatePresence, motion } from "framer-motion";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import * as THREE from "three";
import type { OrbitModuleDef } from "@/components/ui/orbit-motif";
import { useCssColor } from "@/hooks/use-css-color";
import {
  globeLatLngFor,
  ORBIT_SEED_BY_SLUG,
} from "@/lib/home-hero-defaults";
import { cn } from "@/lib/utils";

const TOPOLOGY_URL = "/images/globe/earth-topology.png";
const GLOBE_RADIUS = 1.4;
const LAND_BRIGHTNESS = 22;

function silenceKnownThreeConsoleNoise() {
  if (typeof window === "undefined") return;
  const setConsoleFunction = (
    THREE as typeof THREE & {
      setConsoleFunction?: (
        fn: (type: string, message: string, ...params: unknown[]) => void,
      ) => void;
    }
  ).setConsoleFunction;
  if (!setConsoleFunction) return;

  setConsoleFunction((type, message, ...params) => {
    if (type === "warn" && typeof message === "string") {
      if (message.includes("Clock:") && message.includes("deprecated")) {
        return;
      }
      if (
        message.includes("WebGLProgram") &&
        (message.includes("X4122") ||
          message.includes("cannot be represented accurately"))
      ) {
        return;
      }
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

silenceKnownThreeConsoleNoise();

function useIsDarkTheme(): boolean {
  const [dark, setDark] = useState(() =>
    typeof document !== "undefined"
      ? document.documentElement.classList.contains("dark")
      : false,
  );
  useEffect(() => {
    const read = () =>
      setDark(document.documentElement.classList.contains("dark"));
    const observer = new MutationObserver(read);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);
  return dark;
}

function useWebGLSupport(): boolean {
  const [ok] = useState(() => {
    if (typeof document === "undefined") return true;
    try {
      const canvas = document.createElement("canvas");
      const gl =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      return Boolean(gl);
    } catch {
      return false;
    }
  });
  return ok;
}

function useInView(ref: MutableRefObject<HTMLElement | null>): boolean {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin: "80px", threshold: 0.05 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref]);
  return inView;
}

function latLngToVec3(
  lat: number,
  lng: number,
  radius: number,
): THREE.Vector3 {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta),
  );
}

function softSpriteTexture(): THREE.CanvasTexture {
  const size = 64;
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
    size / 2,
  );
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.55)");
  g.addColorStop(0.55, "rgba(255,255,255,0.12)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}

async function sampleLandPositions(
  step: number,
  cancelled: () => boolean,
): Promise<Float32Array> {
  const res = await fetch(TOPOLOGY_URL);
  if (!res.ok) throw new Error("topology fetch failed");
  const blob = await res.blob();
  if (cancelled()) return new Float32Array(0);
  const bitmap = await createImageBitmap(blob);
  if (cancelled()) {
    bitmap.close();
    return new Float32Array(0);
  }

  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) {
    bitmap.close();
    return new Float32Array(0);
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const { data, width, height } = ctx.getImageData(
    0,
    0,
    canvas.width,
    canvas.height,
  );

  const positions: number[] = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const brightness = data[(y * width + x) * 4];
      if (brightness < LAND_BRIGHTNESS) continue;
      const jx = (Math.random() - 0.5) * step * 0.4;
      const jy = (Math.random() - 0.5) * step * 0.4;
      const lat = 90 - ((y + jy) / height) * 180;
      const lng = ((x + jx) / width) * 360 - 180;
      const elev = GLOBE_RADIUS * (1.002 + Math.min(brightness, 200) * 0.00008);
      const v = latLngToVec3(lat, lng, elev);
      positions.push(v.x, v.y, v.z);
    }
    if (cancelled()) return new Float32Array(0);
  }
  return new Float32Array(positions);
}

/** Sample topology outside the R3F tree so Canvas remounts don’t abort the load. */
function useEarthDots(enabled: boolean, step: number): Float32Array | null {
  const [positions, setPositions] = useState<Float32Array | null>(null);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    sampleLandPositions(step, () => cancelled)
      .then((pts) => {
        if (!cancelled && pts.length > 0) setPositions(pts);
      })
      .catch(() => {
        /* keep null — soft core + nodes still render */
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, step]);

  return positions;
}

function GlowSprite({
  color,
  scale = 1,
  opacity = 0.4,
}: {
  color: string | THREE.Color;
  scale?: number;
  opacity?: number;
}) {
  const texture = useMemo(() => softSpriteTexture(), []);
  useEffect(() => () => texture.dispose(), [texture]);

  return (
    <sprite scale={[scale, scale, 1]}>
      <spriteMaterial
        map={texture}
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </sprite>
  );
}

function LandDots({
  positions,
  color,
  dark,
}: {
  positions: Float32Array;
  color: THREE.Color;
  dark: boolean;
}) {
  const map = useMemo(() => softSpriteTexture(), []);
  useEffect(() => () => map.dispose(), [map]);

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  useEffect(() => () => geom.dispose(), [geom]);

  // With sizeAttenuation, `size` is world units (globe radius ≈ 1.4).
  // Values ≥1 blow out into a white blob — keep points tiny.
  return (
    <points geometry={geom} frustumCulled={false}>
      <pointsMaterial
        map={map}
        color={color}
        size={dark ? 0.028 : 0.024}
        sizeAttenuation
        transparent
        opacity={dark ? 0.78 : 0.65}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </points>
  );
}

const atmosphereVertex = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 world = modelMatrix * vec4(position, 1.0);
    vWorldPosition = world.xyz;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

const atmosphereFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - max(dot(viewDir, normalize(vNormal)), 0.0), 3.0);
    gl_FragColor = vec4(uColor, fresnel * uIntensity);
  }
`;

function Atmosphere({
  color,
  intensity,
}: {
  color: THREE.Color;
  intensity: number;
}) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uColor: { value: new THREE.Color() },
      uIntensity: { value: intensity },
    }),
    [intensity],
  );

  useFrame(() => {
    const mat = materialRef.current;
    if (!mat) return;
    mat.uniforms.uColor.value.copy(color);
    mat.uniforms.uIntensity.value = intensity;
  });

  return (
    <mesh scale={1.14}>
      <sphereGeometry args={[GLOBE_RADIUS, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={atmosphereVertex}
        fragmentShader={atmosphereFragment}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        side={THREE.BackSide}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

/** Barely-there glass body so continents read as the form. */
function SoftCore({ accent, dark }: { accent: THREE.Color; dark: boolean }) {
  return (
    <mesh>
      <sphereGeometry args={[GLOBE_RADIUS * 0.985, 64, 64]} />
      <meshBasicMaterial
        color={accent}
        transparent
        opacity={dark ? 0.04 : 0.03}
        depthWrite={false}
      />
    </mesh>
  );
}

function ModuleNode({
  def,
  lat,
  lng,
  hot,
  accent,
  hotCore,
  reduced,
  activeId,
  onActive,
}: {
  def: OrbitModuleDef;
  lat: number;
  lng: number;
  hot: boolean;
  accent: THREE.Color;
  hotCore: THREE.Color;
  reduced: boolean;
  activeId: string | null;
  onActive: (id: string | null) => void;
}) {
  const group = useRef<THREE.Group>(null);
  const pulse = useRef(
    (def.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 628) / 100,
  );
  const pos = useMemo(
    () => latLngToVec3(lat, lng, GLOBE_RADIUS * 1.04),
    [lat, lng],
  );
  const active = activeId === def.id;
  const coreColor = hot ? hotCore : accent;

  useFrame((_, dt) => {
    if (!group.current || reduced) return;
    pulse.current += dt;
    const s =
      1 +
      Math.sin(pulse.current * (hot ? 2.2 : 1.55)) * (hot ? 0.12 : 0.06);
    group.current.scale.setScalar(s);
  });

  return (
    <group
      ref={group}
      position={pos}
      onPointerOver={(e) => {
        e.stopPropagation();
        onActive(def.id);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        onActive(null);
        document.body.style.cursor = "";
      }}
      onClick={(e) => {
        e.stopPropagation();
        onActive(active ? null : def.id);
      }}
    >
      <GlowSprite
        color={accent}
        scale={hot ? 0.42 : 0.28}
        opacity={active ? 0.8 : hot ? 0.55 : 0.38}
      />
      <mesh>
        <sphereGeometry args={[hot ? 0.048 : 0.034, 20, 20]} />
        <meshBasicMaterial
          color={coreColor}
          transparent
          opacity={1}
          toneMapped={false}
        />
      </mesh>
      <GlowSprite color={hotCore} scale={hot ? 0.16 : 0.1} opacity={0.7} />
    </group>
  );
}

function IdleSpin({
  reduced,
  groupRef,
}: {
  reduced: boolean;
  groupRef: MutableRefObject<THREE.Group | null>;
}) {
  useFrame((_, dt) => {
    if (reduced || !groupRef.current) return;
    groupRef.current.rotation.y += dt * 0.055;
  });
  return null;
}

function DemandFrame({ active }: { active: boolean }) {
  const invalidate = useThree((s) => s.invalidate);
  useEffect(() => {
    if (active) invalidate();
  }, [active, invalidate]);
  return null;
}

function Scene({
  modules,
  reduced,
  dark,
  activeId,
  onActive,
  foreground,
  accent,
  land,
}: {
  modules: OrbitModuleDef[];
  reduced: boolean;
  dark: boolean;
  activeId: string | null;
  onActive: (id: string | null) => void;
  foreground: THREE.Color;
  accent: THREE.Color;
  land: Float32Array | null;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const { size } = useThree();
  const narrow = size.width < 520;

  const landColor = useMemo(() => {
    // Accent-led continents with a light touch of foreground (never near-white)
    const c = accent.clone();
    c.lerp(foreground, dark ? 0.18 : 0.12);
    c.lerp(new THREE.Color(dark ? "#d4a07a" : "#7a4024"), 0.3);
    return c;
  }, [accent, foreground, dark]);

  const hotCore = useMemo(() => {
    const c = accent.clone();
    c.lerp(new THREE.Color("#ffffff"), 0.5);
    return c;
  }, [accent]);

  const hotId = useMemo(() => {
    if (modules.some((m) => m.id === "attendance")) return "attendance";
    return modules[0]?.id ?? null;
  }, [modules]);

  const nodePins = useMemo(
    () =>
      modules.map((m, i) => {
        const [lat, lng] = globeLatLngFor(m.id, i);
        return { def: m, lat, lng, hot: m.id === hotId };
      }),
    [modules, hotId],
  );

  useEffect(() => {
    if (groupRef.current) {
      // Americas / Atlantic toward camera
      groupRef.current.rotation.set(0.15, -0.4, 0.05);
    }
  }, []);

  return (
    <>
      <DemandFrame active={reduced || land !== null} />
      <ambientLight intensity={0.55} />
      <Stars
        radius={42}
        depth={24}
        count={narrow ? 80 : 140}
        factor={1.1}
        saturation={0}
        fade
        speed={reduced ? 0 : 0.2}
      />
      <group ref={groupRef}>
        <IdleSpin reduced={reduced} groupRef={groupRef} />
        <SoftCore accent={accent} dark={dark} />
        <Atmosphere color={accent} intensity={dark ? 0.42 : 0.26} />
        {land && land.length > 0 ? (
          <LandDots positions={land} color={landColor} dark={dark} />
        ) : null}
        {nodePins.map(({ def, lat, lng, hot }) => (
          <ModuleNode
            key={def.id}
            def={def}
            lat={lat}
            lng={lng}
            hot={hot}
            accent={accent}
            hotCore={hotCore}
            reduced={reduced}
            activeId={activeId}
            onActive={onActive}
          />
        ))}
      </group>
      <OrbitControls
        enablePan={false}
        enableZoom
        enableRotate
        minDistance={4}
        maxDistance={7.5}
        zoomSpeed={0.5}
        rotateSpeed={0.5}
        autoRotate={false}
        makeDefault
      />
    </>
  );
}

const FALLBACK_LABELS: Record<string, { label: string; blurb: string }> = {
  attendance: {
    label: "Attendance",
    blurb: "Live clock-ins flowing into the shared API.",
  },
  hrm: {
    label: "HR",
    blurb: "People data synced across every module.",
  },
  "project-management": {
    label: "Projects",
    blurb: "Delivery timelines on the same backbone.",
  },
  crms: {
    label: "CRM",
    blurb: "Pipeline events streaming in real time.",
  },
};

const FALLBACK_MODULES: OrbitModuleDef[] = Object.keys(ORBIT_SEED_BY_SLUG).map(
  (slug) => {
    const meta = FALLBACK_LABELS[slug];
    return {
      id: slug,
      label: meta?.label ?? slug,
      blurb: meta?.blurb ?? "",
      orbit: ORBIT_SEED_BY_SLUG[slug] ?? [2.05, 0.4, 0.4, 0.28],
    };
  },
);

export function GlobeSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "aspect-square w-full max-w-xl animate-pulse rounded-full bg-hero-glow/25",
        className,
      )}
      aria-hidden="true"
    />
  );
}

export type HeroGlobeProps = {
  className?: string;
  modules?: OrbitModuleDef[];
  reducedMotion?: boolean;
  showHints?: boolean;
};

/**
 * Theme-aware WebGL ERP module globe for the home hero.
 * Self-hosted topology → soft land dots; accent nodes; transparent canvas (no EffectComposer).
 */
export default function HeroGlobe({
  className,
  modules,
  reducedMotion = false,
  showHints = true,
}: HeroGlobeProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const webgl = useWebGLSupport();
  const inView = useInView(rootRef);
  const dark = useIsDarkTheme();
  const foreground = useCssColor("--hero-foreground", "#f5ebe3");
  const accent = useCssColor("--hero-accent", "#E8733A");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCoarse, setIsCoarse] = useState(false);

  const resolved =
    modules && modules.length > 0 ? modules : FALLBACK_MODULES;
  const active = resolved.find((m) => m.id === activeId) ?? null;
  const landStep = isCoarse ? 5 : 3;
  const land = useEarthDots(webgl && inView, landStep);

  const onActive = useCallback((id: string | null) => {
    setActiveId(id);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(pointer: coarse)");
    const sync = () => setIsCoarse(mq.matches);
    const raf = requestAnimationFrame(sync);
    mq.addEventListener("change", sync);
    return () => {
      cancelAnimationFrame(raf);
      mq.removeEventListener("change", sync);
    };
  }, []);

  if (!webgl) {
    return <GlobeSkeleton className={className} />;
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative aspect-square w-full touch-none bg-transparent",
        className,
      )}
      aria-hidden="true"
      style={{ touchAction: "none" }}
    >
      {inView ? (
        <Canvas
          dpr={isCoarse ? [1, 1.5] : [1, 1.85]}
          camera={{ position: [0, 0.05, 5.4], fov: 34 }}
          frameloop={reducedMotion ? "demand" : "always"}
          gl={{
            antialias: true,
            alpha: true,
            premultipliedAlpha: false,
            powerPreference: "high-performance",
            failIfMajorPerformanceCaveat: false,
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0);
            gl.setClearAlpha(0);
          }}
          className="!bg-transparent !overflow-visible"
          style={{
            background: "transparent",
            overflow: "visible",
            touchAction: "none",
          }}
        >
          <Suspense fallback={null}>
            <Scene
              modules={resolved}
              reduced={reducedMotion}
              dark={dark}
              activeId={activeId}
              onActive={onActive}
              foreground={foreground}
              accent={accent}
              land={land}
            />
          </Suspense>
        </Canvas>
      ) : (
        <GlobeSkeleton />
      )}

      {showHints ? (
        <AnimatePresence initial={false}>
          {active ? (
            <motion.div
              key={active.id}
              initial={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 12, filter: "blur(6px)" }
              }
              animate={
                reducedMotion
                  ? { opacity: 1 }
                  : { opacity: 1, y: 0, filter: "blur(0px)" }
              }
              exit={
                reducedMotion
                  ? { opacity: 0 }
                  : { opacity: 0, y: 8, filter: "blur(4px)" }
              }
              transition={{
                duration: reducedMotion ? 0.01 : 0.28,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="pointer-events-none absolute inset-x-8 bottom-1 z-10 rounded-2xl border border-hero-chip-border bg-hero-chip/90 px-4 py-3 shadow-2xl backdrop-blur-xl"
            >
              <p className="text-sm font-semibold tracking-wide text-hero-foreground">
                {active.label}
              </p>
              {active.blurb ? (
                <p className="mt-0.5 text-xs leading-relaxed text-hero-muted-foreground">
                  {active.blurb}
                </p>
              ) : null}
            </motion.div>
          ) : (
            <motion.p
              key="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.65 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-x-0 bottom-2 z-10 mx-auto w-fit rounded-full border border-hero-chip-border bg-hero-chip/65 px-3.5 py-1 text-center text-[10px] tracking-[0.2em] uppercase text-hero-muted-foreground backdrop-blur-md"
            >
              {reducedMotion
                ? "Globe · reduced motion"
                : "Drag to rotate · Scroll to zoom"}
            </motion.p>
          )}
        </AnimatePresence>
      ) : null}
    </div>
  );
}
