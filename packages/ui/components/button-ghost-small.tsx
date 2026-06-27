/**
 * @deprecated Use <Button variant="ghost" size="sm" /> from './Button' instead.
 */
import { Button } from './Button';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonGhostSmallProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  id?: string;
}

export function ButtonGhostSmall({ children, id, ...props }: ButtonGhostSmallProps) {
  return (
    <Button variant="ghost" size="sm" id={id} {...props}>
      {children}
    </Button>
  );
}
