// PortfolioImages.jsx

import { useEffect, useState } from "react"

export default function PortfolioImages() {
  const [images, setImages] = useState([])
  const [selectedImage, setSelectedImage] = useState(null)

  // Lataa kuvat palvelimelta
  useEffect(() => {
    fetch("http://localhost:3001/api/images/portfolio_images")
      .then((res) => res.json())
      .then((data) => {
        setImages(data)
        console.log("✅ Kuvat ladattu:", data)
      })
      .catch((err) => console.error("❌ Kuvien lataus epäonnistui:", err))
  }, [])

  return (
    <div className="soppela-images">
      <h1>Portfolio kuvat</h1>
      <div className="images">
        {images.map((src, index) => (
          <img
            key={index}
            src={`http://localhost:3001${src}`}
            alt={`Kuva ${index + 1}`}
            onClick={() => {
              console.log(`🖼️ Klikattiin kuvaa: ${src}`)
              setSelectedImage(src);
            }}
            onLoad={() => console.log(`✅ Kuva ladattu: ${src}`)}
            onError={() => console.error(`❌ Virhe ladattaessa kuvaa: ${src}`)}
          />
        ))}
      </div>

      {/* Näytä valittu kuva */}
      {selectedImage && (
        <div className="selected-image">
          <img
            src={`http://localhost:3001${selectedImage}`}
            alt="Valittu kuva"
            onLoad={() =>
              console.log(`🔍 Näytetään valittu kuva: ${selectedImage}`)
            }
          />
          <button
            onClick={() => {
              console.log(`❌ Suljetaan kuva: ${selectedImage}`)
              setSelectedImage(null)
            }}
          >
            Sulje
          </button>
        </div>
      )}
    </div>
  )
}
