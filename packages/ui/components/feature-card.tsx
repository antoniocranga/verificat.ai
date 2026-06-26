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
        borderRadius: 'var(--rounded-md, 12px)',
        padding: 'var(--spacing-lg, 24px)',
        backgroundColor: 'var(--surface-raised, #ffffff)',
        border: '1px solid var(--color-subtle, #e8e6dc)',
        fontFamily: 'var(--font-display, Poppins, Arial, sans-serif)',
        boxShadow: shadow ? 'var(--shadow-sm)' : undefined,
      }}
    >
      {children}
    </div>
  );
}
