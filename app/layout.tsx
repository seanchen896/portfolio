import type { Metadata } from "next";
import Script from "next/script";
import { PortfolioTransitions } from "@/components/PortfolioTransitions";
import { PortfolioMode } from "@/components/PortfolioMode";
import { PortfolioMotion } from "@/components/PortfolioMotion";
import { PortfolioSound } from "@/components/PortfolioSound";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sean Chen — Mechanical Engineer",
  description:
    "Selected mechanical engineering work by Sean Chen: precision controls, aerospace mission research, and environmental data research.",
  openGraph: {
    title: "Sean Chen — Mechanical Engineer",
    description:
      "Selected mechanical engineering work: precision controls, aerospace mission research, and environmental data research.",
    type: "website",
    siteName: "Sean Chen",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sean Chen — Mechanical Engineer",
    description:
      "Mechanical engineer working across precision controls, aerospace, and environmental research.",
  },
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
      <body><link rel="stylesheet" href="/taste/motion.css" /><PortfolioSound><PortfolioMode><PortfolioTransitions><PortfolioMotion />{children}</PortfolioTransitions></PortfolioMode></PortfolioSound><Script src="/taste/motion.js" type="module" strategy="afterInteractive" /></body>
    </html>
  );
}
