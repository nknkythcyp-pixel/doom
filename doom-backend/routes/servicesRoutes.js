// ============================================
// SERVICESROUTES.JS — Routes des services
// ============================================

const express = require('express')
const router = express.Router()
const {
  getTousServices,
  getServicesActifs,
  getDetailService,
  creerService,
  modifierService,
  supprimerService,
  toggleService,
} = require('../controleurs/servicesControleur')
const { verifierToken, verifierAdmin } = require('../middlewares/verifierToken')

// ── Routes publiques ──
router.get('/actifs', getServicesActifs)        // Services actifs (page d'accueil)
router.get('/:id', getDetailService)            // Détail d'un service

// ── Routes admin ──
router.get('/', verifierToken, verifierAdmin, getTousServices)           // Tous les services
router.post('/', verifierToken, verifierAdmin, creerService)             // Créer service
router.put('/:id', verifierToken, verifierAdmin, modifierService)        // Modifier service
router.delete('/:id', verifierToken, verifierAdmin, supprimerService)    // Supprimer service
router.patch('/:id/toggle', verifierToken, verifierAdmin, toggleService) // Toggle actif

module.exports = router