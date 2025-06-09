// Portfolio.jsx

import { Routes, Route, Link } from "react-router-dom"
import PortfolioText from "./PortfolioText"
import PortfolioImages from "./PortfolioImages"
import { getCurrentUser } from '../services/authUtils'

function Portfolio() {
  return (
    <div>
      <nav className="sub-nav">
        <ul>
          <li><Link to="text">Tekstit</Link></li>
          <li><Link to="images">Kuvat</Link></li>
        </ul>
      </nav>
      <h1>Portfolio</h1>

      {/* Reititys alisivuille */}
      <Routes>
        <Route path="text" element={<PortfolioText />} />
        <Route path="images" element={<PortfolioImages />} />
      </Routes>
    </div>
  );
}

export default Portfolio