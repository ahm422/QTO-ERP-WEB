import Link from 'next/link';
import { ExternalLink } from "lucide-react";
import { QTO_DEV_URL } from "@/lib/constants";

const footerLinks = {
  Platform: [
    { label: "Attendance & Time", href: "/erp/attendance" },
    { label: "HRM", href: "/erp/hrm" },
    { label: "Project Management", href: "/erp/project-management" },
    { label: "All Apps", href: "/platform" },
  ],
  Solutions: [
    { label: "HR Teams", href: "/solution/hr-teams" },
    { label: "Project Teams", href: "/solution/project-teams" },
    { label: "Business Owners", href: "/solution/owners" },
  ],
  Resources: [
    { label: "FAQ", href: "/resourcesfaq" },
    { label: "Blog", href: "/blog" },
    { label: "About", href: "/about" },
    { label: "QTO Dev", href: QTO_DEV_URL, external: true },
  ],
  Company: [
    { label: "Pricing", href: "/pricing" },
    { label: "Customers", href: "/customers" },
    { label: "Book a Demo", href: "/demo" },
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="container-main py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-bold text-foreground tracking-tight">
              <span className="text-gradient">QTO</span>-ERP
            </Link>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              Modern ERP for growing teams. Attendance, HR, and projects — all in one place.
            </p>
            <a
              href={QTO_DEV_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              Built by QTO Dev <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-foreground mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                      >
                        {link.label}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-border flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} QTO-ERP. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
