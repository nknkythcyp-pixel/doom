// ============================================
// PROFILTECHNICIEN.JSX — Profil technicien
// ✅ Lecture seule (modification réservée admin)
// ✅ Catégories lues depuis GET /auth/profil
//    (plus d'appel à la route admin /utilisateurs/:id/categories)
// ✅ Design glassmorphism bleu cohérent
// ✅ Responsive mobile / tablette / desktop
// ============================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexte/AuthContexte'
import api from '../../services/api'
import NotificationsBadge from '../../composants/NotificationsBadge'
import {
  LayoutDashboard, ClipboardList, MessageSquare, User,
  Monitor, Wifi, ShieldCheck, Zap, Home, Wrench,
  Phone, Mail, MapPin, Calendar, Shield,
  LogOut, Loader2, Lock, Info, CheckCircle2,
  AlertCircle,
} from 'lucide-react'

const navItems = [
  { id: 'dashboard',     label: 'Tableau de bord', icone: LayoutDashboard, lien: '/technicien/dashboard'    },
  { id: 'interventions', label: 'Interventions',    icone: ClipboardList,   lien: '/technicien/interventions'},
  { id: 'messages',      label: 'Messages',         icone: MessageSquare,   lien: '/technicien/interventions'},
  { id: 'profil',        label: 'Mon profil',       icone: User,            lien: null                      },
]

const CATEGORIES = [
  { nom: 'Informatique', couleur: '#1d4ed8', bg: '#eff6ff',  border: '#bfdbfe', Icon: Monitor    },
  { nom: 'Réseau',       couleur: '#065f46', bg: '#ecfdf5',  border: '#a7f3d0', Icon: Wifi       },
  { nom: 'Sécurité',     couleur: '#991b1b', bg: '#fef2f2',  border: '#fecaca', Icon: ShieldCheck},
  { nom: 'Électricité',  couleur: '#92400e', bg: '#fffbeb',  border: '#fde68a', Icon: Zap        },
  { nom: 'Domotique',    couleur: '#4c1d95', bg: '#f5f3ff',  border: '#ddd6fe', Icon: Home       },
]

