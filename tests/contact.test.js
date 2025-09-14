import request from 'supertest'
import nodemailer from 'nodemailer'
import app from '../src/services/server.js'

jest.mock('nodemailer', () => ({
  createTransport: jest.fn()
}))

const sendMailMock = jest.fn().mockResolvedValue({})

beforeEach(() => {
  nodemailer.createTransport.mockReturnValue({ sendMail: sendMailMock })
})

afterEach(() => {
  jest.clearAllMocks()
})

describe('POST /api/contact', () => {
  test('puuttuvat kentät → 400', async () => {
    const res = await request(app).post('/api/contact').send({ name: 'Test' })
    expect(res.status).toBe(400)
    expect(sendMailMock).not.toHaveBeenCalled()
  })

  test('validi viesti → 200 ja sendMail kutsutaan kerran', async () => {
    const res = await request(app).post('/api/contact').send({
      name: 'Test',
      email: 'test@example.com',
      message: 'Hello'
    })
    expect(res.status).toBe(200)
    expect(sendMailMock).toHaveBeenCalledTimes(1)
  })
})