/* eslint-env node */
/* global beforeEach, describe, test, expect, Buffer */

// authUtils.test.js
// --------------------------------------------------------------
// Testit keskittyvät selaimen puolella toimivaan authUtils-moduuliin.
// Jokainen osio dokumentoi mitä toiminnallisuutta tarkastetaan, jotta
// testien lukija näkee heti "mitä ja miksi".
// --------------------------------------------------------------

import { jest } from '@jest/globals'

// Pieni localStorage-mock auttaa simuloimaan selaimen muistia Node-ympäristössä.
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

// Lokit korvataan mockilla, jotta testit eivät lähetä HTTP-pyyntöjä.
const logEvent = jest.fn()
jest.unstable_mockModule('../src/services/loggerClient.js', () => ({ logEvent }))

const { getCurrentUser, isLoggedIn, hasEditRights, logout } = await import('../src/services/authUtils.js')

beforeEach(() => {
  // Tyhjennetään mockattu localStorage ja lokikutsut ennen jokaista testiä.
  localStorage.clear()
  jest.clearAllMocks()
})

function createToken(payload) {
  // JWT-tokenia ei tarvitse allekirjoittaa testeissä: luodaan riittävän
  // realistinen merkkijono base64-enkoodatulla payloadilla.
  return `header.${Buffer.from(JSON.stringify(payload)).toString('base64')}.signature`
}

describe('getCurrentUser', () => {
  test('returns null without token', () => {
    // Kun tokenia ei ole, apufunktion tulee palauttaa null.
    expect(getCurrentUser()).toBeNull()
  })

  test('returns user from valid token', () => {
    // Kelvollinen token → palautetaan purettu payload.
    const payload = { username: 'alice', role: 'admin' }
    localStorage.setItem('token', createToken(payload))
    expect(getCurrentUser()).toEqual(payload)
  })
})

describe('isLoggedIn', () => {
  test('reflects absence of token', () => {
    // Ilman tokenia kirjautumistila on false.
    expect(isLoggedIn()).toBe(false)
  })

  test('reflects presence of token', () => {
    // Tokenin olemassaolo tulkitaan kirjautuneeksi käyttäjäksi.
    localStorage.setItem('token', 'tokenvalue')
    expect(isLoggedIn()).toBe(true)
  })
})

describe('hasEditRights', () => {
  test('true for admin role', () => {
    // Adminilla on aina muokkausoikeudet.
    const payload = { username: 'admin', role: 'admin' }
    localStorage.setItem('token', createToken(payload))
    expect(hasEditRights()).toBe(true)
  })

  test('true for owner role', () => {
    // Ownerilla samoin.
    const payload = { username: 'owner', role: 'owner' }
    localStorage.setItem('token', createToken(payload))
    expect(hasEditRights()).toBe(true)
  })

  test('false for other roles', () => {
    // Tavalliselta käyttäjältä muokkaus estetään.
    const payload = { username: 'user', role: 'user' }
    localStorage.setItem('token', createToken(payload))
    expect(hasEditRights()).toBe(false)
  })
})

describe('logout', () => {
  test('removes token and logs event', () => {
    // Uloskirjautuminen tyhjentää tokenin ja lähettää lokiviestin.
    const payload = { username: 'alice', role: 'user' }
    localStorage.setItem('token', createToken(payload))
    logout()
    expect(localStorage.getItem('token')).toBeNull()
    const lastCall = logEvent.mock.calls.at(-1)[0]
    expect(lastCall).toContain('Käyttäjä kirjautui ulos')
  })
})
