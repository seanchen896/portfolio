import type { Metadata } from "next";
import Script from "next/script";
import { PortfolioTransitions } from "@/components/PortfolioTransitions";
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
      <head><meta name="page-type" content="service" /><meta name="site-kind" content="tech" /><script dangerouslySetInnerHTML={{ __html: `try{document.documentElement.dataset.theme=localStorage.getItem('portfolio-theme')||'light';document.documentElement.dataset.motion=localStorage.getItem('portfolio-motion')||(matchMedia('(prefers-reduced-motion: reduce)').matches?'off':'on')}catch(e){}` }} /></head>
      <body><link rel="stylesheet" href="/taste/motion.css" /><PortfolioTransitions>{children}</PortfolioTransitions><Script src="/taste/motion.js" type="module" strategy="afterInteractive" /></body>
    </html>
  );
}
