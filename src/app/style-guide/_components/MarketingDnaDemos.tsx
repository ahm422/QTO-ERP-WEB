"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import dynamic from "next/dynamic";
import {
  ArrowRight,
  Boxes,
  Briefcase,
  Building2,
  Check,
  ClipboardList,
  HardHat,
  Layers,
  LineChart,
  Rocket,
  Settings2,
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
import { TrustedByStrip } from "@/components/common/TrustedByStrip";
import { BuiltForSection } from "@/components/common/BuiltForSection";
import { IntegratedModulesGrid } from "@/components/common/IntegratedModulesGrid";
import { EcosystemTabs } from "@/components/common/EcosystemTabs";
import { PlanCard } from "@/components/ui/plan-card";
import { ComparisonTable } from "@/components/ui/comparison-table";
import { IndustryCard } from "@/components/ui/industry-card";
import { StepCardGrid } from "@/components/ui/step-card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import PricingToggle from "@/app/(site)/pricing/_components/PricingToggle";
import { getDomainIcon } from "@/lib/icon-map";
import { getIndustryDomains } from "@/lib/industry-domains";
import {
  getCardHover,
  getIconChipHover,
  getStaggerContainer,
  getStaggerItem,
  viewportOnce,
} from "@/lib/motion";

const OrbitMotif = dynamic(
  () => import("@/components/ui/orbit-motif").then((m) => m.OrbitMotif),
  { ssr: false, loading: () => <div className="aspect-square w-full max-w-md animate-pulse rounded-2xl bg-muted" /> }
);

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

const DOMAIN_ITEMS: SelectorItem[] = getIndustryDomains()
  .slice(0, 3)
  .map((domain) => ({
    id: domain.id,
    label: domain.name,
    description: `${domain.systemCount} systems`,
    icon: getDomainIcon(domain.iconKey),
  }));

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
          <EyebrowBadge
            icon={Sparkles}
            label="Hero chip"
            variant="hero"
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
          <EyebrowBadge
            icon={Sparkles}
            label="Inverse band"
            variant="inverse"
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
          Orange primary (bg-accent) + outline secondary. Hover — arrow slides
          via springSnappy. Press — whileTap scale 0.97 (disabled under
          prefers-reduced-motion).
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
                    <CardIcon color="accent">
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

          <GridBackground
            opacity={0.32}
            className="mt-4 overflow-hidden rounded-2xl bg-neutral-950 px-4 py-10 text-neutral-400"
          >
            <p className="text-center text-sm text-neutral-300">
              Near-black surface — dots use currentColor (neutral-400).
            </p>
          </GridBackground>
        </ThemeFrame>
      ))}
    </div>
  );
}

export function OrbitMotifDemo() {
  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Signature motif — glowing sphere, orbit rings, module nodes. Under{" "}
        <code className="font-mono">prefers-reduced-motion</code>: static frame,
        no auto-rotate / float. Colors from orbit / accent tokens.
      </p>
      <div className="dark mx-auto w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-background p-2 shadow-[var(--card-shadow)]">
        <OrbitMotif
          interactive
          showHints
          className="rounded-xl bg-[color:var(--background)]"
        />
      </div>
    </div>
  );
}

/** Board feature card — Card DNA + module icon + Explore Module link. */
export function FeatureCardBoardDemo() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {[false, true].map((dark) => (
        <ThemeFrame key={String(dark)} dark={dark}>
          <Card variant="interactive" radius="lg" className="max-w-sm">
            <CardHeader className="flex-row items-start gap-3 space-y-0">
              <CardIcon className="bg-module-crm-bg text-module-crm-foreground">
                <Layers className="size-5" />
              </CardIcon>
              <div className="min-w-0 flex-1">
                <CardTitle className="font-display">CRM</CardTitle>
                <CardDescription className="mt-1">
                  Pipeline, leads, and client relationships in one workspace.
                </CardDescription>
              </div>
            </CardHeader>
            <CardFooter className="pt-0">
              <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
                Explore Module
                <ArrowRight className="size-3.5" aria-hidden />
              </span>
            </CardFooter>
          </Card>
        </ThemeFrame>
      ))}
    </div>
  );
}

