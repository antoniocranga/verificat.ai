import type { ComponentType, AnchorHTMLAttributes, ReactNode } from "react";

interface SiteLogoProps {
  className?: string;
  hideTextOnMobile?: boolean;
  linkComponent?: ComponentType<AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children?: ReactNode }>;
}

function DefaultLink({ href, children, ...props }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  return <a href={href} {...props}>{children}</a>;
}

export function SiteLogo({ className = "", hideTextOnMobile = false, linkComponent: Link }: SiteLogoProps) {
  const LinkComponent = Link || DefaultLink;
  return (
    <LinkComponent href="/" className={`flex items-center gap-2.5 shrink-0 hover:opacity-90 transition-opacity ${className}`}>
      <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center shrink-0">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-primary-foreground"
        >
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </div>
      <span className={`font-display text-[18px] font-medium tracking-tight text-foreground ${hideTextOnMobile ? 'md:block hidden' : ''}`}>
        verificat.xyz
      </span>
    </LinkComponent>
  );
}
