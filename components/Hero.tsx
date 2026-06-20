"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { site } from "@/lib/site";
import { LiveClock } from "./LiveClock";

const NAME_LINES = site.name.split(" ");

export function Hero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative min-h-[100svh] w-full">
      <div className="grid min-h-[100svh] grid-cols-1 lg:grid-cols-[1.05fr_0.95fr]">
        {/* LEFT — name on paper */}
        <div className="relative flex flex-col justify-between px-5 pb-6 pt-24 sm:px-8 lg:pt-28">
          {/* eyebrow */}
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex items-start justify-between"
          >
            <p className="label max-w-[18rem] leading-relaxed text-ink-soft">
              {site.tagline}
            </p>
            <span className="label hidden text-ink-soft sm:block">[ 01 / Index ]</span>
          </motion.div>

          {/* the name */}
          <h1 className="my-8 font-display leading-[0.82] tracking-[-0.01em] lg:my-0">
            {NAME_LINES.map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  className="block text-[19vw] uppercase sm:text-[15vw] lg:text-[10.5vw]"
                  initial={reduce ? false : { y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{
                    duration: 0.9,
                    delay: 0.15 + i * 0.11,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          {/* footer meta strip */}
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="grid grid-cols-3 gap-2 border-t border-line pt-4 text-ink-soft"
          >
            <span className="label">{site.location}</span>
            <span className="label text-center">{site.availability}</span>
            <span className="label text-right">
              <LiveClock tz={site.timezone} />
            </span>
          </motion.div>
        </div>

        {/* RIGHT — portrait (real image if provided, else placeholder) */}
        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="relative min-h-[55svh] overflow-hidden bg-coal lg:min-h-full"
        >
          {site.portrait ? (
            <Image
              src={site.portrait}
              alt={`${site.name} — portrait`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 48vw"
              className="object-cover"
            />
          ) : (
            <>
              <div className="blueprint absolute inset-0 opacity-60" />
              {/* warm light wash */}
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "radial-gradient(120% 80% at 70% 20%, rgba(229,67,27,0.22), transparent 60%)",
                }}
              />
              {/* portrait silhouette */}
              <svg
                className="absolute bottom-0 right-0 h-[88%] w-auto"
                viewBox="0 0 300 360"
                fill="none"
                preserveAspectRatio="xMaxYMax meet"
                aria-hidden="true"
              >
                <path
                  d="M150 60c34 0 58 26 58 64 0 24-10 44-26 56 28 10 50 28 66 56 10 18 16 40 18 64H34c2-24 8-46 18-64 16-28 38-46 66-56-16-12-26-32-26-56 0-38 24-64 58-64z"
                  fill="rgba(233,228,215,0.10)"
                />
              </svg>

              <div className="absolute left-5 top-24 flex flex-col gap-1 sm:left-8">
                <span className="label text-bone/70">Portrait / 4×5</span>
                <span className="label text-bone/40">Drop image in /public</span>
              </div>

              <div className="absolute bottom-5 right-5 sm:right-8">
                <span className="label text-bone/60">[ Self-portrait — placeholder ]</span>
              </div>
            </>
          )}

          {/* scroll cue — lives inside the right panel, clear of the meta strip */}
          <motion.a
            href="#work"
            aria-label="Scroll to work"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="absolute bottom-5 left-1/2 z-10 hidden -translate-x-1/2 lg:flex"
          >
            <motion.span
              className="label text-bone/70"
              animate={reduce ? {} : { y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              ↓ Scroll
            </motion.span>
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
