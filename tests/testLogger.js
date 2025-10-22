// testLogger.js
// --------------------------------------------------------------
// Tämä on Jestin oma loggeri, joka kerää testien tulokset yhteen tiedostoon.
// Kommentit selittävät, missä vaiheessa tiedostoa alustetaan ja miten
// yksittäiset testitulokset kirjataan ylös.
// --------------------------------------------------------------

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const logDir = path.join(__dirname, '..', 'secure', 'logs')
const logFile = path.join(logDir, 'test_log.txt')

class TestLogger {
  onRunStart() {
    // Luodaan hakemisto ja tyhjennetään loki ennen ensimmäistä testiä.
    fs.mkdirSync(logDir, { recursive: true })
    fs.writeFileSync(logFile, '')
  }

  onTestResult(test, testResult) {
    // Jokaisesta testitulosrivistä muodostetaan luettava rivi (nimi + status).
    for (const result of testResult.testResults) {
      const { fullName, status } = result
      fs.appendFileSync(logFile, `${fullName} - ${status}\n`)
    }
  }
}

export default TestLogger