// hash_passwords.js

import fs from 'fs'
import bcrypt from 'bcrypt'
import path from 'path'
import { fileURLToPath } from 'url'

// Selvitetään nykyinen kansio turvallisesti
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Täydellinen polku users.json-tiedostoon suhteessa skriptiin
const usersPath = path.resolve(__dirname, '../../data/users.json')

// Lue käyttäjät
let users = JSON.parse(fs.readFileSync(usersPath, 'utf8'))

async function hashPasswords() {
  for (const user of users) {
    if (user.password && !user.passwordHash) {
      const hash = await bcrypt.hash(user.password, 10)
      user.passwordHash = hash
      delete user.password
      console.log(`✅ Salasana hashattu käyttäjälle: ${user.username}`)
    }
  }

  fs.writeFileSync(usersPath, JSON.stringify(users, null, 2), 'utf8')
  console.log('✅ Kaikki salasanat hashattu ja tallennettu tiedostoon.')
}

hashPasswords()
