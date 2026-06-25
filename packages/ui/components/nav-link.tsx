import type { ReactNode } from 'react';

interface NavLinkProps {
  children: ReactNode;
  href?: string;
  active?: boolean;
  onClick?: () => void;
  id?: string;
}

const style: Record<string, React.CSSProperties> = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    padding: '0 12px',
    borderRadius: 6,
    border: 'none',
    backgroundColor: 'transparent',
    color: '#4d4d4d',
    fontFamily: "'Geist Sans', Arial, sans-serif",
    fontSize: 14,
    fontWeight: 500,
    lineHeight: '20px',
    cursor: 'pointer',
    userSelect: 'none',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  },
  active: {
    backgroundColor: '#171717',
    color: '#ffffff',
  },
};

export function NavLink({ children, href, active, onClick, id }: NavLinkProps) {
  const Tag = href ? 'a' : 'button';
  const props = href ? { href } : { type: 'button' as const, onClick };
  return (
    <Tag id={id} style={{ ...style.base, ...(active ? style.active : {}) }} {...props}>
      {children}
    </Tag>
  );
}
