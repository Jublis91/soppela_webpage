// Book.jsx

import { useState, useEffect } from "react"
import { getCurrentUser } from '../services/authUtils'
import { logEvent } from '../services/loggerClient'
import { API_URL } from '../services/apiConfig'

function Book() {
  const user = getCurrentUser()
  const [content, setContent] = useState("")
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState("")

  // 🔄 Haetaan sisältö sivun latautuessa
  useEffect(() => {
    logEvent("📖 Ladataan kirja-sivun sisältö")
    fetch(`/data/book.json`)
      .then((res) => res.json())
      .then((data) => {
        if (data.content) {
          setContent(data.content)
          logEvent("✅ Kirja-sisältö ladattu")
        } else {
          console.error("❌ Ei sisältöä palvelimelta")
          logEvent("❌ Kirja-sisältö puuttuu palvelimelta")
        }
      })
      .catch((err) => {
        console.error("❌ Virhe haettaessa sisältöä:", err)
        logEvent("❌ Virhe haettaessa kirja-sisältöä: " + err.message)
      })
  }, [])

  // 💾 Tallenna muokattu sisältö
  const saveChanges = () => {
    logEvent("💾 Yritetään tallentaa muokattua kirja-sisältöä")
    fetch(`${API_URL}/api/book`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(user?.token && { Authorization: `Bearer ${user.token}` })
      },
      body: JSON.stringify({ content: draft }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setContent(draft)
          setEditing(false)
          logEvent("✅ Kirja-sisältö tallennettu onnistuneesti")
        } else {
          console.error("❌ Tallennus epäonnistui")
          logEvent("❌ Kirja-sisällön tallennus epäonnistui")
        }
      })
      .catch((err) => {
        console.error("❌ Virhe tallennuksessa:", err)
        logEvent("❌ Virhe kirja-sisällön tallennuksessa: " + err.message)
      })
  }

  // 🔗 Muotoile teksti ja linkit
  const renderText = () => {
    const parseLinks = (text) => {
      const linkRegex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g
      const parts = []
      let lastIndex = 0
      let match

      while ((match = linkRegex.exec(text)) !== null) {
        const [fullMatch, linkText, url] = match
        const start = match.index
        if (start > lastIndex) parts.push(text.slice(lastIndex, start))
        parts.push(
          <a key={url + start} href={url} target="_blank" rel="noopener noreferrer">
            {linkText}
          </a>
        )
        lastIndex = start + fullMatch.length
      }

      if (lastIndex < text.length) parts.push(text.slice(lastIndex))
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
      <h1 className="me-title">Maailman paras maailma</h1>

      <div className="me-content">
        <img
          src="/images/emma.jpg"
          alt="Kirjan kansi"
          className="profile-image"
        />

        <div className="text-box">
          {editing ? (
            (user && (user.role === "owner" || user.role === "admin")) ? (
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
                  setEditing(false)
                  logEvent("❌ Muokkaus peruutettu")
                }}>❌ Peruuta</button>
              </>
            ) : (
              <p>Sinulla ei ole oikeuksia muokata sisältöä</p>
            )
          ) : (
            <>
              {renderText()}
              {(user && (user.role === "owner" || user.role === "admin")) && (
                <button onClick={() => {
                  setDraft(content)
                  setEditing(true)
                  logEvent("✏️ Muokkaustila avattu kirja-sisällölle")
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

export default Book
