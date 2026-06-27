import type { ReactNode } from 'react';

interface NavLinkProps {
  children: ReactNode;
  href?: string;
  active?: boolean;
  onClick?: () => void;
  id?: string;
}

export function NavLink({ children, href, active, onClick, id }: NavLinkProps) {
  const Tag = href ? 'a' : 'button';
  const props = href ? { href } : { type: 'button' as const, onClick };

  return (
    <Tag
      id={id}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: 44,
        padding: '0 12px',
        borderRadius: 'var(--radius-sm, 6px)',
        border: 'none',
        backgroundColor: active ? 'var(--color-accent-soft, rgba(217,119,87,0.10))' : 'transparent',
        color: active ? 'var(--color-accent, #d97757)' : 'var(--color-ink, #141413)',
        fontFamily: 'var(--font-heading, var(--font-display, Poppins, Arial, sans-serif))',
        fontSize: 14,
        fontWeight: 500,
        lineHeight: '20px',
        cursor: 'pointer',
        userSelect: 'none',
        textDecoration: 'none',
        whiteSpace: 'nowrap',
        transition: 'background-color var(--transition-fast, 150ms ease-out), color var(--transition-fast, 150ms ease-out)',
      }}
      {...props}
    >
      {children}
    </Tag>
  );
}
