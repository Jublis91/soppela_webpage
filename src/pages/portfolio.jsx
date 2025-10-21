// Portfolio.jsx
// --------------------------------------------------------------
// Portfolio-osiolla on kaksi näkymää: tekstit ja kuvat. Tämä tiedosto
// näyttää pienen ylävalikon ja vaihtaa sisällön sen mukaan,
// mihin välilehteen käyttäjä klikkaa.
// --------------------------------------------------------------

import { Routes, Route, Link } from "react-router-dom"
import PortfolioText from "./PortfolioText"
import PortfolioImages from "./PortfolioImages"

function Portfolio() {
  return (
    <div>
      {/* Ala-navigaatio – sama idea kuin Soppela-sivulla. */}
      <nav className="sub-nav">
        <ul>
          <li><Link to="text">Tekstit</Link></li>
          <li><Link to="images">Kuvat</Link></li>
        </ul>
      </nav>
      <h1>Portfolio</h1>

      {/* Reititys alisivuille – riippuu URL-osoitteesta. */}
      <Routes>
        <Route path="text" element={<PortfolioText />} />
        <Route path="images" element={<PortfolioImages />} />
      </Routes>
    </div>
  )
}

export default Portfolio