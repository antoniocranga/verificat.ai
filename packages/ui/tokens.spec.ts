import { tokens } from './tokens';

const expectedKeys: (keyof typeof tokens)[] = [
  'colorCanvas', 'colorCanvasElevated', 'colorInk', 'colorHairline', 'colorHairlineSoft',
  'colorBody', 'colorMute', 'colorFaint', 'colorLink', 'colorPrimary', 'colorOnPrimary',
  'colorError', 'colorWarning', 'colorSuccess',
  'verdictTrue', 'verdictMostlyTrue', 'verdictPartial',
  'verdictMisleading', 'verdictFalse', 'verdictUnverified',
  'meshCyan', 'meshBlue', 'meshViolet', 'meshMagenta', 'meshAmber',
  'spacingXxs', 'spacingXs', 'spacingSm', 'spacingMd', 'spacingLg',
  'spacingXl', 'spacing2xl', 'spacing3xl', 'spacing4xl', 'spacingSection',
  'roundedNone', 'roundedSm', 'roundedMd', 'roundedLg', 'roundedFull',
  'shadowWhisper', 'shadowFloating',
  'fontSans', 'fontMono',
  'fontSizeDisplayXl', 'fontWeightDisplayXl', 'lineHeightDisplayXl', 'letterSpacingDisplayXl',
  'fontSizeHeadingLg', 'fontWeightHeadingLg', 'lineHeightHeadingLg', 'letterSpacingHeadingLg',
  'fontSizeHeadingMd', 'fontWeightHeadingMd', 'lineHeightHeadingMd', 'letterSpacingHeadingMd',
  'fontSizeLabelSm', 'fontWeightLabelSm', 'lineHeightLabelSm', 'letterSpacingLabelSm',
  'fontSizeBodyLg', 'fontWeightBodyLg', 'lineHeightBodyLg', 'letterSpacingBodyLg',
  'fontSizeBodyMd', 'fontWeightBodyMd', 'lineHeightBodyMd', 'letterSpacingBodyMd',
  'fontSizeBodySm', 'fontWeightBodySm', 'lineHeightBodySm', 'letterSpacingBodySm',
  'fontSizeMonoEyebrow', 'fontWeightMonoEyebrow', 'lineHeightMonoEyebrow',
  'letterSpacingMonoEyebrow', 'textTransformMonoEyebrow',
];

describe('tokens', () => {
  it('should have all expected token keys', () => {
    for (const key of expectedKeys) {
      expect(tokens).toHaveProperty(key);
    }
  });

  it('should have at least 50 token keys', () => {
    expect(Object.keys(tokens).length).toBeGreaterThanOrEqual(50);
  });

  it('should have exact token values for key colours', () => {
    expect(tokens.colorCanvas).toBe('#fafafa');
    expect(tokens.colorInk).toBe('#171717');
    expect(tokens.colorHairline).toBe('#ebebeb');
    expect(tokens.colorBody).toBe('#4d4d4d');
  });
});
