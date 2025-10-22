// apiConfig.js
// --------------------------------------------------------------
// Tämän moduulin tehtävä on määritellä, mihin osoitteeseen frontend lähettää
// API-kutsut. Kommentit kertovat vaihe vaiheelta, miten ympäristömuuttuja
// luetaan, siistitään ja miten apufunktio koostaa lopullisen URL-osoitteen.
// --------------------------------------------------------------

// Luetaan ympäristömuuttuja VITE_API_URL silloin kun ollaan selaimessa (import.meta).

const rawValue = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_URL : ''

function normalizeBaseUrl(value) {
  // Jos arvo ei ole merkkijono, palautetaan tyhjä merkkijono jotta vältytään virheiltä.
  if (typeof value !== 'string') {
    return ''
  }

  const trimmed = value.trim()
  // Tyhjä tai pelkistä välilyönneistä koostuva arvo → käsitellään tyhjänä.
  if (!trimmed) {
    return ''
  }
  // Poistetaan lopusta mahdolliset vinoviivat (/), jotta URL on siisti muodossa.
  return trimmed.replace(/\/+$/, '')
}

// Lopullinen perus-URL jota muut moduulit voivat käyttää.
export const API_URL = normalizeBaseUrl(rawValue)

export function createApiUrl(path = '') {
  // Varmistetaan, että polku alkaa kauttaviivalla ("/api" tms.).
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  // Palautetaan yhdistetty osoite, esim. https://example.com + /api/me.
  return `${API_URL}${normalizedPath}`
}