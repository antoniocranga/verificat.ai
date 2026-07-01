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
        gap: 'var(--spacing-2xl)',
        padding: 'var(--spacing-2xl) var(--spacing-lg)',
        borderTop: '1px solid var(--color-subtle)',
        borderBottom: '1px solid var(--color-subtle)',
        background: 'var(--color-canvas)',
        fontFamily: 'var(--font-display)',
      }}
    >
      {children}
    </section>
  );
}
