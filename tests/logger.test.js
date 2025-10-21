/* eslint-env node, jest */
/* eslint no-undef: "off" */
import { jest } from '@jest/globals'
import path from 'path'

// Mocks for fs functions
const appendFileMock = jest.fn((file, data, cb) => cb && cb(null))
const existsSyncMock = jest.fn()
const writeFileSyncMock = jest.fn()
const mkdirSyncMock = jest.fn()

// Mock fs module
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

// Import the logger after mocking fs
const { logEvent } = await import('../src/services/logger.js')

const logDir = path.resolve(process.cwd(), 'secure', 'logs')
const logPath = path.resolve(logDir, 'activity.log')

beforeEach(() => {
  jest.clearAllMocks()
})

test('creates log file if missing', () => {
  // fs.existsSync should return false for directory and file
  existsSyncMock.mockReturnValue(false)

  logEvent('Luodaan tiedosto')

  expect(mkdirSyncMock).toHaveBeenCalledWith(logDir, { recursive: true })
  expect(writeFileSyncMock).toHaveBeenCalledWith(logPath, '', 'utf8')
})

test('calls appendFile with correct message', () => {
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