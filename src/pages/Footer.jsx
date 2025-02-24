function Footer() {
    console.log("Footer renderöity");
  
    return (
      <footer>
        <p>© 2025 Emma Nikander.</p>
        <p>Ota yhteyttä: <a href="S-posti osoite">s-posti osoite</a></p>
        <div className="footer-links">
          <a href="https://www.instagram.com/emmathestar?igsh=MXY0dnZncHV6bG4zZw%3D%3D&utm_source=qr">Instagram</a>
          <a href="https://fi.linkedin.com/in/emmathestar">LinkedIn</a>
          <a href="https://soppelassa.substack.com/">Kirjeitä Soppelasta</a>
        </div>
        <p>Sivun toteutti <a href="https://github.com/Jublis91" target="_blank" rel="noopener noreferrer">Juuso Nikander</a></p>
      </footer>
    );
  }
  
  export default Footer;