import type { ReactNode } from 'react';
import { Button } from "./ui/button";

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

const containerClasses = {
  empty: 'bg-muted/60 text-muted-foreground',
  error: 'bg-destructive/10 text-destructive',
  'network-error': 'bg-destructive/10 text-destructive',
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
      className="flex flex-col items-center justify-center gap-4 py-16 px-8 text-center"
    >
      {/* Icon container */}
      <div
        aria-hidden="true"
        className={`flex items-center justify-center w-16 h-16 rounded-2xl shrink-0 ${containerClasses[type]}`}
      >
        {icon}
      </div>

      {/* Text */}
      <div className="flex flex-col gap-1.5 max-w-[280px]">
        <h3 className="m-0 font-display text-base font-semibold tracking-tight text-foreground">
          {title}
        </h3>
        <p className="m-0 font-body text-sm font-normal leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      {/* CTA */}
      {action && (
        <Button
          variant={action.variant === 'secondary' ? 'secondary' : 'default'}
          size="sm"
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
