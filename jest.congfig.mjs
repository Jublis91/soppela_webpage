// jest.config.mjs
export default {
  testEnvironment: 'node',
  extensionsToTreatAsEsm: ['.js'],
  transform: {}, // ei muunnoksia, käytetään Node:n ESM-tukea
  reporters: ['default', '<rootDir>/tests/testLogger.js']
};
