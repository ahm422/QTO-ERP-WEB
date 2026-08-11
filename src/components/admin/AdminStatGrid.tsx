import { cn } from "@/lib/utils";

type AdminStatGridProps = {
  readonly children: React.ReactNode;
  readonly className?: string;
};

/** Responsive stat tiles: 1 → 2 (sm) → 4 (lg+) across the full content width. */
export function AdminStatGrid({ children, className }: AdminStatGridProps) {
  return (
    <div
      className={cn(
        "grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4",
        className
      )}
    >
      {children}
    </div>
  );
}
