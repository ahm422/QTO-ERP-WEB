'use client';

import { Environment, Float, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type RefObject,
} from 'react';
import * as THREE from 'three';
import { usePalette } from '@/components/PaletteProvider';

type HeroColors = {
  accent: string;
  accentDark: string;
};

type ModuleDef = {
  id: string;
  label: string;
  blurb: string;
  orbit: [number, number, number, number];
};

const MODULES: ModuleDef[] = [
  {
    id: 'attendance',
    label: 'Attendance',
    blurb: 'Live clock-ins flowing into the shared API.',
    orbit: [2.05, 0.4, 0.4, 0.28],
  },
  {
    id: 'hr',
    label: 'HR',
    blurb: 'People data synced across every module.',
    orbit: [2.05, -0.45, 2.1, 0.22],
  },
  {
    id: 'pm',
    label: 'Projects',
    blurb: 'Delivery timelines on the same backbone.',
    orbit: [2.45, 0.55, 3.6, 0.18],
  },
  {
    id: 'crm',
    label: 'CRM',
    blurb: 'Pipeline events streaming in real time.',
    orbit: [2.45, -0.3, 5.1, 0.24],
  },
];

function cssToRgb(cssColor: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 1;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return fallback;
    ctx.fillStyle = '#000000';
    ctx.fillStyle = cssColor;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
    return `rgb(${r}, ${g}, ${b})`;
  } catch {
    return fallback;
  }
}

function useHeroColors(): HeroColors {
  const { palette } = usePalette();
  const [colors, setColors] = useState<HeroColors>({
    accent: '#818cf8',
    accentDark: '#4f46e5',
  });
  useEffect(() => {
    const s = getComputedStyle(document.documentElement);
    setColors({
      accent: cssToRgb(s.getPropertyValue('--hero-accent').trim(), '#818cf8'),
      accentDark: cssToRgb(
        s.getPropertyValue('--accent-dark').trim(),
        '#4f46e5',
      ),
    });
  }, [palette]);
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
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const g = ctx.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2,
    );
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.35, 'rgba(255,255,255,0.45)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
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

function SoftBeam({
  targetRef,
  color,
  active,
}: {
  targetRef: RefObject<THREE.Group | null>;
  color: string;
  active: boolean;
}) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const up = useMemo(() => new THREE.Vector3(0, 1, 0), []);
  const dir = useMemo(() => new THREE.Vector3(), []);
  const mid = useMemo(() => new THREE.Vector3(), []);
  const quat = useMemo(() => new THREE.Quaternion(), []);

  useFrame((_, dt) => {
    if (!mesh.current || !targetRef.current || !mat.current) return;
    const end = targetRef.current.position;
    const len = Math.max(end.length(), 0.001);
    mid.copy(end).multiplyScalar(0.5);
    mesh.current.position.copy(mid);
    dir.copy(end).normalize();
    quat.setFromUnitVectors(up, dir);
    mesh.current.quaternion.copy(quat);
    const radius = active ? 0.028 : 0.01;
    mesh.current.scale.set(radius, len, radius);
    mat.current.opacity = THREE.MathUtils.damp(
      mat.current.opacity,
      active ? 0.7 : 0.18,
      8,
      dt,
    );
  });

  return (
    <mesh ref={mesh}>
      <cylinderGeometry args={[1, 1, 1, 12]} />
      <meshBasicMaterial
        ref={mat}
        color={color}
        transparent
        opacity={0.18}
        depthWrite={false}
      />
    </mesh>
  );
}

function OrbitalModule({
  def,
  colors,
  reduced,
  activeId,
  onActive,
}: {
  def: ModuleDef;
  colors: HeroColors;
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
      Math.sin(a) * r * 0.75,
    );
    if (ball.current) {
      const target = hovered ? 1.55 : 1;
      const s = THREE.MathUtils.damp(ball.current.scale.x, target, 12, dt);
      ball.current.scale.setScalar(s);
    }
  });

  return (
    <>
      <SoftBeam targetRef={group} color={colors.accent} active={hovered} />
      <group ref={group}>
        <mesh
          ref={ball}
          onPointerOver={(e) => {
            e.stopPropagation();
            onActive(def.id);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            onActive(null);
            document.body.style.cursor = 'auto';
          }}
        >
          <sphereGeometry args={[0.18, 48, 48]} />
          <meshPhysicalMaterial
            color={colors.accent}
            emissive={colors.accent}
            emissiveIntensity={hovered ? 2.4 : 1.1}
            metalness={0.3}
            roughness={0.12}
            clearcoat={1}
            clearcoatRoughness={0.08}
          />
        </mesh>
        <GlowSprite
          color={colors.accent}
          scale={hovered ? 1.4 : 0.7}
          opacity={hovered ? 0.85 : 0.4}
        />
      </group>
    </>
  );
}

