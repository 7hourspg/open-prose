type Props = {
  template: string;
  name: string;
};

export const TEMPLATE_THUMB_ASPECT = "8 / 5";

export function TemplateThumb({ template, name }: Props) {
  if (template === "developer") {
    return (
      <svg viewBox="0 0 240 150" preserveAspectRatio="xMidYMid slice" className="block h-full w-full">
        <rect width="240" height="150" fill="#15161a" />
        <text
          x="16"
          y="34"
          fill="#8aa6c4"
          fontFamily="JetBrains Mono, monospace"
          fontSize="11"
          fontWeight="600"
        >
          $ {name.toLowerCase().replace(/\s+/g, "-")}
        </text>
        <text
          x="16"
          y="58"
          fill="#e6e2d6"
          fontFamily="JetBrains Mono, monospace"
          fontSize="13"
          fontWeight="700"
        >
          // the long way home
        </text>
        <rect x="16" y="68" width="180" height="2" fill="#3a3d44" />
        <rect x="16" y="80" width="208" height="2" fill="#3a3d44" />
        <rect x="16" y="86" width="180" height="2" fill="#3a3d44" />
        <rect x="16" y="92" width="160" height="2" fill="#3a3d44" />
        <rect x="16" y="104" width="80" height="14" rx="2" fill="#1f3b2c" />
        <text
          x="22"
          y="114"
          fill="#74c690"
          fontFamily="JetBrains Mono, monospace"
          fontSize="9"
        >
          walking
        </text>
      </svg>
    );
  }
  if (template === "magazine") {
    return (
      <svg viewBox="0 0 240 150" preserveAspectRatio="xMidYMid slice" className="block h-full w-full">
        <rect width="240" height="150" fill="#fbf6ec" />
        <text
          x="16"
          y="22"
          fill="#b5722a"
          fontFamily="Inter,sans-serif"
          fontSize="9"
          fontWeight="600"
          letterSpacing="2"
        >
          ISSUE 04 — APRIL
        </text>
        <text
          x="16"
          y="58"
          fill="#1f1a12"
          fontFamily="Source Serif 4, Georgia, serif"
          fontSize="22"
          fontWeight="700"
        >
          A theory
        </text>
        <text
          x="16"
          y="80"
          fill="#1f1a12"
          fontFamily="Source Serif 4, Georgia, serif"
          fontSize="22"
          fontWeight="700"
          fontStyle="italic"
        >
          of margins
        </text>
        <rect x="16" y="98" width="208" height="1" fill="#1f1a12" />
        <rect x="16" y="106" width="180" height="1.5" fill="#9a9285" />
        <rect x="16" y="112" width="200" height="1.5" fill="#9a9285" />
        <rect x="16" y="118" width="160" height="1.5" fill="#9a9285" />
      </svg>
    );
  }
  if (template === "notebook") {
    return (
      <svg viewBox="0 0 240 150" preserveAspectRatio="xMidYMid slice" className="block h-full w-full">
        <rect width="240" height="150" fill="#f7f3e9" />
        <text
          x="16"
          y="32"
          fill="#27241d"
          fontFamily="Source Serif 4, Georgia, serif"
          fontSize="17"
          fontStyle="italic"
          fontWeight="500"
        >
          {name}
        </text>
        <text
          x="16"
          y="56"
          fill="#857d6e"
          fontFamily="Inter,sans-serif"
          fontSize="8"
          fontWeight="700"
          letterSpacing="2"
        >
          FROM THE NOTEBOOK
        </text>
        <line x1="16" y1="64" x2="224" y2="64" stroke="#dcd2bd" strokeDasharray="2,3" />
        <rect x="16" y="76" width="180" height="2" fill="#dcd2bd" />
        <rect x="16" y="84" width="208" height="2" fill="#dcd2bd" />
        <rect x="16" y="92" width="172" height="2" fill="#dcd2bd" />
        <line x1="16" y1="106" x2="224" y2="106" stroke="#dcd2bd" strokeDasharray="2,3" />
        <rect x="16" y="116" width="160" height="2" fill="#dcd2bd" />
        <rect x="16" y="124" width="200" height="2" fill="#dcd2bd" />
        <rect x="16" y="132" width="140" height="2" fill="#dcd2bd" />
      </svg>
    );
  }
  if (template === "noir") {
    return (
      <svg viewBox="0 0 240 150" preserveAspectRatio="xMidYMid slice" className="block h-full w-full">
        <rect width="240" height="150" fill="#1a1d24" />
        <text
          x="16"
          y="26"
          fill="#e0a96d"
          fontFamily="Inter,sans-serif"
          fontSize="8"
          fontWeight="600"
          letterSpacing="3"
        >
          WRITING
        </text>
        <text
          x="16"
          y="58"
          fill="#ede4d3"
          fontFamily="EB Garamond, Georgia, serif"
          fontSize="22"
          fontStyle="italic"
          fontWeight="500"
        >
          {name}
        </text>
        <line x1="16" y1="72" x2="160" y2="72" stroke="#e0a96d" strokeWidth="0.6" />
        <rect x="16" y="84" width="208" height="1.5" fill="#3a3d44" />
        <rect x="16" y="92" width="172" height="1.5" fill="#3a3d44" />
        <rect x="16" y="100" width="200" height="1.5" fill="#3a3d44" />
        <rect x="16" y="108" width="140" height="1.5" fill="#3a3d44" />
        <rect x="16" y="120" width="180" height="1.5" fill="#3a3d44" />
        <rect x="16" y="128" width="156" height="1.5" fill="#3a3d44" />
      </svg>
    );
  }
  if (template === "newsletter") {
    return (
      <svg viewBox="0 0 240 150" preserveAspectRatio="xMidYMid slice" className="block h-full w-full">
        <rect width="240" height="150" fill="#fafaf9" />
        <circle cx="32" cy="32" r="14" fill="#1d4ed8" />
        <text
          x="32"
          y="36"
          fill="#fafaf9"
          fontFamily="Source Serif 4, Georgia, serif"
          fontSize="14"
          fontWeight="800"
          textAnchor="middle"
        >
          {(name || "?").trim().charAt(0).toUpperCase()}
        </text>
        <text
          x="54"
          y="30"
          fill="#1c1917"
          fontFamily="Source Serif 4, Georgia, serif"
          fontSize="13"
          fontWeight="800"
        >
          {name}
        </text>
        <text
          x="54"
          y="42"
          fill="#78716c"
          fontFamily="Inter,sans-serif"
          fontSize="8"
        >
          weekly letters
        </text>
        <line x1="16" y1="58" x2="224" y2="58" stroke="#e7e5e4" />
        <text
          x="16"
          y="76"
          fill="#1d4ed8"
          fontFamily="Inter,sans-serif"
          fontSize="7"
          fontWeight="700"
          letterSpacing="2"
        >
          MAR 12
        </text>
        <text
          x="16"
          y="94"
          fill="#1c1917"
          fontFamily="Source Serif 4, Georgia, serif"
          fontSize="14"
          fontWeight="800"
        >
          A short note on
        </text>
        <text
          x="16"
          y="110"
          fill="#1c1917"
          fontFamily="Source Serif 4, Georgia, serif"
          fontSize="14"
          fontWeight="800"
        >
          paying attention
        </text>
        <rect x="16" y="120" width="200" height="1.5" fill="#e7e5e4" />
        <rect x="16" y="128" width="160" height="1.5" fill="#e7e5e4" />
        <rect x="16" y="136" width="180" height="1.5" fill="#e7e5e4" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 240 150" preserveAspectRatio="xMidYMid slice" className="block h-full w-full">
      <rect width="240" height="150" fill="#fafaf7" />
      <text
        x="20"
        y="40"
        fill="#1f1a12"
        fontFamily="Source Serif 4, Georgia, serif"
        fontSize="17"
        fontWeight="600"
      >
        {name}
      </text>
      <rect x="20" y="50" width="40" height="1" fill="#1f1a12" />
      <rect x="20" y="68" width="200" height="2" fill="#d8d3c8" />
      <rect x="20" y="76" width="180" height="2" fill="#d8d3c8" />
      <rect x="20" y="84" width="200" height="2" fill="#d8d3c8" />
      <rect x="20" y="92" width="120" height="2" fill="#d8d3c8" />
      <rect x="20" y="108" width="200" height="2" fill="#d8d3c8" />
      <rect x="20" y="116" width="160" height="2" fill="#d8d3c8" />
    </svg>
  );
}

export function templateBg(template: string): string {
  if (template === "developer") return "#14161a";
  if (template === "magazine") return "#fbf6ec";
  if (template === "notebook") return "#f7f3e9";
  if (template === "noir") return "#1a1d24";
  if (template === "newsletter") return "#fafaf9";
  return "#fafaf7";
}
