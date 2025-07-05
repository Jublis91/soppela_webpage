//middleware.js

import jwt from 'jsonwebtoken'

/**
 * Middleware: Tarkistaa, että pyyntö sisältää kelvollisen JWT-tokenin.
 * Tallentaa käyttäjän tiedot (req.user), jos token on validi.
 */
export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn('⛔ Puuttuva tai virheellinen Authorization-header')
    return res.status(401).json({ error: 'Ei tunnistetta (Bearer-muoto puuttuu)' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, 'SECRET')
    req.user = decoded
    if (process.env.NODE_ENV !== 'production') {
      console.log(`🔐 Autentikoitu käyttäjä: ${decoded.username} (${decoded.role})`)
    }
    next()
  } catch (err) {
    console.error('❌ Tokenin tarkistus epäonnistui:', err.message)
    return res.status(401).json({ error: 'Virheellinen tai vanhentunut tunniste' })
  }
}

/**
 * Middleware: Tarkistaa, että käyttäjällä on vaadittu rooli (tai on admin).
 * Käytetään requireAuth-middleware:n jälkeen.
 * @param {string} role - Vaatimuksena oleva rooli, esim. 'owner'
 */
export function requireRole(role) {
  return function (req, res, next) {
    if (!req.user) {
      console.warn('⛔ Roolin tarkistus epäonnistui – käyttäjä ei ole kirjautunut')
      return res.status(401).json({ error: 'Ei tunnistetta' })
    }

    if (req.user.role !== role && req.user.role !== 'admin') {
      console.warn(`⛔ Käyttäjällä ${req.user.username} ei ole oikeuksia (${req.user.role})`)
      return res.status(403).json({ error: 'Ei oikeuksia' })
    }

    next()
  }
}
