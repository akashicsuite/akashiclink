/**
 * Specific eslint rules for this app/package, extends the base rules
 * @see https://github.com/belgattitude/nextjs-monorepo-example/blob/main/docs/about-linters.md
 */

const {
  getDefaultIgnorePatterns,
} = require('@helium-pay/eslint-config-bases/helpers');

module.exports = {
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: 'tsconfig.json',
  },
  root: true,
  ignorePatterns: [
    ...getDefaultIgnorePatterns(),
    '.next',
    '.out',
    'extension',
    '**/*.mjs',
  ],
  extends: [
    '@helium-pay/eslint-config-bases/typescript',
    '@helium-pay/eslint-config-bases/sonar',
    '@helium-pay/eslint-config-bases/regexp',
    '@helium-pay/eslint-config-bases/react',
    '@helium-pay/eslint-config-bases/rtl',
    '@helium-pay/eslint-config-bases/prettier',
  ],
  rules: {
    '@typescript-eslint/naming-convention': 'off',
    'no-unused-private-class-members': 'error',
    'no-console': ['error', { allow: ['warn', 'error'] }],
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
  },
  overrides: [
    {
      files: [
        '**/*.stories.@(js|ts|jsx|tsx)',
        'storybook/**/*.@(js|ts|tsx|jsx)',
      ],
      rules: {
        'import/no-default-export': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        'react/display-name': 'off',
        'react-hooks/rules-of-hooks': 'off',
      },
    },
  ],
};
