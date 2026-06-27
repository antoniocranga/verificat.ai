import type { ReactNode } from "react";

interface PlatformButtonProps {
  name: string;
  badge: string;
  logo: ReactNode; // inline SVG
  href: string | undefined;
  comingSoon?: boolean;
  id?: string;
}

export function PlatformButton({
  name,
  badge,
  logo,
  href,
  comingSoon,
  id,
}: PlatformButtonProps) {
  const inner = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "var(--space-3, 12px)",
        padding: "var(--space-6, 24px) var(--space-8, 32px)",
        background: "var(--color-canvas-elevated, #ffffff)",
        border: "1px solid var(--color-subtle, #e8e6dc)",
        borderRadius: "var(--radius-md, 12px)",
        transition: "all var(--transition-base, 200ms ease-out)",
        cursor: href && !comingSoon ? "pointer" : "default",
        opacity: comingSoon ? 0.5 : 1,
        minWidth: 140,
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <div
        style={{
          color: "var(--color-ink, #141413)",
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {logo}
      </div>
      <span
        style={{
          fontFamily: "var(--font-heading, var(--font-display))",
          fontWeight: 500,
          fontSize: 14,
          color: "var(--color-ink, #141413)",
          letterSpacing: "-0.01em",
        }}
      >
        {name}
      </span>
      <span
        style={{
          fontFamily: "var(--font-body, Lora, Georgia, serif)",
          fontSize: 12,
          color: "var(--color-mid, #b0aea5)",
        }}
      >
        {comingSoon ? "În curând" : badge}
      </span>
    </div>
  );

  if (!href || comingSoon) return <div id={id}>{inner}</div>;

  return (
    <a
      id={id}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      style={{ textDecoration: "none" }}
      aria-label={`Instalează ${name}`}
    >
      {inner}
    </a>
  );
}
