/* eslint-env node, jest */
import { jest } from '@jest/globals'
import supertest from 'supertest'
import jwt from 'jsonwebtoken'

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'testsecret'

const logEvent = jest.fn()
jest.unstable_mockModule('../src/services/logger.js', () => ({ logEvent }))

const realFs = (await import('fs')).default
const fsMock = {
  ...realFs,
  readdir: jest.fn(),
  mkdirSync: jest.fn(),
  unlink: jest.fn(),
  existsSync: jest.fn(),
  statSync: jest.fn()
}
jest.unstable_mockModule('fs', () => ({ default: fsMock }))

const multerMock = jest.fn(() => ({
  single: () => (req, res, next) => {
    req.file = { filename: 'uploaded.jpg' }
    next()
  }
}))
multerMock.diskStorage = jest.fn(() => ({}))
jest.unstable_mockModule('multer', () => ({ default: multerMock, diskStorage: multerMock.diskStorage }))

const { default: app } = await import('../src/services/server.js')
const request = supertest(app)

describe('images API', () => {
  beforeEach(() => {
    fsMock.readdir.mockReset()
    fsMock.mkdirSync.mockReset()
    fsMock.unlink.mockReset()
    fsMock.existsSync.mockReset()
    fsMock.statSync.mockReset()
    fsMock.existsSync.mockImplementation(() => true)
  })

  test('GET /api/folders palauttaa listan', async () => {

    const res = await request.get('/api/folders')

    expect(res.status).toBe(200)
    expect(res.body).toEqual(['portfolio_images', 'soppela_images'])
    expect(fsMock.existsSync).toHaveBeenCalled()
  })

  test('GET /api/images/:folder palauttaa listan', async () => {
    fsMock.readdir.mockImplementation((dir, cb) => {
      cb(null, ['img1.jpg', 'img2.png'])
    })
    fsMock.statSync.mockReturnValue({ mtime: new Date('2024-01-01T12:00:00Z') })

    const res = await request.get('/api/images/portfolio_images')

    expect(res.status).toBe(200)
    expect(res.body).toEqual([
      { path: '/images/portfolio_images/img1.jpg', updatedAt: '2024-01-01T12:00:00.000Z' },
      { path: '/images/portfolio_images/img2.png', updatedAt: '2024-01-01T12:00:00.000Z' }
    ])
    expect(fsMock.readdir).toHaveBeenCalled()
  })

  test('POST /api/images/:folder palauttaa 200 kun tiedosto ladattu', async () => {
    const token = jwt.sign({ username: 'owner', role: 'owner' }, process.env.JWT_SECRET)

    const res = await request
      .post('/api/images/portfolio_images')
      .set('Authorization', `Bearer ${token}`)
      .attach('image', Buffer.from('test'), 'test.jpg')

    expect(res.status).toBe(200)
    expect(res.body).toEqual({ success: true, filename: 'uploaded.jpg' })
  })

  test('DELETE /api/images/:folder/:filename poistaa tiedoston', async () => {
    fsMock.unlink.mockImplementation((path, cb) => cb(null))
    const token = jwt.sign({ username: 'owner', role: 'owner' }, process.env.JWT_SECRET)

    const res = await request
      .delete('/api/images/album/test.jpg')
      .set('Authorization', `Bearer ${token}`)

    expect(res.status).toBe(200)
    expect(fsMock.unlink).toHaveBeenCalled()
  })
})