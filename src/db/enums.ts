export const roles = ["SUPER_ADMIN", "ADMIN", "EDITOR"] as const;
export type Role = (typeof roles)[number];

export const blogPostStatuses = ["DRAFT", "PUBLISHED"] as const;
export type BlogPostStatus = (typeof blogPostStatuses)[number];

export const leadStatuses = ["NEW", "READ", "ARCHIVED"] as const;
export type LeadStatus = (typeof leadStatuses)[number];

export const demoVideoStatuses = ["DRAFT", "PUBLISHED"] as const;
export type DemoVideoStatus = (typeof demoVideoStatuses)[number];
