import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const logDir = path.join(__dirname, '..', 'logs')
const logFilePath = path.join(logDir, 'activity.log')

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true })
}

export function logEvent(message) {
  const timestamp = new Date().toISOString()
  const entry = `${timestamp} - ${message}\n`

  fs.appendFile(logFilePath, entry, err => {
    if (err) console.error('❌ Lokitus epäonnistui:', err.message)
  })
}
