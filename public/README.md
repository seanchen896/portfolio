# Drop-in assets

Everything here is served from the site root (`/`). No code changes needed —
just add the files and (where noted) point `lib/site.ts` / `lib/projects.ts` at them.

## Portrait (hero, right side)
1. Add an image to this folder, e.g. `public/portrait.jpg` (portrait orientation, ~4:5, ≥1200px tall).
2. In `lib/site.ts`, set `portrait: "/portrait.jpg"`.
   Leave it `""` to keep the generated placeholder.

## Résumé / CV (download buttons)
- Add your PDF as `public/sean-chen-resume.pdf` (must match `resume` in `lib/site.ts`).
- The "Download Résumé" button and footer link will then work.

## Project images
1. Drop files into `public/projects/`, e.g. `public/projects/camera.jpg`
   (landscape, ~16:9 or 4:3, at least 1600px wide).
2. In `lib/projects.ts`, set the `images` field for that project:

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
2. In `lib/projects.ts`, set the `pdf` field for that project:

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
