import type { Project, ResolvedProjectImage, ResolvedProjectPdf } from "./projects";

export function getProjectImages(
  project: Pick<Project, "title" | "image" | "images">,
): ResolvedProjectImage[] {
  if (project.images?.length) {
    return project.images.map((image, i) => {
      if (typeof image === "string") {
        return {
          src: image,
          alt: `${project.title} image ${i + 1}`,
        };
      }

      return {
        src: image.src,
        alt: image.alt ?? `${project.title} image ${i + 1}`,
        caption: image.caption,
      };
    });
  }

  if (project.image) {
    return [{ src: project.image, alt: project.title }];
  }

  return [];
}

export function getProjectPdf(
  project: Pick<Project, "title" | "pdf" | "pdfs">,
): ResolvedProjectPdf | undefined {
  return getProjectPdfs(project)[0];
}

export function getProjectPdfs(project: Pick<Project, "title" | "pdf" | "pdfs">): ResolvedProjectPdf[] {
  return (project.pdfs ?? (project.pdf ? [project.pdf] : [])).map(pdf => typeof pdf === "string" ? {
    src: pdf, title: `${project.title} PDF`,
  } : { src: pdf.src, title: pdf.title ?? `${project.title} PDF`, caption: pdf.caption });
}
