// ============================================
// DETAILDEMANDE.JSX — Espace client
// ✅ Messagerie temps réel : REST + Socket.io
// ✅ Chat redesigné premium
// ✅ Responsive complet : mobile / tablette / desktop
// ============================================

import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexte/AuthContexte'
import { io } from 'socket.io-client'
import api from '../../services/api'
import {
  LayoutDashboard, ClipboardList, MessageSquare, User,
  Monitor, Radio, Camera, Zap, Home, Wrench,
  ChevronRight, MapPin, Calendar,
  AlertCircle, CheckCircle2, Clock,
  Send, Plus, Loader2, FileText, Info,
  ArrowLeft, Menu, X, Smile,
} from 'lucide-react'

const configStatuts = {
  en_attente: { label:'En attente', couleur:'#92400e', fond:'#fef3c7', bordure:'#fde68a', dot:'#f59e0b' },
  assigne:    { label:'Assigné',    couleur:'#1d4ed8', fond:'#dbeafe', bordure:'#bfdbfe', dot:'#3b82f6' },
  en_cours:   { label:'En cours',   couleur:'#1e40af', fond:'#dbeafe', bordure:'#bfdbfe', dot:'#3b82f6' },
  termine:    { label:'Terminé',    couleur:'#065f46', fond:'#d1fae5', bordure:'#a7f3d0', dot:'#10b981' },
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
  { id:'dashboard', label:'Tableau de bord', icone:LayoutDashboard, lien:'/client/dashboard' },
  { id:'demandes',  label:'Mes demandes',    icone:ClipboardList,   lien:'/client/demandes'  },
  { id:'messages',  label:'Messages',        icone:MessageSquare,   lien:'/client/messages'  },
  { id:'profil',    label:'Mon profil',      icone:User,            lien:'/client/profil'    },
]

