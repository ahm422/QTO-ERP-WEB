import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/common/ThemeToggle";
import { PaletteToggle } from "@/components/common/PaletteToggle";
import { PalettePicker } from "./_components/PalettePicker";
import { TypeScaleSection } from "./_components/TypeScaleSection";
import {
  EyebrowDemo,
  MarketingButtonDemo,
  MarketingCardsDemo,
  StatsDemo,
  SelectorPanelDemo,
  DarkCtaBandDemo,
  GridBackgroundDemo,
} from "./_components/ClientDemos";

export const metadata = {
  title: "Style Guide · QTO ERP",
  robots: { index: false, follow: false },
};

const CORE_SWATCHES = [
  { name: "background", className: "bg-background border border-border" },
  { name: "foreground", className: "bg-foreground" },
  { name: "card", className: "bg-card border border-border" },
  { name: "muted", className: "bg-muted" },
  { name: "border", className: "bg-border" },
  { name: "accent", className: "bg-accent" },
  { name: "primary", className: "bg-primary" },
  { name: "secondary", className: "bg-secondary" },
  { name: "destructive", className: "bg-destructive" },
  { name: "success", className: "bg-success" },
  { name: "warning", className: "bg-warning" },
  { name: "info", className: "bg-info" },
] as const;

const MODULES = [
  {
    key: "hr",
    label: "HR",
    note: "Navbar idx 0 · blue",
    accent: "bg-module-hr",
    muted: "bg-module-hr-bg",
    text: "text-module-hr-foreground",
  },
  {
    key: "inventory",
    label: "Inventory",
    note: "Navbar idx 1 · cyan",
    accent: "bg-module-inventory",
    muted: "bg-module-inventory-bg",
    text: "text-module-inventory-foreground",
  },
  {
    key: "crm",
    label: "CRM",
    note: "Navbar idx 2 · emerald/teal",
    accent: "bg-module-crm",
    muted: "bg-module-crm-bg",
    text: "text-module-crm-foreground",
  },
  {
    key: "payroll",
    label: "Payroll",
    note: "Navbar idx 3 · orange",
    accent: "bg-module-payroll",
    muted: "bg-module-payroll-bg",
    text: "text-module-payroll-foreground",
  },
  {
    key: "mfg",
    label: "Manufacturing",
    note: "rose (distinct)",
    accent: "bg-module-mfg",
    muted: "bg-module-mfg-bg",
    text: "text-module-mfg-foreground",
  },
  {
    key: "accounting",
    label: "Accounting",
    note: "fuchsia (distinct)",
    accent: "bg-module-accounting",
    muted: "bg-module-accounting-bg",
    text: "text-module-accounting-foreground",
  },
] as const;

