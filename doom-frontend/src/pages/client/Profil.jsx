// ============================================
// PROFIL.JSX — Profil client avec validations
// ✅ Drapeaux via images CDN (pas emojis)
// ✅ Sélecteur pays + indicatif sur téléphone
// ✅ Mêmes règles validation que Connexion.jsx
// ✅ Nom/prénom obligatoires
// ✅ Téléphone obligatoire avec format par pays
// ✅ Mot de passe : 8 car., 1 maj., 1 chiffre
// ✅ Responsive mobile / tablette / desktop
// ============================================

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, ClipboardList, MessageSquare, User,
  Plus, Save, Lock, Eye, EyeOff,
  Mail, Phone, MapPin, Shield, LogOut, CheckCircle2,
  AlertCircle, Camera, Loader2, Menu, X, ChevronDown,
  Check,
} from 'lucide-react'
import { useAuth } from '../../contexte/AuthContexte'
import api from '../../services/api'

// ════════════════════════════════════════
// LISTE PAYS (mêmes que Connexion.jsx)
// ════════════════════════════════════════
const PAYS = [
  { code:'CM', nom:'Cameroun',       indicatif:'+237', longueur:9,  exemple:'6XX XXX XXX' },
  { code:'CG', nom:'Congo',          indicatif:'+242', longueur:9,  exemple:'XX XXX XXXX' },
  { code:'GA', nom:'Gabon',          indicatif:'+241', longueur:8,  exemple:'XX XX XX XX' },
  { code:'TD', nom:'Tchad',          indicatif:'+235', longueur:8,  exemple:'XX XX XX XX' },
  { code:'SN', nom:'Sénégal',        indicatif:'+221', longueur:9,  exemple:'7X XXX XXXX' },
  { code:'CI', nom:"Côte d'Ivoire",  indicatif:'+225', longueur:10, exemple:'XX XX XXX XXX' },
  { code:'NG', nom:'Nigeria',        indicatif:'+234', longueur:10, exemple:'XXX XXX XXXX' },
  { code:'GH', nom:'Ghana',          indicatif:'+233', longueur:9,  exemple:'XX XXX XXXX' },
  { code:'MA', nom:'Maroc',          indicatif:'+212', longueur:9,  exemple:'6XX XXX XXX' },
  { code:'DZ', nom:'Algérie',        indicatif:'+213', longueur:9,  exemple:'5XX XXX XXX' },
  { code:'TN', nom:'Tunisie',        indicatif:'+216', longueur:8,  exemple:'XX XXX XXX' },
  { code:'EG', nom:'Égypte',         indicatif:'+20',  longueur:10, exemple:'1XX XXX XXXX' },
  { code:'ZA', nom:'Afrique du Sud', indicatif:'+27',  longueur:9,  exemple:'6X XXX XXXX' },
  { code:'KE', nom:'Kenya',          indicatif:'+254', longueur:9,  exemple:'7XX XXX XXX' },
  { code:'FR', nom:'France',         indicatif:'+33',  longueur:9,  exemple:'6XX XXX XXX' },
  { code:'BE', nom:'Belgique',       indicatif:'+32',  longueur:9,  exemple:'4XX XXX XXX' },
  { code:'CH', nom:'Suisse',         indicatif:'+41',  longueur:9,  exemple:'7X XXX XXXX' },
  { code:'DE', nom:'Allemagne',      indicatif:'+49',  longueur:10, exemple:'1XX XXXXXXX' },
  { code:'ES', nom:'Espagne',        indicatif:'+34',  longueur:9,  exemple:'6XX XXX XXX' },
  { code:'GB', nom:'Royaume-Uni',    indicatif:'+44',  longueur:10, exemple:'7XXX XXXXXX' },
  { code:'US', nom:'États-Unis',     indicatif:'+1',   longueur:10, exemple:'(XXX) XXX-XXXX' },
  { code:'CA', nom:'Canada',         indicatif:'+1',   longueur:10, exemple:'(XXX) XXX-XXXX' },
  { code:'BR', nom:'Brésil',         indicatif:'+55',  longueur:11, exemple:'(XX) XXXXX-XXXX' },
  { code:'IN', nom:'Inde',           indicatif:'+91',  longueur:10, exemple:'XXXXX XXXXX' },
  { code:'CN', nom:'Chine',          indicatif:'+86',  longueur:11, exemple:'1XX XXXX XXXX' },
  { code:'AU', nom:'Australie',      indicatif:'+61',  longueur:9,  exemple:'4XX XXX XXX' },
]

// ════════════════════════════════════════
// VALIDATIONS (identiques à Connexion.jsx)
// ════════════════════════════════════════
const validerTelephone = (numero, pays) => {
  const chiffres = numero.replace(/[\s\-().+]/g, '')
  if (!chiffres) return { valide:false, message:'Numéro requis' }
  if (chiffres.length !== pays.longueur)
    return { valide:false, message:`${pays.longueur} chiffres requis pour ${pays.nom} (ex: ${pays.exemple})` }
  if (!/^\d+$/.test(chiffres)) return { valide:false, message:'Chiffres uniquement' }
  return { valide:true, message:'' }
}

