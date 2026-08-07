import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type IndustryCardProps = {
  name: string;
  description: string;
  href: string;
  icon?: LucideIcon;
  systemCount?: number;
  leaders?: string[];
  className?: string;
  ctaLabel?: string;
};

/**
 * Domain / industry card for ecosystem and solutions surfaces.
 */
export function IndustryCard({
  name,
  description,
  href,
  icon: Icon,
  systemCount,
  leaders,
  className,
  ctaLabel,
}: IndustryCardProps) {
  return (
    <Link href={href} className="group block h-full">
      <Card
        variant="interactive"
        radius="xl"
        className={cn("relative h-full overflow-hidden hover:translate-y-0", className)}
      >
        {Icon ? (
          <Icon
            aria-hidden
            className="pointer-events-none absolute -right-3 -top-2 size-28 text-foreground opacity-[0.04]"
          />
        ) : null}
        <CardHeader className="relative">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {Icon ? (
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/60 text-foreground">
                <Icon className="size-5" aria-hidden />
              </span>
            ) : null}
            {typeof systemCount === "number" ? (
              <Badge variant="secondary">{systemCount} Systems</Badge>
            ) : null}
          </div>
          <CardTitle>{name}</CardTitle>
          <CardDescription>{description}</CardDescription>
          {leaders && leaders.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {leaders.slice(0, 4).map((leader) => (
                <Badge key={leader} variant="outline">
                  {leader}
                </Badge>
              ))}
            </div>
          ) : null}
        </CardHeader>
        <CardFooter className="relative">
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-accent transition-all group-hover:gap-2">
            {ctaLabel ?? `Explore ${name}`}
            <ArrowRight className="size-4" aria-hidden />
          </span>
        </CardFooter>
      </Card>
    </Link>
  );
}
