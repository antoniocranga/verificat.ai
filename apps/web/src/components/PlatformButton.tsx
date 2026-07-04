import type { ReactNode } from "react";

import { Squircle } from "@verificat/ui";

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
    <Squircle
      fill="var(--color-canvas-elevated)"
      stroke="var(--color-subtle)"
      className={`block transition-all duration-200 h-full min-w-40 drop-shadow-sm ${
        comingSoon ? "opacity-50 cursor-default" : "cursor-pointer"
      }`}
    >
      <div className="flex flex-col items-center justify-center gap-3 p-6 h-full box-border">
        <div className="text-foreground w-8 h-8 flex items-center justify-center">
          {logo}
        </div>
        <span className="font-heading font-medium text-sm text-foreground tracking-tight">
          {name}
        </span>
        <span className="font-body text-xs text-muted-foreground">
          {comingSoon ? "În curând" : badge}
        </span>
      </div>
    </Squircle>
  );

  if (!href || comingSoon) return <div id={id}>{inner}</div>;

  return (
    <a
      id={id}
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="no-underline block h-full hover:scale-[1.02] transition-transform"
      aria-label={`Instalează ${name}`}
    >
      {inner}
    </a>
  );
}
