import { cn } from "@/lib/utils";

type AdminPageProps = {
  readonly children: React.ReactNode;
  readonly spacing?: "md" | "lg";
  readonly className?: string;
};

export function AdminPage({
  children,
  spacing = "lg",
  className,
}: AdminPageProps) {
  return (
    <div
      className={cn(
        "w-full min-w-0",
        spacing === "lg" ? "space-y-6 sm:space-y-8" : "space-y-4 sm:space-y-6",
        className
      )}
    >
      {children}
    </div>
  );
}