export default function ProfilTechnicien() {
  const navigate        = useNavigate()
  const { utilisateur } = useAuth()
  const [profil,        setProfil]       = useState(null)
  const [categories,    setCategories]   = useState([])
  const [stats,         setStats]        = useState(null)
  const [chargement,    setChargement]   = useState(true)
  const [ongletActif,   setOngletActif]  = useState('profil')

  useEffect(() => {
    const charger = async () => {
      try {
        // ✅ Un seul appel — /auth/profil retourne maintenant
        //    les catégories directement dans utilisateur.categories
        const repProfil = await api.get('/auth/profil')
        const u = repProfil.data.utilisateur

        setProfil(u)

        // Les catégories sont déjà dans la réponse du profil
        setCategories(u.categories || [])

        // Stats interventions — appel séparé inchangé
        const repInter = await api.get('/demandes/technicien/mes-interventions')
        const inter = repInter.data.interventions || []
        setStats({
          total:     inter.length,
          terminees: inter.filter(i => i.statut === 'termine').length,
          enCours:   inter.filter(i => i.statut === 'en_cours').length,
          assignees: inter.filter(i => i.statut === 'assigne').length,
        })
      } catch (err) {
        console.error('Erreur chargement profil :', err)
      } finally {
        setChargement(false)
      }
    }
    charger()
  }, [])

  if (chargement) return (
    <div style={{ fontFamily:"'DM Sans','Inter',sans-serif", background:'linear-gradient(145deg,#b8d4f0 0%,#cfe3f8 35%,#dceeff 65%,#edf5ff 100%)', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ background:'rgba(255,255,255,0.7)', backdropFilter:'blur(20px)', borderRadius:20, padding:'40px 60px', textAlign:'center', border:'1px solid rgba(255,255,255,0.85)' }}>
        <Loader2 size={34} strokeWidth={1.8} color="#1d6ef5" style={{ marginBottom:14, animation:'spin 1s linear infinite' }} />
        <p style={{ fontSize:13, color:'#5a7aaa', fontWeight:600, margin:0 }}>Chargement du profil...</p>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  const initiales = `${profil?.prenom?.charAt(0)||''}${profil?.nom?.charAt(0)||''}`
  const dateInscription = profil?.date_inscription
    ? new Date(profil.date_inscription).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })
    : '—'

  const infos = [
    { icone: User,     label: 'Nom complet',   valeur: `${profil?.prenom || ''} ${profil?.nom || ''}`.trim() || '—' },
    { icone: Mail,     label: 'Adresse email', valeur: profil?.email || '—' },
    { icone: Phone,    label: 'Téléphone',     valeur: profil?.telephone || '—' },
    { icone: MapPin,   label: 'Adresse',       valeur: profil?.adresse || 'Non renseignée' },
    { icone: Calendar, label: 'Membre depuis', valeur: dateInscription },
    { icone: Shield,   label: 'Rôle',          valeur: 'Technicien certifié' },
  ]

  return (
    <div style={{ fontFamily:"'DM Sans','Inter',-apple-system,sans-serif", background:'linear-gradient(145deg,#b8d4f0 0%,#cfe3f8 35%,#dceeff 65%,#edf5ff 100%)', minHeight:'100vh', padding:'24px', boxSizing:'border-box' }}>
      <div style={{ maxWidth:1280, margin:'0 auto', background:'rgba(240,247,255,0.70)', borderRadius:28, backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.88)', boxShadow:'0 8px 40px rgba(20,70,160,0.09)', overflow:'hidden' }}>

        {/* ══ TOPBAR ══ */}
        <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 28px', borderBottom:'1px solid rgba(180,210,255,0.35)', background:'rgba(255,255,255,0.52)', flexWrap:'wrap', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:24 }}>
            <div style={{ fontSize:18, fontWeight:900, color:'#0d2a5c', letterSpacing:'2px', flexShrink:0 }}>
              D<span style={{ color:'#1d6ef5' }}>OO</span>M
            </div>
            <nav style={{ display:'flex', gap:2, background:'rgba(255,255,255,0.72)', padding:5, borderRadius:50, border:'1px solid rgba(190,215,255,0.55)', flexWrap:'wrap' }}>
              {navItems.map(item => {
                const Icn = item.icone
                const isA = ongletActif === item.id
                return (
                  <button key={item.id}
                    onClick={() => { setOngletActif(item.id); if (item.lien) navigate(item.lien) }}
                    style={{ display:'flex', alignItems:'center', gap:6, background:isA?'#1d6ef5':'transparent', border:'none', color:isA?'#fff':'#4a6a9e', fontSize:12.5, fontWeight:600, padding:'8px 16px', borderRadius:50, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s', boxShadow:isA?'0 3px 12px rgba(29,110,245,0.28)':'none' }}
                    onMouseEnter={e => { if (!isA) e.currentTarget.style.background='rgba(29,110,245,0.07)' }}
                    onMouseLeave={e => { if (!isA) e.currentTarget.style.background='transparent' }}
                  >
                    <Icn size={14} strokeWidth={2.2}/>
                    <span className="nav-label">{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:50, padding:'6px 14px', fontSize:11.5, fontWeight:700, color:'#065f46' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#10b981', boxShadow:'0 0 6px #10b981' }}/>
              Disponible
            </div>
            <NotificationsBadge role="technicien"/>
            <button onClick={() => navigate('/connexion')} style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', color:'#ef4444', padding:'8px 16px', borderRadius:50, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              <LogOut size={13} strokeWidth={2.2}/>
              <span className="nav-label">Déconnexion</span>
            </button>
            <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#10b981,#34d399)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#fff', boxShadow:'0 3px 10px rgba(16,185,129,0.3)', flexShrink:0 }}>
              {initiales || 'T'}
            </div>
          </div>
        </header>

        {/* ══ CORPS ══ */}
        <div style={{ padding:'28px 28px 36px' }}>

          {/* ── Bandeau profil ── */}
          <div style={{ background:'linear-gradient(135deg,rgba(13,42,92,0.92) 0%,rgba(29,110,245,0.85) 100%)', borderRadius:22, padding:'32px 32px 28px', marginBottom:24, position:'relative', overflow:'hidden', boxShadow:'0 8px 32px rgba(13,42,92,0.20)' }}>
            <div style={{ position:'absolute', top:-60, right:-60, width:220, height:220, borderRadius:'50%', background:'rgba(255,255,255,0.05)', pointerEvents:'none' }}/>
            <div style={{ position:'absolute', bottom:-40, left:200, width:160, height:160, borderRadius:'50%', background:'rgba(255,255,255,0.04)', pointerEvents:'none' }}/>

            <div style={{ display:'flex', alignItems:'center', gap:24, position:'relative', zIndex:1, flexWrap:'wrap' }}>
              <div style={{ width:80, height:80, borderRadius:'50%', background:'linear-gradient(135deg,#10b981,#34d399)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, fontWeight:900, color:'#fff', boxShadow:'0 6px 20px rgba(16,185,129,0.4)', border:'3px solid rgba(255,255,255,0.25)', flexShrink:0 }}>
                {initiales || 'T'}
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:6 }}>
                  <h1 style={{ fontSize:'clamp(18px,3vw,26px)', fontWeight:900, color:'#fff', letterSpacing:'-0.5px', margin:0 }}>
                    {profil?.prenom} {profil?.nom}
                  </h1>
                  <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:50, background:'rgba(16,185,129,0.2)', color:'#6ee7b7', border:'1px solid rgba(16,185,129,0.3)' }}>
                    Technicien certifié
                  </span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:16, flexWrap:'wrap' }}>
                  <span style={{ fontSize:13, color:'rgba(255,255,255,0.65)', display:'flex', alignItems:'center', gap:5 }}>
                    <Mail size={13} strokeWidth={2}/>{profil?.email || '—'}
                  </span>
                  {profil?.telephone && (
                    <span style={{ fontSize:13, color:'rgba(255,255,255,0.65)', display:'flex', alignItems:'center', gap:5 }}>
                      <Phone size={13} strokeWidth={2}/>{profil.telephone}
                    </span>
                  )}
                </div>
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:7, background:'rgba(255,255,255,0.10)', border:'1px solid rgba(255,255,255,0.20)', borderRadius:12, padding:'10px 16px', flexShrink:0 }}>
                <Lock size={14} strokeWidth={2} color="rgba(255,255,255,0.7)"/>
                <div>
                  <div style={{ fontSize:11.5, fontWeight:700, color:'rgba(255,255,255,0.9)' }}>Profil protégé</div>
                  <div style={{ fontSize:10, color:'rgba(255,255,255,0.5)', marginTop:1 }}>Modifiable par l'admin</div>
                </div>
              </div>
            </div>

            {stats && (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginTop:24, position:'relative', zIndex:1 }}>
                {[
                  { v: stats.total,     l:'Interventions', c:'rgba(255,255,255,0.9)' },
                  { v: stats.terminees, l:'Terminées',     c:'#6ee7b7' },
                  { v: stats.enCours,   l:'En cours',      c:'#93c5fd' },
                  { v: stats.assignees, l:'Assignées',     c:'#fde68a' },
                ].map((s,i) => (
                  <div key={i} style={{ background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, padding:'14px 16px', textAlign:'center' }}>
                    <div style={{ fontSize:'clamp(20px,3vw,28px)', fontWeight:900, color:s.c, letterSpacing:'-1px', lineHeight:1 }}>{s.v}</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', fontWeight:600, marginTop:4 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Grille principale ── */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }} className="profil-grid">

            {/* Informations personnelles */}
            <div style={{ background:'rgba(255,255,255,0.76)', borderRadius:20, overflow:'hidden', border:'1px solid rgba(190,215,255,0.45)', boxShadow:'0 3px 14px rgba(20,70,160,0.04)' }}>
              <div style={{ padding:'16px 22px', borderBottom:'1px solid rgba(190,215,255,0.3)', background:'rgba(255,255,255,0.58)', display:'flex', alignItems:'center', gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:9, background:'rgba(190,215,255,0.35)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <User size={15} strokeWidth={2} color="#3a6aaa"/>
                </div>
                <div>
                  <h2 style={{ fontSize:14, fontWeight:800, color:'#0d2a5c', margin:0 }}>Informations personnelles</h2>
                  <p style={{ fontSize:11, color:'#7a9cc5', margin:'2px 0 0' }}>Données de votre compte</p>
                </div>
              </div>

              <div style={{ padding:'6px 0' }}>
                {infos.map((info, i) => {
                  const Icn = info.icone
                  return (
                    <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'13px 22px', borderBottom:i<infos.length-1?'1px solid rgba(190,215,255,0.18)':'none' }}>
                      <div style={{ width:36, height:36, borderRadius:10, background:'rgba(190,215,255,0.28)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>
                        <Icn size={15} strokeWidth={2} color="#5483B3"/>
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontSize:10, fontWeight:700, color:'#7a9cc5', textTransform:'uppercase', letterSpacing:'1px', marginBottom:4 }}>{info.label}</div>
                        <div style={{ fontSize:13.5, fontWeight:600, color:'#0d2a5c', wordBreak:'break-word', lineHeight:1.4 }}>{info.valeur}</div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div style={{ margin:'0 22px 20px', padding:'12px 14px', background:'rgba(29,110,245,0.05)', border:'1px solid rgba(29,110,245,0.14)', borderRadius:12, display:'flex', alignItems:'flex-start', gap:9 }}>
                <Info size={14} strokeWidth={2} color="#1d6ef5" style={{ flexShrink:0, marginTop:1 }}/>
                <p style={{ fontSize:11.5, color:'#3a6aaa', fontWeight:500, margin:0, lineHeight:1.55 }}>
                  Pour modifier vos informations personnelles, veuillez contacter un administrateur DOOM.
                </p>
              </div>
            </div>

            {/* Catégories + accès rapide */}
            <div style={{ display:'flex', flexDirection:'column', gap:20 }}>

              {/* ✅ Domaines de compétence — lecture seule */}
              <div style={{ background:'rgba(255,255,255,0.76)', borderRadius:20, overflow:'hidden', border:'1px solid rgba(190,215,255,0.45)', boxShadow:'0 3px 14px rgba(20,70,160,0.04)', flex:1 }}>
                <div style={{ padding:'16px 22px', borderBottom:'1px solid rgba(190,215,255,0.3)', background:'rgba(255,255,255,0.58)', display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div style={{ width:32, height:32, borderRadius:9, background:'rgba(190,215,255,0.35)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <Wrench size={15} strokeWidth={2} color="#3a6aaa"/>
                    </div>
                    <div>
                      <h2 style={{ fontSize:14, fontWeight:800, color:'#0d2a5c', margin:0 }}>Domaines de compétence</h2>
                      <p style={{ fontSize:11, color:'#7a9cc5', margin:'2px 0 0' }}>
                        {categories.length > 0
                          ? `${categories.length} domaine${categories.length > 1 ? 's' : ''} assigné${categories.length > 1 ? 's' : ''}`
                          : 'Aucun domaine assigné'
                        }
                      </p>
                    </div>
                  </div>
                  {/* Badge lecture seule discret */}
                  <span style={{ fontSize:10, fontWeight:700, padding:'3px 9px', borderRadius:50, background:'rgba(190,215,255,0.25)', color:'#5a7aaa', border:'1px solid rgba(190,215,255,0.4)', flexShrink:0 }}>
                    Lecture seule
                  </span>
                </div>

                <div style={{ padding:'16px 22px' }}>
                  {categories.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'28px 16px' }}>
                      <AlertCircle size={30} strokeWidth={1.5} color="#7a9cc5" style={{ marginBottom:10 }}/>
                      <p style={{ fontSize:13, color:'#7a9cc5', margin:0 }}>Aucun domaine assigné</p>
                      <p style={{ fontSize:11.5, color:'#a0b4cc', margin:'6px 0 0', lineHeight:1.5 }}>
                        Contactez un administrateur pour configurer vos compétences
                      </p>
                    </div>
                  ) : (
                    <div style={{ display:'flex', flexDirection:'column', gap:9 }}>
                      {CATEGORIES.map(cat => {
                        const estAssigne = categories.includes(cat.nom)
                        const CatIcon    = cat.Icon
                        return (
                          <div key={cat.nom} style={{
                            display:'flex', alignItems:'center', gap:12, padding:'11px 14px',
                            borderRadius:13,
                            border:`1.5px solid ${estAssigne ? cat.border : 'rgba(190,215,255,0.22)'}`,
                            background: estAssigne ? cat.bg : 'rgba(255,255,255,0.35)',
                            opacity: estAssigne ? 1 : 0.4,
                            transition:'all 0.2s',
                          }}>
                            <div style={{ width:36, height:36, borderRadius:10, background:estAssigne ? cat.bg : 'rgba(190,215,255,0.15)', border:`1px solid ${estAssigne ? cat.border : 'rgba(190,215,255,0.25)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                              <CatIcon size={16} strokeWidth={2} color={estAssigne ? cat.couleur : '#a0b4cc'}/>
                            </div>
                            <div style={{ flex:1 }}>
                              <div style={{ fontSize:13, fontWeight:700, color:estAssigne ? cat.couleur : '#7a9cc5' }}>
                                {cat.nom}
                              </div>
                              <div style={{ fontSize:10.5, color:estAssigne ? cat.couleur : '#a0b4cc', opacity:estAssigne?0.8:1, marginTop:2 }}>
                                {estAssigne ? 'Domaine assigné' : 'Non assigné'}
                              </div>
                            </div>
                            {estAssigne && (
                              <CheckCircle2 size={16} strokeWidth={2} color={cat.couleur}/>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Accès rapide */}
              <div style={{ background:'rgba(255,255,255,0.76)', borderRadius:20, padding:'20px 22px', border:'1px solid rgba(190,215,255,0.45)', boxShadow:'0 3px 14px rgba(20,70,160,0.04)' }}>
                <h3 style={{ fontSize:13, fontWeight:800, color:'#0d2a5c', margin:'0 0 14px' }}>Accès rapide</h3>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {[
                    { label:'Mes interventions', desc:"Voir toutes mes missions",  icone:ClipboardList,   lien:'/technicien/interventions', color:'#1d6ef5' },
                    { label:'Tableau de bord',   desc:"Retour à l'accueil",        icone:LayoutDashboard, lien:'/technicien/dashboard',     color:'#10b981' },
                  ].map((item, i) => {
                    const Icn = item.icone
                    return (
                      <button key={i} onClick={() => navigate(item.lien)}
                        style={{ display:'flex', alignItems:'center', gap:12, padding:'11px 14px', borderRadius:12, border:'1px solid rgba(190,215,255,0.3)', background:'rgba(240,247,255,0.5)', cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s', textAlign:'left' }}
                        onMouseEnter={e => { e.currentTarget.style.background='rgba(29,110,245,0.06)'; e.currentTarget.style.borderColor='rgba(29,110,245,0.25)' }}
                        onMouseLeave={e => { e.currentTarget.style.background='rgba(240,247,255,0.5)';  e.currentTarget.style.borderColor='rgba(190,215,255,0.3)' }}>
                        <div style={{ width:34, height:34, borderRadius:9, background:item.color==='#1d6ef5'?'rgba(29,110,245,0.1)':'rgba(16,185,129,0.1)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          <Icn size={16} strokeWidth={2} color={item.color}/>
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:700, color:'#0d2a5c' }}>{item.label}</div>
                          <div style={{ fontSize:11, color:'#7a9cc5' }}>{item.desc}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @media(max-width:900px) { .profil-grid { grid-template-columns: 1fr !important; } }
        @media(max-width:600px) { .nav-label { display: none !important; } }
      `}</style>
    </div>
  )
}