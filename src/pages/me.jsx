import { useState, useEffect } from "react";

function Me() {
  const [content, setContent] = useState("");

  useEffect(() => {
    console.log("📥 Aloitetaan /me.txt lataaminen...");

    fetch("/me.txt")
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Verkkovirhe: ${response.status} ${response.statusText}`);
        }
        console.log("✅ /me.txt ladattu onnistuneesti");
        return response.text();
      })
      .then((text) => {
        console.log("📄 Teksti ladattu, asetetaan sisältö...");
        setContent(text);
      })
      .catch((error) => console.error("❌ Virhe ladattaessa tekstiä:", error));
  }, []);

  const renderText = () => {
    console.log("🔍 Aloitetaan tekstin käsittely...");
    return content.split("\n").map((line, index) => {
      console.log(`📝 Käsitellään rivi ${index + 1}:`, line);

      if (line.startsWith("# ")) {
        console.log(`🔹 Muutetaan otsikoksi: ${line.slice(2)}`);
        return <h2 key={index} className="text-heading">{line.slice(2)}</h2>;
      } else if (line.startsWith("## ")) {
        console.log(`🔸 Muutetaan alaotsikoksi: ${line.slice(3)}`);
        return <h3 key={index} className="text-subheading">{line.slice(3)}</h3>;
      } else if (line.trim() === "") {
        console.log("⬜ Tyhjä rivi (lisätään <br>)");
        return <br key={index} />;
      } else if (line.startsWith("- ")) {
        console.log(`📌 Lisätään listaan: ${line.slice(2)}`);
        return <ul key={index} className="text-list"><li>{line.slice(2)}</li></ul>;
      } else {
        console.log(`📄 Muutetaan kappaleeksi: ${line}`);
        return <p key={index} className="text-paragraph">{line}</p>;
      }
    });
  };

  return (
    <div className="me-container">
      <h1 className="me-title">Emma Nikander</h1>
      <div className="me-content">
        <img 
          src="/images/soppela_images/IMG_3044.JPEG" 
          alt="Kuva minusta" 
          className="profile-image" 
          onLoad={() => console.log("🖼️ Profiilikuva ladattu")}
          onError={() => console.error("❌ Virhe ladattaessa profiilikuvaa")}
        />
        <div className="text-box">
          {renderText()}
        </div>
      </div>
    </div>
  );
}

export default Me;
