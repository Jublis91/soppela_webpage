/* eslint-env node, jest */
/* eslint no-undef: "off" */
// logger.test.js
// --------------------------------------------------------------
// Tämän tiedoston testit varmistavat, että palvelimen loggeri osaa luoda
// lokitiedoston ja lisätä viestejä oikeassa muodossa.
// --------------------------------------------------------------

import { jest } from '@jest/globals'
import path from 'path'

// Mockataan fs-moduuli, jotta voimme estää oikeat levykirjoitukset.
const appendFileMock = jest.fn((file, data, cb) => cb && cb(null))
const existsSyncMock = jest.fn()
const writeFileSyncMock = jest.fn()
const mkdirSyncMock = jest.fn()

// Mockataan koko fs-moduuli palauttamaan yllä määritellyt funktiot.
jest.unstable_mockModule('fs', () => ({
  __esModule: true,
  default: {
    appendFile: appendFileMock,
    existsSync: existsSyncMock,
    writeFileSync: writeFileSyncMock,
    mkdirSync: mkdirSyncMock
  },
  appendFile: appendFileMock,
  existsSync: existsSyncMock,
  writeFileSync: writeFileSyncMock,
  mkdirSync: mkdirSyncMock
}))

// importataan logger moduuli mockatun fs:n kanssa.
const { logEvent } = await import('../src/services/logger.js')

const logDir = path.resolve(process.cwd(), 'secure', 'logs')
const logPath = path.resolve(logDir, 'activity.log')

beforeEach(() => {
  jest.clearAllMocks()
})

test('creates log file if missing', () => {
  /// Kun tiedostoa ei ole, loggerin tulee luoda hakemisto ja tyhjä tiedosto.
  existsSyncMock.mockReturnValue(false)

  logEvent('Luodaan tiedosto')

  expect(mkdirSyncMock).toHaveBeenCalledWith(logDir, { recursive: true })
  expect(writeFileSyncMock).toHaveBeenCalledWith(logPath, '', 'utf8')
})

test('calls appendFile with correct message', () => {
  // Kun tiedosto on olemassa, viestin pitäisi päätyä appendFile-kutsuun
  // aikaleiman kanssa.
  existsSyncMock.mockReturnValue(true)
  jest.useFakeTimers().setSystemTime(new Date('2024-01-01T00:00:00Z'))

  logEvent('Testiviesti')

  expect(appendFileMock).toHaveBeenCalledWith(
    logPath,
    '[2024-01-01T00:00:00.000Z] Testiviesti\n',
    expect.any(Function)
  )

  jest.useRealTimers()
})