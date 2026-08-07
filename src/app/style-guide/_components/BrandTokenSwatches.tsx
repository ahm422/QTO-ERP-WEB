const BRAND_SWATCHES = [
  {
    name: "accent",
    light: "#AE562B",
    dark: "#E8733A",
    className: "bg-accent",
  },
  {
    name: "accent-dark",
    light: "#8B4522",
    dark: "#F1B27C",
    className: "bg-accent-dark",
  },
  {
    name: "hero-cta",
    light: "#AE562B",
    dark: "#E8733A",
    className: "bg-hero-cta",
  },
  {
    name: "orbit-glow",
    light: "rgba(174,86,43,0.28)",
    dark: "rgba(232,115,58,0.35)",
    className: "bg-orbit-glow",
  },
  {
    name: "orbit-ring",
    light: "rgba(10,10,10,0.18)",
    dark: "rgba(245,241,234,0.22)",
    className: "bg-orbit-ring",
  },
  {
    name: "background",
    light: "#FAF8F5",
    dark: "#0A0A0A",
    className: "bg-background border border-border",
  },
  {
    name: "card",
    light: "#FFFFFF",
    dark: "#1C1512",
    className: "bg-card border border-border",
  },
  {
    name: "foreground",
    light: "#0A0A0A",
    dark: "#F5F1EA",
    className: "bg-foreground",
  },
  {
    name: "muted-foreground",
    light: "#6B5E55",
    dark: "#A89A8F",
    className: "bg-muted-foreground",
  },
] as const;

/**
 * Static orange brand token swatches (single-brand lock-in #133).
 * Theme toggle only — no multi-palette switcher.
 */
export function BrandTokenSwatches() {
  return (
    <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--card-shadow)]">
      <div>
        <p className="text-sm font-medium text-foreground">
          Orange brand (single system)
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          Outfit + Poppins. Theme toggles light/dark only — no palette picker.
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
        {BRAND_SWATCHES.map((s) => (
          <div key={s.name} className="space-y-1.5">
            <div className={`h-12 w-full rounded-lg ${s.className}`} />
            <p className="truncate font-mono text-[10px] text-muted-foreground">
              {s.name}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              L {s.light}
            </p>
            <p className="font-mono text-[10px] text-muted-foreground">
              D {s.dark}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
