 import type { ReactNode } from 'react';

interface LogoStripProps {
  children: ReactNode;
  id?: string;
}

export function LogoStrip({ children, id }: LogoStripProps) {
  return (
    <section
      id={id}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: 'var(--space-12, 48px)',
        padding: 'var(--space-12, 48px) var(--space-6, 24px)',
        borderTop: '1px solid var(--color-subtle, #e8e6dc)',
        borderBottom: '1px solid var(--color-subtle, #e8e6dc)',
        background: 'var(--color-canvas, #faf9f5)',
        fontFamily: 'var(--font-heading, var(--font-display, Poppins, Arial, sans-serif))',
      }}
    >
      {children}
    </section>
  );
}
