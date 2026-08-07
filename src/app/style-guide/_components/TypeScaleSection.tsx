"use client";

function TypeColumn({ face }: { face: "display" | "sans" | "accent" }) {
  const font =
    face === "display"
      ? "font-display"
      : face === "accent"
        ? "font-accent italic"
        : "font-sans";
  const faceName =
    face === "display"
      ? "Outfit"
      : face === "accent"
        ? "Instrument Serif"
        : "Poppins";
  const label =
    face === "display"
      ? `font-display (${faceName})`
      : face === "accent"
        ? `font-accent (${faceName} italic)`
        : `font-sans (${faceName})`;

  return (
    <div className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-[var(--card-shadow)]">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      {face === "accent" ? (
        <>
          <p className="font-display text-3xl font-bold tracking-tight text-foreground">
            Integrated
            <span className="mt-1 block font-accent text-3xl italic text-accent">
              Modules
            </span>
          </p>
          <p className={`${font} text-2xl text-accent`}>Common Questions</p>
          <p className={`${font} text-lg text-accent`}>Growing Teams</p>
          <p className="font-sans text-sm text-muted-foreground">
            Accent face is italic-only — use for the orange script line in
            two-tone headings, not body copy.
          </p>
        </>
      ) : (
        <>
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
              Mono sample (system ui-monospace via --font-mono)
            </p>
          ) : null}
        </>
      )}
    </div>
  );
}

export function TypeScaleSection() {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Type scale
        </h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
          Locked brand faces: Outfit (display) / Poppins (body) / Instrument
          Serif italic (accent).
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <TypeColumn face="display" />
        <TypeColumn face="sans" />
        <TypeColumn face="accent" />
      </div>
    </section>
  );
}
