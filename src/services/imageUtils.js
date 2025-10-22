// imageUtils.js
// --------------------------------------------------------------
// Tämä tiedosto sisältää apufunktion kuvapolkujen
// käsittelyyn ja täydentämiseen.
// --------------------------------------------------------------

import { API_URL } from "./apiConfig"

// Tarkistaa, onko polku jo täydellinen URL (sisältää protokollan).
function hasProtocol(path) {
  return /^(https?:)?\/\//i.test(path) || /^data:/i.test(path)
}

export function resolveImageUrl(path) {
  // Jos polku on tyhjä, palautetaan tyhjä merkkijono
  if (!path) {
    return ""
  }

  // Jos polku on jo täydellinen URL, palautetaan se sellaisenaan
  if (hasProtocol(path)) {
    return path
  }

  // Jos polku alkaa API_URL:llä, palautetaan se sellaisenaan
  if (API_URL && path.startsWith(API_URL)) {
    return path
  }

  const normalizedPath = path.startsWith("/") ? path : `/${path}`

  // Jos API_URL ei ole määritetty, palautetaan normaali polku
  if (!API_URL) {
    return normalizedPath
  }

  return `${API_URL}${normalizedPath}`
}
