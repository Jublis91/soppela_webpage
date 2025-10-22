// Login.jsx
// --------------------------------------------------------------
// Tämä näkymä hoitaa käyttäjän kirjautumisen. Kommentit kuvaavat, miten
// lomake lukee kentät, lähettää tiedot palvelimelle ja reagoi erilaisiin
// vastauksiin (onnistuminen, virhe, pakollinen salasanan vaihto).
// --------------------------------------------------------------

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logEvent } from '../services/loggerClient'; // 🔁 Lokitus
import { API_URL } from "../services/apiConfig"

export default function Login() {
  // 🧠 Lomakkeen tilat – käyttäjän syöttämät arvot ja mahdollinen virheviesti.
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 🔐 Kirjautumisfunktio – kutsutaan lomakkeen submitissa.
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        // 📡 Lähetetään käyttäjän tunnus ja salasana palvelimelle JSON-muodossa.
        method: 'POST',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      // Vastauksen käsittely aloitetaan raakatekstinä, jotta mahdollinen
      // virheellinen JSON voidaan raportoida käyttäjälle selkeästi.
      const text = await res.text();
      console.log("📥 Raakavastaus:", text);
      let data;

      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error("❌ JSON-parsaus epäonnistui:", e.message);
        setError("Palvelimen vastaus ei ollut kelvollinen JSON");
        logEvent(`❌ JSON-parsaus epäonnistui kirjautuessa käyttäjälle "${username}"`);
        return;
      }

      // Palvelin voi palauttaa virheen, vaikka vastaus olisi JSON-muotoinen.
      if (!res.ok) {
        setError(data.error || 'Kirjautuminen epäonnistui');
        logEvent(`❌ Kirjautuminen epäonnistui käyttäjälle "${username}"`);
        return;
      }

      // 🔐 Tallenna token selaimeen
      localStorage.setItem('token', data.token);
      logEvent(`✅ Käyttäjä "${username}" kirjautui onnistuneesti`);

      const tokenPayload = JSON.parse(atob(data.token.split('.')[1]));

      // 🔁 Uudelleenohjaus salasanan vaihtoon, jos pakollinen
      if (tokenPayload.mustChangePassword) {
        logEvent(`⚠️ Käyttäjä "${username}" ohjattiin vaihtamaan salasana`);
        navigate('/vaihda-salasana');
      } else {
        navigate('/');
      }

    } catch (err) {
      // Puretaan JWT-tokeneista käyttökelpoinen tieto (esim. rooli, pakko vaihtaa salasana).
      console.error('❌ Virhe kirjautumisessa:', err);
      setError('Kirjautuminen epäonnistui. Yritä uudelleen.');
      logEvent(`❌ Kirjautumisen virhe käyttäjälle "${username}": ${err.message}`);
    }
  }

  return (
    <div className="contact-container">
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
  );
}
