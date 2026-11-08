import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/ProjectDetail";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { publishedProjects } from "@/lib/published-content";
import { site } from "@/lib/site";
import type { CSSProperties } from "react";
import { getProjectColors } from "@/lib/project-colors";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const projects = await publishedProjects();
  const project = projects.find(project => project.slug === slug);
  if (!project) return { title: "Not found" };
  return {
    title: `${project.title} — ${site.name}`,
    description: project.blurb,
    openGraph: {
      title: `${project.title} — ${site.name}`,
      description: project.blurb,
      type: "article",
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const projects = await publishedProjects();
  const project = projects.find(project => project.slug === slug);
  if (!project) notFound();

  const index = projects.indexOf(project);
  const next = projects[(index + 1) % projects.length];
  const previous = projects[(index - 1 + projects.length) % projects.length];
  const colors = getProjectColors(project);

  return (
    <div className="portfolio-work" style={{
      "--page-bg": colors.backgroundColor,
      "--page-ink": colors.ink,
      "--page-muted": `color-mix(in srgb, ${colors.ink} 70%, ${colors.backgroundColor})`,
      "--page-line": `color-mix(in srgb, ${colors.ink} 20%, ${colors.backgroundColor})`,
    } as CSSProperties}>
      <SiteHeader />
      <main id="content" tabIndex={-1}><ProjectDetail project={project} next={next} previous={previous} /></main>
      <SiteFooter projectColor />
    </div>
  );
}
