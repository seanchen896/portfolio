import Image from "next/image";
import { getProjectImages } from "@/lib/projects";
import type { Project } from "@/lib/projects";

/**
 * Project media. If real project imagery is set, it renders the first image.
 * Otherwise it falls back to a generated blueprint-style placeholder so the
 * layout always reads as real content.
 */
export function ProjectMedia({
  project,
  className = "",
  sizes = "(max-width: 1024px) 100vw, 40vw",
}: {
  project: Pick<Project, "hue" | "motif" | "title" | "index" | "image" | "images">;
  className?: string;
  sizes?: string;
}) {
  const { hue, motif, title, index } = project;
  const [image] = getProjectImages(project);

  if (image) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image src={image.src} alt={image.alt} fill sizes={sizes} className="object-cover" />
      </div>
    );
  }

  const base = `hsl(${hue} 38% 12%)`;
  const glow = `hsl(${hue} 70% 52%)`;
  const faint = `hsl(${hue} 30% 70%)`;

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      role="img"
      aria-label={`${title} — placeholder render`}
      style={{ backgroundColor: base }}
    >
      {/* atmospheric corner glow */}
      <div
        className="absolute -right-1/4 -top-1/4 h-2/3 w-2/3 rounded-full blur-3xl"
        style={{ background: glow, opacity: 0.32 }}
      />
      {/* blueprint grid */}
      <div className="blueprint absolute inset-0" />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 300"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
      >
        {motif === "orbit" && <OrbitMotif stroke={faint} accent={glow} />}
        {motif === "altitude" && <AltitudeMotif stroke={faint} accent={glow} />}
        {motif === "scatter" && <ScatterMotif stroke={faint} accent={glow} />}
        {motif === "swarm" && <SwarmMotif stroke={faint} accent={glow} />}
        {motif === "wafer" && <WaferMotif stroke={faint} accent={glow} />}
        {motif === "circuit" && <CircuitMotif stroke={faint} accent={glow} />}
        {motif === "wave" && <WaveMotif stroke={faint} accent={glow} />}
        {motif === "blade" && <BladeMotif stroke={faint} accent={glow} />}
      </svg>

      {/* technical corner ticks */}
      <Ticks />

      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
        <span className="label" style={{ color: faint }}>
          FIG. {index} — {motif}
        </span>
        <span className="font-mono text-[0.625rem] tracking-widest" style={{ color: faint }}>
          NO IMAGE / RENDER
        </span>
      </div>
    </div>
  );
}

function Ticks() {
  return (
    <div className="pointer-events-none absolute inset-3">
      {(["top-0 left-0", "top-0 right-0", "bottom-0 left-0", "bottom-0 right-0"] as const).map(
        (pos, i) => (
          <span
            key={i}
            className={`absolute ${pos} h-3 w-3 border-white/25`}
            style={{
              borderTopWidth: pos.includes("top") ? 1 : 0,
              borderBottomWidth: pos.includes("bottom") ? 1 : 0,
              borderLeftWidth: pos.includes("left") ? 1 : 0,
              borderRightWidth: pos.includes("right") ? 1 : 0,
            }}
          />
        ),
      )}
    </div>
  );
}

type MotifProps = { stroke: string; accent: string };

function OrbitMotif({ stroke, accent }: MotifProps) {
  return (
    <g strokeWidth="1" opacity="0.85">
      <circle cx="200" cy="150" r="92" stroke={stroke} />
      <ellipse cx="200" cy="150" rx="130" ry="52" stroke={stroke} opacity="0.6" />
      <ellipse
        cx="200"
        cy="150"
        rx="130"
        ry="52"
        stroke={stroke}
        opacity="0.4"
        transform="rotate(60 200 150)"
      />
      <circle cx="200" cy="150" r="10" fill={accent} stroke="none" />
      <circle cx="292" cy="150" r="5" fill={accent} stroke="none" />
      <line x1="200" y1="20" x2="200" y2="280" stroke={stroke} opacity="0.25" />
      <line x1="40" y1="150" x2="360" y2="150" stroke={stroke} opacity="0.25" />
    </g>
  );
}

function AltitudeMotif({ stroke, accent }: MotifProps) {
  return (
    <g strokeWidth="1">
      {[60, 110, 160, 210, 260].map((y, i) => (
        <line key={y} x1="20" y1={y} x2="380" y2={y} stroke={stroke} opacity={0.2 + i * 0.06} />
      ))}
      <path
        d="M30 250 C 120 250, 140 90, 230 90 S 360 70, 372 60"
        stroke={accent}
        strokeWidth="2"
        fill="none"
      />
      <path d="M210 70 l20 20 l-20 6 z" fill={accent} stroke="none" />
      <circle cx="372" cy="60" r="4" fill={accent} stroke="none" />
    </g>
  );
}

function ScatterMotif({ stroke, accent }: MotifProps) {
  const dots = [
    [80, 200, 5], [120, 170, 3], [140, 210, 4], [170, 150, 6], [185, 195, 3],
    [205, 130, 4], [225, 175, 5], [240, 120, 3], [260, 160, 6], [280, 110, 4],
    [300, 150, 3], [315, 100, 5], [335, 135, 4], [355, 95, 3], [200, 230, 3],
  ];
  return (
    <g>
      <path d="M60 250 L 360 80" stroke={stroke} strokeWidth="1" strokeDasharray="4 6" opacity="0.4" />
      <path d="M60 250 C 180 230, 280 150, 370 70" stroke={stroke} strokeWidth="1" opacity="0.3" fill="none" />
      {dots.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill={i % 3 === 0 ? accent : stroke} opacity={i % 3 === 0 ? 0.9 : 0.55} />
      ))}
    </g>
  );
}

