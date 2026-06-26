import type { ReactNode } from 'react';
import { Button } from './Button';
import './button.css';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'accent';
}

interface EmptyStateProps {
  /** Icon or illustration — wrapped in a rounded container automatically */
  icon: ReactNode;
  title: string;
  description: string;
  action?: EmptyStateAction;
  /** 'empty' (default), 'error', or 'network-error' — controls icon container colour */
  type?: 'empty' | 'error' | 'network-error';
  id?: string;
}

const containerColors = {
  empty:         'rgba(232, 230, 220, 0.6)',   // --color-subtle/60
  error:         'rgba(201, 64, 64, 0.08)',
  'network-error': 'rgba(201, 64, 64, 0.08)',
};

const iconColors = {
  empty:         'var(--color-mid, #b0aea5)',
  error:         'var(--color-error, #c94040)',
  'network-error': 'var(--color-error, #c94040)',
};

export function EmptyState({
  icon,
  title,
  description,
  action,
  type = 'empty',
  id,
}: EmptyStateProps) {
  return (
    <div
      id={id}
      role="status"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '16px',
        padding: '64px 32px',
        textAlign: 'center',
      }}
    >
      {/* Icon container */}
      <div
        aria-hidden="true"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 64,
          height: 64,
          borderRadius: 16,
          backgroundColor: containerColors[type],
          color: iconColors[type],
          flexShrink: 0,
        }}
      >
        {icon}
      </div>

      {/* Text */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 280 }}>
        <h3
          style={{
            margin: 0,
            fontFamily: 'var(--font-display, Poppins, Arial, sans-serif)',
            fontSize: '16px',
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--color-ink, #141413)',
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-body, Lora, Georgia, serif)',
            fontSize: '14px',
            fontWeight: 400,
            lineHeight: 1.65,
            color: 'var(--color-mid, #b0aea5)',
          }}
        >
          {description}
        </p>
      </div>

      {/* CTA */}
      {action && (
        <Button
          variant={action.variant ?? 'secondary'}
          size="sm"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
