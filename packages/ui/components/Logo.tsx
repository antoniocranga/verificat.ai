import type { CSSProperties } from 'react';

interface LogoProps {
  variant?: 'dark' | 'light' | 'accent';
  size?: number;
  showWordmark?: boolean;
  href?: string;
  id?: string;
  style?: CSSProperties;
}

export function Logo({
  variant = 'dark',
  size = 28,
  showWordmark = true,
  href = '/',
  id,
  style,
}: LogoProps) {
  const logoSrc = {
    dark:   '/logo-dark.svg',
    light:  '/logo-light.svg',
    accent: '/logo-accent.svg',
  }[variant];

  const wordmarkColor = {
    dark:   'var(--color-ink)',
    light:  'var(--color-canvas)',
    accent: 'var(--color-accent)',
  }[variant];

  const inner = (
    <span
      id={id}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        ...style,
      }}
    >
      {/* Plain img — no next/image dependency so packages/ui stays framework-agnostic */}
      <img
        src={logoSrc}
        alt="verificat.ai shield logo"
        width={size}
        height={size}
        loading="eager"
        decoding="async"
      />
      {showWordmark && (
        <span
          style={{
            fontFamily: 'var(--font-heading, var(--font-display, Poppins, Arial, sans-serif))',
            fontWeight: 700,
            fontSize: size * 0.7,
            letterSpacing: '-0.03em',
            color: wordmarkColor,
            lineHeight: 1,
          }}
        >
          verificat
          <span style={{ color: 'var(--color-accent)' }}>.ai</span>
        </span>
      )}
    </span>
  );

  if (href) {
    return (
      <a href={href} style={{ textDecoration: 'none' }}>
        {inner}
      </a>
    );
  }

  return inner;
}
