// ============================================
// APP.JSX — Point d'entrée de l'application
// Routes + Contexte d'authentification
// ============================================

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthFournisseur, useAuth } from './contexte/AuthContexte'
import Navbar from './composants/Navbar'

// ── Pages publiques ──
import Accueil from './pages/publiques/Accueil'
import Services from './pages/publiques/Services'
import DetailService from './pages/publiques/DetailService'
import Connexion from './pages/publiques/Connexion'
import APropos from './pages/publiques/APropos'

// ── Espace client ──
import TableauDeBord from './pages/client/TableauDeBord'
import NouvelleDemande from './pages/client/NouvelleDemande'
import MesDemandes from './pages/client/MesDemandes'
import DetailDemande from './pages/client/DetailDemande'
import Profil from './pages/client/Profil'

// ── Espace technicien ──
import TableauDeBordTech from './pages/technicien/TableauDeBordTech'
import MesInterventions from './pages/technicien/MesInterventions'
import DetailIntervention from './pages/technicien/DetailIntervention'
import ProfilTechnicien from './pages/technicien/ProfilTechnicien'

// ── Espace admin ──
import TableauDeBordAdmin from './pages/admin/TableauDeBordAdmin'
import GestionDemandes from './pages/admin/GestionDemandes'
import GestionServices from './pages/admin/GestionServices'
import GestionUtilisateurs from './pages/admin/GestionUtilisateurs'

// ════════════════════════════════
// COMPOSANT ROUTE PROTÉGÉE
// Redirige vers /connexion si non connecté
// ════════════════════════════════
const RouteProtegee = ({ children, rolesAutorises }) => {
  const { utilisateur, estConnecte } = useAuth()

  // Si pas connecté → rediriger vers connexion
  if (!estConnecte) {
    return <Navigate to="/connexion" replace />
  }

  // Si rôle non autorisé → rediriger vers accueil
  if (rolesAutorises && !rolesAutorises.includes(utilisateur.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

// ════════════════════════════════
// COMPOSANT ROUTES PRINCIPAL
// ════════════════════════════════
const AppRoutes = () => {
  return (
    <>
      {/* Navbar cachée sur la page connexion */}
      <Routes>
        <Route path="/connexion" element={null} />
        <Route path="*" element={<Navbar />} />
      </Routes>

      <Routes>

        {/* ── Pages publiques ── */}
        <Route path="/" element={<Accueil />} />
        <Route path="/services" element={<Services />} />
        <Route path="/services/:id" element={<DetailService />} />
        <Route path="/a-propos" element={<APropos />} />
        <Route path="/connexion" element={<Connexion />} />
        

        {/* ── Espace client (rôle : client) ── */}
        <Route path="/client/dashboard" element={
          <RouteProtegee rolesAutorises={['client']}>
            <TableauDeBord />
          </RouteProtegee>
        } />
        <Route path="/client/nouvelle-demande" element={
          <RouteProtegee rolesAutorises={['client']}>
            <NouvelleDemande />
          </RouteProtegee>
        } />
        <Route path="/client/demandes" element={
          <RouteProtegee rolesAutorises={['client']}>
            <MesDemandes />
          </RouteProtegee>
        } />
        <Route path="/client/demandes/:id" element={
          <RouteProtegee rolesAutorises={['client']}>
            <DetailDemande />
          </RouteProtegee>
        } />
        <Route path="/client/profil" element={
          <RouteProtegee rolesAutorises={['client']}>
            <Profil />
          </RouteProtegee>
        } />

        {/* ── Espace technicien (rôle : technicien) ── */}
        <Route path="/technicien/dashboard" element={
          <RouteProtegee rolesAutorises={['technicien']}>
            <TableauDeBordTech />
          </RouteProtegee>
        } />
        <Route path="/technicien/interventions" element={
          <RouteProtegee rolesAutorises={['technicien']}>
            <MesInterventions />
          </RouteProtegee>
        } />
        <Route path="/technicien/interventions/:id" element={
          <RouteProtegee rolesAutorises={['technicien']}>
            <DetailIntervention />
          </RouteProtegee>
        } />
        <Route path="/technicien/profil" element={ 
          <RouteProtegee rolesAutorises={['technicien']}>
            <ProfilTechnicien />
          </RouteProtegee>
        } />
 
        {/* ── Espace admin (rôle : admin) ── */}
        <Route path="/admin/dashboard" element={
          <RouteProtegee rolesAutorises={['admin']}>
            <TableauDeBordAdmin />
          </RouteProtegee>
        } />
        <Route path="/admin/demandes" element={
          <RouteProtegee rolesAutorises={['admin']}>
            <GestionDemandes />
          </RouteProtegee>
        } />
        <Route path="/admin/services" element={
          <RouteProtegee rolesAutorises={['admin']}>
            <GestionServices />
          </RouteProtegee>
        } />
        <Route path="/admin/utilisateurs" element={
          <RouteProtegee rolesAutorises={['admin']}>
            <GestionUtilisateurs />
          </RouteProtegee>
        } />

        {/* ── Route 404 ── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </>
  )
}

// ════════════════════════════════
// APP PRINCIPALE
// ════════════════════════════════
function App() {
  return (
    <BrowserRouter>
      {/* AuthFournisseur doit être DANS BrowserRouter pour utiliser useNavigate */}
      <AuthFournisseur>
        <AppRoutes />
      </AuthFournisseur>
    </BrowserRouter>
  )
}

export default App