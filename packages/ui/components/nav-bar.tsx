import type { ReactNode } from 'react';

interface NavBarProps {
  children: ReactNode;
  id?: string;
}

const style: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: '#fafafa',
  borderBottom: '1px solid #ebebeb',
  padding: '0 24px',
  height: 64,
  fontFamily: "'Geist Sans', Arial, sans-serif",
  boxSizing: 'border-box',
};

export function NavBar({ children, id }: NavBarProps) {
  return <nav id={id} style={style}>{children}</nav>;
}
