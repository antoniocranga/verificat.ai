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
    dark: '/logo-dark.svg',
    light: '/logo-light.svg',
    accent: '/logo-accent.svg',
  }[variant];

  const wordmarkColor = {
    dark: 'var(--color-ink)',
    light: 'var(--color-canvas)',
    accent: 'var(--color-accent)',
  }[variant];

  const inner = (
    <span
      id={id}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 10,
        ...style,
      }}
    >
      {/* Orange square with shield icon */}
      <span
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: size,
          height: size,
          borderRadius: 6,
          background: 'var(--color-accent, #c96442)',
          color: '#fff',
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width={size * 0.64}
          height={size * 0.64}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      </span>
      {showWordmark && (
        <span
          style={{
            fontFamily: "var(--font-display, 'Poppins')",
            fontSize: size * 0.64, // 18px when size is 28
            fontWeight: 500,
            letterSpacing: '-0.01em',
            color: wordmarkColor,
          }}
        >
          verificat.xyz
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
