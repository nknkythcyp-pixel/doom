// ============================================
// SERVEUR.JS — Point d'entrée du backend DOOM
// ✅ Route /api/messages ajoutée
// ✅ Route /api/notifications ajoutée
// ✅ Socket.io : salles par utilisateur (user-{id})
//    pour les notifications en temps réel
// ============================================

const express   = require('express')
const cors      = require('cors')
const http      = require('http')
const jwt       = require('jsonwebtoken')
const { Server } = require('socket.io')
require('dotenv').config()

const app         = express()
const serveurHttp = http.createServer(app)

// ── Socket.io ──
const io = new Server(serveurHttp, {
  cors: { origin: true, methods: ['GET', 'POST'] },
})

// ── Rendre io accessible depuis les contrôleurs ──
app.set('io', io)

// ════════════════════════════════
// MIDDLEWARES
// ════════════════════════════════
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ════════════════════════════════
// ROUTES
// ════════════════════════════════
const authRoutes          = require('./routes/authRoutes')
const demandesRoutes      = require('./routes/demandesRoutes')
const servicesRoutes      = require('./routes/servicesRoutes')
const utilisateursRoutes  = require('./routes/utilisateursRoutes')
const messagesRoutes      = require('./routes/messagesRoutes')
const notificationsRoutes = require('./routes/notificationsRoutes')  // ← NOUVEAU

app.use('/api/auth',          authRoutes)
app.use('/api/demandes',      demandesRoutes)
app.use('/api/services',      servicesRoutes)
app.use('/api/utilisateurs',  utilisateursRoutes)
app.use('/api/messages',      messagesRoutes)
app.use('/api/notifications', notificationsRoutes)                   // ← NOUVEAU

app.get('/', (req, res) => {
  res.json({ succes: true, message: '🚀 Serveur DOOM opérationnel', version: '1.0.0' })
})

app.use((req, res) => {
  res.status(404).json({ succes: false, message: 'Route introuvable' })
})

// ════════════════════════════════
// SOCKET.IO
// ════════════════════════════════
io.on('connection', (socket) => {
  console.log(`✅ Socket connecté : ${socket.id}`)

  // ── Rejoindre la salle personnelle (notifications) ──
  // Le client envoie son token, on extrait son id
  socket.on('rejoindre-espace-perso', (token) => {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET)
      socket.join(`user-${decoded.id}`)
      console.log(`🔔 Socket ${socket.id} → user-${decoded.id}`)
    } catch {
      console.warn(`⚠️  Token invalide pour rejoindre-espace-perso`)
    }
  })

  // ── Rejoindre la salle d'une demande (messagerie) ──
  socket.on('rejoindre-conversation', (demandeId) => {
    socket.join(`demande-${demandeId}`)
    console.log(`📩 Socket ${socket.id} → demande-${demandeId}`)
  })

  // ── Nouveau message → diffusion à la salle ──
  socket.on('envoyer-message', (donnees) => {
    // donnees = { demandeId, message: { id, contenu, expediteur_prenom, ... } }
    socket.to(`demande-${donnees.demandeId}`).emit('nouveau-message', donnees.message)
  })

  socket.on('disconnect', () => {
    console.log(`❌ Socket déconnecté : ${socket.id}`)
  })
})

// ════════════════════════════════
// DÉMARRAGE
// ════════════════════════════════
const PORT = process.env.PORT || 5000
serveurHttp.listen(PORT, () => {
  console.log(`\n🚀 Serveur DOOM → http://localhost:${PORT}`)
  console.log(`📡 Socket.io actif`)
  console.log(`📋 API         → http://localhost:${PORT}/api\n`)
})