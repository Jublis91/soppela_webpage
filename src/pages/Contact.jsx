// Contact.jsx

import { useState } from "react"
import { logEvent } from "../services/loggerClient"  // 🔹 Lisää lokitus
import { API_URL } from "../services/apiConfig"

function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const [status, setStatus] = useState(null)

  // 🔹 Päivitä kentän arvo
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    logEvent(`✏️ Lomakekenttä '${name}' päivitetty arvoon: ${value}`)
  }

  // 🔹 Lähetä lomake backendille
  const handleSubmit = async (e) => {
    e.preventDefault()
    logEvent(`📨 Yritetään lähettää yhteydenottolomake käyttäjältä: ${formData.name}`)

    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()

      if (!res.ok) {
        setStatus({ success: false, message: data.error || "Lähetys epäonnistui" })
        logEvent(`❌ Yhteydenottolomakkeen lähetys epäonnistui: ${data.error || "Tuntematon virhe"}`)
      } else {
        setStatus({ success: true, message: "✅ Kiitos yhteydenotosta!" })
        logEvent(`✅ Yhteydenottolomake lähetetty: ${formData.name} <${formData.email}>`)
        setFormData({ name: "", email: "", message: "" })  // Tyhjennä lomake
      }
    } catch (err) {
      console.error("❌ Virhe lähetyksessä:", err)
      setStatus({ success: false, message: "Yhteysvirhe palvelimeen" })
      logEvent(`❌ Lomakkeen lähetys epäonnistui: ${err.message}`)
    }
  }

  // 🔹 Näytä lomake
  return (
    <div className="contact-container">
      <h1>Ota yhteyttä</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Nimi:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="email">Sähköposti:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label htmlFor="message">Viesti:</label>
          <textarea
            id="message"
            name="message"
            rows="4"
            value={formData.message}
            onChange={handleChange}
            required
          ></textarea>
        </div>

        {status && (
          <p style={{ color: status.success ? "green" : "red" }}>
            {status.message}
          </p>
        )}

        <button type="submit">Lähetä</button>
      </form>
    </div>
  )
}

export default Contact
