import type { Metadata } from "next";

// Prefer the stable production domain over a temporary Vercel preview URL.
const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  "https://seannchen.vercel.app";
export const metadataBase = new URL(
  /^https?:\/\//.test(configuredUrl) ? configuredUrl : `https://${configuredUrl}`,
);

export function socialMetadata(title: string, description: string, path: string): Metadata {
  const url = new URL(path, metadataBase).href;
  const image = {
    url: new URL("/og-image.png", metadataBase).href,
    width: 1200,
    height: 630,
    type: "image/png",
    alt: "Sean Chen — Mechanical Engineer. UC Berkeley. Design, build, test.",
  };
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title, description, url, type: "website", siteName: "Sean Chen",
      locale: "en_US", images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
