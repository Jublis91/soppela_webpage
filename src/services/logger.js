// logger.js

import fs from 'fs'
import path from 'path'
import { LOG_DIR, LOG_FILE } from './config.js'


const logFilePath = LOG_FILE
const logDirectory = LOG_DIR || path.dirname(logFilePath)

// Luo lokitiedosto hakemistorakenteineen, jos ei vielä ole
function ensureLogFile() {
  const dir = logDirectory
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, '', 'utf8')
  }
}

function defaultLogEventImplementation(message) {
  ensureLogFile()

  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}] ${message}\n`

  fs.appendFile(logFilePath, logMessage, (err) => {
    if (err) {
      console.error('❌ Lokin kirjoitus epäonnistui:', err)
    }
  })

  // Tulostetaan myös konsoliin
  console.log(logMessage.trim())
}

let currentLogEventImplementation = defaultLogEventImplementation

// Kirjoittaa tapahtuman lokiin aikaleiman kanssa
export function logEvent(message) {
  currentLogEventImplementation(message)
}

export function __setLogEventImplementation(fn) {
  if (typeof fn === 'function') {
    currentLogEventImplementation = fn
  }
}

export function __resetLogEventImplementation() {
  currentLogEventImplementation = defaultLogEventImplementation
}

export function __getLogEventImplementation() {
  return currentLogEventImplementation
}