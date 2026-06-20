import type { Metadata } from "next";
import { anton, instrumentSerif, jetbrainsMono } from "./fonts";
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
      className={`${anton.variable} ${instrumentSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
