// ============================================
// UTILISATEURSROUTES.JS
// ✅ Routes catégories technicien
// ============================================

const express = require('express')
const router  = express.Router()
const {
  getTousUtilisateurs,
  getTechniciens,
  getCategoriesTechnicien,
  mettreAJourCategories,
  modifierTechnicien,
  creerTechnicien,
  toggleUtilisateur,
  supprimerUtilisateur,
} = require('../controleurs/utilisateursControleur')
const { verifierToken, verifierAdmin } = require('../middlewares/verifierToken')

router.get('/',                  verifierToken, verifierAdmin, getTousUtilisateurs)
router.get('/techniciens',       verifierToken, verifierAdmin, getTechniciens)
router.post('/technicien',       verifierToken, verifierAdmin, creerTechnicien)
router.patch('/:id/toggle',      verifierToken, verifierAdmin, toggleUtilisateur)
router.delete('/:id',            verifierToken, verifierAdmin, supprimerUtilisateur)
router.put('/:id',               verifierToken, verifierAdmin, modifierTechnicien)
router.get('/:id/categories',    verifierToken, verifierAdmin, getCategoriesTechnicien)
router.put('/:id/categories',    verifierToken, verifierAdmin, mettreAJourCategories)

module.exports = router