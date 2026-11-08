# Sean Nicholas Chen — Portfolio

A minimalist engineering portfolio. Next.js (App Router) · TypeScript · Tailwind CSS v4 · Framer Motion.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000  (or: npm run dev -- -p 3210)
npm run build    # production build
npm start        # serve the production build
```

> Development uses `.next-dev`; production builds use `.next`. Building the site
> no longer overwrites the running preview or editor’s JavaScript and styles.

## Easy project editor

Start `npm run dev`, then open **http://localhost:3000/editor**.

Saving projects updates the site without reloading or locking your current editor visit. Client-side media helpers live separately from the saved project-data module, so content changes do not invalidate the editor session.

- Select a project to edit its title, descriptions, and details.
- Click **New project** to add an entry; choose a unique URL slug.
- Use the project list's up/down arrows to change the website order. **Delete project** removes the selected entry; **Undo delete** restores the most recently removed entry. Save to apply these changes. Uploaded files stay on disk.
- Choose **Project colors** for each project's incoming title on the home page and background on its detail page. The home background stays neutral. Detail pages automatically choose dark or light text for readability. The title roll respects the reduced-motion preference.
- Upload photos, add captions and alt text, and use **Make cover** to choose the preview image.
- Under **PDF documents**, use **Add PDFs** to upload one or more documents up to 25 MB each. Edit their titles/captions or remove an attachment, then save. Existing single-PDF projects remain supported; removing an attachment keeps its original file on disk.
- Use **Résumé download** at the top of the editor to select a PDF and click **Update résumé**. This saves immediately, separately from project edits, and updates every résumé link. Previous files remain on disk. Refresh an already-open website preview after updating.
- Click **Save changes**, then refresh the website preview. Changes are saved to `content/projects.json`; uploaded images live in `public/projects/`.
- Commit both the content file and uploaded photos when deploying. Removing a photo from a gallery keeps the original file on disk.
- The editor is available only in local development; it is disabled in production. Keep the dev server bound to localhost (`npm run dev -- --hostname 127.0.0.1`).
- You can still edit `content/projects.json` directly, including PDF links, project order, and placeholder styles. Avoid editing the file while you have unsaved changes in the editor; reload the editor after external changes.

## Where to edit content (no design changes needed)

| What | File |
|------|------|
| Your name, email, links, location, bio, portrait | `lib/site.ts` |
| Current résumé file, filename and upload date | `content/site-settings.json` (or **Résumé download** in `/editor`) |
| Projects (title, blurb, About, Role/Tools/Year/Team, etc.) | `content/projects.json` (or `/editor`) |
| Drop-in images & résumé PDF | `public/` — see `public/README.md` |
| Uploaded résumé versions | `public/resumes/` — commit these together with `content/site-settings.json` when deploying |

## Structure

- `app/page.tsx` — oversized project index with shared navigation and controls
- `app/work/[slug]/page.tsx` — dark project detail pages (statically generated)
- `components/` — `Hero`, `ProjectIndex` (hover-preview list), `ProjectDetail`,
  `ProjectMedia` (real image or generated blueprint placeholder), `AboutSection`, etc.

## Design notes

- **Type:** Helvetica/Arial, oversized project titles and small bracketed metadata.
- **Homepage loop:** the centered project column repeats seamlessly in both scroll directions using a bounded set of copies sized to the viewport. Homepage wheel/trackpad scrolling eases toward 55% of the input distance; touch stays native while moving, and Arrow Up/Down center the previous/next project. When input stops, the existing easing loop gently centers the nearest project. Reduced motion uses native scrolling and immediate direct selection. Only one cycle is exposed to screen readers and keyboard navigation.
- **Centered selector:** the closest project scales up, becomes bold and fully opaque, while neighboring rows smoothly recede. A centered stack of clickable horizontal bars follows the same position signal; the active bar stays aligned with the selected title. The homepage stays white as project selection changes; its existing light/dark toggle remains available. Project colors apply to detail pages. No scroll library or second wheel/scroll controller is added.
- **Entrance motion:** each newly visible project reveals its lettering in a staggered wave, including later passes through the infinite list. Existing on-screen rows retain their appearance across loop rebases.
- **Image previews:** up to two project photos appear on the right, with staggered vertical strips matching the title’s snake animation. Photos also reveal for the centered project, stack on phones, and respect reduced motion.
- **Theme:** white and black, with a persistent light/dark toggle.
- **Motion:** text gradually fades down from above as it enters view, rolling title hovers, photo previews, a selected title moving into the project heading with a page crossfade, and draggable photo galleries. The title transition uses the View Transitions API; other browsers navigate normally.
- **Navigation:** click the role beside Sean’s name for About, which slides in as a white left panel over a dimmed, blurred site (full width on phones). Its content scrolls independently; Close, Escape, or clicking the desktop backdrop dismiss it. Contact retains its own panel. Reduced motion skips the drawer animation.
- Scrolling within projects is native, with no delayed scrolling or viewport snapping. Fresh outward wheel/trackpad input at a project boundary accumulates toward a 60px threshold (touch: 48px), then slides to the adjacent project. The paired page slide, cooldown, reduced-motion support, keyboard edge navigation and nested viewer controls remain available.
- The footer places the résumé download in the center and the local **Edit projects** link at the right; the year and motion toggle have been removed. Gallery arrows and keyboard navigation work without dragging.
- `DESIGN.md` records the supplied design reference and intentional exceptions to the taste skill’s generic templates.

## To-do for you

- [ ] Set your real **GitHub** URL in `lib/site.ts` (currently a guess).
- [ ] Keep your résumé current using **Résumé download** in `/editor`.
- [ ] Add a portrait + project images (see `public/README.md`) when ready.
- [ ] Send real Role / Tools / Year / Team details to replace the placeholders.

## Interactive STL models and editor access

Sign in at `/editor`, select a project, and use **3D models → Add STL files**. Both binary and ASCII STL files are supported (25 MB maximum). Give each model a title and save. Its project page includes rotate, zoom, pan, reset, wireframe, and download controls. Models remain publicly viewable and downloadable.

Every editor visit starts at the password screen. Unlocking creates a visit-only token held in memory, with no persistent login cookie or browser storage. Leaving/reloading revokes access, and five minutes of inactivity locks the editor automatically. Tokens also expire server-side after 30 minutes. Uploads, résumé changes and project saves use the same protected session. Five incorrect attempts trigger a five-minute cooldown. The password remains a salted hash with a separate session secret in ignored `.env.local`; keep that file when restarting the workspace. The editor remains disabled in production.

## Photography mode

Use the circle beside **Contact** to switch portfolios through a restrained 0.8-second glitch. The reverse switch restores the engineering page and its visual scroll position. Reduced motion switches directly. Engineering scrolling and project routes retain their current behavior.

Open `/photography` for the separate photography portfolio. It starts empty until photos are added; existing engineering images are not republished as photography. The gallery supports a featured photo, collections and covers, natural image proportions, and fullscreen viewing with arrow keys, touch-friendly controls and Escape.

In `/editor`, unlock once and select **Photography**. Upload multiple photos (10 MB each), edit titles/descriptions/categories/dates, replace or delete references, reorder photos, assign collections and select featured/cover photos. Expand **Preview unsaved photography** to review the draft, then **Save photography**. Switching editor tabs preserves both drafts. Authentication and automatic locking are shared with engineering. Saves use the existing authenticated endpoint and stale-version checks.

Photography records live in `content/photography.json`; uploads use `public/photography/`. Save operations are atomic, and removing photos never deletes original files. Engineering projects, résumé settings and existing uploads are stored separately and remain unchanged.