/** Board form field — work email + helper row. */
export function FormInputDemo() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {[false, true].map((dark) => (
        <ThemeFrame key={String(dark)} dark={dark}>
          <div className="max-w-sm space-y-2">
            <Label
              htmlFor={`work-email-${dark ? "dark" : "light"}`}
              className="text-xs font-medium uppercase tracking-wider text-muted-foreground"
            >
              Work email
            </Label>
            <Input
              id={`work-email-${dark ? "dark" : "light"}`}
              type="email"
              placeholder="name@company.com"
              autoComplete="email"
            />
            <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Check
                className="size-3.5 shrink-0 text-success"
                aria-hidden
              />
              No credit card required to start.
            </p>
          </div>
        </ThemeFrame>
      ))}
    </div>
  );
}

/** Board billing toggle — Monthly / Annual pill via PricingToggle. */
export function BillingToggleDemo() {
  const [yearly, setYearly] = useState(false);
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {[false, true].map((dark) => (
        <ThemeFrame key={String(dark)} dark={dark}>
          <PricingToggle
            yearly={yearly}
            onToggle={setYearly}
            className="mb-0"
          />
        </ThemeFrame>
      ))}
    </div>
  );
}

export function TrustedByStripDemo() {
  return (
    <ThemeFrame>
      <TrustedByStrip
        logos={[
          { name: "Nesma" },
          { name: "Amreli Steels" },
          { name: "KAPC" },
          { name: "Haier" },
          { name: "AkzoNobel" },
        ]}
      />
    </ThemeFrame>
  );
}

export function BuiltForSectionDemo() {
  return (
    <BuiltForSection
      tag="Built for"
      title="Built for the field crew"
      description="Audience shell — three cards, token-only surfaces."
      className="!py-0"
      audiences={[
        {
          id: "ops",
          title: "Operations leads",
          description: "Crew allocation, site readiness, and daily throughput.",
          icon: HardHat,
        },
        {
          id: "hr",
          title: "HR & compliance",
          description: "Certifications, timesheets, and audit-ready records.",
          icon: Users,
        },
        {
          id: "finance",
          title: "Controllers",
          description: "Labor margin visibility before you overspend.",
          icon: Briefcase,
        },
      ]}
    />
  );
}

export function IntegratedModulesGridDemo() {
  return (
    <IntegratedModulesGrid
      columns={3}
      modules={[
        {
          id: "hr",
          name: "Human Resources",
          description: "Workforce, compliance, and crew scheduling.",
          href: "/erp/hrm",
          icon: Users,
          iconClassName: "bg-module-hr-bg text-module-hr",
        },
        {
          id: "inventory",
          name: "Inventory & Fleet",
          description: "Assets, warehouses, and site logistics.",
          href: "/erp/inventory",
          icon: Boxes,
          iconClassName: "bg-module-inventory-bg text-module-inventory",
        },
        {
          id: "pm",
          name: "Project Management",
          description: "Schedules, budgets, and delivery milestones.",
          href: "/erp/project-management",
          icon: ClipboardList,
          iconClassName: "bg-module-crm-bg text-module-crm",
        },
      ]}
    />
  );
}

export function EcosystemTabsDemo() {
  const items: SelectorItem[] = [
    { id: "pm", label: "Project Management", index: 1 },
    { id: "hr", label: "Human Resources", index: 2 },
    { id: "fin", label: "Finance", index: 3 },
  ];

  return (
    <EcosystemTabs
      items={items}
      defaultValue="pm"
      renderDetail={(item) => (
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            Detail card for{" "}
            <strong className="text-foreground">{item.label}</strong> — Connected
            Ecosystem pattern via SelectorPanel.
          </p>
          <ul className="list-inside list-disc space-y-1">
            <li>Shared data model</li>
            <li>Role-based access</li>
            <li>Audit trail</li>
          </ul>
        </div>
      )}
    />
  );
}

export function PlanCardDemo() {
  return (
    <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-3">
      <PlanCard
        yearly={false}
        plan={{
          slug: "core",
          name: "Core",
          monthlyPrice: 199,
          yearlyPrice: 159,
          description: "Essentials for growing project teams.",
          popular: false,
          features: ["CRM & Estimating", "3 seats", "Email support"],
          cta: "Start Core",
        }}
      />
      <PlanCard
        yearly={false}
        plan={{
          slug: "enterprise",
          name: "Enterprise",
          monthlyPrice: 449,
          yearlyPrice: 359,
          description: "Full stack for multi-site operators.",
          popular: true,
          features: ["All Core modules", "HR & Workforce", "Priority support"],
          cta: "Start Enterprise",
        }}
      />
      <PlanCard
        yearly={false}
        plan={{
          slug: "global",
          name: "Global",
          monthlyPrice: 0,
          yearlyPrice: 0,
          description: "Custom volume and compliance needs.",
          popular: false,
          features: ["Unlimited seats", "SSO", "Dedicated CSM"],
          cta: "Contact sales",
        }}
      />
    </div>
  );
}

