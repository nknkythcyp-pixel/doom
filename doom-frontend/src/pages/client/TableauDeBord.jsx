// ============================================
// TABLEAUDEBORD.JSX — Espace client connecté
// ✅ NotificationsBadge intégré dans le header
// ✅ Responsive : mobile / tablette / desktop
// ✅ Styles légèrement raffinés (même structure)
// ============================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexte/AuthContexte'
import api from '../../services/api'
import NotificationsBadge from '../../composants/NotificationsBadge'
import {
  LayoutDashboard, ClipboardList, MessageSquare, User,
  Plus, Monitor, Radio, Camera, Zap, Home, Wrench,
  Settings, CheckCircle2, Clock, ChevronRight, Loader2,
  PackageOpen, Menu, X,
} from 'lucide-react'

const configStatuts = {
  en_attente: { label: 'En attente', couleur: '#92400e', fond: '#fef3c7', bordure: '#fde68a', dot: '#f59e0b' },
  assigne:    { label: 'Assigné',   couleur: '#1d4ed8', fond: '#dbeafe', bordure: '#bfdbfe', dot: '#3b82f6' },
  en_cours:   { label: 'En cours',  couleur: '#1e40af', fond: '#dbeafe', bordure: '#bfdbfe', dot: '#3b82f6' },
  termine:    { label: 'Terminé',   couleur: '#065f46', fond: '#d1fae5', bordure: '#a7f3d0', dot: '#10b981' },
}

const iconeService = nom => {
  if (!nom) return Wrench
  if (nom.includes('inform') || nom.includes('logiciel')) return Monitor
  if (nom.includes('seau'))  return Radio
  if (nom.includes('surv'))  return Camera
  if (nom.includes('lectr')) return Zap
  if (nom.includes('omot'))  return Home
  return Wrench
}

const navItems = [
  { id: 'dashboard', label: 'Tableau de bord', icone: LayoutDashboard, lien: null               },
  { id: 'demandes',  label: 'Mes demandes',    icone: ClipboardList,   lien: '/client/demandes' },
  { id: 'messages',  label: 'Messages',        icone: MessageSquare,   lien: '/client/demandes' },
  { id: 'profil',    label: 'Mon profil',      icone: User,            lien: '/client/profil'   },
]

