import { QTO_DEV_URL } from "@/lib/constants";
import type { FooterLink, FooterLinkGroup } from "@/db/schema";

export const FOOTER_CONTENT_ID = "default" as const;

export type FooterContentDefault = {
  id: string;
  brandBlurb: string;
  builtByLabel: string;
  builtByUrl: string;
  newsletterHeading: string;
  newsletterCopy: string;
  linkGroups: FooterLinkGroup[];
  copyrightText: string;
  bottomLinks: FooterLink[];
};

export const FOOTER_CONTENT_DEFAULTS: FooterContentDefault = {
  id: FOOTER_CONTENT_ID,
  brandBlurb:
    "Modern ERP for growing teams. Attendance, HR, and projects — all in one place.",
  builtByLabel: "Built by QTO Dev",
  builtByUrl: QTO_DEV_URL,
  newsletterHeading: "Newsletter",
  newsletterCopy: "Product updates and construction ops insights — no spam.",
  linkGroups: [
    {
      title: "Platform",
      links: [
        { label: "Attendance & Time", url: "/erp/attendance" },
        { label: "HRM", url: "/erp/hrm" },
        { label: "Project Management", url: "/erp/project-management" },
        { label: "All Apps", url: "/allApps" },
      ],
    },
    {
      title: "Solutions",
      links: [
        { label: "HR Teams", url: "/solution/hr-teams" },
        { label: "Project Teams", url: "/solution/project-teams" },
        { label: "Business Owners", url: "/solution/owners" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "FAQ", url: "/#faq" },
        { label: "Blog", url: "/blog" },
        { label: "About", url: "/about" },
        { label: "QTO Dev", url: QTO_DEV_URL, external: true },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "Contact", url: "/contact" },
        { label: "Book a Demo", url: "/demo" },
      ],
    },
  ],
  copyrightText: "© {year} QTO-ERP. A product by QTO Dev.",
  bottomLinks: [
    { label: "Contact", url: "/contact" },
    { label: "Book a Demo", url: "/demo" },
  ],
};
