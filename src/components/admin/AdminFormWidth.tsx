import { cn } from "@/lib/utils";

type AdminFormWidthProps = {
  readonly children: React.ReactNode;
  /**
   * @deprecated Size no longer caps width — forms use the full main column.
   * Kept for call-site compatibility.
   */
  readonly size?: "sm" | "md" | "lg";
  readonly className?: string;
};

/** Full-width form stack — fills the AdminShell content column on all breakpoints. */
export function AdminFormWidth({
  children,
  className,
}: AdminFormWidthProps) {
  return <div className={cn("w-full min-w-0", className)}>{children}</div>;
}
