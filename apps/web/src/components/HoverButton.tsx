"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

interface HoverButtonProps {
  id?: string;
  href?: string;
  onClick?: () => void;
  children: ReactNode;
  style?: CSSProperties;
  hoverBg?: string;
  hoverBorder?: string;
  variant?: "primary" | "secondary" | "ghost";
  type?: "button" | "submit";
  ariaLabel?: string;
}

/**
 * A small client component wrapping a styled button or link that needs
 * hover state. Used in page.tsx which is otherwise a server component.
 */
export function HoverButton({
  id,
  href,
  onClick,
  children,
  style,
  hoverBg,
  hoverBorder,
  variant = "primary",
  type = "button",
  ariaLabel,
}: HoverButtonProps) {
  const defaultStyles: CSSProperties =
    variant === "primary"
      ? {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          height: 48,
          padding: "0 28px",
          background: "var(--color-ink)",
          color: "var(--color-canvas)",
          borderRadius: "var(--radius-pill)",
          fontFamily: "var(--font-heading)",
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: "-0.01em",
          border: "none",
          cursor: "pointer",
          boxShadow: "var(--shadow-sm)",
          textDecoration: "none",
          transition: "background var(--transition-fast), transform var(--transition-fast)",
        }
      : variant === "secondary"
      ? {
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          height: 48,
          padding: "0 28px",
          background: "var(--color-canvas-elevated)",
          color: "var(--color-ink)",
          borderRadius: "var(--radius-pill)",
          fontFamily: "var(--font-heading)",
          fontWeight: 600,
          fontSize: 15,
          letterSpacing: "-0.01em",
          border: "1.5px solid var(--color-subtle)",
          cursor: "pointer",
          textDecoration: "none",
          transition: "border-color var(--transition-fast), box-shadow var(--transition-fast)",
        }
      : {
          background: "none",
          border: "none",
          fontFamily: "var(--font-body)",
          fontSize: 14,
          color: "var(--color-mid)",
          cursor: "pointer",
          padding: 0,
          textAlign: "left",
          textDecoration: "none",
          transition: "color var(--transition-fast)",
        };

  const mergedStyle: CSSProperties = { ...defaultStyles, ...style };

  const handleMouseEnter = (e: React.MouseEvent<HTMLElement>) => {
    if (hoverBg) e.currentTarget.style.background = hoverBg;
    if (hoverBorder) e.currentTarget.style.borderColor = hoverBorder;
    if (variant === "ghost") e.currentTarget.style.color = "var(--color-ink)";
    if (variant === "secondary") {
      e.currentTarget.style.borderColor = "var(--color-mid)";
      e.currentTarget.style.boxShadow = "var(--shadow-sm)";
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLElement>) => {
    if (hoverBg)
      e.currentTarget.style.background =
        (mergedStyle.background as string) ?? "";
    if (hoverBorder)
      e.currentTarget.style.borderColor =
        (mergedStyle.borderColor as string) ?? "var(--color-subtle)";
    if (variant === "ghost")
      e.currentTarget.style.color = "var(--color-mid)";
    if (variant === "secondary") {
      e.currentTarget.style.borderColor = "var(--color-subtle)";
      e.currentTarget.style.boxShadow = "none";
    }
  };

  if (href) {
    return (
      <Link
        id={id}
        href={href}
        style={mergedStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label={ariaLabel}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      style={mergedStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      aria-label={ariaLabel}
    >
      {children}
    </button>
  );
}
