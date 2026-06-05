// ============================================
// MESSAGES.JSX — Conversations client
// ✅ Style glassmorphism identique TableauDeBord
// ✅ Même navbar, même fond, même cards
// ✅ Barre de recherche fonctionnelle et jolie
// ✅ Responsive mobile / tablette / desktop
// ✅ Temps réel Socket.io
// ============================================

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexte/AuthContexte'
import { io } from 'socket.io-client'
import api from '../../services/api'
import NotificationsBadge from '../../composants/NotificationsBadge'
import {
  LayoutDashboard, ClipboardList, MessageSquare, User,
  Plus, Monitor, Radio, Camera, Zap, Home, Wrench,
  Send, Loader2, Menu, X, Search, ChevronLeft,
  CheckCircle2, Clock, ArrowLeft,
} from 'lucide-react'

// ── helpers ──
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

export default function Messages() {
  const navigate        = useNavigate()
  const { utilisateur } = useAuth()

  const [demandes,       setDemandes]       = useState([])
  const [chargement,     setChargement]     = useState(true)
  const [demandeActive,  setDemandeActive]  = useState(null)
  const [messages,       setMessages]       = useState([])
  const [chargementMsgs, setChargementMsgs] = useState(false)
  const [nouveauMsg,     setNouveauMsg]     = useState('')
  const [envoiMsg,       setEnvoiMsg]       = useState(false)
  const [recherche,      setRecherche]      = useState('')
  const [ongletActif,    setOngletActif]    = useState('messages')
  const [menuOuvert,     setMenuOuvert]     = useState(false)
  const [vueMobile,      setVueMobile]      = useState('liste') // 'liste' | 'chat'

  const socketRef   = useRef(null)
  const messagesRef = useRef(null)
  const inputRef    = useRef(null)

  // ── Charger demandes ──
  useEffect(() => {
    api.get('/demandes/mes-demandes')
      .then(r => {
        const d = r.data.demandes || []
        setDemandes(d)
        const avecTech = d.find(x => x.technicien_id)
        if (avecTech) ouvrirConversation(avecTech)
      })
      .catch(console.error)
      .finally(() => setChargement(false))
  }, [])

  // ── Socket ──
  useEffect(() => {
    const socket = io('http://localhost:5000', {
      auth: { token: localStorage.getItem('doom_token') },
    })
    socketRef.current = socket
    socket.on('nouveau-message', msg => {
      setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg])
    })
    return () => socket.disconnect()
  }, [])

  // ── Scroll bas ──
  useEffect(() => {
    if (messagesRef.current)
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight
  }, [messages])

  const ouvrirConversation = async (demande) => {
    setDemandeActive(demande)
    setVueMobile('chat')
    setMessages([])
    setChargementMsgs(true)
    socketRef.current?.emit('rejoindre-conversation', String(demande.id))
    try {
      const r = await api.get(`/messages/${demande.id}`)
      setMessages(r.data.messages || [])
    } catch (e) { console.error(e) }
    finally {
      setChargementMsgs(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  const envoyerMessage = async () => {
    const texte = nouveauMsg.trim()
    if (!texte || envoiMsg || !demandeActive) return
    setEnvoiMsg(true)
    setNouveauMsg('')
    try {
      const r = await api.post(`/messages/${demandeActive.id}`, { contenu: texte })
      const msg = r.data.data
      setMessages(prev => [...prev, msg])
      socketRef.current?.emit('envoyer-message', { demandeId: String(demandeActive.id), message: msg })
    } catch { setNouveauMsg(texte) }
    finally { setEnvoiMsg(false); inputRef.current?.focus() }
  }

  const demandesFiltrees = demandes.filter(d => {
    const q = recherche.toLowerCase()
    return !q
      || (d.service_nom || '').toLowerCase().includes(q)
      || (d.technicien_nom || '').toLowerCase().includes(q)
      || (d.technicien_prenom || '').toLowerCase().includes(q)
  })

  const techNom = d => d.technicien_nom
    ? `${d.technicien_prenom || ''} ${d.technicien_nom}`.trim()
    : null

  return (
    <div style={{
      fontFamily:"'Plus Jakarta Sans','DM Sans',-apple-system,sans-serif",
      background:'linear-gradient(145deg,#b8d4f0 0%,#cfe3f8 35%,#dceeff 65%,#edf5ff 100%)',
      minHeight:'100vh', padding:'clamp(12px,2.5vw,24px)', boxSizing:'border-box',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
        @keyframes spin      { to { transform:rotate(360deg) } }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes msgIn     { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }

        .msg-nav-desktop { display:flex; }
        .msg-nav-mobile  { display:none; }
        .msg-btn-lbl     { display:inline; }

        /* Grille messages */
        .msg-shell { display:grid; grid-template-columns:280px 1fr; gap:0; }
        .msg-liste { display:flex; }
        .msg-chat  { display:flex; }

        /* scrollbars */
        .msg-body::-webkit-scrollbar       { width:3px; }
        .msg-body::-webkit-scrollbar-thumb { background:rgba(190,215,255,.55); border-radius:2px; }
        .conv-scroll::-webkit-scrollbar       { width:3px; }
        .conv-scroll::-webkit-scrollbar-thumb { background:rgba(190,215,255,.4); border-radius:2px; }

        .msg-row { animation:msgIn .22s ease both; }

        @media (max-width:860px) {
          .msg-shell { grid-template-columns:240px 1fr; }
        }
        @media (max-width:680px) {
          .msg-nav-desktop { display:none !important; }
          .msg-nav-mobile  { display:flex !important; }
          .msg-btn-lbl     { display:none !important; }
          .msg-shell       { grid-template-columns:1fr; }
          .msg-liste.hidden { display:none; }
          .msg-chat.hidden  { display:none; }
        }
        @media (max-width:480px) {
          .msg-btn-lbl { display:none !important; }
        }
      `}</style>

      <div style={{
        maxWidth:1280, margin:'0 auto',
        background:'rgba(240,247,255,0.72)',
        borderRadius:'clamp(16px,2.5vw,28px)',
        backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)',
        border:'1px solid rgba(255,255,255,0.90)',
        boxShadow:'0 8px 40px rgba(20,70,160,0.10)',
        overflow:'hidden',
      }}>

        {/* ══ TOPBAR ══ */}
        <header style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'clamp(12px,2vw,16px) clamp(16px,3vw,28px)',
          borderBottom:'1px solid rgba(180,210,255,0.35)',
          background:'rgba(255,255,255,0.56)',
          gap:12, flexWrap:'wrap',
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'clamp(14px,3vw,36px)' }}>
            <div style={{ fontSize:'clamp(15px,2vw,18px)', fontWeight:900, color:'#0d2a5c', letterSpacing:'2px', flexShrink:0 }}>
              D<span style={{ color:'#1d6ef5' }}>OO</span>M
            </div>
            <nav className="msg-nav-desktop" style={{ gap:2, background:'rgba(255,255,255,0.72)', padding:5, borderRadius:50, border:'1px solid rgba(190,215,255,0.55)' }}>
              {navItems.map(item => {
                const Icn = item.icone
                const isA = ongletActif === item.id
                return (
                  <button key={item.id}
                    onClick={() => { setOngletActif(item.id); navigate(item.lien) }}
                    style={{ display:'flex', alignItems:'center', gap:7, background:isA?'#1d6ef5':'transparent', border:'none', color:isA?'#fff':'#4a6a9e', fontSize:'clamp(11px,1.2vw,12.5px)', fontWeight:600, padding:'clamp(6px,1vw,8px) clamp(10px,1.5vw,18px)', borderRadius:50, cursor:'pointer', fontFamily:'inherit', transition:'all .2s', boxShadow:isA?'0 3px 12px rgba(29,110,245,0.28)':'none', whiteSpace:'nowrap' }}>
                    <Icn size={14} strokeWidth={2.2}/>{item.label}
                  </button>
                )
              })}
            </nav>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <button onClick={() => navigate('/client/nouvelle-demande')} style={{ display:'flex', alignItems:'center', gap:6, background:'linear-gradient(135deg,#1d6ef5,#3b82f6)', color:'#fff', border:'none', padding:'clamp(8px,1.2vw,10px) clamp(14px,2vw,20px)', borderRadius:50, fontSize:'clamp(11px,1.2vw,12.5px)', fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 14px rgba(29,110,245,0.32)', flexShrink:0 }}>
              <Plus size={15} strokeWidth={2.5}/>
              <span className="msg-btn-lbl">Nouvelle demande</span>
            </button>
            <NotificationsBadge role="client"/>
            <div style={{ width:'clamp(32px,4vw,38px)', height:'clamp(32px,4vw,38px)', borderRadius:'50%', background:'linear-gradient(135deg,#1d6ef5,#60a5fa)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'clamp(11px,1.3vw,13px)', fontWeight:800, color:'#fff', boxShadow:'0 3px 10px rgba(29,110,245,0.25)', flexShrink:0 }}>
              {utilisateur?.prenom?.charAt(0) || 'U'}
            </div>
            <button className="msg-nav-mobile" onClick={() => setMenuOuvert(v=>!v)} style={{ background:'rgba(255,255,255,0.72)', border:'1px solid rgba(190,215,255,0.55)', borderRadius:10, width:36, height:36, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
              {menuOuvert ? <X size={16} color="#0d2a5c"/> : <Menu size={16} color="#0d2a5c"/>}
            </button>
          </div>
        </header>

        {/* Menu mobile */}
        {menuOuvert && (
          <nav style={{ background:'rgba(255,255,255,0.92)', borderBottom:'1px solid rgba(190,215,255,0.4)', padding:'8px 16px', animation:'slideDown .2s ease' }}>
            {navItems.map(item => {
              const Icn = item.icone
              const isA = ongletActif === item.id
              return (
                <button key={item.id} onClick={() => { setOngletActif(item.id); setMenuOuvert(false); navigate(item.lien) }}
                  style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'11px 14px', borderRadius:12, border:'none', background:isA?'rgba(29,110,245,0.08)':'transparent', color:isA?'#1d6ef5':'#4a6a9e', fontSize:13, fontWeight:isA?700:600, cursor:'pointer', fontFamily:'inherit', marginBottom:2, borderLeft:isA?'3px solid #1d6ef5':'3px solid transparent' }}>
                  <Icn size={16} strokeWidth={2}/>{item.label}
                </button>
              )
            })}
          </nav>
        )}

        {/* ══ CORPS ══ */}
        <div style={{ padding:'clamp(16px,3vw,28px) clamp(16px,3vw,28px) clamp(20px,3vw,32px)' }}>

          {/* Titre */}
          <div style={{ marginBottom:'clamp(14px,2.5vw,22px)' }}>
            <p style={{ fontSize:10.5, fontWeight:700, color:'#1d6ef5', textTransform:'uppercase', letterSpacing:'1.8px', marginBottom:5 }}>Espace client</p>
            <h1 style={{ fontSize:'clamp(20px,3.5vw,28px)', fontWeight:800, color:'#0d2a5c', letterSpacing:'-0.5px', margin:0 }}>Messages</h1>
            <p style={{ fontSize:13, color:'#5a7aaa', margin:'4px 0 0', fontWeight:500 }}>
              {demandes.filter(d => d.technicien_id).length} conversation{demandes.filter(d=>d.technicien_id).length > 1 ? 's' : ''} active{demandes.filter(d=>d.technicien_id).length > 1 ? 's' : ''}
            </p>
          </div>

          {/* ══ SHELL MESSAGERIE ══ */}
          <div style={{ background:'rgba(255,255,255,0.78)', borderRadius:'clamp(14px,2vw,20px)', border:'1px solid rgba(190,215,255,0.45)', boxShadow:'0 3px 18px rgba(20,70,160,0.05)', overflow:'hidden' }}>
            <div className="msg-shell" style={{ height:'clamp(500px,60vh,640px)' }}>

              {/* ── LISTE CONVERSATIONS ── */}
              <div
                className={`msg-liste${vueMobile === 'chat' ? ' hidden' : ''}`}
                style={{ flexDirection:'column', borderRight:'1px solid rgba(190,215,255,0.35)', background:'rgba(248,251,255,0.85)' }}
              >
                {/* En-tête liste */}
                <div style={{ padding:'clamp(12px,1.5vw,16px) clamp(12px,1.5vw,16px) 10px', borderBottom:'1px solid rgba(190,215,255,0.25)', background:'rgba(255,255,255,0.60)' }}>
                  <div style={{ fontSize:'clamp(12px,1.4vw,13px)', fontWeight:800, color:'#0d2a5c', marginBottom:10 }}>Conversations</div>

                  {/* Barre de recherche */}
                  <div style={{
                    display:'flex', alignItems:'center', gap:8,
                    background:'rgba(240,247,255,0.9)',
                    border:'1.5px solid rgba(190,215,255,0.55)',
                    borderRadius:50, padding:'7px 13px',
                    transition:'border-color .2s, box-shadow .2s',
                  }}
                    onFocus={() => {}}
                  >
                    <Search size={13} strokeWidth={2} color="#7a9cc5" style={{ flexShrink:0 }}/>
                    <input
                      type="text"
                      placeholder="Chercher une demande…"
                      value={recherche}
                      onChange={e => setRecherche(e.target.value)}
                      style={{ border:'none', outline:'none', background:'transparent', fontSize:12.5, color:'#0d2a5c', fontFamily:'inherit', flex:1, minWidth:0 }}
                      onFocus={e => {
                        const p = e.target.closest('div')
                        if (p) { p.style.borderColor='#1d6ef5'; p.style.boxShadow='0 0 0 3px rgba(29,110,245,0.10)' }
                      }}
                      onBlur={e => {
                        const p = e.target.closest('div')
                        if (p) { p.style.borderColor='rgba(190,215,255,0.55)'; p.style.boxShadow='none' }
                      }}
                    />
                    {recherche && (
                      <button onClick={() => setRecherche('')} style={{ background:'none', border:'none', cursor:'pointer', padding:0, display:'flex', color:'#7a9cc5', flexShrink:0 }}>
                        <X size={12} strokeWidth={2.5}/>
                      </button>
                    )}
                  </div>
                </div>

                {/* Liste */}
                <div className="conv-scroll" style={{ flex:1, overflowY:'auto' }}>
                  {chargement ? (
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:40, gap:8 }}>
                      <Loader2 size={18} strokeWidth={2} color="#7a9cc5" style={{ animation:'spin 1s linear infinite' }}/>
                      <span style={{ fontSize:12, color:'#7a9cc5' }}>Chargement…</span>
                    </div>
                  ) : demandesFiltrees.length === 0 ? (
                    <div style={{ textAlign:'center', padding:'40px 16px' }}>
                      <div style={{ width:48, height:48, background:'rgba(190,215,255,0.25)', borderRadius:13, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 10px' }}>
                        <MessageSquare size={22} strokeWidth={1.4} color="#a0b4cc"/>
                      </div>
                      <p style={{ fontSize:12.5, fontWeight:700, color:'#7a9cc5', margin:'0 0 4px' }}>
                        {recherche ? 'Aucun résultat' : 'Aucune conversation'}
                      </p>
                      <p style={{ fontSize:11, color:'#b0c4da', lineHeight:1.6 }}>
                        {recherche
                          ? `Pas de résultat pour "${recherche}"`
                          : 'Vos conversations apparaîtront ici dès qu\'un technicien sera assigné'
                        }
                      </p>
                    </div>
                  ) : demandesFiltrees.map(d => {
                    const Icn    = iconeService(d.service_nom)
                    const isA    = demandeActive?.id === d.id
                    const config = configStatuts[d.statut] || configStatuts.en_attente
                    const tech   = techNom(d)
                    return (
                      <div key={d.id}
                        onClick={() => ouvrirConversation(d)}
                        style={{ display:'flex', alignItems:'center', gap:12, padding:'clamp(10px,1.5vw,13px) clamp(12px,1.5vw,16px)', cursor:'pointer', background:isA?'rgba(29,110,245,0.07)':'transparent', borderLeft:isA?'3px solid #1d6ef5':'3px solid transparent', borderBottom:'1px solid rgba(190,215,255,0.2)', transition:'all .15s' }}
                        onMouseEnter={e => { if (!isA) e.currentTarget.style.background='rgba(190,215,255,0.12)' }}
                        onMouseLeave={e => { if (!isA) e.currentTarget.style.background='transparent' }}
                      >
                        {/* Icône service */}
                        <div style={{ width:38, height:38, borderRadius:11, background:isA?'rgba(29,110,245,0.12)':'rgba(190,215,255,0.32)', border:`1px solid ${isA?'rgba(29,110,245,0.2)':'rgba(190,215,255,0.45)'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all .15s' }}>
                          <Icn size={17} strokeWidth={1.8} color={isA?'#1d6ef5':'#5a7aaa'}/>
                        </div>

                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontSize:12.5, fontWeight:700, color:isA?'#1d4ed8':'#0d2a5c', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginBottom:3 }}>
                            {d.service_nom}
                          </div>
                          <div style={{ fontSize:11, color:'#94a3b8', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', display:'flex', alignItems:'center', gap:5 }}>
                            {tech
                              ? <><span style={{ width:5, height:5, borderRadius:'50%', background:'#10b981', flexShrink:0 }}/>{tech}</>
                              : <span style={{ fontStyle:'italic' }}>Aucun technicien</span>
                            }
                          </div>
                        </div>

                        {/* Badge statut */}
                        <span style={{ fontSize:9, fontWeight:700, padding:'2px 8px', borderRadius:50, background:config.fond, color:config.couleur, border:`1px solid ${config.bordure}`, whiteSpace:'nowrap', flexShrink:0, display:'inline-flex', alignItems:'center', gap:3 }}>
                          <span style={{ width:4, height:4, borderRadius:'50%', background:config.dot }}/>{config.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* ── PANNEAU CHAT ── */}
              <div
                className={`msg-chat${vueMobile === 'liste' ? ' hidden' : ''}`}
                style={{ flexDirection:'column' }}
              >
                {!demandeActive ? (
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', textAlign:'center', padding:32, gap:14, background:'rgba(248,251,255,0.5)' }}>
                    <div style={{ width:64, height:64, background:'rgba(29,110,245,0.07)', borderRadius:18, display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 3px 14px rgba(20,70,160,0.05)' }}>
                      <MessageSquare size={28} strokeWidth={1.4} color="#a0b4cc"/>
                    </div>
                    <div>
                      <p style={{ fontSize:14, fontWeight:700, color:'#5a7aaa', margin:'0 0 5px' }}>Sélectionnez une conversation</p>
                      <p style={{ fontSize:12, color:'#b0c4da', lineHeight:1.65 }}>Choisissez une demande dans la liste<br/>pour voir la messagerie</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* En-tête chat */}
                    <div style={{ background:'linear-gradient(135deg,#0d2a5c 0%,#1340c0 55%,#1d6ef5 100%)', padding:'clamp(12px,1.8vw,16px) clamp(14px,2vw,22px)', display:'flex', alignItems:'center', gap:12, flexShrink:0, position:'relative', overflow:'hidden' }}>
                      <div style={{ position:'absolute', width:200, height:200, borderRadius:'50%', background:'rgba(255,255,255,0.04)', top:-80, right:-60, pointerEvents:'none' }}/>

                      {/* Bouton retour mobile */}
                      <button
                        onClick={() => setVueMobile('liste')}
                        style={{ display:'none', background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:9, width:30, height:30, alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}
                        className="btn-retour-mobile"
                      >
                        <ArrowLeft size={14} color="#fff"/>
                      </button>

                      {techNom(demandeActive) ? (
                        <>
                          <div style={{ position:'relative', flexShrink:0 }}>
                            <div style={{ width:'clamp(36px,4vw,44px)', height:'clamp(36px,4vw,44px)', borderRadius:'50%', background:'rgba(255,255,255,0.15)', border:'2px solid rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'clamp(13px,1.5vw,15px)', fontWeight:800, color:'#fff' }}>
                              {demandeActive.technicien_prenom?.charAt(0)}
                            </div>
                            <span style={{ position:'absolute', bottom:1, right:1, width:9, height:9, borderRadius:'50%', background:'#4ade80', border:'2px solid #0d2a5c', boxShadow:'0 0 5px #4ade80' }}/>
                          </div>
                          <div style={{ flex:1, minWidth:0 }}>
                            <div style={{ fontSize:'clamp(12.5px,1.4vw,14px)', fontWeight:800, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                              {techNom(demandeActive)}
                            </div>
                            <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginTop:1 }}>
                              {demandeActive.service_nom} · #{demandeActive.id}
                            </div>
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
                            <div style={{ fontSize:13, fontWeight:700, color:'rgba(255,255,255,0.6)' }}>{demandeActive.service_nom}</div>
                            <div style={{ fontSize:10.5, color:'rgba(255,255,255,0.35)', marginTop:1 }}>En attente d'un technicien</div>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Corps messages */}
                    <div ref={messagesRef} className="msg-body" style={{ flex:1, padding:'clamp(10px,1.5vw,16px)', overflowY:'auto', display:'flex', flexDirection:'column', gap:10, background:'linear-gradient(180deg,#eef4ff 0%,#f0f7ff 100%)' }}>
                      {chargementMsgs ? (
                        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', gap:8 }}>
                          <Loader2 size={18} strokeWidth={2} color="#7a9cc5" style={{ animation:'spin 1s linear infinite' }}/>
                          <span style={{ fontSize:12, color:'#7a9cc5' }}>Chargement…</span>
                        </div>
                      ) : !techNom(demandeActive) ? (
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', textAlign:'center', padding:24, gap:10 }}>
                          <div style={{ width:52, height:52, background:'rgba(190,215,255,0.2)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <User size={24} strokeWidth={1.4} color="#a0b4cc"/>
                          </div>
                          <p style={{ fontSize:13.5, fontWeight:700, color:'#5a7aaa', margin:'0 0 4px' }}>Aucun technicien assigné</p>
                          <p style={{ fontSize:12, color:'#a0b4cc', lineHeight:1.65 }}>La messagerie sera disponible<br/>dès qu'un technicien sera assigné</p>
                        </div>
                      ) : messages.length === 0 ? (
                        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', textAlign:'center', padding:20, gap:10 }}>
                          <div style={{ width:50, height:50, background:'rgba(29,110,245,0.08)', borderRadius:13, display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <MessageSquare size={22} strokeWidth={1.6} color="#7a9cc5"/>
                          </div>
                          <p style={{ fontSize:13.5, fontWeight:700, color:'#5a7aaa', margin:'0 0 3px' }}>Commencez la conversation</p>
                          <p style={{ fontSize:12, color:'#a0b4cc' }}>Envoyez un message à votre technicien</p>
                        </div>
                      ) : messages.map((msg, idx) => {
                        const estMoi     = msg.expediteur_id === utilisateur?.id
                        const showAvatar = !estMoi && (idx === 0 || messages[idx-1]?.expediteur_id !== msg.expediteur_id)
                        const heure = msg.date_envoi
                          ? new Date(msg.date_envoi).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
                          : '—'
                        return (
                          <div key={msg.id || idx} className="msg-row"
                            style={{ display:'flex', justifyContent:estMoi?'flex-end':'flex-start', alignItems:'flex-end', gap:8 }}>
                            {!estMoi && (
                              <div style={{ width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,#10b981,#34d399)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:800, color:'#fff', flexShrink:0, visibility:showAvatar?'visible':'hidden' }}>
                                {msg.expediteur_prenom?.charAt(0)}
                              </div>
                            )}
                            <div style={{ maxWidth:'72%', minWidth:60 }}>
                              {showAvatar && !estMoi && (
                                <div style={{ fontSize:10, fontWeight:700, color:'#059669', marginBottom:2, paddingLeft:2 }}>
                                  {msg.expediteur_prenom} {msg.expediteur_nom}
                                </div>
                              )}
                              <div style={{ padding:'10px 14px', background:estMoi?'linear-gradient(135deg,#1340c0 0%,#1d6ef5 55%,#3b82f6 100%)':'rgba(255,255,255,0.95)', color:estMoi?'#fff':'#0d2a5c', borderRadius:estMoi?'18px 18px 4px 18px':'18px 18px 18px 4px', border:!estMoi?'1px solid rgba(190,215,255,0.55)':'none', boxShadow:estMoi?'0 4px 14px rgba(29,110,245,0.28)':'0 2px 8px rgba(20,70,160,0.06)' }}>
                                <div style={{ fontSize:'clamp(12.5px,1.5vw,13.5px)', lineHeight:1.6, wordBreak:'break-word' }}>{msg.contenu}</div>
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
                      {techNom(demandeActive) ? (
                        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                          <input
                            ref={inputRef} type="text" value={nouveauMsg}
                            onChange={e => setNouveauMsg(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && envoyerMessage()}
                            placeholder="Écrire un message…" disabled={envoiMsg}
                            style={{ flex:1, padding:'10px 16px', border:'1.5px solid rgba(190,215,255,0.55)', borderRadius:50, fontSize:'clamp(12px,1.4vw,13px)', outline:'none', fontFamily:'inherit', background:'rgba(240,247,255,0.9)', color:'#0d2a5c', transition:'border-color .2s, box-shadow .2s' }}
                            onFocus={e => { e.target.style.borderColor='#1d6ef5'; e.target.style.boxShadow='0 0 0 3px rgba(29,110,245,0.1)' }}
                            onBlur={e  => { e.target.style.borderColor='rgba(190,215,255,0.55)'; e.target.style.boxShadow='none' }}
                          />
                          <button onClick={envoyerMessage} disabled={!nouveauMsg.trim()||envoiMsg}
                            style={{ width:'clamp(36px,4vw,42px)', height:'clamp(36px,4vw,42px)', borderRadius:'50%', background:nouveauMsg.trim()&&!envoiMsg?'linear-gradient(135deg,#1d6ef5,#3b82f6)':'rgba(190,215,255,0.38)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:nouveauMsg.trim()&&!envoiMsg?'pointer':'not-allowed', flexShrink:0, transition:'all .2s', boxShadow:nouveauMsg.trim()&&!envoiMsg?'0 4px 12px rgba(29,110,245,0.32)':'none' }}>
                            {envoiMsg
                              ? <Loader2 size={14} strokeWidth={2} color="#fff" style={{ animation:'spin 1s linear infinite' }}/>
                              : <Send size={14} strokeWidth={2.3} color={nouveauMsg.trim()?'#fff':'#7a9cc5'}/>
                            }
                          </button>
                        </div>
                      ) : (
                        <div style={{ textAlign:'center', padding:'7px 0' }}>
                          <span style={{ fontSize:12, color:'#a0b4cc', fontWeight:500 }}>Messagerie désactivée — en attente d'assignation</span>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS inline pour le bouton retour mobile */}
      <style>{`
        @media (max-width: 680px) {
          .btn-retour-mobile { display: flex !important; }
        }
      `}</style>
    </div>
  )
}