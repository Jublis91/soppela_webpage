import { useState, useEffect } from "react";

function Me() {
  const [content, setContent] = useState("");

  useEffect(() => {
    fetch("/me.txt")
      .then((response) => response.text())
      .then((text) => setContent(text))
      .catch((error) => console.error("Virhe ladattaessa tekstiä:", error));
  }, []);

  // Jäsennellään teksti ja sovelletaan CSS-luokkia
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
    <div className="p-4">
      <h1 className="text-heading">Me</h1>
      {renderText()}
    </div>
  );
}

export default Me;
