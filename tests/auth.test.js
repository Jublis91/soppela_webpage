import { jest } from '@jest/globals'
import request from 'supertest'
import express from 'express'
import bcrypt from 'bcrypt'

let app
let mockUsers
let fs

beforeEach(async () => {
  jest.resetModules()
  jest.clearAllMocks()

  mockUsers = [{
    username: 'testuser',
    passwordHash: bcrypt.hashSync('password123', 10),
    role: 'user',
    mustChangePassword: true
  }]

  jest.unstable_mockModule('fs', () => ({
    readFileSync: jest.fn(() => JSON.stringify(mockUsers)),
    writeFileSync: jest.fn((path, data) => {
      mockUsers = JSON.parse(data)
    })
  }))

  jest.unstable_mockModule('../src/services/logger.js', () => ({
    logEvent: jest.fn()
  }))

  process.env.JWT_SECRET = 'testsecret'

  fs = await import('fs')
  const authRoutes = (await import('../src/services/auth.js')).default

  app = express()
  app.use(express.json())
  app.use('/api', authRoutes)
})

describe('auth routes', () => {
  test('successful login with correct credentials', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'testuser', password: 'password123' })

    expect(res.status).toBe(200)
    expect(res.body.token).toBeDefined()
  })

  test('login fails with unknown user', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'unknown', password: 'password123' })

    expect(res.status).toBe(401)
  })

  test('login fails with wrong password', async () => {
    const res = await request(app)
      .post('/api/login')
      .send({ username: 'testuser', password: 'wrong' })

    expect(res.status).toBe(401)
  })

  test('change-password succeeds with correct old password and saves mustChangePassword false', async () => {
    const res = await request(app)
      .post('/api/change-password')
      .send({ username: 'testuser', oldPassword: 'password123', newPassword: 'newpass' })

    expect(res.status).toBe(200)
    expect(fs.writeFileSync).toHaveBeenCalled()

    const saved = JSON.parse(fs.writeFileSync.mock.calls[0][1])
    expect(saved[0].mustChangePassword).toBe(false)
    const valid = await bcrypt.compare('newpass', saved[0].passwordHash)
    expect(valid).toBe(true)
  })

  test('change-password fails with wrong old password', async () => {
    const res = await request(app)
      .post('/api/change-password')
      .send({ username: 'testuser', oldPassword: 'wrong', newPassword: 'newpass' })

    expect(res.status).toBe(401)
    expect(fs.writeFileSync).not.toHaveBeenCalled()
  })
})
