
/**
 * Central site configuration — edit everything about "you" here in one place.
 * Drop-in assets (portrait, resume) go in /public; see /public/README.md.
 */
export const site = {
  name: "Sean Chen",
  shortName: "Sean Chen",
  initials: "SC",
  role: "Mechanical Engineer",

  // Hero eyebrow / one-liner
  tagline:
    "Studnet studying Mechanical engineer at UC Berkeley.",

  // Contact + social — used in header, footer, and About
  email: "seanchen8964@gmail.com",
  schoolEmail: "seannchen@berkeley.edu",
  linkedin: "https://www.linkedin.com/in/schen896/",
  github: "https://github.com/seanchen896",

  // Hero footer meta
  location: "Los Angeles, CA",
  timezone: "America/Los_Angeles",
  availability: "Open to 2027 roles",

  // Resolves the latest saved résumé in local and hosted editors.
  resume: "/resume",

  // Drop an image into /public and set its path here (e.g. "/portrait.jpg").
  // Leave "" to keep the generated placeholder.
  portrait: "",

  about: [
    "Hey I'm Sean!! I study Mechanical Engineering at UC Berkeley and also a transfer student from Mt. SAC. Currently I'm interested in product design, hardware testing, and fabrication. I also like photography, videography, concerts, hiking, and video games.",
  ],

  // Small fact grid in the About section.
  facts: [
    { label: "Based in", value: "Los Angeles, CA" },
    { label: "Focus", value: "Mechanical / Mechatronics" },
    { label: "Status", value: "Open to 2027 roles" },
  ],
};

export type Site = typeof site;
