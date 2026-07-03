import type { Metadata } from "next";
import { Cormorant_Garamond, Mulish, Frank_Ruhl_Libre } from "next/font/google";
import "./globals.css";
import { SiteProvider } from "@/components/providers/SiteProvider";

const serif = Cormorant_Garamond({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
});

const sans = Mulish({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const hebrew = Frank_Ruhl_Libre({
  variable: "--font-hebrew",
  subsets: ["hebrew", "latin"],
  weight: ["500", "700"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const title = "Cree Ser — Torá y valores desde el corazón";
const description =
  "Cree Ser · Un nuevo ciclo de clases de Torá, valores y crecimiento para jóvenes. Clases en vivo, calendario, grabaciones y comunidad.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  icons: { icon: "/assets/creeser-logo.png" },
  openGraph: {
    title,
    description,
    url: siteUrl,
    siteName: "Cree Ser",
    images: [{ url: "/assets/creeser-logo.png" }],
    locale: "es_MX",
    type: "website",
  },
  twitter: {
    card: "summary",
    title,
    description,
    images: ["/assets/creeser-logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${serif.variable} ${sans.variable} ${hebrew.variable}`}>
      <body>
        <SiteProvider>{children}</SiteProvider>
      </body>
    </html>
  );
}