const validerMotDePasse = (mdp) => {
  const erreurs = []
  if (mdp.length < 8)     erreurs.push('8 caractères minimum')
  if (!/[A-Z]/.test(mdp)) erreurs.push('1 majuscule minimum')
  if (!/[0-9]/.test(mdp)) erreurs.push('1 chiffre minimum')
  return {
    valide: erreurs.length === 0,
    erreurs,
    force: mdp.length === 0 ? 0 : erreurs.length >= 3 ? 1 : erreurs.length === 2 ? 2 : erreurs.length === 1 ? 3 : 4,
  }
}

// ════════════════════════════════════════
// Drapeau via image CDN (pas emoji)
// ════════════════════════════════════════
const Drapeau = ({ code, size = 20 }) => (
  <img
    src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
    alt={code}
    width={size}
    height={Math.round(size * 0.67)}
    style={{ borderRadius: 3, objectFit: 'cover', flexShrink: 0 }}
    onError={e => { e.target.style.display = 'none' }}
  />
)

// ════════════════════════════════════════
// SÉLECTEUR PAYS avec drapeaux images
// ════════════════════════════════════════
const SelecteurPays = ({ pays, onChange }) => {
  const [ouvert,    setOuvert]    = useState(false)
  const [recherche, setRecherche] = useState('')
  const ref = useRef(null)

  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) setOuvert(false) }
    if (ouvert) document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [ouvert])

  const filtres = PAYS.filter(p =>
    p.nom.toLowerCase().includes(recherche.toLowerCase()) || p.indicatif.includes(recherche)
  )

  return (
    <div ref={ref} style={{ position:'relative' }}>
      <button
        type="button"
        onClick={() => setOuvert(o => !o)}
        style={{
          display:'flex', alignItems:'center', gap:7,
          background:'rgba(255,255,255,0.72)',
          border:'1.5px solid rgba(190,215,255,0.55)',
          borderRadius:11, padding:'9px 11px',
          cursor:'pointer', fontFamily:'inherit',
          color:'#0d2a5c', fontSize:12.5, fontWeight:700,
          transition:'all .2s', whiteSpace:'nowrap',
          minWidth:110,
        }}
      >
        <Drapeau code={pays.code} size={18}/>
        <span style={{ color:'#5a7aaa', fontSize:12 }}>{pays.indicatif}</span>
        <ChevronDown size={11} strokeWidth={2.5} color="#7a9cc5"
          style={{ transition:'transform .2s', transform:ouvert?'rotate(180deg)':'none' }}/>
      </button>

      {ouvert && (
        <div style={{
          position:'absolute', top:'calc(100% + 6px)', left:0, zIndex:300,
          background:'rgba(240,247,255,0.98)', backdropFilter:'blur(20px)',
          border:'1px solid rgba(190,215,255,0.55)', borderRadius:14,
          boxShadow:'0 16px 40px rgba(20,70,160,0.15)',
          width:260, maxHeight:260, overflow:'hidden',
          display:'flex', flexDirection:'column',
        }}>
          <div style={{ padding:'8px 10px', borderBottom:'1px solid rgba(190,215,255,0.3)' }}>
            <input
              type="text" autoFocus
              placeholder="Rechercher un pays…"
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              style={{
                width:'100%', background:'rgba(255,255,255,0.8)',
                border:'1.5px solid rgba(190,215,255,0.55)',
                borderRadius:8, padding:'7px 10px',
                fontSize:12, color:'#0d2a5c', outline:'none',
                fontFamily:'inherit', boxSizing:'border-box',
              }}
            />
          </div>
          <div style={{ overflowY:'auto', flex:1 }}>
            {filtres.length === 0 ? (
              <p style={{ fontSize:12, color:'#7a9cc5', textAlign:'center', padding:'14px 0' }}>Aucun résultat</p>
            ) : filtres.map(p => (
              <button key={p.code} type="button"
                onClick={() => { onChange(p); setOuvert(false); setRecherche('') }}
                style={{
                  display:'flex', alignItems:'center', gap:9,
                  width:'100%', padding:'9px 13px', border:'none',
                  background: p.code === pays.code ? 'rgba(29,110,245,0.1)' : 'transparent',
                  cursor:'pointer', fontFamily:'inherit', textAlign:'left',
                  transition:'background .12s',
                }}
                onMouseEnter={e => { if (p.code !== pays.code) e.currentTarget.style.background='rgba(190,215,255,0.2)' }}
                onMouseLeave={e => { if (p.code !== pays.code) e.currentTarget.style.background='transparent' }}
              >
                <Drapeau code={p.code} size={18}/>
                <span style={{ fontSize:12, color:'#0d2a5c', fontWeight:600, flex:1 }}>{p.nom}</span>
                <span style={{ fontSize:11, color:'#7a9cc5', fontWeight:700 }}>{p.indicatif}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════
// NAV ITEMS
// ════════════════════════════════════════
const navItems = [
  { id:'dashboard', label:'Tableau de bord', icone:LayoutDashboard, lien:'/client/dashboard' },
  { id:'demandes',  label:'Mes demandes',    icone:ClipboardList,   lien:'/client/demandes'  },
  { id:'messages',  label:'Messages',        icone:MessageSquare,   lien:'/client/demandes'  },
  { id:'profil',    label:'Mon profil',      icone:User,            lien:null                },
]

// ════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════
export default function Profil() {
  const navigate = useNavigate()
  const { utilisateur, setUtilisateur, deconnexion } = useAuth()

  const [ongletActif,    setOngletActif]    = useState('profil')
  const [sectionActive,  setSectionActive]  = useState('infos')
  const [showActuel,     setShowActuel]     = useState(false)
  const [showNouveau,    setShowNouveau]    = useState(false)
  const [showConfirm,    setShowConfirm]    = useState(false)
  const [succes,         setSucces]         = useState('')
  const [erreur,         setErreur]         = useState('')
  const [chargement,     setChargement]     = useState(true)
  const [enregistrement, setEnregistrement] = useState(false)
  const [menuOuvert,     setMenuOuvert]     = useState(false)

  // Profil
  const [profil, setProfil] = useState({
    nom:'', prenom:'', email:'', telephone:'', adresse:'',
  })

  // Pays sélectionné pour le téléphone
  const [pays, setPays] = useState(PAYS.find(p => p.code === 'CM'))

  // Validation téléphone en temps réel
  const [toucheTel,   setToucheTel]   = useState(false)
  const [toucheMdpN,  setToucheMdpN]  = useState(false)
  const [toucheMdpCf, setToucheMdpCf] = useState(false)

  // Mot de passe
  const [mdp, setMdp] = useState({ actuel:'', nouveau:'', confirmation:'' })

  // ── Chargement initial du profil ──
  useEffect(() => {
    api.get('/auth/profil')
      .then(r => {
        const u = r.data.utilisateur
        // Extraire indicatif depuis le numéro stocké (ex: "+237612345678")
        let telBrut    = u.telephone || ''
        let paysTrouve = PAYS.find(p => p.code === 'CM')

        if (telBrut.startsWith('+')) {
          const trouvé = PAYS.find(p => telBrut.startsWith(p.indicatif))
          if (trouvé) {
            paysTrouve = trouvé
            telBrut    = telBrut.slice(trouvé.indicatif.length)
          }
        }

        setPays(paysTrouve)
        setProfil({
          nom:       u.nom       || '',
          prenom:    u.prenom    || '',
          email:     u.email     || '',
          telephone: telBrut,
          adresse:   u.adresse   || '',
        })
      })
      .catch(() => afficherErreur('Impossible de charger votre profil.'))
      .finally(() => setChargement(false))
  }, [])

  const afficherSucces = msg => { setSucces(msg); setErreur(''); setTimeout(() => setSucces(''), 3500) }
  const afficherErreur = msg => { setErreur(msg); setSucces(''); setTimeout(() => setErreur(''), 3500) }

  // Validation téléphone
  const validTel = validerTelephone(profil.telephone, pays)

  // Validation nouveau mdp
  const validMdpN    = validerMotDePasse(mdp.nouveau)
  const mdpIdentique = mdp.nouveau === mdp.confirmation && mdp.confirmation.length > 0
  const couleurForce = ['','#ef4444','#f59e0b','#3b82f6','#10b981'][validMdpN.force]
  const libelleForce = ['','Très faible','Faible','Moyen','Fort'][validMdpN.force]

  // ── Sauvegarder profil ──
  const sauvegarderProfil = async () => {
    // Validations
    if (!profil.nom.trim() || !profil.prenom.trim()) {
      afficherErreur('Le nom et le prénom sont obligatoires.'); return
    }
    if (!profil.telephone.trim()) {
      afficherErreur('Le numéro de téléphone est obligatoire.'); return
    }
    setToucheTel(true)
    if (!validTel.valide) {
      afficherErreur(validTel.message); return
    }

    const telComplet = `${pays.indicatif}${profil.telephone.replace(/[\s\-().]/g, '')}`

    try {
      setEnregistrement(true)
      await api.put('/auth/profil', {
        nom:       profil.nom,
        prenom:    profil.prenom,
        telephone: telComplet,
        adresse:   profil.adresse,
      })
      const u = { ...utilisateur, nom:profil.nom, prenom:profil.prenom }
      setUtilisateur(u)
      localStorage.setItem('doom_utilisateur', JSON.stringify(u))
      afficherSucces('Profil mis à jour avec succès !')
    } catch (err) {
      afficherErreur(err.response?.data?.message || 'Erreur lors de la sauvegarde.')
    } finally {
      setEnregistrement(false)
    }
  }

  // ── Changer mot de passe ──
  const changerMotDePasse = async () => {
    setToucheMdpN(true)
    setToucheMdpCf(true)

    if (!mdp.actuel) { afficherErreur('Entrez votre mot de passe actuel.'); return }
    if (!validMdpN.valide) {
      afficherErreur(`Nouveau mot de passe : ${validMdpN.erreurs.join(', ')}`); return
    }
    if (!mdpIdentique) { afficherErreur('Les mots de passe ne correspondent pas.'); return }

    try {
      setEnregistrement(true)
      await api.put('/auth/changer-mot-de-passe', {
        motDePasseActuel:  mdp.actuel,
        nouveauMotDePasse: mdp.nouveau,
      })
      afficherSucces('Mot de passe modifié avec succès !')
      setMdp({ actuel:'', nouveau:'', confirmation:'' })
      setToucheMdpN(false); setToucheMdpCf(false)
    } catch (err) {
      afficherErreur(err.response?.data?.message || 'Erreur lors du changement.')
    } finally {
      setEnregistrement(false)
    }
  }

  // ── Styles réutilisables ──
  const label = {
    fontSize:11, fontWeight:700, color:'#5a7aaa',
    textTransform:'uppercase', letterSpacing:'0.8px',
    display:'block', marginBottom:6,
  }
  const input = {
    width:'100%', padding:'10px 13px',
    border:'1.5px solid rgba(190,215,255,0.55)',
    borderRadius:11, fontSize:13, outline:'none',
    fontFamily:"'Plus Jakarta Sans','DM Sans',sans-serif",
    boxSizing:'border-box', background:'rgba(255,255,255,0.72)',
    color:'#0d2a5c', transition:'border-color .2s, box-shadow .2s',
  }
  const focusIn  = e => { e.target.style.borderColor='#1d6ef5'; e.target.style.boxShadow='0 0 0 3px rgba(29,110,245,0.1)' }
  const focusOut = e => { e.target.style.borderColor='rgba(190,215,255,0.55)'; e.target.style.boxShadow='none' }

  // ── Chargement ──
  if (chargement) return (
    <div style={{ fontFamily:"'Plus Jakarta Sans','DM Sans',sans-serif", background:'linear-gradient(145deg,#b8d4f0,#cfe3f8,#dceeff,#edf5ff)', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:14 }}>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      <Loader2 size={30} color="#1d6ef5" style={{ animation:'spin 1s linear infinite' }}/>
      <p style={{ color:'#5a7aaa', fontSize:13, fontWeight:600 }}>Chargement de votre profil…</p>
    </div>
  )

  return (
    <div style={{ fontFamily:"'Plus Jakarta Sans','DM Sans',-apple-system,sans-serif", background:'linear-gradient(145deg,#b8d4f0 0%,#cfe3f8 35%,#dceeff 65%,#edf5ff 100%)', minHeight:'100vh', padding:'clamp(12px,2.5vw,24px)', boxSizing:'border-box' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes spin      { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .prf-layout   { display:grid; grid-template-columns:250px 1fr; gap:16px; }
        .prf-nav-desk { display:flex; }
        .prf-nav-mob  { display:none; }
        .prf-fg       { display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:14px; }
        @media(max-width:860px){ .prf-layout{grid-template-columns:1fr} }
        @media(max-width:600px){ .prf-nav-desk{display:none} .prf-nav-mob{display:flex} .prf-fg{grid-template-columns:1fr} }
      `}</style>

      <div style={{ maxWidth:1280, margin:'0 auto', background:'rgba(240,247,255,0.72)', borderRadius:'clamp(16px,2.5vw,26px)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.90)', boxShadow:'0 8px 40px rgba(20,70,160,0.10)', overflow:'hidden' }}>

        {/* ══ TOPBAR ══ */}
        <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'clamp(12px,2vw,15px) clamp(16px,3vw,24px)', borderBottom:'1px solid rgba(180,210,255,0.35)', background:'rgba(255,255,255,0.56)', gap:10, flexWrap:'wrap' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'clamp(14px,3vw,32px)' }}>
            <div style={{ fontSize:'clamp(15px,2vw,17px)', fontWeight:900, color:'#0d2a5c', letterSpacing:'2px', flexShrink:0 }}>
              D<span style={{ color:'#1d6ef5' }}>OO</span>M
            </div>
            <nav className="prf-nav-desk" style={{ gap:2, background:'rgba(255,255,255,0.72)', padding:4, borderRadius:50, border:'1px solid rgba(190,215,255,0.55)' }}>
              {navItems.map(item => {
                const Icn = item.icone; const isA = ongletActif === item.id
                return (
                  <button key={item.id} onClick={() => { setOngletActif(item.id); if (item.lien) navigate(item.lien) }}
                    style={{ display:'flex', alignItems:'center', gap:6, background:isA?'#1d6ef5':'transparent', border:'none', color:isA?'#fff':'#4a6a9e', fontSize:'clamp(11px,1.2vw,12px)', fontWeight:600, padding:'6px clamp(10px,1.5vw,14px)', borderRadius:50, cursor:'pointer', fontFamily:'inherit', transition:'all .2s', boxShadow:isA?'0 3px 10px rgba(29,110,245,0.28)':'none', whiteSpace:'nowrap' }}>
                    <Icn size={13} strokeWidth={2.2}/>{item.label}
                  </button>
                )
              })}
            </nav>
          </div>

          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <button onClick={() => navigate('/client/nouvelle-demande')} style={{ display:'flex', alignItems:'center', gap:6, background:'linear-gradient(135deg,#1d6ef5,#3b82f6)', color:'#fff', border:'none', padding:'7px clamp(12px,2vw,18px)', borderRadius:50, fontSize:'clamp(11px,1.2vw,12px)', fontWeight:700, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 3px 12px rgba(29,110,245,0.28)', flexShrink:0 }}>
              <Plus size={13} strokeWidth={2.5}/><span style={{ display:'none' }} className="btn-lbl">Nouvelle demande</span>
            </button>
            <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#1d6ef5,#60a5fa)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:800, color:'#fff', flexShrink:0 }}>
              {profil.prenom?.charAt(0)}{profil.nom?.charAt(0)}
            </div>
            <button className="prf-nav-mob" onClick={() => setMenuOuvert(v=>!v)} style={{ background:'rgba(255,255,255,0.72)', border:'1px solid rgba(190,215,255,0.55)', borderRadius:10, width:34, height:34, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
              {menuOuvert ? <X size={15} color="#0d2a5c"/> : <Menu size={15} color="#0d2a5c"/>}
            </button>
          </div>
        </header>

        {/* Menu mobile */}
        {menuOuvert && (
          <nav style={{ background:'rgba(255,255,255,0.92)', borderBottom:'1px solid rgba(190,215,255,0.4)', padding:'8px 14px', animation:'slideDown .2s ease' }}>
            {navItems.map(item => {
              const Icn = item.icone; const isA = ongletActif === item.id
              return (
                <button key={item.id} onClick={() => { setOngletActif(item.id); setMenuOuvert(false); if (item.lien) navigate(item.lien) }}
                  style={{ display:'flex', alignItems:'center', gap:9, width:'100%', padding:'10px 13px', borderRadius:11, border:'none', background:isA?'rgba(29,110,245,0.08)':'transparent', color:isA?'#1d6ef5':'#4a6a9e', fontSize:13, fontWeight:isA?700:600, cursor:'pointer', fontFamily:'inherit', marginBottom:2, borderLeft:isA?'3px solid #1d6ef5':'3px solid transparent' }}>
                  <Icn size={15} strokeWidth={2}/>{item.label}
                </button>
              )
            })}
          </nav>
        )}

        {/* ══ CORPS ══ */}
        <div style={{ padding:'clamp(16px,3vw,26px)' }}>

          <div style={{ marginBottom:'clamp(14px,2.5vw,22px)' }}>
            <p style={{ fontSize:10.5, fontWeight:700, color:'#1d6ef5', textTransform:'uppercase', letterSpacing:'1.8px', marginBottom:4 }}>Espace client</p>
            <h1 style={{ fontSize:'clamp(18px,3.5vw,26px)', fontWeight:800, color:'#0d2a5c', letterSpacing:'-0.5px', margin:0 }}>Mon profil</h1>
            <p style={{ fontSize:12.5, color:'#5a7aaa', margin:'3px 0 0', fontWeight:500 }}>Gérez vos informations personnelles</p>
          </div>

          <div className="prf-layout">

            {/* ── Colonne gauche ── */}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

              {/* Avatar */}
              <div style={{ background:'rgba(255,255,255,0.78)', borderRadius:'clamp(13px,2vw,18px)', padding:'clamp(16px,2.5vw,22px) clamp(13px,2vw,16px)', border:'1px solid rgba(190,215,255,0.45)', boxShadow:'0 2px 14px rgba(20,70,160,0.05)', display:'flex', flexDirection:'column', alignItems:'center', gap:10, textAlign:'center' }}>
                <div style={{ position:'relative' }}>
                  <div style={{ width:'clamp(60px,8vw,74px)', height:'clamp(60px,8vw,74px)', borderRadius:'50%', background:'linear-gradient(135deg,#1d6ef5,#60a5fa)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'clamp(18px,2.5vw,24px)', fontWeight:800, color:'#fff', boxShadow:'0 5px 18px rgba(29,110,245,0.28)' }}>
                    {profil.prenom?.charAt(0)}{profil.nom?.charAt(0)}
                  </div>
                  <button style={{ position:'absolute', bottom:0, right:0, width:24, height:24, borderRadius:'50%', background:'#fff', border:'2px solid rgba(190,215,255,0.6)', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 2px 6px rgba(20,70,160,0.1)' }}>
                    <Camera size={11} strokeWidth={2} color="#1d6ef5"/>
                  </button>
                </div>
                <div>
                  <div style={{ fontSize:'clamp(12px,1.5vw,14px)', fontWeight:800, color:'#0d2a5c', letterSpacing:'-0.2px' }}>{profil.prenom} {profil.nom}</div>
                  <div style={{ fontSize:11, color:'#7a9cc5', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'100%' }}>{profil.email}</div>
                </div>
                <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(29,110,245,0.08)', border:'1px solid rgba(29,110,245,0.2)', borderRadius:50, padding:'3px 11px', fontSize:10, fontWeight:700, color:'#1d6ef5' }}>
                  <span style={{ width:5, height:5, borderRadius:'50%', background:'#1d6ef5' }}/>{utilisateur?.role || 'Client'}
                </div>
              </div>

              {/* Nav sections */}
              <div style={{ background:'rgba(255,255,255,0.78)', borderRadius:'clamp(13px,2vw,18px)', overflow:'hidden', border:'1px solid rgba(190,215,255,0.45)', boxShadow:'0 2px 12px rgba(20,70,160,0.04)' }}>
                {[
                  { val:'infos',    label:'Informations personnelles', icone:User   },
                  { val:'password', label:'Mot de passe',              icone:Lock   },
                ].map((s, i) => {
                  const Icn = s.icone; const isA = sectionActive === s.val
                  return (
                    <button key={s.val} onClick={() => setSectionActive(s.val)} style={{ display:'flex', alignItems:'center', gap:9, width:'100%', padding:'clamp(11px,1.8vw,13px) clamp(13px,2vw,16px)', background:isA?'rgba(29,110,245,0.07)':'transparent', border:'none', borderBottom:i===0?'1px solid rgba(190,215,255,0.25)':'none', borderLeft:isA?'3px solid #1d6ef5':'3px solid transparent', color:isA?'#1d6ef5':'#5a7aaa', fontSize:'clamp(11px,1.3vw,12px)', fontWeight:isA?700:600, cursor:'pointer', fontFamily:'inherit', textAlign:'left', transition:'all .18s' }}>
                      <Icn size={14} strokeWidth={2.1}/>{s.label}
                    </button>
                  )
                })}
              </div>

              {/* Déconnexion */}
              <button onClick={deconnexion} style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:7, width:'100%', padding:11, background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:13, color:'#ef4444', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'all .18s' }}>
                <LogOut size={14} strokeWidth={2.2}/> Se déconnecter
              </button>
            </div>

            {/* ── Colonne droite ── */}
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>

              {/* Toast succès / erreur */}
              {(succes || erreur) && (
                <div style={{ display:'flex', alignItems:'center', gap:9, padding:'12px 15px', borderRadius:13, background:succes?'rgba(16,185,129,0.08)':'rgba(239,68,68,0.07)', border:`1px solid ${succes?'rgba(16,185,129,0.25)':'rgba(239,68,68,0.2)'}`, animation:'slideDown .25s ease' }}>
                  {succes ? <CheckCircle2 size={15} strokeWidth={2.2} color="#10b981"/> : <AlertCircle size={15} strokeWidth={2.2} color="#ef4444"/>}
                  <span style={{ fontSize:12.5, fontWeight:600, color:succes?'#065f46':'#991b1b' }}>{succes || erreur}</span>
                </div>
              )}

              {/* ════ INFOS PERSONNELLES ════ */}
              {sectionActive === 'infos' && (
                <div style={{ background:'rgba(255,255,255,0.78)', borderRadius:'clamp(13px,2vw,18px)', border:'1px solid rgba(190,215,255,0.45)', boxShadow:'0 2px 14px rgba(20,70,160,0.05)', overflow:'hidden' }}>
                  <div style={{ padding:'clamp(11px,2vw,15px) clamp(15px,2.5vw,20px)', borderBottom:'1px solid rgba(190,215,255,0.3)', background:'rgba(255,255,255,0.58)', display:'flex', alignItems:'center', gap:9 }}>
                    <div style={{ width:30, height:30, background:'rgba(190,215,255,0.38)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <User size={14} strokeWidth={2} color="#3a6aaa"/>
                    </div>
                    <div>
                      <h2 style={{ fontSize:'clamp(12px,1.5vw,13px)', fontWeight:800, color:'#0d2a5c', margin:0 }}>Informations personnelles</h2>
                      <p style={{ fontSize:10.5, color:'#5a7aaa', margin:'1px 0 0' }}>Modifiez vos données de profil</p>
                    </div>
                  </div>

                  <div style={{ padding:'clamp(15px,2.5vw,20px)' }}>

                    {/* Nom + Prénom */}
                    <div className="prf-fg">
                      <div>
                        <label style={label}>Nom *</label>
                        <input type="text" value={profil.nom} onChange={e => setProfil(p=>({...p,nom:e.target.value}))}
                          placeholder="Votre nom" style={input} onFocus={focusIn} onBlur={focusOut}/>
                      </div>
                      <div>
                        <label style={label}>Prénom *</label>
                        <input type="text" value={profil.prenom} onChange={e => setProfil(p=>({...p,prenom:e.target.value}))}
                          placeholder="Votre prénom" style={input} onFocus={focusIn} onBlur={focusOut}/>
                      </div>
                    </div>

                    {/* Email lecture seule */}
                    <div style={{ marginBottom:14 }}>
                      <label style={label}>
                        Email <span style={{ fontSize:9, color:'#aab8d0', fontWeight:600 }}>(non modifiable)</span>
                      </label>
                      <div style={{ position:'relative' }}>
                        <Mail size={13} strokeWidth={2} color="#7a9cc5" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
                        <input type="email" value={profil.email} readOnly
                          style={{ ...input, paddingLeft:34, background:'rgba(240,246,255,0.6)', color:'#8aa0c0', cursor:'not-allowed' }}/>
                      </div>
                    </div>

                    {/* ── TÉLÉPHONE avec sélecteur pays + drapeau ── */}
                    <div style={{ marginBottom:14 }}>
                      <label style={label}>Téléphone *</label>
                      <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                        <SelecteurPays pays={pays} onChange={p => { setPays(p); setToucheTel(true) }}/>
                        <div style={{ flex:1 }}>
                          <div style={{
                            display:'flex', alignItems:'center',
                            background: toucheTel && profil.telephone && !validTel.valide ? 'rgba(239,68,68,0.07)' : toucheTel && profil.telephone && validTel.valide ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.72)',
                            border:`1.5px solid ${toucheTel && profil.telephone && !validTel.valide ? 'rgba(239,68,68,0.45)' : toucheTel && profil.telephone && validTel.valide ? 'rgba(16,185,129,0.45)' : 'rgba(190,215,255,0.55)'}`,
                            borderRadius:11, padding:'0 12px', gap:8, transition:'all .2s',
                          }}>
                            <Phone size={13} strokeWidth={2} color={toucheTel && profil.telephone && !validTel.valide ? '#ef4444' : toucheTel && profil.telephone && validTel.valide ? '#10b981' : '#7a9cc5'} style={{ flexShrink:0 }}/>
                            <input
                              type="tel"
                              placeholder={pays.exemple}
                              value={profil.telephone}
                              onChange={e => { setProfil(p=>({...p,telephone:e.target.value.replace(/[^0-9\s\-().]/g,'')})); setToucheTel(true) }}
                              style={{ flex:1, border:'none', outline:'none', padding:'9px 0', fontSize:13, color:'#0d2a5c', background:'transparent', fontFamily:'inherit', minWidth:0 }}
                            />
                            {toucheTel && profil.telephone && validTel.valide  && <Check size={13} strokeWidth={2.5} color="#10b981" style={{ flexShrink:0 }}/>}
                            {toucheTel && profil.telephone && !validTel.valide && <X     size={13} strokeWidth={2.5} color="#ef4444" style={{ flexShrink:0 }}/>}
                          </div>
                          {toucheTel && profil.telephone && !validTel.valide && (
                            <p style={{ fontSize:10.5, color:'#ef4444', fontWeight:600, margin:'4px 0 0 4px' }}>{validTel.message}</p>
                          )}
                          {toucheTel && profil.telephone && validTel.valide && (
                            <p style={{ fontSize:10.5, color:'#10b981', fontWeight:600, margin:'4px 0 0 4px' }}>✓ {pays.indicatif} {profil.telephone}</p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Adresse */}
                    <div style={{ marginBottom:20 }}>
                      <label style={label}>Adresse</label>
                      <div style={{ position:'relative' }}>
                        <MapPin size={13} strokeWidth={2} color="#7a9cc5" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
                        <input type="text" value={profil.adresse} onChange={e => setProfil(p=>({...p,adresse:e.target.value}))}
                          placeholder="Votre adresse" style={{ ...input, paddingLeft:34 }} onFocus={focusIn} onBlur={focusOut}/>
                      </div>
                    </div>

                    {/* Bouton sauvegarder */}
                    <button onClick={sauvegarderProfil} disabled={enregistrement} style={{ display:'flex', alignItems:'center', gap:7, background:enregistrement?'rgba(29,110,245,0.65)':'linear-gradient(135deg,#1d6ef5,#3b82f6)', color:'#fff', border:'none', padding:'10px clamp(16px,2.5vw,22px)', borderRadius:50, fontSize:12.5, fontWeight:700, cursor:enregistrement?'not-allowed':'pointer', fontFamily:'inherit', boxShadow:enregistrement?'none':'0 4px 14px rgba(29,110,245,0.32)', transition:'all .2s' }}>
                      {enregistrement ? <Loader2 size={13} strokeWidth={2.3} style={{ animation:'spin 1s linear infinite' }}/> : <Save size={13} strokeWidth={2.3}/>}
                      {enregistrement ? 'Sauvegarde…' : 'Sauvegarder'}
                    </button>
                  </div>
                </div>
              )}

              {/* ════ MOT DE PASSE ════ */}
              {sectionActive === 'password' && (
                <div style={{ background:'rgba(255,255,255,0.78)', borderRadius:'clamp(13px,2vw,18px)', border:'1px solid rgba(190,215,255,0.45)', boxShadow:'0 2px 14px rgba(20,70,160,0.05)', overflow:'hidden' }}>
                  <div style={{ padding:'clamp(11px,2vw,15px) clamp(15px,2.5vw,20px)', borderBottom:'1px solid rgba(190,215,255,0.3)', background:'rgba(255,255,255,0.58)', display:'flex', alignItems:'center', gap:9 }}>
                    <div style={{ width:30, height:30, background:'rgba(190,215,255,0.38)', borderRadius:9, display:'flex', alignItems:'center', justifyContent:'center' }}>
                      <Shield size={14} strokeWidth={2} color="#3a6aaa"/>
                    </div>
                    <div>
                      <h2 style={{ fontSize:'clamp(12px,1.5vw,13px)', fontWeight:800, color:'#0d2a5c', margin:0 }}>Sécurité du compte</h2>
                      <p style={{ fontSize:10.5, color:'#5a7aaa', margin:'1px 0 0' }}>Modifiez votre mot de passe</p>
                    </div>
                  </div>

                  <div style={{ padding:'clamp(15px,2.5vw,20px)' }}>

                    {/* Mdp actuel */}
                    <div style={{ marginBottom:13 }}>
                      <label style={label}>Mot de passe actuel *</label>
                      <div style={{ position:'relative' }}>
                        <Lock size={13} strokeWidth={2} color="#7a9cc5" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
                        <input type={showActuel?'text':'password'} value={mdp.actuel} onChange={e => setMdp(p=>({...p,actuel:e.target.value}))}
                          placeholder="Votre mot de passe actuel" style={{ ...input, paddingLeft:34, paddingRight:40 }} onFocus={focusIn} onBlur={focusOut}/>
                        <button onClick={() => setShowActuel(v=>!v)} style={{ position:'absolute', right:11, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#7a9cc5', padding:0, display:'flex' }}>
                          {showActuel ? <EyeOff size={14} strokeWidth={2}/> : <Eye size={14} strokeWidth={2}/>}
                        </button>
                      </div>
                    </div>

                    {/* Nouveau mdp */}
                    <div style={{ marginBottom:13 }}>
                      <label style={label}>Nouveau mot de passe *</label>
                      <div style={{ position:'relative' }}>
                        <Lock size={13} strokeWidth={2} color={toucheMdpN && mdp.nouveau && !validMdpN.valide ? '#ef4444' : toucheMdpN && mdp.nouveau && validMdpN.valide ? '#10b981' : '#7a9cc5'} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
                        <input
                          type={showNouveau?'text':'password'} value={mdp.nouveau}
                          onChange={e => { setMdp(p=>({...p,nouveau:e.target.value})); setToucheMdpN(true) }}
                          placeholder="Min. 8 car., 1 majuscule, 1 chiffre"
                          style={{
                            ...input, paddingLeft:34, paddingRight:40,
                            borderColor: toucheMdpN && mdp.nouveau && !validMdpN.valide ? 'rgba(239,68,68,0.45)' : toucheMdpN && mdp.nouveau && validMdpN.valide ? 'rgba(16,185,129,0.45)' : 'rgba(190,215,255,0.55)',
                          }}
                          onFocus={focusIn} onBlur={focusOut}
                        />
                        <button onClick={() => setShowNouveau(v=>!v)} style={{ position:'absolute', right:11, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#7a9cc5', padding:0, display:'flex' }}>
                          {showNouveau ? <EyeOff size={14} strokeWidth={2}/> : <Eye size={14} strokeWidth={2}/>}
                        </button>
                      </div>
                      {toucheMdpN && mdp.nouveau && !validMdpN.valide && (
                        <p style={{ fontSize:10.5, color:'#ef4444', fontWeight:600, margin:'4px 0 0 4px' }}>{validMdpN.erreurs.join(' · ')}</p>
                      )}
                      {/* Barres de force */}
                      {mdp.nouveau.length > 0 && (
                        <>
                          <div style={{ display:'flex', gap:3, margin:'7px 0 3px' }}>
                            {[1,2,3,4].map(n => (
                              <div key={n} style={{ flex:1, height:3, borderRadius:2, background:validMdpN.force>=n?couleurForce:'rgba(190,215,255,0.25)', transition:'background .3s' }}/>
                            ))}
                          </div>
                          <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:couleurForce, fontWeight:700 }}>
                            <span>{libelleForce}</span>
                            <span style={{ display:'flex', gap:7, color:'#7a9cc5', fontWeight:500 }}>
                              <span style={{ color:/[A-Z]/.test(mdp.nouveau)?'#10b981':'rgba(190,215,255,0.4)' }}>A↑</span>
                              <span style={{ color:/[0-9]/.test(mdp.nouveau)?'#10b981':'rgba(190,215,255,0.4)' }}>123</span>
                              <span style={{ color:mdp.nouveau.length>=8?'#10b981':'rgba(190,215,255,0.4)' }}>8+</span>
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Confirmation */}
                    <div style={{ marginBottom:16 }}>
                      <label style={label}>Confirmer *</label>
                      <div style={{ position:'relative' }}>
                        <Lock size={13} strokeWidth={2} color={toucheMdpCf && mdp.confirmation && !mdpIdentique ? '#ef4444' : toucheMdpCf && mdpIdentique ? '#10b981' : '#7a9cc5'} style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }}/>
                        <input
                          type={showConfirm?'text':'password'} value={mdp.confirmation}
                          onChange={e => { setMdp(p=>({...p,confirmation:e.target.value})); setToucheMdpCf(true) }}
                          placeholder="Répétez le mot de passe"
                          style={{
                            ...input, paddingLeft:34, paddingRight:40,
                            borderColor: toucheMdpCf && mdp.confirmation && !mdpIdentique ? 'rgba(239,68,68,0.45)' : toucheMdpCf && mdpIdentique ? 'rgba(16,185,129,0.45)' : 'rgba(190,215,255,0.55)',
                          }}
                          onFocus={focusIn} onBlur={focusOut}
                        />
                        <button onClick={() => setShowConfirm(v=>!v)} style={{ position:'absolute', right:11, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#7a9cc5', padding:0, display:'flex' }}>
                          {showConfirm ? <EyeOff size={14} strokeWidth={2}/> : <Eye size={14} strokeWidth={2}/>}
                        </button>
                      </div>
                      {toucheMdpCf && mdp.confirmation && !mdpIdentique && (
                        <p style={{ fontSize:10.5, color:'#ef4444', fontWeight:600, margin:'4px 0 0 4px' }}>Les mots de passe ne correspondent pas</p>
                      )}
                    </div>

                    {/* Règles */}
                    <div style={{ background:'rgba(190,215,255,0.12)', border:'1px solid rgba(190,215,255,0.3)', borderRadius:11, padding:'11px 13px', marginBottom:18 }}>
                      <p style={{ fontSize:10.5, fontWeight:700, color:'#3a6aaa', margin:'0 0 5px', textTransform:'uppercase', letterSpacing:'0.5px' }}>Règles de sécurité</p>
                      {['Minimum 8 caractères','Au moins une majuscule','Au moins un chiffre'].map((r,i) => (
                        <div key={i} style={{ display:'flex', alignItems:'center', gap:6, marginTop:4 }}>
                          <div style={{ width:5, height:5, borderRadius:'50%', background:'rgba(100,150,220,0.5)', flexShrink:0 }}/>
                          <span style={{ fontSize:11.5, color:'#5a7aaa' }}>{r}</span>
                        </div>
                      ))}
                    </div>

                    {/* Bouton */}
                    <button onClick={changerMotDePasse} disabled={enregistrement} style={{ display:'flex', alignItems:'center', gap:7, background:enregistrement?'rgba(29,110,245,0.65)':'linear-gradient(135deg,#1d6ef5,#3b82f6)', color:'#fff', border:'none', padding:'10px clamp(16px,2.5vw,22px)', borderRadius:50, fontSize:12.5, fontWeight:700, cursor:enregistrement?'not-allowed':'pointer', fontFamily:'inherit', boxShadow:enregistrement?'none':'0 4px 14px rgba(29,110,245,0.32)' }}>
                      {enregistrement ? <Loader2 size={13} strokeWidth={2.3} style={{ animation:'spin 1s linear infinite' }}/> : <Shield size={13} strokeWidth={2.3}/>}
                      {enregistrement ? 'Modification…' : 'Changer le mot de passe'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}