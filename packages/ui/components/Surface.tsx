import type { ReactNode, CSSProperties } from 'react';
import './button.css'; // imports the token vars

type SurfaceElevation = 'base' | 'raised' | 'overlay' | 'inset';

interface SurfaceProps {
  children: ReactNode;
  elevation?: SurfaceElevation;
  radius?: 'sm' | 'md' | 'lg' | 'none';
  padding?: string | number;
  className?: string;
  id?: string;
  style?: CSSProperties;
}

const bgMap: Record<SurfaceElevation, string> = {
  base:    'var(--surface-base, #faf9f5)',
  raised:  'var(--surface-raised, #ffffff)',
  overlay: 'var(--surface-raised, #ffffff)',
  inset:   'var(--surface-inset, #f0ede6)',
};

const shadowMap: Record<SurfaceElevation, string | undefined> = {
  base:    undefined,
  raised:  'var(--shadow-sm)',
  overlay: 'var(--shadow-lg)',
  inset:   'inset 0 1px 4px rgba(20,20,19,0.06)',
};

const radiusMap = {
  none: '0px',
  sm:   'var(--rounded-sm, 6px)',
  md:   'var(--rounded-md, 12px)',
  lg:   'var(--rounded-lg, 16px)',
};

export function Surface({
  children,
  elevation = 'raised',
  radius = 'md',
  padding,
  className = '',
  id,
  style,
}: SurfaceProps) {
  const computedStyle: CSSProperties = {
    backgroundColor: bgMap[elevation],
    boxShadow: shadowMap[elevation],
    borderRadius: radiusMap[radius],
    padding: padding ?? undefined,
    ...style,
  };

  return (
    <div id={id} className={className} style={computedStyle}>
      {children}
    </div>
  );
}
