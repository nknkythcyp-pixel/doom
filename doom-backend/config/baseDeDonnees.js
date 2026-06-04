// ============================================
// BASEDEDONNEES.JS — Connexion à MySQL
// Crée et exporte le pool de connexions
// ============================================

const mysql = require('mysql2')
require('dotenv').config()

// ── Création du pool de connexions ──
// Un pool permet de gérer plusieurs connexions simultanées
const pool = mysql.createPool({
  host: process.env.DB_HOST,       // Adresse du serveur MySQL
  user: process.env.DB_USER,       // Nom d'utilisateur
  password: process.env.DB_PASSWORD, // Mot de passe
  database: process.env.DB_NAME,   // Nom de la base de données
  waitForConnections: true,        // Attendre si toutes les connexions sont occupées
  connectionLimit: 10,             // Maximum 10 connexions simultanées
  queueLimit: 0,                   // Pas de limite de file d'attente
})

// ── Version avec promesses pour utiliser async/await ──
const poolPromesse = pool.promise()

// ── Test de la connexion au démarrage ──
pool.getConnection((erreur, connexion) => {
  if (erreur) {
    console.error('❌ Erreur de connexion à MySQL :', erreur.message)
    return
  }
  console.log('✅ Connexion à MySQL réussie')
  connexion.release() // Libérer la connexion après le test
})

module.exports = poolPromesse