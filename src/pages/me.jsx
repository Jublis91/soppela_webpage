// me.jsx

import { useState, useEffect } from "react"
import { getCurrentUser } from '../services/authUtils'
import { logEvent } from '../services/loggerClient' // 🔁 Lokitus

const API_URL = import.meta.env.VITE_API_URL

function Me() {
  const user = getCurrentUser()
  const [content, setContent] = useState("")
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState("")
  const [profileImage] = useState("/images/emma.jpg")

  const canEdit = user && (user.role === 'admin' || user.role === 'owner')

  // 📥 Haetaan "me"-sisältö palvelimelta
  useEffect(() => {
    console.log("[ME] 🚀 Haetaan tekstiä...")
    logEvent("[ME] Haetaan me-välilehden sisältöä")

    fetch(`${API_URL}/api/me`)
      .then((res) => res.json())
      .then((data) => {
        if (data.content) {
          setContent(data.content)
          console.log("[ME] ✅ Sisältö ladattu.")
          logEvent("[ME] Sisältö ladattu onnistuneesti")
        } else {
          console.warn("[ME] ⚠️ Sisältöä ei löytynyt.")
          logEvent("[ME] ⚠️ Sisältöä ei löytynyt")
        }
      })
      .catch((err) => {
        console.error("❌ Virhe haettaessa sisältöä:", err)
        logEvent(`[ME] ❌ Virhe haettaessa sisältöä: ${err.message}`)
      })
  }, [])

  // 💾 Tallennetaan muokattu sisältö palvelimelle
  const saveChanges = () => {
    if (!draft.trim()) {
      alert("⚠️ Sisältö ei voi olla tyhjä.")
      return
    }

    console.log("[ME] 💾 Tallennetaan palvelimelle...")
    logEvent("[ME] Yritetään tallentaa muokattua sisältöä")

    fetch(`${API_URL}/api/me`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user?.token}`
      },
      body: JSON.stringify({ content: draft }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setContent(draft)
          setEditing(false)
          console.log("✅ Tallennettu onnistuneesti.")
          logEvent("[ME] ✅ Muokattu sisältö tallennettu")
        } else {
          console.error("❌ Tallennus epäonnistui:", data.message || "Tuntematon virhe")
          logEvent(`[ME] ❌ Tallennus epäonnistui: ${data.message || "Tuntematon virhe"}`)
        }
      })
      .catch((err) => {
        console.error("❌ Virhe tallennuksessa:", err)
        logEvent(`[ME] ❌ Virhe tallennuksessa: ${err.message}`)
      })
  }

  // 🔠 Muotoillaan sisältö rivien ja linkkien perusteella
  const renderText = () => {
    const parseLinks = (text) => {
      const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g
      const parts = []
      let lastIndex = 0
      let match

      while ((match = linkRegex.exec(text)) !== null) {
        const [fullMatch, linkText, url] = match
        const start = match.index

        if (start > lastIndex) {
          parts.push(text.slice(lastIndex, start))
        }

        parts.push(
          <a key={url + start} href={url} target="_blank" rel="noopener noreferrer">
            {linkText}
          </a>
        )
        lastIndex = start + fullMatch.length
      }

      if (lastIndex < text.length) {
        parts.push(text.slice(lastIndex))
      }

      return parts
    }

    return content.split("\n").map((line, index) => {
      if (line.startsWith("# ")) {
        return <h2 key={index} className="text-heading">{parseLinks(line.slice(2))}</h2>
      } else if (line.startsWith("## ")) {
        return <h3 key={index} className="text-subheading">{parseLinks(line.slice(3))}</h3>
      } else if (line.trim() === "") {
        return <br key={index} />
      } else if (line.startsWith("- ")) {
        return <ul key={index} className="text-list"><li>{parseLinks(line.slice(2))}</li></ul>
      } else {
        return <p key={index} className="text-paragraph">{parseLinks(line)}</p>
      }
    })
  }

  return (
    <div className="me-container">
      <h1 className="me-title">Emma Nikander</h1>
      <h2 className="me-subtitle">Toimittaja</h2>
      <h2 className="me-subtitle">Valokuvaaja</h2>
      <h2 className="me-subtitle">Kirjailija</h2>

      <div className="me-content">
        <img
          src={profileImage}
          alt="Kuva minusta"
          className="profile-image"
        />

        <div className="text-box">
          {editing ? (
            canEdit ? (
              <>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={20}
                  style={{ width: "100%" }}
                />
                <br />
                <button onClick={saveChanges}>💾 Tallenna</button>
                <button onClick={() => {
                  console.log("[ME] ❌ Muokkaus peruutettu.")
                  logEvent("[ME] Muokkaus peruutettiin")
                  setEditing(false)
                }}>❌ Peruuta</button>
              </>
            ) : (
              <p>❌ Sinulla ei ole oikeuksia muokata sisältöä.</p>
            )
          ) : (
            <>
              {renderText()}
              {canEdit && (
                <button onClick={() => {
                  console.log("[ME] ✏️ Muokkaustila aktivoitu.")
                  logEvent("[ME] ✏️ Käyttäjä aloitti muokkauksen")
                  setDraft(content)
                  setEditing(true)
                }}>
                  ✏️ Muokkaa
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Me
