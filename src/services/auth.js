import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import fs from 'fs'

const router = express.Router()

let users = JSON.parse(fs.readFileSync('data/users.json', 'utf8'))

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const user = users.find(u => u.username === username)
  if (!user) return res.status(401).json({ error: 'Virheelliset tunnukset' })

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return res.status(401).json({ error: 'Virheellinen salasana' })

  const token = jwt.sign({
    username: user.username,
    role: user.role,
    mustChangePassword: user.mustChangePassword
  }, 'SECRET', { expiresIn: '1h' })

  res.json({ token })
})

router.post('/change-password', async (req, res) => {
  const { username, oldPassword, newPassword } = req.body
  const userIndex = users.findIndex(u => u.username === username)
  if (userIndex === -1) return res.status(404).json({ error: 'Käyttäjää ei löydy' })

  const user = users[userIndex]
  const valid = await bcrypt.compare(oldPassword, user.passwordHash)
  if (!valid) return res.status(401).json({ error: 'Vanhalla salasanalla ei pääse' })

  const newHash = await bcrypt.hash(newPassword, 10)
  users[userIndex].passwordHash = newHash
  users[userIndex].mustChangePassword = false

  fs.writeFileSync('users.json', JSON.stringify(users, null, 2))
  users = JSON.parse(fs.readFileSync('users.json', 'utf8')) // päivitä muistista
  res.json({ message: 'Salasana vaihdettu onnistuneesti' })
})

export default router
