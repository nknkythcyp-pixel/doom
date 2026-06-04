// ============================================
// TABLEAUDEBORDADMIN.JSX
// ✅ Recherche globale dans le header (angle droit)
// ✅ Recherche filtre aussi le tableau "Dernières demandes"
// ✅ Responsive complet
// ============================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ClipboardList, Wrench, Users,
  Plus, Settings, UserCheck, ChevronRight,
  TrendingUp, Loader2, AlertCircle, PackageOpen,
  Trash2, AlertTriangle, Search, X,
} from 'lucide-react'
import api from '../../services/api'
import NotificationsBadge from '../../composants/NotificationsBadge'

const configStatuts = {
  en_attente: { label:'En attente', couleur:'#b45309', fond:'rgba(245,158,11,0.10)', bordure:'rgba(245,158,11,0.28)', dot:'#f59e0b' },
  assigne:    { label:'Assigné',   couleur:'#1d4ed8', fond:'rgba(59,130,246,0.10)',  bordure:'rgba(59,130,246,0.28)',  dot:'#3b82f6' },
  en_cours:   { label:'En cours',  couleur:'#1e40af', fond:'rgba(29,110,245,0.10)',  bordure:'rgba(29,110,245,0.28)',  dot:'#1d6ef5' },
  termine:    { label:'Terminé',   couleur:'#065f46', fond:'rgba(16,185,129,0.10)',  bordure:'rgba(16,185,129,0.28)',  dot:'#10b981' },
}

const navItems = [
  { label:"Vue d'ensemble", icone:LayoutDashboard, lien:null                  },
  { label:'Demandes',       icone:ClipboardList,   lien:'/admin/demandes'     },
  { label:'Services',       icone:Wrench,          lien:'/admin/services'     },
  { label:'Utilisateurs',   icone:Users,           lien:'/admin/utilisateurs' },
]

const raccourcis = [
  { icone:ClipboardList, titre:'Gestion des demandes',     desc:'Assigner et gérer toutes les demandes', lien:'/admin/demandes',     accentColor:'#1d6ef5' },
  { icone:Wrench,        titre:'Gestion des services',     desc:'Ajouter et modifier les services',      lien:'/admin/services',     accentColor:'#3b82f6' },
  { icone:Users,         titre:'Gestion des utilisateurs', desc:'Clients et techniciens inscrits',       lien:'/admin/utilisateurs', accentColor:'#8b5cf6' },
]

