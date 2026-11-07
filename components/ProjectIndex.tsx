"use client";
import { PortfolioLink as Link } from "./PortfolioTransitions";
import Image from "next/image";
import type { CSSProperties } from "react";
import { getProjectImages, type Project } from "@/lib/projects";
import { getProjectColors } from "@/lib/project-colors";

export function ProjectIndex({ projects }: { projects: Project[] }) {
  return <section id="work" className="project-index" aria-label="Selected projects">
    <h1 className="sr-only">Sean Chen — Engineering project portfolio</h1>
    <ol className="project-list">
      {projects.map(project => {
        const images = getProjectImages(project).slice(0, 2);
        let letterIndex = 0;
        return <li key={project.slug} style={{ "--project-title-color": getProjectColors(project).titleColor } as CSSProperties}>
          <Link href={`/work/${project.slug}`} className="project-row" aria-label={`${project.title} — ${project.category}`}>
            <span className="project-number" aria-hidden="true">[{project.index}]</span>
            <span className="project-row-content"><span className="project-title" aria-hidden="true">{project.title.split(" ").map((word, wi) => <span className="title-word" key={wi}>{Array.from(word).map((letter, ci) => {
              const delay = Math.round(letterIndex++ / Math.max(1, project.title.replaceAll(" ", "").length - 1) * 260);
              return <span className="title-letter" key={ci} style={{ "--wave-delay": `${delay}ms` } as CSSProperties}><span className="title-glyph title-glyph-out">{letter}</span><span className="title-glyph title-glyph-in">{letter}</span></span>;
            })}{" "}</span>)}</span><span className="project-category">[{project.category}]</span></span>
            {!!images.length && <span className="project-peek" aria-hidden="true">{images.map((image, i) => <span className="peek-image" key={`${image.src}-${i}`}><Image src={image.src} alt="" width={480} height={360} sizes="240px" className="h-full w-full object-cover" /></span>)}</span>}
          </Link>
        </li>;
      })}
    </ol>
    {!projects.length && <p>No projects have been added yet.</p>}
  </section>;
}
