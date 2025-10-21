// PortfolioText.jsx

import { useEffect, useState } from "react"

function PortfolioText() {
  const [title, setTitle] = useState("Portfolio")
  const [intro, setIntro] = useState("")
  const [sections, setSections] = useState([])
  const [error, setError] = useState(null)

  useEffect(() => {
    let isMounted = true

    fetch("/data/portfolio.json")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Palvelin vastasi tilalla ${res.status}`)
        }
        return res.json()
      })
      .then((data) => {
        if (!isMounted) return
        setTitle(data.title ?? "Portfolio")
        setIntro(data.intro ?? "")
        setSections(Array.isArray(data.sections) ? data.sections : [])
      })
      .catch((err) => {
        if (!isMounted) return
        setError(err.message)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div>
      <h2>{title}</h2>
      {error ? (
        <p className="error">Tekstin lataus epäonnistui: {error}</p>
      ) : (
        <>
          {intro && <p>{intro}</p>}
          {sections.map((section, sectionIndex) => (
            <section key={`${section.heading ?? "osa"}-${sectionIndex}`}>
              {section.heading && <h3>{section.heading}</h3>}
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