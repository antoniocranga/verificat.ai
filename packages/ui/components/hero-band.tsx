import type { ReactNode, CSSProperties } from 'react';

interface HeroBandProps {
  children: ReactNode;
  id?: string;
  style?: CSSProperties;
}

const heroBackground = `
  radial-gradient(ellipse 60% 50% at 70% 20%, rgba(217,119,87,0.08) 0%, transparent 60%),
  radial-gradient(ellipse 40% 60% at 20% 80%, rgba(106,155,204,0.06) 0%, transparent 60%),
  var(--color-canvas, #faf9f5)
`;

export function HeroBand({ children, id, style }: HeroBandProps) {
  return (
    <section
      id={id}
      style={{
        position: 'relative',
        padding: 'var(--space-32, 128px) var(--space-6, 24px) var(--space-24, 96px)',
        background: heroBackground,
        fontFamily: 'var(--font-heading, var(--font-display, Poppins, Arial, sans-serif))',
        overflow: 'hidden',
        ...style,
      }}
    >
      {children}
    </section>
  );
}
