//soppelaImages.jsx

import { useEffect, useState } from 'react'
import { getCurrentUser } from '../services/authUtils'
import { logEvent } from '../services/loggerClient'  // 🔁 Lisätty lokitus
import { API_URL } from "../services/apiConfig"
import { resolveImageUrl } from "../services/imageUtils"

export default function SoppelaImages() {
  const user = getCurrentUser()
  const [images, setImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [uploading, setUploading] = useState(false)

  const isEditor = user && (user.role === 'admin' || user.role === 'owner')

  // 📥 Hae kuvat palvelimelta
  const fetchImages = () => {
    console.log("[SoppelaImages] 🔄 Haetaan kuvat...")
    fetch(`${API_URL}/api/images/soppela_images`)
      .then((res) => res.json())
      .then((data) => {
        setImages(data)
        console.log("✅ Kuvat ladattu:", data)
        logEvent("[SoppelaImages] ✅ Kuvat haettu palvelimelta")
      })
      .catch((err) => {
        console.error("❌ Kuvien lataus epäonnistui:", err)
        logEvent(`[SoppelaImages] ❌ Kuvien lataus epäonnistui: ${err.message}`)
      })
  }

  // 🚀 Haetaan kuvat komponentin latautuessa
  useEffect(() => {
    fetchImages()
  }, [])

  // ⬆️ Käsittele uuden kuvan lataus
  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("image", file)

    console.log(`[SoppelaImages] ⬆️ Ladataan kuva: ${file.name}`)
    logEvent(`[SoppelaImages] ⬆️ Ladataan kuva: ${file.name}`)
    setUploading(true)

    fetch(`${API_URL}/api/images/soppela_images`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user?.token}`
      },
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Kuva lisätty:", data)
        logEvent(`[SoppelaImages] ✅ Kuva lisätty: ${file.name}`)
        fetchImages()
      })
      .catch((err) => {
        console.error("❌ Kuvan lisäys epäonnistui:", err)
        logEvent(`[SoppelaImages] ❌ Kuvan lisäys epäonnistui: ${err.message}`)
      })
      .finally(() => {
        setUploading(false)
      })
  }

  // 🗑️ Poista kuva
  const handleDelete = (src) => {
    const filename = src.split("/").pop()
    const url = `${API_URL}/api/images/soppela_images/${filename}`

    console.log(`[SoppelaImages] 🗑️ Poistetaan kuva: ${filename}`)
    logEvent(`[SoppelaImages] 🗑️ Käyttäjä poisti kuvan: ${filename}`)

    fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${user?.token}`
      }
    })
      .then((res) => res.json())
      .then(() => {
        console.log(`✅ Kuva poistettu: ${filename}`)
        logEvent(`[SoppelaImages] ✅ Kuva poistettu: ${filename}`)
        fetchImages()
        if (selectedImage === src) setSelectedImage(null)
      })
      .catch((err) => {
        console.error("❌ Poistovirhe:", err)
        logEvent(`[SoppelaImages] ❌ Kuvan poisto epäonnistui: ${err.message}`)
      })
  }

  // 📅 Muotoile päivämäärä suomeksi
  const formatDate = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleString("fi-FI", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // 🎨 Käyttöliittymä
  return (
    <div className="soppela-images">
      <h1>Soppelan kuvat</h1>

      {/* ✅ Kuvalataus vain admin/ownerille */}
      {isEditor && (
        <div className="upload-box">
          <input type="file" accept="image/*" onChange={handleUpload} />
          {uploading && <p>Ladataan kuvaa...</p>}
        </div>
      )}

      {/* ✅ Kaikki kuvat listattuna */}
      <div className="images">
        {images.map((imageObj, index) => {
          const src = imageObj.path || imageObj
          const imageUrl = resolveImageUrl(src)
          const updated = imageObj.updatedAt || null
          return (
            <div key={index} className="image-wrapper">
              <img
                src={imageUrl}
                alt={`Kuva ${index + 1}`}
                onClick={() => {
                  console.log(`🖼️ Klikattiin kuvaa: ${src}`)
                  logEvent(`[SoppelaImages] 🖼️ Käyttäjä avasi kuvan: ${src}`)
                  setSelectedImage(src)
                }}
              />
              {updated && (
                <p className="timestamp">Viimeksi muokattu: {formatDate(updated)}</p>
              )}
              {isEditor && (
                <button onClick={() => handleDelete(src)}>🗑️ Poista</button>
              )}
            </div>
          )
        })}
      </div>

      {/* ✅ Valitun kuvan suurennus */}
      {selectedImage && (
        <div className="selected-image">
          <img
            src={resolveImageUrl(selectedImage)}
            alt="Valittu kuva"
          />
          <button onClick={() => {
            console.log("[SoppelaImages] ❌ Suljetaan valittu kuva")
            logEvent("[SoppelaImages] ❌ Suljettiin suurennettu kuva")
            setSelectedImage(null)
          }}>
            Sulje
          </button>
        </div>
      )}
    </div>
  )
}
