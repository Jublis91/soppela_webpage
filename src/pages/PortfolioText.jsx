// PortfolioText.jsx
// --------------------------------------------------------------
// Tämä komponentti hakee portfolion tekstisisällön JSON-tiedostosta ja
// renderöi sen otsikoina, ingressinä ja tekstilohkoina. Jokainen vaihe on
// kommentoitu, jotta on helppo nähdä mistä data tulee ja miten se päätyy
// ruudulle.
// --------------------------------------------------------------

import { useEffect, useState } from "react"

function PortfolioText() {
  // 🔁 Säilytetään palvelimelta haetut tekstiosiot tilassa.
  const [title, setTitle] = useState("Portfolio") // Ylätason otsikko.
  const [intro, setIntro] = useState("") // Lyhyt johdantoteksti.
  const [sections, setSections] = useState([]) // Varsinaiset sisältöosiot.
  const [error, setError] = useState(null) // Mahdollinen virheilmoitus näkymää varten.

  useEffect(() => {
    let isMounted = true // 🔒 Estetään tilapäivitys, jos komponentti on jo poistettu.

    // 📥 Haetaan JSON-tiedosto, joka sisältää portfolion tekstisisällön.
    fetch("/data/portfolio.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Palvelin vastasi tilalla ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        if (!isMounted) return // Komponentti ehti poistua → ei päivitetä tilaa.

        // ✅ Täydennetään puuttuvat kentät oletusarvoilla, jotta näkymä ei kaadu.
        setTitle(data.title ?? "Portfolio")
        setIntro(data.intro ?? "")
        setSections(Array.isArray(data.sections) ? data.sections : [])
      })
      .catch((err) => {
        if (!isMounted) return
        // ❌ Tallennetaan virhe, jotta käyttäjä näkee miksi sisältö puuttuu.
        setError(err.message)
      })

      // 🧹 Siivousfunktio: merkitään komponentti poistetuksi ennen kuin uusi data ehtii tulla.
    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div>
      <h2>{title}</h2>
      {error ? (
        // 🔴 Virhetilanteessa näytetään selkeä ilmoitus.
        <p className="error">Tekstin lataus epäonnistui: {error}</p>
      ) : (
        <>
          {/* ℹ️ Ingressi näytetään vain jos sitä on tarjolla. */}
          {intro && <p>{intro}</p>}

          {/* 🔄 Käydään jokainen tekstiosio läpi ja renderöidään alaotsikko sekä kappaleet. */}
          {sections.map((section, sectionIndex) => (
            <section key={`${section.heading ?? "osa"}-${sectionIndex}`}>
              {section.heading && <h3>{section.heading}</h3>}
              
              {/* Jokainen kappale muutetaan omaksi <p>-elementikseen. */}
              {(section.paragraphs ?? []).map((paragraph, paragraphIndex) => (
                <p key={paragraphIndex}>{paragraph}</p>
              ))}
            </section>
          ))}
        </>
      )}
    </div>
  )
}

export default PortfolioText