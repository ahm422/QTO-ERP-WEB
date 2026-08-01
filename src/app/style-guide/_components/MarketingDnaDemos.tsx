"use client";

import type { ReactNode } from "react";
import {
  Boxes,
  Building2,
  ClipboardList,
  Layers,
  Sparkles,
  Star,
  Users,
  Workflow,
  Percent,
  Hash,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { EyebrowBadge } from "@/components/ui/eyebrow-badge";
import { MarketingButton } from "@/components/ui/marketing-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardIcon,
} from "@/components/ui/card";
import { StatsStrip } from "@/components/common/Stats";
import { SelectorPanel, type SelectorItem } from "@/components/ui/selector-panel";
import { DarkCtaBand } from "@/components/ui/dark-cta-band";
import { GridBackground } from "@/components/ui/grid-background";
import {
  getCardHover,
  getIconChipHover,
  getStaggerContainer,
  getStaggerItem,
  viewportOnce,
} from "@/lib/motion";

const MODULE_ITEMS: SelectorItem[] = [
  {
    id: "attendance",
    label: "Attendance",
    description: "Time & presence",
    icon: ClipboardList,
  },
  {
    id: "hr",
    label: "HR Core",
    description: "People ops",
    icon: Users,
  },
  {
    id: "inventory",
    label: "Inventory",
    description: "Stock & warehouses",
    icon: Boxes,
  },
  {
    id: "crm",
    label: "CRM",
    description: "Pipeline & deals",
    icon: Layers,
  },
];

const DOMAIN_ITEMS: SelectorItem[] = [
  {
    id: "manufacturing",
    label: "Manufacturing",
    description: "Shop floor to ship",
    icon: Building2,
  },
  {
    id: "services",
    label: "Professional services",
    description: "Projects & billing",
    icon: Workflow,
  },
  {
    id: "retail",
    label: "Retail",
    description: "Omnichannel ops",
    icon: Sparkles,
  },
];

const DEMO_STATS = [
  { value: 4.9, suffix: "/5.0", label: "Average rating", icon: Star },
  { value: 65, suffix: "%", label: "Faster rollout", icon: Percent },
  { value: 25000, suffix: "+", label: "Active seats", icon: Hash },
  { value: 98, suffix: "%", label: "Satisfaction", icon: Users },
];

function ThemeFrame({
  dark,
  children,
}: {
  dark?: boolean;
  children: ReactNode;
}) {
  return (
    <div
      className={
        dark
          ? "dark rounded-2xl border border-border bg-background p-5 text-foreground"
          : "rounded-2xl border border-border bg-background p-5 text-foreground"
      }
    >
      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {dark ? "Dark (.dark wrapper)" : "Light"}
      </p>
      {children}
    </div>
  );
}

export function EyebrowDemo() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ThemeFrame>
        <div className="flex flex-wrap gap-3">
          <EyebrowBadge
            icon={Layers}
            label="Integrated Module Catalog"
            variant="muted"
          />
          <EyebrowBadge
            icon={Workflow}
            label="Evaluation Workflow"
            variant="accent"
          />
        </div>
      </ThemeFrame>
      <ThemeFrame dark>
        <div className="flex flex-wrap gap-3">
          <EyebrowBadge
            icon={Layers}
            label="Integrated Module Catalog"
            variant="muted"
          />
          <EyebrowBadge
            icon={Workflow}
            label="Evaluation Workflow"
            variant="accent"
          />
        </div>
      </ThemeFrame>
    </div>
  );
}

export function MarketingButtonDemo() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ThemeFrame>
        <div className="flex flex-wrap gap-3">
          <MarketingButton variant="primary">Explore modules</MarketingButton>
          <MarketingButton variant="secondary">Book a demo</MarketingButton>
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Hover — arrow slides via springSnappy. Press — whileTap scale 0.97
          (disabled under prefers-reduced-motion).
        </p>
      </ThemeFrame>
      <ThemeFrame dark>
        <div className="flex flex-wrap gap-3">
          <MarketingButton variant="primary">Explore modules</MarketingButton>
          <MarketingButton variant="secondary">Book a demo</MarketingButton>
        </div>
      </ThemeFrame>
    </div>
  );
}

