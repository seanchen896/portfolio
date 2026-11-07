# Sean Nicholas Chen — Portfolio

A minimalist engineering portfolio. Next.js (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000  (or: npm run dev -- -p 3210)
npm run build    # production build
npm start        # serve the production build
```

> Note: don't run `npm run build` while `npm run dev` is running — they share the
> `.next` folder and the dev server's styles will 404 until you restart it.

## Easy project editor

Start `npm run dev`, then open **http://localhost:3000/editor**.

- Select a project to edit its title, descriptions, and details.
- Click **New project** to add an entry; choose a unique URL slug.
- Use the project list's up/down arrows to change the website order. **Delete project** removes the selected entry; **Undo delete** restores the most recently removed entry. Save to apply these changes. Uploaded files stay on disk.
- Choose **Project colors** for each project's incoming title on the home page and background on its detail page. The home background stays neutral. Detail pages automatically choose dark or light text for readability. The title roll respects the motion toggle and reduced-motion preference.
- Upload photos, add captions and alt text, and use **Make cover** to choose the preview image.
- Click **Save changes**, then refresh the website preview. Changes are saved to `content/projects.json`; uploaded images live in `public/projects/`.
- Commit both the content file and uploaded photos when deploying. Removing a photo from a gallery keeps the original file on disk.
- The editor is available only in local development; it is disabled in production. Keep the dev server bound to localhost (`npm run dev -- --hostname 127.0.0.1`).
- You can still edit `content/projects.json` directly, including PDF links, project order, and placeholder styles. Avoid editing the file while you have unsaved changes in the editor; reload the editor after external changes.

## Where to edit content (no design changes needed)

| What | File |
|------|------|
| Your name, email, links, location, bio, résumé path, portrait | `lib/site.ts` |
| Projects (title, blurb, About, Role/Tools/Year/Team, etc.) | `content/projects.json` (or `/editor`) |
| Drop-in images & résumé PDF | `public/` — see `public/README.md` |

## Structure

- `app/page.tsx` — oversized project index with shared navigation and controls
- `app/work/[slug]/page.tsx` — dark project detail pages (statically generated)
- `components/` — `Hero`, `ProjectIndex` (hover-preview list), `ProjectDetail`,
  `ProjectMedia` (real image or generated blueprint placeholder), `AboutSection`, etc.

## Design notes

- **Type:** Helvetica/Arial, oversized project titles and small bracketed metadata.
- **Theme:** white and black, with a persistent light/dark toggle.
- **Motion:** rolling title hovers, photo previews, a short page fade in browsers supporting the View Transitions API, and draggable photo galleries. Other browsers navigate normally.
- **Navigation:** click the role beside Sean’s name for About, or Contact for the contact panel. Escape closes either dialog.
- Animations respect `prefers-reduced-motion` and the footer’s Motion control. Gallery arrows and keyboard navigation work without dragging.
- `DESIGN.md` records the supplied design reference and intentional exceptions to the taste skill’s generic templates.

## To-do for you

- [ ] Set your real **GitHub** URL in `lib/site.ts` (currently a guess).
- [ ] Drop `sean-chen-resume.pdf` into `public/` to enable the résumé buttons.
- [ ] Add a portrait + project images (see `public/README.md`) when ready.
- [ ] Send real Role / Tools / Year / Team details to replace the placeholders.

## Interactive STL models and editor access

Sign in at `/editor`, select a project, and use **3D models → Add STL files**. Both binary and ASCII STL files are supported (25 MB maximum). Give each model a title and save. Its project page includes rotate, zoom, pan, reset, wireframe, and download controls. Models remain publicly viewable and downloadable.

The local editor, photo uploads, STL uploads, and project saves require a password session. Use **Lock editor** when finished; sessions expire after eight hours. Five incorrect attempts trigger a five-minute cooldown. The password is stored as a salted hash with a separate session secret in ignored `.env.local`, never in browser code or committed content. Keep that file when restarting your local workspace. The editor remains disabled in production; deployed visitors can only view your projects and models.
