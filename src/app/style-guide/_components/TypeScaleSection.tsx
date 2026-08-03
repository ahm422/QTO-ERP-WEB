"use client";

import { usePalette } from "@/components/PaletteProvider";

function TypeColumn({ face }: { face: "display" | "sans" }) {
  const { persona } = usePalette();
  const font = face === "display" ? "font-display" : "font-sans";
  const faceName = face === "display" ? persona.fontDisplay : persona.fontBody;
  const label =
    face === "display"
      ? `font-display (${faceName})`
      : `font-sans (${faceName})`;

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

export function TypeScaleSection() {
  const { persona } = usePalette();

  return (
    <section className="space-y-4 border-b border-border pb-10 last:border-b-0">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Type scale
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Fonts follow the active palette persona ({persona.fontDisplay} /{" "}
          {persona.fontBody}). Do not mass-migrate page headings yet.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <TypeColumn face="display" />
        <TypeColumn face="sans" />
      </div>
    </section>
  );
}
