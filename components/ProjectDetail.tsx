"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/lib/projects";
import { getProjectImages, getProjectPdf } from "@/lib/projects";
import { ProjectMedia } from "./ProjectMedia";

const ease = [0.22, 1, 0.36, 1] as const;

function MetaBlock({ label, values }: { label: string; values: string[] }) {
  return (
    <div>
      <p className="label text-bone/45">{label}</p>
      <ul className="mt-2 space-y-1">
        {values.map((v) => (
          <li key={v} className="text-sm text-bone/90">
            {v}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProjectDetail({
  project,
  next,
}: {
  project: Project;
  next: Project;
}) {
  const reduce = useReducedMotion();
  const rise = (delay: number) => ({
    initial: reduce ? false : { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease },
  });
  const images = getProjectImages(project);
  const pdf = getProjectPdf(project);

  return (
    <article className="min-h-screen bg-coal text-bone">
      {/* banner sliver of media, peeking from the top like the Grantx hero */}
      <div className="relative h-[34svh] w-full overflow-hidden">
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.1, ease }}
        >
          <ProjectMedia project={project} className="h-full w-full" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-coal" />
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        {/* breadcrumb */}
        <motion.nav {...rise(0.05)} className="flex items-center gap-2 pt-7 text-bone/50">
          <Link href="/" className="label transition-colors hover:text-bone">
            Home
          </Link>
          <span className="label">/</span>
          <Link href="/#work" className="label transition-colors hover:text-bone">
            Work
          </Link>
          <span className="label">/</span>
          <span className="label" style={{ color: "var(--color-accent)" }}>
            {project.title}
          </span>
        </motion.nav>

        {/* title + subtitle */}
        <motion.h1 {...rise(0.12)} className="serif mt-8 max-w-4xl text-4xl leading-[1.05] sm:text-6xl">
          {project.title}
        </motion.h1>
        <motion.p {...rise(0.18)} className="mt-5 max-w-2xl text-base leading-relaxed text-bone/70">
          {project.blurb}
        </motion.p>

        {/* tool pills */}
        <motion.div {...rise(0.24)} className="mt-6 flex flex-wrap gap-2">
          {project.tools.map((t) => (
            <span
              key={t}
              className="rounded-full border border-coal-line px-3 py-1.5 font-mono text-xs text-bone/80"
            >
              {t}
            </span>
          ))}
        </motion.div>

        {/* about + metadata grid */}
        <motion.div
          {...rise(0.3)}
          className="mt-14 grid grid-cols-1 gap-10 border-t border-coal-line pt-12 lg:grid-cols-[1.4fr_1fr]"
        >
          {/* About */}
          <div>
            <p className="label text-bone/45">About — {project.organization}</p>
            <div className="mt-4 max-w-xl space-y-4 text-[0.95rem] leading-relaxed text-bone/80">
              {project.about.map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-coal-line px-4 py-2.5 text-sm transition-colors hover:border-bone/40">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: "var(--color-accent)" }}
              />
              <span className="font-mono text-xs uppercase tracking-widest">
                {project.status}
              </span>
            </div>
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-9 lg:border-l lg:border-coal-line lg:pl-10">
            <MetaBlock label="Role" values={project.role} />
            <MetaBlock label="Team" values={project.team} />
            <MetaBlock label="Tools" values={project.tools} />
            <MetaBlock label="Company" values={[project.organization]} />
            <MetaBlock label="Year" values={[project.year]} />
            <MetaBlock label="Discipline" values={[project.category]} />
          </div>
        </motion.div>

        <motion.section {...rise(0.1)} className="mt-16">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="label text-bone/45">Project media</p>
              <h2 className="serif mt-2 text-3xl sm:text-4xl">Gallery</h2>
            </div>
            {images.length > 0 && (
              <span className="label shrink-0 text-bone/40">
                {images.length} {images.length === 1 ? "Image" : "Images"}
              </span>
            )}
          </div>

          {images.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {images.map((image, i) => (
                <figure
                  key={`${image.src}-${i}`}
                  className={i === 0 ? "md:col-span-2" : undefined}
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm bg-coal-2">
                    <Image
                      src={image.src}
                      alt={image.alt}
                      fill
                      sizes={i === 0 ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="label mt-3 text-bone/40">
                    Fig. {project.index}.{i + 1} — {image.caption ?? image.alt}
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <figure>
              <ProjectMedia
                project={project}
                className="aspect-[16/9] w-full overflow-hidden rounded-sm"
              />
              <figcaption className="label mt-3 text-bone/40">
                Fig. {project.index} — generated placeholder. Add images in lib/projects.ts.
              </figcaption>
            </figure>
          )}
        </motion.section>

        {pdf && (
          <motion.section {...rise(0.16)} className="mt-16 border-t border-coal-line pt-12">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="label text-bone/45">Project PDF</p>
                <h2 className="serif mt-2 text-3xl sm:text-4xl">{pdf.title}</h2>
              </div>
              <Link
                href={pdf.src}
                target="_blank"
                rel="noreferrer"
                className="label inline-flex w-fit items-center justify-center border border-coal-line px-4 py-3 text-bone/80 transition-colors hover:border-bone/40 hover:text-bone"
              >
                Open PDF
              </Link>
            </div>

            <div className="overflow-hidden rounded-sm border border-coal-line bg-coal-2">
              <iframe
                src={`${pdf.src}#view=FitH`}
                title={pdf.title}
                className="h-[72svh] min-h-[480px] w-full"
              />
            </div>
            {pdf.caption && (
              <p className="label mt-3 text-bone/40">{pdf.caption}</p>
            )}
          </motion.section>
        )}
      </div>

      {/* next project */}
      <Link
        href={`/work/${next.slug}`}
        className="group block border-t border-coal-line px-5 py-14 transition-colors hover:bg-coal-2 sm:px-8"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <span className="label text-bone/45">Next project</span>
            <p className="serif mt-2 text-3xl transition-colors group-hover:text-[var(--color-accent)] sm:text-5xl">
              {next.title}
            </p>
          </div>
          <span className="serif text-3xl transition-transform group-hover:translate-x-2 sm:text-5xl">
            →
          </span>
        </div>
      </Link>
    </article>
  );
}
