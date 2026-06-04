// ============================================
// MESSAGESROUTES.JS
// GET  /api/messages/:demandeId  → lire messages
// POST /api/messages/:demandeId  → envoyer message
// ============================================

const express = require('express')
const router  = express.Router()
const { getMessages, envoyerMessage } = require('../controleurs/messagesControleur')
const { verifierToken } = require('../middlewares/verifierToken')

router.get('/:demandeId',  verifierToken, getMessages)
router.post('/:demandeId', verifierToken, envoyerMessage)

module.exports = router