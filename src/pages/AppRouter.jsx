// AppRouter.jsx

import { Routes, Route, Link, useLocation, Navigate } from "react-router-dom"
import { useEffect } from "react"

import Soppela from "./Soppela"
import SoppelaText from "./SoppelaText"
import SoppelaImages from "./SoppelaImages"
import Me from "./Me"
import Portfolio from "./Portfolio"
import PortfolioText from "./PortfolioText"
import PortfolioImages from "./PortfolioImages"
import Contact from "./Contact"
import Book from "./Book"
import Footer from "./Footer"

// Reittilokin komponentti
function RouteLogger() {
  const location = useLocation()
  useEffect(() => {
    console.log(`Navigoitu osoitteeseen: ${location.pathname}`)
  }, [location])
  return null
}

// Navigaatiopalkki
function Navigation() {
  return (
    <nav className="nav-bar">
      <ul>
        <li><Link to="/me">Emma</Link></li>
        <li className="dropdown">
          <Link to="/portfolio">Portfolio</Link>
          <ul className="dropdown-menu">
            <li><Link to="/portfolio/text">Tekstit</Link></li>
            <li><Link to="/portfolio/images">Kuvat</Link></li>
          </ul>
        </li>
        <li className="dropdown">
          <Link to="/soppela">Soppela</Link>
          <ul className="dropdown-menu">
            <li><Link to="/soppela/text">Tekstit</Link></li>
            <li><Link to="/soppela/images">Kuvat</Link></li>
          </ul>
        </li>
        <li><Link to="/contact">Ota yhteyttä</Link></li>
        <li><Link to="/book">Kirja</Link></li>
      </ul>
    </nav>
  );
}

function AppRouter() {
  return (
    <div className="page-container">
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
          <Route path="/" element={<Me />} />
          <Route path="/me" element={<Me />} />
          <Route path="/portfolio" element={<Navigate to="/portfolio/text" replace />} />
          <Route path="/portfolio/text" element={<PortfolioText />} />
          <Route path="/portfolio/images" element={<PortfolioImages />} />
          <Route path="/soppela" element={<Navigate to="/soppela/text" replace />} />
          <Route path="/soppela/text" element={<SoppelaText />} />
          <Route path="/soppela/images" element={<SoppelaImages />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/book" element={<Book />} />
        </Routes>
      </main>

      {/* ✅ Footer ei ole kiinteä, vaan sijoittuu sivun alareunaan */}
      <Footer />
    </div>
  )
}


export default AppRouter
