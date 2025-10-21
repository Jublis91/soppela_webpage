+12-4
// --------------------------------------------------------------
// Tämän tiedoston tehtävä on käynnistää koko React-sovellus selaimessa.
// Käytännössä etsi sivulta HTML-elementti, jonka id on "root",
// ja piirrä sinne <App /> -komponentti.
// --------------------------------------------------------------

import { StrictMode } from 'react' // StrictMode auttaa huomaamaan kehitysaikaiset varoitukset ja virheet.
import { createRoot } from 'react-dom/client' // createRoot vastaa React-käyttöliittymän piirtämisestä selaimeen.
import './index.css' // Yleis-/globaalit tyylit, jotka koskevat koko sivustoa.
import App from './App.jsx' // Itse sovelluslogiikka (reititys, sivut, jne.).

// Tällä komennolla React piirtää käyttöliittymän näkyviin.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* StrictMode käy komponentit läpi kahdesti kehitystilassa ja varoittaa huonoista käytännöistä. */}
    <App />
  </StrictMode>,
)