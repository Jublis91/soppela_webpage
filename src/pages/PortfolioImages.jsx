// PortfolioImages.jsx

import { useEffect, useState } from "react"
import { getCurrentUser } from '../services/authUtils'
import { logEvent } from '../services/loggerClient' // 🔁 Lokitus

const API_URL = import.meta.env.VITE_API_URL

export default function PortfolioImages() {
  const user = getCurrentUser()
  const [images, setImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [uploading, setUploading] = useState(false)

  const isEditor = user && (user.role === 'admin' || user.role === 'owner')

  // 🔁 Hakee kuvat palvelimelta
  const fetchImages = () => {
    fetch(`${API_URL}/api/images/portfolio_images`)
      .then((res) => res.json())
      .then((data) => {
        setImages(data)
        console.log("✅ Kuvat ladattu:", data)
        logEvent("[PortfolioImages] ✅ Kuvat ladattu onnistuneesti")
      })
      .catch((err) => {
        console.error("❌ Kuvien lataus epäonnistui:", err)
        logEvent(`[PortfolioImages] ❌ Kuvien lataus epäonnistui: ${err.message}`)
      })
  }

  // 📥 Haetaan kuvat komponentin latautuessa
  useEffect(() => {
    fetchImages()
  }, [])

  // ⬆️ Lähettää uuden kuvan palvelimelle
  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("image", file)

    setUploading(true)
    logEvent(`[PortfolioImages] ⬆️ Käyttäjä valitsi kuvan: ${file.name}`)

    fetch(`${API_URL}/api/images/portfolio_images`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${user?.token}`
      },
      body: formData,
    })
      .then((res) => res.json())
      .then(() => {
        console.log("✅ Kuva lisätty")
        logEvent(`[PortfolioImages] ✅ Kuva lisätty: ${file.name}`)
        fetchImages()
      })
      .catch((err) => {
        console.error("❌ Kuvan lisäys epäonnistui:", err)
        logEvent(`[PortfolioImages] ❌ Kuvan lisäys epäonnistui: ${err.message}`)
      })
      .finally(() => setUploading(false))
  }

  // 🗑️ Poistaa kuvan palvelimelta
  const handleDelete = (src) => {
    const filename = src.split("/").pop()

    logEvent(`[PortfolioImages] 🗑️ Poistetaan kuva: ${filename}`)

    fetch(`${API_URL}/api/images/portfolio_images/${filename}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${user?.token}`
      }
    })
      .then((res) => res.json())
      .then(() => {
        console.log(`🗑️ Kuva poistettu: ${filename}`)
        logEvent(`[PortfolioImages] 🗑️ Kuva poistettu: ${filename}`)
        fetchImages()
        if (selectedImage === src) setSelectedImage(null)
      })
      .catch((err) => {
        console.error("❌ Poistovirhe:", err)
        logEvent(`[PortfolioImages] ❌ Kuvan poisto epäonnistui: ${err.message}`)
      })
  }

  // 🖼️ Renderöi käyttöliittymän
  return (
    <div className="soppela-images">
      <h1>Portfolio kuvat</h1>

      {/* ✅ Kuvalataus näkyy vain ylläpitäjille */}
      {isEditor && (
        <>
          <input type="file" accept="image/*" onChange={handleUpload} />
          {uploading && <p>Ladataan kuvaa...</p>}
        </>
      )}

      {/* ✅ Näytettävät kuvat */}
      <div className="images">
        {images.map((image, index) => {
          const src = image.path || image
          const updatedAt = image.updatedAt || null
          return (
            <div key={index} className="image-wrapper">
              <img
                src={`${API_URL}${src}`}
                alt={`Gallery Image ${index + 1}`}
                onClick={() => {
                  console.log(`🖼️ Klikattiin kuvaa: ${src}`)
                  logEvent(`[PortfolioImages] 🖼️ Kuva avattu: ${src}`)
                  setSelectedImage(src)
                }}
              />
              {updatedAt && (
                <p className="timestamp">Viimeksi muokattu: {new Date(updatedAt).toLocaleString('fi-FI')}</p>
              )}
              {isEditor && (
                <button onClick={() => handleDelete(src)}>Poista</button>
              )}
            </div>
          )
        })}
      </div>

      {/* ✅ Valitun kuvan esikatselu */}
      {selectedImage && (
        <div className="selected-image">
          <img
            src={`${API_URL}${selectedImage}`}
            alt="Valittu kuva"
          />
          <button onClick={() => {
            setSelectedImage(null)
            logEvent("[PortfolioImages] Suljettiin suurennettu kuva")
          }}>
            Sulje
          </button>
        </div>
      )}
    </div>
  )
}