function OrbitRing({
  radius,
  color,
  rotation,
  opacity = 0.35,
}: {
  radius: number;
  color: string;
  rotation: [number, number, number];
  opacity?: number;
}) {
  return (
    <mesh rotation={rotation}>
      <torusGeometry args={[radius, 0.008, 16, 200]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={opacity}
        depthWrite={false}
      />
    </mesh>
  );
}

function Core({
  colors,
  hot,
  reduced,
}: {
  colors: HeroColors;
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
          color={colors.accent}
          metalness={0.05}
          roughness={0.04}
          transmission={0.94}
          thickness={1.6}
          ior={1.45}
          clearcoat={1}
          clearcoatRoughness={0.03}
          transparent
          envMapIntensity={1.8}
          attenuationColor={colors.accentDark}
          attenuationDistance={0.7}
        />
      </mesh>
      <mesh ref={inner} scale={0.4}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={colors.accent}
          emissive={colors.accent}
          emissiveIntensity={hot ? 2.6 : 1.4}
          metalness={0.6}
          roughness={0.15}
        />
      </mesh>
      <mesh scale={0.24}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial color='#ffffff' />
      </mesh>
      <GlowSprite color={colors.accent} scale={hot ? 4.2 : 3.2} opacity={0.6} />
      <GlowSprite color='#ffffff' scale={1.4} opacity={0.35} />
    </group>
  );
}

function Scene({
  colors,
  reduced,
  activeId,
  onActive,
}: {
  colors: HeroColors;
  reduced: boolean;
  activeId: string | null;
  onActive: (id: string | null) => void;
}) {
  const system = (
    <group>
      <OrbitRing
        radius={2.05}
        color={colors.accent}
        rotation={[1.15, 0.3, 0.1]}
        opacity={0.4}
      />
      <OrbitRing
        radius={2.45}
        color={colors.accent}
        rotation={[1.4, -0.45, 0.55]}
        opacity={0.22}
      />
      <OrbitRing
        radius={1.55}
        color={colors.accent}
        rotation={[0.4, 0.8, 0.2]}
        opacity={0.18}
      />
      <Core colors={colors} hot={!!activeId} reduced={reduced} />
      {MODULES.map((mod) => (
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
      <ambientLight intensity={0.55} />
      <spotLight
        position={[5, 7, 4]}
        angle={0.4}
        penumbra={0.85}
        intensity={2.8}
        color='#ffffff'
      />
      <pointLight
        position={[-4, -2, -3]}
        intensity={1.8}
        color={colors.accent}
        distance={14}
      />
      <Environment preset='studio' environmentIntensity={1} />
      {reduced ? (
        system
      ) : (
        <Float speed={1.4} rotationIntensity={0.2} floatIntensity={0.45}>
          {system}
        </Float>
      )}
      {!reduced && (
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.55}
          maxPolarAngle={Math.PI / 1.55}
          minPolarAngle={Math.PI / 3.2}
          rotateSpeed={0.55}
        />
      )}
    </>
  );
}

export default function HeroApiConstellation({
  className,
}: {
  className?: string;
}) {
  const reduced = useReducedMotion();
  const colors = useHeroColors();
  const [activeId, setActiveId] = useState<string | null>(null);
  const active = MODULES.find((m) => m.id === activeId) ?? null;

  return (
    <div
      className={`relative aspect-square w-full ${className ?? ''}`}
      aria-hidden='true'
    >
      <Canvas
        key={colors.accent}
        dpr={[1, 1.85]}
        camera={{ position: [0, 0.55, 6.2], fov: 34 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0);
        }}
      >
        <Suspense fallback={null}>
          <Scene
            colors={colors}
            reduced={!!reduced}
            activeId={activeId}
            onActive={setActiveId}
          />
        </Suspense>
      </Canvas>

      <AnimatePresence mode='wait'>
        {active ? (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 8, filter: 'blur(4px)' }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className='pointer-events-none absolute inset-x-6 bottom-2 rounded-2xl border border-hero-chip-border bg-hero-chip/90 px-4 py-3 shadow-2xl backdrop-blur-xl'
          >
            <p className='text-sm font-semibold tracking-wide text-hero-foreground'>
              {active.label}
            </p>
            <p className='mt-0.5 text-xs leading-relaxed text-hero-muted-foreground'>
              {active.blurb}
            </p>
          </motion.div>
        ) : (
          <motion.p
            key='hint'
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.65 }}
            exit={{ opacity: 0 }}
            className='pointer-events-none absolute inset-x-0 bottom-3 text-center text-[11px] tracking-[0.2em] uppercase text-hero-muted-foreground'
          >
            Drag to orbit · Hover a module
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
