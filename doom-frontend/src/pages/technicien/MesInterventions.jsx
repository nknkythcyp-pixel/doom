// ============================================
// MESINTERVENTIONS.JSX — Liste interventions
// ✅ NotificationsBadge intégré dans le header
// Design glassmorphism bleu + Lucide Icons
// ============================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexte/AuthContexte'
import api from '../../services/api'
import NotificationsBadge from '../../composants/NotificationsBadge'
import {
  LayoutDashboard, ClipboardList, MessageSquare, User,
  Monitor, Radio, Camera, Zap, Home, Wrench,
  ChevronRight, MapPin, Calendar,
  PackageOpen, Loader2, LogOut, AlertTriangle,
} from 'lucide-react'

const configStatuts = {
  assigne:  { label: 'Assigné',  couleur: '#1d4ed8', fond: 'rgba(59,130,246,0.12)',  bordure: 'rgba(59,130,246,0.3)',  dot: '#3b82f6' },
  en_cours: { label: 'En cours', couleur: '#1e40af', fond: 'rgba(29,110,245,0.12)',  bordure: 'rgba(29,110,245,0.3)',  dot: '#1d6ef5' },
  termine:  { label: 'Terminé',  couleur: '#065f46', fond: 'rgba(16,185,129,0.12)',  bordure: 'rgba(16,185,129,0.3)',  dot: '#10b981' },
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
  { id: 'dashboard',     label: 'Tableau de bord', icone: LayoutDashboard, lien: '/technicien/dashboard'    },
  { id: 'interventions', label: 'Interventions',    icone: ClipboardList,   lien: null                      },
  { id: 'messages',      label: 'Messages',         icone: MessageSquare,   lien: '/technicien/interventions'},
  { id: 'profil',        label: 'Mon profil',       icone: User,            lien: '/technicien/profil'      },
]

