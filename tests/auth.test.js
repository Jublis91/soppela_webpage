// auth.test.js
// --------------------------------------------------------------
// Nämä testit varmistavat, että kirjautumis- ja salasananvaihto-API:t
// käyttäytyvät oikein erilaisissa tilanteissa. Jokaisen testin yläpuolella
// kerrotaan lyhyesti mitä skenaariota se simuloi, jotta koodin tarkoitus
// on helppo hahmottaa myös aloittelijalle.
// --------------------------------------------------------------

import { jest } from '@jest/globals'
import request from 'supertest'
import express from 'express'
import bcrypt from 'bcrypt'

let app
let mockUsers
let fs

beforeEach(async () => {
  // Aloitetaan jokainen testi puhtaalta pöydältä: tyhjennetään jestin mockit
  // ja nollataan mahdolliset välimuistit.
  jest.resetModules()
  jest.clearAllMocks()

  // Luodaan oletuskäyttäjä, jota kirjautumistestit hyödyntävät.
  mockUsers = [{
    username: 'testuser',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'user',
    mustChangePassword: true
  }]

  // Mockataan tiedostojärjestelmän funktiot: näin testit eivät koskaan koske
  // todellisia tiedostoja levyillä.
  jest.unstable_mockModule('fs', () => ({
    readFileSync: jest.fn(() => JSON.stringify(mockUsers)),
    writeFileSync: jest.fn((path, data) => {
      mockUsers = JSON.parse(data)
    }),
    mkdirSync: jest.fn()
  }))

  // Lokitus korvataan tyhjällä mockilla, jotta testit pysyvät hiljaisina.
  jest.unstable_mockModule('../src/services/logger.js', () => ({
    logEvent: jest.fn()
  }))

  process.env.JWT_SECRET = 'testsecret'

  // Ladataan mockattu fs ja varsinaiset reitit vasta mockien jälkeen.
  fs = await import('fs')
  const authRoutes = (await import('../src/services/auth.js')).default

  // Rakennetaan pieni Express-sovellus, jota supertest voi kutsua.
  app = express()
  app.use(express.json())
  app.use('/api', authRoutes)
})

describe('auth routes', () => {
  test('successful login with correct credentials', async () => {
    // 1) Oikeilla tunnuksilla kirjautumisen pitäisi onnistua ja palauttaa token.
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'testuser', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
  })

  test('login fails with unknown user', async () => {
    // 2) Virheellinen käyttäjänimi → palvelin palauttaa 401 (unauthorized).
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'unknown', password: 'password123' })

    expect(res.status).toBe(401)
  })

  test('login fails with wrong password', async () => {
    // 3) Oikea käyttäjä mutta väärä salasana → myös 401.
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'testuser', password: 'wrong' })

    expect(res.status).toBe(401)
  })

  test('change-password succeeds with correct old password and saves mustChangePassword false', async () => {
    // 4) Onnistunut salasanan vaihto päivittää tiedoston ja kuittaa mustChangePassword.
    const login = await request(app)
      .post('/api/login')
      .send({ username: 'testuser', password: 'password123' })

    const token = login.body.token
    const res = await request(app)
      .post('/api/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ oldPassword: 'password123', newPassword: 'newpass' })

    expect(res.status).toBe(200)
    expect(fs.writeFileSync).toHaveBeenCalled()

    const saved = JSON.parse(fs.writeFileSync.mock.calls[0][1])
    expect(saved[0].mustChangePassword).toBe(false)
    const valid = await bcrypt.compare('newpass', saved[0].passwordHash)
    expect(valid).toBe(true)
  })

  test('change-password fails with wrong old password', async () => {
    // 5) Väärä vanha salasana → salasanaa ei tallenneta.
    const login = await request(app)
      .post('/api/login')
      .send({ username: 'testuser', password: 'password123' })

    const token = login.body.token

    const res = await request(app)
      .post('/api/change-password')
      .set('Authorization', `Bearer ${token}`)
      .send({ oldPassword: 'wrong', newPassword: 'newpass' })

    expect(res.status).toBe(401)
    expect(fs.writeFileSync).not.toHaveBeenCalled()
  })

  test('change-password fails without authentication', async () => {
    // 6) Ilman tokenia pyyntö estetään heti middleware-tasolla.
    const res = await request(app)
      .post('/api/change-password')
      .send({ oldPassword: 'password123', newPassword: 'newpass' })

    expect(res.status).toBe(401)
    expect(fs.writeFileSync).not.toHaveBeenCalled()
  })
})
