import type { Role } from "@/db/enums";

/**
 * Capability matrix for staff roles (backend is source of truth; UI only hides).
 *
 * Mapping rules for admin API handlers:
 * - GET → content:view
 * - Content POST (create/upload) → content:create
 * - Content PATCH/PUT + reorder/reply → content:edit
 * - Content DELETE → content:delete
 * - site-settings / footer / nav-resources mutations → settings:edit
 *   (nav-resources POST/PATCH/DELETE use settings:edit only; no separate content:delete)
 * - /api/admin/users/** (future) → users:manage
 */
export const capabilities = [
  "content:view",
  "content:create",
  "content:edit",
  "content:delete",
  "settings:edit",
  "users:manage",
] as const;

export type Capability = (typeof capabilities)[number];

export const ROLE_PERMISSIONS: Record<Role, readonly Capability[]> = {
  SUPER_ADMIN: [
    "content:view",
    "content:create",
    "content:edit",
    "content:delete",
    "settings:edit",
    "users:manage",
  ],
  ADMIN: [
    "content:view",
    "content:create",
    "content:edit",
    "content:delete",
    "settings:edit",
  ],
  EDITOR: ["content:view", "content:create", "content:edit"],
};

export function hasCapability(role: Role, capability: Capability): boolean {
  return ROLE_PERMISSIONS[role].includes(capability);
}
