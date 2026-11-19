import type { Metadata } from "next";
import Script from "next/script";
import { metadataBase, socialMetadata } from "@/lib/metadata";
import { PortfolioTransitions } from "@/components/PortfolioTransitions";
import { PortfolioMode } from "@/components/PortfolioMode";
import { PortfolioMotion } from "@/components/PortfolioMotion";
import { PortfolioContentSync } from "@/components/PortfolioContentSync";
import { PortfolioSound } from "@/components/PortfolioSound";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase,
  ...socialMetadata(
    "Sean Chen — Mechanical Engineer",
    "Selected mechanical engineering work by Sean Chen: product design, precision controls, aerospace mission research, and environmental data research.",
    "/",
  ),
  applicationName: "Sean Chen Portfolio",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "16x16 32x32 48x48", type: "image/x-icon" },
      { url: "/brand/icon.svg", sizes: "any", type: "image/svg+xml" },
      { url: "/icon-32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-type="service"
      suppressHydrationWarning
    >
      <head><meta name="page-type" content="service" /><meta name="site-kind" content="tech" /><script dangerouslySetInnerHTML={{ __html: `try{document.documentElement.dataset.theme=localStorage.getItem('portfolio-theme')||'light'}catch(e){}document.documentElement.dataset.motion=matchMedia('(prefers-reduced-motion: reduce)').matches?'off':'on';if(location.pathname==='/'&&document.documentElement.dataset.motion!=='off')document.documentElement.dataset.intro='pending'` }} /></head>
      <body><link rel="stylesheet" href="/taste/motion.css" /><PortfolioSound><PortfolioContentSync /><PortfolioMode><PortfolioTransitions><PortfolioMotion />{children}</PortfolioTransitions></PortfolioMode></PortfolioSound><Script src="/taste/motion.js" type="module" strategy="afterInteractive" /></body>
    </html>
  );
}
