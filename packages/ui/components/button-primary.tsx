/**
 * @deprecated Use <Button variant="primary" /> from './Button' instead.
 * Kept for backwards compatibility during migration.
 */
import { Button } from './Button';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonPrimaryProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  id?: string;
}

export function ButtonPrimary({ children, id, ...props }: ButtonPrimaryProps) {
  return (
    <Button variant="primary" size="md" id={id} {...props}>
      {children}
    </Button>
  );
}
