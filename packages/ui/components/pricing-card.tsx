import type { ReactNode } from 'react';

interface PricingCardProps {
  children: ReactNode;
  id?: string;
}

const style: React.CSSProperties = {
  borderRadius: 16,
  padding: 32,
  backgroundColor: '#ffffff',
  border: '1px solid #ebebeb',
  fontFamily: "'Geist Sans', Arial, sans-serif",
};

export function PricingCard({ children, id }: PricingCardProps) {
  return (
    <div id={id} style={style}>
      {children}
    </div>
  );
}
