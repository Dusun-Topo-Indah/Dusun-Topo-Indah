import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dusun Topo Indah",
  description: "Web profil dusun dan informasi terkini Dusun Topo Indah",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Topo Indah",
  },
  openGraph: {
    title: "Dusun Topo Indah",
    description: "Web profil dusun dan informasi terkini Dusun Topo Indah",
    url: "https://www.dusun-topoindah.my.id",
    siteName: "Dusun Topo Indah",
    images: [
      {
        url: "/images/hero_bg_desa.png",
        width: 1200,
        height: 630,
        alt: "Dusun Topo Indah",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Dusun Topo Indah",
    description: "Web profil dusun dan informasi terkini Dusun Topo Indah",
    images: ["/images/hero_bg_desa.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#0ea5e9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} font-sans h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster position="top-right" />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
