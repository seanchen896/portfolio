import { editorAuthenticated } from "@/lib/editor-auth";
import { EditorLogin } from "@/components/EditorLogin";
import { notFound } from "next/navigation";
import { ProjectEditor } from "@/components/ProjectEditor";
import data from "@/content/projects.json";
import type { Project } from "@/lib/projects";

export const dynamic = "force-dynamic";

export default async function EditorPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  if (!(await editorAuthenticated())) return <EditorLogin />;
  return <ProjectEditor initial={data as Omit<Project, "index">[]} />;
}
