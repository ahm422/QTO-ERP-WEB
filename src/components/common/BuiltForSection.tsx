import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { HeaderSections } from "@/components/ui/HeaderSections";
import {
  Card,
  CardDescription,
  CardHeader,
  CardIcon,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type BuiltForAudience = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
};

export type BuiltForSectionProps = {
  tag?: string;
  title: string;
  /** Orange Instrument Serif accent line (two-tone motif). */
  accent?: string;
  description?: string;
  audiences: BuiltForAudience[];
  className?: string;
  /** Optional trailing slot under the card grid. */
  footer?: ReactNode;
};

/**
 * “Built for …” audience section shell — eyebrow + display title + 3 card slots.
 */
export function BuiltForSection({
  tag = "Audience",
  title,
  accent,
  description,
  audiences,
  className,
  footer,
}: BuiltForSectionProps) {
  return (
    <section className={cn("section-padding", className)}>
      <div className="container-main">
        <HeaderSections
          tag={tag}
          title={title}
          accent={accent}
          description={description}
        />
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
          {audiences.map((audience) => {
            const Icon = audience.icon;
            return (
              <Card
                key={audience.id}
                variant="default"
                radius="xl"
                className="h-full"
              >
                <CardHeader>
                  <CardIcon>
                    <Icon className="size-6" aria-hidden />
                  </CardIcon>
                  <CardTitle>{audience.title}</CardTitle>
                  <CardDescription>{audience.description}</CardDescription>
                </CardHeader>
              </Card>
            );
          })}
        </div>
        {footer ? <div className="mt-10 flex justify-center">{footer}</div> : null}
      </div>
    </section>
  );
}
