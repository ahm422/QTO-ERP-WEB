import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    note: "Navbar idx 0 · blue/indigo",
    accent: "bg-module-hr",
    muted: "bg-module-hr-bg",
    text: "text-module-hr-foreground",
  },
  {
    key: "inventory",
    label: "Inventory",
    note: "Navbar idx 1 · purple/violet",
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
    note: "Navbar idx 3 · amber/orange",
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
    note: "indigo (distinct)",
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

function TypeColumn({ face }: { face: "display" | "sans" }) {
  const font = face === "display" ? "font-display" : "font-sans";
  const label = face === "display" ? "font-display (Space Grotesk)" : "font-sans (Inter)";
  return (
    <div className="space-y-3 rounded-2xl border border-border p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <h1 className={`${font} text-4xl font-bold`}>Heading 1</h1>
      <h2 className={`${font} text-3xl font-semibold`}>Heading 2</h2>
      <h3 className={`${font} text-2xl font-semibold`}>Heading 3</h3>
      <h4 className={`${font} text-xl font-medium`}>Heading 4</h4>
      <h5 className={`${font} text-lg font-medium`}>Heading 5</h5>
      <h6 className={`${font} text-base font-medium`}>Heading 6</h6>
      <p className={`${font} text-base`}>
        Body copy for UI and long-form reading.
      </p>
      <p className={`${font} text-sm text-muted-foreground`}>
        Muted helper text and captions.
      </p>
      {face === "sans" ? (
        <p className="font-mono text-sm text-muted-foreground">
          Mono sample (Inter via --font-mono)
        </p>
      ) : null}
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
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Dev only · NODE_ENV !== production
          </p>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">
            Style Guide
          </h1>
          <p className="max-w-2xl text-muted-foreground">
            Proving ground for Phase 1 design tokens. Headings / heroes →{" "}
            <code className="font-mono text-sm">font-display</code>; body,
            buttons, forms, nav →{" "}
            <code className="font-mono text-sm">font-sans</code>. Module colors
            are for badges/tags/icons only — CTAs stay on{" "}
            <code className="font-mono text-sm">--accent</code>. Phase 2+ will
            migrate marketing heroes to{" "}
            <code className="font-mono text-sm">font-display</code>.
          </p>
        </header>

        <Section
          title="Type scale"
          description="Space Grotesk for display; Inter for body/UI. Do not mass-migrate page headings yet."
        >
          <div className="grid gap-4 md:grid-cols-2">
            <TypeColumn face="display" />
            <TypeColumn face="sans" />
          </div>
        </Section>

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
          title="Buttons"
          description="Existing Button variants. Default uses brand --accent (CTA)."
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
          description="Flat card vs .card-elevated (uses --card-shadow → --shadow-md; hover → --shadow-lg)."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-semibold">Flat card</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Border only, no elevation token.
              </p>
            </div>
            <div className="card-elevated cursor-default rounded-2xl border border-border bg-card p-6">
              <h3 className="font-display text-lg font-semibold">
                Elevated card
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Hover to see shadow lift (--card-shadow-hover).
              </p>
            </div>
          </div>
        </Section>

        <Section
          title="Stat tiles"
          description="Mock KPIs using radius + shadow tokens."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Active projects", value: "128", delta: "+12%" },
              { label: "Open invoices", value: "$84k", delta: "-3%" },
              { label: "Attendance rate", value: "96.4%", delta: "+1.2%" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="card-elevated rounded-2xl border border-border bg-card p-5"
              >
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1 font-display text-3xl font-bold tracking-tight">
                  {stat.value}
                </p>
                <p className="mt-2 text-xs text-success">{stat.delta}</p>
              </div>
            ))}
          </div>
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
              <strong className="text-foreground">CTA:</strong> keep{" "}
              <code className="font-mono text-foreground">--accent</code>{" "}
              (amber/gold). Module tokens are tagging/iconography only.
            </li>
            <li>
              <strong className="text-foreground">Navbar:</strong> still uses
              hardcoded Tailwind palettes; token mapping documented above for a
              later low-risk swap.
            </li>
            <li>
              <strong className="text-foreground">Shadows:</strong>{" "}
              <code className="font-mono text-foreground">--shadow-sm|md|lg</code>{" "}
              with aliases{" "}
              <code className="font-mono text-foreground">
                --card-shadow / --card-shadow-hover / --mega-shadow
              </code>
            </li>
          </ul>
        </Section>
      </div>
    </main>
  );
}
