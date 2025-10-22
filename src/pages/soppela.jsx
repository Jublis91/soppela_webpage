//Soppela.jsx
// --------------------------------------------------------------
// Tämä tiedosto kokoaa Soppela-osion, jossa on kaksi alisivua:
// 1) Tekstit ja 2) Kuvat. Käyttäjä voi vaihtaa välilehteä
// yläreunan pienestä navigaatiosta.
// --------------------------------------------------------------

import { Routes, Route, Link } from "react-router-dom"
import SoppelaImages from "./SoppelaImages"
import SoppelaText from "./SoppelaText"

function Soppela() {
  return (
    <div>
      {/* Ala-navigaatio näyttää nykyisen osion valinnat. */}
      <nav className="sub-nav">
        <ul>
          {/* Link-komponentti vaihtaa URL:ia ilman sivun uudelleenlatausta. */}
          <li><Link to="text">Tekstit</Link></li>
          <li><Link to="images">Kuvat</Link></li>
        </ul>
      </nav>
      <h1>Soppela</h1>

      {/* Reititys alisivuille – tarkistaa URL-osoitteen lopun ja näyttää oikean sisällön. */}
      <Routes>
        {/* /soppela/text näyttää tekstisisällön. */}
        <Route path="text" element={<SoppelaText />} />
        {/* /soppela/images näyttää kuvagallerian. */}
        <Route path="images" element={<SoppelaImages />} />
      </Routes>
    </div>
  )
}

export default Soppela
