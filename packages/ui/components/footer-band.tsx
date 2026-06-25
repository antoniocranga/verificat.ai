import type { ReactNode } from 'react';

interface FooterBandProps {
  children: ReactNode;
  id?: string;
}

const style: React.CSSProperties = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: 48,
  padding: '64px 24px',
  backgroundColor: '#fafafa',
  borderTop: '1px solid #ebebeb',
  fontFamily: "'Geist Sans', Arial, sans-serif",
  color: '#8f8f8f',
  fontSize: 14,
  lineHeight: 1.6,
};

export function FooterBand({ children, id }: FooterBandProps) {
  return <footer id={id} style={style}>{children}</footer>;
}
