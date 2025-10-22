/* eslint-env node */
// --------------------------------------------------------------
// Tämä tiedosto määrittelee sovelluksen konfiguraatiovakiot,
// kuten hakemistopolut ja JWT-salaisuuden hallinnan.
// --------------------------------------------------------------

import * as fs from 'fs'
import path from 'node:path'
import crypto from 'node:crypto'
import process from 'node:process'

// Määritellään sovelluksen juurihakemisto ja sen alihakemistot.
const ROOT_DIR = process.cwd()
const SECURE_DIRECTORY = path.resolve(ROOT_DIR, 'secure')
const PUBLIC_DIRECTORY = path.resolve(ROOT_DIR, 'public')
const DATA_DIRECTORY = path.join(PUBLIC_DIRECTORY, 'data')
const LOG_DIRECTORY = path.join(SECURE_DIRECTORY, 'logs')
const LOG_FILE_PATH = path.join(LOG_DIRECTORY, 'activity.log')
const USERS_FILE = path.join(SECURE_DIRECTORY, 'users.json')
const JWT_SECRET_FILE = path.join(SECURE_DIRECTORY, 'jwt.secret')

let cachedSecret

// Varmistaa, että hakemisto on olemassa.
function ensureDirectory(dir) {
  if (typeof fs.mkdirSync === 'function') {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// Luodaan tarvittavat hakemistot sovelluksen käynnistyessä.
ensureDirectory(SECURE_DIRECTORY)
ensureDirectory(LOG_DIRECTORY)
ensureDirectory(DATA_DIRECTORY)

function readSecretFromFile() {
  // Jos tiedostoa ei ole, palautetaan undefined
  if (typeof fs.existsSync !== 'function' || !fs.existsSync(JWT_SECRET_FILE)) {
    return undefined
  }

  const raw = fs.readFileSync(JWT_SECRET_FILE, 'utf8').trim()
  return raw || undefined
}

function writeSecretToFile(secret) {
  // Tallennetaan salaisuus tiedostoon
  try {
    ensureDirectory(SECURE_DIRECTORY)
    if (typeof fs.writeFileSync === 'function') {
      fs.writeFileSync(JWT_SECRET_FILE, `${secret}\n`, 'utf8')
    }
  } catch (error) {
    console.error(`⚠️ JWT-salaisuuden tallennus epäonnistui: ${error.message}`)
  }
}

// Hakee JWT-salaisuuden, luo sen jos puuttuu.
export function getJwtSecret() {
  if (cachedSecret && cachedSecret.trim()) {
    return cachedSecret
  }

  const envSecret = (process.env.JWT_SECRET ?? '').trim()
  if (envSecret) {
    // Käytetään ympäristömuuttujassa määritettyä salaisuutta
    cachedSecret = envSecret
    return cachedSecret
  }

  try {
    // Yritetään lukea salaisuus tiedostosta
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

export const SECURE_DIR = SECURE_DIRECTORY
export const DATA_DIR = DATA_DIRECTORY
export const LOG_DIR = LOG_DIRECTORY
export const LOG_FILE = LOG_FILE_PATH
export const USERS_FILE_PATH = USERS_FILE
export const JWT_SECRET_PATH = JWT_SECRET_FILE