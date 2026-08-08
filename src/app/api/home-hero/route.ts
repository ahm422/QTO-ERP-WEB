import { NextResponse } from "next/server";
import { jsonError } from "@/lib/api-errors";
import { getHomeHero, listHeroOrbitModules } from "@/lib/content-db";
import { toOrbitModuleDefs } from "@/lib/hero-orbit";

export async function GET() {
  try {
    const [hero, orbitModules] = await Promise.all([
      getHomeHero(),
      listHeroOrbitModules(),
    ]);
    return NextResponse.json({
      ok: true,
      hero,
      modules: toOrbitModuleDefs(orbitModules),
    });
  } catch (err) {
    console.error("[api/home-hero GET] Error:", err);
    return jsonError("Something went wrong.", 500);
  }
}
