import type { ReactNode, HTMLAttributes } from 'react';

interface FeatureCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  shadow?: boolean;
  hover?: boolean;
}

export function FeatureCard({ children, shadow = true, hover = true, id }: FeatureCardProps) {
  return (
    <div
      id={id}
      className={hover ? 'card' : undefined}
      style={{
        borderRadius: 'var(--rounded-md)',
        padding: 'var(--spacing-lg, 24px)',
        backgroundColor: 'var(--surface-raised)',
        border: '1px solid var(--color-subtle)',
        fontFamily: 'var(--font-display)',
        boxShadow: shadow ? 'var(--shadow-sm)' : undefined,
      }}
    >
      {children}
    </div>
  );
}