function SwarmMotif({ stroke, accent }: MotifProps) {
  // Decentralized robotic swarm — nodes linked to nearest neighbours.
  const nodes = [
    [90, 90], [160, 70], [230, 110], [300, 80], [340, 150],
    [120, 160], [200, 180], [275, 200], [150, 230], [240, 250],
  ];
  const links = [
    [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [1, 6], [2, 6], [5, 6],
    [6, 7], [4, 7], [5, 8], [6, 8], [8, 9], [7, 9], [6, 9],
  ];
  return (
    <g>
      {links.map(([a, b], i) => (
        <line key={i} x1={nodes[a][0]} y1={nodes[a][1]} x2={nodes[b][0]} y2={nodes[b][1]} stroke={stroke} strokeWidth="1" opacity="0.35" />
      ))}
      {nodes.map(([x, y], i) => (
        <g key={i}>
          {i % 4 === 0 && <circle cx={x} cy={y} r="12" stroke={accent} strokeWidth="1" opacity="0.4" fill="none" />}
          <circle cx={x} cy={y} r={i % 4 === 0 ? 5 : 3.5} fill={i % 4 === 0 ? accent : stroke} opacity={i % 4 === 0 ? 1 : 0.7} />
        </g>
      ))}
    </g>
  );
}

function WaferMotif({ stroke, accent }: MotifProps) {
  // Silicon wafer with a die grid and a notch flat.
  const dies: [number, number, boolean][] = [];
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      const x = 140 + c * 24;
      const y = 90 + r * 24;
      const dx = x + 10 - 200;
      const dy = y + 10 - 150;
      if (dx * dx + dy * dy < 78 * 78) dies.push([x, y, (r + c) % 5 === 0]);
    }
  }
  return (
    <g>
      <circle cx="200" cy="150" r="86" stroke={stroke} strokeWidth="1.5" opacity="0.7" />
      <line x1="158" y1="222" x2="242" y2="222" stroke={stroke} strokeWidth="1.5" opacity="0.7" />
      {dies.map(([x, y, hot], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width="20"
          height="20"
          rx="2"
          stroke={hot ? accent : stroke}
          strokeWidth="1"
          fill={hot ? accent : "none"}
          fillOpacity={hot ? 0.85 : 0}
          opacity={hot ? 1 : 0.4}
        />
      ))}
    </g>
  );
}

function CircuitMotif({ stroke, accent }: MotifProps) {
  // PCB traces, pads and a central chip — the Pi + breadboard build.
  return (
    <g strokeWidth="1.5" fill="none">
      <path d="M40 80 H140 V140 H210" stroke={stroke} opacity="0.45" />
      <path d="M40 220 H120 V160 H190" stroke={stroke} opacity="0.45" />
      <path d="M360 100 H280 V190 H210" stroke={stroke} opacity="0.45" />
      <path d="M360 230 H300 V150" stroke={stroke} opacity="0.45" />
      <rect x="172" y="128" width="56" height="44" rx="3" stroke={accent} opacity="0.9" />
      <rect x="186" y="142" width="28" height="16" rx="2" fill={accent} stroke="none" opacity="0.9" />
      {[[40, 80], [40, 220], [360, 100], [360, 230], [120, 160], [140, 140]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill={stroke} stroke="none" opacity="0.7" />
      ))}
      {[[200, 128], [172, 150], [228, 150], [200, 172]].map(([x, y], i) => (
        <circle key={`p${i}`} cx={x} cy={y} r="3" fill={accent} stroke="none" />
      ))}
    </g>
  );
}

function WaveMotif({ stroke, accent }: MotifProps) {
  // Overlaid telemetry traces — velocity / RPM / fuel over time.
  const trace = (amp: number, k: number, yb: number) => {
    let d = `M20 ${yb}`;
    for (let x = 20; x <= 380; x += 8) {
      const y = yb - Math.sin((x - 20) / k) * amp - Math.sin((x - 20) / (k * 2.7)) * (amp * 0.4);
      d += ` L${x} ${y.toFixed(1)}`;
    }
    return d;
  };
  return (
    <g fill="none">
      {[70, 120, 170, 220].map((y) => (
        <line key={y} x1="20" y1={y} x2="380" y2={y} stroke={stroke} strokeWidth="1" opacity="0.18" />
      ))}
      <path d={trace(30, 28, 110)} stroke={stroke} strokeWidth="1.25" opacity="0.5" />
      <path d={trace(22, 18, 180)} stroke={stroke} strokeWidth="1.25" opacity="0.4" />
      <path d={trace(40, 34, 150)} stroke={accent} strokeWidth="2" />
    </g>
  );
}

function BladeMotif({ stroke, accent }: MotifProps) {
  // A folding knife opening around its pivot — closed + open positions.
  return (
    <g fill="none" strokeWidth="1.5">
      {/* handle */}
      <rect
        x="120"
        y="170"
        width="170"
        height="34"
        rx="16"
        stroke={stroke}
        opacity="0.55"
        transform="rotate(-8 205 187)"
      />
      {/* closed blade (nested) */}
      <path d="M150 178 L268 168 L262 184 L150 192 Z" stroke={stroke} opacity="0.4" />
      {/* open blade */}
      <path d="M150 180 L70 70 L96 64 L168 174 Z" stroke={accent} strokeWidth="2" />
      {/* spine line of open blade */}
      <path d="M70 70 L150 180" stroke={accent} strokeWidth="1" opacity="0.5" />
      {/* pivot */}
      <circle cx="150" cy="180" r="9" stroke={stroke} opacity="0.7" />
      <circle cx="150" cy="180" r="3.5" fill={accent} stroke="none" />
    </g>
  );
}
