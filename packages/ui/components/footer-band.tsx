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
        background: 'var(--color-canvas, #faf9f5)',
        borderTop: '1px solid var(--color-subtle, #e8e6dc)',
        padding: 'var(--space-24, 96px) var(--space-6, 24px)',
        fontFamily: 'var(--font-body, Lora, Georgia, serif)',
        color: 'var(--color-mid, #b0aea5)',
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
          gap: 'var(--space-12, 48px)',
        }}
      >
        {children}
      </div>
    </footer>
  );
}
