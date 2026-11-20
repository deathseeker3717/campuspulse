const express = require('express')
const pool = require('../config/db')
const studentsRoutes = require('./students')
const attendanceRoutes = require('./attendance')
const analyticsRoutes = require('./analytics')
const registrationsRoutes = require('./registrations')

const router = express.Router()
router.use('/students', studentsRoutes)
router.use('/attendance', attendanceRoutes)
router.use('/analytics', analyticsRoutes)
router.use('/registrations', registrationsRoutes)

// API health check
router.get('/health', (req, res) => {
    res.json({
        message: 'CampusPulse API is running'
    })
})

// Database health check
router.get('/health/db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()')

        res.json({
            message: 'Database connected successfully',
            time: result.rows[0].now
        })
    } catch (error) {
        console.error(error.message);

        res.status(500).json({
            message: 'Database connection failed'
        })
    }
})

module.exports = router