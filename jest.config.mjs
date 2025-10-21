// jest.config.mjs
export default {
  testEnvironment: 'node',
  transform: {},                 // käytä Node ESM:ää, ei transpilausta
  extensionsToTreatAsEsm: ['.test.js'],
  setupFilesAfterEnv: ['<rootDir>/tests/setupGlobals.js'],
  reporters: ['default', '<rootDir>/tests/testLogger.js'],
};