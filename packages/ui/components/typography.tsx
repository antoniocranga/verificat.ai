import type { ReactNode, ElementType, CSSProperties } from 'react';

interface TypographyProps {
  children: ReactNode;
  as?: ElementType;
  id?: string;
  style?: CSSProperties;
  className?: string;
}

function createTypography(
  tag: ElementType,
  cssClass: string,
  inlineStyle: CSSProperties,
  displayName?: string,
) {
  const Component = ({
    children,
    as,
    id,
    style: inlineOverride,
    className = '',
  }: TypographyProps) => {
    const Tag = as || tag;
    return (
      <Tag
        id={id}
        className={`${cssClass} ${className}`.trim() || undefined}
        style={{ ...inlineStyle, ...inlineOverride }}
      >
        {children}
      </Tag>
    );
  };
  Component.displayName = displayName ?? `Typography(${String(tag)})`;
  return Component;
}

export const DisplayXL = createTypography(
  'h1',
  'heading-display',
  {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--font-size-display-xl)',
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.04em',
    margin: 0,
    color: 'var(--color-ink)',
  },
  'DisplayXL',
);

export const HeadingLg = createTypography(
  'h2',
  'heading-display',
  {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--font-size-heading-lg)',
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.04em',
    margin: 0,
    color: 'var(--color-ink)',
  },
  'HeadingLg',
);

export const HeadingMd = createTypography(
  'h3',
  'heading-section',
  {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--font-size-heading-md)',
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: '-0.025em',
    margin: 0,
    color: 'var(--color-ink)',
  },
  'HeadingMd',
);

export const LabelSm = createTypography(
  'span',
  '',
  {
    fontFamily: 'var(--font-display)',
    fontSize: 'var(--font-size-label-sm)',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '-0.01em',
    margin: 0,
  },
  'LabelSm',
);

export const BodyLg = createTypography(
  'p',
  'body-text',
  {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--font-size-body-lg)',
    fontWeight: 400,
    lineHeight: 1.75,
    letterSpacing: 0,
    margin: 0,
  },
  'BodyLg',
);

export const BodyMd = createTypography(
  'p',
  'body-text',
  {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--font-size-body-md)',
    fontWeight: 400,
    lineHeight: 1.75,
    letterSpacing: 0,
    margin: 0,
  },
  'BodyMd',
);

export const BodySm = createTypography(
  'p',
  'body-text',
  {
    fontFamily: 'var(--font-body)',
    fontSize: 'var(--font-size-body-sm)',
    fontWeight: 400,
    lineHeight: 1.65,
    letterSpacing: 0,
    margin: 0,
  },
  'BodySm',
);

export const MonoEyebrow = createTypography(
  'span',
  'label-text',
  {
    fontFamily: 'var(--font-mono)',
    fontSize: 'var(--font-size-mono-eyebrow)',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    margin: 0,
  },
  'MonoEyebrow',
);
