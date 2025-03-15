import { useState, useEffect } from "react";

function Me() {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/me.txt")
      .then((response) => response.text())
      .then((text) => setContent(text))
      .catch((error) => console.error("Virhe ladattaessa tekstiä:", error));
  }, []);

  const renderText = () => {
    return content.split("\n").map((line, index) => {
      if (line.startsWith("# ")) {
        return <h2 key={index} className="text-heading">{line.slice(2)}</h2>;
      } else if (line.startsWith("## ")) {
        return <h3 key={index} className="text-subheading">{line.slice(3)}</h3>;
      } else if (line.trim() === "") {
        return <br key={index} />;
      } else if (line.startsWith("- ")) {
        return <ul key={index} className="text-list"><li>{line.slice(2)}</li></ul>;
      } else {
        return <p key={index} className="text-paragraph">{line}</p>;
      }
    });
  };

  return (
    <div className="me-container">
      <h1 className="me-title">Emma Nikander</h1>
      <div className="me-content">
        <img src="/images/soppela_images/IMG_3044.JPEG" alt="Kuva minusta" className="profile-image" />
        <div className="text-box">
          {renderText()}
        </div>
      </div>
    </div>
  );
}

export default Me;
