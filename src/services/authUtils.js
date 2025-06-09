// authUtils.js

/**
 * Palauttaa nykyisen käyttäjän tiedot JWT-tokenista.
 * Jos tokenia ei ole tai se on virheellinen, palauttaa null.
 */
export function getCurrentUser() {
  const token = localStorage.getItem('token')
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload
  } catch (err) {
    console.error('❌ Tokenin purku epäonnistui:', err)
    return null
  }
}

/**
 * Tarkistaa onko käyttäjä kirjautunut sisään.
 */
export function isLoggedIn() {
  return !!localStorage.getItem('token')
}

/**
 * Tarkistaa onko käyttäjällä oikeus (admin tai owner).
 */
export function hasEditRights() {
  const user = getCurrentUser()
  return user && (user.role === 'admin' || user.role === 'owner')
}

/**
 * Kirjaa käyttäjän ulos ja tyhjentää tokenin.
 */
export function logout() {
  localStorage.removeItem('token')
}
