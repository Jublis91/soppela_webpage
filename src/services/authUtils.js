//authUtils.js
// --------------------------------------------------------------
// Tämä tiedosto sisältää apufunktioita käyttäjätietojen
// käsittelyyn JWT-tokenin avulla.
// --------------------------------------------------------------

import { logEvent } from './loggerClient.js'

// Palauttaa nykyisen käyttäjän tiedot JWT-tokenista.
// Jos tokenia ei ole tai se on virheellinen, palauttaa null.
export function getCurrentUser() {
  const token = localStorage.getItem('token')
  if (!token) {
    logEvent('ℹ️ Ei tokenia saatavilla – käyttäjä ei ole kirjautunut')
    return null
  }

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    logEvent(`👤 Käyttäjä tunnistettu: ${payload.username || 'tuntematon'}`)
    return payload
  } catch (err) {
    logEvent(`❌ Tokenin purku epäonnistui: ${err.message}`)
    return null
  }
}

// Tarkistaa onko käyttäjä kirjautunut sisään.
export function isLoggedIn() {
  const loggedIn = !!localStorage.getItem('token')
  logEvent(loggedIn ? '✅ Käyttäjä on kirjautuneena' : '❌ Käyttäjä ei ole kirjautuneena')
  return loggedIn
}

// Tarkistaa onko käyttäjällä oikeus (admin tai owner).
export function hasEditRights() {
  const user = getCurrentUser()
  const hasRights = user && (user.role === 'admin' || user.role === 'owner')
  logEvent(hasRights
    ? `🔒 Käyttäjällä on muokkausoikeudet (${user.role})`
    : `🔒 Käyttäjällä ei ole muokkausoikeuksia`)
  return hasRights
}

// Kirjaa käyttäjän ulos ja tyhjentää tokenin.
export function logout() {
  const user = getCurrentUser()
  localStorage.removeItem('token')
  logEvent(`🚪 Käyttäjä kirjautui ulos: ${user?.username || 'tuntematon'}`)
}
