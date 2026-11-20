
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

module.exports = app
