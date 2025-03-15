import { useState } from 'react';

// Testiä varten kovakoodatut kuvat
const images = [
  '/images/portfolio_images/ape.JPEG',
  '/images/portfolio_images/IMG_0964.JPEG',
  '/images/portfolio_images/IMG_0966.JPEG',
  '/images/portfolio_images/IMG_1013.JPEG',
  '/images/portfolio_images/IMG_1741.JPEG',
];

export default function PortfolioImages() {
  const [selectedImage, setSelectedImage] = useState(null);

  return (
    <div className="soppela-images">
      <h1>Portfolio kuvat</h1>
      <div className="images">
        {images.map((src, index) => (
          <img
            key={index}
            src={src}
            alt={`Gallery Image ${index + 1}`}
            onClick={() => {
              console.log(`🖼️ Klikattiin kuvaa: ${src}`);
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
            src={selectedImage} 
            alt="Valittu kuva" 
            onLoad={() => console.log(`🔍 Näytetään valittu kuva: ${selectedImage}`)}
          />
          <button 
            onClick={() => {
              console.log(`❌ Suljetaan kuva: ${selectedImage}`);
              setSelectedImage(null);
            }}
          >
            Sulje
          </button>
        </div>
      )}
    </div>
  );
}
