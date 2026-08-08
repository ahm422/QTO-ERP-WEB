"use client";

import StatsStrip from "@/components/common/Stats";
import { HOME_STATS_DEFAULTS } from "@/lib/home-sections-defaults";
import { getStatIcon } from "@/lib/icon-map";
import type { HomeStat } from "@/types/content";

type HomeStatsProps = {
  stats?: HomeStat[];
};

function defaultStats(): HomeStat[] {
  return HOME_STATS_DEFAULTS.map((d, index) => ({
    id: `default-stat-${index}`,
    label: d.label,
    value: d.value,
    suffix: d.suffix,
    iconKey: d.iconKey,
    sortOrder: d.sortOrder,
  }));
}

export default function HomeStats({ stats }: HomeStatsProps) {
  const resolved = stats?.length ? stats : defaultStats();

  return (
    <StatsStrip
      stats={resolved.map((stat) => ({
        value: stat.value,
        suffix: stat.suffix,
        label: stat.label,
        icon: getStatIcon(stat.iconKey),
      }))}
    />
  );
}
