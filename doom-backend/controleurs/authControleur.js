// ============================================
// AUTHCONTROLEUR.JS — Gestion de l'authentification
// ✅ Notifie tous les admins à chaque nouvelle inscription client
// ✅ getProfil inclut categories[] pour les techniciens
// ============================================

const bcrypt = require('bcryptjs')
const jwt    = require('jsonwebtoken')
const db     = require('../config/baseDeDonnees')
const { creerNotification } = require('./notificationsControleur')
require('dotenv').config()

// ── Générer un token JWT ──
const genererToken = (utilisateur) => {
  return jwt.sign(
    {
      id:     utilisateur.id,
      email:  utilisateur.email,
      role:   utilisateur.role,
      nom:    utilisateur.nom,
      prenom: utilisateur.prenom,
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  )
}

// ════════════════════════════════
// INSCRIPTION CLIENT
// POST /api/auth/inscription
// ════════════════════════════════
const inscription = async (req, res) => {
  try {
    const { nom, prenom, email, telephone, motDePasse } = req.body

    if (!nom || !prenom || !email || !telephone || !motDePasse) {
      return res.status(400).json({
        succes:  false,
        message: 'Tous les champs sont obligatoires',
      })
    }

    const [utilisateurExistant] = await db.query(
      'SELECT id FROM utilisateurs WHERE email = ?',
      [email]
    )

    if (utilisateurExistant.length > 0) {
      return res.status(409).json({
        succes:  false,
        message: 'Cet email est déjà utilisé',
      })
    }

    const motDePasseChiffre = await bcrypt.hash(motDePasse, 10)

    const [resultat] = await db.query(
      `INSERT INTO utilisateurs (nom, prenom, email, telephone, mot_de_passe, role)
       VALUES (?, ?, ?, ?, ?, 'client')`,
      [nom, prenom, email, telephone, motDePasseChiffre]
    )

    const [nouvelUtilisateur] = await db.query(
      'SELECT id, nom, prenom, email, telephone, role FROM utilisateurs WHERE id = ?',
      [resultat.insertId]
    )

    const token = genererToken(nouvelUtilisateur[0])

    // ── Notifier tous les admins actifs ──
    try {
      const io = req.app.get('io')
      const nomComplet = `${prenom} ${nom}`.trim()

      const [admins] = await db.query(
        `SELECT id FROM utilisateurs WHERE role = 'admin' AND actif = 1`
      )

      for (const admin of admins) {
        await creerNotification({
          db, io,
          destinataireId: admin.id,
          type:           'nouvelle_demande',
          titre:          'Nouveau client inscrit',
          message:        `${nomComplet} vient de créer un compte client (${email})`,
          demandeId:      null,
        })
      }
    } catch (erreurNotif) {
      console.error('Erreur notification inscription (non bloquant) :', erreurNotif)
    }

    console.log('✅ Inscription :', nouvelUtilisateur[0].email, '| Rôle :', nouvelUtilisateur[0].role)

    res.status(201).json({
      succes:      true,
      message:     'Compte créé avec succès',
      token,
      utilisateur: nouvelUtilisateur[0],
    })

  } catch (erreur) {
    console.error('Erreur inscription :', erreur)
    res.status(500).json({
      succes:  false,
      message: "Erreur serveur lors de l'inscription",
    })
  }
}

// ════════════════════════════════
// CONNEXION (tous rôles)
// POST /api/auth/connexion
// ════════════════════════════════
const connexion = async (req, res) => {
  try {
    const { email, motDePasse } = req.body

    if (!email || !motDePasse) {
      return res.status(400).json({
        succes:  false,
        message: 'Email et mot de passe obligatoires',
      })
    }

    const [utilisateurs] = await db.query(
      `SELECT id, nom, prenom, email, telephone, mot_de_passe, role, actif
       FROM utilisateurs WHERE email = ? AND actif = 1`,
      [email]
    )

    if (utilisateurs.length === 0) {
      return res.status(401).json({
        succes:  false,
        message: 'Email ou mot de passe incorrect',
      })
    }

    const utilisateur = utilisateurs[0]

    const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.mot_de_passe)

    if (!motDePasseValide) {
      return res.status(401).json({
        succes:  false,
        message: 'Email ou mot de passe incorrect',
      })
    }

    console.log('✅ Connexion :', utilisateur.email, '| Rôle :', utilisateur.role)

    const token = genererToken(utilisateur)

    const { mot_de_passe, ...utilisateurSansMotDePasse } = utilisateur

    res.status(200).json({
      succes:      true,
      message:     'Connexion réussie',
      token,
      utilisateur: utilisateurSansMotDePasse,
    })

  } catch (erreur) {
    console.error('Erreur connexion :', erreur)
    res.status(500).json({
      succes:  false,
      message: 'Erreur serveur lors de la connexion',
    })
  }
}

