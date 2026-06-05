// ============================================
// MESDEMANDES.JSX — Liste demandes du client
// Design glassmorphism bleu ciel + Lucide Icons
// ============================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import {
  LayoutDashboard, ClipboardList, MessageSquare, User,
  Plus, Monitor, Radio, Camera, Zap, Home, Wrench,
  ChevronRight, Filter, Inbox,
} from 'lucide-react'

const configStatuts = {
  en_attente: { label: 'En attente', couleur: '#92400e', fond: '#fef3c7', bordure: '#fde68a', dot: '#f59e0b' },
  assigne:    { label: 'Assigné',    couleur: '#1d4ed8', fond: '#dbeafe', bordure: '#bfdbfe', dot: '#3b82f6' },
  en_cours:   { label: 'En cours',   couleur: '#1e40af', fond: '#dbeafe', bordure: '#bfdbfe', dot: '#3b82f6' },
  termine:    { label: 'Terminé',    couleur: '#065f46', fond: '#d1fae5', bordure: '#a7f3d0', dot: '#10b981' },
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
  { id: 'dashboard', label: 'Tableau de bord', icone: LayoutDashboard, lien: '/client/dashboard' },
  { id: 'demandes',  label: 'Mes demandes',    icone: ClipboardList,   lien: '/client/demandes'  },
  { id: 'messages',  label: 'Messages',        icone: MessageSquare,   lien: '/client/messages'  },
  { id: 'profil',    label: 'Mon profil',      icone: User,            lien: '/client/profil'    },
]

