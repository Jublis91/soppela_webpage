import { useState, useEffect } from "react"
import { getCurrentUser } from '../services/authUtils'

function Me() {
  const user = getCurrentUser()
  const [content, setContent] = useState("")
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState("")
  const [profileImage, setProfileImage] = useState("/images/emma.jpg")

  // Haetaan me-sisältö
  useEffect(() => {
    fetch("http://localhost:3001/api/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.content) setContent(data.content)
        else console.error("❌ Ei sisältöä palvelimelta")
      })
      .catch((err) => console.error("❌ Virhe haettaessa sisältöä:", err))
  }, [])

  // Haetaan asetukset (profiilikuva)
  useEffect(() => {
    fetch("http://localhost:3001/api/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.ProfileImage) {
          setProfileImage(`/images/${data.ProfileImage}`)
        }
      })
      .catch((err) => console.error("❌ Virhe haettaessa profiilikuvaa:", err))
  }, [])

  // Tallennetaan muutokset palvelimelle
  const saveChanges = () => {
    fetch("http://localhost:3001/api/me", {
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
          console.log("✅ Tallennettu palvelimelle")
        } else {
          console.error("❌ Tallennus epäonnistui")
        }
      })
      .catch((err) => console.error("❌ Virhe tallennuksessa:", err))
  }

  // Renderöidään teksti HTML-elementteinä
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

  // Jos käyttäjä on kirjautunut, näytetään muokkausnappi
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
            (user && (user.role === 'admin' || user.role === 'owner')) ? (
              <>
                <textarea
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  rows={20}
                  style={{ width: "100%" }}
                />
                <br />
                <button onClick={saveChanges}>💾 Tallenna</button>
                <button onClick={() => setEditing(false)}>❌ Peruuta</button>
              </>
            ) : (
              <p>Sinulla ei ole oikeuksia muokata sisältöä.</p>
            )
          ) : (
            <>
              {renderText()}
              {(user && (user.role === 'admin' || user.role === 'owner')) && (
                <button onClick={() => {
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
