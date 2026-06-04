// ============================================
// VERIFIERTOKEN.JS — Middleware d'authentification
// Vérifie que le token JWT est valide
// Protège les routes privées
// ============================================

const jwt = require('jsonwebtoken')
require('dotenv').config()

// ── Middleware principal de vérification ──
const verifierToken = (req, res, next) => {

  // Récupérer le token depuis l'en-tête Authorization
  // Format attendu : "Bearer eyJhbGciOiJ..."
  const entete = req.headers['authorization']

  if (!entete) {
    return res.status(401).json({
      succes: false,
      message: 'Accès refusé — Token manquant',
    })
  }

  // Extraire le token (enlever "Bearer ")
  const token = entete.split(' ')[1]

  if (!token) {
    return res.status(401).json({
      succes: false,
      message: 'Accès refusé — Format de token invalide',
    })
  }

  try {
    // Vérifier et décoder le token
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    // Ajouter les infos de l'utilisateur à la requête
    req.utilisateur = decoded

    // Passer à la route suivante
    next()

  } catch (erreur) {
    return res.status(401).json({
      succes: false,
      message: 'Token invalide ou expiré',
    })
  }
}

// ── Middleware pour vérifier le rôle admin ──
const verifierAdmin = (req, res, next) => {
  if (req.utilisateur.role !== 'admin') {
    return res.status(403).json({
      succes: false,
      message: 'Accès refusé — Droits administrateur requis',
    })
  }
  next()
}

// ── Middleware pour vérifier le rôle technicien ──
const verifierTechnicien = (req, res, next) => {
  if (req.utilisateur.role !== 'technicien' && req.utilisateur.role !== 'admin') {
    return res.status(403).json({
      succes: false,
      message: 'Accès refusé — Droits technicien requis',
    })
  }
  next()
}

module.exports = { verifierToken, verifierAdmin, verifierTechnicien }