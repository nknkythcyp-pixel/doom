// ============================================
// MESSAGESCONTROLEUR.JS
// GET  /api/messages/:demandeId  → lire les messages
// POST /api/messages/:demandeId  → envoyer un message
// ✅ NOTIFICATIONS : chaque message notifie l'autre partie
// ============================================

const db = require('../config/baseDeDonnees')
const { creerNotification } = require('./notificationsControleur')

// ════════════════════════════════
// LIRE LES MESSAGES D'UNE DEMANDE
// GET /api/messages/:demandeId
// ════════════════════════════════
const getMessages = async (req, res) => {
  try {
    const { demandeId } = req.params
    const utilisateur   = req.utilisateur

    const [demandes] = await db.query(
      'SELECT id, client_id, technicien_id FROM demandes WHERE id = ?',
      [demandeId]
    )

    if (demandes.length === 0) {
      return res.status(404).json({ succes: false, message: 'Demande introuvable' })
    }

    const demande = demandes[0]

    const estClient     = utilisateur.role === 'client'     && demande.client_id     === utilisateur.id
    const estTechnicien = utilisateur.role === 'technicien' && demande.technicien_id === utilisateur.id
    const estAdmin      = utilisateur.role === 'admin'

    if (!estClient && !estTechnicien && !estAdmin) {
      return res.status(403).json({ succes: false, message: 'Accès refusé' })
    }

    const [messages] = await db.query(
      `SELECT
         m.id,
         m.demande_id,
         m.expediteur_id,
         m.contenu,
         m.date_envoi,
         u.nom        AS expediteur_nom,
         u.prenom     AS expediteur_prenom,
         u.role       AS expediteur_role
       FROM messages m
       JOIN utilisateurs u ON m.expediteur_id = u.id
       WHERE m.demande_id = ?
       ORDER BY m.date_envoi ASC`,
      [demandeId]
    )

    res.status(200).json({ succes: true, messages })

  } catch (erreur) {
    console.error('Erreur getMessages :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// ENVOYER UN MESSAGE
// POST /api/messages/:demandeId
// ✅ Notifie le destinataire (l'autre partie)
// ════════════════════════════════
const envoyerMessage = async (req, res) => {
  try {
    const { demandeId } = req.params
    const { contenu }   = req.body
    const utilisateur   = req.utilisateur
    const io            = req.app.get('io')

    if (!contenu || !contenu.trim()) {
      return res.status(400).json({ succes: false, message: 'Le message ne peut pas être vide' })
    }

    const [demandes] = await db.query(
      `SELECT d.id, d.client_id, d.technicien_id, s.nom AS service_nom
       FROM demandes d
       LEFT JOIN services s ON d.service_id = s.id
       WHERE d.id = ?`,
      [demandeId]
    )

    if (demandes.length === 0) {
      return res.status(404).json({ succes: false, message: 'Demande introuvable' })
    }

    const demande = demandes[0]

    const estClient     = utilisateur.role === 'client'     && demande.client_id     === utilisateur.id
    const estTechnicien = utilisateur.role === 'technicien' && demande.technicien_id === utilisateur.id
    const estAdmin      = utilisateur.role === 'admin'

    if (!estClient && !estTechnicien && !estAdmin) {
      return res.status(403).json({ succes: false, message: 'Accès refusé' })
    }

    // Insérer le message
    const [resultat] = await db.query(
      `INSERT INTO messages (demande_id, expediteur_id, contenu)
       VALUES (?, ?, ?)`,
      [demandeId, utilisateur.id, contenu.trim()]
    )

    // Récupérer le message complet
    const [nouveauxMessages] = await db.query(
      `SELECT
         m.id,
         m.demande_id,
         m.expediteur_id,
         m.contenu,
         m.date_envoi,
         u.nom        AS expediteur_nom,
         u.prenom     AS expediteur_prenom,
         u.role       AS expediteur_role
       FROM messages m
       JOIN utilisateurs u ON m.expediteur_id = u.id
       WHERE m.id = ?`,
      [resultat.insertId]
    )

    const messageComplet = nouveauxMessages[0]
    const expediteurNomComplet = `${utilisateur.prenom || ''} ${utilisateur.nom || ''}`.trim()

    // ── Déterminer qui notifier ──
    // Le client envoie → notifier le technicien (et les admins)
    // Le technicien/admin envoie → notifier le client

    if (estClient && demande.technicien_id) {
      // Notifier le technicien
      await creerNotification({
        db, io,
        destinataireId: demande.technicien_id,
        type:           'nouveau_message',
        titre:          'Nouveau message client',
        message:        `Nouveau message de ${expediteurNomComplet} sur la demande #${demandeId}`,
        demandeId:      parseInt(demandeId),
      })
    }

    if (estTechnicien || estAdmin) {
      // Notifier le client
      await creerNotification({
        db, io,
        destinataireId: demande.client_id,
        type:           'nouveau_message',
        titre:          'Nouveau message de votre technicien',
        message:        `Nouveau message de ${expediteurNomComplet} sur votre demande #${demandeId}`,
        demandeId:      parseInt(demandeId),
      })
    }

    res.status(201).json({
      succes:  true,
      message: 'Message envoyé',
      data:    messageComplet,
    })

  } catch (erreur) {
    console.error('Erreur envoyerMessage :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

module.exports = { getMessages, envoyerMessage }