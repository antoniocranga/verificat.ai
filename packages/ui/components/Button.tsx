import type { ReactNode, ButtonHTMLAttributes } from 'react';
import './button.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent' | 'destructive';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: ReactNode;
  children?: ReactNode;
  id?: string;
}

const sizeClass: Record<ButtonSize, string> = {
  sm:   'btn btn-sm',
  md:   'btn btn-md',
  lg:   'btn btn-lg',
  icon: 'btn btn-icon',
};

const variantClass: Record<ButtonVariant, string> = {
  primary:     'btn-primary',
  secondary:   'btn-secondary',
  ghost:       'btn-ghost',
  accent:      'btn-accent',
  destructive: 'btn-destructive',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  children,
  className = '',
  disabled,
  id,
  ...props
}: ButtonProps) {
  const classes = [
    sizeClass[size],
    variantClass[variant],
    className,
  ].filter(Boolean).join(' ');

  return (
    <button
      id={id}
      className={classes}
      disabled={disabled || loading}
      data-loading={loading ? 'true' : undefined}
      aria-busy={loading ? 'true' : undefined}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner" aria-hidden="true" />
      ) : leftIcon ? (
        <span className="btn-icon-slot" aria-hidden="true">{leftIcon}</span>
      ) : null}
      {children}
    </button>
  );
}
