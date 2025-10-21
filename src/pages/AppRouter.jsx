// AppRouter.jsx

// --------------------------------------------------------------
// AppRouter on sovelluksen "liikennevalvonta".
// Se päättää mitä sivua näytetään missäkin osoitteessa ja
// rakentaa ylä- ja alatason navigaatiot.
// --------------------------------------------------------------

import { Routes, Route, Link, useLocation, Navigate, useNavigate } from "react-router-dom"
import { useEffect } from "react"
import Soppela from "./Soppela"
import SoppelaText from "./SoppelaText"
import SoppelaImages from "./SoppelaImages"
import Me from "./Me"
import PortfolioText from "./PortfolioText"
import PortfolioImages from "./PortfolioImages"
import Contact from "./Contact"
import Book from "./Book"
import Footer from "./Footer"
import Login from "./Login"
import ChangePassword from "./ChangePassword"
import { logEvent } from "../services/loggerClient"

// 🔹 Reittilokin komponentti (konsoli + palvelin)
// Tämä pieni komponentti kuuntelee selaimen osoitteen muutoksia.
// Aina kun käyttäjä siirtyy uudelle sivulle, kirjataan se näkyviin
// (sekä konsoliin että backend-lokiin).
function RouteLogger() {
  const location = useLocation()

  useEffect(() => {
    const msg = `Navigoitu osoitteeseen: ${location.pathname}`
    console.log(`📍 ${msg}`)
    logEvent(msg)  // 🔁 Lähetetään lokiin backendille
  }, [location])

  return null
}

// 🔹 Navigaatiopalkki (näkyy jokaisella sivulla)
// Navigation kokoaa sivuston päävalikon. Jokainen <Link> toimii kuin tavallinen
// <a>-tagi, mutta ilman sivun uudelleenlatausta.
function Navigation() {
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem("token")

  const handleLogout = () => {
    const user = localStorage.getItem("username") || "tuntematon"
    localStorage.removeItem("token")
    logEvent(`🔒 Käyttäjä ${user} kirjautui ulos`)
    navigate("/")
  }

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

        <li><Link to="/book">Kirja</Link></li>
        <li><Link to="/contact">Ota yhteyttä</Link></li>

        {isLoggedIn ? (
          <li><button onClick={handleLogout}>Kirjaudu ulos</button></li>
        ) : (
          <li><Link to="/login">Kirjaudu</Link></li>
        )}
      </ul>
    </nav>
  )
}

// 🔹 Sovelluksen reitityslogiikka
// AppRouter yhdistää kaiken yhteen: yläosan kuvan, valikon, sivujen sisällön ja footerin.
function AppRouter() {
  return (
    <div className="page-container">
      <RouteLogger />

      {/* ✅ Bannerikuva – näytetään jokaisen sivun yläosassa koristeena. */}
      <div className="hero-container">
        <img src="/images/banner.jpg" alt="Yläkuva" className="hero-image" />
      </div>

      {/* ✅ Navigaatiopalkki – käyttäjä pääsee siirtymään eri sivuille. */}
      <Navigation />

      {/* ✅ Pääsisältö – Routes tarkistaa osoitteen ja näyttää oikean komponentin. */}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/vaihda-salasana" element={<ChangePassword />} />
          <Route path="/" element={<Me />} />
          <Route path="/me" element={<Me />} />

          {/* Portfolio-alasivuohjaukset – /portfolio ohjataan oletuksena tekstisivulle. */}
          <Route path="/portfolio" element={<Navigate to="/portfolio/text" replace />} />
          <Route path="/portfolio/text" element={<PortfolioText />} />
          <Route path="/portfolio/images" element={<PortfolioImages />} />

          {/* Soppela-alasivuohjaukset – sama logiikka kuin portfoliolle. */}
          <Route path="/soppela" element={<Navigate to="/soppela/text" replace />} />
          <Route path="/soppela/text" element={<SoppelaText />} />
          <Route path="/soppela/images" element={<SoppelaImages />} />

          {/* Muut yksittäiset sivut kuten kirjaesittely ja yhteydenottolomake. */}
          <Route path="/book" element={<Book />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>

      {/* ✅ Sivun lopussa footer – sama joka sivulla. */}
      <Footer />
    </div>
  )
}

export default AppRouter
