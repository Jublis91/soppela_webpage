//auth.js
/* eslint-env node */
// --------------------------------------------------------------
// Tämä tiedosto käsittelee käyttäjien autentikoinnin ja salasanan
// vaihdon. Se tarjoaa reitit kirjautumiseen ja salasanan vaihtoon,
// sekä lukee ja kirjoittaa käyttäjätiedot turvallisesti levylle.
// --------------------------------------------------------------

import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import * as fs from 'fs'
import path from 'node:path'
import { logEvent } from './logger.js'
import { requireAuth } from './middleware.js'
import { USERS_FILE_PATH, getJwtSecret } from './config.js'

const router = express.Router()

// Lataa käyttäjätiedot levylta muistiin.
function loadUsersFromDisk() {
  try {
    if (typeof fs.existsSync === 'function' && !fs.existsSync(USERS_FILE_PATH)) {
      return []
    }

    const raw = fs.readFileSync(USERS_FILE_PATH, 'utf8').trim()
    if (!raw) {
      return []
    }

    return JSON.parse(raw)
  } catch (err) {
    logEvent(`❌ Käyttäjätiedoston lukeminen epäonnistui: ${err.message}`)
    return []
  }
}

let users = loadUsersFromDisk()

// Kirjautuminen käyttäjätunnuksilla
router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const user = users.find(u => u.username === username)

  if (!user) {
    // Käyttäjää ei löydy
    logEvent(`❌ Kirjautuminen epäonnistui – käyttäjää '${username}' ei löydy`)
    return res.status(401).json({ error: 'Virheelliset tunnukset' })
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    // Väärä salasana
    logEvent(`❌ Kirjautuminen epäonnistui – väärä salasana käyttäjälle '${username}'`)
    return res.status(401).json({ error: 'Virheellinen salasana' })
  }

  const jwtSecret = getJwtSecret()

  if (!jwtSecret) {
    // JWT-salaisuutta ei ole määritetty
    logEvent('❌ Kirjautuminen epäonnistui – JWT-salaisuutta ei voitu muodostaa')
    return res.status(500).json({ error: 'Kirjautuminen ei ole käytettävissä' })
  }


  const token = jwt.sign({
    // Käyttäjätiedot tokeniin
    username: user.username,
    role: user.role,
    mustChangePassword: user.mustChangePassword
  }, jwtSecret, { expiresIn: '1h' })
  logEvent(`🔓 Käyttäjä kirjautui sisään: ${user.username} (${user.role})`)
  res.json({ token })
})

// Salasanan vaihto käyttäjälle
router.post('/change-password', requireAuth, async (req, res) => {
  const { oldPassword, newPassword } = req.body
  const username = req.user.username

  if (!oldPassword || !newPassword) {
    // Puuttuvat tiedot
    logEvent(`⚠️ Käyttäjä ${username} yritti vaihtaa salasanan puutteellisilla tiedoilla`)
    return res.status(400).json({ error: 'Pakolliset kentät puuttuvat' })
  }

  const userIndex = users.findIndex(u => u.username === username)

  if (userIndex === -1) {
    // Käyttäjää ei löydy
    logEvent(`❌ Salasanan vaihto epäonnistui – käyttäjää '${username}' ei löydy`)
    return res.status(404).json({ error: 'Käyttäjää ei löydy' })
  }

  const user = users[userIndex]
  const valid = await bcrypt.compare(oldPassword, user.passwordHash)

  if (!valid) {
    // Väärä vanha salasana
    logEvent(`❌ Salasanan vaihto epäonnistui – väärä vanha salasana käyttäjälle '${username}'`)
    return res.status(401).json({ error: 'Vanhalla salasanalla ei pääse' })
  }

  const newHash = await bcrypt.hash(newPassword, 10)
  users[userIndex].passwordHash = newHash
  users[userIndex].mustChangePassword = false

  try {
    // Tallennetaan päivitetyt käyttäjätiedot levylle
    fs.mkdirSync(path.dirname(USERS_FILE_PATH), { recursive: true })
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(users, null, 2))
    users = loadUsersFromDisk()
    logEvent(`🔐 Salasana vaihdettu onnistuneesti käyttäjälle '${username}'`)
    res.json({ message: 'Salasana vaihdettu onnistuneesti' })
  } catch (err) {
    logEvent(`❌ Virhe salasanan tallennuksessa käyttäjälle '${username}': ${err.message}`)
    res.status(500).json({ error: 'Tallennus epäonnistui' })
  }
})

export default router
