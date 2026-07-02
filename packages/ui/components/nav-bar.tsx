"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu } from "lucide-react";
import { Button } from "./ui/button";
import type { ReactNode } from "react";

export interface NavItem {
  label: string;
  href?: string;
  onClick?: () => void;
  active?: boolean;
}

interface NavBarProps {
  id?: string;
  scrolled?: boolean;
  logo?: ReactNode;
  items?: NavItem[];
  actions?: ReactNode;
}

export function NavBar({ id, scrolled = false, logo, items, actions }: NavBarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { theme, setTheme, systemTheme } = useTheme();

  useEffect(() => { setMounted(true); }, []);

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

  const currentTheme = theme === "system" ? systemTheme : theme;

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
        display: "flex",
        justifyContent: "center",
        padding: scrolled ? "12px 24px 0" : "0",
        transition: "padding 300ms cubic-bezier(0.215, 0.61, 0.355, 1)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: scrolled ? "calc(100% - 0px)" : "100%",
          maxWidth: scrolled ? 1200 : "100%",
          height: scrolled ? 52 : 64,
          padding: scrolled ? "0 16px" : "0 24px",
          borderRadius: scrolled ? "var(--rounded-lg, 16px)" : 0,
          backgroundColor: scrolled ? "rgba(250, 249, 245, 0.85)" : "rgba(250, 249, 245, 0.15)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: scrolled ? "1px solid var(--color-subtle)" : "none",
          borderBottom: scrolled ? undefined : "1px solid var(--color-subtle)",
          boxShadow: scrolled ? "var(--shadow-sm)" : "none",
          transition: "all 300ms cubic-bezier(0.215, 0.61, 0.355, 1)",
          fontFamily: "var(--font-display)",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0, flex: "1 1 0%", overflow: "hidden" }} className="md:flex-none">
          {logo}
        </div>

        <div className="hidden md:flex items-center gap-1">
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
                  borderRadius: "var(--radius-sm, 6px)",
                  border: "none",
                  backgroundColor: item.active ? "var(--color-accent-soft)" : "transparent",
                  color: item.active ? "var(--color-accent)" : "var(--color-ink)",
                  fontFamily: "var(--font-display)",
                  fontSize: 14,
                  fontWeight: 500,
                  lineHeight: "20px",
                  cursor: "pointer",
                  userSelect: "none",
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "background-color 150ms ease-out, color 150ms ease-out",
                }}
              >
                {item.label}
              </Tag>
            );
          })}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {actions}

          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
              aria-label="Schimbă tema"
            >
              {currentTheme === "dark" ? <Sun className="h-[1.2rem] w-[1.2rem]" /> : <Moon className="h-[1.2rem] w-[1.2rem]" />}
            </Button>
          )}

          <div ref={menuRef} className="relative md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Deschide meniu"
            >
              <Menu className="h-5 w-5" />
            </Button>

            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  minWidth: 220,
                  padding: "8px",
                  borderRadius: "var(--radius-md, 12px)",
                  backgroundColor: "rgba(250, 249, 245, 0.85)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid var(--color-subtle)",
                  boxShadow: "var(--shadow-lg)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
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
                        borderRadius: "var(--radius-sm, 6px)",
                        border: "none",
                        backgroundColor: "transparent",
                        color: "var(--color-ink)",
                        fontFamily: "var(--font-display)",
                        fontSize: 15,
                        fontWeight: 500,
                        cursor: "pointer",
                        textDecoration: "none",
                        transition: "background-color 150ms ease-out",
                      }}
                      onMouseEnter={(e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "var(--color-subtle)";
                      }}
                      onMouseLeave={(e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
                        (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                      }}
                    >
                      {item.label}
                    </Tag>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
