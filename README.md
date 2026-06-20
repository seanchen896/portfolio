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

## Where to edit content (no design changes needed)

| What | File |
|------|------|
| Your name, email, links, location, bio, résumé path, portrait | `lib/site.ts` |
| Projects (title, blurb, About, Role/Tools/Year/Team, etc.) | `lib/projects.ts` |
| Drop-in images & résumé PDF | `public/` — see `public/README.md` |

## Structure

- `app/page.tsx` — home: Hero → Project index → About → Footer
- `app/work/[slug]/page.tsx` — dark project detail pages (statically generated)
- `components/` — `Hero`, `ProjectIndex` (hover-preview list), `ProjectDetail`,
  `ProjectMedia` (real image or generated blueprint placeholder), `AboutSection`, etc.

## Design notes

- **Type:** Anton (massive display name) · Instrument Serif (titles) · JetBrains Mono (labels/body).
- **Theme:** warm "paper" light for home, inverting to warm "coal" dark on detail pages.
- **Accent:** a single international-orange (`#E5431B`), defined in `app/globals.css`.
- Animations respect `prefers-reduced-motion`.

## To-do for you

- [ ] Set your real **GitHub** URL in `lib/site.ts` (currently a guess).
- [ ] Drop `sean-chen-resume.pdf` into `public/` to enable the résumé buttons.
- [ ] Add a portrait + project images (see `public/README.md`) when ready.
- [ ] Send real Role / Tools / Year / Team details to replace the placeholders.
