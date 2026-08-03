import type { Metadata } from "next";
import {
  Space_Grotesk,
  Inter,
  Manrope,
  IBM_Plex_Sans,
  Fraunces,
  Sora,
  Outfit,
  Poppins,
  Playfair_Display,
  Nunito,
} from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { getPaletteBootstrapScript } from "@/lib/palette";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const ibmPlexSans = IBM_Plex_Sans({
  variable: "--font-ibm-plex-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "QTO ERP",
  description:
    "A comprehensive ERP solution tailored for the construction industry, offering modules for project management, procurement, inventory, finance, and more to streamline operations and enhance productivity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${inter.variable} ${manrope.variable} ${ibmPlexSans.variable} ${fraunces.variable} ${sora.variable} ${outfit.variable} ${poppins.variable} ${playfairDisplay.variable} ${nunito.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: getPaletteBootstrapScript() }}
        />
      </head>
      <body className="font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
