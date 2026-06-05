// ============================================
// BASEDEDONNEES.JS — Connexion à MySQL
// Crée et exporte le pool de connexions
// ============================================

// ============================================
// BASEDEDONNEES.JS — Connexion à MySQL
// ============================================

const mysql = require('mysql2')
require('dotenv').config()

// ── Création du pool de connexions ──
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 5, // <--- C'EST ICI QU'IL FAUT METTRE 5
  queueLimit: 0,
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
  connexion.release() 
})

module.exports = poolPromesse