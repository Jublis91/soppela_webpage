// setupGlobals.js
// --------------------------------------------------------------
// Tämä tiedosto ajetaan ennen testejä. Se selittää, kuinka jestin mock- ja
// spy-toiminnallisuutta laajennetaan, jotta palvelimen loggeri voidaan
// testata turvallisesti. Kommentit johdattavat lukijan jokaisen vaiheen läpi.
// --------------------------------------------------------------


import { jest } from '@jest/globals'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

globalThis.jest = jest

const moduleMocks = new Map()
const realModules = new Map()
const customSpies = []

function getRealModule(specifier) {
  // Tallennetaan välimuistiin kerran ladattu Node-moduuli.
  if (!realModules.has(specifier)) {
    try {
      realModules.set(specifier, require(specifier))
    } catch (error) {
      realModules.set(specifier, null)
    }
  }
  return realModules.get(specifier)
}

globalThis.__JEST_MODULE_MOCKS__ = moduleMocks

const originalMock = jest.mock.bind(jest)
jest.mock = (specifier, factory, options) => {
  if (typeof specifier === 'string' && typeof factory === 'function') {
    // Säilötään mockattu moduuli, jotta sitä voidaan tarkastella testeissä.
    const mockExports = factory()
    moduleMocks.set(specifier, mockExports)

    const realModule = getRealModule(specifier)
    if (realModule && typeof realModule === 'object') {
      Object.keys(mockExports).forEach((key) => {
        // Päivitetään mahdollinen oikea moduuli samoilla mockatuilla arvoilla.
        realModule[key] = mockExports[key]
      })
    }
  }
  return originalMock(specifier, factory, options)
}

const originalSpyOn = jest.spyOn.bind(jest)
jest.spyOn = (target, property, accessType) => {
  if (target && target.__getLogEventImplementation && property === 'logEvent') {
    // Loggerin tapauksessa vaihdetaan sisäinen toteutus mockilla, jotta
    // spy voidaan palauttaa myöhemmin alkuperäiseen tilaansa.
    const originalImpl = target.__getLogEventImplementation()
    const spy = jest.fn((...args) => originalImpl(...args))
    target.__setLogEventImplementation(spy)
    spy.mockRestore = () => {
      target.__resetLogEventImplementation()
    }
    customSpies.push(spy)
    return spy
  }

  return originalSpyOn(target, property, accessType)
}

const originalRestoreAllMocks = jest.restoreAllMocks.bind(jest)
jest.restoreAllMocks = () => {
  originalRestoreAllMocks()
  while (customSpies.length > 0) {
    const spy = customSpies.pop()
    try {
      // Palautetaan mahdollinen logger-spy alkuperäiseen tilaansa.
      spy.mockRestore?.()
    } catch (error) {
      // ignore
    }
  }
}