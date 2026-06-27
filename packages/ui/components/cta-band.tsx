import type { ReactNode } from 'react';

interface CTABandProps {
  children: ReactNode;
  id?: string;
}

export function CTABand({ children, id }: CTABandProps) {
  return (
    <section
      id={id}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-6, 24px)',
        padding: 'var(--space-24, 96px) var(--space-6, 24px)',
        background: 'var(--color-canvas-inset, #f0ede6)',
        fontFamily: 'var(--font-heading, var(--font-display, Poppins, Arial, sans-serif))',
        textAlign: 'center',
      }}
    >
      {children}
    </section>
  );
}
