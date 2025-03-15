import { useState, useEffect } from "react";

export default function Footer() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop;
      const clientHeight = document.documentElement.clientHeight;

      console.log(`ScrollTop: ${scrollTop}, ClientHeight: ${clientHeight}, ScrollHeight: ${scrollHeight}`);

      if (scrollTop + clientHeight >= scrollHeight - 20) {
        if (!isVisible) {
          console.log("✅ Footer näkyy nyt");
        }
        setIsVisible(true);
      } else {
        if (isVisible) {
          console.log("❌ Footer piilotettu");
        }
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isVisible]);

  return (
    <footer className={`footer ${isVisible ? "visible" : "hidden"}`}>
      <p>© 2025 Emma Nikander.</p>
      <p>Ota yhteyttä: <a href="mailto:s-posti@esimerkki.com">s-posti@esimerkki.com</a></p>
      <div className="footer-links">
        <a href="https://www.instagram.com/emmathestar" target="_blank" rel="noopener noreferrer">Instagram</a>
        <a href="https://fi.linkedin.com/in/emmathestar" target="_blank" rel="noopener noreferrer">LinkedIn</a>
        <a href="https://soppelassa.substack.com/" target="_blank" rel="noopener noreferrer">Kirjeitä Soppelasta</a>
      </div>
      <p>Sivun toteutti <a href="https://github.com/Jublis91" target="_blank" rel="noopener noreferrer">Juuso Nikander</a></p>
    </footer>
  );
}
