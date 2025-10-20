// jest.config.mjs
export default {
  testEnvironment: 'node',
  transform: {},                 // käytä Node ESM:ää, ei transpilausta
  extensionsToTreatAsEsm: ['.js'],
  reporters: ['default', '<rootDir>/tests/testLogger.js'],
};