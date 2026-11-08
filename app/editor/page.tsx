import { notFound } from "next/navigation";
import { EditorWorkspace } from "@/components/EditorWorkspace";

export const dynamic = "force-dynamic";

export default async function EditorPage() {
  if (process.env.NODE_ENV !== "development") notFound();
  return <EditorWorkspace />;
}
