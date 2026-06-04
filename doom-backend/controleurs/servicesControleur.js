// ============================================
// SERVICESCONTROLEUR.JS — Gestion des services
// ✅ Champs `photo` et `inclus` (JSON) gérés
//    → colonne `photo`  VARCHAR(500)
//    → colonne `inclus` JSON (ex: ["Diagnostic","Installation..."])
// ============================================

const db = require('../config/baseDeDonnees')

// ── Helper : parser le champ inclus (JSON string → array) ──
const parseInclus = (services) => {
  return services.map(s => ({
    ...s,
    // ← Si inclus est une string JSON, on la parse en array
    // Si c'est déjà un array (MySQL JSON column), on le garde
    inclus: typeof s.inclus === 'string'
      ? JSON.parse(s.inclus || '[]')
      : (s.inclus || []),
  }))
}

// ════════════════════════════════
// TOUS LES SERVICES (admin)
// GET /api/services
// ════════════════════════════════
const getTousServices = async (req, res) => {
  try {
    const [services] = await db.query('SELECT * FROM services ORDER BY nom ASC')
    res.status(200).json({ succes: true, services: parseInclus(services) })
  } catch (erreur) {
    console.error('Erreur getTousServices :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// SERVICES ACTIFS SEULEMENT (public)
// GET /api/services/actifs
// ════════════════════════════════
const getServicesActifs = async (req, res) => {
  try {
    const [services] = await db.query(
      'SELECT * FROM services WHERE actif = 1 ORDER BY nom ASC'
    )
    res.status(200).json({ succes: true, services: parseInclus(services) })
  } catch (erreur) {
    console.error('Erreur getServicesActifs :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// DÉTAIL D'UN SERVICE (public)
// GET /api/services/:id
// ════════════════════════════════
const getDetailService = async (req, res) => {
  try {
    const [services] = await db.query(
      'SELECT * FROM services WHERE id = ?', [req.params.id]
    )
    if (services.length === 0) {
      return res.status(404).json({ succes: false, message: 'Service introuvable' })
    }
    // ← Parser inclus avant de renvoyer
    const service = parseInclus(services)[0]
    res.status(200).json({ succes: true, service })
  } catch (erreur) {
    console.error('Erreur getDetailService :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// CRÉER UN SERVICE — Admin
// POST /api/services
// Body: { nom, categorie, description, dureeEstimee, photo, inclus[] }
// ════════════════════════════════
const creerService = async (req, res) => {
  try {
    const { nom, categorie, description, dureeEstimee, photo, inclus } = req.body

    if (!nom || !categorie) {
      return res.status(400).json({ succes: false, message: 'Nom et catégorie obligatoires' })
    }

    // ← Sérialiser le tableau inclus en JSON string pour stockage
    const inclusJSON = JSON.stringify(Array.isArray(inclus) ? inclus : [])

    const [resultat] = await db.query(
      `INSERT INTO services (nom, categorie, description, duree_estimee, photo, inclus, actif)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [nom, categorie, description || null, dureeEstimee || null, photo || null, inclusJSON]
    )

    res.status(201).json({
      succes: true,
      message: 'Service créé avec succès',
      serviceId: resultat.insertId,
    })
  } catch (erreur) {
    console.error('Erreur creerService :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// MODIFIER UN SERVICE — Admin
// PUT /api/services/:id
// Body: { nom, categorie, description, dureeEstimee, photo, inclus[], actif }
// ════════════════════════════════
const modifierService = async (req, res) => {
  try {
    const { nom, categorie, description, dureeEstimee, photo, inclus, actif } = req.body

    // ← Sérialiser le tableau inclus en JSON string pour stockage
    const inclusJSON = JSON.stringify(Array.isArray(inclus) ? inclus : [])

    await db.query(
      `UPDATE services
       SET nom = ?, categorie = ?, description = ?, duree_estimee = ?,
           photo = ?, inclus = ?, actif = ?
       WHERE id = ?`,
      [nom, categorie, description, dureeEstimee, photo || null, inclusJSON, actif, req.params.id]
    )

    res.status(200).json({ succes: true, message: 'Service modifié avec succès' })
  } catch (erreur) {
    console.error('Erreur modifierService :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// SUPPRIMER UN SERVICE — Admin
// DELETE /api/services/:id
// ════════════════════════════════
const supprimerService = async (req, res) => {
  try {
    await db.query('DELETE FROM services WHERE id = ?', [req.params.id])
    res.status(200).json({ succes: true, message: 'Service supprimé avec succès' })
  } catch (erreur) {
    console.error('Erreur supprimerService :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// TOGGLE ACTIF/INACTIF — Admin
// PATCH /api/services/:id/toggle
// ════════════════════════════════
const toggleService = async (req, res) => {
  try {
    await db.query(
      'UPDATE services SET actif = NOT actif WHERE id = ?', [req.params.id]
    )
    res.status(200).json({ succes: true, message: 'Statut du service modifié' })
  } catch (erreur) {
    console.error('Erreur toggleService :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

module.exports = {
  getTousServices,
  getServicesActifs,
  getDetailService,
  creerService,
  modifierService,
  supprimerService,
  toggleService,
}