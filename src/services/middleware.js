//middleware.js
import jwt from 'jsonwebtoken';

export function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization
    if (!authHeader) return res.status(401).json({ error: 'Ei tunnistetta' })
    
    const token = authHeader.split(' ')[1]
    try {
        const decoded = jwt.verify(token, 'SECRET')
        req.user = decoded
        next()
    } catch (err) {
        console.error('❌ Virhe tunnistettaessa:', err.message)
        res.status(401).json({ error: 'Virheellinen tunniste' })
    }
}

export function requireRole(role) {
    return function (req, res, next) {
        if (!req.user) return res.status(401).json({ error: 'Ei tunnistetta' })
        if (req.user.role !== role && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Ei oikeuksia' })
        }
        next()
    }
}