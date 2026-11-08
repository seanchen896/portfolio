import { editorConfigurationError } from "@/lib/editor-storage";
import { EditorWorkspace } from "@/components/EditorWorkspace";

export const dynamic = "force-dynamic";

export default async function EditorPage() {
  return <EditorWorkspace configurationError={editorConfigurationError()} />;
}
