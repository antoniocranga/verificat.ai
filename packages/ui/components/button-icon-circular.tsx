import type { ReactNode } from 'react';

interface ButtonIconCircularProps {
  children: ReactNode;
  onClick?: () => void;
  id?: string;
}

const style: Record<string, React.CSSProperties> = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 9999,
    border: 'none',
    backgroundColor: 'transparent',
    color: '#171717',
    cursor: 'pointer',
    userSelect: 'none',
  },
};

export function ButtonIconCircular({ children, onClick, id }: ButtonIconCircularProps) {
  return (
    <button id={id} style={style.base} onClick={onClick} type="button">
      {children}
    </button>
  );
}
