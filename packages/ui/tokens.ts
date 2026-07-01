export const tokens = {
  /* ---- Color ---- */
  colorCanvas: '#f5f4ed',
  colorCanvasElevated: '#faf9f5',
  colorInk: '#141413',
  colorHairline: '#e8e6dc',
  colorHairlineSoft: '#e8e6dc',
  colorBody: '#141413',
  colorMute: '#b0aea5',
  colorFaint: '#b0aea5',
  colorLink: '#6a9bcc',
  colorPrimary: '#c96442',
  colorOnPrimary: '#ffffff',
  colorError: '#c94040',
  colorWarning: '#c98040',
  colorSuccess: '#788c5d',

  /* Verdict colours */
  verdictTrue: '#5a8a5a',
  verdictMostlyTrue: '#6a8a40',
  verdictPartial: '#b07030',
  verdictMisleading: '#b05a30',
  verdictFalse: '#c04040',
  verdictUnverified: '#b0aea5',

  /* Hero mesh stops */
  meshCyan: '#50e3c2',
  meshBlue: '#007cf0',
  meshViolet: '#7928ca',
  meshMagenta: '#eb367f',
  meshAmber: '#f9cb28',

  /* ---- Spacing ---- */
  spacingXxs: '4px',
  spacingXs: '8px',
  spacingSm: '12px',
  spacingMd: '16px',
  spacingLg: '24px',
  spacingXl: '32px',
  spacing2xl: '48px',
  spacing3xl: '64px',
  spacing4xl: '96px',
  spacingSection: '128px',

  /* ---- Border radius ---- */
  roundedNone: '0px',
  roundedSm: '6px',
  roundedMd: '12px',
  roundedLg: '16px',
  roundedFull: '100px',

  /* ---- Shadows ---- */
  shadowWhisper: '0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
  shadowFloating: '0 4px 12px 0 rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.1)',

  /* ---- Typography ---- */
  fontSans: "'Anthropic Sans', system-ui, sans-serif",
  fontMono: "'JetBrains Mono', 'Fira Code', monospace",
  fontSerif: "'Anthropic Serif', Georgia, serif",

  fontSizeDisplayXl: '72px',
  fontWeightDisplayXl: 600,
  lineHeightDisplayXl: 1.1,
  letterSpacingDisplayXl: '-2.4px',

  fontSizeHeadingLg: '48px',
  fontWeightHeadingLg: 600,
  lineHeightHeadingLg: 1.2,
  letterSpacingHeadingLg: '-1.28px',

  fontSizeHeadingMd: '32px',
  fontWeightHeadingMd: 600,
  lineHeightHeadingMd: 1.3,
  letterSpacingHeadingMd: '-0.4px',

  fontSizeLabelSm: '14px',
  fontWeightLabelSm: 500,
  lineHeightLabelSm: 1.4,
  letterSpacingLabelSm: '-0.28px',

  fontSizeBodyLg: '18px',
  fontWeightBodyLg: 400,
  lineHeightBodyLg: 1.6,
  letterSpacingBodyLg: '0px',

  fontSizeBodyMd: '16px',
  fontWeightBodyMd: 400,
  lineHeightBodyMd: 1.6,
  letterSpacingBodyMd: '0px',

  fontSizeBodySm: '14px',
  fontWeightBodySm: 400,
  lineHeightBodySm: 1.5,
  letterSpacingBodySm: '0px',

  fontSizeMonoEyebrow: '12px',
  fontWeightMonoEyebrow: 500,
  lineHeightMonoEyebrow: 1.4,
  letterSpacingMonoEyebrow: '0.08em',
  textTransformMonoEyebrow: 'uppercase',
} as const;

export type VerdictLabel =
  | 'True'
  | 'Mostly True'
  | 'Partially True'
  | 'Misleading'
  | 'False'
  | 'Unverified';

export const verdictColors: Record<VerdictLabel, string> = {
  True: tokens.verdictTrue,
  'Mostly True': tokens.verdictMostlyTrue,
  'Partially True': tokens.verdictPartial,
  Misleading: tokens.verdictMisleading,
  False: tokens.verdictFalse,
  Unverified: tokens.verdictUnverified,
};
