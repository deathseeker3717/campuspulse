const express = require('express')
const cors = require('cors')

const routes = require('./routes')

const app = express()

app.use(cors());
app.use(express.json())

app.use('/api', routes)

app.get('/', (req, res) => {
    res.json({
        message: 'CampusPulse is live',
        status: 'Running'
    })
})

module.exports = app