export function MarketingCardsDemo() {
  const reduced = useReducedMotion();
  const container = getStaggerContainer(reduced);
  const item = getStaggerItem(reduced);
  const hover = getCardHover(reduced);
  const iconHover = getIconChipHover(reduced);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {[false, true].map((dark) => (
        <ThemeFrame key={String(dark)} dark={dark}>
          <motion.div
            className="grid gap-4"
            variants={container}
            initial="hidden"
            whileInView="visible"
            viewport={viewportOnce}
          >
            <motion.div variants={item} whileHover={hover}>
              <Card variant="interactive" radius="lg">
                <CardHeader className="flex-row items-start gap-3 space-y-0">
                  <motion.div whileHover={iconHover}>
                    <CardIcon color="orange">
                      <ClipboardList className="size-5" />
                    </CardIcon>
                  </motion.div>
                  <div>
                    <CardTitle className="font-display">Attendance</CardTitle>
                    <CardDescription>
                      Shared cardHover — lift + scale 1.03 + icon chip spring.
                    </CardDescription>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>

            <motion.div variants={item} whileHover={hover}>
              <Card variant="default" radius="xl" padding="md">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Case study
                    </p>
                    <CardTitle className="mt-1 font-display text-lg">
                      Acme Manufacturing
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Cut payroll cycle time by 40% with unified HR + attendance.
                    </CardDescription>
                  </div>
                  <MarketingButton variant="secondary" size="sm" iconSlide>
                    Read story
                  </MarketingButton>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item} whileHover={hover}>
              <Card variant="default" radius="xl">
                <CardHeader>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Pricing
                  </p>
                  <CardTitle className="font-display text-2xl">Growth</CardTitle>
                  <CardDescription>For scaling multi-site teams</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-display text-4xl font-bold tracking-tight">
                    $49
                    <span className="text-base font-sans font-normal text-muted-foreground">
                      /seat
                    </span>
                  </p>
                </CardContent>
                <CardFooter>
                  <MarketingButton variant="primary" className="w-full">
                    Start trial
                  </MarketingButton>
                </CardFooter>
              </Card>
            </motion.div>
          </motion.div>
        </ThemeFrame>
      ))}
    </div>
  );
}

export function StatsDemo() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <ThemeFrame>
        <StatsStrip stats={DEMO_STATS} className="mt-0 max-w-none px-0" />
      </ThemeFrame>
      <ThemeFrame dark>
        <StatsStrip stats={DEMO_STATS} className="mt-0 max-w-none px-0" />
      </ThemeFrame>
    </div>
  );
}

export function SelectorPanelDemo() {
  return (
    <div className="space-y-8">
      <p className="text-xs text-muted-foreground">
        Detail pane uses AnimatePresence mode=&quot;wait&quot; + panelSwap
        (crossfade/slide). Emulate prefers-reduced-motion to collapse travel.
      </p>
      <div>
        <p className="mb-3 text-sm font-medium text-foreground">
          Module catalog
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          {[false, true].map((dark) => (
            <ThemeFrame key={`mod-${dark}`} dark={dark}>
              <SelectorPanel
                items={MODULE_ITEMS}
                defaultValue="attendance"
                renderDetail={(item) => (
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      Deep-dive for{" "}
                      <strong className="text-foreground">{item.label}</strong>
                      — features, integrations, and rollout checklist.
                    </p>
                    <ul className="list-inside list-disc space-y-1">
                      <li>Configurable workflows</li>
                      <li>Role-based permissions</li>
                      <li>Audit-ready exports</li>
                    </ul>
                  </div>
                )}
              />
            </ThemeFrame>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-medium text-foreground">
          Domain explorer
        </p>
        <div className="grid gap-4 lg:grid-cols-2">
          {[false, true].map((dark) => (
            <ThemeFrame key={`dom-${dark}`} dark={dark}>
              <SelectorPanel
                items={DOMAIN_ITEMS}
                defaultValue="manufacturing"
                renderDetail={(item) => (
                  <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                      Recommended stack for{" "}
                      <strong className="text-foreground">{item.label}</strong>{" "}
                      operators evaluating QTO House modules.
                    </p>
                    <p>
                      Pair inventory, manufacturing, and accounting for a closed
                      loop from quote to cash.
                    </p>
                  </div>
                )}
              />
            </ThemeFrame>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DarkCtaBandDemo() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {[false, true].map((dark) => (
        <ThemeFrame key={`cta-${dark}`} dark={dark}>
          <DarkCtaBand
            eyebrow="Partner program"
            eyebrowIcon={Sparkles}
            title="List your module"
            description="Publish your ERP system to the QTO catalog and reach evaluation-ready buyers."
            primaryAction={
              <MarketingButton variant="inverse">List your module</MarketingButton>
            }
            secondaryAction={
              <MarketingButton variant="inverse-secondary">
                Book a demo
              </MarketingButton>
            }
          />
        </ThemeFrame>
      ))}
    </div>
  );
}

export function GridBackgroundDemo() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {[false, true].map((dark) => (
        <ThemeFrame key={`grid-${dark}`} dark={dark}>
          <GridBackground
            opacity={0.45}
            className="overflow-hidden rounded-2xl border border-border bg-card px-6 py-14"
          >
            <div className="mx-auto max-w-md text-center">
              <EyebrowBadge
                icon={Sparkles}
                label="Hero texture"
                variant="muted"
                className="mb-4"
              />
              <h3 className="font-display text-3xl font-bold tracking-tight">
                Mock hero headline
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Dotted grid is decorative — CTAs below stay clickable.
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <MarketingButton variant="primary" size="sm">
                  Get started
                </MarketingButton>
                <MarketingButton variant="secondary" size="sm">
                  Learn more
                </MarketingButton>
              </div>
            </div>
          </GridBackground>

          <GridBackground
            opacity={0.35}
            className="mt-4 overflow-hidden rounded-xl border border-dashed border-border px-4 py-6"
          >
            <div className="text-center">
              <EyebrowBadge
                icon={Layers}
                label="Section header"
                variant="accent"
              />
              <h4 className="mt-3 font-display text-xl font-semibold">
                Section title over grid
              </h4>
            </div>
          </GridBackground>
        </ThemeFrame>
      ))}
    </div>
  );
}