// ════════════════════════════════
// PROFIL
// GET /api/auth/profil
// ✅ Inclut categories[] pour les techniciens
//    → accessible sans droits admin,
//      le technicien voit ses propres catégories
// ════════════════════════════════
const getProfil = async (req, res) => {
  try {
    const [utilisateurs] = await db.query(
      `SELECT id, nom, prenom, email, telephone, role, adresse, date_inscription
       FROM utilisateurs WHERE id = ?`,
      [req.utilisateur.id]
    )

    if (utilisateurs.length === 0) {
      return res.status(404).json({
        succes:  false,
        message: 'Utilisateur introuvable',
      })
    }

    const utilisateur = utilisateurs[0]

    // ✅ Si technicien → charger ses catégories depuis technicien_categories
    if (utilisateur.role === 'technicien') {
      const [cats] = await db.query(
        `SELECT categorie FROM technicien_categories WHERE technicien_id = ?`,
        [utilisateur.id]
      )
      utilisateur.categories = cats.map(c => c.categorie)
    } else {
      utilisateur.categories = []
    }

    res.status(200).json({
      succes:      true,
      utilisateur,
    })

  } catch (erreur) {
    console.error('Erreur getProfil :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// MODIFIER PROFIL
// PUT /api/auth/profil
// ════════════════════════════════
const modifierProfil = async (req, res) => {
  try {
    const { nom, prenom, telephone, adresse } = req.body

    await db.query(
      'UPDATE utilisateurs SET nom = ?, prenom = ?, telephone = ?, adresse = ? WHERE id = ?',
      [nom, prenom, telephone, adresse, req.utilisateur.id]
    )

    res.status(200).json({
      succes:  true,
      message: 'Profil mis à jour avec succès',
    })

  } catch (erreur) {
    console.error('Erreur modifierProfil :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

// ════════════════════════════════
// CHANGER MOT DE PASSE
// PUT /api/auth/changer-mot-de-passe
// ════════════════════════════════
const changerMotDePasse = async (req, res) => {
  try {
    const { motDePasseActuel, nouveauMotDePasse } = req.body

    const [utilisateurs] = await db.query(
      'SELECT mot_de_passe FROM utilisateurs WHERE id = ?',
      [req.utilisateur.id]
    )

    const valide = await bcrypt.compare(motDePasseActuel, utilisateurs[0].mot_de_passe)

    if (!valide) {
      return res.status(401).json({
        succes:  false,
        message: 'Mot de passe actuel incorrect',
      })
    }

    const nouveauChiffre = await bcrypt.hash(nouveauMotDePasse, 10)

    await db.query(
      'UPDATE utilisateurs SET mot_de_passe = ? WHERE id = ?',
      [nouveauChiffre, req.utilisateur.id]
    )

    res.status(200).json({
      succes:  true,
      message: 'Mot de passe modifié avec succès',
    })

  } catch (erreur) {
    console.error('Erreur changerMotDePasse :', erreur)
    res.status(500).json({ succes: false, message: 'Erreur serveur' })
  }
}

module.exports = {
  inscription,
  connexion,
  getProfil,
  modifierProfil,
  changerMotDePasse,
}