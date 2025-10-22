// contact.test.js
// --------------------------------------------------------------
// Testataan yhteydenottolomakkeen palvelinpäätä. Jokainen testi kuvaa, mitä
// tapahtuu kun lomake lähetetään puutteellisilla tai täydellisillä tiedoilla.
// --------------------------------------------------------------


import request from 'supertest'
import nodemailer from 'nodemailer'
import app from '../src/services/server.js'

jest.mock('nodemailer', () => ({
  createTransport: jest.fn()
}))

const sendMailMock = jest.fn().mockResolvedValue({})

beforeEach(() => {
  // Jokaisessa testissä palautetaan tuore mockattu sendMail-funktio.
  nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock })
})

afterEach(() => {
  // Nollataan kutsumäärät seuraavaa testiä varten.
  jest.clearAllMocks()
})

describe('POST /api/contact', () => {
  test('puuttuvat kentät → 400', async () => {
    // Jos sähköpostiosoite puuttuu, palvelimen pitää estää lähetys.
    const res = await request(app).post('/api/contact').send({ name: 'Test' })
    expect(res.status).toBe(400)
    expect(sendMailMock).not.toHaveBeenCalled()
  })

  test('validi viesti → 200 ja sendMail kutsutaan kerran', async () => {
    // Kun kaikki kentät ovat mukana, sähköposti lähtee eteenpäin.
    const res = await request(app).post('/api/contact').send({
      name: 'Test',
      email: 'test@example.com',
      message: 'Hello'
    })
    expect(res.status).toBe(200)
    expect(sendMailMock).toHaveBeenCalledTimes(1)
  })
})