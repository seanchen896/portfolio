import { editorAuthenticated } from "@/lib/editor-auth";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";
const dataPath = path.join(process.cwd(), "content/projects.json");

export async function POST(request: NextRequest) {
  // Only the local development editor can write to the checkout.
  if (process.env.NODE_ENV !== "development") return new Response(null, { status: 404 });
  if (!(await editorAuthenticated())) return NextResponse.json({ error: "Session expired. Open the editor in another tab to sign in, then retry." }, { status: 401 });
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || new URL(origin).host !== host || !["localhost", "127.0.0.1", "[::1]"].includes(new URL(origin).hostname)) {
    return NextResponse.json({ error: "Use the editor on localhost." }, { status: 403 });
  }
  try {
    const form = await request.formData();
    if (form.get("action") === "upload-stl") {
      const file = form.get("file");
      if (!(file instanceof File) || !file.name.toLowerCase().endsWith(".stl") || !file.size || file.size > 25 * 1024 * 1024) throw new Error("Choose an STL file up to 25 MB.");
      const bytes = await file.arrayBuffer();
      let geometry;
      try {
        geometry = new STLLoader().parse(bytes);
        const positions = geometry.getAttribute("position");
        if (!positions || positions.count < 3 || !Array.from(positions.array).every(Number.isFinite)) throw new Error("Invalid geometry");
        geometry.computeBoundingSphere();
        if (!geometry.boundingSphere || !(geometry.boundingSphere.radius > 0)) throw new Error("Empty geometry");
      } catch { throw new Error("This file does not contain a valid STL model."); }
      finally { geometry?.dispose(); }
      const name = `${randomUUID()}.stl`;
      const directory = path.join(process.cwd(), "public/projects");
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, name), Buffer.from(bytes));
      return NextResponse.json({ src: `/projects/${name}` });
    }
    if (form.get("action") === "upload") {
      const file = form.get("file");
      if (!(file instanceof File) || file.size === 0 || file.size > 10 * 1024 * 1024) throw new Error("Choose a photo smaller than 10 MB.");
      const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };
      const ext = extensions[file.type];
      if (!ext) throw new Error("Use a JPG, PNG, WebP, GIF, or AVIF image.");
      const name = `${randomUUID()}.${ext}`;
      const directory = path.join(process.cwd(), "public/projects");
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, name), Buffer.from(await file.arrayBuffer()));
      return NextResponse.json({ src: `/projects/${name}` });
    }
    const raw = form.get("projects");
    if (typeof raw !== "string" || raw.length > 1000000) throw new Error("Invalid project data.");
    const projects = JSON.parse(raw);
    if (!Array.isArray(projects)) throw new Error("Invalid project list.");
    const slugs = new Set();
    const localPath = (s: unknown) => typeof s === "string" && /^\/(?!\/)/.test(s) && !s.includes("..");
    for (const p of projects) {
      if (!p || typeof p !== "object") throw new Error("Invalid project.");
      for (const field of ["slug", "title", "category", "blurb", "year", "organization", "status"]) {
        if (typeof p[field] !== "string" || !p[field].trim()) throw new Error(`Please fill in ${field}.`);
      }
      if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.slug) || slugs.has(p.slug)) throw new Error("Each project needs a unique URL slug using lowercase letters, numbers, and hyphens.");
      slugs.add(p.slug);
      for (const field of ["titleColor", "backgroundColor"]) {
        if (p[field] !== undefined && (typeof p[field] !== "string" || !/^#[0-9a-fA-F]{6}$/.test(p[field]))) throw new Error("Choose valid project colors.");
      }
      for (const field of ["about", "role", "tools", "team"]) {
        if (!Array.isArray(p[field]) || !p[field].every((v: unknown) => typeof v === "string")) throw new Error(`Invalid ${field}.`);
      }
      if (!Number.isFinite(p.hue) || !["orbit", "altitude", "scatter", "swarm", "wafer", "circuit", "wave", "blade"].includes(p.motif)) throw new Error("Invalid placeholder style.");
      if (p.models !== undefined && (!Array.isArray(p.models) || !p.models.every((m: { src?: unknown; title?: unknown }) => m && typeof m.src === "string" && /^\/projects\/[a-zA-Z0-9_-]+\.stl$/.test(m.src) && typeof m.title === "string" && m.title.trim()))) throw new Error("Each STL needs a local file and a title.");
      if (p.image && !localPath(p.image)) throw new Error("Images must use local paths.");
      if (p.images && (!Array.isArray(p.images) || !p.images.every((im: unknown) => typeof im === "string" ? localPath(im) : im && typeof im === "object" && localPath((im as {src: unknown}).src) && ["alt", "caption"].every(k => (im as Record<string, unknown>)[k] === undefined || typeof (im as Record<string, unknown>)[k] === "string")))) throw new Error("Invalid gallery image.");
      if (p.pdf && !(typeof p.pdf === "string" ? localPath(p.pdf) : typeof p.pdf === "object" && localPath(p.pdf.src) && ["title", "caption"].every(k => p.pdf[k] === undefined || typeof p.pdf[k] === "string"))) throw new Error("Invalid PDF.");
    }
    // A stale browser tab must not overwrite newer saved work.
    const current = await readFile(dataPath, "utf8");
    if (String(form.get("version")).replace(/\r\n/g, "\n") !== current.replace(/\r\n/g, "\n")) return NextResponse.json({ error: "Projects changed since you opened the editor. Reload before saving." }, { status: 409 });
    const updated = JSON.stringify(projects, null, 2) + "\n";
    const temp = `${dataPath}.${randomUUID()}.tmp`;
    await writeFile(temp, updated);
    await rename(temp, dataPath);
    return NextResponse.json({ version: updated });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to save." }, { status: 400 });
  }
}
