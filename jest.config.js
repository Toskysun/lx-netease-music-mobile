/** @type {import('jest').Config} */
module.exports = {
  // Use @react-native/jest-preset which is bundled with react-native 0.73+
  // Falls back to a minimal transform config when preset is not available
  // (e.g. when node_modules is not installed).
  preset: 'react-native',
  setupFiles: ['./jest.setup.js'],
  testMatch: ['<rootDir>/__tests__/**/*.test.(ts|tsx|js|jsx)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-background-timer|react-native-track-player|react-native-fs|react-native-vector-icons|react-native-svg|react-native-pager-view|react-native-progress|react-native-quick-base64|react-native-quick-md5|react-native-video|react-native-webview|react-native-udp|rn-fetch-blob|@react-native-async-storage/async-storage|@react-native-clipboard/clipboard|@react-native-community/slider|@react-native-cookies/cookies|@craftzdog/react-native-buffer|react-native-navigation|react-native-exception-handler|react-native-local-media-metadata|react-native-file-system|message2call|lrc-file-parser)/)',
  ],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**',
    '!src/resources/**',
    '!src/lang/**',
  ],
  // Note: the correct key name is "coverageThreshold" (singular), not "coverageThresholds"
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30,
    },
  },
  testEnvironment: 'node',
  globals: {
    __DEV__: true,
  },
}
