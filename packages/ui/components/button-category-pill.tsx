import type { ReactNode } from 'react';

interface ButtonCategoryPillProps {
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
  id?: string;
}

const style: Record<string, React.CSSProperties> = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    padding: '0 12px',
    borderRadius: 64,
    border: '1px solid #ebebeb',
    backgroundColor: '#ffffff',
    color: '#4d4d4d',
    fontFamily: "'Geist Sans', Arial, sans-serif",
    fontSize: 14,
    fontWeight: 500,
    lineHeight: '20px',
    cursor: 'pointer',
    userSelect: 'none',
  },
  active: {
    backgroundColor: '#171717',
    color: '#ffffff',
    borderColor: '#171717',
  },
};

export function ButtonCategoryPill({ children, active, onClick, id }: ButtonCategoryPillProps) {
  return (
    <button
      id={id}
      style={{ ...style.base, ...(active ? style.active : {}) }}
      onClick={onClick}
      type="button"
    >
      {children}
    </button>
  );
}
