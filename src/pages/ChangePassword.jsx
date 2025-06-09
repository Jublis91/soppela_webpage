import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const navigate = useNavigate()

  const token = localStorage.getItem('token')
  if (!token) {
    return <p>Sinun täytyy kirjautua ensin.</p>
  }

  const username = JSON.parse(atob(token.split('.')[1])).username

  const handleChange = async (e) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setError('Uudet salasanat eivät täsmää')
      return
    }

    try {
      const res = await fetch('http://localhost:3001/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, oldPassword, newPassword })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Virhe salasanan vaihdossa')
        return
      }

      setSuccess('✅ Salasana vaihdettu! Uudelleenohjataan...')
      setTimeout(() => navigate('/'), 2000)
    } catch (err) {
      console.error('❌ Virhe:', err)
      setError('Yhteysvirhe tai palvelin ei vastaa')
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