// Login.jsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault()

        try {
            const res = await fetch('http://localhost:3001/api/login', {
                method: 'POST',
                headers: { 'Content-type': 'application/json' },
                body: JSON.stringify({ username, password })
            })

            const text = await res.text()
            console.log("📥 Raakavastaus:", text)
            let data
            try {
            data = JSON.parse(text)
            } catch (e) {
            console.error("❌ JSON-parsaus epäonnistui:", e.message)
            setError("Palvelimen vastaus ei ollut kelvollinen JSON")
            return
            }

            if (!res.ok) {
                setError(data.error || 'Kirjautuminen epäonnistui');
                return
            }

            localStorage.setItem('token', data.token);

            const tokenPayload = JSON.parse(atob(data.token.split('.')[1]))
            if (tokenPayload.mustChangePassword) {
                navigate('/vaihda-salasana');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error('❌ Virhe kirjautumisessa:', err);
            setError('Kirjautuminen epäonnistui. Yritä uudelleen.');
        }
    }

    return (
        <div className="login-container">
            <h2>Kirjaudu sisään</h2>
            <form onSubmit={handleLogin}>
                <div className="form-group">
                    <label>Käyttäjätunnus</label>
                    <input
                        type="text"
                        placeholder="Käyttäjätunnus"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Salasana</label>
                    <input
                        type="password"
                        placeholder="Salasana"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p className="error">{error}</p>}
                <button type="submit">Kirjaudu</button>
            </form>
        </div>
    )
}