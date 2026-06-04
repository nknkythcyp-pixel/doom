// ============================================
// TABLEAUDEBORDTECH.JSX — Espace technicien
// ✅ NotificationsBadge intégré dans le header
// API réelle + Design glassmorphism bleu
// ============================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexte/AuthContexte'
import api from '../../services/api'
import NotificationsBadge from '../../composants/NotificationsBadge'
import {
  LayoutDashboard, ClipboardList, MessageSquare, User,
  Monitor, Radio, Camera, Zap, Home, Wrench,
  CheckCircle2, AlertTriangle, ChevronRight,
  MapPin, Calendar, TrendingUp, Activity, Flame,
  LogOut, Loader2, PackageOpen,
} from 'lucide-react'

const configStatuts = {
  assigne:  { label: 'Assigné',  couleur: '#1d4ed8', fond: '#dbeafe', bordure: '#bfdbfe', dot: '#3b82f6' },
  en_cours: { label: 'En cours', couleur: '#1e40af', fond: '#dbeafe', bordure: '#bfdbfe', dot: '#3b82f6' },
  termine:  { label: 'Terminé',  couleur: '#065f46', fond: '#d1fae5', bordure: '#a7f3d0', dot: '#10b981' },
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
  { id: 'dashboard',     label: 'Tableau de bord', icone: LayoutDashboard, lien: null                        },
  { id: 'interventions', label: 'Interventions',    icone: ClipboardList,   lien: '/technicien/interventions' },
  { id: 'messages',      label: 'Messages',         icone: MessageSquare,   lien: '/technicien/interventions' },
  { id: 'profil',        label: 'Mon profil',       icone: User,            lien: '/technicien/profil'        },
]

const raccourcis = [
  { icone: ClipboardList, titre: 'Mes interventions', desc: 'Toutes vos missions assignées', lien: '/technicien/interventions' },
  { icone: MessageSquare, titre: 'Messages',           desc: 'Échanger avec les clients',     lien: '/technicien/interventions' },
  { icone: TrendingUp,    titre: 'Mon activité',       desc: 'Historique & performances',     lien: '/technicien/interventions' },
]

