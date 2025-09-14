/* globals describe, test, expect, jest, beforeEach, afterEach */
/* eslint-env jest */
import jwt from 'jsonwebtoken'
import { requireAuth, requireRole } from '../src/services/middleware.js'

describe('requireAuth', () => {
  let req
  let res
  let next

  beforeEach(() => {
    req = { headers: {} }
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    next = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('returns 401 if Authorization header missing', () => {
    requireAuth(req, res, next)
    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  test('returns 401 if token invalid', () => {
    req.headers.authorization = 'Bearer invalid'
    jest.spyOn(jwt, 'verify').mockImplementation(() => {
      throw new Error('invalid token')
    })

    requireAuth(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(next).not.toHaveBeenCalled()
  })

  test('calls next when token valid', () => {
    req.headers.authorization = 'Bearer valid'
    const user = { username: 'alice', role: 'owner' }
    jest.spyOn(jwt, 'verify').mockReturnValue(user)

    requireAuth(req, res, next)

    expect(req.user).toEqual(user)
    expect(next).toHaveBeenCalled()
  })
})

describe('requireRole', () => {
  let res
  let next

  beforeEach(() => {
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    }
    next = jest.fn()
  })

  test('returns 403 for insufficient role', () => {
    const req = { user: { username: 'bob', role: 'user' } }
    const middleware = requireRole('owner')

    middleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(next).not.toHaveBeenCalled()
  })

  test.each([
    ['owner'],
    ['admin']
  ])('calls next when role is %s', (role) => {
    const req = { user: { username: 'bob', role } }
    const middleware = requireRole('owner')

    middleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })
})