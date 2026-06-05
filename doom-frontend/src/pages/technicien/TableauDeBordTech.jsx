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
  LogOut, Loader2, PackageOpen, Menu, X,
} from 'lucide-react'

const configStatuts = {
  assigne:  { label:'Assigné',  couleur:'#1d4ed8', fond:'#dbeafe', bordure:'#bfdbfe', dot:'#3b82f6' },
  en_cours: { label:'En cours', couleur:'#1e40af', fond:'#dbeafe', bordure:'#bfdbfe', dot:'#3b82f6' },
  termine:  { label:'Terminé',  couleur:'#065f46', fond:'#d1fae5', bordure:'#a7f3d0', dot:'#10b981' },
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
  { id:'dashboard',     label:'Tableau de bord', icone:LayoutDashboard, lien:null                        },
  { id:'interventions', label:'Interventions',    icone:ClipboardList,   lien:'/technicien/interventions' },
  { id:'messages',      label:'Messages',         icone:MessageSquare,   lien:'/technicien/interventions' },
  { id:'profil',        label:'Mon profil',       icone:User,            lien:'/technicien/profil'        },
]

const raccourcis = [
  { icone:ClipboardList, titre:'Mes interventions', desc:'Toutes vos missions assignées', lien:'/technicien/interventions' },
  { icone:MessageSquare, titre:'Messages',           desc:'Échanger avec les clients',     lien:'/technicien/interventions' },
  { icone:TrendingUp,    titre:'Mon activité',       desc:'Historique & performances',     lien:'/technicien/interventions' },
]

