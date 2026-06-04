// ============================================
// UTILISATEURSCONTROLEUR.JS
// ✅ Fix : getTousUtilisateurs inclut maintenant
//    les catégories des techniciens
// ============================================

const bcrypt = require('bcryptjs')
const db     = require('../config/baseDeDonnees')

const CATEGORIES_VALIDES = ['Informatique', 'Réseau', 'Sécurité', 'Électricité', 'Domotique']

// ════════════════════════════════
// TOUS LES UTILISATEURS — Admin
// GET /api/utilisateurs
// ✅ Inclut categories[] pour les techniciens
// ════════════════════════════════
const getTousUtilisateurs = async (req, res) => {
  try {
    const [utilisateurs] = await db.query(
      `SELECT id, nom, prenom, email, telephone, role, actif, date_inscription
       FROM utilisateurs ORDER BY date_inscription DESC`
    )

    // Pour chaque technicien, charger ses catégories
    for (const u of utilisateurs) {
      if (u.role === 'technicien') {
        const [cats] = await db.query(
          `SELECT categorie FROM technicien_categories WHERE technicien_id = ?`,
          [u.id]
        )
        u.categories = cats.map(c => c.categorie)
      } else {
        u.categories = []
      }
    }

    res.status(200).json({ succes: true, utilisateurs })
  } catch (erreur) {
    console.error('Erreur getTousUtilisateurs :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// TOUS LES TECHNICIENS — Admin
// GET /api/utilisateurs/techniciens
// ════════════════════════════════
const getTechniciens = async (req, res) => {
  try {
    const [techniciens] = await db.query(
      `SELECT id, nom, prenom, email, telephone, actif
       FROM utilisateurs WHERE role = 'technicien' ORDER BY nom ASC`
    )

    for (const tech of techniciens) {
      const [cats] = await db.query(
        `SELECT categorie FROM technicien_categories WHERE technicien_id = ?`,
        [tech.id]
      )
      tech.categories = cats.map(c => c.categorie)
    }

    res.status(200).json({ succes: true, techniciens })
  } catch (erreur) {
    console.error('Erreur getTechniciens :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// CATÉGORIES D'UN TECHNICIEN
// GET /api/utilisateurs/:id/categories
// ════════════════════════════════
const getCategoriesTechnicien = async (req, res) => {
  try {
    const [cats] = await db.query(
      `SELECT categorie FROM technicien_categories WHERE technicien_id = ?`,
      [req.params.id]
    )
    res.status(200).json({ succes: true, categories: cats.map(c => c.categorie) })
  } catch (erreur) {
    console.error('Erreur getCategoriesTechnicien :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// METTRE À JOUR LES CATÉGORIES
// PUT /api/utilisateurs/:id/categories
// Body : { categories: ['Informatique', 'Réseau'] }
// ════════════════════════════════
const mettreAJourCategories = async (req, res) => {
  try {
    const { id } = req.params
    const { categories } = req.body

    await db.query('DELETE FROM technicien_categories WHERE technicien_id = ?', [id])

    if (Array.isArray(categories) && categories.length > 0) {
      const valides = categories.filter(c => CATEGORIES_VALIDES.includes(c))
      if (valides.length > 0) {
        const valeurs = valides.map(c => [id, c])
        await db.query(
          'INSERT INTO technicien_categories (technicien_id, categorie) VALUES ?',
          [valeurs]
        )
      }
    }

    res.status(200).json({ succes: true, message: 'Catégories mises à jour' })
  } catch (erreur) {
    console.error('Erreur mettreAJourCategories :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// CRÉER UN TECHNICIEN — Admin
// POST /api/utilisateurs/technicien
// ════════════════════════════════
const creerTechnicien = async (req, res) => {
  try {
    const { nom, prenom, email, telephone, motDePasse, categories } = req.body

    if (!nom || !prenom || !email || !motDePasse) {
      return res.status(400).json({ succes: false, message: 'Tous les champs sont obligatoires' })
    }

    const [existant] = await db.query('SELECT id FROM utilisateurs WHERE email = ?', [email])
    if (existant.length > 0) {
      return res.status(409).json({ succes: false, message: 'Cet email est déjà utilisé' })
    }

    const motDePasseChiffre = await bcrypt.hash(motDePasse, 10)

    const [resultat] = await db.query(
      `INSERT INTO utilisateurs (nom, prenom, email, telephone, mot_de_passe, role)
       VALUES (?, ?, ?, ?, ?, 'technicien')`,
      [nom, prenom, email, telephone || null, motDePasseChiffre]
    )

    const technicienId = resultat.insertId

    if (Array.isArray(categories) && categories.length > 0) {
      const valides = categories.filter(c => CATEGORIES_VALIDES.includes(c))
      if (valides.length > 0) {
        const valeurs = valides.map(c => [technicienId, c])
        await db.query(
          'INSERT INTO technicien_categories (technicien_id, categorie) VALUES ?',
          [valeurs]
        )
      }
    }

    res.status(201).json({ succes: true, message: 'Compte technicien créé avec succès', technicienId })
  } catch (erreur) {
    console.error('Erreur creerTechnicien :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// MODIFIER UN TECHNICIEN — Admin
// PUT /api/utilisateurs/:id
// ════════════════════════════════
const modifierTechnicien = async (req, res) => {
  try {
    const { id } = req.params
    const { nom, prenom, email, telephone } = req.body

    if (!nom || !prenom || !email) {
      return res.status(400).json({ succes: false, message: 'Nom, prénom et email sont obligatoires' })
    }

    const [existant] = await db.query(
      'SELECT id FROM utilisateurs WHERE email = ? AND id != ?', [email, id]
    )
    if (existant.length > 0) {
      return res.status(409).json({ succes: false, message: 'Cet email est déjà utilisé' })
    }

    await db.query(
      'UPDATE utilisateurs SET nom = ?, prenom = ?, email = ?, telephone = ? WHERE id = ?',
      [nom, prenom, email, telephone || null, id]
    )

    res.status(200).json({ succes: true, message: 'Technicien modifié avec succès' })
  } catch (erreur) {
    console.error('Erreur modifierTechnicien :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// ACTIVER / DÉSACTIVER — Admin
// PATCH /api/utilisateurs/:id/toggle
// ════════════════════════════════
const toggleUtilisateur = async (req, res) => {
  try {
    await db.query('UPDATE utilisateurs SET actif = NOT actif WHERE id = ?', [req.params.id])
    res.status(200).json({ succes: true, message: 'Statut modifié avec succès' })
  } catch (erreur) {
    console.error('Erreur toggleUtilisateur :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// SUPPRIMER UN UTILISATEUR — Admin
// DELETE /api/utilisateurs/:id
// ════════════════════════════════
const supprimerUtilisateur = async (req, res) => {
  try {
    const { id } = req.params
    const [utilisateur] = await db.query('SELECT role FROM utilisateurs WHERE id = ?', [id])

    if (utilisateur.length === 0) {
      return res.status(404).json({ succes: false, message: 'Utilisateur introuvable' })
    }
    if (utilisateur[0].role === 'admin') {
      return res.status(403).json({ succes: false, message: 'Impossible de supprimer un administrateur' })
    }

    // Supprimer les catégories manuellement (pas de FK cascade en MyISAM)
    await db.query('DELETE FROM technicien_categories WHERE technicien_id = ?', [id])
    await db.query('DELETE FROM utilisateurs WHERE id = ?', [id])

    res.status(200).json({ succes: true, message: 'Utilisateur supprimé avec succès' })
  } catch (erreur) {
    console.error('Erreur supprimerUtilisateur :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

module.exports = {
  getTousUtilisateurs,
  getTechniciens,
  getCategoriesTechnicien,
  mettreAJourCategories,
  modifierTechnicien,
  creerTechnicien,
  toggleUtilisateur,
  supprimerUtilisateur,
}