// ============================================
// DEMANDESCONTROLEUR.JS — Gestion des demandes
// ✅ NOTIFICATIONS intégrées :
//    • creerDemande       → notifie les admins
//    • assignerTechnicien → notifie technicien + client
//    • changerStatut      → notifie le client
//    • sauvegarderNotes   → notifie les admins
// ============================================

const db = require('../config/baseDeDonnees')
const { creerNotification } = require('./notificationsControleur')

// ════════════════════════════════
// CRÉER UNE DEMANDE
// POST /api/demandes
// ════════════════════════════════
const creerDemande = async (req, res) => {
  try {
    const { serviceId, description, urgence, lieu, adresse, dateSouhaitee } = req.body
    const clientId = req.utilisateur.id
    const io = req.app.get('io')

    if (!serviceId || !description || !urgence || !lieu) {
      return res.status(400).json({
        succes: false,
        message: 'Champs obligatoires manquants',
      })
    }

    const [resultat] = await db.query(
      `INSERT INTO demandes
       (client_id, service_id, description, urgence, lieu, adresse, date_souhaitee, statut)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'en_attente')`,
      [clientId, serviceId, description, urgence, lieu, adresse || null, dateSouhaitee || null]
    )

    const demandeId = resultat.insertId

    const [infos] = await db.query(
      `SELECT s.nom AS service_nom, u.nom AS client_nom, u.prenom AS client_prenom
       FROM demandes d
       LEFT JOIN services s ON d.service_id = s.id
       LEFT JOIN utilisateurs u ON d.client_id = u.id
       WHERE d.id = ?`,
      [demandeId]
    )

    const info = infos[0] || {}
    const clientNomComplet = `${info.client_prenom || ''} ${info.client_nom || ''}`.trim()

    const [admins] = await db.query(
      `SELECT id FROM utilisateurs WHERE role = 'admin' AND actif = 1`
    )

    for (const admin of admins) {
      await creerNotification({
        db, io,
        destinataireId: admin.id,
        type:           'nouvelle_demande',
        titre:          'Nouvelle demande reçue',
        message:        `Nouvelle demande de ${clientNomComplet} pour « ${info.service_nom || 'service'} »`,
        demandeId,
      })
    }

    res.status(201).json({
      succes: true,
      message: 'Demande créée avec succès',
      demandeId,
    })

  } catch (erreur) {
    console.error('Erreur creerDemande :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// MES DEMANDES — Client
// GET /api/demandes/mes-demandes
// ════════════════════════════════
const getMesDemandes = async (req, res) => {
  try {
    const [demandes] = await db.query(
      `SELECT d.*, s.nom AS service_nom,
              u.nom AS technicien_nom, u.prenom AS technicien_prenom
       FROM demandes d
       LEFT JOIN services s ON d.service_id = s.id
       LEFT JOIN utilisateurs u ON d.technicien_id = u.id
       WHERE d.client_id = ?
       ORDER BY d.date_creation DESC`,
      [req.utilisateur.id]
    )

    res.status(200).json({ succes: true, demandes })

  } catch (erreur) {
    console.error('Erreur getMesDemandes :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// DÉTAIL D'UNE DEMANDE
// GET /api/demandes/:id
// ════════════════════════════════
const getDetailDemande = async (req, res) => {
  try {
    const { id } = req.params

    const [demandes] = await db.query(
      `SELECT d.*, s.nom AS service_nom, s.description AS service_description,
              c.nom AS client_nom, c.prenom AS client_prenom, c.telephone AS client_telephone,
              t.nom AS technicien_nom, t.prenom AS technicien_prenom
       FROM demandes d
       LEFT JOIN services s ON d.service_id = s.id
       LEFT JOIN utilisateurs c ON d.client_id = c.id
       LEFT JOIN utilisateurs t ON d.technicien_id = t.id
       WHERE d.id = ?`,
      [id]
    )

    if (demandes.length === 0) {
      return res.status(404).json({ succes: false, message: 'Demande introuvable' })
    }

    res.status(200).json({ succes: true, demande: demandes[0] })

  } catch (erreur) {
    console.error('Erreur getDetailDemande :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// TOUTES LES DEMANDES — Admin
// GET /api/demandes
// ════════════════════════════════
const getToutesDemandes = async (req, res) => {
  try {
    const limite = req.query.limite ? parseInt(req.query.limite) : null

    const requete = `
      SELECT
        d.id,
        d.service_id,
        d.client_id,
        d.technicien_id,
        d.statut,
        d.urgence,
        d.description,
        d.lieu,
        d.adresse,
        d.date_souhaitee,
        d.date_creation,
        d.notes_techniques,
        s.nom        AS service_nom,
        s.categorie  AS service_categorie,
        c.nom        AS client_nom,
        c.prenom     AS client_prenom,
        c.telephone  AS client_telephone,
        t.nom        AS technicien_nom,
        t.prenom     AS technicien_prenom
      FROM demandes d
      LEFT JOIN services s     ON d.service_id   = s.id
      LEFT JOIN utilisateurs c ON d.client_id    = c.id
      LEFT JOIN utilisateurs t ON d.technicien_id = t.id
      ORDER BY d.date_creation DESC
      ${limite ? `LIMIT ${limite}` : ''}
    `

    const [demandes] = await db.query(requete)
    res.status(200).json({ succes: true, demandes })

  } catch (erreur) {
    console.error('Erreur getToutesDemandes :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// MES INTERVENTIONS — Technicien
// GET /api/demandes/technicien/mes-interventions
// ════════════════════════════════
const getMesInterventions = async (req, res) => {
  try {
    const [interventions] = await db.query(
      `SELECT d.*, s.nom AS service_nom,
              c.nom AS client_nom, c.prenom AS client_prenom, c.telephone AS client_telephone
       FROM demandes d
       LEFT JOIN services s ON d.service_id = s.id
       LEFT JOIN utilisateurs c ON d.client_id = c.id
       WHERE d.technicien_id = ?
       ORDER BY d.date_creation DESC`,
      [req.utilisateur.id]
    )

    res.status(200).json({ succes: true, interventions })

  } catch (erreur) {
    console.error('Erreur getMesInterventions :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// ASSIGNER UN TECHNICIEN — Admin
// PUT /api/demandes/:id/assigner
// ✅ Notifie technicien + client
// ════════════════════════════════
const assignerTechnicien = async (req, res) => {
  try {
    const { id } = req.params
    const { technicienId } = req.body
    const io = req.app.get('io')

    await db.query(
      `UPDATE demandes SET technicien_id = ?, statut = 'assigne' WHERE id = ?`,
      [technicienId, id]
    )

    const [infos] = await db.query(
      `SELECT s.nom AS service_nom,
              c.nom AS client_nom, c.prenom AS client_prenom, c.id AS client_id,
              t.nom AS tech_nom, t.prenom AS tech_prenom
       FROM demandes d
       LEFT JOIN services s     ON d.service_id   = s.id
       LEFT JOIN utilisateurs c ON d.client_id    = c.id
       LEFT JOIN utilisateurs t ON d.technicien_id = t.id
       WHERE d.id = ?`,
      [id]
    )

    if (infos.length > 0) {
      const info = infos[0]
      const techNomComplet   = `${info.tech_prenom || ''} ${info.tech_nom || ''}`.trim()
      const clientNomComplet = `${info.client_prenom || ''} ${info.client_nom || ''}`.trim()

      await creerNotification({
        db, io,
        destinataireId: technicienId,
        type:           'demande_assignee',
        titre:          'Nouvelle intervention assignée',
        message:        `Nouvelle intervention assignée : « ${info.service_nom} » pour ${clientNomComplet}`,
        demandeId:      parseInt(id),
      })

      await creerNotification({
        db, io,
        destinataireId: info.client_id,
        type:           'demande_assignee',
        titre:          'Votre demande a été prise en charge',
        message:        `Votre demande a été prise en charge par ${techNomComplet}`,
        demandeId:      parseInt(id),
      })
    }

    res.status(200).json({ succes: true, message: 'Technicien assigné avec succès' })

  } catch (erreur) {
    console.error('Erreur assignerTechnicien :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// CHANGER LE STATUT — Technicien/Admin
// PUT /api/demandes/:id/statut
// ✅ Notifie le client
// ════════════════════════════════
const changerStatut = async (req, res) => {
  try {
    const { id } = req.params
    const { statut, notesTechniques } = req.body
    const io = req.app.get('io')

    const statutsValides = ['en_attente', 'assigne', 'en_cours', 'termine']
    if (!statutsValides.includes(statut)) {
      return res.status(400).json({ succes: false, message: 'Statut invalide' })
    }

    await db.query(
      'UPDATE demandes SET statut = ?, notes_techniques = ? WHERE id = ?',
      [statut, notesTechniques || null, id]
    )

    if (statut === 'en_cours' || statut === 'termine') {
      const [infos] = await db.query(
        `SELECT d.client_id, s.nom AS service_nom
         FROM demandes d
         LEFT JOIN services s ON d.service_id = s.id
         WHERE d.id = ?`,
        [id]
      )

      if (infos.length > 0) {
        const titreMap = {
          en_cours: 'Votre intervention est en cours',
          termine:  'Votre intervention est terminée',
        }
        const messageMap = {
          en_cours: `Votre intervention « ${infos[0].service_nom} » est maintenant en cours`,
          termine:  `Votre intervention « ${infos[0].service_nom} » est terminée avec succès`,
        }

        await creerNotification({
          db, io,
          destinataireId: infos[0].client_id,
          type:           'statut_change',
          titre:          titreMap[statut],
          message:        messageMap[statut],
          demandeId:      parseInt(id),
        })
      }
    }

    res.status(200).json({ succes: true, message: 'Statut mis à jour avec succès' })

  } catch (erreur) {
    console.error('Erreur changerStatut :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// SAUVEGARDER LES NOTES TECHNIQUES — Technicien
// PUT /api/demandes/:id/notes
// ✅ Notifie tous les admins
// ════════════════════════════════
const sauvegarderNotes = async (req, res) => {
  try {
    const { id } = req.params
    const { notesTechniques } = req.body
    const io = req.app.get('io')
    const technicienId = req.utilisateur.id

    if (!notesTechniques || !notesTechniques.trim()) {
      return res.status(400).json({ succes: false, message: 'Notes vides' })
    }

    await db.query(
      'UPDATE demandes SET notes_techniques = ? WHERE id = ? AND technicien_id = ?',
      [notesTechniques.trim(), id, technicienId]
    )

    const [infos] = await db.query(
      `SELECT s.nom AS service_nom,
              t.nom AS tech_nom, t.prenom AS tech_prenom
       FROM demandes d
       LEFT JOIN services s     ON d.service_id    = s.id
       LEFT JOIN utilisateurs t ON d.technicien_id = t.id
       WHERE d.id = ?`,
      [id]
    )

    if (infos.length > 0) {
      const info    = infos[0]
      const techNom = `${info.tech_prenom || ''} ${info.tech_nom || ''}`.trim()

      const [admins] = await db.query(
        `SELECT id FROM utilisateurs WHERE role = 'admin' AND actif = 1`
      )

      for (const admin of admins) {
        await creerNotification({
          db, io,
          destinataireId: admin.id,
          type:           'notes_techniques',
          titre:          'Notes techniques ajoutées',
          message:        `${techNom} a renseigné des notes sur « ${info.service_nom} »`,
          demandeId:      parseInt(id),
        })
      }
    }

    res.status(200).json({ succes: true, message: 'Notes sauvegardées avec succès' })

  } catch (erreur) {
    console.error('Erreur sauvegarderNotes :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// SUPPRIMER UNE DEMANDE — Admin
// DELETE /api/demandes/:id
// ════════════════════════════════
const supprimerDemande = async (req, res) => {
  try {
    const { id } = req.params

    const [demandes] = await db.query('SELECT id FROM demandes WHERE id = ?', [id])

    if (demandes.length === 0) {
      return res.status(404).json({ succes: false, message: 'Demande introuvable' })
    }

    await db.query('DELETE FROM demandes WHERE id = ?', [id])

    res.status(200).json({ succes: true, message: 'Demande supprimée avec succès' })

  } catch (erreur) {
    console.error('Erreur supprimerDemande :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

module.exports = {
  creerDemande,
  getMesDemandes,
  getDetailDemande,
  getToutesDemandes,
  getMesInterventions,
  assignerTechnicien,
  changerStatut,
  sauvegarderNotes,
  supprimerDemande,
}