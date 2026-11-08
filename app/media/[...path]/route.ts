import { get } from "@vercel/blob";
import { blobKey, cloudStorage } from "@/lib/editor-storage";

export const runtime = "nodejs";
export const maxDuration = 60;
export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const pathname = path.join("/");
  if (!cloudStorage() || !/^(?:projects|photography|resumes)\/[a-f0-9-]{36}\.(?:jpg|jpeg|png|webp|gif|avif|pdf|stl)$/.test(pathname)) return new Response(null, { status: 404 });
  try {
    const result = await get(blobKey(`media/${pathname}`), { access: "private" });
    if (!result || result.statusCode !== 200) return new Response(null, { status: 404 });
    // Only published-media paths are exposed. Content and authentication records stay private.
    return new Response(result.stream, { headers: {
      "Content-Type": result.blob.contentType, "Content-Length": String(result.blob.size),
      "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff",
    } });
  } catch {
    return new Response(null, { status: 503 });
  }
}
