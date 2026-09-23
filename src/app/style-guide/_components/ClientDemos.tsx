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
const FeatureCardBoardDemo = dynamic(
  () => import("./MarketingDnaDemos").then((m) => m.FeatureCardBoardDemo),
  { ssr: false, loading: () => <DemoSkeleton /> }
);
const FormInputDemo = dynamic(
  () => import("./MarketingDnaDemos").then((m) => m.FormInputDemo),
  { ssr: false, loading: () => <DemoSkeleton /> }
);
const BoardTypographyDemo = dynamic(
  () => import("./MarketingDnaDemos").then((m) => m.BoardTypographyDemo),
  { ssr: false, loading: () => <DemoSkeleton className="min-h-[16rem]" /> }
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
const OrbitMotifDemo = dynamic(
  () => import("./MarketingDnaDemos").then((m) => m.OrbitMotifDemo),
  { ssr: false, loading: () => <DemoSkeleton className="min-h-[20rem]" /> }
);
const TrustedByStripDemo = dynamic(
  () => import("./MarketingDnaDemos").then((m) => m.TrustedByStripDemo),
  { ssr: false, loading: () => <DemoSkeleton /> }
);
const BuiltForSectionDemo = dynamic(
  () => import("./MarketingDnaDemos").then((m) => m.BuiltForSectionDemo),
  { ssr: false, loading: () => <DemoSkeleton className="min-h-[16rem]" /> }
);
const IntegratedModulesGridDemo = dynamic(
  () =>
    import("./MarketingDnaDemos").then((m) => m.IntegratedModulesGridDemo),
  { ssr: false, loading: () => <DemoSkeleton className="min-h-[16rem]" /> }
);
const EcosystemTabsDemo = dynamic(
  () => import("./MarketingDnaDemos").then((m) => m.EcosystemTabsDemo),
  { ssr: false, loading: () => <DemoSkeleton className="min-h-[16rem]" /> }
);
const IndustryCardDemo = dynamic(
  () => import("./MarketingDnaDemos").then((m) => m.IndustryCardDemo),
  { ssr: false, loading: () => <DemoSkeleton /> }
);
const BadgeBoardDemo = dynamic(
  () => import("./MarketingDnaDemos").then((m) => m.BadgeBoardDemo),
  { ssr: false, loading: () => <DemoSkeleton /> }
);
const StepCardDemo = dynamic(
  () => import("./MarketingDnaDemos").then((m) => m.StepCardDemo),
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
  FeatureCardBoardDemo,
  FormInputDemo,
  BoardTypographyDemo,
  StatsDemo,
  SelectorPanelDemo,
  DarkCtaBandDemo,
  GridBackgroundDemo,
  OrbitMotifDemo,
  TrustedByStripDemo,
  BuiltForSectionDemo,
  IntegratedModulesGridDemo,
  EcosystemTabsDemo,
  IndustryCardDemo,
  BadgeBoardDemo,
  StepCardDemo,
};
