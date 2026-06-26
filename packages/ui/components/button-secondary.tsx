/**
 * @deprecated Use <Button variant="secondary" /> from './Button' instead.
 */
import { Button } from './Button';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonSecondaryProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  id?: string;
}

export function ButtonSecondary({ children, id, ...props }: ButtonSecondaryProps) {
  return (
    <Button variant="secondary" size="md" id={id} {...props}>
      {children}
    </Button>
  );
}
