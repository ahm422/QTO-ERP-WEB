import { BuiltForSection } from "@/components/common/BuiltForSection";
import {
  BUILT_FOR_CARDS_DEFAULTS,
  BUILT_FOR_SECTION_DEFAULT,
} from "@/lib/home-sections-defaults";
import { getMarketingIcon } from "@/lib/icon-map";
import type { BuiltForSection as BuiltForSectionData } from "@/types/content";

type BuiltForProps = {
  data?: BuiltForSectionData;
};

function defaultBuiltFor(): BuiltForSectionData {
  return {
    section: {
      tag: BUILT_FOR_SECTION_DEFAULT.tag,
      title: BUILT_FOR_SECTION_DEFAULT.title,
      accent: BUILT_FOR_SECTION_DEFAULT.accent,
      description: BUILT_FOR_SECTION_DEFAULT.description,
    },
    cards: BUILT_FOR_CARDS_DEFAULTS.map((d, index) => ({
      id: `default-built-for-${index}`,
      title: d.title,
      description: d.description,
      iconKey: d.iconKey,
      sortOrder: d.sortOrder,
    })),
  };
}

export default function BuiltFor({ data }: BuiltForProps) {
  const resolved =
    data?.cards?.length && data.section ? data : defaultBuiltFor();
  const { section, cards } = resolved;

  return (
    <BuiltForSection
      tag={section.tag}
      title={section.title}
      accent={section.accent}
      description={section.description}
      audiences={cards.map((card) => ({
        id: card.id,
        title: card.title,
        description: card.description,
        icon: getMarketingIcon(card.iconKey),
      }))}
    />
  );
}
