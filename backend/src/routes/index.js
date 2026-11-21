const express = require('express')
const pool = require('../config/db')

const studentsRoutes = require('./students')
const eventsRoutes = require('./events')
const attendanceRoutes = require('./attendance')
const analyticsRoutes = require('./analytics')
const registrationsRoutes = require('./registrations')
const authRoutes = require('./auth')

const requireAuth = require('../middleware/requireAuth')
const requireRole = require('../middleware/requireRole')

const router = express.Router()

// Public health check
router.get('/health', (req, res) => {
    res.json({
        message: 'CampusPulse API is running'
    })
})

// Public database health check
router.get('/health/db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()')

        res.json({
            message: 'Database connected successfully',
            time: result.rows[0].now
        })
    } catch (error) {
        console.error(error.message)

        res.status(500).json({
            message: 'Database connection failed'
        })
    }
})

// Authentication routes
router.use('/auth', authRoutes)

// All routes below this point require login
router.use(requireAuth)

// Only Admin can create, update or delete students
const requireAdmin = requireRole('admin')

router.use('/students', (req, res, next) => {
    if (!['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return requireAdmin(req, res, next)
    }

    next()
}, studentsRoutes)

// Both Admin and Organizer can manage these resources
router.use('/events', eventsRoutes)
router.use('/registrations', registrationsRoutes)
router.use('/attendance', attendanceRoutes)

// Both roles can view analytics
router.use('/analytics', analyticsRoutes)

module.exports = router