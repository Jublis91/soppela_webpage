import { Routes, Route, Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react"; // ✅ Lisätty useState

import Home from "./Home";
import Soppela from "./Soppela";
import Me from "./Me";
import Portfolio from "./Portfolio";
import Contact from "./Contact";
import Book from "./Book";
import Footer from "./Footer";

// Reittilokin komponentti
function RouteLogger() {
  const location = useLocation();
  useEffect(() => {
    console.log(`Navigoitu osoitteeseen: ${location.pathname}`);
  }, [location]);
  return null;
}

// ✅ Korjattu Navigaatiokomponentti (Portfolio-pudotusvalikko toimii!)
function Navigation() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <nav className="nav-bar">
      <ul>
        <li><Link to="/">Etusivu</Link></li>
        <li><Link to="/me">Minä</Link></li>

        {/* ✅ Portfolio-pudotusvalikko */}
        <li
          className="dropdown" /* 🔹 Korjattu className */
          onMouseEnter={() => setDropdownOpen(true)}
          onMouseLeave={() => setDropdownOpen(false)}
        >
          <Link to="/portfolio">Portfolio</Link>
          {dropdownOpen && (
            <ul className="dropdown-menu">
              <li><Link to="/portfolio/text">Tekstit</Link></li>
              <li><Link to="/portfolio/images">Kuvat</Link></li>
            </ul>
          )}
        </li>

        <li><Link to="/soppela">Soppela</Link></li>
        <li><Link to="/contact">Ota yhteyttä</Link></li>
        <li><Link to="/book">Kirja</Link></li>
      </ul>
    </nav>
  );
}

function AppRouter() {
  const location = useLocation();

  return (
    <>
      <RouteLogger />

      {/* Näytä kuva vain etusivulla */}
      {location.pathname === "/" && (
        <div className="hero-container">
          <img src="/images/banner.jpg" alt="Yläkuva" className="hero-image" />
        </div>
      )}

      {/* Kiinni kuvaan oleva navigointipalkki */}
      <Navigation />

      {/* Rullaava pääsisältö */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/me" element={<Me />} />
          <Route path="/portfolio/*" element={<Portfolio />} /> {/* ✅ Korjattu polku tukemaan ali-reittejä */}
          <Route path="/soppela" element={<Soppela />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/book" element={<Book />} />
        </Routes>
      </main>

      {/* Kiinteä Footer */}
      <Footer />
    </>
  );
}

export default AppRouter;
