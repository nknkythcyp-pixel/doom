// ============================================
// NOTIFICATIONSROUTES.JS
// GET    /api/notifications            → mes notifications (+ nonLues)
// PATCH  /api/notifications/tout-lire  → tout marquer lu
// PATCH  /api/notifications/:id/lu     → marquer une notif lue
// DELETE /api/notifications/:id        → supprimer une notif
// ============================================

const express = require('express')
const router  = express.Router()
const {
  getMesNotifications,
  marquerLue,
  toutMarquerLu,
  supprimerNotification,
} = require('../controleurs/notificationsControleur')
const { verifierToken } = require('../middlewares/verifierToken')

// IMPORTANT : /tout-lire doit être avant /:id
// sinon Express interpréterait "tout-lire" comme un id
router.get('/',                   verifierToken, getMesNotifications)
router.patch('/tout-lire',        verifierToken, toutMarquerLu)
router.patch('/:id/lu',           verifierToken, marquerLue)
router.delete('/:id',             verifierToken, supprimerNotification)

module.exports = router