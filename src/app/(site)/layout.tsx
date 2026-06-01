import Navbar from "@/components/common/Navbar";
import Footer from "@/components/common/Footer";
import {
  listPublishedModulesFull,
  listPublishedSolutionsFull,
} from "@/lib/content-db";

export const runtime = "nodejs";

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [modules, solutions] = await Promise.all([
    listPublishedModulesFull(),
    listPublishedSolutionsFull(),
  ]);

  return (
    <>
      <Navbar modules={modules} solutions={solutions} />
      {children}
      <Footer />
    </>
  );
}
