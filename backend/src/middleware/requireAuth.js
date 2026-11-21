const jwt = require('jsonwebtoken')
const pool = require('../config/db')

async function requireAuth(req, res, next) {
    const token = req.cookies?.campuspulse_token

    if (!token) {
        return res.status(401).json({
            message: 'Authentication required'
        })
    }

    if (!process.env.JWT_SECRET) {
        console.error('JWT_SECRET is missing')

        return res.status(500).json({
            message: 'Authentication configuration error'
        })
    }

    let decoded

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
    } catch (error) {
        return res.status(401).json({
            message: 'Invalid or expired token'
        })
    }

    if (!decoded.sub || typeof decoded.sub !== 'string') {
        return res.status(401).json({
            message: 'Invalid token'
        })
    }

    try {
        const result = await pool.query(
            `SELECT id, name, email, role, is_active
             FROM users
             WHERE id = $1`,
            [decoded.sub]
        )

        if (result.rowCount === 0 || !result.rows[0].is_active) {
            return res.status(401).json({
                message: 'User account not found or inactive'
            })
        }

        const user = result.rows[0]

        req.user = {
            id: String(user.id),
            name: user.name,
            email: user.email,
            role: user.role
        }

        next()
    } catch (error) {
        console.error('Authentication error:', error.message)

        res.status(500).json({
            message: 'Authentication failed'
        })
    }
}

module.exports = requireAuth