export default function MesInterventions() {
  const navigate = useNavigate()
  const { utilisateur } = useAuth()
  const [interventions, setInterventions] = useState([])
  const [chargement,    setChargement]    = useState(true)
  const [filtreActif,   setFiltreActif]   = useState('tous')
  const [hoveredId,     setHoveredId]     = useState(null)
  const [ongletActif,   setOngletActif]   = useState('interventions')

  useEffect(() => {
    const charger = async () => {
      try {
        const reponse = await api.get('/demandes/technicien/mes-interventions')
        setInterventions(reponse.data.interventions)
      } catch (err) {
        console.error('Erreur chargement interventions :', err)
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [])

  const filtrees = interventions.filter(i =>
    filtreActif === 'tous' || i.statut === filtreActif
  )

  const countFor = val => val === 'tous'
    ? interventions.length
    : interventions.filter(i => i.statut === val).length

  const filtres = [
    { val: 'tous',     label: 'Toutes'    },
    { val: 'assigne',  label: 'Assignées' },
    { val: 'en_cours', label: 'En cours'  },
    { val: 'termine',  label: 'Terminées' },
  ]

  // ── Écran chargement ──
  if (chargement) {
    return (
      <div style={{ fontFamily: "'DM Sans','Inter',sans-serif", background: 'linear-gradient(145deg,#b8d4f0 0%,#cfe3f8 35%,#dceeff 65%,#edf5ff 100%)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', borderRadius: '20px', padding: '40px 60px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.85)' }}>
          <Loader2 size={36} strokeWidth={1.8} color="#1d6ef5" style={{ marginBottom: '14px', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: '14px', color: '#5a7aaa', fontWeight: '600', margin: 0 }}>Chargement des interventions...</p>
        </div>
        <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'DM Sans','Inter',-apple-system,sans-serif", background: 'linear-gradient(145deg,#b8d4f0 0%,#cfe3f8 35%,#dceeff 65%,#edf5ff 100%)', minHeight: '100vh', padding: '24px', boxSizing: 'border-box' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', background: 'rgba(240,247,255,0.70)', borderRadius: '28px', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.88)', boxShadow: '0 8px 40px rgba(20,70,160,0.09)', overflow: 'hidden' }}>

        {/* ══ TOPBAR ══ */}
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px', borderBottom: '1px solid rgba(180,210,255,0.35)', background: 'rgba(255,255,255,0.52)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '36px' }}>
            <div style={{ fontSize: '18px', fontWeight: '900', color: '#0d2a5c', letterSpacing: '2px' }}>
              D<span style={{ color: '#1d6ef5' }}>OO</span>M
            </div>
            <nav style={{ display: 'flex', gap: '2px', background: 'rgba(255,255,255,0.72)', padding: '5px', borderRadius: '50px', border: '1px solid rgba(190,215,255,0.55)' }}>
              {navItems.map(item => {
                const Icn = item.icone
                const isA = ongletActif === item.id
                return (
                  <button key={item.id}
                    onClick={() => { setOngletActif(item.id); if (item.lien) navigate(item.lien) }}
                    style={{ display: 'flex', alignItems: 'center', gap: '7px', background: isA ? '#1d6ef5' : 'transparent', border: 'none', color: isA ? '#fff' : '#4a6a9e', fontSize: '12.5px', fontWeight: '600', padding: '8px 18px', borderRadius: '50px', cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.2s', boxShadow: isA ? '0 3px 12px rgba(29,110,245,0.28)' : 'none' }}
                    onMouseEnter={e => { if (!isA) e.currentTarget.style.background = 'rgba(29,110,245,0.07)' }}
                    onMouseLeave={e => { if (!isA) e.currentTarget.style.background = 'transparent' }}
                  >
                    <Icn size={14} strokeWidth={2.2} />{item.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* ── Actions droite ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: '50px', padding: '6px 14px', fontSize: '11.5px', fontWeight: '700', color: '#065f46' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 6px #10b981' }} />
              Technicien
            </div>

            {/* ✅ CLOCHE NOTIFICATIONS */}
            <NotificationsBadge role="technicien" />

            <button onClick={() => navigate('/connexion')} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '8px 16px', borderRadius: '50px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
              <LogOut size={13} strokeWidth={2.2} />Déconnexion
            </button>
            <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg,#10b981,#34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: '800', color: '#fff', boxShadow: '0 3px 10px rgba(16,185,129,0.3)' }}>
              {utilisateur?.prenom?.charAt(0) || 'T'}
            </div>
          </div>
        </header>

        {/* ══ CORPS ══ */}
        <div style={{ padding: '28px 28px 32px' }}>

          {/* Titre + mini stats */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <p style={{ fontSize: '10.5px', fontWeight: '700', color: '#1d6ef5', textTransform: 'uppercase', letterSpacing: '1.8px', margin: '0 0 5px' }}>Technicien</p>
              <h1 style={{ fontSize: '26px', fontWeight: '800', color: '#0d2a5c', letterSpacing: '-0.5px', margin: 0 }}>
                Mes interventions
              </h1>
              <p style={{ fontSize: '13px', color: '#5a7aaa', margin: '4px 0 0', fontWeight: '500' }}>
                {interventions.length} intervention{interventions.length > 1 ? 's' : ''} au total
              </p>
            </div>

            {/* Mini compteurs */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { label: 'En cours',  val: interventions.filter(i => i.statut === 'en_cours').length, color: '#1d6ef5', bg: 'rgba(29,110,245,0.1)',  border: 'rgba(29,110,245,0.2)'  },
                { label: 'Assignées', val: interventions.filter(i => i.statut === 'assigne').length,  color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.2)'  },
                { label: 'Terminées', val: interventions.filter(i => i.statut === 'termine').length,  color: '#10b981', bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.2)'  },
              ].map((s, i) => (
                <div key={i} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: '14px', padding: '10px 18px', textAlign: 'center', backdropFilter: 'blur(8px)' }}>
                  <div style={{ fontSize: '22px', fontWeight: '900', color: s.color, letterSpacing: '-1px', lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: '11px', color: s.color, fontWeight: '600', marginTop: '3px', opacity: .8 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Filtres pills ── */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', flexWrap: 'wrap' }}>
            {filtres.map(f => {
              const isA = filtreActif === f.val
              return (
                <button key={f.val} onClick={() => setFiltreActif(f.val)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '8px 18px', borderRadius: '50px',
                    border: `1.5px solid ${isA ? '#1d6ef5' : 'rgba(190,215,255,0.7)'}`,
                    background: isA ? 'rgba(29,110,245,0.1)' : 'rgba(255,255,255,0.6)',
                    backdropFilter: 'blur(10px)',
                    color: isA ? '#1d6ef5' : '#5a7aaa',
                    fontSize: '12.5px', fontWeight: '700', cursor: 'pointer',
                    fontFamily: 'inherit', transition: 'all .18s',
                  }}
                >
                  {f.label}
                  <span style={{
                    background: isA ? '#1d6ef5' : 'rgba(0,0,0,0.07)',
                    color: isA ? '#fff' : '#7a9cc5',
                    fontSize: '10px', fontWeight: '800',
                    padding: '1px 8px', borderRadius: '50px',
                  }}>
                    {countFor(f.val)}
                  </span>
                </button>
              )
            })}
          </div>

          {/* ── Liste interventions ── */}
          {filtrees.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 40px', background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.85)' }}>
              <PackageOpen size={44} strokeWidth={1.4} color="#7a9cc5" style={{ marginBottom: '14px' }} />
              <p style={{ fontSize: '14px', color: '#5a7aaa', fontWeight: '600', margin: 0 }}>
                Aucune intervention dans cette catégorie
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filtrees.map(intervention => {
                const config   = configStatuts[intervention.statut] || configStatuts.assigne
                const isH      = hoveredId === intervention.id
                const SvcIcon  = iconeService(intervention.service_nom)
                const isUrgent = intervention.urgence === 'urgent' || intervention.urgence === 'critique'
                const date     = new Date(intervention.date_creation).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })

                return (
                  <div key={intervention.id}
                    onClick={() => navigate(`/technicien/interventions/${intervention.id}`)}
                    onMouseEnter={() => setHoveredId(intervention.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{
                      background: isH ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.7)',
                      backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                      border: `1.5px solid ${isH ? 'rgba(29,110,245,0.3)' : 'rgba(255,255,255,0.9)'}`,
                      borderRadius: '18px', padding: '18px 22px',
                      cursor: 'pointer',
                      transform: isH ? 'translateY(-3px)' : 'none',
                      boxShadow: isH ? '0 12px 32px rgba(29,110,245,0.12)' : '0 2px 12px rgba(20,70,160,0.05)',
                      transition: 'all .22s cubic-bezier(.4,0,.2,1)',
                      display: 'grid', gridTemplateColumns: '1fr auto',
                      gap: '20px', alignItems: 'center',
                    }}
                  >
                    {/* Gauche */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '14px', flexShrink: 0,
                        background: isH
                          ? isUrgent ? 'rgba(239,68,68,0.12)' : 'rgba(29,110,245,0.1)'
                          : 'rgba(190,215,255,0.3)',
                        border: isH
                          ? isUrgent ? '1px solid rgba(239,68,68,0.25)' : '1px solid rgba(29,110,245,0.2)'
                          : '1px solid transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'background .22s',
                      }}>
                        <SvcIcon size={22} strokeWidth={1.8}
                          color={isUrgent ? '#ef4444' : isH ? '#1d6ef5' : '#3a6aaa'} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '5px' }}>
                          <span style={{ fontSize: '14.5px', fontWeight: '800', color: '#0d2a5c' }}>
                            {intervention.service_nom}
                          </span>
                          {isUrgent && (
                            <span style={{ fontSize: '9.5px', fontWeight: '800', padding: '2px 9px', borderRadius: '50px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)' }}>
                              URGENT
                            </span>
                          )}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'linear-gradient(135deg,#1d6ef5,#60a5fa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: '800', color: '#fff', flexShrink: 0 }}>
                            {intervention.client_prenom?.charAt(0)}
                          </div>
                          <span style={{ fontSize: '12.5px', color: '#4a6a9e', fontWeight: '600' }}>
                            {intervention.client_prenom} {intervention.client_nom}
                          </span>
                          <span style={{ fontSize: '12px', color: 'rgba(122,156,197,0.5)' }}>·</span>
                          <span style={{ fontSize: '12px', color: '#7a9cc5' }}>#{intervention.id}</span>
                          <span style={{ fontSize: '12px', color: 'rgba(122,156,197,0.5)' }}>·</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={11} strokeWidth={2} color="#7a9cc5" />
                            <span style={{ fontSize: '12px', color: '#7a9cc5' }}>{date}</span>
                          </div>
                        </div>

                        <p style={{ fontSize: '12.5px', color: '#5a7aaa', lineHeight: '1.55', margin: 0, maxWidth: '560px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {intervention.description}
                        </p>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '8px' }}>
                          <MapPin size={11} strokeWidth={2} color="#7a9cc5" />
                          <span style={{ fontSize: '11.5px', color: '#7a9cc5', fontWeight: '500' }}>
                            {intervention.lieu === 'boutique' ? 'En boutique' : intervention.adresse || 'À domicile'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Droite */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end', flexShrink: 0 }}>
                      <span style={{
                        fontSize: '11px', fontWeight: '700', padding: '5px 14px', borderRadius: '50px',
                        background: config.fond, color: config.couleur, border: `1px solid ${config.bordure}`,
                        display: 'inline-flex', alignItems: 'center', gap: '6px',
                      }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: config.dot }} />
                        {config.label}
                      </span>

                      <span style={{
                        fontSize: '10.5px', fontWeight: '700', padding: '3px 11px', borderRadius: '50px',
                        background: isUrgent ? 'rgba(239,68,68,0.1)' : 'rgba(148,163,184,0.12)',
                        color: isUrgent ? '#ef4444' : '#64748b',
                        border: `1px solid ${isUrgent ? 'rgba(239,68,68,0.25)' : 'rgba(148,163,184,0.2)'}`,
                      }}>
                        {intervention.urgence?.charAt(0).toUpperCase() + intervention.urgence?.slice(1)}
                      </span>

                      <ChevronRight size={18} strokeWidth={2.2}
                        color={isH ? '#1d6ef5' : 'rgba(190,215,255,0.7)'}
                        style={{ transition: 'color .2s' }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}