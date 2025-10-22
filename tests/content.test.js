// content.test.js
// --------------------------------------------------------------
// Näissä testeissä validoidaan me-sivun sisällön hakeminen ja tallennus.
// Testit kertovat, miten palvelin reagoi erilaisten sisältöpyyntöjen aikana.
// --------------------------------------------------------------

import request from 'supertest'
import fs from 'fs'
import path from 'path'
import jwt from 'jsonwebtoken'
import * as logger from '../src/services/logger.js'
import { DATA_DIR } from '../src/services/config.js'

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'testsecret'

let app
beforeAll(async () => {
  // Ladataan Express-sovellus kerran ennen testejä. Mockit asetetaan
  // yksittäisten testien sisällä.
  app = (await import('../src/services/server.js')).default
})

afterEach(() => {
  // Poistetaan mahdolliset jest.spyOn -mockit seuraavaa testiä varten.
  jest.restoreAllMocks()
})

describe('ME content endpoints', () => {
  test('GET /api/me returns JSON and logs success', async () => {
    // Simuloidaan olemassa olevaa tiedostoa ja varmistetaan, että logEvent
    // saa oikean viestin.
    const data = { content: 'Hello' }
    jest.spyOn(fs, 'existsSync').mockReturnValue(true)
    jest.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(data))
    const logSpy = jest.spyOn(logger, 'logEvent').mockImplementation(() => {})

    const res = await request(app).get('/api/me')

    expect(res.status).toBe(200)
    expect(res.body).toEqual(data)
    expect(logSpy).toHaveBeenCalledWith('📄 Me-välilehti haettu onnistuneesti')
  })

  test('POST /api/me without content returns 400', async () => {
    // Jos sisältö puuttuu, palvelin ilmoittaa virheestä.
    const token = jwt.sign({ username: 'owner', role: 'owner' }, process.env.JWT_SECRET)

    const res = await request(app)
      .post('/api/me')
      .set('Authorization', `Bearer ${token}`)
      .send({})

    expect(res.status).toBe(400)
  })

  test('POST /api/me with content writes file and returns 200', async () => {
    // Tässä tarkistetaan, että tallennus kirjoittaa oikeaan tiedostoon ja onnistuu.
    const token = jwt.sign({ username: 'owner', role: 'owner' }, process.env.JWT_SECRET)
    const writeSpy = jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {})
    jest.spyOn(logger, 'logEvent').mockImplementation(() => {})

    const payload = { content: 'New content' }
    const res = await request(app)
      .post('/api/me')
      .set('Authorization', `Bearer ${token}`)
      .send(payload)

    expect(res.status).toBe(200)
    expect(writeSpy).toHaveBeenCalledWith(
      path.join(DATA_DIR, 'me.json'),
      expect.stringContaining('New content'),
      'utf-8'
    )
  })
})