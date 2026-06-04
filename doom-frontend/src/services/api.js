// ============================================
// API.JS — Configuration centrale d'Axios
// Toutes les requêtes passent par ce fichier
// ============================================

import axios from 'axios'

// On définit l'URL de base selon l'environnement
const baseURL = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000/api'          // Si tu es sur ton PC
  : 'https://doom-ech3.onrender.com/api'; // Si tu es sur le site en ligne

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ── Intercepteur de requêtes ──
// Ajoute automatiquement le token JWT à chaque requête
api.interceptors.request.use(
  (config) => {
    // Récupérer le token sauvegardé dans localStorage
    const token = localStorage.getItem('doom_token')

    if (token) {
      // Ajouter le token dans l'en-tête Authorization
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },
  (erreur) => Promise.reject(erreur)
)

// ── Intercepteur de réponses ──
// Gère les erreurs globalement (ex: token expiré)
api.interceptors.response.use(
  (reponse) => reponse,
  (erreur) => {
    // Si le token est expiré ou invalide → déconnecter l'utilisateur
    if (erreur.response?.status === 401) {
      localStorage.removeItem('doom_token')
      localStorage.removeItem('doom_utilisateur')
      window.location.href = '/connexion'
    }
    return Promise.reject(erreur)
  }
)

export default api