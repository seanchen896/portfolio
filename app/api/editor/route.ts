import { validatePhotography } from "@/lib/photography";
import { editorAuthenticated } from "@/lib/editor-auth";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, rename, mkdir, mkdtemp, rm } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { tmpdir } from "node:os";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

export const runtime = "nodejs";
const photographyPath = path.join(process.cwd(), "content/photography.json");
const dataPath = path.join(process.cwd(), "content/projects.json");
const runFile = promisify(execFile);

async function convertPhoto(bytes: Buffer, extension: string) {
  if (process.platform !== "darwin") throw new Error("HEIC, HEIF, TIFF, and BMP conversion requires macOS. Export this photo as JPG or PNG and try again.");
  const directory = await mkdtemp(path.join(tmpdir(), "portfolio-photo-"));
  try {
    const source = path.join(directory, `source.${extension}`);
    const output = path.join(directory, "photo.jpg");
    await writeFile(source, bytes);
    await runFile("/usr/bin/sips", ["-s", "format", "jpeg", "-s", "formatOptions", "90", source, "--out", output], { timeout: 60000 });
    return await readFile(output);
  } catch {
    throw new Error("This photo could not be converted. Try exporting it as a JPG or PNG.");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== "development") return new Response(null, { status: 404 });
  if (!(await editorAuthenticated(request))) return NextResponse.json({ error: "Sign in to open the editor." }, { status: 401 });
  const [version, settings] = await Promise.all([readFile(dataPath, "utf8"), readFile(path.join(process.cwd(), "content/site-settings.json"), "utf8")]);
  const photographyVersion = await readFile(photographyPath, "utf8");
  return NextResponse.json({ photography: JSON.parse(photographyVersion), photographyVersion, projects: JSON.parse(version), version, resume: JSON.parse(settings).resume }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  // Only the local development editor can write to the checkout.
  if (process.env.NODE_ENV !== "development") return new Response(null, { status: 404 });
  if (!(await editorAuthenticated(request))) return NextResponse.json({ error: "Editor locked. Sign in again to continue." }, { status: 401 });
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || new URL(origin).host !== host || !["localhost", "127.0.0.1", "[::1]"].includes(new URL(origin).hostname)) {
    return NextResponse.json({ error: "Use the editor on localhost." }, { status: 403 });
  }
  try {
    const form = await request.formData();
    if (form.get("action") === "save-photography") {
      const raw = form.get("photography");
      if (typeof raw !== "string" || raw.length > 5000000) throw new Error("Invalid photography data.");
      const photography: unknown = JSON.parse(raw);
      validatePhotography(photography);
      const current = await readFile(photographyPath, "utf8");
      if (String(form.get("version")).replace(/\r\n/g, "\n") !== current.replace(/\r\n/g, "\n")) return NextResponse.json({ error: "Photography changed in another tab. Reload before saving." }, { status: 409 });
      const updated = JSON.stringify(photography, null, 2) + "\n";
      const temp = `${photographyPath}.${randomUUID()}.tmp`;
      await writeFile(temp, updated); await rename(temp, photographyPath);
      return NextResponse.json({ version: updated });
    }
    if (form.get("action") === "upload-pdf" || form.get("action") === "upload-resume") {
      const file = form.get("file");
      if (!(file instanceof File) || !file.name.toLowerCase().endsWith(".pdf") || !file.size || file.size > 25 * 1024 * 1024) throw new Error("Choose a PDF file up to 25 MB.");
      const bytes = Buffer.from(await file.arrayBuffer());
      if (bytes.subarray(0, 5).toString("ascii") !== "%PDF-" || !bytes.subarray(-2048).includes(Buffer.from("%%EOF"))) throw new Error("This file does not contain a valid PDF document.");
      const name = `${randomUUID()}.pdf`;
      const isResume = form.get("action") === "upload-resume";
      const folder = isResume ? "resumes" : "projects";
      const directory = path.join(process.cwd(), "public", folder);
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, name), bytes);
      if (isResume) {
        const settingsPath = path.join(process.cwd(), "content/site-settings.json");
        const settings = JSON.parse(await readFile(settingsPath, "utf8"));
        const resume = { src: `/resumes/${name}`, filename: file.name, updatedAt: new Date().toISOString() };
        const temp = `${settingsPath}.${randomUUID()}.tmp`;
        await writeFile(temp, JSON.stringify({ ...settings, resume }, null, 2) + "\n");
        await rename(temp, settingsPath);
        return NextResponse.json({ resume });
      }
      return NextResponse.json({ src: `/projects/${name}` });
    }
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
      if (!(file instanceof File) || file.size === 0 || file.size > 50 * 1024 * 1024) throw new Error("Choose a non-empty photo up to 50 MB.");
      const extensions: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };
      const suffix = path.extname(file.name).slice(1).toLowerCase();
      const allowed: Record<string, string> = { jpg: "jpg", jpeg: "jpg", png: "png", webp: "webp", gif: "gif", avif: "avif" };
      const convertible = ["heic", "heif", "tif", "tiff", "bmp"].includes(suffix);
      let ext = extensions[file.type] ?? allowed[suffix];
      let bytes = Buffer.from(await file.arrayBuffer());
      if (convertible) { bytes = await convertPhoto(bytes, suffix); ext = "jpg"; }
      if (!ext) throw new Error("Use a JPG, PNG, WebP, GIF, AVIF, HEIC, HEIF, TIFF, or BMP photo.");
      const name = `${randomUUID()}.${ext}`;
      const folder = form.get("library") === "photography" ? "photography" : "projects";
      const directory = path.join(process.cwd(), "public", folder);
      await mkdir(directory, { recursive: true });
      await writeFile(path.join(directory, name), bytes);
      return NextResponse.json({ src: `/${folder}/${name}` });
    }
    const raw = form.get("projects");
    if (typeof raw !== "string" || raw.length > 1000000) throw new Error("Invalid project data.");
    const projects = JSON.parse(raw);
    if (!Array.isArray(projects)) throw new Error("Invalid project list.");
    const slugs = new Set();
    const localPath = (s: unknown) => typeof s === "string" && /^\/(?!\/)/.test(s) && !s.includes("..");
    const validPdf = (pdf: unknown) => typeof pdf === "string" ? localPath(pdf) : pdf !== null && typeof pdf === "object" && localPath((pdf as Record<string, unknown>).src) && ["title", "caption"].every(key => (pdf as Record<string, unknown>)[key] === undefined || typeof (pdf as Record<string, unknown>)[key] === "string");
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
      if (p.pdf !== undefined && !validPdf(p.pdf)) throw new Error("Invalid PDF.");
      if (p.pdfs !== undefined && (!Array.isArray(p.pdfs) || !p.pdfs.every(validPdf))) throw new Error("Invalid PDF attachments.");
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