const RADIUS_SCALE = [
  { token: "--radius-sm", tw: "rounded-sm", className: "rounded-sm" },
  { token: "--radius-md", tw: "rounded-md", className: "rounded-md" },
  { token: "--radius-lg", tw: "rounded-lg", className: "rounded-lg" },
  { token: "--radius-xl", tw: "rounded-xl", className: "rounded-xl" },
  { token: "--radius-2xl", tw: "rounded-2xl", className: "rounded-2xl" },
  { token: "--radius-3xl", tw: "rounded-3xl", className: "rounded-3xl" },
  { token: "--radius-4xl", tw: "rounded-4xl", className: "rounded-4xl" },
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
    <section className="space-y-4 border-b border-border pb-10 last:border-b-0">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function SwatchGrid({ dark }: { dark?: boolean }) {
  return (
    <div
      className={
        dark
          ? "dark rounded-2xl border border-border bg-background p-4 text-foreground"
          : "rounded-2xl border border-border bg-background p-4 text-foreground"
      }
    >
      <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {dark ? "Dark (.dark wrapper)" : "Light"}
      </p>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {CORE_SWATCHES.map((s) => (
          <div key={s.name} className="space-y-1.5">
            <div className={`h-12 w-full rounded-lg ${s.className}`} />
            <p className="truncate font-mono text-[10px] text-muted-foreground">
              {s.name}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {MODULES.map((m) => (
          <div
            key={m.key}
            className={`rounded-xl border border-border p-3 ${m.muted}`}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className={`size-3 rounded-full ${m.accent}`} />
              <span className={`text-sm font-medium ${m.text}`}>{m.label}</span>
            </div>
            <p className="font-mono text-[10px] text-muted-foreground">
              --module-{m.key}
            </p>
            <p className="mt-0.5 text-[10px] text-muted-foreground">{m.note}</p>
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
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl space-y-12 px-4 py-12 sm:px-6 lg:px-8">
        <header className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Dev only · NODE_ENV !== production
            </p>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <PaletteToggle />
              <ThemeToggle />
            </div>
          </div>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Style Guide
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Proving ground for design tokens and Phase 2 marketing DNA
            primitives (#99). Page theme toggle, brand palette switcher (
            <code className="font-mono text-sm">usePalette</code>), and local{" "}
            <code className="font-mono text-sm">.dark</code> wrappers for
            dual-theme QA. Live marketing page rollouts are a follow-up.
          </p>
        </header>

        <Section
          title="Brand palettes"
          description="Switch palette above or here; demos below use live --accent / hero tokens. Theme (light/dark) and palette compose independently. Each card shows persona fonts, mood, and motif."
        >
          <PalettePicker />
        </Section>

        <TypeScaleSection />

        <Section
          title="Color swatches"
          description="Light column vs local .dark wrapper — every token should have a visible dark equivalent."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <SwatchGrid />
            <SwatchGrid dark />
          </div>
        </Section>

        <Section
          title="Buttons (shared)"
          description="Existing Button variants. Default uses brand --accent (CTA). Admin-safe — unchanged."
        >
          <div className="flex flex-wrap gap-3">
            <Button variant="default">Primary (accent)</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
          </div>
        </Section>

        <Section
          title="Eyebrow badge"
          description="Marketing section labels — EyebrowBadge (not admin Badge status variants). Switch palette above; demos below use live --accent / hero tokens."
        >
          <EyebrowDemo />
        </Section>

        <Section
          title="Marketing buttons"
          description="MarketingButton — solid dark primary + outline secondary; arrow slide on hover + whileTap scale from @/lib/motion (respects prefers-reduced-motion)."
        >
          <MarketingButtonDemo />
        </Section>

        <Section
          title="Badges"
          description="Default/semantic variants plus module-tinted chips (token classes, not CTA)."
        >
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="success">Success</Badge>
            <Badge variant="warning">Warning</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {MODULES.map((m) => (
              <span
                key={m.key}
                className={`inline-flex items-center rounded-full border border-transparent px-2.5 py-0.5 text-xs font-medium ${m.muted} ${m.text}`}
              >
                {m.label}
              </span>
            ))}
          </div>
        </Section>

        <Section
          title="Cards"
          description="Card DNA + shared cardHover (scale 1.03 + y lift + icon chip spring). Border/shadow via CSS tokens; lift via Framer — see @/lib/motion."
        >
          <MarketingCardsDemo />
        </Section>

        <Section
          title="Stat tiles"
          description="StatsStrip / StatTile — 4-up stagger reveal from @/lib/motion; count-up skips under prefers-reduced-motion."
        >
          <StatsDemo />
        </Section>

        <Section
          title="SelectorPanel"
          description="List ↔ detail with AnimatePresence mode=wait + panelSwap crossfade. Module catalog and domain explorer demos."
        >
          <SelectorPanelDemo />
        </Section>

        <Section
          title="DarkCtaBand"
          description="Dark rounded band + grid texture. Band stays dark in both page themes; inverse MarketingButtons for contrast."
        >
          <DarkCtaBandDemo />
        </Section>

        <Section
          title="GridBackground"
          description="Decorative radial-dot texture (pointer-events-none). Behind mock hero and section header."
        >
          <GridBackgroundDemo />
        </Section>

        <Section
          title="Radius scale"
          description="Base --radius is 0.625rem; Tailwind rounded-* maps via @theme calc."
        >
          <div className="flex flex-wrap items-end gap-4">
            {RADIUS_SCALE.map((r) => (
              <div key={r.token} className="space-y-2 text-center">
                <div
                  className={`size-16 border border-border bg-muted ${r.className}`}
                />
                <p className="font-mono text-[10px] text-muted-foreground">
                  {r.tw}
                </p>
                <p className="font-mono text-[10px] text-muted-foreground">
                  {r.token}
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section
          title="Usage notes"
          description="Stable surface for Phase 2+ page restyles."
        >
          <ul className="list-inside list-disc space-y-2 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Display:</strong> hero titles
              and expressive headings →{" "}
              <code className="font-mono text-foreground">font-display</code>
            </li>
            <li>
              <strong className="text-foreground">UI:</strong> body, buttons,
              forms, nav labels →{" "}
              <code className="font-mono text-foreground">font-sans</code>
            </li>
            <li>
              <strong className="text-foreground">Brand CTA:</strong> keep{" "}
              <code className="font-mono text-foreground">Button</code>{" "}
              <code className="font-mono text-foreground">--accent</code>.
              Marketing DNA CTAs use{" "}
              <code className="font-mono text-foreground">MarketingButton</code>{" "}
              (dark primary).
            </li>
            <li>
              <strong className="text-foreground">Eyebrow:</strong>{" "}
              <code className="font-mono text-foreground">EyebrowBadge</code> —
              do not overload admin{" "}
              <code className="font-mono text-foreground">Badge</code> status
              variants.
            </li>
            <li>
              <strong className="text-foreground">Shadows:</strong>{" "}
              <code className="font-mono text-foreground">--shadow-sm|md|lg</code>{" "}
              with aliases{" "}
              <code className="font-mono text-foreground">
                --card-shadow / --card-shadow-hover / --mega-shadow
              </code>
            </li>
            <li>
              <strong className="text-foreground">Follow-up:</strong> apply these
              primitives to live{" "}
              <code className="font-mono text-foreground">(site)</code> pages;
              StepCard / Navbar-Footer cleanup are separate.
            </li>
          </ul>
        </Section>
      </div>
    </main>
  );
}
