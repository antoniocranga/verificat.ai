import type { ReactNode } from 'react';

interface LogoStripProps {
  children: ReactNode;
  id?: string;
}

const style: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 48,
  padding: '48px 24px',
  backgroundColor: '#fafafa',
  fontFamily: "'Geist Sans', Arial, sans-serif",
};

export function LogoStrip({ children, id }: LogoStripProps) {
  return <section id={id} style={style}>{children}</section>;
}
