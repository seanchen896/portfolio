import { ProjectIndex } from "@/components/ProjectIndex";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { projects } from "@/lib/projects";

export default function Home() {
  return (
    <div className="portfolio-home">
      <SiteHeader theme="light" />
      <main id="content" tabIndex={-1}><ProjectIndex projects={projects} /></main>
      <SiteFooter />
    </div>
  );
}
