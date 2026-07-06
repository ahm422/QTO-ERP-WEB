import type { BadgeVariant } from "@/components/ui/badge"

export const demoRequestStatusVariant = {
  NEW: "warning",
  READ: "info",
  ARCHIVED: "secondary",
} as const satisfies Record<string, BadgeVariant>

// Future sector tags (Phase 5):
// Commercial → info, Residential → success, Infra → warning
