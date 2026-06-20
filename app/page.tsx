import { AboutSection } from "@/components/AboutSection";
import { Hero } from "@/components/Hero";
import { ProjectIndex } from "@/components/ProjectIndex";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { projects } from "@/lib/projects";

export default function Home() {
  return (
    <main className="bg-paper">
      <SiteHeader theme="light" />
      <Hero />
      <ProjectIndex projects={projects} />
      <AboutSection />
      <SiteFooter />
    </main>
  );
}
