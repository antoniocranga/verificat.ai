import type { ReactNode } from 'react';

interface FeatureCardProps {
  children: ReactNode;
  shadow?: boolean;
  id?: string;
}

const baseStyle: React.CSSProperties = {
  borderRadius: 12,
  padding: 24,
  backgroundColor: '#ffffff',
  border: '1px solid #ebebeb',
  fontFamily: "'Geist Sans', Arial, sans-serif",
};

const shadowStyle: React.CSSProperties = {
  boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
};

export function FeatureCard({ children, shadow, id }: FeatureCardProps) {
  return (
    <div id={id} style={{ ...baseStyle, ...(shadow ? shadowStyle : {}) }}>
      {children}
    </div>
  );
}
