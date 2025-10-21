// --------------------------------------------------------------
// Tämä tiedosto on koko React-sovelluksen lähtöpiste.
// 1. Otamme käyttöön reitityksen (eli sivulta toiselle siirtymisen).
// 2. Kääritään varsinainen sivurakenne <AppRouter /> -komponenttiin.
// 3. Lopuksi viedään App-komponentti, jotta muut tiedostot voivat käyttää sitä.
// --------------------------------------------------------------

import { BrowserRouter as Router } from "react-router-dom"; // React Router mahdollistaa "monen sivun" kokemuksen.
import AppRouter from "./pages/AppRouter"; // AppRouter kokoaa kaikki yksittäiset sivut (esim. Etusivu, Portfolio...).
import "./App.css"; // Tyylitiedosto, joka vaikuttaa koko sovellukseen.

function App() {
  // Tämä viesti auttaa meitä näkemään selaimen konsolista, että App on ladattu.
  console.log("App-komponentti renderöity");

  return (
    // Router tekee mahdolliseksi käyttää <Link> -komponentteja ja reittien vaihtoa ilman koko sivun päivitystä.
    <Router>
      {/* AppRouter vastaa siitä, mitä sisältöä näytetään eri osoitteissa. */}
      <AppRouter />
    </Router>
  );
}

export default App; // Tällä rivillä kerromme muille tiedostoille, että App-komponenttia voi käyttää.