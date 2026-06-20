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
  linkedin: "https://www.linkedin.com/in/schen896/",
  github: "https://github.com/seanchen896",

  // Hero footer meta
  location: "Los Angeles, CA",
  timezone: "America/Los_Angeles",
  availability: "Available 2026",

  // Drop a PDF named exactly this into /public to enable the Resume button.
  resume: "/june_2026.pdf",

  // Drop an image into /public and set its path here (e.g. "/portrait.jpg").
  // Leave "" to keep the generated placeholder.
  portrait: "",

  // About section copy — placeholder, edit freely.
  about: [
    "I’m a mechanical engineer who likes problems that live in the physical world — things that have to hold a tolerance, survive a vibration spectrum, or keep a sensor pointed where it should be.",
    "My work spans precision mechatronics, aerospace mission research, and environmental data collection. I move comfortably between CAD, fabrication, and the analysis that tells you whether a design actually works.",
  ],

  // Small fact grid in the About section.
  facts: [
    { label: "Based in", value: "Los Angeles, CA" },
    { label: "Focus", value: "Mechanical / Mechatronics" },
    { label: "Status", value: "Open to 2026 roles" },
  ],
};

export type Site = typeof site;
