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
    fontFamily: 'var(--font-display, Poppins, Arial, sans-serif)',
    fontSize: 'var(--font-size-display-xl, 72px)',
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.04em',
    margin: 0,
    color: 'var(--color-ink, #141413)',
  },
  'DisplayXL',
);

export const HeadingLg = createTypography(
  'h2',
  'heading-display',
  {
    fontFamily: 'var(--font-display, Poppins, Arial, sans-serif)',
    fontSize: 'var(--font-size-heading-lg, 48px)',
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.04em',
    margin: 0,
    color: 'var(--color-ink, #141413)',
  },
  'HeadingLg',
);

export const HeadingMd = createTypography(
  'h3',
  'heading-section',
  {
    fontFamily: 'var(--font-display, Poppins, Arial, sans-serif)',
    fontSize: 'var(--font-size-heading-md, 32px)',
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: '-0.025em',
    margin: 0,
    color: 'var(--color-ink, #141413)',
  },
  'HeadingMd',
);

export const LabelSm = createTypography(
  'span',
  '',
  {
    fontFamily: 'var(--font-display, Poppins, Arial, sans-serif)',
    fontSize: 'var(--font-size-label-sm, 14px)',
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
    fontFamily: 'var(--font-body, Lora, Georgia, serif)',
    fontSize: 'var(--font-size-body-lg, 18px)',
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
    fontFamily: 'var(--font-body, Lora, Georgia, serif)',
    fontSize: 'var(--font-size-body-md, 16px)',
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
    fontFamily: 'var(--font-body, Lora, Georgia, serif)',
    fontSize: 'var(--font-size-body-sm, 14px)',
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
    fontFamily: 'var(--font-mono, JetBrains Mono, monospace)',
    fontSize: 'var(--font-size-mono-eyebrow, 12px)',
    fontWeight: 500,
    lineHeight: 1.4,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    margin: 0,
  },
  'MonoEyebrow',
);
