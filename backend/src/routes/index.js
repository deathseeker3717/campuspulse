const express = require('express')
const pool = require('../config/db')

const router = express.Router()

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