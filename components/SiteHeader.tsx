import Link from "next/link";
import { site } from "@/lib/site";

/**
 * Fixed top bar with an always-on frosted backdrop so the nav stays legible
 * over any background (the light name panel, the dark portrait panel, or the
 * coal detail pages) at every breakpoint. `theme` flips it for dark pages.
 */
export function SiteHeader({ theme = "light" }: { theme?: "light" | "dark" }) {
  const dark = theme === "dark";

  const surface = dark
    ? "bg-coal/80 border-coal-line/60 text-bone"
    : "bg-paper/80 border-line/70 text-ink";

  const link = dark
    ? "text-bone/85 hover:text-bone"
    : "text-ink/80 hover:text-ink";

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b backdrop-blur-md ${surface}`}
    >
      <div className="flex items-center justify-between px-5 py-3.5 sm:px-8">
        <Link
          href="/"
          className="group flex items-center gap-2.5"
          aria-label={`Home — ${site.name}`}
        >
          <span
            className={`grid h-8 w-8 place-items-center font-display text-base leading-none ${
              dark ? "bg-bone text-coal" : "bg-ink text-paper"
            }`}
          >
            {site.initials}
          </span>
          <span className="hidden font-mono text-[0.8rem] font-medium uppercase tracking-[0.08em] sm:inline">
            {site.shortName}
          </span>
        </Link>

        <nav className="flex items-center gap-5 font-mono text-[0.8rem] font-medium uppercase tracking-[0.08em] sm:gap-7">
          <Link href="/#work" className={`transition-colors ${link}`}>
            Work
          </Link>
          <Link href="/#about" className={`hidden transition-colors sm:inline ${link}`}>
            About
          </Link>
          <a
            href={site.linkedin}
            target="_blank"
            rel="noreferrer"
            className={`hidden transition-colors sm:inline ${link}`}
          >
            LinkedIn
          </a>
          <a
            href={`mailto:${site.email}`}
            className={`flex items-center gap-1.5 transition-colors ${link}`}
          >
            <span
              className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: "var(--color-accent)" }}
            />
            Contact
          </a>
        </nav>
      </div>
    </header>
  );
}
