import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import {
  listPublishedModulesFull,
  listPublishedSolutionsFull,
  listPublishedNavResources,
} from "@/lib/content-db";
import { getSiteSettings } from "@/lib/site-settings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [modules, solutions, settings, navResources] = await Promise.all([
    listPublishedModulesFull(),
    listPublishedSolutionsFull(),
    getSiteSettings(),
    listPublishedNavResources(),
  ]);

  return (
    <>
      <Navbar
        modules={modules}
        solutions={solutions}
        siteName={settings.site_name}
        logoUrl={settings.logo_url || undefined}
        ctaLabel={settings.cta_label}
        ctaUrl={settings.cta_url}
        ctaVisible={settings.cta_visible !== "false"}
        navResources={navResources}
      />
      {children}
      <Footer />
    </>
  );
}
