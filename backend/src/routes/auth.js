const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const pool = require('../config/db')

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

const router = express.Router()

const COOKIE_NAME = 'campuspulse_token'
const COOKIE_MAX_AGE = 24 * 60 * 60 * 1000

const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
}

// Return only safe user details
function formatUser(user) {
    return {
        id: String(user.id),
        name: user.name,
        email: user.email,
        role: user.role
    }
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body || {}

        const userEmail = typeof email === 'string'
            ? email.trim().toLowerCase()
            : ''

        if (!userEmail || typeof password !== 'string' || !password) {
            return res.status(400).json({
                message: 'Email and password are required'
            })
        }

        const result = await pool.query(
            `SELECT id, name, email, password_hash, role, is_active
             FROM users
             WHERE LOWER(email) = $1`,
            [userEmail]
        )

        if (result.rowCount === 0 || !result.rows[0].is_active) {
            return res.status(401).json({
                message: 'Invalid email or password'
            })
        }

        const user = result.rows[0]

        const passwordMatches = await bcrypt.compare(
            password,
            user.password_hash
        )

        if (!passwordMatches) {
            return res.status(401).json({
                message: 'Invalid email or password'
            })
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: 'Authentication configuration error'
            })
        }

        // Generate login token
        const token = jwt.sign(
            { sub: String(user.id) },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        )

        // Store token in an HttpOnly cookie
        res.cookie(COOKIE_NAME, token, {
            ...cookieOptions,
            maxAge: COOKIE_MAX_AGE
        })

        res.json({
            message: 'Login successful',
            user: formatUser(user)
        })
    } catch (error) {
        console.error('Login error:', error.message)

        res.status(500).json({
            message: 'Could not login'
        })
    }
})

// GET /api/auth/me
router.get('/me', requireAuth, (req, res) => {
    res.json({
        user: req.user
    })
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    res.clearCookie(COOKIE_NAME, cookieOptions)

    res.json({
        message: 'Logout successful'
    })
})

// POST /api/auth/users
// Only Admin can create staff accounts
router.post('/users', requireAuth, requireRole('admin'), async (req, res) => {
    try {
        const { name, email, password, role } = req.body || {}

        const userName = typeof name === 'string' ? name.trim() : ''
        const userEmail = typeof email === 'string'
            ? email.trim().toLowerCase()
            : ''

        if (!userName || !userEmail || typeof password !== 'string' || !password || !role) {
            return res.status(400).json({
                message: 'Name, email, password and role are required'
            })
        }

        if (userName.length > 100 || userEmail.length > 254) {
            return res.status(400).json({
                message: 'Name or email exceeds the allowed length'
            })
        }

        if (!/^\S+@\S+\.\S+$/.test(userEmail)) {
            return res.status(400).json({
                message: 'Please provide a valid email'
            })
        }

        if (password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
            return res.status(400).json({
                message: 'Password must be at least 8 characters and no more than 72 bytes'
            })
        }

        if (!['admin', 'organizer'].includes(role)) {
            return res.status(400).json({
                message: 'Role must be admin or organizer'
            })
        }

        // Hash password before saving
        const passwordHash = await bcrypt.hash(password, 12)

        const result = await pool.query(
            `INSERT INTO users (name, email, password_hash, role)
             VALUES ($1, $2, $3, $4)
             RETURNING id, name, email, role`,
            [userName, userEmail, passwordHash, role]
        )

        res.status(201).json({
            message: 'Staff account created successfully',
            user: formatUser(result.rows[0])
        })
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({
                message: 'This email is already registered'
            })
        }

        console.error('User creation error:', error.message)

        res.status(500).json({
            message: 'Could not create staff account'
        })
    }
})

module.exports = router
