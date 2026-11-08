For the easiest way to add photos, run the site locally and open `/editor`. Upload photos and click **Save changes**.

# Drop-in assets

Everything here is served from the site root (`/`). No code changes needed —
just add the files and (where noted) point `lib/site.ts` / `content/projects.json` at them.

## Portrait (hero, right side)
1. Add an image to this folder, e.g. `public/portrait.jpg` (portrait orientation, ~4:5, ≥1200px tall).
2. In `lib/site.ts`, set `portrait: "/portrait.jpg"`.
   Leave it `""` to keep the generated placeholder.

## Résumé / CV (download buttons)
- In the local editor, select a PDF under **Résumé download** and click **Update résumé**.
- Uploaded versions go into `public/resumes/`; the active version is stored in `content/site-settings.json`. Both the footer and About dialog use this setting.
- Previous versions are kept. Commit the new PDF and settings file when deploying. The original `june_2026.pdf` remains the default until you upload a replacement.

## Project images
1. Drop files into `public/projects/`, e.g. `public/projects/camera.jpg`
   (landscape, ~16:9 or 4:3, at least 1600px wide).
2. In `content/projects.json`, set the `images` field for that project:

```ts
images: [
  "/projects/camera.jpg",
  {
    src: "/projects/prototype-side.jpg",
    alt: "Prototype side view",
    caption: "Side profile of the assembled prototype.",
  },
],
```

The first image is used as the home-page preview and page banner. Every image
appears in the project gallery. The older `image: "/projects/camera.jpg"` field
still works for a single image, but `images` is the recommended option.

## Project PDFs
1. Drop PDFs into `public/projects/`, e.g. `public/projects/tracking-report.pdf`.
2. In `content/projects.json`, set the `pdf` field for that project:

```ts
pdf: {
  src: "/projects/tracking-report.pdf",
  title: "Object-tracking system report",
  caption: "Full project report and design notes.",
},
```

When `pdf` is set, the project page shows an embedded PDF preview plus an
"Open PDF" link.

## GitHub link
- Update `github` in `lib/site.ts` with your real profile URL
  (currently a guess based on your email handle).
