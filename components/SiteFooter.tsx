import { site } from "@/lib/site";
import { LiveClock } from "./LiveClock";

export function SiteFooter({ theme = "light" }: { theme?: "light" | "dark" }) {
  const dark = theme === "dark";
  return (
    <footer
      className={`px-5 py-12 sm:px-8 ${
        dark ? "bg-coal text-bone" : "border-t border-line bg-paper text-ink"
      }`}
    >
      <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="label opacity-60">Get in touch</p>
          <a
            href={`mailto:${site.email}`}
            className="serif mt-1 block text-3xl transition-colors hover:text-[var(--color-accent)] sm:text-5xl"
          >
            {site.email}
          </a>
          <div className="mt-4 flex flex-wrap gap-5">
            <a
              href={site.linkedin}
              target="_blank"
              rel="noreferrer"
              className="label inline-flex items-center gap-1.5 opacity-70 transition-opacity hover:opacity-100"
            >
              LinkedIn <span aria-hidden>↗</span>
            </a>
            <a
              href={site.github}
              target="_blank"
              rel="noreferrer"
              className="label inline-flex items-center gap-1.5 opacity-70 transition-opacity hover:opacity-100"
            >
              GitHub <span aria-hidden>↗</span>
            </a>
            <a
              href={site.resume}
              target="_blank"
              rel="noreferrer"
              className="label inline-flex items-center gap-1.5 opacity-70 transition-opacity hover:opacity-100"
            >
              Résumé <span aria-hidden>↓</span>
            </a>
          </div>
        </div>
        <div className="flex gap-8">
          <div>
            <p className="label opacity-60">Local time</p>
            <p className="label mt-1">
              <LiveClock tz={site.timezone} />
            </p>
          </div>
          <div>
            <p className="label opacity-60">Index</p>
            <p className="label mt-1">© {new Date().getFullYear()} {site.initials}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
