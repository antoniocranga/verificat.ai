import type { ReactNode } from 'react';

interface NavBarProps {
  children: ReactNode;
  id?: string;
  /** When true (set by scroll observer), applies glass blur background */
  scrolled?: boolean;
}

export function NavBar({ children, id, scrolled = false }: NavBarProps) {
  return (
    <nav
      id={id}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 64,
        backgroundColor: scrolled
          ? 'rgba(250, 249, 245, 0.85)'
          : 'transparent',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: scrolled
          ? '1px solid var(--color-subtle)'
          : '1px solid transparent',
        transition: 'background-color 200ms ease-out, border-color 200ms ease-out, backdrop-filter 200ms ease-out',
        fontFamily: 'var(--font-display)',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </nav>
  );
}
