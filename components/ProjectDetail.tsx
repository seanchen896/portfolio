"use client";
import { PortfolioLink as Link } from "./PortfolioTransitions";
import dynamic from "next/dynamic";
import type { Project } from "@/lib/projects";
import { getProjectImages, getProjectPdfs } from "@/lib/project-media";
import { ProjectGallery } from "./ProjectGallery";
import { ProjectScrollNavigation } from "./ProjectScrollNavigation";
const STLViewer = dynamic(() => import("./STLViewer"), { ssr: false, loading: () => <p className="model-loading">Loading 3D viewer…</p> });

export function ProjectDetail({ project, next, previous }: { project: Project; next: Project; previous: Project }) {
  const images = getProjectImages(project);
  const pdfs = getProjectPdfs(project);
  return <article className="project-detail">
    <header className="project-heading">
      <nav className="project-top-nav" aria-label="Project navigation"><Link className="back-link text-link" href="/">← All projects</Link>{previous.slug !== project.slug && <Link className="previous-project text-link" href={`/work/${previous.slug}`}>↑ Previous project</Link>}</nav>
      <div className="project-heading-line"><h1 data-project-title={project.slug}>{project.title}</h1><p className="detail-category">[{project.category}]</p></div>
    </header>
    <section className="project-intro" aria-label="Project overview">
      <div className="project-intro-label">[{project.role.join(" / ") || project.category}]</div>
      <div className="project-description"><p className="project-blurb">{project.blurb}</p></div>
    </section>
    {images.length > 0 && <ProjectGallery images={images} />}
    <section className="project-intro project-story" aria-label="About this project"><h2 className="project-intro-label">[About the project]</h2><div className="project-description">{project.about.map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div></section>
    {!!project.models?.length && <section className="project-models"><h2>3D models <span>[{project.models.length}]</span></h2>{project.models.map(model => <STLViewer key={model.src} src={model.src} title={model.title} />)}</section>}
    {pdfs.map((pdf, i) => <section className="project-document" key={`${pdf.src}-${i}`}><div className="document-heading"><h2>{pdf.title}</h2><a className="text-link" href={pdf.src} target="_blank" rel="noreferrer">Open PDF ↗</a></div><iframe src={`${pdf.src}#view=FitH`} title={pdf.title} loading="lazy" />{pdf.caption && <p>{pdf.caption}</p>}</section>)}
    <section className="project-information" aria-labelledby="project-information-heading"><h2 id="project-information-heading">[Project details]</h2><dl>{[
      ["Year", [project.year]], ["Organization", [project.organization]], ["Role", project.role], ["Tools", project.tools], ["Team", project.team], ["Status", [project.status]],
    ].map(([label, values]) => <div key={label as string}><dt>{label}</dt><dd>{(values as string[]).map((v, i) => <span key={i}>{v}</span>)}</dd></div>)}</dl></section>
    {next.slug !== project.slug && <><Link className="next-project" href={`/work/${next.slug}`}><span className="next-label">[Next project]</span><span className="next-title" data-project-title={next.slug}>{next.title}</span><span className="next-arrow" aria-hidden="true">↗</span></Link><ProjectScrollNavigation key={project.slug} /></>}
  </article>;
}
