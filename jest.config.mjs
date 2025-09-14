// jest.config.mjs
export default {
  testEnvironment: 'node',
  transform: {},                 // käytä Node ESM:ää, ei transpilausta
  reporters: ['default', '<rootDir>/tests/testLogger.js'],
  // (ei extensionsToTreatAsEsm-riviä)
};