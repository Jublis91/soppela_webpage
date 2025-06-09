//Soppela.jsx

import { Routes, Route, Link } from "react-router-dom"
import SoppelaImages from "./SoppelaImages"
import SoppelaText from "./SoppelaText"
import { getCurrentUser } from '../services/authUtils'

function Soppela() {
  return (
    <div>
      <nav className="sub-nav">
        <ul>
          <li><Link to="text">Tekstit</Link></li>
          <li><Link to="images">Kuvat</Link></li>
        </ul>
      </nav>
      <h1>Soppela</h1>

      {/* Reititys alisivuille */}
      <Routes>
        <Route path="text" element={<SoppelaText />} />
        <Route path="images" element={<SoppelaImages />} />
      </Routes>
    </div>
  )
}

export default Soppela
