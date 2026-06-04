// ============================================
// AUTHROUTES.JS — Routes d'authentification
// ============================================

const express = require('express')
const router = express.Router()
const {
  inscription,
  connexion,
  getProfil,
  modifierProfil,
  changerMotDePasse,
} = require('../controleurs/authControleur')
const { verifierToken } = require('../middlewares/verifierToken')

// ── Routes publiques (sans token) ──
router.post('/inscription', inscription)       // Créer un compte client
router.post('/connexion', connexion)           // Se connecter

// ── Routes protégées (token requis) ──
router.get('/profil', verifierToken, getProfil)                          // Voir son profil
router.put('/profil', verifierToken, modifierProfil)                     // Modifier son profil
router.put('/changer-mot-de-passe', verifierToken, changerMotDePasse)    // Changer mdp

module.exports = router