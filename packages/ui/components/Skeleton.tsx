import type { CSSProperties } from 'react';
import './button.css'; // pulls token vars

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: CSSProperties;
}

export function Skeleton({
  width = '100%',
  height = 16,
  borderRadius = 8,
  className = '',
  style,
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`animate-shimmer ${className}`.trim()}
      style={{
        width,
        height,
        borderRadius,
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

/** Preset: text line skeleton */
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
      className={className}
      aria-hidden="true"
    >
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton
          key={i}
          height={14}
          width={i === lines - 1 ? '65%' : '100%'}
          borderRadius={6}
        />
      ))}
    </div>
  );
}

/** Preset: card skeleton */
export function SkeletonCard({ id }: { id?: string }) {
  return (
    <div
      id={id}
      aria-hidden="true"
      style={{
        borderRadius: 12,
        padding: 24,
        backgroundColor: 'var(--surface-raised, #ffffff)',
        border: '1px solid var(--color-subtle, #e8e6dc)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <Skeleton height={20} width="50%" borderRadius={6} />
      <SkeletonText lines={3} />
    </div>
  );
}
