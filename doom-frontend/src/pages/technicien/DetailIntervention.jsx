// ============================================
// DETAILINTERVENTION.JSX — Espace technicien
// ✅ Chat redesigné premium
// ✅ Responsive complet : mobile / tablette / desktop
// ✅ Toast glassmorphism DOOM
// ✅ Modales confirmation
// ✅ Notes techniques avec sauvegarde
// ============================================

import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexte/AuthContexte'
import { io } from 'socket.io-client'
import api from '../../services/api'
import NotificationsBadge from '../../composants/NotificationsBadge'
import {
  LayoutDashboard, ClipboardList, MessageSquare, User,
  Monitor, Radio, Camera, Zap, Home, Wrench,
  ChevronRight, MapPin, Calendar, Phone,
  AlertCircle, CheckCircle2, PlayCircle,
  Send, LogOut, Loader2, FileText, Info,
  CheckCheck, X, Save, Menu, Smile,
} from 'lucide-react'

const configStatuts = {
  assigne:  { label:'Assigné',  couleur:'#1d4ed8', fond:'rgba(59,130,246,0.12)',  bordure:'rgba(59,130,246,0.3)',  dot:'#3b82f6' },
  en_cours: { label:'En cours', couleur:'#1e40af', fond:'rgba(29,110,245,0.12)',  bordure:'rgba(29,110,245,0.3)',  dot:'#1d6ef5' },
  termine:  { label:'Terminé',  couleur:'#065f46', fond:'rgba(16,185,129,0.12)',  bordure:'rgba(16,185,129,0.3)',  dot:'#10b981' },
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
  { id:'dashboard',     label:'Tableau de bord', icone:LayoutDashboard, lien:'/technicien/dashboard'     },
  { id:'interventions', label:'Interventions',    icone:ClipboardList,   lien:'/technicien/interventions' },
  { id:'messages',      label:'Messages',         icone:MessageSquare,   lien:'/technicien/interventions' },
  { id:'profil',        label:'Mon profil',       icone:User,            lien:'/technicien/profil'        },
]

// ════════════════════ TOAST ════════════════════
function Toast({ toasts, onClose }) {
  const couleurs = {
    succes: { bg:'rgba(240,253,248,0.97)', border:'rgba(16,185,129,0.35)', ic:'#10b981', txt:'#065f46', bar:'#10b981' },
    erreur: { bg:'rgba(254,242,242,0.97)', border:'rgba(239,68,68,0.35)',  ic:'#ef4444', txt:'#991b1b', bar:'#ef4444' },
    info:   { bg:'rgba(239,246,255,0.97)', border:'rgba(29,110,245,0.35)', ic:'#1d6ef5', txt:'#1e40af', bar:'#1d6ef5' },
  }
  return (
    <div style={{ position:'fixed', bottom:24, right:24, display:'flex', flexDirection:'column', gap:10, zIndex:9999, pointerEvents:'none', maxWidth:'calc(100vw - 32px)' }}>
      {toasts.map(t => {
        const c = couleurs[t.type] || couleurs.info
        return (
          <div key={t.id} style={{ display:'flex', alignItems:'flex-start', gap:11, background:c.bg, backdropFilter:'blur(20px)', WebkitBackdropFilter:'blur(20px)', border:`1px solid ${c.border}`, borderLeft:`3px solid ${c.bar}`, borderRadius:14, padding:'12px 13px', boxShadow:'0 8px 32px rgba(20,70,160,0.12)', animation:'toastIn .3s cubic-bezier(0.34,1.56,0.64,1)', minWidth:250, maxWidth:320, pointerEvents:'auto', fontFamily:"'Plus Jakarta Sans','DM Sans',sans-serif" }}>
            <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, background:t.type==='succes'?'rgba(16,185,129,0.12)':t.type==='erreur'?'rgba(239,68,68,0.12)':'rgba(29,110,245,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {t.type==='succes' && <CheckCheck  size={13} strokeWidth={2.5} color={c.ic}/>}
              {t.type==='erreur' && <AlertCircle size={13} strokeWidth={2.5} color={c.ic}/>}
              {t.type==='info'   && <Info        size={13} strokeWidth={2.5} color={c.ic}/>}
            </div>
            <div style={{ flex:1, minWidth:0, fontSize:12.5, fontWeight:700, color:c.txt, lineHeight:1.45 }}>{t.message}</div>
            <button onClick={() => onClose(t.id)} style={{ background:'none', border:'none', cursor:'pointer', padding:2, display:'flex', alignItems:'center', flexShrink:0, opacity:.5, transition:'opacity .15s' }} onMouseEnter={e=>e.currentTarget.style.opacity='1'} onMouseLeave={e=>e.currentTarget.style.opacity='0.5'}>
              <X size={12} strokeWidth={2.5} color={c.txt}/>
            </button>
          </div>
        )
      })}
    </div>
  )
}

