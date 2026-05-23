import type { CSSProperties } from "react";

export function BrandLogo({
  size = 40,
  className,
  style,
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 256 256"
      width={size}
      height={size}
      className={className}
      style={style}
      aria-hidden
    >
      <defs>
        <linearGradient id="brand-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#1c1208" />
          <stop offset="100%" stopColor="#0a0604" />
        </linearGradient>
        <linearGradient id="brand-nib" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f5e9d4" />
          <stop offset="100%" stopColor="#c2a47a" />
        </linearGradient>
      </defs>
      <rect width="256" height="256" rx="56" ry="56" fill="url(#brand-bg)" />
      <path
        d="M128 56 L196 168 L160 196 L128 232 L96 196 L60 168 Z"
        fill="url(#brand-nib)"
      />
      <circle cx="128" cy="124" r="14" fill="#0a0604" />
      <rect x="125" y="124" width="6" height="76" fill="#0a0604" />
    </svg>
  );
}

export function BrandMark({
  size = 14,
  className,
  style,
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <svg
      viewBox="0 0 256 256"
      width={size}
      height={size}
      className={className}
      style={style}
      aria-hidden
      fill="currentColor"
    >
      <path d="M128 56 L196 168 L160 196 L128 232 L96 196 L60 168 Z" />
    </svg>
  );
}

export function BrandWordmark({
  size = 16,
  className,
  style,
}: {
  size?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      className={className}
      style={{
        fontFamily: "var(--font-serif-stack)",
        fontWeight: 600,
        letterSpacing: "-0.01em",
        fontSize: size,
        ...style,
      }}
    >
      Open Prose
    </span>
  );
}
