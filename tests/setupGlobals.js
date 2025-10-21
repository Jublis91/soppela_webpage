import { jest } from '@jest/globals'
import { createRequire } from 'module'

const require = createRequire(import.meta.url)

globalThis.jest = jest

const moduleMocks = new Map()
const realModules = new Map()
const customSpies = []

function getRealModule(specifier) {
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
    const mockExports = factory()
    moduleMocks.set(specifier, mockExports)

    const realModule = getRealModule(specifier)
    if (realModule && typeof realModule === 'object') {
      Object.keys(mockExports).forEach((key) => {
        realModule[key] = mockExports[key]
      })
    }
  }
  return originalMock(specifier, factory, options)
}

const originalSpyOn = jest.spyOn.bind(jest)
jest.spyOn = (target, property, accessType) => {
  if (target && target.__getLogEventImplementation && property === 'logEvent') {
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
      spy.mockRestore?.()
    } catch (error) {
      // ignore
    }
  }
}