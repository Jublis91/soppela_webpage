// jest.config.mjs
// --------------------------------------------------------------
// Jest-konfiguraatio Node.js-ympäristöön, joka määrittää
// testien suoritusympäristön, muunnokset ja lokittamisen.
// --------------------------------------------------------------

export default {
  testEnvironment: 'node', // Käytetään Node.js-ympäristöä
  transform: {}, // Ei muunnoksia, koska käytetään tavallista JavaScriptiä
  extensionsToTreatAsEsm: ['.test.js'], // Käsitellään testitiedostot ESM:inä
  setupFilesAfterEnv: ['<rootDir>/tests/setupGlobals.js'], // Asetetaan globaalit ennen testejä
  reporters: ['default', '<rootDir>/tests/testLogger.js'], // Määritellään lokittaja
};