export default function TableauDeBordTech() {
  const navigate = useNavigate()
  const { utilisateur } = useAuth()
  const [interventions, setInterventions] = useState([])
  const [chargement,    setChargement]    = useState(true)
  const [hoveredRow,    setHoveredRow]    = useState(null)
  const [hoveredCard,   setHoveredCard]   = useState(null)
  const [ongletActif,   setOngletActif]   = useState('dashboard')
  const [menuOuvert,    setMenuOuvert]    = useState(false)

  useEffect(() => {
    const charger = async () => {
      try {
        const r = await api.get('/demandes/technicien/mes-interventions')
        setInterventions(r.data.interventions)
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
    { label:'En cours',  valeur:enCours,   icone:Activity,      accentBlue:true  },
    { label:'Assignées', valeur:assignees,  icone:AlertTriangle, accentBlue:false },
    { label:'Terminées', valeur:terminees,  icone:CheckCircle2,  accentBlue:false },
    { label:'Urgentes',  valeur:urgentes,   icone:Flame,         isRed:true       },
  ]

  return (
    <div style={{ fontFamily:"'DM Sans','Inter',-apple-system,sans-serif", background:'linear-gradient(145deg,#b8d4f0 0%,#cfe3f8 35%,#dceeff 65%,#edf5ff 100%)', minHeight:'100vh', padding:'clamp(12px,2.5vw,24px)', boxSizing:'border-box' }}>
      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }

        /* Stats grid */
        .tdt-stats { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; margin-bottom:18px; }
        /* Grille principale stats-col + tableau */
        .tdt-main-grid { display:grid; grid-template-columns:200px 1fr; gap:18px; margin-bottom:18px; }
        /* Colonnes tableau interventions */
        .tdt-th-grid { display:grid; grid-template-columns:1fr 140px 120px 115px; }
        .tdt-row-grid { display:grid; grid-template-columns:1fr 140px 120px 115px; }
        .tdt-col-lieu { display:flex; }
        .tdt-col-date { display:flex; }
        /* Raccourcis */
        .tdt-raccourcis { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        /* Nav */
        .tdt-nav-desktop { display:flex; }
        .tdt-nav-mobile  { display:none; }
        /* Bouton déco */
        .tdt-dispo-label { display:inline; }
        .tdt-deco-badge  { display:flex; }
        /* Status badge */
        .tdt-status-badge { display:inline-flex; }

        /* ── Tablette (≤ 900px) ── */
        @media (max-width:900px) {
          .tdt-stats { grid-template-columns:repeat(2,1fr); }
          .tdt-main-grid { grid-template-columns:1fr; }
          .tdt-th-grid  { grid-template-columns:1fr 110px 100px !important; }
          .tdt-row-grid { grid-template-columns:1fr 110px 100px !important; }
          .tdt-col-date { display:none !important; }
          .tdt-raccourcis { grid-template-columns:repeat(3,1fr); }
        }

        /* ── Mobile (≤ 600px) ── */
        @media (max-width:600px) {
          .tdt-stats { grid-template-columns:repeat(2,1fr); gap:8px; }
          .tdt-nav-desktop { display:none !important; }
          .tdt-nav-mobile  { display:flex !important; }
          .tdt-th-grid  { grid-template-columns:1fr 90px !important; }
          .tdt-row-grid { grid-template-columns:1fr 90px !important; }
          .tdt-col-lieu { display:none !important; }
          .tdt-col-date { display:none !important; }
          .tdt-raccourcis { grid-template-columns:1fr; }
          .tdt-dispo-label { display:none !important; }
          .tdt-logout-label { display:none !important; }
          .tdt-status-badge { display:none !important; }
        }

        /* ── Très petit (≤ 380px) ── */
        @media (max-width:380px) {
          .tdt-stats { grid-template-columns:1fr 1fr; gap:8px; }
        }
      `}</style>

      <div style={{ maxWidth:'1280px', margin:'0 auto', background:'rgba(240,247,255,0.70)', borderRadius:'clamp(16px,2.5vw,28px)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.88)', boxShadow:'0 8px 40px rgba(20,70,160,0.09)', overflow:'hidden' }}>

        {/* ══ TOPBAR ══ */}
        <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'clamp(12px,2vw,16px) clamp(14px,3vw,28px)', borderBottom:'1px solid rgba(180,210,255,0.35)', background:'rgba(255,255,255,0.52)', gap:12, flexWrap:'wrap' }}>

          <div style={{ display:'flex', alignItems:'center', gap:'clamp(14px,3vw,36px)' }}>
            <div style={{ fontSize:'clamp(15px,2vw,18px)', fontWeight:900, color:'#0d2a5c', letterSpacing:'2px', flexShrink:0 }}>
              D<span style={{ color:'#1d6ef5' }}>OO</span>M
            </div>
            {/* Nav desktop */}
            <nav className="tdt-nav-desktop" style={{ gap:2, background:'rgba(255,255,255,0.72)', padding:5, borderRadius:50, border:'1px solid rgba(190,215,255,0.55)' }}>
              {navItems.map(item => {
                const Icn = item.icone
                const isA = ongletActif === item.id
                return (
                  <button key={item.id}
                    onClick={() => { setOngletActif(item.id); if (item.lien) navigate(item.lien) }}
                    style={{ display:'flex', alignItems:'center', gap:7, background:isA?'#1d6ef5':'transparent', border:'none', color:isA?'#fff':'#4a6a9e', fontSize:'clamp(11px,1.2vw,12.5px)', fontWeight:600, padding:'clamp(6px,0.8vw,8px) clamp(10px,1.5vw,18px)', borderRadius:50, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s', boxShadow:isA?'0 3px 12px rgba(29,110,245,0.28)':'none', whiteSpace:'nowrap' }}
                    onMouseEnter={e => { if (!isA) e.currentTarget.style.background='rgba(29,110,245,0.07)' }}
                    onMouseLeave={e => { if (!isA) e.currentTarget.style.background='transparent' }}>
                    <Icn size={14} strokeWidth={2.2}/>{item.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Actions droite */}
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            {/* Badge disponible */}
            <div className="tdt-deco-badge" style={{ alignItems:'center', gap:6, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:50, padding:'6px 14px', fontSize:'clamp(10px,1.2vw,11.5px)', fontWeight:700, color:'#065f46' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#10b981', boxShadow:'0 0 6px #10b981', flexShrink:0 }}/>
              <span className="tdt-dispo-label">Disponible</span>
            </div>

            <NotificationsBadge role="technicien"/>

            <button onClick={() => navigate('/connexion')} style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', color:'#ef4444', padding:'clamp(6px,0.8vw,8px) clamp(10px,1.5vw,16px)', borderRadius:50, fontSize:'clamp(10px,1.1vw,12px)', fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              <LogOut size={13} strokeWidth={2.2}/><span className="tdt-logout-label">Déconnexion</span>
            </button>

            <div style={{ width:'clamp(32px,3.5vw,38px)', height:'clamp(32px,3.5vw,38px)', borderRadius:'50%', background:'linear-gradient(135deg,#10b981,#34d399)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#fff', boxShadow:'0 3px 10px rgba(16,185,129,0.3)', flexShrink:0 }}>
              {utilisateur?.prenom?.charAt(0) || 'T'}
            </div>

            {/* Burger mobile */}
            <button className="tdt-nav-mobile" onClick={() => setMenuOuvert(v=>!v)} style={{ background:'rgba(255,255,255,0.72)', border:'1px solid rgba(190,215,255,0.55)', borderRadius:10, width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
              {menuOuvert ? <X size={16} color="#0d2a5c"/> : <Menu size={16} color="#0d2a5c"/>}
            </button>
          </div>
        </header>

        {/* Menu mobile déroulant */}
        {menuOuvert && (
          <nav style={{ background:'rgba(255,255,255,0.92)', borderBottom:'1px solid rgba(190,215,255,0.4)', padding:'8px 16px', animation:'slideDown .2s ease' }}>
            {navItems.map(item => {
              const Icn = item.icone
              const isA = ongletActif === item.id
              return (
                <button key={item.id}
                  onClick={() => { setOngletActif(item.id); setMenuOuvert(false); if (item.lien) navigate(item.lien) }}
                  style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'11px 14px', borderRadius:12, border:'none', background:isA?'rgba(29,110,245,0.08)':'transparent', color:isA?'#1d6ef5':'#4a6a9e', fontSize:13, fontWeight:isA?700:600, cursor:'pointer', fontFamily:'inherit', marginBottom:2, borderLeft:isA?'3px solid #1d6ef5':'3px solid transparent' }}>
                  <Icn size={16} strokeWidth={2}/>{item.label}
                </button>
              )
            })}
          </nav>
        )}

        {/* ══ CORPS ══ */}
        <div style={{ padding:'clamp(16px,3vw,28px) clamp(14px,3vw,28px) clamp(20px,3vw,32px)' }}>

          {/* Titre */}
          <div style={{ marginBottom:'clamp(16px,2.5vw,24px)' }}>
            <p style={{ fontSize:'clamp(9px,1.1vw,10.5px)', fontWeight:700, color:'#1d6ef5', textTransform:'uppercase', letterSpacing:'1.8px', marginBottom:5 }}>Espace technicien</p>
            <h1 style={{ fontSize:'clamp(20px,3.5vw,28px)', fontWeight:800, color:'#0d2a5c', letterSpacing:'-0.5px', margin:0 }}>
              Bonjour, {utilisateur?.prenom} 👨‍🔧
            </h1>
            <p style={{ fontSize:13, color:'#5a7aaa', margin:'4px 0 0', fontWeight:500 }}>
              {chargement ? 'Chargement...' : `${enCours+assignees} intervention${enCours+assignees>1?'s':''} active${enCours+assignees>1?'s':''} aujourd'hui`}
            </p>
          </div>

          {/* ── Stats ── */}
          <div className="tdt-stats">
            {stats.map((stat, i) => {
              const Icn = stat.icone
              return (
                <div key={i} style={{ background:'rgba(255,255,255,0.78)', borderRadius:'clamp(12px,1.5vw,18px)', padding:'clamp(12px,1.8vw,16px)', border:`1px solid ${stat.isRed&&stat.valeur>0?'rgba(239,68,68,0.25)':'rgba(190,215,255,0.45)'}`, boxShadow:'0 2px 12px rgba(20,70,160,0.05)', display:'flex', alignItems:'center', gap:12 }}>
                  <div style={{ width:'clamp(34px,4vw,42px)', height:'clamp(34px,4vw,42px)', borderRadius:11, flexShrink:0, background:stat.accentBlue?'linear-gradient(135deg,#1d6ef5,#60a5fa)':stat.isRed&&stat.valeur>0?'rgba(239,68,68,0.1)':'rgba(190,215,255,0.40)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <Icn size={18} strokeWidth={2} color={stat.accentBlue?'#fff':stat.isRed&&stat.valeur>0?'#ef4444':'#3a6aaa'}/>
                  </div>
                  <div>
                    <div style={{ fontSize:'clamp(20px,3vw,26px)', fontWeight:800, lineHeight:1, letterSpacing:'-1px', color:stat.accentBlue?'#1d6ef5':stat.isRed&&stat.valeur>0?'#ef4444':'#0d2a5c' }}>
                      {chargement ? '…' : stat.valeur}
                    </div>
                    <div style={{ fontSize:'clamp(10px,1.1vw,11px)', color:'#5a7aaa', fontWeight:600, marginTop:3 }}>{stat.label}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Grille principale ── */}
          <div className="tdt-main-grid">

            {/* Stats verticales — cachées sur mobile (remplacées par les 4 stats au-dessus) */}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }} className="tdt-stats-col">
              {stats.map((stat, i) => {
                const Icn = stat.icone
                return (
                  <div key={i} style={{ background:'rgba(255,255,255,0.76)', borderRadius:18, padding:'16px 18px', border:`1px solid ${stat.isRed&&stat.valeur>0?'rgba(239,68,68,0.25)':'rgba(190,215,255,0.45)'}`, boxShadow:'0 3px 14px rgba(20,70,160,0.04)', display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:11, flexShrink:0, background:stat.accentBlue?'linear-gradient(135deg,#1d6ef5,#60a5fa)':stat.isRed&&stat.valeur>0?'rgba(239,68,68,0.1)':'rgba(190,215,255,0.38)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Icn size={18} strokeWidth={2} color={stat.accentBlue?'#fff':stat.isRed&&stat.valeur>0?'#ef4444':'#3a6aaa'}/>
                    </div>
                    <div>
                      <div style={{ fontSize:26, fontWeight:800, lineHeight:1, letterSpacing:'-1px', color:stat.accentBlue?'#1d6ef5':stat.isRed&&stat.valeur>0?'#ef4444':'#0d2a5c' }}>
                        {chargement ? '…' : stat.valeur}
                      </div>
                      <div style={{ fontSize:11, color:'#5a7aaa', fontWeight:600, marginTop:3 }}>{stat.label}</div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Tableau interventions */}
            <div style={{ background:'rgba(255,255,255,0.76)', borderRadius:20, overflow:'hidden', border:'1px solid rgba(190,215,255,0.45)', boxShadow:'0 3px 18px rgba(20,70,160,0.04)' }}>
              <div style={{ padding:'clamp(12px,2vw,16px) clamp(14px,2.5vw,22px)', borderBottom:'1px solid rgba(190,215,255,0.3)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,0.58)', flexWrap:'wrap', gap:8 }}>
                <div>
                  <h2 style={{ fontSize:'clamp(12px,1.5vw,13.5px)', fontWeight:800, color:'#0d2a5c', margin:0 }}>Mes interventions</h2>
                  <p style={{ fontSize:11, color:'#5a7aaa', margin:'2px 0 0' }}>{chargement?'…':interventions.length} au total</p>
                </div>
                <button onClick={() => navigate('/technicien/interventions')} style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(29,110,245,0.08)', border:'none', color:'#1d6ef5', fontSize:11.5, fontWeight:700, padding:'6px 14px', borderRadius:50, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
                  Voir tout <ChevronRight size={13} strokeWidth={2.5}/>
                </button>
              </div>

              {/* En-têtes */}
              <div className="tdt-th-grid" style={{ padding:'9px clamp(14px,2.5vw,22px)', gap:10, background:'rgba(190,215,255,0.14)', borderBottom:'1px solid rgba(190,215,255,0.25)' }}>
                <div style={TH}>Client & service</div>
                <div className="tdt-col-lieu" style={TH}>Lieu</div>
                <div className="tdt-col-date" style={TH}>Date</div>
                <div style={TH}>Statut</div>
              </div>

              {chargement && (
                <div style={{ padding:40, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
                  <Loader2 size={20} strokeWidth={2} color="#1d6ef5" style={{ animation:'spin 1s linear infinite' }}/>
                  <span style={{ fontSize:13, color:'#5a7aaa' }}>Chargement...</span>
                </div>
              )}
              {!chargement && interventions.length === 0 && (
                <div style={{ padding:'clamp(32px,5vw,48px)', textAlign:'center' }}>
                  <PackageOpen size={36} strokeWidth={1.5} color="#7a9cc5" style={{ marginBottom:12 }}/>
                  <p style={{ fontSize:13, color:'#5a7aaa' }}>Aucune intervention assignée</p>
                </div>
              )}
              {!chargement && interventions.slice(0,5).map((inter, i) => {
                const config  = configStatuts[inter.statut] || configStatuts.assigne
                const isH     = hoveredRow === inter.id
                const SvcIcon = iconeService(inter.service_nom)
                const isUrgent = inter.urgence === 'urgent' || inter.urgence === 'critique'
                return (
                  <div key={inter.id}
                    className="tdt-row-grid"
                    onClick={() => navigate(`/technicien/interventions/${inter.id}`)}
                    onMouseEnter={() => setHoveredRow(inter.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ padding:'clamp(10px,1.5vw,13px) clamp(14px,2.5vw,22px)', gap:10, alignItems:'center', cursor:'pointer', background:isH?'rgba(29,110,245,0.04)':'transparent', borderBottom:i<Math.min(interventions.length,5)-1?'1px solid rgba(190,215,255,0.2)':'none', transition:'background 0.15s' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:11, minWidth:0 }}>
                      <div style={{ width:34, height:34, borderRadius:9, background:isUrgent?'rgba(239,68,68,0.1)':'rgba(190,215,255,0.32)', border:isUrgent?'1px solid rgba(239,68,68,0.2)':'none', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                        <SvcIcon size={16} strokeWidth={1.8} color={isUrgent?'#ef4444':'#3a6aaa'}/>
                      </div>
                      <div style={{ minWidth:0 }}>
                        <div style={{ fontSize:'clamp(11px,1.3vw,12.5px)', fontWeight:700, color:'#0d2a5c', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:6 }}>
                          {inter.client_prenom} {inter.client_nom}
                          {isUrgent && <span style={{ fontSize:9, fontWeight:800, padding:'1px 6px', borderRadius:50, background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.2)', flexShrink:0 }}>URGENT</span>}
                        </div>
                        <div style={{ fontSize:'clamp(10px,1.1vw,10.5px)', color:'#7a9cc5', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>#{inter.id} · {inter.service_nom}</div>
                      </div>
                    </div>
                    <div className="tdt-col-lieu" style={{ alignItems:'center', gap:5 }}>
                      <MapPin size={11} strokeWidth={2} color="#7a9cc5"/>
                      <span style={{ fontSize:11, color:'#5a7aaa', fontWeight:500 }}>{inter.lieu==='boutique'?'En boutique':'À domicile'}</span>
                    </div>
                    <div className="tdt-col-date" style={{ alignItems:'center', gap:5 }}>
                      <Calendar size={11} strokeWidth={2} color="#7a9cc5"/>
                      <span style={{ fontSize:11, color:'#5a7aaa', fontWeight:500 }}>{new Date(inter.date_creation).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <span style={{ fontSize:10, fontWeight:700, padding:'4px 10px', borderRadius:50, background:config.fond, color:config.couleur, border:`1px solid ${config.bordure}`, display:'inline-flex', alignItems:'center', gap:5, whiteSpace:'nowrap' }}>
                      <span style={{ width:5, height:5, borderRadius:'50%', background:config.dot, flexShrink:0 }}/>
                      {config.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ── Raccourcis ── */}
          <div className="tdt-raccourcis">
            {raccourcis.map((item, i) => {
              const Icn = item.icone
              const isH = hoveredCard === i
              return (
                <div key={i} onClick={() => navigate(item.lien)}
                  onMouseEnter={() => setHoveredCard(i)} onMouseLeave={() => setHoveredCard(null)}
                  style={{ background:isH?'rgba(255,255,255,0.92)':'rgba(255,255,255,0.66)', borderRadius:'clamp(12px,1.5vw,16px)', padding:'clamp(14px,2vw,20px)', cursor:'pointer', transform:isH?'translateY(-4px)':'none', boxShadow:isH?'0 12px 28px rgba(29,110,245,0.11)':'0 3px 14px rgba(20,70,160,0.04)', transition:'all .22s', display:'flex', alignItems:'center', gap:14, border:`1px solid ${isH?'rgba(29,110,245,0.15)':'rgba(190,215,255,0.45)'}` }}>
                  <div style={{ width:'clamp(36px,4vw,44px)', height:'clamp(36px,4vw,44px)', borderRadius:12, flexShrink:0, background:isH?'linear-gradient(135deg,#1d6ef5,#60a5fa)':'rgba(190,215,255,0.38)', display:'flex', alignItems:'center', justifyContent:'center', transition:'background .22s' }}>
                    <Icn size={19} strokeWidth={1.8} color={isH?'#fff':'#3a6aaa'}/>
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'clamp(12px,1.3vw,13px)', fontWeight:800, color:'#0d2a5c', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.titre}</div>
                    <div style={{ fontSize:11, color:'#5a7aaa', fontWeight:500, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{item.desc}</div>
                  </div>
                  <ChevronRight size={16} strokeWidth={2.2} color={isH?'#1d6ef5':'rgba(150,180,220,0.55)'} style={{ flexShrink:0 }}/>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

const TH = { fontSize:10, fontWeight:700, color:'#7a9cc5', textTransform:'uppercase', letterSpacing:'0.5px' }