export function ComparisonTableDemo() {
  return (
    <ComparisonTable
      embedded
      columns={[
        { key: "core", name: "Core" },
        { key: "enterprise", name: "Enterprise" },
        { key: "global", name: "Global" },
      ]}
      rows={[
        {
          feature: "CRM & Estimating",
          values: { core: "✓", enterprise: "✓", global: "✓" },
        },
        {
          feature: "HR & Workforce",
          values: { core: "—", enterprise: "✓", global: "✓" },
        },
        {
          feature: "SSO",
          values: { core: "—", enterprise: "Add-on", global: "✓" },
        },
      ]}
    />
  );
}

export function IndustryCardDemo() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <IndustryCard
        name="Heavy Construction"
        description="Field crews, plant, and project controls on one backbone."
        href="/allApps"
        icon={HardHat}
        systemCount={14}
        leaders={["Nesma", "Amreli"]}
      />
      <IndustryCard
        name="Mining & Resources"
        description="Compliance, fleet, and site ops for extractive industries."
        href="/allApps"
        icon={Building2}
        systemCount={9}
        leaders={["KAPC"]}
      />
    </div>
  );
}

export function BadgeBoardDemo() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {[false, true].map((dark) => (
        <ThemeFrame key={String(dark)} dark={dark}>
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">Enterprise</Badge>
            <Badge variant="outline">Standard</Badge>
            <span className="inline-flex items-center rounded-full border border-module-inventory/40 bg-module-inventory-bg px-2.5 py-0.5 text-xs font-medium text-module-inventory-foreground">
              Inventory
            </span>
          </div>
        </ThemeFrame>
      ))}
    </div>
  );
}

/** Board typography samples — Outfit display + Poppins body / eyebrow / buttons. */
export function BoardTypographyDemo() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {[false, true].map((dark) => (
        <ThemeFrame key={String(dark)} dark={dark}>
          <div className="space-y-4">
            <p className="font-sans text-[11px] font-medium uppercase tracking-[0.14em] text-accent">
              Platform Ecosystem
            </p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Construction Intelligence
            </h1>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground">
              The Complete ERP Engine
            </h2>
            <h3 className="font-display text-lg font-semibold text-accent">
              Module Capabilities
            </h3>
            <p className="max-w-md font-sans text-sm leading-relaxed text-muted-foreground">
              Visual identity and component language for field-service and
              construction ERP surfaces.
            </p>
            <div className="flex flex-wrap gap-3 pt-1">
              <MarketingButton variant="primary">Book a Demo</MarketingButton>
              <MarketingButton variant="secondary">Learn More</MarketingButton>
            </div>
          </div>
        </ThemeFrame>
      ))}
    </div>
  );
}

export function StepCardDemo() {
  return (
    <StepCardGrid
      steps={[
        {
          step: 1,
          title: "Discover fit",
          description: "Map workflows and success criteria before you buy seats.",
          icon: ClipboardList,
          iconClassName: "bg-accent/10 text-accent",
          preview: (
            <p className="text-xs text-muted-foreground">
              Mini preview — checklist ready
            </p>
          ),
        },
        {
          step: 2,
          title: "Configure",
          description: "Roles, fields, and integrations without custom code.",
          icon: Settings2,
          iconClassName: "bg-module-crm-bg text-module-crm",
        },
        {
          step: 3,
          title: "Deploy",
          description: "Pilot a site, then expand with shared templates.",
          icon: Rocket,
          iconClassName: "bg-module-hr-bg text-module-hr",
        },
        {
          step: 4,
          title: "Optimize",
          description: "Dashboards and audits keep cycle time tight.",
          icon: LineChart,
          iconClassName: "bg-module-inventory-bg text-module-inventory",
        },
      ]}
    />
  );
}