export default function DetailIntervention() {
  const { id }          = useParams()
  const navigate        = useNavigate()
  const { utilisateur } = useAuth()

  const [intervention,   setIntervention]   = useState(null)
  const [chargement,     setChargement]     = useState(true)
  const [notes,          setNotes]          = useState('')
  const [notesInitiales, setNotesInitiales] = useState('')
  const [enCours,        setEnCours]        = useState(false)
  const [sauvegarde,     setSauvegarde]     = useState(false)
  const [ongletActif,    setOngletActif]    = useState('interventions')
  const [menuOuvert,     setMenuOuvert]     = useState(false)

  const [messages,       setMessages]       = useState([])
  const [chargementMsgs, setChargementMsgs] = useState(true)
  const [nouveauMessage, setNouveauMessage] = useState('')
  const [envoiMsg,       setEnvoiMsg]       = useState(false)

  const [modaleConfirm, setModaleConfirm] = useState(null)
  const [toasts,        setToasts]        = useState([])
  const [chatMobile,    setChatMobile]    = useState(false)

  const socketRef   = useRef(null)
  const messagesRef = useRef(null)
  const inputRef    = useRef(null)

  const afficherToast = useCallback((message, type='succes') => {
    const tid = Date.now() + Math.random()
    setToasts(prev => [...prev, { id:tid, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== tid)), 4200)
  }, [])

  const fermerToast = useCallback((tid) => {
    setToasts(prev => prev.filter(t => t.id !== tid))
  }, [])

  const charger = async () => {
    try {
      const r = await api.get(`/demandes/${id}`)
      setIntervention(r.data.demande)
      const n = r.data.demande.notes_techniques || ''
      setNotes(n); setNotesInitiales(n)
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
    charger(); chargerMessages()
    const socket = io('http://localhost:5000', { auth:{ token:localStorage.getItem('doom_token') } })
    socketRef.current = socket
    socket.emit('rejoindre-conversation', id)
    socket.on('nouveau-message', (msg) => {
      setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg])
    })
    return () => { socket.disconnect() }
  }, [id])

  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight
  }, [messages])

  const sauvegarderNotes = async () => {
    if (sauvegarde || !notes.trim()) return
    setSauvegarde(true)
    try {
      await api.put(`/demandes/${id}/notes`, { notesTechniques: notes })
      setNotesInitiales(notes)
      afficherToast('Notes sauvegardées — admins notifiés ✓', 'succes')
    } catch (err) {
      afficherToast('Erreur lors de la sauvegarde', 'erreur')
    } finally {
      setSauvegarde(false)
    }
  }

  const envoyerMessage = async () => {
    const texte = nouveauMessage.trim()
    if (!texte || envoiMsg) return
    setEnvoiMsg(true); setNouveauMessage('')
    try {
      const r = await api.post(`/messages/${id}`, { contenu: texte })
      const msg = r.data.data
      setMessages(prev => [...prev, msg])
      socketRef.current?.emit('envoyer-message', { demandeId:id, message:msg })
    } catch (err) {
      setNouveauMessage(texte)
      afficherToast("Erreur lors de l'envoi", 'erreur')
    } finally {
      setEnvoiMsg(false)
      inputRef.current?.focus()
    }
  }

  const changerStatut = async (nouveauStatut) => {
    setModaleConfirm(null); setEnCours(true)
    try {
      await api.put(`/demandes/${id}/statut`, { statut:nouveauStatut, notesTechniques:notes })
      await charger()
      afficherToast(nouveauStatut==='en_cours' ? 'Intervention démarrée !' : 'Intervention clôturée !', 'succes')
    } catch (err) {
      afficherToast('Erreur lors du changement de statut', 'erreur')
    } finally {
      setEnCours(false)
    }
  }

  // ── Loaders ──
  if (chargement) return (
    <div style={{ fontFamily:"'Plus Jakarta Sans','DM Sans',sans-serif", background:'linear-gradient(145deg,#b8d4f0,#cfe3f8,#dceeff,#edf5ff)', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{BASE_CSS}</style>
      <div style={{ background:'rgba(255,255,255,0.72)', backdropFilter:'blur(20px)', borderRadius:20, padding:'36px 52px', textAlign:'center', border:'1px solid rgba(255,255,255,0.86)' }}>
        <Loader2 size={32} strokeWidth={1.8} color="#1d6ef5" style={{ animation:'spin 1s linear infinite', marginBottom:12 }}/>
        <p style={{ fontSize:13, color:'#5a7aaa', fontWeight:600, margin:0 }}>Chargement...</p>
      </div>
    </div>
  )

  if (!intervention) return (
    <div style={{ fontFamily:"'Plus Jakarta Sans','DM Sans',sans-serif", background:'linear-gradient(145deg,#b8d4f0,#cfe3f8,#dceeff,#edf5ff)', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{BASE_CSS}</style>
      <div style={{ background:'rgba(255,255,255,0.78)', backdropFilter:'blur(20px)', borderRadius:20, padding:'44px 36px', textAlign:'center', border:'1px solid rgba(190,215,255,0.45)' }}>
        <AlertCircle size={44} strokeWidth={1.5} color="#7a9cc5" style={{ marginBottom:14 }}/>
        <h2 style={{ fontSize:17, fontWeight:800, color:'#0d2a5c', marginBottom:10 }}>Intervention introuvable</h2>
        <button onClick={() => navigate('/technicien/interventions')} style={{ background:'#1d6ef5', color:'#fff', border:'none', padding:'10px 20px', borderRadius:50, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Retour</button>
      </div>
    </div>
  )

  const config         = configStatuts[intervention.statut] || configStatuts.assigne
  const SvcIcon        = iconeService(intervention.service_nom)
  const isUrgent       = intervention.urgence === 'urgent' || intervention.urgence === 'critique'
  const dateAffichee   = new Date(intervention.date_creation).toLocaleDateString('fr-FR', { day:'numeric', month:'long', year:'numeric' })
  const notesModifiees = notes !== notesInitiales

  const infoRows = [
    { icone:User,        label:'Client',      valeur:`${intervention.client_prenom} ${intervention.client_nom}` },
    { icone:Phone,       label:'Téléphone',   valeur:intervention.client_telephone || '—' },
    { icone:SvcIcon,     label:'Service',     valeur:intervention.service_nom },
    { icone:MapPin,      label:'Lieu',        valeur:intervention.lieu==='boutique'?'En boutique':intervention.adresse||'À domicile' },
    { icone:AlertCircle, label:'Urgence',     valeur:intervention.urgence?.charAt(0).toUpperCase()+intervention.urgence?.slice(1) },
    { icone:FileText,    label:'Description', valeur:intervention.description },
  ]

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans','DM Sans',-apple-system,sans-serif", background:'linear-gradient(145deg,#b8d4f0 0%,#cfe3f8 35%,#dceeff 65%,#edf5ff 100%)', minHeight:'100vh', padding:'clamp(10px,1.8vw,18px)', boxSizing:'border-box' }}>
      <style>{BASE_CSS + EXTRA_CSS}</style>

      <div style={{ maxWidth:1300, margin:'0 auto', background:'rgba(240,247,255,0.72)', borderRadius:'clamp(14px,2vw,24px)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.90)', boxShadow:'0 8px 40px rgba(20,70,160,0.10)', overflow:'hidden' }}>

        {/* ══ TOPBAR ══ */}
        <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'clamp(10px,1.5vw,14px) clamp(14px,2.5vw,22px)', borderBottom:'1px solid rgba(180,210,255,0.35)', background:'rgba(255,255,255,0.56)', gap:8, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'clamp(10px,2vw,20px)' }}>
            <div style={{ fontSize:'clamp(13px,1.8vw,17px)', fontWeight:900, color:'#0d2a5c', letterSpacing:'2px', flexShrink:0 }}>
              D<span style={{ color:'#1d6ef5' }}>OO</span>M
            </div>
            <nav className="nav-desktop" style={{ display:'flex', gap:2, background:'rgba(255,255,255,0.72)', padding:4, borderRadius:50, border:'1px solid rgba(190,215,255,0.55)' }}>
              {navItems.map(item => {
                const Icn = item.icone
                const isA = ongletActif === item.id
                return (
                  <button key={item.id}
                    onClick={() => { setOngletActif(item.id); if (item.lien) navigate(item.lien) }}
                    style={{ display:'flex', alignItems:'center', gap:6, background:isA?'#1d6ef5':'transparent', border:'none', color:isA?'#fff':'#4a6a9e', fontSize:'clamp(10px,1.1vw,12px)', fontWeight:600, padding:'clamp(5px,0.8vw,7px) clamp(8px,1.2vw,14px)', borderRadius:50, cursor:'pointer', fontFamily:'inherit', transition:'all .2s', boxShadow:isA?'0 3px 10px rgba(29,110,245,0.28)':'none', whiteSpace:'nowrap' }}>
                    <Icn size={13} strokeWidth={2.2}/><span className="nav-label">{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
            <span style={{ fontSize:10.5, fontWeight:700, padding:'4px 11px', borderRadius:50, background:config.fond, color:config.couleur, border:`1px solid ${config.bordure}`, display:'inline-flex', alignItems:'center', gap:5, flexShrink:0 }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:config.dot }}/>{config.label}
            </span>
            <div style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:50, padding:'4px 10px', fontSize:10.5, fontWeight:700, color:'#065f46', flexShrink:0 }}>
              <span style={{ width:5, height:5, borderRadius:'50%', background:'#10b981', boxShadow:'0 0 5px #10b981' }}/>
              Technicien
            </div>
            <NotificationsBadge role="technicien"/>

            {/* Bouton chat mobile */}
            <button className="btn-chat-mob" onClick={() => setChatMobile(true)}
              style={{ display:'none', alignItems:'center', gap:5, background:'linear-gradient(135deg,#1d6ef5,#3b82f6)', color:'#fff', border:'none', padding:'6px 12px', borderRadius:50, fontSize:11.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
              <MessageSquare size={12} strokeWidth={2}/>Chat
            </button>

            <button onClick={() => navigate('/connexion')} style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', color:'#ef4444', padding:'5px 11px', borderRadius:50, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', flexShrink:0 }}>
              <LogOut size={12} strokeWidth={2.2}/><span className="nav-label">Déconnexion</span>
            </button>
            <div style={{ width:'clamp(28px,3.5vw,34px)', height:'clamp(28px,3.5vw,34px)', borderRadius:'50%', background:'linear-gradient(135deg,#10b981,#34d399)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11.5, fontWeight:800, color:'#fff', flexShrink:0 }}>
              {utilisateur?.prenom?.charAt(0) || 'T'}
            </div>
            <button className="burger-btn" onClick={() => setMenuOuvert(v=>!v)} style={{ display:'none', background:'rgba(255,255,255,0.72)', border:'1px solid rgba(190,215,255,0.55)', borderRadius:9, width:32, height:32, alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
              {menuOuvert ? <X size={14} color="#0d2a5c"/> : <Menu size={14} color="#0d2a5c"/>}
            </button>
          </div>
        </header>

        {/* Menu mobile */}
        {menuOuvert && (
          <nav style={{ background:'rgba(255,255,255,0.92)', borderBottom:'1px solid rgba(190,215,255,0.35)', padding:'8px 14px', animation:'slideDown .2s ease' }}>
            {navItems.map(item => {
              const Icn = item.icone; const isA = ongletActif === item.id
              return (
                <button key={item.id}
                  onClick={() => { setOngletActif(item.id); setMenuOuvert(false); if (item.lien) navigate(item.lien) }}
                  style={{ display:'flex', alignItems:'center', gap:10, width:'100%', padding:'10px 12px', borderRadius:10, border:'none', background:isA?'rgba(29,110,245,0.07)':'transparent', color:isA?'#1d6ef5':'#4a6a9e', fontSize:13, fontWeight:isA?700:600, cursor:'pointer', fontFamily:'inherit', marginBottom:2, borderLeft:isA?'3px solid #1d6ef5':'3px solid transparent' }}>
                  <Icn size={15} strokeWidth={2}/>{item.label}
                </button>
              )
            })}
          </nav>
        )}

        {/* ══ CORPS ══ */}
        <div style={{ padding:'clamp(14px,2vw,22px)' }}>

          {/* Fil d'Ariane */}
          <div style={{ marginBottom:'clamp(12px,2vw,18px)' }}>
            <button onClick={() => navigate('/technicien/interventions')}
              style={{ display:'inline-flex', alignItems:'center', gap:5, background:'none', border:'none', color:'#5a7aaa', fontSize:12, fontWeight:600, cursor:'pointer', padding:0, fontFamily:'inherit', marginBottom:10 }}>
              <ClipboardList size={11} strokeWidth={2}/> Mes interventions
              <ChevronRight size={11} strokeWidth={2}/>
              <span style={{ color:'#0d2a5c' }}>#{intervention.id}</span>
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
              <div style={{ width:'clamp(38px,4.5vw,46px)', height:'clamp(38px,4.5vw,46px)', borderRadius:13, flexShrink:0, background:isUrgent?'rgba(239,68,68,0.1)':'rgba(29,110,245,0.1)', border:isUrgent?'1px solid rgba(239,68,68,0.25)':'1px solid rgba(29,110,245,0.2)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <SvcIcon size={20} strokeWidth={1.8} color={isUrgent?'#ef4444':'#1d6ef5'}/>
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:9, flexWrap:'wrap', marginBottom:3 }}>
                  <h1 style={{ fontSize:'clamp(15px,2.2vw,19px)', fontWeight:800, color:'#0d2a5c', letterSpacing:'-0.4px', margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{intervention.service_nom}</h1>
                  {isUrgent && <span style={{ fontSize:9.5, fontWeight:800, padding:'2px 9px', borderRadius:50, background:'rgba(239,68,68,0.1)', color:'#ef4444', border:'1px solid rgba(239,68,68,0.25)', flexShrink:0 }}>URGENT</span>}
                </div>
                <p style={{ fontSize:11.5, color:'#7a9cc5', margin:0, display:'flex', alignItems:'center', gap:7, flexWrap:'wrap' }}>
                  <span>#{intervention.id}</span>
                  <span style={{ color:'rgba(122,156,197,0.4)' }}>·</span>
                  <span>{intervention.client_prenom} {intervention.client_nom}</span>
                  <span style={{ color:'rgba(122,156,197,0.4)' }}>·</span>
                  <Calendar size={10} strokeWidth={2} color="#7a9cc5"/><span>{dateAffichee}</span>
                </p>
              </div>
            </div>
          </div>

          {/* ══ GRILLE ══ */}
          <div className="detail-grid" style={{ display:'grid', gridTemplateColumns:'1fr', gap:14 }}>

            {/* Colonne gauche */}
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

              {/* Informations */}
              <div style={card}>
                <div style={cardHead}>
                  <div style={cardIc}><Info size={13} strokeWidth={2} color="#3a6aaa"/></div>
                  <h2 style={cardTitle}>Informations</h2>
                </div>
                <div style={{ padding:'4px 0' }}>
                  {infoRows.map((info, i) => {
                    const Icn = info.icone
                    return (
                      <div key={i} style={{ display:'grid', gridTemplateColumns:'clamp(100px,17vw,130px) 1fr', gap:9, padding:'10px clamp(12px,1.8vw,18px)', borderBottom:i<infoRows.length-1?'1px solid rgba(190,215,255,0.18)':'none', alignItems:'start' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                          <Icn size={12} strokeWidth={2} color="#7a9cc5"/>
                          <span style={{ fontSize:10, fontWeight:700, color:'#7a9cc5', textTransform:'uppercase', letterSpacing:'0.4px' }}>{info.label}</span>
                        </div>
                        <span style={{ fontSize:'clamp(12px,1.4vw,12.5px)', color:'#0d2a5c', fontWeight:600, lineHeight:'1.55', wordBreak:'break-word' }}>{info.valeur}</span>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Notes techniques */}
              <div style={card}>
                <div style={{ ...cardHead, justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                    <div style={cardIc}><FileText size={13} strokeWidth={2} color="#3a6aaa"/></div>
                    <h2 style={cardTitle}>Notes techniques</h2>
                  </div>
                  <button
                    onClick={sauvegarderNotes}
                    disabled={sauvegarde || !notesModifiees}
                    style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 13px', borderRadius:50, background:notesModifiees?'linear-gradient(135deg,#1d6ef5,#60a5fa)':'rgba(190,215,255,0.3)', color:notesModifiees?'#fff':'#7a9cc5', border:'none', fontSize:11, fontWeight:700, cursor:notesModifiees&&!sauvegarde?'pointer':'default', fontFamily:'inherit', boxShadow:notesModifiees?'0 3px 10px rgba(29,110,245,0.25)':'none', transition:'all .2s', flexShrink:0 }}>
                    {sauvegarde ? <><Loader2 size={11} style={{ animation:'spin 1s linear infinite' }}/>Sauvegarde...</> : <><Save size={11} strokeWidth={2.2}/>{notesModifiees?'Sauvegarder':'À jour'}</>}
                  </button>
                </div>
                <div style={{ padding:'clamp(12px,1.8vw,16px) clamp(12px,1.8vw,18px)' }}>
                  <p style={{ fontSize:11, color:'#7a9cc5', margin:'0 0 8px', lineHeight:1.55 }}>
                    Ajoutez vos observations, diagnostics et remarques.
                  </p>
                  <textarea
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="Ex : Problème identifié au niveau du disjoncteur. Remplacement effectué. Testé et validé."
                    rows={4}
                    style={{ width:'100%', padding:'10px 13px', border:`1.5px solid ${notesModifiees?'rgba(29,110,245,0.4)':'rgba(190,215,255,0.55)'}`, borderRadius:11, fontSize:12.5, outline:'none', resize:'vertical', fontFamily:'inherit', boxSizing:'border-box', color:'#0d2a5c', background:'rgba(240,247,255,0.5)', lineHeight:'1.6', transition:'border-color .2s' }}
                    onFocus={e => e.target.style.borderColor='#1d6ef5'}
                    onBlur={e  => e.target.style.borderColor=notesModifiees?'rgba(29,110,245,0.4)':'rgba(190,215,255,0.55)'}
                  />
                  {notesModifiees && (
                    <p style={{ fontSize:10.5, color:'#1d6ef5', fontWeight:600, margin:'6px 0 0', display:'flex', alignItems:'center', gap:4 }}>
                      <span style={{ width:5, height:5, borderRadius:'50%', background:'#1d6ef5', flexShrink:0 }}/>
                      Modifications non sauvegardées
                    </p>
                  )}
                </div>
              </div>

              {/* Boutons action */}
              {(intervention.statut === 'assigne' || intervention.statut === 'en_cours') && (
                <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
                  {intervention.statut === 'assigne' && (
                    <button onClick={() => setModaleConfirm({ action:'demarrer' })} disabled={enCours}
                      style={{ display:'flex', alignItems:'center', gap:7, padding:'clamp(8px,1.2vw,10px) clamp(16px,2vw,20px)', borderRadius:50, background:enCours?'rgba(226,232,240,0.8)':'linear-gradient(135deg,#1d6ef5,#60a5fa)', color:enCours?'#94a3b8':'#fff', border:'none', fontSize:'clamp(12px,1.3vw,13px)', fontWeight:700, cursor:enCours?'not-allowed':'pointer', fontFamily:'inherit', boxShadow:enCours?'none':'0 4px 14px rgba(29,110,245,0.3)', transition:'all .2s' }}>
                      {enCours ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }}/>En cours...</> : <><PlayCircle size={15} strokeWidth={2}/>Démarrer l'intervention</>}
                    </button>
                  )}
                  {intervention.statut === 'en_cours' && (
                    <button onClick={() => setModaleConfirm({ action:'cloturer' })} disabled={enCours}
                      style={{ display:'flex', alignItems:'center', gap:7, padding:'clamp(8px,1.2vw,10px) clamp(16px,2vw,20px)', borderRadius:50, background:enCours?'rgba(226,232,240,0.8)':'linear-gradient(135deg,#10b981,#34d399)', color:enCours?'#94a3b8':'#fff', border:'none', fontSize:'clamp(12px,1.3vw,13px)', fontWeight:700, cursor:enCours?'not-allowed':'pointer', fontFamily:'inherit', boxShadow:enCours?'none':'0 4px 14px rgba(16,185,129,0.3)', transition:'all .2s' }}>
                      {enCours ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }}/>En cours...</> : <><CheckCircle2 size={15} strokeWidth={2}/>Clôturer l'intervention</>}
                    </button>
                  )}
                </div>
              )}

              {intervention.statut === 'termine' && (
                <div style={{ display:'inline-flex', alignItems:'center', gap:10, background:'rgba(16,185,129,0.08)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:12, padding:'11px 16px' }}>
                  <div style={{ width:30, height:30, borderRadius:'50%', background:'rgba(16,185,129,0.12)', border:'1px solid rgba(16,185,129,0.3)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <CheckCircle2 size={15} strokeWidth={2} color="#10b981"/>
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:800, color:'#065f46' }}>Intervention clôturée</div>
                    <div style={{ fontSize:11, color:'#059669', marginTop:2 }}>Le client a été notifié automatiquement</div>
                  </div>
                </div>
              )}
            </div>

            {/* ════════════════════════════════
                ── CHAT PREMIUM TECHNICIEN ──
            ════════════════════════════════ */}
            <div className="chat-panel" style={{ display:'flex', flexDirection:'column', borderRadius:18, overflow:'hidden', border:'1px solid rgba(190,215,255,0.45)', boxShadow:'0 4px 24px rgba(20,70,160,0.09)', height:'clamp(460px,62vh,580px)' }}>

              {/* Header chat */}
              <div style={{ background:'linear-gradient(135deg,#0d2a5c 0%,#1340c0 55%,#1d6ef5 100%)', padding:'clamp(11px,1.6vw,15px) clamp(12px,1.8vw,18px)', display:'flex', alignItems:'center', gap:11, flexShrink:0, position:'relative', overflow:'hidden' }}>
                <div style={{ position:'absolute', width:180, height:180, borderRadius:'50%', background:'rgba(255,255,255,0.04)', top:-70, right:-50, pointerEvents:'none' }}/>
                <div style={{ position:'relative', flexShrink:0 }}>
                  <div style={{ width:'clamp(34px,3.8vw,42px)', height:'clamp(34px,3.8vw,42px)', borderRadius:'50%', background:'rgba(255,255,255,0.15)', border:'2px solid rgba(255,255,255,0.25)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'clamp(12px,1.4vw,14px)', fontWeight:800, color:'#fff' }}>
                    {intervention.client_prenom?.charAt(0)}
                  </div>
                  <span style={{ position:'absolute', bottom:1, right:1, width:8, height:8, borderRadius:'50%', background:'#4ade80', border:'2px solid #0d2a5c', boxShadow:'0 0 5px #4ade80' }}/>
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'clamp(12px,1.4vw,13.5px)', fontWeight:800, color:'#fff', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {intervention.client_prenom} {intervention.client_nom}
                  </div>
                  <div style={{ fontSize:10.5, color:'rgba(255,255,255,0.5)' }}>Client · Demande #{id}</div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:5, background:'rgba(74,222,128,0.15)', border:'1px solid rgba(74,222,128,0.3)', padding:'3px 9px', borderRadius:50, flexShrink:0 }}>
                  <span style={{ width:6, height:6, borderRadius:'50%', background:'#4ade80', boxShadow:'0 0 5px #4ade80' }}/>
                  <span style={{ fontSize:10, color:'rgba(255,255,255,0.7)', fontWeight:600 }}>En ligne</span>
                </div>
                {/* Bouton fermer overlay mobile */}
                <button className="chat-close" onClick={() => setChatMobile(false)}
                  style={{ display:'none', background:'rgba(255,255,255,0.12)', border:'1px solid rgba(255,255,255,0.2)', borderRadius:'50%', width:28, height:28, alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                  <X size={13} color="#fff"/>
                </button>
              </div>

              {/* Corps messages */}
              <div ref={messagesRef} style={{ flex:1, padding:'clamp(10px,1.4vw,14px)', overflowY:'auto', display:'flex', flexDirection:'column', gap:9, background:'linear-gradient(180deg,#eef4ff 0%,#f0f7ff 100%)' }}>

                {chargementMsgs ? (
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100%', gap:8 }}>
                    <Loader2 size={17} strokeWidth={2} color="#7a9cc5" style={{ animation:'spin 1s linear infinite' }}/>
                    <span style={{ fontSize:12, color:'#7a9cc5' }}>Chargement...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', textAlign:'center', padding:'20px', gap:10 }}>
                    <div style={{ width:50, height:50, background:'rgba(29,110,245,0.08)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <MessageSquare size={22} strokeWidth={1.6} color="#7a9cc5"/>
                    </div>
                    <p style={{ fontSize:13, fontWeight:700, color:'#5a7aaa', margin:'0 0 3px' }}>Aucun message</p>
                    <p style={{ fontSize:12, color:'#a0b4cc', margin:0 }}>Commencez la conversation avec le client</p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const estMoi    = msg.expediteur_id === utilisateur?.id
                    const showAvatar = !estMoi && (idx===0 || messages[idx-1]?.expediteur_id !== msg.expediteur_id)
                    const heure = msg.date_envoi
                      ? new Date(msg.date_envoi).toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' })
                      : '—'

                    return (
                      <div key={msg.id||idx} style={{ display:'flex', justifyContent:estMoi?'flex-end':'flex-start', alignItems:'flex-end', gap:7, animation:'msgIn .22s ease both' }}>
                        {!estMoi && (
                          <div style={{ width:26, height:26, borderRadius:'50%', background:'linear-gradient(135deg,#1d6ef5,#60a5fa)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9.5, fontWeight:800, color:'#fff', flexShrink:0, marginBottom:2, visibility:showAvatar?'visible':'hidden' }}>
                            {msg.expediteur_prenom?.charAt(0)}
                          </div>
                        )}
                        <div style={{ maxWidth:'74%', minWidth:60 }}>
                          {showAvatar && !estMoi && (
                            <div style={{ fontSize:9.5, fontWeight:700, color:'#1d6ef5', marginBottom:3, paddingLeft:2 }}>
                              {msg.expediteur_prenom} {msg.expediteur_nom}
                            </div>
                          )}
                          <div style={{
                            padding:'9px 13px',
                            background: estMoi
                              ? 'linear-gradient(135deg,#1340c0 0%,#1d6ef5 55%,#3b82f6 100%)'
                              : 'rgba(255,255,255,0.95)',
                            color: estMoi ? '#fff' : '#0d2a5c',
                            borderRadius: estMoi ? '17px 17px 3px 17px' : '17px 17px 17px 3px',
                            border: !estMoi ? '1px solid rgba(190,215,255,0.55)' : 'none',
                            boxShadow: estMoi
                              ? '0 3px 12px rgba(29,110,245,0.26)'
                              : '0 2px 7px rgba(20,70,160,0.06)',
                          }}>
                            <div style={{ fontSize:'clamp(12px,1.4vw,13px)', lineHeight:'1.6', wordBreak:'break-word' }}>{msg.contenu}</div>
                            <div style={{ fontSize:9.5, marginTop:4, textAlign:'right', color:estMoi?'rgba(255,255,255,0.5)':'#b0c4da', display:'flex', justifyContent:'flex-end', alignItems:'center', gap:4 }}>
                              {heure}
                              {estMoi && <CheckCheck size={10} strokeWidth={2} color="rgba(255,255,255,0.5)"/>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              {/* Zone saisie */}
              <div style={{ padding:'clamp(9px,1.3vw,12px)', borderTop:'1px solid rgba(190,215,255,0.35)', background:'rgba(255,255,255,0.72)', flexShrink:0 }}>
                <div style={{ display:'flex', gap:7, alignItems:'flex-end' }}>
                  <div style={{ flex:1, position:'relative' }}>
                    <input
                      ref={inputRef}
                      type="text"
                      value={nouveauMessage}
                      onChange={e => setNouveauMessage(e.target.value)}
                      onKeyDown={e => e.key==='Enter' && !e.shiftKey && envoyerMessage()}
                      placeholder="Écrire un message…"
                      disabled={envoiMsg}
                      style={{ width:'100%', padding:'9px 40px 9px 15px', border:'1.5px solid rgba(190,215,255,0.55)', borderRadius:50, fontSize:'clamp(12px,1.3vw,13px)', outline:'none', fontFamily:'inherit', background:'rgba(245,249,255,0.9)', color:'#0d2a5c', transition:'border-color .2s, box-shadow .2s', boxSizing:'border-box' }}
                      onFocus={e => { e.target.style.borderColor='#1d6ef5'; e.target.style.boxShadow='0 0 0 3px rgba(29,110,245,0.1)' }}
                      onBlur={e  => { e.target.style.borderColor='rgba(190,215,255,0.55)'; e.target.style.boxShadow='none' }}
                    />
                    <Smile size={14} strokeWidth={1.8} color="#94a3b8" style={{ position:'absolute', right:13, top:'50%', transform:'translateY(-50%)', cursor:'pointer' }}/>
                  </div>
                  <button
                    onClick={envoyerMessage}
                    disabled={!nouveauMessage.trim()||envoiMsg}
                    style={{ width:'clamp(34px,3.8vw,40px)', height:'clamp(34px,3.8vw,40px)', borderRadius:'50%', background:nouveauMessage.trim()&&!envoiMsg?'linear-gradient(135deg,#1d6ef5,#3b82f6)':'rgba(190,215,255,0.38)', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:nouveauMessage.trim()&&!envoiMsg?'pointer':'not-allowed', flexShrink:0, transition:'all .2s', boxShadow:nouveauMessage.trim()&&!envoiMsg?'0 4px 12px rgba(29,110,245,0.3)':'none' }}>
                    {envoiMsg
                      ? <Loader2 size={13} strokeWidth={2} color="#fff" style={{ animation:'spin 1s linear infinite' }}/>
                      : <Send size={13} strokeWidth={2.3} color={nouveauMessage.trim()?'#fff':'#7a9cc5'}/>
                    }
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ══ MODALE Démarrer ══ */}
      {modaleConfirm?.action === 'demarrer' && (
        <Modale
          onClose={() => setModaleConfirm(null)}
          icon={<PlayCircle size={20} strokeWidth={1.8} color="#1d6ef5"/>}
          icBg="rgba(29,110,245,0.10)" icBorder="rgba(29,110,245,0.22)"
          titre="Démarrer l'intervention ?"
          statut={<><strong style={{ color:'#1d6ef5' }}>En cours</strong></>}
          nomService={intervention.service_nom} SvcIcon={SvcIcon}
          note={{ bg:'rgba(29,110,245,0.06)', border:'rgba(29,110,245,0.14)', color:'#1e40af', texte:'Le client sera notifié que son intervention a démarré.' }}
          onConfirm={() => changerStatut('en_cours')}
          confirmBg="linear-gradient(135deg,#1d6ef5,#60a5fa)" confirmIc={<PlayCircle size={13} strokeWidth={2.2}/>}
          confirmLabel="Démarrer"
        />
      )}

      {/* ══ MODALE Clôturer ══ */}
      {modaleConfirm?.action === 'cloturer' && (
        <Modale
          onClose={() => setModaleConfirm(null)}
          icon={<CheckCircle2 size={20} strokeWidth={1.8} color="#10b981"/>}
          icBg="rgba(16,185,129,0.10)" icBorder="rgba(16,185,129,0.22)"
          titre="Clôturer l'intervention ?"
          statut={<><strong style={{ color:'#10b981' }}>Terminée</strong></>}
          nomService={intervention.service_nom} SvcIcon={SvcIcon}
          note={{ bg:'rgba(16,185,129,0.06)', border:'rgba(16,185,129,0.14)', color:'#065f46', texte:'Le client sera notifié que son intervention est terminée.' }}
          onConfirm={() => changerStatut('termine')}
          confirmBg="linear-gradient(135deg,#10b981,#34d399)" confirmIc={<CheckCircle2 size={13} strokeWidth={2.2}/>}
          confirmLabel="Clôturer"
        />
      )}

      <Toast toasts={toasts} onClose={fermerToast}/>
    </div>
  )
}

// ── Modale réutilisable ──────────────────────────────────────────────────────
function Modale({ onClose, icon, icBg, icBorder, titre, statut, nomService, SvcIcon, note, onConfirm, confirmBg, confirmIc, confirmLabel }) {
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, background:'rgba(13,42,92,0.38)', backdropFilter:'blur(10px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:16 }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:'rgba(235,245,255,0.96)', backdropFilter:'blur(28px)', borderRadius:20, padding:'26px 22px 20px', maxWidth:340, width:'100%', border:'1px solid rgba(255,255,255,0.90)', boxShadow:'0 20px 48px rgba(13,42,92,0.15)', textAlign:'center', fontFamily:"'Plus Jakarta Sans','DM Sans',sans-serif" }}>
        <div style={{ width:48, height:48, borderRadius:'50%', background:icBg, border:`1px solid ${icBorder}`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>{icon}</div>
        <h3 style={{ fontSize:15, fontWeight:800, color:'#0d2a5c', margin:'0 0 6px' }}>{titre}</h3>
        <p style={{ fontSize:12.5, color:'#5a7aaa', margin:'0 0 5px', lineHeight:1.6 }}>Statut → {statut}</p>
        <div style={{ display:'inline-flex', alignItems:'center', gap:7, background:'rgba(255,255,255,0.70)', border:'1px solid rgba(190,215,255,0.60)', borderRadius:50, padding:'4px 13px', marginBottom:16 }}>
          <SvcIcon size={11} strokeWidth={2} color="#1d6ef5"/>
          <span style={{ fontSize:12, fontWeight:700, color:'#0d2a5c' }}>{nomService}</span>
        </div>
        <p style={{ fontSize:11, color:note.color, fontWeight:600, background:note.bg, border:`1px solid ${note.border}`, borderRadius:9, padding:'7px 11px', margin:'0 0 18px', lineHeight:1.6 }}>{note.texte}</p>
        <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
          <button onClick={onClose} style={{ padding:'8px 18px', borderRadius:50, background:'rgba(255,255,255,0.70)', border:'1px solid rgba(190,215,255,0.55)', color:'#5a7aaa', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Annuler</button>
          <button onClick={onConfirm} style={{ display:'flex', alignItems:'center', gap:5, padding:'8px 18px', borderRadius:50, background:confirmBg, border:'none', color:'#fff', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 4px 10px rgba(0,0,0,0.15)' }}>
            {confirmIc}{confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Styles ───────────────────────────────────────────────────────────────────
const card      = { background:'rgba(255,255,255,0.78)', borderRadius:'clamp(13px,1.8vw,17px)', overflow:'hidden', border:'1px solid rgba(190,215,255,0.45)', boxShadow:'0 3px 14px rgba(20,70,160,0.05)' }
const cardHead  = { padding:'clamp(10px,1.5vw,13px) clamp(12px,1.8vw,18px)', borderBottom:'1px solid rgba(190,215,255,0.3)', background:'rgba(255,255,255,0.60)', display:'flex', alignItems:'center', gap:8 }
const cardIc    = { width:28, height:28, borderRadius:8, background:'rgba(190,215,255,0.35)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }
const cardTitle = { fontSize:'clamp(12px,1.4vw,13px)', fontWeight:800, color:'#0d2a5c', margin:0 }

const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
  @keyframes toastIn   { from{opacity:0;transform:translateX(28px) scale(0.95)} to{opacity:1;transform:translateX(0) scale(1)} }
  @keyframes msgIn     { from{opacity:0;transform:translateY(7px)} to{opacity:1;transform:translateY(0)} }
`

const EXTRA_CSS = `
  /* Nav responsive */
  @media (max-width: 700px) {
    .nav-desktop { display: none !important; }
    .burger-btn  { display: flex !important; }
    .btn-chat-mob { display: flex !important; }
    .nav-label   { display: none !important; }
  }

  /* Grille desktop */
  @media (min-width: 860px) {
    .detail-grid { grid-template-columns: 1fr 370px !important; }
    .chat-panel  { position: sticky; top: 14px; }
  }

  /* Chat masqué sur mobile, affiché en overlay via classe active */
  @media (max-width: 859px) {
    .chat-panel { display: none !important; }
    .chat-panel.mobile-open {
      display: flex !important;
      position: fixed; inset: 0; z-index: 110;
      border-radius: 0 !important; height: 100dvh !important;
    }
    .chat-close { display: flex !important; }
  }

  /* Scrollbar chat fine */
  .chat-panel > div:nth-child(2)::-webkit-scrollbar { width: 4px; }
  .chat-panel > div:nth-child(2)::-webkit-scrollbar-track { background: transparent; }
  .chat-panel > div:nth-child(2)::-webkit-scrollbar-thumb { background: rgba(190,215,255,0.55); border-radius: 2px; }
`