import type { Metadata } from "next";
import data from "@/content/photography.json";
import type { PhotographyData } from "@/lib/photography";
import { PhotographyGallery } from "@/components/PhotographyGallery";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/lib/site";
import { MuteButton } from "@/components/PortfolioSound";

export const metadata: Metadata = { title: "Photography — Sean Chen", description: "Selected photographs and collections by Sean Chen." };
export default function PhotographyPage() {
  return <div className="photography-shell"><SiteHeader /><main id="content" tabIndex={-1}><PhotographyGallery data={data as PhotographyData} /></main><footer className="photo-footer"><span>{site.shortName} / Photography</span><MuteButton /><a href={`mailto:${site.email}`}>Get in touch ↗</a>{process.env.NODE_ENV === "development" && <a href="/editor">Edit photography ↗</a>}</footer></div>;
}
