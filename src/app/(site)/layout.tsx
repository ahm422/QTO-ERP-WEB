import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import {
  listPublishedModulesFull,
  listPublishedSolutionsFull,
} from "@/lib/content-db";
import { getSiteSettings } from "@/lib/site-settings";

export const runtime = "nodejs";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [modules, solutions, settings] = await Promise.all([
    listPublishedModulesFull(),
    listPublishedSolutionsFull(),
    getSiteSettings(),
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
      />
      {children}
      <Footer />
    </>
  );
}
