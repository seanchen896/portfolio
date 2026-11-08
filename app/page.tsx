import { ProjectIndex } from "@/components/ProjectIndex";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { publishedProjects } from "@/lib/published-content";

export const dynamic = "force-dynamic";
export default async function Home() {
  const projects = await publishedProjects();
  return (
    <div className="portfolio-home">
      <SiteHeader theme="light" />
      <main id="content" tabIndex={-1}>
        <ProjectIndex projects={projects} />
      </main>
      <SiteFooter />
    </div>
  );
}
