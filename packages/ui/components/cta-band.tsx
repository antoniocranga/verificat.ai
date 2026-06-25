import type { ReactNode } from 'react';

interface CTABandProps {
  children: ReactNode;
  id?: string;
}

const style: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 24,
  padding: '96px 24px',
  backgroundColor: '#fafafa',
  fontFamily: "'Geist Sans', Arial, sans-serif",
  textAlign: 'center',
};

export function CTABand({ children, id }: CTABandProps) {
  return <section id={id} style={style}>{children}</section>;
}
