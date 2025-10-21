// testLogger.js

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const logDir = path.join(__dirname, '..', 'secure', 'logs')
const logFile = path.join(logDir, 'test_log.txt')

class TestLogger {
  onRunStart() {
    fs.mkdirSync(logDir, { recursive: true })
    fs.writeFileSync(logFile, '')
  }

  onTestResult(test, testResult) {
    for (const result of testResult.testResults) {
      const { fullName, status } = result
      fs.appendFileSync(logFile, `${fullName} - ${status}\n`)
    }
  }
}

export default TestLogger