export type UploadAction = "upload" | "upload-stl" | "upload-pdf" | "upload-resume";
export function uploadPolicy(action: unknown, filename: unknown, library?: unknown) {
  if (typeof filename !== "string" || !filename || filename.length > 255) throw new Error("Choose a file with a valid filename.");
  const suffix = filename.split(".").pop()?.toLowerCase();
  if (action === "upload") {
    const types: Record<string, string> = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp", gif: "image/gif", avif: "image/avif" };
    if (!suffix || !types[suffix]) throw new Error("For live uploads, export this photo as JPG, PNG, WebP, GIF, or AVIF first. HEIC and TIFF conversion is available in the local macOS editor.");
    return { action, folder: library === "photography" ? "photography" : "projects", extension: suffix, contentType: types[suffix], maximumSizeInBytes: 50 * 1024 * 1024 };
  }
  if (action === "upload-stl" && suffix === "stl") return { action, folder: "projects", extension: "stl", contentType: "application/octet-stream", maximumSizeInBytes: 25 * 1024 * 1024 };
  if ((action === "upload-pdf" || action === "upload-resume") && suffix === "pdf") return { action, folder: action === "upload-resume" ? "resumes" : "projects", extension: "pdf", contentType: "application/pdf", maximumSizeInBytes: 25 * 1024 * 1024 };
  throw new Error("Choose a supported photo, STL, or PDF file.");
}
export function validStagingPath(pathname: unknown, extension: string): pathname is string {
  return typeof pathname === "string" && new RegExp(`^staging/[a-f0-9-]{36}\\.${extension}$`).test(pathname);
}
