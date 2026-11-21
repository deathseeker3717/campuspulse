
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const routes = require('./routes')

const app = express()

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}))

app.use(express.json())
app.use(cookieParser())

app.use('/api', routes)

app.get('/', (req, res) => {
    res.json({
        message: 'CampusPulse is live',
        status: 'Running'
    })
})

// 404 Handler for undefined routes
app.use((req, res) => {
    res.status(404).json({
        message: 'Endpoint not found'
    })
})

// Global Error Handler
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            message: 'Invalid JSON request payload'
        })
    }

    console.error('Unhandled server error:', err.message)

    res.status(err.status || 500).json({
        message: err.message || 'Internal server error'
    })
})

module.exports = app
