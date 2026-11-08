import projectData from "@/content/projects.json";

export type ProjectImage =
  | string
  | {
      src: string;
      alt?: string;
      caption?: string;
    };

export type ProjectPdf =
  | string
  | {
      src: string;
      title?: string;
      caption?: string;
    };

export type ResolvedProjectImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type ResolvedProjectPdf = {
  src: string;
  title: string;
  caption?: string;
};

export type Project = {
  slug: string;
  index: string;
  title: string;
  category: string;
  blurb: string;
  about: string[];
  role: string[];
  tools: string[];
  year: string;
  team: string[];
  organization: string;
  status: string;
  titleColor?: string;
  backgroundColor?: string;
  // Visual identity for the generated blueprint placeholder
  hue: number;
  motif:
    | "orbit"
    | "altitude"
    | "scatter"
    | "swarm"
    | "wafer"
    | "circuit"
    | "wave"
    | "blade";
  // Optional real imagery — drop a file in /public/projects and set the path
  // here (e.g. "/projects/camera.jpg"). When set, it overrides the placeholder.
  images?: ProjectImage[];
  image?: string;
  pdf?: ProjectPdf;
  pdfs?: ProjectPdf[];
  models?: { src: string; title: string }[];
};

// Edit through /editor locally, or edit content/projects.json directly.
const projectList = projectData as Omit<Project, "index">[];

// Auto-number projects from list order (01, 02, …) so you never maintain it.
export const projects: Project[] = projectList.map((p, i) => ({
  ...p,
  index: String(i + 1).padStart(2, "0"),
}));

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getAdjacent(slug: string): { next: Project; previous: Project } {
  const i = projects.findIndex((p) => p.slug === slug);
  const next = projects[(i + 1) % projects.length];
  const previous = projects[(i - 1 + projects.length) % projects.length];
  return { next, previous };
}

// Keep media helpers independent of saved JSON so editor saves do not reload its session.
export { getProjectImages, getProjectPdf, getProjectPdfs } from "./project-media";
