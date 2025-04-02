// SoppelaImages.jsx

import { useState, useEffect } from 'react'

export default function SoppelaImages() {
  const [images, setImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)
  const [uploading, setUploading] = useState(false)

  // Lataa kuvat palvelimelta
  const fetchImages = () => {
    fetch("http://localhost:3001/api/images/soppela_images")
      .then((res) => res.json())
      .then((data) => {
        setImages(data)
        console.log("✅ Kuvat ladattu:", data)
      })
      .catch((err) => console.error("❌ Kuvien lataus epäonnistui:", err))
  }

  // Lataa kuvat komponentin latautuessa
  useEffect(() => {
    fetchImages()
  }, [])

  // Lataa kuva palvelimelle
  const handleUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("image", file)

    setUploading(true)

    // Lähetetään kuva palvelimelle
    fetch("http://localhost:3001/api/images/soppela_images", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then(() => {
        console.log("✅ Kuva lisätty")
        fetchImages()
      })
      .catch((err) => {
        console.error("❌ Kuvan lisäys epäonnistui:", err)
      })
      .finally(() => {
        setUploading(false)
      })
  }

  // Poista kuva palvelimelta
  const handleDelete = (src) => {
    const filename = src.split("/").pop()

    fetch(`http://localhost:3001/api/images/soppela_images/${filename}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then(() => {
        console.log(`🗑️ Kuva poistettu: ${filename}`)
        fetchImages()
        if (selectedImage === src) setSelectedImage(null)
      })
      .catch((err) => console.error("❌ Poistovirhe:", err))
  }
  
  // Renderöi kuvat
  return (
    <div className="soppela-images">
      <h1>Soppela kuvat</h1>

      <input type="file" accept="image/*" onChange={handleUpload} />
      {uploading && <p>Ladataan kuvaa...</p>}

      <div className="images">
        {images.map((src, index) => (
          <div key={index} className="image-wrapper">
            <img
              src={`http://localhost:3001${src}`}
              alt={`Gallery Image ${index + 1}`}
              onClick={() => {
                console.log(`🖼️ Klikattiin kuvaa: ${src}`)
                setSelectedImage(src)
              }}
            />
            <button onClick={() => handleDelete(src)}>Poista</button>
          </div>
        ))}
      </div>

      {/* Näytä valittu kuva */}
      {selectedImage && (
        <div className="selected-image">
          <img
            src={`http://localhost:3001${selectedImage}`}
            alt="Valittu kuva"
          />
          <button onClick={() => setSelectedImage(null)}>Sulje</button>
        </div>
      )}
    </div>
  )
}
