import type { ReactNode } from 'react';
import './button.css'; // pulls in token vars

interface FeatureCardProps {
  children: ReactNode;
  shadow?: boolean;
  id?: string;
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
