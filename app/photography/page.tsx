import type { Metadata } from "next";
import { publishedPhotography } from "@/lib/published-content";
import { PhotographyGallery } from "@/components/PhotographyGallery";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/lib/site";
import { MuteButton } from "@/components/PortfolioSound";

export const metadata: Metadata = { title: "Photography — Sean Chen", description: "Selected photographs and collections by Sean Chen." };
export const dynamic = "force-dynamic";
export default async function PhotographyPage() {
  const data = await publishedPhotography();
  return <div className="photography-shell"><SiteHeader /><main id="content" tabIndex={-1}><PhotographyGallery data={data} /></main><footer className="photo-footer"><span>{site.shortName} / Photography</span><MuteButton /><a href={`mailto:${site.email}`}>Get in touch ↗</a><a href="/editor">Edit photography ↗</a></footer></div>;
}
