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
        gap: 'var(--spacing-lg)',
        padding: 'var(--spacing-4xl) var(--spacing-lg)',
        background: 'var(--color-canvas-inset, #f0ede6)',
        fontFamily: 'var(--font-display)',
        textAlign: 'center',
      }}
    >
      {children}
    </section>
  );
}
