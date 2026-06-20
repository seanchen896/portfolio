export type ProjectImage =
  | string
  | {
      src: string;
      alt?: string;
      caption?: string;
    };

export type ProjectPdf =
  | string
  | {
      src: string;
      title?: string;
      caption?: string;
    };

export type ResolvedProjectImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type ResolvedProjectPdf = {
  src: string;
  title: string;
  caption?: string;
};

export type Project = {
  slug: string;
  index: string;
  title: string;
  category: string;
  blurb: string;
  about: string[];
  role: string[];
  tools: string[];
  year: string;
  team: string[];
  organization: string;
  status: string;
  // Visual identity for the generated blueprint placeholder
  hue: number;
  motif:
    | "orbit"
    | "altitude"
    | "scatter"
    | "swarm"
    | "wafer"
    | "circuit"
    | "wave"
    | "blade";
  // Optional real imagery — drop a file in /public/projects and set the path
  // here (e.g. "/projects/camera.jpg"). When set, it overrides the placeholder.
  images?: ProjectImage[];
  image?: string;
  pdf?: ProjectPdf;
};

/**
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ TO ADD A PROJECT: copy one { ... } block below and edit it. That's it —   │
 * │ the number (01, 02…) and ordering are derived automatically from list     │
 * │ order, and it appears on the home index + gets its own /work/<slug> page. │
 * │                                                                           │
 * │ TO ADD REAL IMAGES: drop files in /public/projects and set `images` on    │
 * │ that project. The first image is used as the project preview everywhere;  │
 * │ all images appear as a gallery on the project detail page.                │
 * │                                                                           │
 * │ TO ADD A PDF PREVIEW: drop a PDF in /public/projects and set `pdf` on the │
 * │ project. See /public/README.md for examples.                              │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
const projectList: Omit<Project, "index">[] = [
  {
    slug: "autonomous-object-tracking-system",
    title: "Autonomous Object-Tracking System",
    category: "Mechatronics / Computer Vision",
    blurb:
      "A 3-axis motorized gimbal that detects and tracks objects in real time — a CAD-designed mechanism paired with a YOLOv8 vision pipeline.",
    about: [
      "A three-axis motorized gimbal designed to keep a detected object centered in frame. The mechanical structure and joints were designed from first principles in Statics, then prototyped and refined in Fusion 360.",
      "On the software side, the platform runs a YOLOv8 object-detection algorithm on a Raspberry Pi to locate targets, feeding the gimbal so the camera tracks motion autonomously.",
    ],
    role: ["Mechanical Design", "Controls & Vision"],
    tools: ["Fusion 360", "Raspberry Pi", "Python", "YOLOv8"],
    year: "2025–26",
    team: ["Personal project"],
    organization: "Personal Project",
    status: "Completed",
    hue: 20,
    motif: "orbit",
    images: [
      {
        src: "/projects/tracking.png",
        caption: "Object-tracking gimbal prototype.",
      },
      {
        src: "/projects/tracking.png",
        caption: "Object-tracking gimbal prototype.",
      }
    ],
    // pdf: {
    //   src: "/projects/tracking-report.pdf",
    //   title: "Object-tracking system report",
    // },
  },
  {
    slug: "nasa-lspace-research",
    title: "NASA L’SPACE — Robotic Swarm Proposal",
    category: "Aerospace / Systems Research",
    blurb:
      "Mechanical and systems research for a NASA proposal built around a decentralized robotic swarm, mapped to NASA taxonomy TX04.",
    about: [
      "As Mechanical Researcher on an interdisciplinary L’SPACE team, I helped develop a NASA proposal centered on a decentralized robotic swarm. I directed research against system-level requirements spanning mechanical hardware (wheels, chassis), thermal control, power, and communications.",
      "We collaborated with subject-matter experts to ground the proposal in NASA taxonomy TX04 (Robotics and Autonomous Systems), translating mission objectives into concrete mechanical and systems constraints.",
    ],
    role: ["Mechanical Researcher"],
    tools: ["Systems Engineering", "Requirements Analysis", "Technical Writing"],
    year: "2024–25",
    team: ["Interdisciplinary student team", "NASA subject-matter experts"],
    organization: "NASA L’SPACE",
    status: "Completed",
    hue: 215,
    motif: "swarm",
    // image: "/projects/nasa.jpg",
     pdf: {
       src: "/projects/lspace.pdf",
       title: "Robotic Swarm Proposal Report",
     },
  },
  {
    slug: "cleanroom-microfabrication",
    title: "Cleanroom Microfabrication",
    category: "Microfabrication / Process",
    blurb:
      "Wafer-based microstructure fabrication at UCLA’s California NanoSystems Institute — photolithography through wet etching, tuned for repeatability.",
    about: [
      "At UCLA’s California NanoSystems Institute, I manufactured wafer-based microstructures in a cleanroom using photolithography, electron-beam lithography, thin-film deposition, and wet chemical etching.",
      "I optimized fabrication workflows by adjusting resist thickness and exposure parameters, maximizing pattern fidelity and process repeatability across runs.",
    ],
    role: ["Mechanical Researcher", "Process / Fabrication"],
    tools: ["Photolithography", "E-beam Lithography", "Thin-Film Deposition", "Wet Etching"],
    year: "2026",
    team: ["CNSI research group"],
    organization: "UCLA — California NanoSystems Institute",
    status: "Completed",
    hue: 280,
    motif: "wafer",
        images: [
      {
        src: "/projects/cleanroom.jpg",
        caption: "Team photo",
      },
      {
        src: "/projects/wafer.jpg",
        caption: "Inspecting wafer quality",
      },
      {
        src: "/projects/wet_etching.jpg",
        caption: "Wafer undergoes wet etching",
      }
    ],
  },
  {
    slug: "pollution-analysis-research",
    title: "Pollution Analysis Research",
    category: "Environmental / Instrumentation",
    blurb:
      "A tethered weather-balloon system mapping vertical air-quality profiles up to 300 m, with a custom 3D-printed sensor payload.",
    about: [
      "Working with a team of five, I helped design a tethered weather-balloon system to map vertical air-quality profiles at altitudes up to 300 meters.",
      "I designed and fabricated a 3D-printed payload in Fusion 360 to house sensitive sensors, and calculated the optimal weight-to-lift ratio for stable, repeatable ascents.",
    ],
    role: ["Mechanical Engineer", "Payload Design"],
    tools: ["Fusion 360", "3D Printing", "Sensor Integration"],
    year: "2026",
    team: ["5 Students"],
    organization: "Mt. San Antonio College",
    status: "Completed",
    hue: 150,
    motif: "altitude",
    // image: "/projects/pollution.jpg",
  },
  {
    slug: "posture-pack",
    title: "Posture Pack",
    category: "Hardware / Hackathon",
    blurb:
      "A posture-tracking device built at the Cal Poly Pomona Hackathon — custom enclosure, embedded sensing, and a React/TypeScript feedback dashboard.",
    about: [
      "Posture Pack is a posture-tracking device prototyped at the Cal Poly Pomona Hackathon to help students keep proper posture while studying. I CAD-modeled a custom housing to integrate a Raspberry Pi, breadboard, and distance sensor.",
      "On the software side, I built a React/TypeScript interface to collect, display, and model posture data, giving users real-time feedback on their position.",
    ],
    role: ["Mechanical / Hardware", "Frontend"],
    tools: ["SolidWorks", "Raspberry Pi", "React", "TypeScript"],
    year: "2026",
    team: ["Hackathon team"],
    organization: "Cal Poly Pomona Hackathon",
    status: "Completed",
    hue: 45,
    motif: "circuit",

    image: "/projects/broncohacks-interface.png",
  },
  {
    slug: "back-lock-folding-knife",
    title: "Back-Lock Folding Knife",
    category: "Mechanical Design / Materials",
    blurb:
      "A back-lock folding knife designed in SolidWorks from A2 tool steel, heat-treated to a 273% increase in hardness.",
    about: [
      "A back-lock folding knife designed and prototyped in SolidWorks using A2 tool steel, with the design focused on the locking mechanism and the blade’s load paths.",
      "By evaluating material behavior and load paths and applying precise heat treatment, I achieved a 273% increase in material hardness over the untreated stock.",
    ],
    role: ["Mechanical Design", "Fabrication"],
    tools: ["SolidWorks", "Heat Treatment", "A2 Tool Steel", "3D Printing"],
    year: "2026",
    team: ["Personal project"],
    organization: "Personal Project",
    status: "Completed",
    hue: 200,
    motif: "blade",
    // image: "/projects/knife.jpg",
  },
  {
    slug: "mazda-cx5-telemetry-analysis",
    title: "Mazda CX-5 Telemetry Analysis",
    category: "Data Analysis / MATLAB",
    blurb:
      "MATLAB modeling of vehicle OBD telemetry — position, velocity, acceleration, RPM, and fuel rate over time.",
    about: [
      "Using MATLAB, I analyzed telemetry from a Mazda CX-5, modeling position, velocity, acceleration, RPM, and fuel rate over time.",
      "From raw OBD-II sensor data I built mathematical models and visualizations to evaluate engine and drivetrain behavior across driving conditions.",
    ],
    role: ["Data Analysis", "Modeling"],
    tools: ["MATLAB", "OBD-II Data"],
    year: "2026",
    team: ["Personal project"],
    organization: "Personal Project",
    status: "Completed",
    hue: 5,
    motif: "wave",
    // image: "/projects/mazda.jpg",
  },
];

// Auto-number projects from list order (01, 02, …) so you never maintain it.
export const projects: Project[] = projectList.map((p, i) => ({
  ...p,
  index: String(i + 1).padStart(2, "0"),
}));

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug);
}

export function getAdjacent(slug: string): { next: Project } {
  const i = projects.findIndex((p) => p.slug === slug);
  const next = projects[(i + 1) % projects.length];
  return { next };
}

export function getProjectImages(
  project: Pick<Project, "title" | "image" | "images">,
): ResolvedProjectImage[] {
  if (project.images?.length) {
    return project.images.map((image, i) => {
      if (typeof image === "string") {
        return {
          src: image,
          alt: `${project.title} image ${i + 1}`,
        };
      }

      return {
        src: image.src,
        alt: image.alt ?? `${project.title} image ${i + 1}`,
        caption: image.caption,
      };
    });
  }

  if (project.image) {
    return [{ src: project.image, alt: project.title }];
  }

  return [];
}

export function getProjectPdf(
  project: Pick<Project, "title" | "pdf">,
): ResolvedProjectPdf | undefined {
  if (!project.pdf) return undefined;

  if (typeof project.pdf === "string") {
    return {
      src: project.pdf,
      title: `${project.title} PDF`,
    };
  }

  return {
    src: project.pdf.src,
    title: project.pdf.title ?? `${project.title} PDF`,
    caption: project.pdf.caption,
  };
}
