import Home from "./pages/Home";
import Soppela from "./pages/Soppela";
import Me from "./pages/Me";
import Portfolio from "./pages/Portfolio";
import Contact from "./pages/Contact";
import Book from "./pages/Book";

import { BrowserRouter as Router, Routes, Route, Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import './App.css';

function Footer() {
  console.log("Footer renderöity"); // Debug: Tulostaa aina kun footer renderöityy

  return (
    <footer>
      <p>© 2025 Emma Nikander.</p>
      <p>Ota yhteyttä: <a href="S-posti osoite">s-posti osoite</a></p>
      <div className="footer-links">
        <a href="web osoite 1">Web osoite 1</a>
        <a href="web osoite 2">Web osoite 2</a>
      </div>
      <p>Sivun toteutti <a href="https://github.com/Jublis91" target="_blank" rel="noopener noreferrer">Juuso Nikander</a></p>
    </footer>
  );
}

// Komponentti seuraamaan reitin muutoksia ja loggaamaan ne
function RouteLogger() {
  const location = useLocation();

  useEffect(() => {
    console.log(`Navigoitu osoitteeseen: ${location.pathname}`);
  }, [location]);

  return null;
}

function App() {
  console.log("App-komponentti renderöity"); // Debug: Tulostaa aina kun App-komponentti renderöityy

  return (
    <Router>
      <RouteLogger /> {/* Seuraa reitin muutoksia */}
      <div>
        {/* Navigaatiopalkki */}
        <nav>
          <ul>
            <li>
              <Link to="/" onClick={() => console.log("Klikattu: Etusivu")}>
                Etusivu
              </Link>
            </li>
            <li>
              <Link to="/me" onClick={() => console.log("Klikattu: Minä")}>
                Minä
              </Link>
            </li>
            <li>
              <Link to="/portfolio" onClick={() => console.log("Klikattu: Portfolio")}>
                Portfolio
              </Link>
            </li>
            <li>
              <Link to="/soppela" onClick={() => console.log("Klikattu: Soppela")}>
                Soppela
              </Link>
            </li>
            <li>
              <Link to="/contact" onClick={() => console.log("Klikattu: Ota yhteyttä")}>
                Ota yhteyttä
              </Link>
            </li>
            <li>
              <Link to="/Book" onClick={() => console.log("Klikattu: Kirja")}>
                Kirja
              </Link>
            </li>
          </ul>
        </nav>

        {/* Reititys */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/me" element={<Me />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/soppela" element={<Soppela />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/Book" element={<Book />} />
        </Routes>

        {/* Alareuna Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
