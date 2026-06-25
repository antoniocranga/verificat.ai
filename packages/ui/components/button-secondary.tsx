import type { ReactNode } from 'react';

interface ButtonSecondaryProps {
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
    border: '1px solid #ebebeb',
    backgroundColor: '#ffffff',
    color: '#171717',
    fontFamily: "'Geist Sans', Arial, sans-serif",
    fontSize: 16,
    fontWeight: 500,
    lineHeight: '20px',
    cursor: 'pointer',
    userSelect: 'none',
  },
};

export function ButtonSecondary({ children, onClick, id }: ButtonSecondaryProps) {
  return (
    <button id={id} style={style.base} onClick={onClick} type="button">
      {children}
    </button>
  );
}
