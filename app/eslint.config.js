// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    // Bulky AI rules (docs/frontend/EXECUTION-PROMPT.md C2, C9). Colour and spacing
    // literals are checked by scripts/check-tokens.mjs, run as part of `npm run lint`.
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'expo-glass-effect', message: 'No glass (C2). Depth comes from surface steps.' },
            { name: 'expo-symbols', message: 'Lucide icons only (C9).' },
          ],
        },
      ],
    },
  },
]);
