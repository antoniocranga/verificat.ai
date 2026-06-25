import type { ReactNode } from 'react';

interface HeroBandProps {
  children: ReactNode;
  id?: string;
}

const style: React.CSSProperties = {
  position: 'relative',
  padding: '128px 24px',
  backgroundColor: '#fafafa',
  fontFamily: "'Geist Sans', Arial, sans-serif",
  overflow: 'hidden',
};

const gradientLayer: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  background: `
    radial-gradient(600px circle at 20% 50%, rgba(80, 227, 194, 0.12) 0%, transparent 70%),
    radial-gradient(600px circle at 40% 30%, rgba(0, 124, 240, 0.1) 0%, transparent 70%),
    radial-gradient(600px circle at 60% 70%, rgba(121, 40, 202, 0.1) 0%, transparent 70%),
    radial-gradient(600px circle at 75% 40%, rgba(235, 54, 127, 0.1) 0%, transparent 70%),
    radial-gradient(600px circle at 90% 60%, rgba(249, 203, 40, 0.1) 0%, transparent 70%)
  `,
  pointerEvents: 'none',
};

const contentStyle: React.CSSProperties = {
  position: 'relative',
  zIndex: 1,
};

export function HeroBand({ children, id }: HeroBandProps) {
  return (
    <section id={id} style={style}>
      <div style={gradientLayer} />
      <div style={contentStyle}>{children}</div>
    </section>
  );
}
