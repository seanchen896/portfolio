import { site } from "@/lib/site";
import { Reveal } from "./Reveal";

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative border-t border-line bg-paper-2 px-5 py-20 sm:px-8 lg:py-28"
    >
      <div className="mb-10 flex items-baseline justify-between lg:mb-16">
        <h2 className="label text-ink-soft">About</h2>
        <span className="label text-ink-soft">{site.role}</span>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        {/* statement + paragraphs */}
        <div>
          <Reveal>
            <p className="serif text-3xl leading-[1.15] sm:text-5xl sm:leading-[1.1]">
              I design and validate{" "}
              <span style={{ color: "var(--color-accent)" }}>precise, physical systems</span>{" "}
              — from gimbal controls to mission research.
            </p>
          </Reveal>
          <div className="mt-8 max-w-xl space-y-4 text-[0.95rem] leading-relaxed text-ink-soft">
            {site.about.map((para, i) => (
              <Reveal key={i} delay={0.05 * (i + 1)}>
                <p>{para}</p>
              </Reveal>
            ))}
          </div>

          {/* actions */}
          <Reveal delay={0.2}>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href={site.resume}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-paper transition-colors hover:bg-[var(--color-accent)]"
              >
                <span className="label">Download Résumé</span>
                <span aria-hidden className="transition-transform group-hover:translate-y-0.5">
                  ↓
                </span>
              </a>
              <a
                href={`mailto:${site.email}`}
                className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-3 transition-colors hover:border-ink"
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--color-accent)" }}
                />
                <span className="label">Email me</span>
              </a>
            </div>
          </Reveal>
        </div>

        {/* fact grid */}
        <Reveal delay={0.1}>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-line pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            {site.facts.map((f) => (
              <div key={f.label}>
                <dt className="label text-ink-soft/70">{f.label}</dt>
                <dd className="mt-1.5 text-sm text-ink">{f.value}</dd>
              </div>
            ))}
            <div>
              <dt className="label text-ink-soft/70">Links</dt>
              <dd className="mt-1.5 flex flex-col gap-1 text-sm">
                <a
                  href={site.linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-[var(--color-accent)]"
                >
                  LinkedIn ↗
                </a>
                <a
                  href={site.github}
                  target="_blank"
                  rel="noreferrer"
                  className="transition-colors hover:text-[var(--color-accent)]"
                >
                  GitHub ↗
                </a>
              </dd>
            </div>
          </dl>
        </Reveal>
      </div>
    </section>
  );
}
