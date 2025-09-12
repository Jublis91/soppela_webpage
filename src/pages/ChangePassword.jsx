//ChangePassword.jsx

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logEvent } from '../services/loggerClient'

const API_URL = import.meta.env.VITE_API_URL

export default function ChangePassword() {
  // 🔐 Salasanojen tilat
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  const navigate = useNavigate()
  const token = localStorage.getItem('token')

  // ❗ Jos ei ole kirjautunut → näytetään viesti
  if (!token) {
    logEvent("⚠️ Yritettiin vaihtaa salasanaa ilman kirjautumista")
    return <p>Sinun täytyy kirjautua ensin.</p>
  }

  const username = JSON.parse(atob(token.split('.')[1])).username

  // 📤 Lomakkeen lähetys
  const handleChange = async (e) => {
    e.preventDefault()

    // ✅ Varmistetaan että salasanat täsmää
    if (newPassword !== confirmPassword) {
      setError('Uudet salasanat eivät täsmää')
      logEvent("❌ Uudet salasanat eivät täsmää")
      return
    }

    try {
      logEvent(`🔐 Käyttäjä ${username} yrittää vaihtaa salasanaa`)

      const res = await fetch(`${API_URL}/api/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, oldPassword, newPassword })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Virhe salasanan vaihdossa')
        logEvent(`❌ Salasanan vaihto epäonnistui: ${data.error || "Tuntematon virhe"}`)
        return
      }

      setSuccess('✅ Salasana vaihdettu! Uudelleenohjataan...')
      logEvent(`✅ Käyttäjän ${username} salasana vaihdettu onnistuneesti`)

      // ⏳ Uudelleenohjaus hetken kuluttua
      setTimeout(() => navigate('/'), 2000)

    } catch (err) {
      console.error('❌ Virhe:', err)
      setError('Yhteysvirhe tai palvelin ei vastaa')
      logEvent(`❌ Yhteysvirhe salasanaa vaihdettaessa: ${err.message}`)
    }
  }

  return (
    <div className="change-password-container">
      <h2>Vaihda salasana</h2>

      <form onSubmit={handleChange}>
        <label>Vanha salasana</label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
          required
          placeholder="Vanha salasana"
        />

        <label>Uusi salasana</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          placeholder="Uusi salasana"
        />

        <label>Vahvista uusi salasana</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          placeholder="Vahvista uusi salasana"
        />

        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success && <p style={{ color: 'green' }}>{success}</p>}

        <button type="submit">Vaihda salasana</button>
      </form>
    </div>
  )
}
