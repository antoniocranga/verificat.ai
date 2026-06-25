import type { ReactNode, ElementType } from 'react';

interface TypographyProps {
  children: ReactNode;
  as?: ElementType;
  id?: string;
  style?: React.CSSProperties;
}

function createTypography(
  tag: ElementType,
  style: React.CSSProperties,
  defaultTag?: ElementType,
) {
  const Component = ({ children, as, id, style: inlineStyle }: TypographyProps) => {
    const Tag = as || defaultTag || tag;
    return <Tag id={id} style={{ ...style, ...inlineStyle }}>{children}</Tag>;
  };
  Component.displayName = `Typography(${tag})`;
  return Component;
}

export const DisplayXL = createTypography('h1', {
  fontFamily: "'Geist Sans', Arial, sans-serif",
  fontSize: 72,
  fontWeight: 600,
  lineHeight: 1.1,
  letterSpacing: '-2.4px',
  margin: 0,
});

export const HeadingLg = createTypography('h2', {
  fontFamily: "'Geist Sans', Arial, sans-serif",
  fontSize: 48,
  fontWeight: 600,
  lineHeight: 1.2,
  letterSpacing: '-1.28px',
  margin: 0,
});

export const HeadingMd = createTypography('h3', {
  fontFamily: "'Geist Sans', Arial, sans-serif",
  fontSize: 32,
  fontWeight: 600,
  lineHeight: 1.3,
  letterSpacing: '-0.4px',
  margin: 0,
});

export const LabelSm = createTypography('span', {
  fontFamily: "'Geist Sans', Arial, sans-serif",
  fontSize: 14,
  fontWeight: 500,
  lineHeight: 1.4,
  letterSpacing: '-0.28px',
  margin: 0,
});

export const BodyLg = createTypography('p', {
  fontFamily: "'Geist Sans', Arial, sans-serif",
  fontSize: 18,
  fontWeight: 400,
  lineHeight: 1.6,
  letterSpacing: 0,
  margin: 0,
});

export const BodyMd = createTypography('p', {
  fontFamily: "'Geist Sans', Arial, sans-serif",
  fontSize: 16,
  fontWeight: 400,
  lineHeight: 1.6,
  letterSpacing: 0,
  margin: 0,
});

export const BodySm = createTypography('p', {
  fontFamily: "'Geist Sans', Arial, sans-serif",
  fontSize: 14,
  fontWeight: 400,
  lineHeight: 1.5,
  letterSpacing: 0,
  margin: 0,
});

export const MonoEyebrow = createTypography('span', {
  fontFamily: "'Geist Mono', 'JetBrains Mono', monospace",
  fontSize: 12,
  fontWeight: 500,
  lineHeight: 1.4,
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  margin: 0,
});
