"use client";

import { useEffect } from "react";
import Link from "next/link";
import { NavBar, SiteLogo, Button } from "@verificat/ui";

const NAV_LINKS = [
  { href: "#platforme", label: "Platforme" },
  { href: "/privacy", label: "Despre" },
];

export function SiteNav() {
  useEffect(() => {
    const easeOutCubic = (t: number, b: number, c: number, d: number) => {
      t /= d;
      t--;
      return c * (t * t * t + 1) + b;
    };

    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || !href.startsWith("#") || href === "#") return;

      const targetElement = document.querySelector(href);
      if (!targetElement) return;

      e.preventDefault();

      const targetPosition =
        targetElement.getBoundingClientRect().top + window.scrollY;
      const startPosition = window.scrollY;
      const headerOffset = 80;
      const distance = targetPosition - startPosition - headerOffset;
      const duration = 800;
      let startTime: number | null = null;

      const animation = (currentTime: number) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const run = easeOutCubic(
          timeElapsed,
          startPosition,
          distance,
          duration,
        );
        window.scrollTo(0, run);
        if (timeElapsed < duration) {
          requestAnimationFrame(animation);
        } else {
          window.scrollTo(0, startPosition + distance);
          window.history.pushState(null, "", href);
        }
      };

      requestAnimationFrame(animation);
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  return (
    <NavBar
      logo={<SiteLogo linkComponent={Link} />}
      items={NAV_LINKS}
      actions={
        <Button asChild>
          <Link href="/login">Către profil</Link>
        </Button>
      }
    />
  );
}
