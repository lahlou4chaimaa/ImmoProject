require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const app = express()

// --- 1. Middlewares de Sécurité et Logging ---
app.use(helmet()) // Sécurise les headers HTTP
app.use(morgan('dev')) // Affiche les requêtes dans la console (super utile pour débugger le 404)

// Configuration CORS : Autorise ton frontend (Vite)
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}))

// Parsing du corps des requêtes
app.use(express.json())

// --- 2. Limiteur de débit (Rate Limiting) ---
const authLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: { error: 'Trop de requêtes, réessaie dans une minute.' },
    standardHeaders: true,
    legacyHeaders: false,
})

// --- 3. Routes de l'API ---

// Routes d'authentification (avec limitation)
// Note : Vérifie que ton dossier s'appelle bien 'routes' et non 'server'
app.use('/api/auth', authLimiter, require('./routes/auth'))

// Routes d'administration
app.use('/api/admin', require('./routes/admin'))

// Route de santé pour tester si le serveur répond
app.get('/api/health', (req, res) => res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
}))
// index.js
app.get('/api', (req, res) => res.json({ message: "Bienvenue sur l'API" }));

// --- 4. Gestion des erreurs 404 (Route non trouvée) ---
app.use((req, res) => {
    res.status(404).json({
        error: `Route ${req.originalUrl} introuvable sur le serveur.`
    })
})

// --- 5. Lancement du serveur ---
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log('-------------------------------------------')
    console.log(`🚀 Serveur démarré sur le port : ${PORT}`)
    console.log(`📡 API URL : http://localhost:${PORT}/api`)
    console.log(`🌐 Dashboard Admin : http://localhost:${PORT}/api/admin/users`)
    console.log('-------------------------------------------')
})