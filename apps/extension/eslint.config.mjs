// @ts-check
import globals from 'globals';
import tseslint from 'typescript-eslint';
import baseConfig from '@verificat/config/eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'jest.config.cjs', '.wxt/**/*', '.output/**/*', 'entrypoints/offscreen/audio-processor.js'],
  },
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.webextensions,
      },
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
