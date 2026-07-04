"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { Menu, Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";

export interface NavItem {
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

interface NavBarProps {
  id?: string;
  logo?: ReactNode;
  items?: NavItem[];
  actions?: ReactNode;
}

export function NavBar({ id, logo, items, actions }: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme, systemTheme } = useTheme();

  const currentTheme = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const handleItemClick = (item: NavItem) => {
    setMenuOpen(false);
    item.onClick?.();
  };

  return (
    <nav
      id={id}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: "0 24px",
        boxSizing: "border-box",
      }}
    >
      {/* Full-width hairline */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: 1,
          backgroundColor: "var(--color-subtle)",
          opacity: scrolled ? 0 : 1,
          transition: "opacity 200ms",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          width: "100%",
          maxWidth: 1200,
          marginLeft: "auto",
          marginRight: "auto",
          marginTop: scrolled ? 12 : 0,
          minHeight: scrolled ? 52 : 64,
          padding: scrolled ? "0 16px" : "0",
          borderRadius: scrolled ? "var(--radius-lg, 16px)" : 0,
          border: scrolled ? "1px solid var(--color-subtle)" : "none",
          boxShadow: scrolled ? "var(--shadow-sm)" : "none",
          backgroundColor: scrolled
            ? "var(--color-canvas-elevated)"
            : "transparent",
          transition:
            "margin-top 300ms, min-height 300ms, padding 300ms, border-radius 300ms, background-color 300ms, box-shadow 300ms",
          fontFamily: "var(--font-display)",
          boxSizing: "border-box",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            minWidth: 0,
            overflow: "hidden",
          }}
          className="flex-1 md:flex-none"
        >
          {logo}
        </div>

        <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {items?.map((item) => {
            const Tag = item.href ? "a" : "button";
            return (
              <Tag
                key={item.label}
                href={item.href}
                onClick={item.onClick}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: 44,
                  padding: "0 12px",
                  borderRadius: 6,
                  border: "none",
                  backgroundColor: item.active
                    ? "var(--color-accent-soft)"
                    : "transparent",
                  color: item.active
                    ? "var(--color-accent)"
                    : "var(--color-ink)",
                  fontFamily: "var(--font-display)",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  userSelect: "none",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "background-color 150ms, color 150ms",
                }}
              >
                {item.label}
              </Tag>
            );
          })}
        </div>

        <div
          style={{ display: "flex", alignItems: "center", gap: 4 }}
          className="flex-1 justify-end md:flex-none"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
            aria-label="Schimbă tema"
          >
            {currentTheme === "dark" ? (
              <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
              <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
          </Button>

          {actions}

          <div ref={menuRef} className="md:hidden">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Deschide meniu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {menuOpen && (
          <div
            style={{
              position: "absolute",
              left: 0,
              right: 0,
              top: "100%",
              marginTop: 8,
              padding: "8px 0",
              backgroundColor: "var(--color-canvas-elevated)",
              border: "1px solid var(--color-subtle)",
              borderRadius: "var(--radius-lg, 16px)",
              boxShadow: scrolled ? "var(--shadow-sm)" : "none",
              display: "flex",
              flexDirection: "column",
              gap: 4,
              boxSizing: "border-box",
            }}
          >
            {items?.map((item) => {
              const Tag = item.href ? "a" : "button";
              return (
                <Tag
                  key={item.label}
                  href={item.href}
                  onClick={() => handleItemClick(item)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    height: 44,
                    padding: "0 12px",
                    margin: "0 8px",
                    borderRadius: "var(--radius-md)",
                    border: "none",
                    backgroundColor: "transparent",
                    color: "var(--color-ink)",
                    fontFamily: "var(--font-display)",
                    fontSize: 16,
                    fontWeight: 500,
                    cursor: "pointer",
                    textDecoration: "none",
                    transition: "background-color 150ms",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "var(--color-subtle)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLElement).style.backgroundColor =
                      "transparent";
                  }}
                >
                  {item.label}
                </Tag>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
