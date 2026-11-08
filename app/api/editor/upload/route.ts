import { NextRequest, NextResponse } from "next/server";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { editorAuthenticated, localRequest } from "@/lib/editor-auth";
import { blobKey, editorConfigurationError } from "@/lib/editor-storage";
import { uploadPolicy, validStagingPath } from "@/lib/upload-policy";

export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  const setupError = editorConfigurationError();
  if (setupError) return NextResponse.json({ error: setupError }, { status: 503 });
  try {
    const body = await request.json() as HandleUploadBody;
    const response = await handleUpload({ request, body, onBeforeGenerateToken: async (pathname, clientPayload) => {
      if (!localRequest(request) || !(await editorAuthenticated(request))) throw new Error("Editor locked. Sign in again before uploading.");
      const payload = JSON.parse(clientPayload || "{}");
      const policy = uploadPolicy(payload.action, payload.filename, payload.library);
      const prefix = blobKey("");
      if (!pathname.startsWith(prefix) || !validStagingPath(pathname.slice(prefix.length), policy.extension)) throw new Error("Invalid upload destination.");
      return { allowedContentTypes: [policy.contentType], maximumSizeInBytes: policy.maximumSizeInBytes, validUntil: Date.now() + 10 * 60 * 1000, addRandomSuffix: false, allowOverwrite: false };
    } });
    return NextResponse.json(response, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 400 });
  }
}
