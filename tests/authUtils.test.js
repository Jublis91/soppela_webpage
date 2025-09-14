/* eslint-env node */
/* global beforeEach, describe, test, expect, Buffer */
import { jest } from '@jest/globals'

class LocalStorageMock {
  constructor() {
    this.store = {}
  }
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(this.store, key) ? this.store[key] : null
  }
  setItem(key, value) {
    this.store[key] = value
  }
  removeItem(key) {
    delete this.store[key]
  }
  clear() {
    this.store = {}
  }
}

globalThis.localStorage = new LocalStorageMock()

const logEvent = jest.fn()
jest.unstable_mockModule('../src/services/loggerClient.js', () => ({ logEvent }))

const { getCurrentUser, isLoggedIn, hasEditRights, logout } = await import('../src/services/authUtils.js')

beforeEach(() => {
  localStorage.clear()
  jest.clearAllMocks()
})

function createToken(payload) {
  return `header.${Buffer.from(JSON.stringify(payload)).toString('base64')}.signature`
}

describe('getCurrentUser', () => {
  test('returns null without token', () => {
    expect(getCurrentUser()).toBeNull()
  })

  test('returns user from valid token', () => {
    const payload = { username: 'alice', role: 'admin' }
    localStorage.setItem('token', createToken(payload))
    expect(getCurrentUser()).toEqual(payload)
  })
})

describe('isLoggedIn', () => {
  test('reflects absence of token', () => {
    expect(isLoggedIn()).toBe(false)
  })

  test('reflects presence of token', () => {
    localStorage.setItem('token', 'tokenvalue')
    expect(isLoggedIn()).toBe(true)
  })
})

describe('hasEditRights', () => {
  test('true for admin role', () => {
    const payload = { username: 'admin', role: 'admin' }
    localStorage.setItem('token', createToken(payload))
    expect(hasEditRights()).toBe(true)
  })

  test('true for owner role', () => {
    const payload = { username: 'owner', role: 'owner' }
    localStorage.setItem('token', createToken(payload))
    expect(hasEditRights()).toBe(true)
  })

  test('false for other roles', () => {
    const payload = { username: 'user', role: 'user' }
    localStorage.setItem('token', createToken(payload))
    expect(hasEditRights()).toBe(false)
  })
})

describe('logout', () => {
  test('removes token and logs event', () => {
    const payload = { username: 'alice', role: 'user' }
    localStorage.setItem('token', createToken(payload))
    logout()
    expect(localStorage.getItem('token')).toBeNull()
    const lastCall = logEvent.mock.calls.at(-1)[0]
    expect(lastCall).toContain('Käyttäjä kirjautui ulos')
  })
})
