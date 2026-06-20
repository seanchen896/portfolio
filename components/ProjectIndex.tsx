"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import type { Project } from "@/lib/projects";
import { ProjectMedia } from "./ProjectMedia";

export function ProjectIndex({ projects }: { projects: Project[] }) {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const current = projects[active];

  return (
    <section
      id="work"
      className="relative border-t border-line bg-paper px-5 py-20 sm:px-8 lg:py-28"
    >
      {/* section header */}
      <div className="mb-10 flex items-baseline justify-between lg:mb-16">
        <h2 className="label text-ink-soft">Selected Work — 2024 / 2025</h2>
        <span className="label text-ink-soft">{projects.length} Projects</span>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_0.82fr] lg:gap-16">
        {/* LEFT — the list */}
        <ol
          className="flex flex-col"
          onMouseLeave={() => setActive((a) => a)}
        >
          {projects.map((p, i) => {
            const isActive = i === active;
            return (
              <li key={p.slug} className="border-b border-line first:border-t">
                <Link
                  href={`/work/${p.slug}`}
                  onMouseEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                  className="group relative flex items-center gap-4 py-5 sm:py-7"
                >
                  {/* active marker */}
                  <span className="relative flex h-2 w-2 shrink-0 items-center justify-center">
                    <motion.span
                      className="absolute h-2 w-2 rounded-full"
                      style={{ background: "var(--color-accent)" }}
                      animate={{ scale: isActive ? 1 : 0, opacity: isActive ? 1 : 0 }}
                      transition={{ duration: 0.25 }}
                    />
                  </span>

                  <span className="label w-7 shrink-0 text-ink-soft">{p.index}</span>

                  {/* title slides toward accent on hover */}
                  <motion.span
                    className="serif text-2xl leading-tight sm:text-4xl lg:text-[2.75rem]"
                    animate={{
                      x: isActive && !reduce ? 10 : 0,
                      color: isActive ? "var(--color-accent)" : "var(--color-ink)",
                    }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {p.title}
                  </motion.span>

                  <span className="ml-auto hidden shrink-0 pl-4 text-right sm:block">
                    <span className="label block text-ink-soft">{p.category}</span>
                    <span className="label block text-ink-soft/60">{p.year}</span>
                  </span>

                  {/* arrow */}
                  <motion.span
                    aria-hidden
                    className="ml-2 shrink-0 text-ink"
                    animate={{
                      opacity: isActive ? 1 : 0,
                      x: isActive ? 0 : -6,
                    }}
                    transition={{ duration: 0.25 }}
                  >
                    ↗
                  </motion.span>
                </Link>
              </li>
            );
          })}

          {/* inline preview for small screens */}
          <div className="mt-6 lg:hidden">
            <ProjectMedia project={current} className="aspect-[4/3] w-full" />
          </div>
        </ol>

        {/* RIGHT — sticky preview, swaps on hover */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-coal">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={current.slug}
                  className="absolute inset-0"
                  initial={reduce ? false : { opacity: 0, scale: 1.05 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                  <ProjectMedia project={current} className="h-full w-full" />
                </motion.div>
              </AnimatePresence>

              {/* caption overlay */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/60 to-transparent p-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={current.slug + "-cap"}
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <p className="label text-bone/70">{current.organization}</p>
                    <p className="serif text-xl text-bone">{current.title}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* blurb under preview */}
            <AnimatePresence mode="wait">
              <motion.p
                key={current.slug + "-blurb"}
                className="mt-5 max-w-md text-sm leading-relaxed text-ink-soft"
                initial={reduce ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                {current.blurb}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
