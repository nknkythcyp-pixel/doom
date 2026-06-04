// ============================================
// DEMANDESROUTES.JS — Routes des demandes
// ============================================

const express = require('express')
const router = express.Router()
const {
  creerDemande,
  getMesDemandes,
  getDetailDemande,
  getToutesDemandes,
  getMesInterventions,
  assignerTechnicien,
  changerStatut,
  sauvegarderNotes,
  supprimerDemande,
} = require('../controleurs/demandesControleur')
const {
  verifierToken,
  verifierAdmin,
  verifierTechnicien,
} = require('../middlewares/verifierToken')

// ── Routes client ──
router.post('/',            verifierToken,                     creerDemande)
router.get('/mes-demandes', verifierToken,                     getMesDemandes)

// ── Routes technicien ──
// IMPORTANT : routes spécifiques AVANT /:id
router.get('/technicien/mes-interventions', verifierToken, verifierTechnicien, getMesInterventions)
router.put('/:id/statut',  verifierToken, verifierTechnicien, changerStatut)
router.put('/:id/notes',   verifierToken, verifierTechnicien, sauvegarderNotes)

// ── Routes admin ──
router.get('/',             verifierToken, verifierAdmin,      getToutesDemandes)
router.put('/:id/assigner', verifierToken, verifierAdmin,      assignerTechnicien)
router.delete('/:id',       verifierToken, verifierAdmin,      supprimerDemande)

// ── Détail partagé — toujours en dernier ──
router.get('/:id',          verifierToken,                     getDetailDemande)

module.exports = router