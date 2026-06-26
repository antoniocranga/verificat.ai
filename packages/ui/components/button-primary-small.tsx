/**
 * @deprecated Use <Button variant="primary" size="sm" /> from './Button' instead.
 */
import { Button } from './Button';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonPrimarySmallProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  id?: string;
}

export function ButtonPrimarySmall({ children, id, ...props }: ButtonPrimarySmallProps) {
  return (
    <Button variant="primary" size="sm" id={id} {...props}>
      {children}
    </Button>
  );
}
