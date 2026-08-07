import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardIcon,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type IntegratedModuleItem = {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: LucideIcon;
  /** Tailwind token classes for icon tint, e.g. text-module-hr bg-module-hr-bg */
  iconClassName?: string;
};

export type IntegratedModulesGridProps = {
  modules: IntegratedModuleItem[];
  className?: string;
  columns?: 2 | 3 | 4;
};

/**
 * Module card grid using Card DNA + optional module-token icon tints.
 */
export function IntegratedModulesGrid({
  modules,
  className,
  columns = 3,
}: IntegratedModulesGridProps) {
  if (modules.length === 0) return null;

  const colClass =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 4
        ? "sm:grid-cols-2 lg:grid-cols-4"
        : "sm:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={cn("grid gap-6", colClass, className)}>
      {modules.map((mod) => {
        const Icon = mod.icon;
        return (
          <Link key={mod.id} href={mod.href} className="group block h-full">
            <Card
              variant="interactive"
              radius="xl"
              className="h-full hover:translate-y-0"
            >
              <CardHeader>
                <CardIcon className={mod.iconClassName}>
                  <Icon className="size-6" aria-hidden />
                </CardIcon>
                <CardTitle>{mod.name}</CardTitle>
                <CardDescription>{mod.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-accent transition-all group-hover:gap-2">
                  View details
                  <ArrowRight className="size-3.5" aria-hidden />
                </span>
              </CardFooter>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