export default function DetailDemande() {
  const { id }          = useParams()
  const navigate        = useNavigate()
  const { utilisateur } = useAuth()

  const [demande,       setDemande]       = useState(null)
  const [chargement,    setChargement]    = useState(true)
  const [ongletActif,   setOngletActif]   = useState('demandes')
  const [menuOuvert,    setMenuOuvert]    = useState(false)

  const [messages,       setMessages]       = useState([])
  const [chargementMsgs, setChargementMsgs] = useState(true)
  const [nouveauMessage, setNouveauMessage] = useState('')
  const [envoiMsg,       setEnvoiMsg]       = useState(false)
  const [chatOuvert,     setChatOuvert]     = useState(false) // mobile : panneau chat

  const socketRef   = useRef(null)
  const messagesRef = useRef(null)
  const inputRef    = useRef(null)

  const charger = async () => {
    try {
      const r = await api.get(`/demandes/${id}`)
      setDemande(r.data.demande)
    } catch (err) {
      console.error(err)
    } finally {
      setChargement(false)
    }
  }

  const chargerMessages = async () => {
    try {
      setChargementMsgs(true)
      const r = await api.get(`/messages/${id}`)
      setMessages(r.data.messages || [])
    } catch (err) {
      console.error(err)
    } finally {
      setChargementMsgs(false)
    }
  }

  useEffect(() => {
    charger()
    chargerMessages()
    const socket = io('http://localhost:5000', { auth: { token: localStorage.getItem('doom_token') } })
    socketRef.current = socket
    socket.emit('rejoindre-conversation', id)
    socket.on('nouveau-message', (msg) => {
      setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg])
    })
    return () => { socket.disconnect() }
  }, [id])

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
    }
  }, [messages])

  const envoyerMessage = async () => {
    const texte = nouveauMessage.trim()
    if (!texte || envoiMsg) return
    setEnvoiMsg(true)
    setNouveauMessage('')
    try {
      const r = await api.post(`/messages/${id}`, { contenu: texte })
      const msg = r.data.data
      setMessages(prev => [...prev, msg])
      socketRef.current?.emit('envoyer-message', { demandeId: id, message: msg })
    } catch (err) {
      console.error(err)
      setNouveauMessage(texte)
    } finally {
      setEnvoiMsg(false)
      inputRef.current?.focus()
    }
  }

  // ── États de chargement ──
  if (chargement) return (
    <div style={styles.loadWrap}>
      <style>{BASE_CSS}</style>
      <div style={styles.loadCard}>
        <Loader2 size={32} strokeWidth={1.8} color="#1d6ef5" style={{ animation:'spin 1s linear infinite', marginBottom:12 }}/>
        <p style={{ fontSize:13, color:'#5a7aaa', fontWeight:600, margin:0 }}>Chargement...</p>
      </div>
    </div>
  )

  if (!demande) return (
    <div style={styles.loadWrap}>
      <style>{BASE_CSS}</style>
      <div style={styles.loadCard}>
        <AlertCircle size={44} strokeWidth={1.5} color="#7a9cc5" style={{ marginBottom:14 }}/>
        <h2 style={{ fontSize:17, fontWeight:800, color:'#0d2a5c', marginBottom:10 }}>Demande introuvable</h2>
        <button onClick={() => navigate('/client/demandes')} style={styles.btnBlue}>Retour</button>
      </div>
    </div>
  )

  const config         = configStatuts[demande.statut] || configStatuts.en_attente
  const SvcIcon        = iconeService(demande.service_nom)
  const isUrgent       = demande.urgence === 'urgent' || demande.urgence === 'critique'
  const dateAffichee   = new Date(demande.date_creation).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })
  const technicienNom  = demande.technicien_nom
    ? `${demande.technicien_prenom || ''} ${demande.technicien_nom}`.trim()
    : null

  const infoRows = [
    { icone:SvcIcon,     label:'Service',     valeur:demande.service_nom },
    { icone:Calendar,    label:'Date',        valeur:dateAffichee },
    { icone:AlertCircle, label:'Urgence',     valeur:demande.urgence?.charAt(0).toUpperCase() + demande.urgence?.slice(1) },
    { icone:MapPin,      label:'Lieu',        valeur:demande.lieu === 'boutique' ? 'En boutique' : demande.adresse || 'À domicile' },
    { icone:User,        label:'Technicien',  valeur:technicienNom || 'Non encore assigné' },
    { icone:FileText,    label:'Description', valeur:demande.description },
  ]

  const etapes = [
    { statut:'en_attente', label:'Demande soumise',      icone:FileText,     done:true },
    { statut:'assigne',    label:'Technicien assigné',   icone:User,         done:['assigne','en_cours','termine'].includes(demande.statut) },
    { statut:'en_cours',   label:'Intervention en cours',icone:Wrench,       done:['en_cours','termine'].includes(demande.statut) },
    { statut:'termine',    label:'Terminée',             icone:CheckCircle2, done:demande.statut==='termine' },
  ]

  const nbNonLus = messages.filter(m => m.expediteur_id !== utilisateur?.id).length

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans','DM Sans',-apple-system,sans-serif", background:'linear-gradient(145deg,#b8d4f0 0%,#cfe3f8 35%,#dceeff 65%,#edf5ff 100%)', minHeight:'100vh', padding:'clamp(10px,2vw,20px)', boxSizing:'border-box' }}>
      <style>{BASE_CSS + CHAT_CSS}</style>

      <div style={{ maxWidth:1300, margin:'0 auto', background:'rgba(240,247,255,0.72)', borderRadius:'clamp(16px,2.5vw,26px)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.90)', boxShadow:'0 8px 40px rgba(20,70,160,0.10)', overflow:'hidden' }}>

        {/* ══ TOPBAR ══ */}
        <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'clamp(11px,1.8vw,15px) clamp(14px,2.5vw,26px)', borderBottom:'1px solid rgba(180,210,255,0.35)', background:'rgba(255,255,255,0.56)', gap:10, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'clamp(12px,2.5vw,32px)' }}>
            <div style={{ fontSize:'clamp(14px,2vw,17px)', fontWeight:900, color:'#0d2a5c', letterSpacing:'2px', flexShrink:0 }}>
              D<span style={{ color:'#1d6ef5' }}>OO</span>M
            </div>
            <nav className="nav-desktop" style={{ display:'flex', gap:2, background:'rgba(255,255,255,0.72)', padding:4, borderRadius:50, border:'1px solid rgba(190,215,255,0.55)' }}>
              {navItems.map(item => {
                const Icn = item.icone
                const isA = ongletActif === item.id
                return (
                  <button key={item.id}
                    onClick={() => { setOngletActif(item.id); navigate(item.lien) }}
                    style={{ display:'flex', alignItems:'center', gap:6, background:isA?'#1d6ef5':'transparent', border:'none', color:isA?'#fff':'#4a6a9e', fontSize:'clamp(10.5px,1.2vw,12.5px)', fontWeight:600, padding:'clamp(6px,0.8vw,8px) clamp(9px,1.3vw,16px)', borderRadius:50, cursor:'pointer', fontFamily:'inherit', transition:'all .2s', boxShadow:isA?'0 3px 12px rgba(29,110,245,0.28)':'none', whiteSpace:'nowrap' }}>
                    <Icn size={13} strokeWidth={2.2}/><span className="nav-label">{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:9 }}>
            {/* Bouton ouvrir chat — mobile seulement */}
            <button className="btn-chat-mobile" onClick={() => setChatOuvert(true)}
              style={{ display:'none', alignItems:'center', gap:6, background:'linear-gradient(135deg,#1d6ef5,#3b82f6)', color:'#fff', border:'none', padding:'8px 14px', borderRadius:50, fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', position:'relative' }}>
              <MessageSquare size={13} strokeWidth={2}/>
              Chat
              {nbNonLus > 0 && <span style={{ position:'absolute', top:-5, right:-5, width:16, height:16, background:'#ef4444', borderRadius:'50%', fontSize:9, fontWeight:800, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>{nbNonLus}</span>}
            </button>

            <button onClick={() => navigate('/client/nouvelle-demande')} style={{ display:'flex', alignItems:'center', gap:6, background:'linear-gradient(135deg,#1d6ef5,#3b82f6)', color:'#fff', border:'none', padding:'clamp(7px,1vw,10px) clamp(12px,1.8vw,18px)', borderRadius:50, fontSize:'clamp(10.5px,1.2vw,12.5px)', fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 14px rgba(29,110,245,0.32)', flexShrink:0 }}>
              <Plus size={14} strokeWidth={2.5}/><span className="nav-label">Nouvelle demande</span>
            </button>

            <div style={{ width:'clamp(30px,3.5vw,36px)', height:'clamp(30px,3.5vw,36px)', borderRadius:'50%', background:'linear-gradient(135deg,#1d6ef5,#60a5fa)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff', flexShrink:0 }}>
              {utilisateur?.prenom?.charAt(0) || 'C'}
            </div>

            {/* Burger */}
            <button className="burger-btn" onClick={() => setMenuOuvert(v=>!v)} style={{ display:'none', background:'rgba(255,255,255,0.72)', border:'1px solid rgba(190,215,255,0.55)', borderRadius:9, width:34, height:34, alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
              {menuOuvert ? <X size={15} color="#0d2a5c"/> : <Menu size={15} color="#0d2a5c"/>}
            </button>
          </div>
        </header>

        {/* Menu mobile */}
        {menuOuvert && (
          <nav style={{ background:'rgba(255,255,255,0.92)', borderBottom:'1px solid rgba(190,215,255,0.35)', padding:'8px 14px', animation:'slideDown .2s ease' }}>
            {navItems.map(item => {
              const Icn = item.icone
              const isA = ongletActif === item.id
              return (
                <button key={item.id}
                  onClick={() => { setOngletActif(item.id); setMenuOuvert(false); navigate(item.lien) }}
                  style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'11px 13px', borderRadius:11, border:'none', background:isA?'rgba(29,110,245,0.07)':'transparent', color:isA?'#1d6ef5':'#4a6a9e', fontSize:13, fontWeight:isA?700:600, cursor:'pointer', fontFamily:'inherit', marginBottom:2, borderLeft:isA?'3px solid #1d6ef5':'3px solid transparent' }}>
                  <Icn size={15} strokeWidth={2}/>{item.label}
                </button>
              )
            })}
          </nav>
        )}

        {/* ══ CORPS ══ */}
        <div style={{ padding:'clamp(14px,2.5vw,26px)' }}>

          {/* Fil d'Ariane + titre */}
          <div style={{ marginBottom:'clamp(14px,2.5vw,22px)' }}>
            <button onClick={() => navigate('/client/demandes')}
              style={{ display:'inline-flex', alignItems:'center', gap:5, background:'none', border:'none', color:'#5a7aaa', fontSize:12, fontWeight:600, cursor:'pointer', padding:0, fontFamily:'inherit', marginBottom:10 }}>
              <ArrowLeft size={12} strokeWidth={2}/>
              Mes demandes
              <ChevronRight size={11} strokeWidth={2}/>
              <span style={{ color:'#0d2a5c' }}>#{demande.id}</span>
            </button>

            <div style={{ display:'flex', alignItems:'center', gap:14, flexWrap:'wrap' }}>
              <div style={{ width:'clamp(40px,5vw,50px)', height:'clamp(40px,5vw,50px)', borderRadius:14, flexShrink:0, background:isUrgent?'rgba(239,68,68,0.1)':'rgba(29,110,245,0.1)', border:isUrgent?'1px solid rgba(239,68,68,0.25)':'1px solid rgba(29,110,245,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <SvcIcon size={22} strokeWidth={1.8} color={isUrgent?'#ef4444':'#1d6ef5'}/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:9, flexWrap:'wrap', marginBottom:4 }}>
                  <h1 style={{ fontSize:'clamp(16px,2.5vw,21px)', fontWeight:800, color:'#0d2a5c', letterSpacing:'-0.4px', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {demande.service_nom}
                  </h1>
                  {isUrgent && <span style={{ fontSize:9.5, fontWeight:800, padding:'2px 9px', borderRadius:50, background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.25)', flexShrink:0 }}>URGENT</span>}
                  <span style={{ fontSize:11, fontWeight:700, padding:'3px 11px', borderRadius:50, background:config.fond, color:config.couleur, border:`1px solid ${config.bordure}`, display:'inline-flex', alignItems:'center', gap:5, flexShrink:0 }}>
                    <span style={{ width:5, height:5, borderRadius:'50%', background:config.dot }}/>
                    {config.label}
                  </span>
                </div>
                <p style={{ fontSize:12, color:'#7a9cc5', margin:0, display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
                  <span>#{demande.id}</span>
                  <span style={{ color:'rgba(122,156,197,0.4)' }}>·</span>
                  <Calendar size={10} strokeWidth={2} color="#7a9cc5"/>
                  <span>{dateAffichee}</span>
                  {technicienNom && (
                    <><span style={{ color:'rgba(122,156,197,0.4)' }}>·</span><User size={10} strokeWidth={2} color="#7a9cc5"/><span>{technicienNom}</span></>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* ══ GRILLE PRINCIPALE ══ */}
          <div className="detail-grid" style={{ display:'grid', gridTemplateColumns:'1fr', gap:16 }}>

            {/* ── Colonne GAUCHE ── */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

              {/* Infos demande */}
              <div style={styles.card}>
                <div style={styles.cardHead}>
                  <div style={styles.cardHeadIc}><Info size={13} strokeWidth={2} color="#3a6aaa"/></div>
                  <h2 style={styles.cardHeadTitle}>Détails de la demande</h2>
                </div>
                <div style={{ padding:'4px 0' }}>
                  {infoRows.map((info, i) => {
                    const Icn = info.icone
                    return (
                      <div key={i} className="info-row" style={{ display:'grid', gridTemplateColumns:'clamp(110px,18vw,140px) 1fr', gap:10, padding:'10px clamp(14px,2vw,20px)', borderBottom:i<infoRows.length-1?'1px solid rgba(190,215,255,0.18)':'none', alignItems:'start' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <Icn size={12} strokeWidth={2} color="#7a9cc5"/>
                          <span style={{ fontSize:10.5, fontWeight:700, color:'#7a9cc5', textTransform:'uppercase', letterSpacing:'0.4px' }}>{info.label}</span>
                        </div>
                        <span style={{ fontSize:'clamp(12px,1.5vw,13px)', color:'#0d2a5c', fontWeight:600, lineHeight:'1.55', wordBreak:'break-word' }}>{info.valeur}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Suivi progression */}
              <div style={styles.card}>
                <div style={styles.cardHead}>
                  <div style={styles.cardHeadIc}><Clock size={13} strokeWidth={2} color="#3a6aaa"/></div>
                  <h2 style={styles.cardHeadTitle}>Suivi de l'intervention</h2>
                </div>
                <div style={{ padding:'clamp(14px,2vw,20px)' }}>
                  {etapes.map((etape, i) => {
                    const EtIcon = etape.icone
                    const estActif = demande.statut === etape.statut
                    return (
                      <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:14, position:'relative', paddingBottom:i<etapes.length-1?18:0 }}>
                        {i < etapes.length-1 && (
                          <div style={{ position:'absolute', left:15, top:32, width:2, height:18, background:etape.done?'#1d6ef5':'rgba(190,215,255,0.5)', borderRadius:1, transition:'background .3s' }}/>
                        )}
                        <div style={{ width:32, height:32, borderRadius:'50%', flexShrink:0, background:etape.done?(estActif?'#1d6ef5':'rgba(29,110,245,0.12)'):'rgba(190,215,255,0.25)', border:etape.done?'2px solid rgba(29,110,245,0.35)':'2px solid rgba(190,215,255,0.4)', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .3s', boxShadow:estActif?'0 0 0 4px rgba(29,110,245,0.12)':'none' }}>
                          <EtIcon size={13} strokeWidth={2} color={etape.done?'#1d6ef5':'#a0b4cc'}/>
                        </div>
                        <div style={{ paddingTop:6 }}>
                          <div style={{ fontSize:13, fontWeight:etape.done?700:500, color:etape.done?'#0d2a5c':'#7a9cc5' }}>{etape.label}</div>
                          {estActif && <div style={{ fontSize:10.5, color:'#1d6ef5', fontWeight:700, marginTop:2, display:'flex', alignItems:'center', gap:4 }}><span style={{ width:5, height:5, borderRadius:'50%', background:'#1d6ef5', animation:'pulse 1.5s ease-in-out infinite' }}/>En cours</div>}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ════════════════════════════════
                ── CHAT REDESIGNÉ ──
            ════════════════════════════════ */}
            <div className="chat-panel" style={{ display:'flex', flexDirection:'column', borderRadius:20, overflow:'hidden', border:'1px solid rgba(190,215,255,0.45)', boxShadow:'0 4px 24px rgba(20,70,160,0.09)', height:'clamp(480px,65vh,600px)' }}>

              {/* En-tête chat */}
              <div style={{ background:'linear-gradient(135deg,#0d2a5c 0%,#1340c0 55%,#1d6ef5 100%)', padding:'clamp(12px,1.8vw,16px) clamp(14px,2vw,20px)', display:'flex', alignItems:'center', gap:12, flexShrink:0, position:'relative', overflow:'hidden' }}>
                {/* Halo décoratif */}
                <div style={{ position:'absolute', width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.04)', top:-80, right:-60, pointerEvents:'none' }}/>
                <div style={{ position:'absolute', width:120, height:120, borderRadius:'50%', background:'rgba(255,255,255,0.03)', bottom:-50, left:20, pointerEvents:'none' }}/>

                {technicienNom ? (
                  <>
                    <div style={{ position:'relative', flexShrink:0 }}>
                      <div style={{ width:'clamp(36px,4vw,44px)', height:'clamp(36px,4vw,44px)', borderRadius:'50%', background:'rgba(255,255,255,0.15)', border:'2px solid rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'clamp(13px,1.5vw,15px)', fontWeight:800, color:'#fff' }}>
                        {demande.technicien_prenom?.charAt(0)}
                      </div>
                      <span style={{ position:'absolute', bottom:1, right:1, width:9, height:9, borderRadius:'50%', background:'#4ade80', border:'2px solid #0d2a5c', boxShadow:'0 0 5px #4ade80' }}/>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'clamp(12.5px,1.4vw,14px)', fontWeight:800, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{technicienNom}</div>
                      <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginTop:1 }}>Technicien · Demande #{id}</div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(74,222,128,0.15)', border:'1px solid rgba(74,222,128,0.3)', padding:'4px 10px', borderRadius:50, flexShrink:0 }}>
                      <span style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 5px #4ade80' }}/>
                      <span style={{ fontSize:10.5, color:'rgba(255,255,255,0.7)', fontWeight:600 }}>En ligne</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div style={{ width:42, height:42, borderRadius:'50%', background:'rgba(255,255,255,0.08)', border:'2px solid rgba(255,255,255,0.15)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                      <User size={18} strokeWidth={1.8} color="rgba(255,255,255,0.4)"/>
                    </div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.6)' }}>En attente d'un technicien</div>
                      <div style={{ fontSize:10.5, color:'rgba(255,255,255,0.35)', marginTop:1 }}>Messagerie disponible dès l'assignation</div>
                    </div>
                  </>
                )}

                {/* Bouton fermer — visible seulement mobile overlay */}
                <button className="chat-close-btn" onClick={() => setChatOuvert(false)}
                  style={{ display:'none', background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'50%', width:30, height:30, alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                  <X size={14} color="#fff"/>
                </button>
              </div>

              {/* Corps messages */}
              <div ref={messagesRef} style={{ flex:1, padding:'clamp(10px,1.5vw,16px)', overflowY:'auto', display:'flex', flexDirection:'column', gap:10, background:'linear-gradient(180deg,#eef4ff 0%,#f0f7ff 100%)' }}>

                {!technicienNom && (
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', textAlign:'center', padding:'24px 16px', gap:12 }}>
                    <div style={{ width:56, height:56, background:'rgba(190,215,255,0.25)', borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <User size={26} strokeWidth={1.4} color="#a0b4cc"/>
                    </div>
                    <div>
                      <p style={{ fontSize:13.5, fontWeight:700, color:'#5a7aaa', margin:'0 0 4px' }}>Aucun technicien assigné</p>
                      <p style={{ fontSize:12, color:'#a0b4cc', margin:0, lineHeight:1.65 }}>La messagerie sera disponible<br/>dès qu'un technicien sera assigné</p>
                    </div>
                  </div>
                )}

                {technicienNom && chargementMsgs && (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', gap:8 }}>
                    <Loader2 size={18} strokeWidth={2} color="#7a9cc5" style={{ animation:'spin 1s linear infinite' }}/>
                    <span style={{ fontSize:12, color:'#7a9cc5' }}>Chargement des messages...</span>
                  </div>
                )}

                {technicienNom && !chargementMsgs && messages.length === 0 && (
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', textAlign:'center', padding:'20px', gap:10 }}>
                    <div style={{ width:52, height:52, background:'rgba(29,110,245,0.08)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <MessageSquare size={24} strokeWidth={1.6} color="#7a9cc5"/>
                    </div>
                    <p style={{ fontSize:13.5, fontWeight:700, color:'#5a7aaa', margin:'0 0 3px' }}>Commencez la conversation</p>
                    <p style={{ fontSize:12, color:'#a0b4cc', margin:0 }}>Envoyez un message à votre technicien</p>
                  </div>
                )}

                {/* Messages */}
                {technicienNom && !chargementMsgs && messages.map((msg, idx) => {
                  const estMoi = msg.expediteur_id === utilisateur?.id
                  const showAvatar = !estMoi && (idx === 0 || messages[idx-1]?.expediteur_id !== msg.expediteur_id)
                  const showName   = showAvatar
                  const heure = msg.date_envoi
                    ? new Date(msg.date_envoi).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
                    : '—'

                  return (
                    <div key={msg.id || idx} className={`msg-row ${estMoi ? 'msg-me' : 'msg-other'}`}
                      style={{ display:'flex', justifyContent:estMoi?'flex-end':'flex-start', alignItems:'flex-end', gap:8 }}>

                      {/* Avatar technicien */}
                      {!estMoi && (
                        <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#10b981,#34d399)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:'#fff', flexShrink:0, marginBottom:2, visibility:showAvatar?'visible':'hidden' }}>
                          {msg.expediteur_prenom?.charAt(0)}
                        </div>
                      )}

                      <div style={{ maxWidth:'72%', minWidth:60 }}>
                        {showName && !estMoi && (
                          <div style={{ fontSize:10, fontWeight:700, color:'#059669', marginBottom:3, paddingLeft:2 }}>
                            {msg.expediteur_prenom} {msg.expediteur_nom}
                          </div>
                        )}

                        {/* Bulle */}
                        <div style={{
                          padding:'10px 14px',
                          background: estMoi
                            ? 'linear-gradient(135deg,#1340c0 0%,#1d6ef5 55%,#3b82f6 100%)'
                            : 'rgba(255,255,255,0.95)',
                          color: estMoi ? '#fff' : '#0d2a5c',
                          borderRadius: estMoi ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          border: !estMoi ? '1px solid rgba(190,215,255,0.55)' : 'none',
                          boxShadow: estMoi
                            ? '0 4px 14px rgba(29,110,245,0.28)'
                            : '0 2px 8px rgba(20,70,160,0.07)',
                        }}>
                          <div style={{ fontSize:'clamp(12.5px,1.5vw,13.5px)', lineHeight:'1.6', wordBreak:'break-word' }}>{msg.contenu}</div>
                          <div style={{ fontSize:10, marginTop:4, textAlign:'right', color:estMoi?'rgba(255,255,255,0.5)':'#b0c4da', display:'flex', justifyContent:'flex-end', alignItems:'center', gap:4 }}>
                            {heure}
                            {estMoi && <CheckCircle2 size={10} strokeWidth={2} color="rgba(255,255,255,0.5)"/>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Zone saisie */}
              <div style={{ padding:'clamp(10px,1.5vw,14px)', borderTop:'1px solid rgba(190,215,255,0.35)', background:'rgba(255,255,255,0.72)', flexShrink:0 }}>
                {technicienNom ? (
                  <div style={{ display:'flex', gap:8, alignItems:'flex-end' }}>
                    <div style={{ flex:1, position:'relative' }}>
                      <input
                        ref={inputRef}
                        type="text"
                        value={nouveauMessage}
                        onChange={e => setNouveauMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && envoyerMessage()}
                        placeholder="Écrire un message…"
                        disabled={envoiMsg}
                        style={{ width:'100%', padding:'10px 42px 10px 16px', border:'1.5px solid rgba(190,215,255,0.55)', borderRadius:50, fontSize:'clamp(12px,1.4vw,13px)', outline:'none', fontFamily:'inherit', background:'rgba(245,249,255,0.9)', color:'#0d2a5c', transition:'border-color .2s, box-shadow .2s', boxSizing:'border-box' }}
                        onFocus={e => { e.target.style.borderColor='#1d6ef5'; e.target.style.boxShadow='0 0 0 3px rgba(29,110,245,0.1)' }}
                        onBlur={e  => { e.target.style.borderColor='rgba(190,215,255,0.55)'; e.target.style.boxShadow='none' }}
                      />
                      <Smile size={15} strokeWidth={1.8} color="#94a3b8" style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', cursor:'pointer' }}/>
                    </div>
                    <button
                      onClick={envoyerMessage}
                      disabled={!nouveauMessage.trim() || envoiMsg}
                      style={{ width:'clamp(36px,4vw,42px)', height:'clamp(36px,4vw,42px)', borderRadius:'50%', background:nouveauMessage.trim()&&!envoiMsg?'linear-gradient(135deg,#1d6ef5,#3b82f6)':'rgba(190,215,255,0.38)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:nouveauMessage.trim()&&!envoiMsg?'pointer':'not-allowed', flexShrink:0, transition:'all .2s', boxShadow:nouveauMessage.trim()&&!envoiMsg?'0 4px 12px rgba(29,110,245,0.32)':'none', transform:nouveauMessage.trim()&&!envoiMsg?'scale(1)':'scale(0.95)' }}>
                      {envoiMsg
                        ? <Loader2 size={14} strokeWidth={2} color="#fff" style={{ animation:'spin 1s linear infinite' }}/>
                        : <Send size={14} strokeWidth={2.3} color={nouveauMessage.trim()?'#fff':'#7a9cc5'}/>
                      }
                    </button>
                  </div>
                ) : (
                  <div style={{ textAlign:'center', padding:'8px 0' }}>
                    <span style={{ fontSize:12, color:'#a0b4cc', fontWeight:500 }}>Messagerie désactivée — en attente d'assignation</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Overlay mobile chat */}
      {chatOuvert && <div className="chat-overlay-backdrop" onClick={() => setChatOuvert(false)} style={{ display:'none', position:'fixed', inset:0, background:'rgba(13,42,92,0.4)', backdropFilter:'blur(6px)', zIndex:100 }}/>}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
const styles = {
  loadWrap: { fontFamily:"'Plus Jakarta Sans','DM Sans',sans-serif", background:'linear-gradient(145deg,#b8d4f0,#cfe3f8,#dceeff,#edf5ff)', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' },
  loadCard: { background:'rgba(255,255,255,0.72)', backdropFilter:'blur(20px)', borderRadius:20, padding:'36px 56px', textAlign:'center', border:'1px solid rgba(255,255,255,0.86)' },
  btnBlue:  { background:'#1d6ef5', color:'#fff', border:'none', padding:'10px 22px', borderRadius:50, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' },
  card:     { background:'rgba(255,255,255,0.78)', borderRadius:'clamp(14px,2vw,18px)', overflow:'hidden', border:'1px solid rgba(190,215,255,0.45)', boxShadow:'0 3px 14px rgba(20,70,160,0.05)' },
  cardHead: { padding:'clamp(11px,1.6vw,14px) clamp(14px,2vw,20px)', borderBottom:'1px solid rgba(190,215,255,0.3)', background:'rgba(255,255,255,0.60)', display:'flex', alignItems:'center', gap:9 },
  cardHeadIc: { width:28, height:28, borderRadius:8, background:'rgba(190,215,255,0.35)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 },
  cardHeadTitle: { fontSize:'clamp(12px,1.5vw,13.5px)', fontWeight:800, color:'#0d2a5c', margin:0 },
}

const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes spin      { to { transform: rotate(360deg) } }
  @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes pulse     { 0%,100%{opacity:.5;transform:scale(1)} 50%{opacity:1;transform:scale(1.2)} }
  @keyframes msgIn     { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

  /* Responsive nav */
  @media (max-width: 680px) {
    .nav-desktop { display: none !important; }
    .burger-btn  { display: flex !important; }
    .btn-chat-mobile { display: flex !important; }
    .nav-label { display: none !important; }
  }
  @media (max-width: 480px) {
    .nav-label { display: none !important; }
  }
`

const CHAT_CSS = `
  /* Grille desktop */
  @media (min-width: 860px) {
    .detail-grid { grid-template-columns: 1fr 390px !important; }
    .chat-panel  { position: sticky; top: 16px; }
  }

  /* Animation messages */
  .msg-row { animation: msgIn .25s ease both; }

  /* Scrollbar chat */
  .chat-panel > div:nth-child(2)::-webkit-scrollbar { width: 4px; }
  .chat-panel > div:nth-child(2)::-webkit-scrollbar-track { background: transparent; }
  .chat-panel > div:nth-child(2)::-webkit-scrollbar-thumb { background: rgba(190,215,255,0.6); border-radius: 2px; }

  /* Mobile : chat overlay */
  @media (max-width: 859px) {
    .chat-panel {
      display: none !important;
    }
  }
`