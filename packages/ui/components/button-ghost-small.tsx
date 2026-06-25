import type { ReactNode } from 'react';

interface ButtonGhostSmallProps {
  children: ReactNode;
  onClick?: () => void;
  id?: string;
}

const style: Record<string, React.CSSProperties> = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 32,
    padding: '0 6px',
    borderRadius: 6,
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
};

export function ButtonGhostSmall({ children, onClick, id }: ButtonGhostSmallProps) {
  return (
    <button id={id} style={style.base} onClick={onClick} type="button">
      {children}
    </button>
  );
}
