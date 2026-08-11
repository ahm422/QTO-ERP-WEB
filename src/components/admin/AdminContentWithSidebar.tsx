import { cn } from "@/lib/utils";

type AdminContentWithSidebarProps = {
  readonly children: React.ReactNode;
  readonly sidebar: React.ReactNode;
  readonly className?: string;
};

/**
 * Full-width main + aside: stacks on small screens, side-by-side from md up.
 * Main column grows; aside stays a readable rail without starving the table.
 */
export function AdminContentWithSidebar({
  children,
  sidebar,
  className,
}: AdminContentWithSidebarProps) {
  return (
    <div
      className={cn(
        "grid w-full gap-4 sm:gap-6 md:grid-cols-[minmax(0,1fr)_minmax(12rem,18rem)] md:items-start xl:grid-cols-[minmax(0,1fr)_minmax(14rem,22rem)]",
        className
      )}
    >
      <div className="min-w-0 w-full">{children}</div>
      <aside className="min-w-0 w-full md:sticky md:top-6">{sidebar}</aside>
    </div>
  );
}
