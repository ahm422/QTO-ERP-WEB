"use client";

import dynamic from "next/dynamic";

const EyebrowDemo = dynamic(
  () => import("./MarketingDnaDemos").then((m) => m.EyebrowDemo),
  { ssr: false, loading: () => <DemoSkeleton /> }
);
const MarketingButtonDemo = dynamic(
  () => import("./MarketingDnaDemos").then((m) => m.MarketingButtonDemo),
  { ssr: false, loading: () => <DemoSkeleton /> }
);
const MarketingCardsDemo = dynamic(
  () => import("./MarketingDnaDemos").then((m) => m.MarketingCardsDemo),
  { ssr: false, loading: () => <DemoSkeleton /> }
);
const StatsDemo = dynamic(
  () => import("./MarketingDnaDemos").then((m) => m.StatsDemo),
  { ssr: false, loading: () => <DemoSkeleton /> }
);
const SelectorPanelDemo = dynamic(
  () => import("./MarketingDnaDemos").then((m) => m.SelectorPanelDemo),
  { ssr: false, loading: () => <DemoSkeleton className="min-h-[20rem]" /> }
);
const DarkCtaBandDemo = dynamic(
  () => import("./MarketingDnaDemos").then((m) => m.DarkCtaBandDemo),
  { ssr: false, loading: () => <DemoSkeleton className="min-h-[16rem]" /> }
);
const GridBackgroundDemo = dynamic(
  () => import("./MarketingDnaDemos").then((m) => m.GridBackgroundDemo),
  { ssr: false, loading: () => <DemoSkeleton className="min-h-[16rem]" /> }
);

function DemoSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={
        className ??
        "min-h-[8rem] animate-pulse rounded-2xl border border-border bg-muted/50"
      }
    />
  );
}

export {
  EyebrowDemo,
  MarketingButtonDemo,
  MarketingCardsDemo,
  StatsDemo,
  SelectorPanelDemo,
  DarkCtaBandDemo,
  GridBackgroundDemo,
};
