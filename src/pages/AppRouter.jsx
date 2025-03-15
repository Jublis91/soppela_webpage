import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./Home";
import Soppela from "./Soppela";
import SoppelaText from "./SoppelaText";
import SoppelaImages from "./SoppelaImages";
import Me from "./Me";
import Portfolio from "./Portfolio";
import PortfolioText from "./PortfolioText";
import PortfolioImages from "./PortfolioImages";
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

// Navigaatio, jossa hallitaan erikseen Portfolio- ja Soppela-pudotusvalikot
function Navigation() {
  const [portfolioDropdown, setPortfolioDropdown] = useState(false);
  const [soppelaDropdown, setSoppelaDropdown] = useState(false);

  return (
    <nav className="nav-bar">
      <ul>
        <li><Link to="/">Etusivu</Link></li>
        <li><Link to="/me">Minä</Link></li>

        {/* Portfolio-pudotusvalikko */}
        <li
          className="dropdown"
          onMouseEnter={() => {
            console.log("Portfolio-pudotusvalikko avattu");
            setPortfolioDropdown(true);
          }}
          onMouseLeave={() => {
            console.log("Portfolio-pudotusvalikko suljettu");
            setPortfolioDropdown(false);
          }}
        >
          <Link to="/portfolio">Portfolio</Link>
          {portfolioDropdown && (
            <ul className="dropdown-menu">
              <li><Link to="/portfolio/text">Tekstit</Link></li>
              <li><Link to="/portfolio/images">Kuvat</Link></li>
            </ul>
          )}
        </li>

        {/* Soppela-pudotusvalikko */}
        <li
          className="dropdown"
          onMouseEnter={() => {
            console.log("Soppela-pudotusvalikko avattu");
            setSoppelaDropdown(true);
          }}
          onMouseLeave={() => {
            console.log("Soppela-pudotusvalikko suljettu");
            setSoppelaDropdown(false);
          }}
        >
          <Link to="/soppela">Soppela</Link>
          {soppelaDropdown && (
            <ul className="dropdown-menu">
              <li><Link to="/soppela/text">Tekstit</Link></li>
              <li><Link to="/soppela/images">Kuvat</Link></li>
            </ul>
          )}
        </li>

        <li><Link to="/contact">Ota yhteyttä</Link></li>
        <li><Link to="/book">Kirja</Link></li>
      </ul>
    </nav>
  );
}

function AppRouter() {
  const location = useLocation();
  const [showFooter, setShowFooter] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowFooter(window.scrollY > 100);
      console.log(`Käyttäjä skrollasi: window.scrollY = ${window.scrollY}`);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (showFooter) {
      console.log("Footer näkyy nyt");
    }
  }, [showFooter]);

  return (
    <>
      <RouteLogger />

      {/* ✅ Bannerikuva, joka näkyy jokaisella sivulla */}
      <div className="hero-container">
        <img src="/images/banner.jpg" alt="Yläkuva" className="hero-image" />
      </div>

      {/* ✅ Kiinteä navigointipalkki */}
      <Navigation />

      {/* ✅ Pääsisältö */}
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/me" element={<Me />} />

          {/* Portfolio-polut ja uudelleenohjaus */}
          <Route 
            path="/portfolio" 
            element={
              <>
                {console.log("Uudelleenohjaus -> /portfolio/text")}
                <Navigate to="/portfolio/text" replace />
              </>
            } 
          />
          <Route path="/portfolio/text" element={<PortfolioText />} />
          <Route path="/portfolio/images" element={<PortfolioImages />} />

          {/* Soppela-polut ja uudelleenohjaus */}
          <Route 
            path="/soppela" 
            element={
              <>
                {console.log("Uudelleenohjaus -> /soppela/text")}
                <Navigate to="/soppela/text" replace />
              </>
            } 
          />
          <Route path="/soppela/text" element={<SoppelaText />} />
          <Route path="/soppela/images" element={<SoppelaImages />} />

          <Route path="/contact" element={<Contact />} />
          <Route path="/book" element={<Book />} />
        </Routes>
      </main>

      {/* ✅ Footer näkyy vasta, kun skrollataan alas */}
      {showFooter && <Footer />}
    </>
  );
}

export default AppRouter;
