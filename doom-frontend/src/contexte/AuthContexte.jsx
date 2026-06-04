// ============================================
// AUTHCONTEXTE.JSX — Contexte d'authentification
// ✅ Fix redirection : client → / (accueil) d'abord
//    Admin et technicien → leur dashboard directement
// ============================================

import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'

const AuthContexte = createContext()

export const useAuth = () => useContext(AuthContexte)

export const AuthFournisseur = ({ children }) => {
  const navigate = useNavigate()

  const [utilisateur, setUtilisateur] = useState(null)
  const [chargement,  setChargement]  = useState(true)

  // ── Restaurer session au démarrage ──
  useEffect(() => {
    const utilisateurSauvegarde = localStorage.getItem('doom_utilisateur')
    const tokenSauvegarde       = localStorage.getItem('doom_token')
    if (utilisateurSauvegarde && tokenSauvegarde) {
      setUtilisateur(JSON.parse(utilisateurSauvegarde))
    }
    setChargement(false)
  }, [])

  // ════════════════════════════════
  // CONNEXION
  // ════════════════════════════════
  const connexion = async (email, motDePasse) => {
    try {
      const reponse = await api.post('/auth/connexion', { email, motDePasse })
      const { token, utilisateur: user } = reponse.data

      localStorage.setItem('doom_token', token)
      localStorage.setItem('doom_utilisateur', JSON.stringify(user))
      setUtilisateur(user)

      console.log('Rôle reçu :', user.role)

      if (user.role === 'admin') {
        // ← Admin → dashboard admin directement
        navigate('/admin/dashboard')
      } else if (user.role === 'technicien') {
        // ← Technicien → dashboard technicien directement
        navigate('/technicien/dashboard')
      } else {
        // ← Client → page d'accueil publique d'abord
        navigate('/')
      }

      return { succes: true }

    } catch (erreur) {
      console.error('Erreur connexion frontend :', erreur)
      return {
        succes: false,
        message: erreur.response?.data?.message || 'Erreur de connexion',
      }
    }
  }

  // ════════════════════════════════
  // INSCRIPTION
  // ════════════════════════════════
  const inscription = async (donnees) => {
    try {
      const reponse = await api.post('/auth/inscription', donnees)
      const { token, utilisateur: user } = reponse.data

      localStorage.setItem('doom_token', token)
      localStorage.setItem('doom_utilisateur', JSON.stringify(user))
      setUtilisateur(user)

      // ← Nouveau client → page d'accueil publique d'abord
      navigate('/')

      return { succes: true }

    } catch (erreur) {
      return {
        succes: false,
        message: erreur.response?.data?.message || "Erreur lors de l'inscription",
      }
    }
  }

  // ════════════════════════════════
  // DÉCONNEXION
  // ════════════════════════════════
  const deconnexion = () => {
    localStorage.removeItem('doom_token')
    localStorage.removeItem('doom_utilisateur')
    setUtilisateur(null)
    navigate('/connexion')
  }

  const valeur = {
    utilisateur,
    setUtilisateur, // ← exposé pour permettre la mise à jour depuis Profil.jsx
    chargement,
    connexion,
    inscription,
    deconnexion,
    estConnecte:   !!utilisateur,
    estAdmin:      utilisateur?.role === 'admin',
    estTechnicien: utilisateur?.role === 'technicien',
    estClient:     utilisateur?.role === 'client',
  }

  return (
    <AuthContexte.Provider value={valeur}>
      {!chargement && children}
    </AuthContexte.Provider>
  )
}