export default function TableauDeBordAdmin() {
  const navigate = useNavigate()

  const [hoveredRow,  setHoveredRow]  = useState(null)
  const [hoveredCard, setHoveredCard] = useState(null)
  const [ongletActif, setOngletActif] = useState("Vue d'ensemble")
  const [stats,              setStats]              = useState(null)
  const [dernieresDemandes,  setDernieresDemandes]  = useState([])
  const [chargement,         setChargement]         = useState(true)
  const [chargementDemandes, setChargementDemandes] = useState(true)
  const [erreurStats,        setErreurStats]        = useState('')
  const [demandeASupprimer,  setDemandeASupprimer]  = useState(null)
  const [suppressionEnCours, setSuppressionEnCours] = useState(null)

  // ✅ Recherche globale
  const [recherche,       setRecherche]       = useState('')
  const [rechercheActive, setRechercheActive] = useState(false)

  useEffect(() => {
    const chargerStats = async () => {
      try {
        const reponse = await api.get('/admin/stats')
        setStats(reponse.data)
      } catch {
        try {
          const [repDemandes, repUsers] = await Promise.all([
            api.get('/demandes'),
            api.get('/utilisateurs'),
          ])
          const d = repDemandes.data.demandes || []
          const u = repUsers.data.utilisateurs || []
          setStats({
            totalDemandes:     d.length,
            demandesEnCours:   d.filter(x => x.statut === 'en_cours').length,
            techniciensActifs: u.filter(x => x.role === 'technicien' && x.actif).length,
            clientsInscrits:   u.filter(x => x.role === 'client').length,
          })
        } catch {
          setErreurStats('Impossible de charger les statistiques')
        }
      } finally {
        setChargement(false)
      }
    }
    chargerStats()
  }, [])

  const chargerDemandes = async () => {
    try {
      const reponse = await api.get('/demandes')
      setDernieresDemandes(reponse.data.demandes || [])
    } catch (err) {
      console.error('Erreur chargement dernières demandes :', err)
    } finally {
      setChargementDemandes(false)
    }
  }

  useEffect(() => { chargerDemandes() }, [])

  // ✅ Filtrage par recherche
  const demandesFiltrees = dernieresDemandes.filter(d => {
    const q = recherche.toLowerCase().trim()
    if (!q) return true
    const nomClient  = `${d.client_prenom || ''} ${d.client_nom || ''}`.toLowerCase()
    const nomService = (d.service_nom || d.service || '').toLowerCase()
    const statut     = (configStatuts[d.statut]?.label || '').toLowerCase()
    return nomClient.includes(q) || nomService.includes(q) || statut.includes(q)
  })

  const confirmerSuppression = async () => {
    if (!demandeASupprimer) return
    setSuppressionEnCours(demandeASupprimer.id)
    setDemandeASupprimer(null)
    try {
      await api.delete(`/demandes/${demandeASupprimer.id}`)
      setDernieresDemandes(prev => prev.filter(d => d.id !== demandeASupprimer.id))
      setStats(prev => prev ? {
        ...prev,
        totalDemandes: Math.max(0, (prev.totalDemandes ?? 0) - 1),
        demandesEnCours: demandeASupprimer.statut === 'en_cours'
          ? Math.max(0, (prev.demandesEnCours ?? 0) - 1)
          : prev.demandesEnCours,
      } : prev)
    } catch (err) {
      console.error(err)
      chargerDemandes()
    } finally {
      setSuppressionEnCours(null)
    }
  }

  // ✅ Surligner texte trouvé
  const surlignerTexte = (texte) => {
    if (!recherche.trim()) return texte
    const q   = recherche.trim()
    const idx = texte.toLowerCase().indexOf(q.toLowerCase())
    if (idx === -1) return texte
    return (
      <>
        {texte.slice(0, idx)}
        <mark style={{ background:'rgba(29,110,245,0.15)', color:'#1d4ed8', borderRadius:3, padding:'0 2px', fontWeight:700 }}>
          {texte.slice(idx, idx + q.length)}
        </mark>
        {texte.slice(idx + q.length)}
      </>
    )
  }

  const kpis = [
    { label:'Total demandes',     valeur: chargement?'…':String(stats?.totalDemandes??'—'),     icone:ClipboardList, couleur:'#1d6ef5', delta:'+12 ce mois',    deltaBg:'rgba(16,185,129,0.10)', deltaColor:'#065f46' },
    { label:'En cours',           valeur: chargement?'…':String(stats?.demandesEnCours??'—'),   icone:Settings,      couleur:'#f59e0b', delta:"+3 aujourd'hui", deltaBg:'rgba(16,185,129,0.10)', deltaColor:'#065f46' },
    { label:'Techniciens actifs', valeur: chargement?'…':String(stats?.techniciensActifs??'—'), icone:UserCheck,     couleur:'#10b981', delta:'Inscrits',        deltaBg:'rgba(29,110,245,0.10)', deltaColor:'#1e40af' },
    { label:'Clients inscrits',   valeur: chargement?'…':String(stats?.clientsInscrits??'—'),   icone:Users,         couleur:'#8b5cf6', delta:'+5 ce mois',     deltaBg:'rgba(16,185,129,0.10)', deltaColor:'#065f46' },
  ]

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { day:'numeric', month:'short', year:'numeric' }) : '—'

  return (
    <div style={{ fontFamily:"'DM Sans','Inter',-apple-system,sans-serif", background:'linear-gradient(145deg,#b8d4f0 0%,#cfe3f8 35%,#dceeff 65%,#edf5ff 100%)', minHeight:'100vh', padding:'16px', boxSizing:'border-box' }}>
      <div style={{ maxWidth:'1280px', margin:'0 auto', background:'rgba(240,247,255,0.70)', borderRadius:'28px', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.88)', boxShadow:'0 8px 40px rgba(20,70,160,0.09)', overflow:'hidden' }}>

        {/* ══ TOPBAR ══ */}
        <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:'1px solid rgba(180,210,255,0.35)', background:'rgba(255,255,255,0.52)', gap:12, flexWrap:'wrap' }}>

          {/* Gauche : logo + nav */}
          <div style={{ display:'flex', alignItems:'center', gap:20, flexShrink:0 }}>
            <div style={{ fontSize:18, fontWeight:900, color:'#0d2a5c', letterSpacing:'2px', flexShrink:0 }}>
              DOOM<span style={{ color:'#1d6ef5' }}>.</span>
            </div>
            <nav style={{ display:'flex', gap:2, background:'rgba(255,255,255,0.72)', padding:'4px', borderRadius:50, border:'1px solid rgba(190,215,255,0.55)' }}>
              {navItems.map(item => {
                const Icn = item.icone
                const isActive = ongletActif === item.label
                return (
                  <button key={item.label}
                    onClick={() => { setOngletActif(item.label); if (item.lien) navigate(item.lien) }}
                    style={{ display:'flex', alignItems:'center', gap:6, background:isActive?'#0d2a5c':'transparent', border:'none', color:isActive?'#fff':'#4a6a9e', fontSize:12, fontWeight:600, padding:'7px 14px', borderRadius:50, cursor:'pointer', fontFamily:'inherit', transition:'all 0.2s', boxShadow:isActive?'0 3px 12px rgba(13,42,92,0.22)':'none', whiteSpace:'nowrap' }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background='rgba(29,110,245,0.07)' }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background='transparent' }}
                  >
                    <Icn size={13} strokeWidth={2.2} />
                    <span className="nav-label">{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Droite : recherche + boutons + cloche */}
          <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>

            {/* ✅ Champ de recherche global — angle droit */}
            <div style={{ position:'relative', transition:'width 0.3s ease' }}>
              <Search size={13} strokeWidth={2} color={rechercheActive ? '#1d6ef5' : '#7a9cc5'}
                style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', transition:'color .2s' }} />
              <input
                type="text"
                value={recherche}
                onChange={e => setRecherche(e.target.value)}
                onFocus={() => setRechercheActive(true)}
                onBlur={() => setRechercheActive(false)}
                placeholder="Rechercher…"
                style={{
                  width: rechercheActive || recherche ? 200 : 140,
                  padding:'8px 30px 8px 30px',
                  border:`1.5px solid ${rechercheActive ? '#1d6ef5' : 'rgba(190,215,255,0.55)'}`,
                  borderRadius:50, fontSize:12, outline:'none',
                  fontFamily:'inherit', background:'rgba(255,255,255,0.80)',
                  color:'#0d2a5c', transition:'all 0.3s ease',
                  boxSizing:'border-box',
                }}
              />
              {recherche && (
                <button onClick={() => setRecherche('')}
                  style={{ position:'absolute', right:9, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:2, display:'flex', alignItems:'center' }}>
                  <X size={12} strokeWidth={2.5} color="#7a9cc5" />
                </button>
              )}
            </div>

            <button onClick={() => navigate('/admin/demandes')}
              style={{ background:'rgba(255,255,255,0.85)', border:'1px solid rgba(190,215,255,0.6)', color:'#0d2a5c', padding:'8px 14px', borderRadius:'50px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap' }}>
              <ClipboardList size={13} strokeWidth={2.2} />
              <span className="btn-label">Gérer les demandes</span>
            </button>

            <button onClick={() => navigate('/admin/services')}
              style={{ background:'linear-gradient(135deg,#1d6ef5,#60a5fa)', color:'#fff', border:'none', padding:'8px 14px', borderRadius:'50px', fontSize:12, fontWeight:800, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 16px rgba(29,110,245,0.32)', display:'flex', alignItems:'center', gap:5, whiteSpace:'nowrap' }}>
              <Plus size={14} strokeWidth={2.5} />
              <span className="btn-label">Ajouter un service</span>
            </button>

            <NotificationsBadge role="admin" />
          </div>
        </header>

        {/* ══ CORPS ══ */}
        <div style={{ padding:'20px 20px 28px' }}>

          {/* Titre */}
          <div style={{ marginBottom:'24px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
              <div style={{ width:'44px', height:'44px', background:'linear-gradient(135deg,#1d6ef5,#60a5fa)', borderRadius:'13px', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 14px rgba(29,110,245,0.28)', flexShrink:0 }}>
                <TrendingUp size={20} strokeWidth={2} color="#fff" />
              </div>
              <div>
                <h1 style={{ fontSize:'22px', fontWeight:'800', color:'#0d2a5c', letterSpacing:'-0.5px', margin:0 }}>Tableau de bord</h1>
                <p style={{ fontSize:'12px', color:'#5a7aaa', margin:'2px 0 0', fontWeight:'500' }}>Vue d'ensemble de la plateforme DOOM</p>
              </div>
            </div>
            {chargement && <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:12, color:'#5a7aaa', fontWeight:600 }}><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} />Chargement...</div>}
            {erreurStats && <div style={{ display:'flex', alignItems:'center', gap:7, fontSize:12, color:'#dc2626', background:'rgba(239,68,68,0.07)', padding:'6px 12px', borderRadius:8 }}><AlertCircle size={14} />{erreurStats}</div>}
          </div>

          {/* ══ KPIs ══ */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'14px', marginBottom:'20px' }}>
            {kpis.map((kpi, i) => {
              const Icn = kpi.icone
              return (
                <div key={i} style={{ background:'rgba(255,255,255,0.76)', borderRadius:'18px', padding:'18px', border:'1px solid rgba(190,215,255,0.45)', boxShadow:'0 3px 14px rgba(20,70,160,0.04)', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:'14px' }}>
                    <div style={{ width:'40px', height:'40px', background:'rgba(190,215,255,0.32)', borderRadius:'11px', display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Icn size={18} strokeWidth={1.9} color={kpi.couleur} />
                    </div>
                    <span style={{ fontSize:'10px', fontWeight:'700', color:kpi.deltaColor, background:kpi.deltaBg, padding:'3px 9px', borderRadius:'50px' }}>{kpi.delta}</span>
                  </div>
                  <div>
                    <div style={{ fontSize:'28px', fontWeight:'800', color:kpi.couleur, letterSpacing:'-1px', lineHeight:1, display:'flex', alignItems:'center', gap:'7px' }}>
                      {kpi.valeur}
                      {chargement && <Loader2 size={14} color={kpi.couleur} style={{ opacity:.5, animation:'spin 1s linear infinite' }} />}
                    </div>
                    <div style={{ fontSize:'11.5px', color:'#5a7aaa', fontWeight:'600', marginTop:'7px' }}>{kpi.label}</div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ══ RACCOURCIS ══ */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:'12px', marginBottom:'20px' }}>
            {raccourcis.map((item, i) => {
              const Icn = item.icone
              const isH = hoveredCard === i
              return (
                <div key={i} onClick={() => navigate(item.lien)} onMouseEnter={() => setHoveredCard(i)} onMouseLeave={() => setHoveredCard(null)}
                  style={{ background:isH?'rgba(255,255,255,0.92)':'rgba(255,255,255,0.66)', borderRadius:'16px', padding:'16px 18px', cursor:'pointer', transform:isH?'translateY(-3px)':'none', boxShadow:isH?'0 12px 24px rgba(29,110,245,0.10)':'0 3px 14px rgba(20,70,160,0.04)', transition:'all .22s cubic-bezier(0.25,0.8,0.25,1)', display:'flex', alignItems:'center', gap:'14px', border:'1px solid rgba(190,215,255,0.45)' }}>
                  <div style={{ width:'42px', height:'42px', background:isH?'linear-gradient(135deg,#1d6ef5,#60a5fa)':'rgba(190,215,255,0.35)', borderRadius:'12px', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'background 0.22s' }}>
                    <Icn size={18} strokeWidth={1.8} color={isH?'#fff':item.accentColor} />
                  </div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontSize:'13px', fontWeight:'700', color:'#0d2a5c', marginBottom:'2px' }}>{item.titre}</div>
                    <div style={{ fontSize:'11px', color:'#5a7aaa', fontWeight:'500' }}>{item.desc}</div>
                  </div>
                  <ChevronRight size={15} strokeWidth={2.2} color={isH?'#1d6ef5':'rgba(150,180,220,0.55)'} style={{ flexShrink:0, transition:'color 0.2s' }} />
                </div>
              )
            })}
          </div>

          {/* ══ TABLEAU DERNIÈRES DEMANDES ══ */}
          <div style={{ background:'rgba(255,255,255,0.76)', borderRadius:'20px', overflow:'hidden', border:'1px solid rgba(190,215,255,0.45)', boxShadow:'0 3px 14px rgba(20,70,160,0.04)' }}>

            {/* En-tête du tableau */}
            <div style={{ padding:'14px 20px', borderBottom:'1px solid rgba(190,215,255,0.3)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,0.58)', gap:10, flexWrap:'wrap' }}>
              <div>
                <h3 style={{ fontSize:'13.5px', fontWeight:'700', color:'#0d2a5c', margin:0 }}>Dernières demandes</h3>
                <p style={{ fontSize:'11px', color:'#5a7aaa', margin:'2px 0 0' }}>
                  {recherche
                    ? <><strong style={{ color:'#1d6ef5' }}>{demandesFiltrees.length}</strong> résultat{demandesFiltrees.length>1?'s':''} pour "<strong style={{ color:'#1d6ef5' }}>{recherche}</strong>"</>
                    : 'Données en temps réel depuis la base de données'
                  }
                </p>
              </div>
              <button onClick={() => navigate('/admin/demandes')}
                style={{ display:'flex', alignItems:'center', gap:'4px', background:'rgba(29,110,245,0.08)', border:'none', color:'#1d6ef5', fontSize:'11.5px', fontWeight:'700', padding:'6px 13px', borderRadius:'50px', cursor:'pointer', fontFamily:'inherit', flexShrink:0 }}>
                Voir tout <ChevronRight size={12} strokeWidth={2.5} />
              </button>
            </div>

            {/* Corps */}
            {chargementDemandes ? (
              <div style={{ padding:'36px', display:'flex', alignItems:'center', justifyContent:'center', gap:'10px' }}>
                <Loader2 size={20} strokeWidth={2} color="#1d6ef5" style={{ animation:'spin 1s linear infinite' }} />
                <span style={{ fontSize:'13px', color:'#5a7aaa' }}>Chargement...</span>
              </div>
            ) : dernieresDemandes.length === 0 ? (
              <div style={{ padding:'40px', textAlign:'center' }}>
                <PackageOpen size={32} strokeWidth={1.5} color="#7a9cc5" style={{ marginBottom:'10px' }} />
                <p style={{ fontSize:'13px', color:'#5a7aaa', margin:0 }}>Aucune demande pour l'instant</p>
              </div>
            ) : demandesFiltrees.length === 0 ? (
              <div style={{ padding:'36px', textAlign:'center' }}>
                <Search size={28} strokeWidth={1.5} color="#7a9cc5" style={{ marginBottom:'10px' }} />
                <p style={{ fontSize:'13px', color:'#5a7aaa', margin:'0 0 10px' }}>Aucun résultat pour "<strong>{recherche}</strong>"</p>
                <button onClick={() => setRecherche('')}
                  style={{ background:'rgba(29,110,245,0.08)', border:'none', color:'#1d6ef5', fontSize:'12px', fontWeight:'700', padding:'6px 16px', borderRadius:50, cursor:'pointer', fontFamily:'inherit' }}>
                  Effacer
                </button>
              </div>
            ) : (
              <div style={{ overflowX:'auto' }}>
                <table style={{ width:'100%', borderCollapse:'collapse', minWidth:580 }}>
                  <thead>
                    <tr style={{ background:'rgba(190,215,255,0.14)' }}>
                      {['#','Client','Service','Date','Statut','Action',''].map((col,i) => (
                        <th key={i} style={{ padding:'11px 18px', textAlign:'left', fontSize:'10px', fontWeight:'700', color:i===6?'rgba(220,38,38,0.5)':'#7a9cc5', textTransform:'uppercase', letterSpacing:'0.5px', borderBottom:'1px solid rgba(190,215,255,0.25)', whiteSpace:'nowrap' }}>{col}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {demandesFiltrees.map((demande, i) => {
                      const config   = configStatuts[demande.statut] || configStatuts.en_attente
                      const isH      = hoveredRow === demande.id
                      const enSuppr  = suppressionEnCours === demande.id
                      const nomClient   = demande.client || `${demande.client_prenom||''} ${demande.client_nom||''}`.trim() || '—'
                      const nomService  = demande.service || demande.service_nom || '—'
                      const dateAffichee = demande.date || formatDate(demande.date_creation)

                      return (
                        <tr key={demande.id}
                          onMouseEnter={() => setHoveredRow(demande.id)}
                          onMouseLeave={() => setHoveredRow(null)}
                          style={{ background:enSuppr?'rgba(239,68,68,0.04)':isH?'rgba(29,110,245,0.04)':'transparent', borderBottom:i<demandesFiltrees.length-1?'1px solid rgba(190,215,255,0.2)':'none', transition:'background .15s ease', opacity:enSuppr?0.5:1 }}>
                          <td style={{ padding:'13px 18px', fontSize:'11.5px', color:'#7a9cc5', fontWeight:'600', whiteSpace:'nowrap' }}>#{demande.id}</td>
                          <td style={{ padding:'13px 18px' }}>
                            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                              <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:'linear-gradient(135deg,#1d6ef5,#60a5fa)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'800', color:'#fff', flexShrink:0 }}>
                                {nomClient.charAt(0)}
                              </div>
                              <span style={{ fontSize:'12.5px', color:'#0d2a5c', fontWeight:'700', whiteSpace:'nowrap' }}>{surlignerTexte(nomClient)}</span>
                            </div>
                          </td>
                          <td style={{ padding:'13px 18px', fontSize:'12.5px', color:'#4a6a9e', fontWeight:'500' }}>{surlignerTexte(nomService)}</td>
                          <td style={{ padding:'13px 18px', fontSize:'11.5px', color:'#7a9cc5', fontWeight:'500', whiteSpace:'nowrap' }}>{dateAffichee}</td>
                          <td style={{ padding:'13px 18px' }}>
                            <span style={{ fontSize:'10px', fontWeight:'700', padding:'3px 10px', borderRadius:'50px', background:config.fond, color:config.couleur, border:`1px solid ${config.bordure}`, display:'inline-flex', alignItems:'center', gap:'5px', whiteSpace:'nowrap' }}>
                              <span style={{ width:'5px', height:'5px', borderRadius:'50%', background:config.dot, flexShrink:0 }} />
                              {config.label}
                            </span>
                          </td>
                          <td style={{ padding:'13px 18px' }}>
                            <button onClick={() => navigate('/admin/demandes')} style={{ background:'rgba(29,110,245,0.08)', color:'#1d6ef5', border:'none', padding:'5px 12px', borderRadius:'50px', fontSize:'11px', fontWeight:'700', cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
                              Gérer
                            </button>
                          </td>
                          <td style={{ padding:'13px 14px' }}>
                            {enSuppr ? (
                              <Loader2 size={15} strokeWidth={2} color="#ef4444" style={{ animation:'spin 1s linear infinite', display:'block', margin:'0 auto' }} />
                            ) : (
                              <button
                                onClick={e => { e.stopPropagation(); setDemandeASupprimer({ id:demande.id, client:nomClient, service:nomService, statut:demande.statut }) }}
                                title="Supprimer"
                                style={{ background:'rgba(239,68,68,0.08)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.2)', width:'30px', height:'30px', borderRadius:'8px', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', transition:'all .2s', flexShrink:0 }}
                                onMouseEnter={e => { e.currentTarget.style.background='rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor='rgba(239,68,68,0.4)' }}
                                onMouseLeave={e => { e.currentTarget.style.background='rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor='rgba(239,68,68,0.2)' }}
                              >
                                <Trash2 size={13} strokeWidth={2} />
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══ MODALE SUPPRESSION ══ */}
      {demandeASupprimer && (
        <div style={{ position:'fixed', inset:0, background:'rgba(13,42,92,0.40)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:16 }}
          onClick={() => setDemandeASupprimer(null)}>
          <div style={{ background:'rgba(235,245,255,0.92)', backdropFilter:'blur(28px)', WebkitBackdropFilter:'blur(28px)', borderRadius:'22px', padding:'28px 24px 22px', maxWidth:'340px', width:'100%', border:'1px solid rgba(255,255,255,0.90)', boxShadow:'0 20px 48px rgba(13,42,92,0.16)', textAlign:'center' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ width:'48px', height:'48px', borderRadius:'50%', background:'rgba(220,38,38,0.09)', border:'1px solid rgba(220,38,38,0.18)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <AlertTriangle size={20} strokeWidth={1.8} color="#dc2626" />
            </div>
            <h3 style={{ fontSize:'15px', fontWeight:'800', color:'#0d2a5c', margin:'0 0 6px' }}>Supprimer cette demande ?</h3>
            <p style={{ fontSize:'12px', color:'#5a7aaa', margin:'0 0 6px', lineHeight:1.6 }}>Vous allez supprimer définitivement la demande</p>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'6px', background:'rgba(255,255,255,0.70)', border:'1px solid rgba(190,215,255,0.60)', borderRadius:'50px', padding:'4px 12px', marginBottom:'14px' }}>
              <span style={{ fontSize:'11px', fontWeight:'700', color:'#7a9cc5' }}>#{demandeASupprimer.id}</span>
              <span style={{ width:'3px', height:'3px', borderRadius:'50%', background:'rgba(190,215,255,0.8)' }} />
              <span style={{ fontSize:'12px', fontWeight:'700', color:'#0d2a5c' }}>{demandeASupprimer.client}</span>
            </div>
            <p style={{ fontSize:'11px', color:'#b91c1c', fontWeight:'600', background:'rgba(220,38,38,0.06)', border:'1px solid rgba(220,38,38,0.14)', borderRadius:'10px', padding:'7px 12px', margin:'0 0 20px', lineHeight:1.6 }}>
              Action irréversible — supprimé de la base de données.
            </p>
            <div style={{ display:'flex', gap:'8px', justifyContent:'center' }}>
              <button onClick={() => setDemandeASupprimer(null)}
                style={{ padding:'8px 20px', borderRadius:'50px', background:'rgba(255,255,255,0.70)', border:'1px solid rgba(190,215,255,0.55)', color:'#5a7aaa', fontSize:'12px', fontWeight:'700', cursor:'pointer', fontFamily:'inherit' }}>
                Annuler
              </button>
              <button onClick={confirmerSuppression}
                style={{ display:'flex', alignItems:'center', gap:'6px', padding:'8px 20px', borderRadius:'50px', background:'#dc2626', border:'none', color:'#fff', fontSize:'12px', fontWeight:'700', cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 12px rgba(220,38,38,0.22)' }}
                onMouseEnter={e => e.currentTarget.style.background='#b91c1c'}
                onMouseLeave={e => e.currentTarget.style.background='#dc2626'}>
                <Trash2 size={12} strokeWidth={2.2} />Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @media (max-width: 860px) {
          .nav-label { display: none !important; }
          .btn-label  { display: none !important; }
        }
        @media (max-width: 500px) {
          .nav-label { display: none !important; }
        }
      `}</style>
    </div>
  )
}