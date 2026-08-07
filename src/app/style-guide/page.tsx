import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { FlaskConical } from "lucide-react";
import { EyebrowBadge } from "@/components/ui/eyebrow-badge";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { BrandTokenSwatches } from "./_components/BrandTokenSwatches";
import {
  MarketingButtonDemo,
  FeatureCardBoardDemo,
  FormInputDemo,
  BillingToggleDemo,
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
  PlanCardDemo,
  ComparisonTableDemo,
  IndustryCardDemo,
  BadgeBoardDemo,
  MarketingCardsDemo,
  EyebrowDemo,
  StepCardDemo,
} from "./_components/ClientDemos";

export const metadata = {
  title: "QTO-ERP Design System · Style Guide",
  robots: { index: false, follow: false },
};

/** Board-labeled roles — hex via tokens only (docs/design-tokens.md). */
const BOARD_PALETTE = [
  {
    role: "Background",
    hex: "#0A0A0A",
    light: "#FAF8F5",
    className: "bg-background border border-border",
  },
  {
    role: "Surface / Card",
    hex: "#1C1512",
    light: "#FFFFFF",
    className: "bg-card border border-border",
  },
  {
    role: "Primary Accent",
    hex: "#E8733A",
    light: "#AE562B",
    className: "bg-accent",
  },
  {
    role: "Secondary Accent",
    hex: "#F1B27C",
    light: "#8B4522",
    className: "bg-accent-dark",
  },
  {
    role: "Primary Text",
    hex: "#F5F1EA",
    light: "#0A0A0A",
    className: "bg-foreground",
  },
  {
    role: "Muted Text",
    hex: "#A89A8F",
    light: "#6B5E55",
    className: "bg-muted-foreground",
  },
] as const;

