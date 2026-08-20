import { TrustedByStrip } from "@/components/common/TrustedByStrip";
import {
  TRUSTED_LOGOS_DEFAULTS,
} from "@/lib/home-sections-defaults";
import { mediaUrl } from "@/lib/media";
import type { TrustedLogo } from "@/types/content";

type TrustedByProps = {
  logos?: TrustedLogo[];
};

function toStripLogos(logos: TrustedLogo[]) {
  return logos.map((logo) => ({
    name: logo.name,
    imageUrl: logo.imageUrl,
    href: logo.linkUrl,
  }));
}

function defaultLogos(): TrustedLogo[] {
  return TRUSTED_LOGOS_DEFAULTS.map((d, index) => ({
    id: `default-logo-${index}`,
    name: d.name,
    imageUrl: d.logoImageKey ? mediaUrl(d.logoImageKey) : null,
    linkUrl: d.linkUrl,
    sortOrder: d.sortOrder,
  }));
}

export default function TrustedBy({ logos }: TrustedByProps) {
  const resolved = logos?.length ? logos : defaultLogos();

  return (
    <section className="section-padding pt-0 pb-0 md:pt-4 md:pb-0">
      <div className="container-main">
        <TrustedByStrip logos={toStripLogos(resolved)} />
      </div>
    </section>
  );
}
