import { cache } from "react";
import { readContent } from "./editor-storage";
import type { Project } from "./projects";
import type { PhotographyData } from "./photography";
import type { ResumeSettings } from "./site-settings";

export const publishedProjects = cache(async (): Promise<Project[]> => {
  const entries = JSON.parse(await readContent("projects.json")) as Omit<Project, "index">[];
  return entries.map((project, index) => ({ ...project, index: String(index + 1).padStart(2, "0") }));
});
export const publishedPhotography = cache(async (): Promise<PhotographyData> => JSON.parse(await readContent("photography.json")));
export const publishedSettings = cache(async (): Promise<{ resume: ResumeSettings }> => JSON.parse(await readContent("site-settings.json")));
