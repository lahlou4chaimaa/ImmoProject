require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const app = express()

app.use(helmet())
app.use(morgan('dev'))
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())

// Rate limit sur les routes auth
app.use('/api/auth', rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    message: { error: 'Trop de requêtes, réessaie dans une minute.' }
}))

app.use('/api/auth', require('./routes/auth'))

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

const PORT = process.env.PORT || 3001
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))