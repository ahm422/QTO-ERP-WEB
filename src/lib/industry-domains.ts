/**
 * Industry-domain helpers for style-guide demos and runtime fallbacks.
 * Production homepage loads from D1 via getIndustryEcosystemSection().
 */

import {
  INDUSTRY_DOMAINS_DEFAULTS,
  type IndustryDomainDefault,
} from "@/lib/industry-domains-defaults";

export type IndustryDomain = {
  id: string;
  order: number;
  name: string;
  systemCount: number;
  description: string;
  leaders: string[];
  iconKey: string;
  /** Explore CTA; when omitted, UI falls back to `/allApps`. */
  href?: string;
};

function toLegacyDomain(d: IndustryDomainDefault): IndustryDomain {
  return {
    id: d.slug,
    order: d.sortOrder + 1,
    name: d.name,
    systemCount: d.systemsCount,
    description: d.description,
    leaders: d.leaders,
    iconKey: d.iconKey,
    ...(d.ctaUrl ? { href: d.ctaUrl } : {}),
  };
}

/** Static catalog derived from CMS defaults (style-guide / fallback). */
export const INDUSTRY_DOMAINS: IndustryDomain[] =
  INDUSTRY_DOMAINS_DEFAULTS.map(toLegacyDomain).sort(
    (a, b) => a.order - b.order,
  );

export function getIndustryDomains(): IndustryDomain[] {
  return INDUSTRY_DOMAINS;
}

export function getIndustryDomainById(
  id: string,
): IndustryDomain | undefined {
  return INDUSTRY_DOMAINS.find((domain) => domain.id === id);
}
