// ============================================
// NOTIFICATIONSCONTROLEUR.JS
// GET    /api/notifications        → mes notifications
// PATCH  /api/notifications/:id/lu → marquer une notif lue
// PATCH  /api/notifications/tout-lire → tout marquer lu
// DELETE /api/notifications/:id    → supprimer une notif
// ============================================

const db = require('../config/baseDeDonnees')

// ════════════════════════════════
// LIRE MES NOTIFICATIONS
// GET /api/notifications
// ════════════════════════════════
const getMesNotifications = async (req, res) => {
  try {
    const utilisateurId = req.utilisateur.id

    const [notifications] = await db.query(
      `SELECT id, type, titre, message, demande_id, lu, date_creation
       FROM notifications
       WHERE destinataire_id = ?
       ORDER BY date_creation DESC
       LIMIT 50`,
      [utilisateurId]
    )

    // Compter les non lues
    const nonLues = notifications.filter(n => n.lu === 0).length

    res.status(200).json({ succes: true, notifications, nonLues })

  } catch (erreur) {
    console.error('Erreur getMesNotifications :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// MARQUER UNE NOTIFICATION LUE
// PATCH /api/notifications/:id/lu
// ════════════════════════════════
const marquerLue = async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET lu = 1 WHERE id = ? AND destinataire_id = ?',
      [req.params.id, req.utilisateur.id]
    )
    res.status(200).json({ succes: true, message: 'Notification marquée lue' })
  } catch (erreur) {
    console.error('Erreur marquerLue :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// TOUT MARQUER LU
// PATCH /api/notifications/tout-lire
// ════════════════════════════════
const toutMarquerLu = async (req, res) => {
  try {
    await db.query(
      'UPDATE notifications SET lu = 1 WHERE destinataire_id = ? AND lu = 0',
      [req.utilisateur.id]
    )
    res.status(200).json({ succes: true, message: 'Toutes les notifications marquées lues' })
  } catch (erreur) {
    console.error('Erreur toutMarquerLu :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// SUPPRIMER UNE NOTIFICATION
// DELETE /api/notifications/:id
// ════════════════════════════════
const supprimerNotification = async (req, res) => {
  try {
    await db.query(
      'DELETE FROM notifications WHERE id = ? AND destinataire_id = ?',
      [req.params.id, req.utilisateur.id]
    )
    res.status(200).json({ succes: true, message: 'Notification supprimée' })
  } catch (erreur) {
    console.error('Erreur supprimerNotification :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// UTILITAIRE INTERNE — Créer et diffuser une notification
// Utilisé par demandesControleur et messagesControleur
// ════════════════════════════════
const creerNotification = async ({ db, io, destinataireId, type, titre, message, demandeId = null }) => {
  try {
    const [resultat] = await db.query(
      `INSERT INTO notifications (destinataire_id, type, titre, message, demande_id)
       VALUES (?, ?, ?, ?, ?)`,
      [destinataireId, type, titre, message, demandeId]
    )

    // Récupérer la notification complète pour l'envoyer via Socket.io
    const [nouvelles] = await db.query(
      'SELECT id, type, titre, message, demande_id, lu, date_creation FROM notifications WHERE id = ?',
      [resultat.insertId]
    )

    const notif = nouvelles[0]

    // Diffuser en temps réel si Socket.io est disponible
    if (io) {
      io.to(`user-${destinataireId}`).emit('nouvelle-notification', notif)
    }

    return notif
  } catch (err) {
    // Ne pas bloquer le flux principal si la notification échoue
    console.error('Erreur creerNotification (non bloquant) :', err)
    return null
  }
}

module.exports = {
  getMesNotifications,
  marquerLue,
  toutMarquerLu,
  supprimerNotification,
  creerNotification,
}