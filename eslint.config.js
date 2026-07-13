// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    rules: {
      // Reanimated shared values are mutated by design (worklets / gesture
      // callbacks); this rule flags legitimate `sharedValue.value = ...` writes.
      'react-hooks/immutability': 'off',
      // The web color-scheme hook uses the standard SSR hydration pattern
      // (setState in a mount effect) shipped by the Expo template itself.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
]);
