import type { ReactNode } from 'react';

interface FooterBandProps {
  children: ReactNode;
  id?: string;
}

export function FooterBand({ children, id }: FooterBandProps) {
  return (
    <footer
      id={id}
      style={{
        background: 'var(--color-canvas)',
        borderTop: '1px solid var(--color-subtle)',
        padding: 'var(--spacing-4xl) var(--spacing-lg)',
        fontFamily: 'var(--font-body)',
        color: 'var(--color-mid)',
        fontSize: 14,
        lineHeight: 1.6,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--spacing-2xl)',
        }}
      >
        {children}
      </div>
    </footer>
  );
}