const MesDemandes = () => {
  const navigate = useNavigate()

  const [demandes,     setDemandes]     = useState([])
  const [chargement,   setChargement]   = useState(true)
  const [filtreActif,  setFiltreActif]  = useState('tous')
  const [ongletActif,  setOngletActif]  = useState('demandes')
  const [hoveredId,    setHoveredId]    = useState(null)

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

  const demandesFiltrees = demandes.filter(d =>
    filtreActif === 'tous' || d.statut === filtreActif
  )

  const filtres = [
    { val: 'tous',       label: 'Toutes',     count: demandes.length },
    { val: 'en_attente', label: 'En attente', count: demandes.filter(d => d.statut === 'en_attente').length },
    { val: 'en_cours',   label: 'En cours',   count: demandes.filter(d => d.statut === 'en_cours').length   },
    { val: 'termine',    label: 'Terminées',  count: demandes.filter(d => d.statut === 'termine').length    },
  ]

  // ── Chargement ──
  if (chargement) {
    return (
      <div style={{
        fontFamily: "'DM Sans', 'Inter', sans-serif",
        background: 'linear-gradient(145deg, #b8d4f0 0%, #cfe3f8 35%, #dceeff 65%, #edf5ff 100%)',
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: '14px',
      }}>
        <ClipboardList size={36} strokeWidth={1.5} color="#5a7aaa" />
        <p style={{ fontSize: '14px', color: '#5a7aaa', fontWeight: '600', fontFamily: 'inherit' }}>
          Chargement de vos demandes...
        </p>
      </div>
    )
  }

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Inter', -apple-system, sans-serif",
      background: 'linear-gradient(145deg, #b8d4f0 0%, #cfe3f8 35%, #dceeff 65%, #edf5ff 100%)',
      minHeight: '100vh', padding: '24px', boxSizing: 'border-box',
    }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        background: 'rgba(240,247,255,0.70)', borderRadius: '28px',
        backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)',
        border: '1px solid rgba(255,255,255,0.88)',
        boxShadow: '0 8px 40px rgba(20,70,160,0.09)', overflow: 'hidden',
      }}>

        {/* ══ TOPBAR ══ */}
        <header style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 28px',
          borderBottom: '1px solid rgba(180,210,255,0.35)',
          background: 'rgba(255,255,255,0.52)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#0d2a5c', letterSpacing: '2px' }}>
              D<span style={{ color: '#1d6ef5' }}>OO</span>M
            </div>
            <nav style={{
              display: 'flex', gap: '2px',
              background: 'rgba(255,255,255,0.72)', padding: '5px', borderRadius: '50px',
              border: '1px solid rgba(190,215,255,0.55)',
            }}>
              {navItems.map(item => {
                const Icn = item.icone
                const isActive = ongletActif === item.id
                return (
                  <button key={item.id}
                    onClick={() => { setOngletActif(item.id); navigate(item.lien) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '7px',
                      background: isActive ? '#1d6ef5' : 'transparent', border: 'none',
                      color: isActive ? '#fff' : '#4a6a9e',
                      fontSize: '12.5px', fontWeight: '600',
                      padding: '8px 18px', borderRadius: '50px',
                      cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s',
                      boxShadow: isActive ? '0 3px 12px rgba(29,110,245,0.28)' : 'none',
                    }}>
                    <Icn size={14} strokeWidth={2.2} />{item.label}
                  </button>
                )
              })}
            </nav>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate('/client/nouvelle-demande')} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              background: '#1d6ef5', color: '#fff', border: 'none',
              padding: '10px 20px', borderRadius: '50px',
              fontSize: '12.5px', fontWeight: '700', cursor: 'pointer',
              fontFamily: 'inherit', boxShadow: '0 4px 14px rgba(29,110,245,0.32)',
            }}>
              <Plus size={15} strokeWidth={2.5} />Nouvelle demande
            </button>
            <div style={{
              width: '38px', height: '38px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #1d6ef5, #60a5fa)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '13px', fontWeight: '800', color: '#fff',
              boxShadow: '0 3px 10px rgba(29,110,245,0.25)',
            }}>R</div>
          </div>
        </header>

        {/* ══ CORPS ══ */}
        <div style={{ padding: '28px 28px 32px' }}>

          {/* Titre */}
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '10.5px', fontWeight: '700', color: '#1d6ef5', textTransform: 'uppercase', letterSpacing: '1.8px', marginBottom: '5px' }}>
                Espace client
              </p>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0d2a5c', letterSpacing: '-0.5px', margin: 0 }}>
                Mes demandes
              </h1>
              <p style={{ fontSize: '13px', color: '#5a7aaa', margin: '4px 0 0 0', fontWeight: '500' }}>
                {demandes.length} demande{demandes.length > 1 ? 's' : ''} au total
              </p>
            </div>
          </div>

          {/* ── Filtres ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              fontSize: '11px', fontWeight: '700', color: '#7a9cc5',
              marginRight: '4px',
            }}>
              <Filter size={13} strokeWidth={2} />
              Filtrer
            </div>
            {filtres.map(f => (
              <button key={f.val} onClick={() => setFiltreActif(f.val)} style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '7px 14px', borderRadius: '50px',
                border: `1.5px solid ${filtreActif === f.val ? '#1d6ef5' : 'rgba(190,215,255,0.55)'}`,
                background: filtreActif === f.val ? '#1d6ef5' : 'rgba(255,255,255,0.65)',
                color: filtreActif === f.val ? '#fff' : '#4a6a9e',
                fontSize: '12px', fontWeight: '700', cursor: 'pointer',
                fontFamily: 'inherit', transition: 'all 0.18s',
                boxShadow: filtreActif === f.val ? '0 3px 10px rgba(29,110,245,0.22)' : 'none',
              }}>
                {f.label}
                <span style={{
                  background: filtreActif === f.val ? 'rgba(255,255,255,0.25)' : 'rgba(190,215,255,0.4)',
                  color: filtreActif === f.val ? '#fff' : '#4a6a9e',
                  fontSize: '10px', fontWeight: '800',
                  padding: '1px 7px', borderRadius: '50px',
                }}>
                  {f.count}
                </span>
              </button>
            ))}
          </div>

          {/* ── Liste ── */}
          {demandesFiltrees.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '60px 40px',
              background: 'rgba(255,255,255,0.76)', borderRadius: '20px',
              border: '1px solid rgba(190,215,255,0.45)',
              boxShadow: '0 3px 14px rgba(20,70,160,0.04)',
            }}>
              <div style={{
                width: '64px', height: '64px', margin: '0 auto 16px',
                background: 'rgba(190,215,255,0.3)', borderRadius: '18px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Inbox size={30} strokeWidth={1.5} color="#7a9cc5" />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#0d2a5c', marginBottom: '6px' }}>
                Aucune demande
              </h3>
              <p style={{ fontSize: '13px', color: '#7a9cc5' }}>
                Vous n'avez pas encore de demandes dans cette catégorie
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {demandesFiltrees.map(demande => {
                const config  = configStatuts[demande.statut] || configStatuts.en_attente
                const nomSvc  = demande.service_nom || demande.service || 'Service'
                const SvcIcon = iconeService(nomSvc)
                const isH     = hoveredId === demande.id
                const techNom = demande.technicien_nom
                  ? `${demande.technicien_prenom || ''} ${demande.technicien_nom}`.trim()
                  : null

                return (
                  <div
                    key={demande.id}
                    onClick={() => navigate(`/client/demandes/${demande.id}`)}
                    onMouseEnter={() => setHoveredId(demande.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      background: isH ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.76)',
                      border: `1.5px solid ${isH ? 'rgba(29,110,245,0.25)' : 'rgba(190,215,255,0.45)'}`,
                      borderRadius: '18px', padding: '18px 22px',
                      cursor: 'pointer', transition: 'all 0.2s',
                      boxShadow: isH
                        ? '0 8px 24px rgba(29,110,245,0.10)'
                        : '0 3px 14px rgba(20,70,160,0.04)',
                      display: 'grid',
                      gridTemplateColumns: '1fr auto',
                      gap: '16px', alignItems: 'center',
                    }}
                  >
                    {/* ── Infos gauche ── */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                      {/* Icône service */}
                      <div style={{
                        width: '44px', height: '44px', flexShrink: 0,
                        background: isH
                          ? 'linear-gradient(135deg, rgba(29,110,245,0.15), rgba(96,165,250,0.15))'
                          : 'rgba(190,215,255,0.28)',
                        border: `1px solid ${isH ? 'rgba(29,110,245,0.2)' : 'rgba(190,215,255,0.4)'}`,
                        borderRadius: '12px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.2s',
                      }}>
                        <SvcIcon size={20} strokeWidth={1.8} color={isH ? '#1d6ef5' : '#5a7aaa'} />
                      </div>

                      <div>
                        {/* Nom service */}
                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#0d2a5c', marginBottom: '4px' }}>
                          {nomSvc}
                        </div>

                        {/* Méta */}
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          fontSize: '11.5px', color: '#7a9cc5', marginBottom: '6px',
                          flexWrap: 'wrap',
                        }}>
                          <span style={{ fontWeight: '600' }}>#{demande.id}</span>
                          <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(190,215,255,0.8)', flexShrink: 0 }} />
                          <span>{new Date(demande.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          <span style={{ width: '3px', height: '3px', borderRadius: '50%', background: 'rgba(190,215,255,0.8)', flexShrink: 0 }} />
                          {techNom ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <User size={11} strokeWidth={2} />
                              {techNom}
                            </span>
                          ) : (
                            <span style={{ fontStyle: 'italic', color: '#a0b4cc' }}>Non assigné</span>
                          )}
                        </div>

                        {/* Description */}
                        <div style={{
                          fontSize: '12px', color: '#5a7aaa', lineHeight: '1.5',
                          maxWidth: '520px',
                          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
                        }}>
                          {demande.description}
                        </div>
                      </div>
                    </div>

                    {/* ── Badges droite ── */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', alignItems: 'flex-end' }}>
                      {/* Statut */}
                      <span style={{
                        fontSize: '10.5px', fontWeight: '700',
                        padding: '4px 12px', borderRadius: '50px',
                        background: config.fond, color: config.couleur,
                        border: `1px solid ${config.bordure}`,
                        display: 'inline-flex', alignItems: 'center', gap: '5px',
                        whiteSpace: 'nowrap',
                      }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: config.dot, flexShrink: 0 }} />
                        {config.label}
                      </span>

                      {/* Urgence */}
                      <span style={{
                        fontSize: '10.5px', fontWeight: '700',
                        padding: '3px 10px', borderRadius: '50px',
                        background: (demande.urgence === 'urgent' || demande.urgence === 'critique')
                          ? 'rgba(245,158,11,0.10)' : 'rgba(190,215,255,0.25)',
                        color: (demande.urgence === 'urgent' || demande.urgence === 'critique')
                          ? '#b45309' : '#4a6a9e',
                        border: `1px solid ${(demande.urgence === 'urgent' || demande.urgence === 'critique')
                          ? 'rgba(245,158,11,0.3)' : 'rgba(190,215,255,0.4)'}`,
                        whiteSpace: 'nowrap',
                      }}>
                        {demande.urgence
                          ? demande.urgence.charAt(0).toUpperCase() + demande.urgence.slice(1)
                          : '—'}
                      </span>

                      {/* Flèche */}
                      <ChevronRight
                        size={16} strokeWidth={2.2}
                        color={isH ? '#1d6ef5' : 'rgba(150,180,220,0.5)'}
                        style={{ transition: 'color 0.2s' }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MesDemandes