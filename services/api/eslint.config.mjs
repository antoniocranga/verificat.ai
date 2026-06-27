// @ts-check
import globals from 'globals';
import tseslint from 'typescript-eslint';
import baseConfig from '@verificat/config/eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  ...baseConfig,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
);