const TableauDeBord = () => {
  const navigate = useNavigate()
  const { utilisateur } = useAuth()
  const [demandes, setDemandes]       = useState([])
  const [chargement, setChargement]   = useState(true)
  const [hoveredRow, setHoveredRow]   = useState(null)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [ongletActif, setOngletActif] = useState('dashboard')
  const [menuOuvert, setMenuOuvert]   = useState(false)

  useEffect(() => {
    const charger = async () => {
      try {
        const reponse = await api.get('/demandes/mes-demandes')
        setDemandes(reponse.data.demandes)
      } catch (err) {
        console.error('Erreur chargement demandes :', err)
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [])

  const stats = [
    { label: 'Total',      valeur: demandes.length,                                        icone: ClipboardList, accentBlue: false },
    { label: 'En cours',   valeur: demandes.filter(d => d.statut === 'en_cours').length,   icone: Settings,      accentBlue: true  },
    { label: 'Terminées',  valeur: demandes.filter(d => d.statut === 'termine').length,    icone: CheckCircle2,  accentBlue: false },
    { label: 'En attente', valeur: demandes.filter(d => d.statut === 'en_attente').length, icone: Clock,         accentBlue: false },
  ]

  const raccourcis = [
    { icone: ClipboardList, titre: 'Mes demandes',    desc: 'Toutes vos interventions',       lien: '/client/demandes' },
    { icone: User,          titre: 'Mon profil',      desc: 'Modifier vos informations',      lien: '/client/profil'   },
    { icone: MessageSquare, titre: 'Messages',        desc: 'Conversations avec techniciens', lien: '/client/demandes' },
  ]

  return (
    <div style={{
      fontFamily: "'Plus Jakarta Sans','DM Sans',-apple-system,sans-serif",
      background: 'linear-gradient(145deg,#b8d4f0 0%,#cfe3f8 35%,#dceeff 65%,#edf5ff 100%)',
      minHeight: '100vh', padding: 'clamp(12px,2.5vw,24px)',
      boxSizing: 'border-box',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

        /* ── Responsive helpers ── */
        .tdb-stats  { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
        .tdb-grid   { display:grid; grid-template-columns:auto 1fr; gap:18px; margin-bottom:18px; }
        .tdb-raccourcis { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .tdb-nav-desktop { display:flex; }
        .tdb-nav-mobile  { display:none; }
        .tdb-header-actions { display:flex; align-items:center; gap:10px; }
        .tdb-nouvelle-btn-label { display:inline; }
        .tdb-col-tech   { display:grid; }
        .tdb-col-date   { display:grid; }
        .tdb-table-header { display:grid; }
        .tdb-table-row    { display:grid; }

        /* ── Tablette (≤ 900px) ── */
        @media (max-width: 900px) {
          .tdb-stats  { grid-template-columns:repeat(2,1fr); }
          .tdb-grid   { grid-template-columns:1fr; }
          .tdb-raccourcis { grid-template-columns:repeat(3,1fr); }
          .tdb-table-header { grid-template-columns:1fr 100px 90px !important; }
          .tdb-table-row    { grid-template-columns:1fr 100px 90px !important; }
          .tdb-col-tech   { display:none; }
        }

        /* ── Mobile (≤ 600px) ── */
        @media (max-width: 600px) {
          .tdb-stats  { grid-template-columns:repeat(2,1fr); }
          .tdb-raccourcis { grid-template-columns:1fr; }
          .tdb-nav-desktop { display:none; }
          .tdb-nav-mobile  { display:flex; }
          .tdb-nouvelle-btn-label { display:none; }
          .tdb-table-header { grid-template-columns:1fr 85px !important; }
          .tdb-table-row    { grid-template-columns:1fr 85px !important; }
          .tdb-col-tech   { display:none; }
          .tdb-col-date   { display:none; }
        }

        /* ── Très petit (≤ 380px) ── */
        @media (max-width: 380px) {
          .tdb-stats { grid-template-columns:1fr 1fr; gap:8px; }
          .tdb-raccourcis { grid-template-columns:1fr; }
        }
      `}</style>

      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        background: 'rgba(240,247,255,0.72)',
        borderRadius: 'clamp(16px,2.5vw,28px)',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.90)',
        boxShadow: '0 8px 40px rgba(20,70,160,0.10)',
        overflow: 'hidden',
      }}>

        {/* ══ TOPBAR ══ */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: 'clamp(12px,2vw,16px) clamp(16px,3vw,28px)',
          borderBottom: '1px solid rgba(180,210,255,0.35)',
          background: 'rgba(255,255,255,0.56)',
          gap: 12, flexWrap: 'wrap',
        }}>
          {/* Logo + Nav desktop */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(14px,3vw,36px)' }}>
            <div style={{ fontSize: 'clamp(15px,2vw,18px)', fontWeight: 900, color: '#0d2a5c', letterSpacing: '2px', flexShrink: 0 }}>
              D<span style={{ color: '#1d6ef5' }}>OO</span>M
            </div>

            {/* Nav desktop */}
            <nav className="tdb-nav-desktop" style={{
              gap: 2, background: 'rgba(255,255,255,0.72)',
              padding: 5, borderRadius: 50,
              border: '1px solid rgba(190,215,255,0.55)',
            }}>
              {navItems.map(item => {
                const Icn = item.icone
                const isActive = ongletActif === item.id
                return (
                  <button key={item.id}
                    onClick={() => { setOngletActif(item.id); if (item.lien) navigate(item.lien) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      background: isActive ? '#1d6ef5' : 'transparent',
                      border: 'none', color: isActive ? '#fff' : '#4a6a9e',
                      fontSize: 'clamp(11px,1.2vw,12.5px)', fontWeight: 600,
                      padding: 'clamp(6px,1vw,8px) clamp(10px,1.5vw,18px)',
                      borderRadius: 50, cursor: 'pointer',
                      fontFamily: 'inherit', transition: 'all 0.2s',
                      boxShadow: isActive ? '0 3px 12px rgba(29,110,245,0.28)' : 'none',
                      whiteSpace: 'nowrap',
                    }}>
                    <Icn size={14} strokeWidth={2.2}/>{item.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Actions droite */}
          <div className="tdb-header-actions">
            {/* Bouton nouvelle demande */}
            <button onClick={() => navigate('/client/nouvelle-demande')} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: 'linear-gradient(135deg,#1d6ef5,#3b82f6)',
              color: '#fff', border: 'none',
              padding: 'clamp(8px,1.2vw,10px) clamp(14px,2vw,20px)',
              borderRadius: 50, fontSize: 'clamp(11px,1.2vw,12.5px)', fontWeight: 700,
              cursor: 'pointer', fontFamily: 'inherit',
              boxShadow: '0 4px 14px rgba(29,110,245,0.32)',
              transition: 'transform .15s', flexShrink: 0,
            }}>
              <Plus size={15} strokeWidth={2.5}/>
              <span className="tdb-nouvelle-btn-label">Nouvelle demande</span>
            </button>

            <NotificationsBadge role="client"/>

            {/* Avatar */}
            <div style={{
              width: 'clamp(32px,4vw,38px)', height: 'clamp(32px,4vw,38px)',
              borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg,#1d6ef5,#60a5fa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 'clamp(11px,1.3vw,13px)', fontWeight: 800, color: '#fff',
              boxShadow: '0 3px 10px rgba(29,110,245,0.25)',
            }}>
              {utilisateur?.prenom?.charAt(0) || 'U'}
            </div>

            {/* Burger mobile */}
            <button className="tdb-nav-mobile" onClick={() => setMenuOuvert(v => !v)} style={{
              background: 'rgba(255,255,255,0.72)', border: '1px solid rgba(190,215,255,0.55)',
              borderRadius: 10, width: 36, height: 36,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}>
              {menuOuvert ? <X size={16} color="#0d2a5c"/> : <Menu size={16} color="#0d2a5c"/>}
            </button>
          </div>
        </header>

        {/* Menu mobile déroulant */}
        {menuOuvert && (
          <nav style={{
            background: 'rgba(255,255,255,0.92)', borderBottom: '1px solid rgba(190,215,255,0.4)',
            padding: '8px 16px', animation: 'slideDown .2s ease',
          }}>
            {navItems.map(item => {
              const Icn = item.icone
              const isActive = ongletActif === item.id
              return (
                <button key={item.id}
                  onClick={() => { setOngletActif(item.id); setMenuOuvert(false); if (item.lien) navigate(item.lien) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                    padding: '11px 14px', borderRadius: 12, border: 'none',
                    background: isActive ? 'rgba(29,110,245,0.08)' : 'transparent',
                    color: isActive ? '#1d6ef5' : '#4a6a9e',
                    fontSize: 13, fontWeight: isActive ? 700 : 600,
                    cursor: 'pointer', fontFamily: 'inherit', marginBottom: 2,
                    borderLeft: isActive ? '3px solid #1d6ef5' : '3px solid transparent',
                  }}>
                  <Icn size={16} strokeWidth={2}/>{item.label}
                </button>
              )
            })}
          </nav>
        )}

        {/* ══ CORPS ══ */}
        <div style={{ padding: 'clamp(16px,3vw,28px) clamp(16px,3vw,28px) clamp(20px,3vw,32px)' }}>

          {/* Titre */}
          <div style={{ marginBottom: 'clamp(16px,2.5vw,24px)' }}>
            <p style={{ fontSize: 10.5, fontWeight: 700, color: '#1d6ef5', textTransform: 'uppercase', letterSpacing: '1.8px', marginBottom: 5 }}>
              Espace client
            </p>
            <h1 style={{ fontSize: 'clamp(20px,3.5vw,28px)', fontWeight: 800, color: '#0d2a5c', letterSpacing: '-0.5px', margin: 0 }}>
              Bonjour, {utilisateur?.prenom} 👋
            </h1>
            <p style={{ fontSize: 13, color: '#5a7aaa', margin: '4px 0 0', fontWeight: 500 }}>
              Aperçu de vos interventions
            </p>
          </div>

          {/* ── Stats (toujours en grille, responsive via CSS) ── */}
          <div className="tdb-stats" style={{ marginBottom: 18 }}>
            {stats.map((stat, i) => {
              const Icn = stat.icone
              return (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.78)',
                  borderRadius: 'clamp(12px,1.5vw,18px)',
                  padding: 'clamp(12px,1.8vw,18px)',
                  border: '1px solid rgba(190,215,255,0.45)',
                  boxShadow: '0 2px 12px rgba(20,70,160,0.05)',
                  display: 'flex', alignItems: 'center', gap: 12,
                  transition: 'box-shadow .2s',
                }}>
                  <div style={{
                    width: 'clamp(34px,4vw,42px)', height: 'clamp(34px,4vw,42px)',
                    borderRadius: 11, flexShrink: 0,
                    background: stat.accentBlue ? 'linear-gradient(135deg,#1d6ef5,#60a5fa)' : 'rgba(190,215,255,0.40)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icn size={18} strokeWidth={2} color={stat.accentBlue ? '#fff' : '#3a6aaa'}/>
                  </div>
                  <div>
                    <div style={{ fontSize: 'clamp(20px,3vw,26px)', fontWeight: 800, lineHeight: 1, letterSpacing: '-1px', color: stat.accentBlue ? '#1d6ef5' : '#0d2a5c' }}>
                      {chargement ? '…' : stat.valeur}
                    </div>
                    <div style={{ fontSize: 'clamp(10px,1.2vw,11px)', color: '#5a7aaa', fontWeight: 600, marginTop: 3 }}>{stat.label}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Tableau demandes (pleine largeur) ── */}
          <div style={{
            background: 'rgba(255,255,255,0.78)',
            borderRadius: 'clamp(14px,2vw,20px)',
            overflow: 'hidden',
            border: '1px solid rgba(190,215,255,0.45)',
            boxShadow: '0 3px 18px rgba(20,70,160,0.05)',
            marginBottom: 18,
          }}>
            {/* En-tête tableau */}
            <div style={{
              padding: 'clamp(12px,2vw,16px) clamp(14px,2.5vw,22px)',
              borderBottom: '1px solid rgba(190,215,255,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              background: 'rgba(255,255,255,0.60)', flexWrap: 'wrap', gap: 8,
            }}>
              <div>
                <h2 style={{ fontSize: 'clamp(12px,1.5vw,13.5px)', fontWeight: 800, color: '#0d2a5c', margin: 0 }}>
                  Mes demandes récentes
                </h2>
                <p style={{ fontSize: 11, color: '#5a7aaa', margin: '2px 0 0' }}>{demandes.length} demandes au total</p>
              </div>
              <button onClick={() => navigate('/client/demandes')} style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'rgba(29,110,245,0.08)', border: 'none', color: '#1d6ef5',
                fontSize: 11.5, fontWeight: 700, padding: '6px 14px', borderRadius: 50,
                cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap',
              }}>
                Voir tout <ChevronRight size={13} strokeWidth={2.5}/>
              </button>
            </div>

            {/* En-têtes colonnes */}
            <div className="tdb-table-header" style={{
              gridTemplateColumns: '1fr 155px 105px 125px',
              padding: '9px clamp(14px,2.5vw,22px)',
              gap: 10, background: 'rgba(190,215,255,0.14)',
              borderBottom: '1px solid rgba(190,215,255,0.25)',
            }}>
              <div style={thStyle}>Service</div>
              <div className="tdb-col-tech" style={thStyle}>Technicien</div>
              <div style={thStyle}>Urgence</div>
              <div style={thStyle}>Statut</div>
            </div>

            {/* Chargement */}
            {chargement && (
              <div style={{ padding: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <Loader2 size={20} strokeWidth={2} color="#1d6ef5" style={{ animation: 'spin 1s linear infinite' }}/>
                <span style={{ fontSize: 13, color: '#5a7aaa' }}>Chargement...</span>
              </div>
            )}

            {/* État vide */}
            {!chargement && demandes.length === 0 && (
              <div style={{ padding: 'clamp(32px,5vw,48px)', textAlign: 'center' }}>
                <PackageOpen size={36} strokeWidth={1.5} color="#7a9cc5" style={{ marginBottom: 12 }}/>
                <p style={{ fontSize: 13, color: '#5a7aaa', marginBottom: 16 }}>Aucune demande pour l'instant</p>
                <button onClick={() => navigate('/client/nouvelle-demande')} style={{
                  background: 'linear-gradient(135deg,#1d6ef5,#3b82f6)', color: '#fff', border: 'none',
                  padding: '10px 22px', borderRadius: 50, fontSize: 12.5, fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit',
                }}>
                  Faire ma première demande
                </button>
              </div>
            )}

            {/* Lignes */}
            {!chargement && demandes.slice(0, 5).map((demande, i) => {
              const config  = configStatuts[demande.statut] || configStatuts.en_attente
              const isH     = hoveredRow === demande.id
              const SvcIcon = iconeService(demande.service_nom)
              return (
                <div key={demande.id}
                  className="tdb-table-row"
                  onClick={() => navigate(`/client/demandes/${demande.id}`)}
                  onMouseEnter={() => setHoveredRow(demande.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    gridTemplateColumns: '1fr 155px 105px 125px',
                    padding: 'clamp(10px,1.5vw,13px) clamp(14px,2.5vw,22px)',
                    gap: 10, alignItems: 'center', cursor: 'pointer',
                    background: isH ? 'rgba(29,110,245,0.04)' : 'transparent',
                    borderBottom: i < Math.min(demandes.length, 5) - 1 ? '1px solid rgba(190,215,255,0.2)' : 'none',
                    transition: 'background 0.15s',
                  }}>
                  {/* Service */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11, minWidth: 0 }}>
                    <div style={{
                      width: 34, height: 34, background: 'rgba(190,215,255,0.32)',
                      borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                    }}>
                      <SvcIcon size={16} strokeWidth={1.8} color="#3a6aaa"/>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 700, color: '#0d2a5c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {demande.service_nom}
                      </div>
                      <div style={{ fontSize: 10.5, color: '#7a9cc5', marginTop: 2 }}>
                        #{demande.id} · {new Date(demande.date_creation).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>

                  {/* Technicien */}
                  <div className="tdb-col-tech" style={{ alignItems: 'center', gap: 7, flexDirection: 'row', display: 'flex' }}>
                    {demande.technicien_nom ? (
                      <>
                        <div style={{
                          width: 22, height: 22, borderRadius: '50%',
                          background: 'linear-gradient(135deg,#1d6ef5,#60a5fa)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 9, fontWeight: 800, color: '#fff', flexShrink: 0,
                        }}>
                          {demande.technicien_prenom?.charAt(0)}
                        </div>
                        <span style={{ fontSize: 11.5, color: '#2a4a7a', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {demande.technicien_prenom} {demande.technicien_nom}
                        </span>
                      </>
                    ) : (
                      <span style={{ fontSize: 11.5, color: '#a0b4cc', fontStyle: 'italic' }}>Non assigné</span>
                    )}
                  </div>

                  {/* Urgence */}
                  <div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 50,
                      background: (demande.urgence === 'urgent' || demande.urgence === 'critique') ? 'rgba(245,158,11,0.12)' : 'rgba(100,140,200,0.1)',
                      color: (demande.urgence === 'urgent' || demande.urgence === 'critique') ? '#b45309' : '#4a6a9e',
                      border: `1px solid ${(demande.urgence === 'urgent' || demande.urgence === 'critique') ? 'rgba(245,158,11,0.3)' : 'rgba(100,140,200,0.2)'}`,
                      whiteSpace: 'nowrap',
                    }}>
                      {demande.urgence?.charAt(0).toUpperCase() + demande.urgence?.slice(1)}
                    </span>
                  </div>

                  {/* Statut */}
                  <div>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '3px 10px', borderRadius: 50,
                      background: config.fond, color: config.couleur, border: `1px solid ${config.bordure}`,
                      display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap',
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: config.dot, flexShrink: 0 }}/>
                      {config.label}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Raccourcis ── */}
          <div className="tdb-raccourcis">
            {raccourcis.map((item, i) => {
              const Icn = item.icone
              const isH = hoveredCard === i
              return (
                <div key={i} onClick={() => navigate(item.lien)}
                  onMouseEnter={() => setHoveredCard(i)} onMouseLeave={() => setHoveredCard(null)}
                  style={{
                    background: isH ? 'rgba(255,255,255,0.94)' : 'rgba(255,255,255,0.70)',
                    borderRadius: 'clamp(12px,1.5vw,16px)',
                    padding: 'clamp(14px,2vw,18px) clamp(14px,2vw,20px)',
                    cursor: 'pointer',
                    transform: isH ? 'translateY(-4px)' : 'none',
                    boxShadow: isH ? '0 12px 28px rgba(29,110,245,0.12)' : '0 2px 12px rgba(20,70,160,0.05)',
                    transition: 'all .22s cubic-bezier(0.25,0.8,0.25,1)',
                    display: 'flex', alignItems: 'center', gap: 14,
                    border: `1px solid ${isH ? 'rgba(29,110,245,0.15)' : 'rgba(190,215,255,0.45)'}`,
                  }}>
                  <div style={{
                    width: 'clamp(36px,4vw,44px)', height: 'clamp(36px,4vw,44px)',
                    borderRadius: 12, flexShrink: 0,
                    background: isH ? 'linear-gradient(135deg,#1d6ef5,#60a5fa)' : 'rgba(190,215,255,0.38)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.22s',
                  }}>
                    <Icn size={20} strokeWidth={1.8} color={isH ? '#fff' : '#3a6aaa'}/>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 'clamp(12px,1.3vw,13px)', fontWeight: 800, color: '#0d2a5c', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.titre}
                    </div>
                    <div style={{ fontSize: 11, color: '#5a7aaa', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.desc}
                    </div>
                  </div>
                  <ChevronRight size={16} strokeWidth={2.2} color={isH ? '#1d6ef5' : 'rgba(150,180,220,0.55)'} style={{ flexShrink: 0 }}/>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

// Style helper
const thStyle = {
  fontSize: 10, fontWeight: 700, color: '#7a9cc5',
  textTransform: 'uppercase', letterSpacing: '0.5px',
}

export default TableauDeBord