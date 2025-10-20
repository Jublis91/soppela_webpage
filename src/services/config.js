/* eslint-env node */

import * as fs from 'fs'
import path from 'node:path'
import crypto from 'node:crypto'
import process from 'node:process'

const ROOT_DIR = process.cwd()
const DATA_DIRECTORY = path.resolve(ROOT_DIR, 'data')
const JWT_SECRET_FILE = path.join(DATA_DIRECTORY, 'jwt.secret')
let cachedSecret

function ensureDirectory(dir) {
  if (typeof fs.mkdirSync === 'function') {
    fs.mkdirSync(dir, { recursive: true })
  }
}

function readSecretFromFile() {
  if (typeof fs.existsSync !== 'function' || !fs.existsSync(JWT_SECRET_FILE)) {
    return undefined
  }

  const raw = fs.readFileSync(JWT_SECRET_FILE, 'utf8').trim()
  return raw || undefined
}

function writeSecretToFile(secret) {
  try {
    ensureDirectory(DATA_DIRECTORY)
    if (typeof fs.writeFileSync === 'function') {
      fs.writeFileSync(JWT_SECRET_FILE, `${secret}\n`, 'utf8')
    }
  } catch (error) {
    console.error(`⚠️ JWT-salaisuuden tallennus epäonnistui: ${error.message}`)
  }
}

export function getJwtSecret() {
  if (cachedSecret && cachedSecret.trim()) {
    return cachedSecret
  }

  const envSecret = (process.env.JWT_SECRET ?? '').trim()
  if (envSecret) {
    cachedSecret = envSecret
    return cachedSecret
  }

  try {
    const fileSecret = readSecretFromFile()
    if (fileSecret) {
      cachedSecret = fileSecret
      process.env.JWT_SECRET = fileSecret
      return cachedSecret
    }
  } catch (error) {
    console.error(`⚠️ JWT-salaisuuden lataus epäonnistui: ${error.message}`)
  }

  const newSecret = crypto.randomBytes(32).toString('hex')
  writeSecretToFile(newSecret)
  process.env.JWT_SECRET = newSecret
  cachedSecret = newSecret
  return cachedSecret
}

export const DATA_DIR = DATA_DIRECTORY
export const JWT_SECRET_PATH = JWT_SECRET_FILE