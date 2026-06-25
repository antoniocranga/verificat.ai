import type { ReactNode } from 'react';

interface ButtonPrimaryProps {
  children: ReactNode;
  onClick?: () => void;
  id?: string;
}

const style: Record<string, React.CSSProperties> = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 44,
    padding: '0 14px',
    borderRadius: 100,
    border: 'none',
    backgroundColor: '#171717',
    color: '#ffffff',
    fontFamily: "'Geist Sans', Arial, sans-serif",
    fontSize: 16,
    fontWeight: 500,
    lineHeight: '20px',
    cursor: 'pointer',
    userSelect: 'none',
  },
};

export function ButtonPrimary({ children, onClick, id }: ButtonPrimaryProps) {
  return (
    <button id={id} style={style.base} onClick={onClick} type="button">
      {children}
    </button>
  );
}
