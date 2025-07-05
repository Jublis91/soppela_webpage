// logger.js

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

// Selvitetään nykyinen hakemisto turvallisesti (ESM-moduulien tapa)
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Lokitiedoston polku (voit muuttaa tämän halutessasi)
const logFilePath = path.resolve(__dirname, '../../logs/activity.log')

// Luo lokitiedosto hakemistorakenteineen, jos ei vielä ole
function ensureLogFile() {
  const dir = path.dirname(logFilePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  if (!fs.existsSync(logFilePath)) {
    fs.writeFileSync(logFilePath, '', 'utf8')
  }
}

// Kirjoittaa tapahtuman lokiin aikaleiman kanssa
export function logEvent(message) {
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
