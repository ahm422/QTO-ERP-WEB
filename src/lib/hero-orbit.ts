import type { OrbitModuleDef } from "@/components/ui/orbit-motif";
import {
  ORBIT_INDEX_DEFAULTS,
  ORBIT_SEED_BY_SLUG,
} from "@/lib/home-hero-defaults";
import type { HeroOrbitModule } from "@/types/content";

export type OrbitModuleSource = Pick<
  HeroOrbitModule,
  | "slug"
  | "name"
  | "shortDescription"
  | "cardTagline"
  | "showInHeroOrbit"
  | "orbitRadius"
  | "orbitTilt"
  | "orbitPhase"
  | "orbitSpeed"
>;

/** Seed orbit tuple for a slug, then index fallback. */
export function defaultOrbitFor(
  slug: string,
  index = 0,
): [number, number, number, number] {
  const bySlug = ORBIT_SEED_BY_SLUG[slug];
  if (bySlug) return bySlug;
  return ORBIT_INDEX_DEFAULTS[index % ORBIT_INDEX_DEFAULTS.length];
}

/** Map CMS modules → OrbitMotif defs (filters showInHeroOrbit === false). */
export function toOrbitModuleDefs(
  modules: OrbitModuleSource[],
): OrbitModuleDef[] {
  const visible = modules.filter((m) => m.showInHeroOrbit !== false);
  return visible.map((m, i) => {
    const fallback = defaultOrbitFor(m.slug, i);
    return {
      id: m.slug,
      label: m.name,
      blurb: m.shortDescription || m.cardTagline || "",
      orbit: [
        m.orbitRadius ?? fallback[0],
        m.orbitTilt ?? fallback[1],
        m.orbitPhase ?? fallback[2],
        m.orbitSpeed ?? fallback[3],
      ],
    };
  });
}
