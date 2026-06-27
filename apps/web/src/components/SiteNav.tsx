"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { NavBar, Logo, NavLink } from "@verificat/ui";

const NAV_LINKS = [
  { href: "#cum-functioneaza", label: "Cum funcționează" },
  { href: "#platforme", label: "Platforme" },
  { href: "/privacy", label: "Despre" },
];

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleScroll = useCallback(() => {
    setScrolled(window.scrollY > 60);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    setTimeout(handleScroll, 0);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Close menu on resize to desktop
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <>
      <NavBar scrolled={scrolled} id="site-nav">
        {/* Logo */}
        <Logo variant="dark" size={28} showWordmark href="/" />

        {/* Desktop nav links */}
        <nav
          aria-label="Navigare principală"
          style={{ display: "flex", gap: 4, alignItems: "center" }}
          className="site-nav-desktop"
        >
          {NAV_LINKS.map((link) => (
            <NavLink key={link.href} href={link.href}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        {/* Desktop CTA */}
        <div
          className="site-nav-desktop"
          style={{ display: "flex", alignItems: "center", gap: 12 }}
        >
          <Link
            id="btn-nav-cta"
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              height: 40,
              padding: "0 20px",
              background: "var(--color-ink)",
              color: "var(--color-canvas)",
              borderRadius: "var(--radius-pill)",
              fontFamily: "var(--font-heading, var(--font-display))",
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: "-0.01em",
              textDecoration: "none",
              transition:
                "background var(--transition-fast), transform var(--transition-fast)",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#2a2a28")}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--color-ink)")
            }
          >
            Încearcă gratuit →
          </Link>
        </div>

        {/* Hamburger — mobile only */}
        <button
          id="btn-mobile-menu"
          aria-label={menuOpen ? "Închide meniul" : "Deschide meniul"}
          aria-expanded={menuOpen}
          aria-controls="mobile-nav-menu"
          className="site-nav-mobile"
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            display: "none",
            flexDirection: "column",
            gap: 5,
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 8,
            borderRadius: "var(--radius-sm)",
          }}
        >
          <span
            style={{
              display: "block",
              width: 22,
              height: 2,
              background: "var(--color-ink)",
              borderRadius: 2,
              transition: "transform 200ms ease-out, opacity 200ms ease-out",
              transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none",
            }}
          />
          <span
            style={{
              display: "block",
              width: 22,
              height: 2,
              background: "var(--color-ink)",
              borderRadius: 2,
              transition: "opacity 200ms ease-out",
              opacity: menuOpen ? 0 : 1,
            }}
          />
          <span
            style={{
              display: "block",
              width: 22,
              height: 2,
              background: "var(--color-ink)",
              borderRadius: 2,
              transition: "transform 200ms ease-out, opacity 200ms ease-out",
              transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none",
            }}
          />
        </button>
      </NavBar>

      {/* Mobile dropdown */}
      <div
        id="mobile-nav-menu"
        role="dialog"
        aria-label="Meniu mobil"
        style={{
          position: "fixed",
          top: 64,
          left: 0,
          right: 0,
          zIndex: 99,
          background: "var(--color-canvas-elevated)",
          borderBottom: "1px solid var(--color-subtle)",
          boxShadow: "var(--shadow-md)",
          transform: menuOpen ? "translateY(0)" : "translateY(-8px)",
          opacity: menuOpen ? 1 : 0,
          pointerEvents: menuOpen ? "auto" : "none",
          transition: "transform 200ms ease-out, opacity 200ms ease-out",
          padding:
            "var(--space-4, 16px) var(--space-6, 24px) var(--space-6, 24px)",
          display: "flex",
          flexDirection: "column",
          gap: 4,
        }}
      >
        {NAV_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            onClick={() => setMenuOpen(false)}
            style={{
              fontFamily: "var(--font-heading, var(--font-display))",
              fontWeight: 500,
              fontSize: 16,
              color: "var(--color-ink)",
              textDecoration: "none",
              padding: "var(--space-3, 12px) 0",
              borderBottom: "1px solid var(--color-subtle)",
            }}
          >
            {link.label}
          </a>
        ))}
        <Link
          href="/login"
          onClick={() => setMenuOpen(false)}
          style={{
            marginTop: "var(--space-4, 16px)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 44,
            background: "var(--color-ink)",
            color: "var(--color-canvas)",
            borderRadius: "var(--radius-pill)",
            fontFamily: "var(--font-heading, var(--font-display))",
            fontWeight: 600,
            fontSize: 15,
            textDecoration: "none",
          }}
        >
          Încearcă gratuit →
        </Link>
      </div>

      {/* Responsive CSS injected as style tag to avoid global class pollution */}
      <style>{`
        .site-nav-desktop { display: flex !important; }
        .site-nav-mobile  { display: none !important; }

        @media (max-width: 767px) {
          .site-nav-desktop { display: none !important; }
          .site-nav-mobile  { display: flex !important; }
        }
      `}</style>
    </>
  );
}