export default function TableauDeBordTech() {
  const navigate = useNavigate()
  const { utilisateur } = useAuth()
  const [interventions, setInterventions] = useState([])
  const [chargement,    setChargement]    = useState(true)
  const [hoveredRow,    setHoveredRow]    = useState(null)
  const [hoveredCard,   setHoveredCard]   = useState(null)
  const [ongletActif,   setOngletActif]   = useState('dashboard')

  useEffect(() => {
    const charger = async () => {
      try {
        const reponse = await api.get('/demandes/technicien/mes-interventions')
        setInterventions(reponse.data.interventions)
      } catch (err) { console.error(err) }
      finally { setChargement(false) }
    }
    charger()
  }, [])

  const enCours   = interventions.filter(i => i.statut === 'en_cours').length
  const assignees = interventions.filter(i => i.statut === 'assigne').length
  const terminees = interventions.filter(i => i.statut === 'termine').length
  const urgentes  = interventions.filter(i => i.urgence === 'urgent' || i.urgence === 'critique').length

  const stats = [
    { label: 'En cours',  valeur: enCours,   icone: Activity,      accentBlue: true  },
    { label: 'Assignées', valeur: assignees,  icone: AlertTriangle, accentBlue: false },
    { label: 'Terminées', valeur: terminees,  icone: CheckCircle2,  accentBlue: false },
    { label: 'Urgentes',  valeur: urgentes,   icone: Flame,         isRed: true       },
  ]

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
              Disponible
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

          {/* Titre */}
          <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontSize: '10.5px', fontWeight: '700', color: '#1d6ef5', textTransform: 'uppercase', letterSpacing: '1.8px', marginBottom: '5px' }}>Espace technicien</p>
              <h1 style={{ fontSize: '28px', fontWeight: '800', color: '#0d2a5c', letterSpacing: '-0.5px', margin: 0 }}>
                Bonjour, {utilisateur?.prenom} 👨‍🔧
              </h1>
              <p style={{ fontSize: '13px', color: '#5a7aaa', margin: '4px 0 0', fontWeight: '500' }}>
                {chargement ? 'Chargement...' : `${enCours + assignees} intervention${enCours + assignees > 1 ? 's' : ''} active${enCours + assignees > 1 ? 's' : ''} aujourd'hui`}
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.76)', borderRadius: '16px', padding: '12px 18px', border: '1px solid rgba(190,215,255,0.45)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
              <div>
                <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#0d2a5c' }}>Disponible</div>
                <div style={{ fontSize: '10.5px', color: '#5a7aaa' }}>Statut actuel</div>
              </div>
            </div>
          </div>

          {/* ══ GRILLE PRINCIPALE ══ */}
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '18px', marginBottom: '18px' }}>

            {/* Stats verticales */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {stats.map((stat, i) => {
                const Icn = stat.icone
                return (
                  <div key={i} style={{ background: 'rgba(255,255,255,0.76)', borderRadius: '18px', padding: '16px 18px', border: `1px solid ${stat.isRed && stat.valeur > 0 ? 'rgba(239,68,68,0.25)' : 'rgba(190,215,255,0.45)'}`, boxShadow: '0 3px 14px rgba(20,70,160,0.04)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '11px', flexShrink: 0, background: stat.accentBlue ? 'linear-gradient(135deg,#1d6ef5,#60a5fa)' : stat.isRed && stat.valeur > 0 ? 'rgba(239,68,68,0.1)' : 'rgba(190,215,255,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icn size={18} strokeWidth={2} color={stat.accentBlue ? '#fff' : stat.isRed && stat.valeur > 0 ? '#ef4444' : '#3a6aaa'} />
                    </div>
                    <div>
                      <div style={{ fontSize: '26px', fontWeight: '800', lineHeight: 1, letterSpacing: '-1px', color: stat.accentBlue ? '#1d6ef5' : stat.isRed && stat.valeur > 0 ? '#ef4444' : '#0d2a5c' }}>
                        {chargement ? '…' : stat.valeur}
                      </div>
                      <div style={{ fontSize: '11px', color: '#5a7aaa', fontWeight: '600', marginTop: '3px' }}>{stat.label}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Tableau des interventions */}
            <div style={{ background: 'rgba(255,255,255,0.76)', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(190,215,255,0.45)', boxShadow: '0 3px 18px rgba(20,70,160,0.04)' }}>
              <div style={{ padding: '16px 22px', borderBottom: '1px solid rgba(190,215,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.58)' }}>
                <div>
                  <h2 style={{ fontSize: '13.5px', fontWeight: '800', color: '#0d2a5c', margin: 0 }}>Mes interventions</h2>
                  <p style={{ fontSize: '11px', color: '#5a7aaa', margin: '2px 0 0' }}>{chargement ? '…' : interventions.length} au total</p>
                </div>
                <button onClick={() => navigate('/technicien/interventions')} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(29,110,245,0.08)', border: 'none', color: '#1d6ef5', fontSize: '11.5px', fontWeight: '700', padding: '6px 14px', borderRadius: '50px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  Voir tout <ChevronRight size={13} strokeWidth={2.5} />
                </button>
              </div>

              {/* En-têtes */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 120px 115px', padding: '9px 22px', gap: '10px', background: 'rgba(190,215,255,0.14)', borderBottom: '1px solid rgba(190,215,255,0.25)' }}>
                {['Client & service', 'Lieu', 'Date', 'Statut'].map((h, i) => (
                  <div key={i} style={{ fontSize: '10px', fontWeight: '700', color: '#7a9cc5', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{h}</div>
                ))}
              </div>

              {/* Chargement */}
              {chargement && (
                <div style={{ padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <Loader2 size={20} strokeWidth={2} color="#1d6ef5" style={{ animation: 'spin 1s linear infinite' }} />
                  <span style={{ fontSize: '13px', color: '#5a7aaa' }}>Chargement...</span>
                </div>
              )}

              {/* Aucune intervention */}
              {!chargement && interventions.length === 0 && (
                <div style={{ padding: '48px', textAlign: 'center' }}>
                  <PackageOpen size={36} strokeWidth={1.5} color="#7a9cc5" style={{ marginBottom: '12px' }} />
                  <p style={{ fontSize: '13px', color: '#5a7aaa' }}>Aucune intervention assignée</p>
                </div>
              )}

              {/* Lignes */}
              {!chargement && interventions.slice(0, 5).map((intervention, i) => {
                const config  = configStatuts[intervention.statut] || configStatuts.assigne
                const isH     = hoveredRow === intervention.id
                const SvcIcon = iconeService(intervention.service_nom)
                const isUrgent = intervention.urgence === 'urgent' || intervention.urgence === 'critique'
                return (
                  <div key={intervention.id}
                    onClick={() => navigate(`/technicien/interventions/${intervention.id}`)}
                    onMouseEnter={() => setHoveredRow(intervention.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ display: 'grid', gridTemplateColumns: '1fr 140px 120px 115px', padding: '13px 22px', gap: '10px', alignItems: 'center', cursor: 'pointer', background: isH ? 'rgba(29,110,245,0.04)' : 'transparent', borderBottom: i < Math.min(interventions.length, 5) - 1 ? '1px solid rgba(190,215,255,0.2)' : 'none', transition: 'background 0.15s' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
                      <div style={{ width: '34px', height: '34px', borderRadius: '9px', background: isUrgent ? 'rgba(239,68,68,0.1)' : 'rgba(190,215,255,0.32)', border: isUrgent ? '1px solid rgba(239,68,68,0.2)' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <SvcIcon size={16} strokeWidth={1.8} color={isUrgent ? '#ef4444' : '#3a6aaa'} />
                      </div>
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#0d2a5c', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {intervention.client_prenom} {intervention.client_nom}
                          {isUrgent && <span style={{ fontSize: '9px', fontWeight: '800', padding: '1px 6px', borderRadius: '50px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)' }}>URGENT</span>}
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#7a9cc5', marginTop: '2px' }}>#{intervention.id} · {intervention.service_nom}</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <MapPin size={11} strokeWidth={2} color="#7a9cc5" />
                      <span style={{ fontSize: '11px', color: '#5a7aaa', fontWeight: '500' }}>{intervention.lieu === 'boutique' ? 'En boutique' : 'À domicile'}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Calendar size={11} strokeWidth={2} color="#7a9cc5" />
                      <span style={{ fontSize: '11px', color: '#5a7aaa', fontWeight: '500' }}>{new Date(intervention.date_creation).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '50px', background: config.fond, color: config.couleur, border: `1px solid ${config.bordure}`, display: 'inline-flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: config.dot, flexShrink: 0 }} />
                      {config.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ══ RACCOURCIS — pleine largeur ══ */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '14px' }}>
            {raccourcis.map((item, i) => {
              const Icn = item.icone
              const isH = hoveredCard === i
              return (
                <div key={i}
                  onClick={() => navigate(item.lien)}
                  onMouseEnter={() => setHoveredCard(i)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ background: isH ? 'rgba(255,255,255,0.92)' : 'rgba(255,255,255,0.66)', borderRadius: '16px', padding: '20px 22px', cursor: 'pointer', transform: isH ? 'translateY(-4px)' : 'none', boxShadow: isH ? '0 12px 28px rgba(29,110,245,0.11)' : '0 3px 14px rgba(20,70,160,0.04)', transition: 'all .22s', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid rgba(190,215,255,0.45)' }}
                >
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: isH ? 'linear-gradient(135deg,#1d6ef5,#60a5fa)' : 'rgba(190,215,255,0.38)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background .22s' }}>
                    <Icn size={19} strokeWidth={1.8} color={isH ? '#fff' : '#3a6aaa'} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#0d2a5c', marginBottom: '3px' }}>{item.titre}</div>
                    <div style={{ fontSize: '11.5px', color: '#5a7aaa', fontWeight: '500' }}>{item.desc}</div>
                  </div>
                  <ChevronRight size={16} strokeWidth={2.2} color={isH ? '#1d6ef5' : 'rgba(150,180,220,0.55)'} style={{ flexShrink: 0, transition: 'color .2s' }} />
                </div>
              )
            })}
          </div>

        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}