// hash_passwords.js
// --------------------------------------------------------------
// Tämä skripti lukee käyttäjätiedot JSON-tiedostosta,
// hashkaa jokaisen käyttäjän salasanan bcryptillä
// ja tallentaa päivitetyt tiedot takaisin tiedostoon.
// --------------------------------------------------------------

import * as fs from 'fs'
import bcrypt from 'bcrypt'
import path from 'path'
import { USERS_FILE_PATH } from './config.js'

// Täydellinen polku users.json-tiedostoon turvallisesti konfiguroituna
const usersPath = path.resolve(USERS_FILE_PATH)

// Lue käyttäjät
let users = JSON.parse(fs.readFileSync(usersPath, 'utf8'))

async function hashPasswords() {
  // Käy läpi kaikki käyttäjät ja hashkaa heidän salasanansa
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
