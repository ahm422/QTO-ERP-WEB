import { TrendingDown, TrendingUp } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

type StatCardProps = {
  readonly icon: React.ReactNode
  readonly label: string
  readonly value: string | number
  readonly trend?: {
    readonly direction: "up" | "down"
    readonly value: number
  }
  readonly className?: string
}

function formatTrendValue(
  direction: "up" | "down",
  value: number
): string {
  const abs = Math.abs(value)
  const formatted = Number.isInteger(abs) ? abs.toString() : abs.toFixed(1)
  const sign = direction === "up" ? "+" : "-"
  return `${sign}${formatted}%`
}

export function StatCard({
  icon,
  label,
  value,
  trend,
  className,
}: StatCardProps) {
  const TrendIcon = trend?.direction === "up" ? TrendingUp : TrendingDown
  const trendColor =
    trend?.direction === "up" ? "text-success" : "text-destructive"

  return (
    <Card className={className}>
      <CardContent className="space-y-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
          {icon}
        </div>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-semibold text-foreground">{value}</p>
        </div>
        {trend && (
          <div className={cn("flex items-center gap-1 text-sm", trendColor)}>
            <TrendIcon className="h-4 w-4" />
            <span>{formatTrendValue(trend.direction, trend.value)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