const MODULES = [
  {
    key: "hr",
    label: "HR",
    accent: "bg-module-hr",
    muted: "bg-module-hr-bg",
    text: "text-module-hr-foreground",
  },
  {
    key: "inventory",
    label: "Inventory",
    accent: "bg-module-inventory",
    muted: "bg-module-inventory-bg",
    text: "text-module-inventory-foreground",
  },
  {
    key: "crm",
    label: "CRM",
    accent: "bg-module-crm",
    muted: "bg-module-crm-bg",
    text: "text-module-crm-foreground",
  },
  {
    key: "payroll",
    label: "Payroll",
    accent: "bg-module-payroll",
    muted: "bg-module-payroll-bg",
    text: "text-module-payroll-foreground",
  },
  {
    key: "mfg",
    label: "Manufacturing",
    accent: "bg-module-mfg",
    muted: "bg-module-mfg-bg",
    text: "text-module-mfg-foreground",
  },
  {
    key: "accounting",
    label: "Accounting",
    accent: "bg-module-accounting",
    muted: "bg-module-accounting-bg",
    text: "text-module-accounting-foreground",
  },
] as const;

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function BoardPaletteGrid({ dark }: { dark?: boolean }) {
  return (
    <div
      className={
        dark
          ? "dark rounded-2xl border border-border bg-card p-5 text-foreground shadow-[var(--card-shadow)]"
          : "rounded-2xl border border-border bg-card p-5 text-foreground shadow-[var(--card-shadow)]"
      }
    >
      <p className="mb-4 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {dark ? "Dark (board)" : "Light counterpart"}
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {BOARD_PALETTE.map((s) => (
          <div key={s.role} className="space-y-1.5">
            <div className={`h-14 w-full rounded-lg ${s.className}`} />
            <p className="text-xs font-medium text-foreground">{s.role}</p>
            <p className="font-mono text-[10px] text-muted-foreground">
              {dark ? s.hex : s.light}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function StyleGuidePage() {
  if (process.env.NODE_ENV === "production") {
    notFound();
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-background text-foreground">
      <div className="container-main section-padding min-w-0 space-y-16">
        {/* —— Board header —— */}
        <header className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <EyebrowBadge
              icon={FlaskConical}
              label="Dev only"
              variant="accent"
            />
            <ThemeToggle />
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            QTO-ERP Design System
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Visual identity and component library for the construction &amp;
            field-service ERP platform. Living mirror of the orange brand board
            — theme toggle and local{" "}
            <code className="font-mono text-sm">.dark</code> wrappers for
            dual-theme QA.
          </p>
        </header>

        {/* —— 1 Color palette —— */}
        <Section
          title="Color palette"
          description="Board roles mapped to CSS tokens — no one-off hex in components."
        >
          <div className="space-y-4">
            <BoardPaletteGrid dark />
            <BoardPaletteGrid />
            <BrandTokenSwatches />
          </div>
        </Section>

        {/* —— 2 Module identity —— */}
        <Section
          title="Module identity"
          description="Six module accents via --module-* tokens (dots + muted chips)."
        >
          <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--card-shadow)]">
            {MODULES.map((m) => (
              <div key={m.key} className="flex items-center gap-2">
                <span
                  className={`size-3.5 rounded-full ${m.accent}`}
                  aria-hidden
                />
                <span className={`text-sm font-medium ${m.text}`}>{m.label}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {MODULES.map((m) => (
              <div
                key={`${m.key}-chip`}
                className={`rounded-xl border border-border p-3 ${m.muted}`}
              >
                <div className="mb-1 flex items-center gap-2">
                  <span className={`size-2.5 rounded-full ${m.accent}`} />
                  <span className={`text-sm font-medium ${m.text}`}>
                    {m.label}
                  </span>
                </div>
                <p className="font-mono text-[10px] text-muted-foreground">
                  --module-{m.key}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* —— 3 Typography —— */}
        <Section
          title="Typography"
          description="Outfit display (H1–H3) + Poppins body / uppercase eyebrow / button labels."
        >
          <BoardTypographyDemo />
        </Section>

        {/* —— 4 Buttons —— */}
        <Section
          title="Buttons"
          description="MarketingButton — solid accent primary + ghost/outline secondary."
        >
          <MarketingButtonDemo />
        </Section>

        {/* —— 5 Feature card —— */}
        <Section
          title="Feature card"
          description="Card DNA + module icon tint + Explore Module →."
        >
          <FeatureCardBoardDemo />
        </Section>

        {/* —— 6 Form input —— */}
        <Section
          title="Form input"
          description="Work-email field + helper row (checkmark + no credit card)."
        >
          <FormInputDemo />
        </Section>

        {/* —— 7 Chips / badges —— */}
        <Section
          title="Chips / badges"
          description="Enterprise (accent outline), Standard, module-tinted chip."
        >
          <BadgeBoardDemo />
        </Section>

        {/* —— 8 Billing toggle —— */}
        <Section
          title="Billing toggle"
          description="Monthly / Annual pill — PricingToggle DNA shared with /pricing."
        >
          <BillingToggleDemo />
        </Section>

        {/* —— 9 Signature motif —— */}
        <Section
          title="Signature motif"
          description="OrbitMotif in a dark rounded frame — glow, rings, module nodes."
        >
          <OrbitMotifDemo />
        </Section>

        {/* —— Board footer strip —— */}
        <footer className="border-t border-border pt-8 text-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} QTO-ERP Design System. A product by QTO
            Dev. Style-guide chrome only — not the site Footer.
          </p>
        </footer>

        {/* —— Extended proving ground —— */}
        <div className="space-y-16 border-t border-border pt-16">
          <div>
            <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Extended proving ground
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
              Additional DNA primitives used on live routes — not part of the
              board section order.
            </p>
          </div>

          <Section title="Eyebrow badge">
            <EyebrowDemo />
          </Section>

          <Section title="Card DNA (extended)">
            <MarketingCardsDemo />
          </Section>

          <Section title="Stat tiles">
            <StatsDemo />
          </Section>

          <Section title="SelectorPanel">
            <SelectorPanelDemo />
          </Section>

          <Section title="DarkCtaBand">
            <DarkCtaBandDemo />
          </Section>

          <Section title="GridBackground">
            <GridBackgroundDemo />
          </Section>

          <Section title="TrustedByStrip">
            <TrustedByStripDemo />
          </Section>

          <Section title="BuiltForSection">
            <BuiltForSectionDemo />
          </Section>

          <Section title="IntegratedModulesGrid">
            <IntegratedModulesGridDemo />
          </Section>

          <Section title="EcosystemTabs">
            <EcosystemTabsDemo />
          </Section>

          <Section title="PlanCard">
            <PlanCardDemo />
          </Section>

          <Section title="ComparisonTable">
            <ComparisonTableDemo />
          </Section>

          <Section title="StepCard">
            <StepCardDemo />
          </Section>

          <Section title="IndustryCard">
            <IndustryCardDemo />
          </Section>
        </div>
      </div>
    </main>
  );
}
