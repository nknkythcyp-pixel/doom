// ============================================
// GESTIONUTILISATEURS.JSX
// ✅ Recherche à côté des onglets
// ✅ Responsive complet (mobile / tablette / desktop)
// ✅ Icônes Lucide uniquement
// ============================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, UserPlus, Power, X, Trash2, AlertTriangle,
  Pencil, Monitor, Wifi, ShieldCheck, Zap, Home, Search,
} from 'lucide-react'
import api from '../../services/api'

const CATEGORIES = [
  { nom:'Informatique', couleur:'#1d4ed8', bg:'rgba(59,130,246,0.08)',  border:'rgba(59,130,246,0.25)',  Icon: Monitor     },
  { nom:'Réseau',       couleur:'#065f46', bg:'rgba(16,185,129,0.08)',  border:'rgba(16,185,129,0.25)',  Icon: Wifi        },
  { nom:'Sécurité',     couleur:'#991b1b', bg:'rgba(239,68,68,0.08)',   border:'rgba(239,68,68,0.25)',   Icon: ShieldCheck },
  { nom:'Électricité',  couleur:'#92400e', bg:'rgba(245,158,11,0.08)',  border:'rgba(245,158,11,0.25)',  Icon: Zap         },
  { nom:'Domotique',    couleur:'#4c1d95', bg:'rgba(139,92,246,0.08)',  border:'rgba(139,92,246,0.25)',  Icon: Home        },
]

export default function GestionUtilisateurs() {
  const navigate = useNavigate()

  const [users,          setUsers]          = useState([])
  const [chargement,     setChargement]     = useState(true)
  const [ongletActif,    setOngletActif]    = useState('tous')

  // ✅ Recherche
  const [recherche,       setRecherche]       = useState('')
  const [rechercheActive, setRechercheActive] = useState(false)

  // ── Modal création ──
  const [modalCreation,  setModalCreation]  = useState(false)
  const [enregistrement, setEnregistrement] = useState(false)
  const [erreurModal,    setErreurModal]    = useState('')
  const [formulaire,     setFormulaire]     = useState({
    nom:'', prenom:'', email:'', telephone:'', motDePasse:'', categories:[],
  })

  // ── Modal édition ──
  const [modalEdition,  setModalEdition]  = useState(false)
  const [techEdite,     setTechEdite]     = useState(null)
  const [formEdition,   setFormEdition]   = useState({ nom:'', prenom:'', email:'', telephone:'', categories:[] })
  const [savingEdit,    setSavingEdit]    = useState(false)
  const [erreurEdition, setErreurEdition] = useState('')

  // ── Modal suppression ──
  const [modalSuppression, setModalSuppression] = useState(false)
  const [userASupprimer,   setUserASupprimer]   = useState(null)
  const [suppression,      setSuppression]      = useState(false)

  const chargerDonnees = async () => {
    try {
      const rep = await api.get('/utilisateurs')
      setUsers(rep.data.utilisateurs)
    } catch (err) {
      console.error('Erreur chargement :', err)
    } finally {
      setChargement(false)
    }
  }
  useEffect(() => { chargerDonnees() }, [])

  // ✅ Filtrage : onglet + recherche texte combinés
  const usersFiltres = users.filter(u => {
    const matchOnglet = ongletActif === 'tous' || u.role === ongletActif
    const q = recherche.toLowerCase().trim()
    if (!q) return matchOnglet
    const nom   = `${u.prenom || ''} ${u.nom || ''}`.toLowerCase()
    const email = (u.email || '').toLowerCase()
    const role  = (u.role  || '').toLowerCase()
    return matchOnglet && (nom.includes(q) || email.includes(q) || role.includes(q))
  })

  const toggleCat = (cats, cat) =>
    cats.includes(cat) ? cats.filter(c => c !== cat) : [...cats, cat]

  // ── Checkboxes catégories ──
  const CategorieCheckboxes = ({ selectedCats, onToggle }) => (
    <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
      {CATEGORIES.map(cat => {
        const checked = selectedCats.includes(cat.nom)
        const CatIcon = cat.Icon
        return (
          <div key={cat.nom} onClick={() => onToggle(cat.nom)}
            style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 11px', borderRadius:9, cursor:'pointer', border:`1.5px solid ${checked ? cat.border : 'transparent'}`, background:checked ? cat.bg : 'transparent', transition:'all .15s' }}>
            <div style={{ width:15, height:15, borderRadius:3, flexShrink:0, border:`1.5px solid ${checked ? cat.couleur : '#c8d8ea'}`, background:checked ? cat.couleur : '#fff', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}>
              {checked && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3l2 2 4-4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
            </div>
            <CatIcon size={15} strokeWidth={2} color={checked ? cat.couleur : '#94a3b8'} />
            <span style={{ fontSize:12.5, fontWeight:checked?700:500, color:checked?cat.couleur:'#3d5a7a', flex:1 }}>{cat.nom}</span>
            {checked && <span style={{ fontSize:9.5, fontWeight:700, padding:'2px 8px', borderRadius:50, background:cat.couleur, color:'#fff' }}>✓</span>}
          </div>
        )
      })}
    </div>
  )

  // ── Badges catégories ──
  const BadgeCategories = ({ categories }) => {
    if (!categories || categories.length === 0)
      return <span style={{ fontSize:11, color:'#c0cfdf' }}>—</span>
    return (
      <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
        {categories.map(cat => {
          const c = CATEGORIES.find(x => x.nom === cat)
          if (!c) return null
          const CatIcon = c.Icon
          return (
            <span key={cat} style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, fontWeight:700, padding:'3px 8px', borderRadius:6, background:c.bg, color:c.couleur, border:`1px solid ${c.border}`, whiteSpace:'nowrap' }}>
              <CatIcon size={10} strokeWidth={2.3} />{cat}
            </span>
          )
        })}
      </div>
    )
  }

  // ── Création ──
  const creerTechnicien = async () => {
    setErreurModal('')
    if (!formulaire.nom || !formulaire.prenom || !formulaire.email || !formulaire.motDePasse) {
      setErreurModal('Tous les champs obligatoires doivent être remplis'); return
    }
    setEnregistrement(true)
    try {
      await api.post('/utilisateurs/technicien', { nom:formulaire.nom, prenom:formulaire.prenom, email:formulaire.email, telephone:formulaire.telephone, motDePasse:formulaire.motDePasse, categories:formulaire.categories })
      await chargerDonnees()
      setModalCreation(false)
      setFormulaire({ nom:'', prenom:'', email:'', telephone:'', motDePasse:'', categories:[] })
    } catch (err) {
      setErreurModal(err.response?.data?.message || 'Erreur lors de la création')
    } finally { setEnregistrement(false) }
  }

  // ── Édition ──
  const ouvrirEdition = async (tech) => {
    setTechEdite(tech); setErreurEdition('')
    try {
      const rep = await api.get(`/utilisateurs/${tech.id}/categories`)
      setFormEdition({ nom:tech.nom||'', prenom:tech.prenom||'', email:tech.email||'', telephone:tech.telephone||'', categories:rep.data.categories||[] })
    } catch {
      setFormEdition({ nom:tech.nom||'', prenom:tech.prenom||'', email:tech.email||'', telephone:tech.telephone||'', categories:[] })
    }
    setModalEdition(true)
  }

  const sauvegarderEdition = async () => {
    setErreurEdition('')
    if (!formEdition.nom || !formEdition.prenom || !formEdition.email) {
      setErreurEdition('Nom, prénom et email sont obligatoires'); return
    }
    setSavingEdit(true)
    try {
      await api.put(`/utilisateurs/${techEdite.id}`, { nom:formEdition.nom, prenom:formEdition.prenom, email:formEdition.email, telephone:formEdition.telephone })
      await api.put(`/utilisateurs/${techEdite.id}/categories`, { categories:formEdition.categories })
      await chargerDonnees()
      setModalEdition(false)
    } catch (err) {
      setErreurEdition(err.response?.data?.message || 'Erreur lors de la modification')
    } finally { setSavingEdit(false) }
  }

  // ── Suppression ──
  const ouvrirModalSuppression = (user) => { setUserASupprimer(user); setModalSuppression(true) }
  const fermerModalSuppression = () => { setModalSuppression(false); setUserASupprimer(null) }
  const supprimerUtilisateur = async () => {
    if (!userASupprimer) return
    setSuppression(true)
    try {
      await api.delete(`/utilisateurs/${userASupprimer.id}`)
      await chargerDonnees()
      fermerModalSuppression()
    } catch (err) { console.error(err) }
    finally { setSuppression(false) }
  }

  const toggleActif = async (id) => {
    try { await api.patch(`/utilisateurs/${id}/toggle`); await chargerDonnees() }
    catch (err) { console.error(err) }
  }

  const inputStyle = {
    width:'100%', padding:'9px 12px', border:'1.5px solid rgba(226,236,248,0.9)', borderRadius:10,
    fontSize:13, outline:'none', fontFamily:'inherit', boxSizing:'border-box',
    background:'rgba(248,251,255,0.8)', color:'#0f3767',
  }

  const onglets = [
    { val:'tous',       label:'Tous',        count: users.length },
    { val:'client',     label:'Clients',     count: users.filter(u=>u.role==='client').length },
    { val:'technicien', label:'Techniciens', count: users.filter(u=>u.role==='technicien').length },
  ]

  const roleConfig = {
    technicien: { label:'Technicien', color:'#2563eb', bg:'rgba(59,130,246,0.1)',  border:'rgba(59,130,246,0.25)' },
    admin:      { label:'Admin',      color:'#059669', bg:'rgba(16,185,129,0.1)',  border:'rgba(16,185,129,0.25)' },
    client:     { label:'Client',     color:'#7c3aed', bg:'rgba(139,92,246,0.1)', border:'rgba(139,92,246,0.25)' },
  }

  if (chargement) return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(145deg,#dce9f8,#c5d9f2,#d4e4f7)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans','Inter',sans-serif" }}>
      <p style={{ fontSize:14, color:'#6b8299', fontWeight:500 }}>Chargement...</p>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(145deg,#dce9f8 0%,#c5d9f2 50%,#d4e4f7 100%)', fontFamily:"'DM Sans','Inter',-apple-system,sans-serif" }}>

      {/* ══ HEADER ══ */}
      <header style={{ background:'rgba(255,255,255,0.45)', backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', borderBottom:'1px solid rgba(255,255,255,0.7)', padding:'0 24px', display:'flex', alignItems:'center', justifyContent:'space-between', height:68, position:'sticky', top:0, zIndex:10, gap:12, flexWrap:'wrap' }}>
        <div style={{ display:'flex', alignItems:'center', gap:18, flexShrink:0 }}>
          <div style={{ fontSize:18, fontWeight:900, color:'#0f3767', letterSpacing:'1px' }}>DOOM<span style={{ color:'#0066ff' }}>.</span></div>
          <button onClick={() => navigate('/admin/dashboard')}
            style={{ display:'flex', alignItems:'center', gap:6, background:'transparent', border:'none', color:'#6b8299', fontSize:12.5, fontWeight:600, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
            <ArrowLeft size={14} /> <span className="back-label">Tableau de bord</span>
          </button>
        </div>
        <div style={{ textAlign:'center', flexShrink:0 }}>
          <h2 style={{ fontSize:15, fontWeight:800, color:'#0f3767', margin:0 }}>Gestion des utilisateurs</h2>
          <p style={{ fontSize:11, color:'#8da2bb', margin:'1px 0 0', fontWeight:500 }}>
            {users.length} utilisateurs · {users.filter(u=>u.role==='technicien').length} techniciens
          </p>
        </div>
        <button onClick={() => { setModalCreation(true); setErreurModal('') }}
          style={{ display:'flex', alignItems:'center', gap:7, background:'#0f2942', color:'#fff', border:'none', padding:'9px 18px', borderRadius:50, fontSize:12.5, fontWeight:800, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 8px 24px rgba(15,41,66,0.25)', flexShrink:0, whiteSpace:'nowrap' }}
          onMouseEnter={e => e.currentTarget.style.background='#0066ff'}
          onMouseLeave={e => e.currentTarget.style.background='#0f2942'}>
          <UserPlus size={14} /> <span className="btn-create">Créer un technicien</span>
        </button>
      </header>

      {/* ══ CORPS ══ */}
      <main style={{ padding:'24px 20px' }}>

        {/* ✅ Barre : onglets + recherche côte à côte */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:20, flexWrap:'wrap' }}>

          {/* Onglets */}
          <div style={{ display:'flex', gap:4, background:'rgba(255,255,255,0.55)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.8)', borderRadius:14, padding:'4px', flexWrap:'wrap' }}>
            {onglets.map(o => {
              const isA = ongletActif === o.val
              return (
                <button key={o.val} onClick={() => { setOngletActif(o.val); setRecherche('') }}
                  style={{ padding:'7px 16px', borderRadius:10, border:'none', fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit', background:isA?'#0f2942':'transparent', color:isA?'#fff':'#6b8299', transition:'all .2s', whiteSpace:'nowrap' }}>
                  {o.label} ({o.count})
                </button>
              )
            })}
          </div>

          {/* ✅ Champ de recherche */}
          <div style={{ position:'relative', flex:'0 0 auto', minWidth:200 }}>
            <Search size={13} strokeWidth={2} color={rechercheActive?'#0066ff':'#8da2bb'}
              style={{ position:'absolute', left:11, top:'50%', transform:'translateY(-50%)', pointerEvents:'none', transition:'color .2s' }} />
            <input
              type="text"
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              onFocus={() => setRechercheActive(true)}
              onBlur={() => setRechercheActive(false)}
              placeholder="Nom, email, rôle…"
              style={{
                width:'100%', padding:'8px 32px 8px 30px', boxSizing:'border-box',
                border:`1.5px solid ${rechercheActive?'#0066ff':'rgba(200,216,234,0.8)'}`,
                borderRadius:50, fontSize:12.5, outline:'none', fontFamily:'inherit',
                background:'rgba(255,255,255,0.75)', color:'#0f3767', transition:'border-color .2s',
              }}
            />
            {recherche && (
              <button onClick={() => setRecherche('')}
                style={{ position:'absolute', right:9, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:2, display:'flex', alignItems:'center' }}>
                <X size={12} strokeWidth={2.5} color="#8da2bb" />
              </button>
            )}
          </div>
        </div>

        {/* Info résultats */}
        {recherche && (
          <p style={{ fontSize:12, color:'#6b8299', fontWeight:600, marginBottom:12 }}>
            <strong style={{ color:'#0066ff' }}>{usersFiltres.length}</strong> résultat{usersFiltres.length>1?'s':''} pour "<strong style={{ color:'#0066ff' }}>{recherche}</strong>"
          </p>
        )}

        {/* ══ TABLEAU — scroll horizontal sur mobile ══ */}
        <div style={{ background:'rgba(255,255,255,0.65)', backdropFilter:'blur(20px)', borderRadius:20, overflow:'hidden', border:'1px solid rgba(255,255,255,0.8)', boxShadow:'0 4px 24px rgba(15,55,103,0.06)' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:700 }}>
              <thead>
                <tr style={{ background:'rgba(248,250,252,0.7)' }}>
                  {['Utilisateur','Email','Téléphone','Rôle','Catégories','Inscrit le','Statut','Actions'].map((col,i) => (
                    <th key={i} style={{ padding:'12px 18px', textAlign:'left', fontSize:10, fontWeight:700, color:'#8da2bb', textTransform:'uppercase', letterSpacing:'0.6px', borderBottom:'1px solid rgba(226,236,248,0.8)', whiteSpace:'nowrap' }}>{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {usersFiltres.length === 0 && (
                  <tr><td colSpan={8} style={{ padding:40, textAlign:'center' }}>
                    {recherche
                      ? <><Search size={28} strokeWidth={1.5} color="#8da2bb" style={{ marginBottom:10 }} /><p style={{ fontSize:13, color:'#8da2bb', margin:0 }}>Aucun résultat pour "<strong>{recherche}</strong>"</p></>
                      : <p style={{ fontSize:13, color:'#8da2bb', margin:0 }}>Aucun utilisateur</p>
                    }
                  </td></tr>
                )}
                {usersFiltres.map((user, i) => {
                  const initials = (user.prenom?.charAt(0)||'') + (user.nom?.charAt(0)||'')
                  const cfg = roleConfig[user.role] || roleConfig.client
                  return (
                    <tr key={user.id}
                      style={{ borderBottom:i<usersFiltres.length-1?'1px solid rgba(226,236,248,0.6)':'none', transition:'background .15s' }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(0,102,255,0.02)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <td style={{ padding:'13px 18px' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#0066ff,#60a5fa)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#fff', flexShrink:0 }}>{initials}</div>
                          <span style={{ fontSize:13, fontWeight:700, color:'#0f3767', whiteSpace:'nowrap' }}>{user.prenom} {user.nom}</span>
                        </div>
                      </td>
                      <td style={{ padding:'13px 18px', fontSize:12.5, color:'#64748b', maxWidth:180, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{user.email}</td>
                      <td style={{ padding:'13px 18px', fontSize:12, color:'#94a3b8', whiteSpace:'nowrap' }}>{user.telephone||'—'}</td>
                      <td style={{ padding:'13px 18px' }}>
                        <span style={{ fontSize:11, fontWeight:700, padding:'3px 11px', borderRadius:50, background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`, whiteSpace:'nowrap' }}>{cfg.label}</span>
                      </td>
                      <td style={{ padding:'13px 18px', maxWidth:200 }}>
                        {user.role==='technicien' ? <BadgeCategories categories={user.categories} /> : <span style={{ fontSize:11, color:'#c0cfdf' }}>—</span>}
                      </td>
                      <td style={{ padding:'13px 18px', fontSize:12, color:'#94a3b8', whiteSpace:'nowrap' }}>{new Date(user.date_inscription).toLocaleDateString('fr-FR')}</td>
                      <td style={{ padding:'13px 18px' }}>
                        <span style={{ fontSize:11, fontWeight:700, padding:'3px 11px', borderRadius:50, background:user.actif?'rgba(16,185,129,0.12)':'rgba(148,163,184,0.12)', color:user.actif?'#059669':'#94a3b8', border:`1px solid ${user.actif?'rgba(16,185,129,0.3)':'rgba(148,163,184,0.3)'}`, whiteSpace:'nowrap' }}>
                          {user.actif?'Actif':'Inactif'}
                        </span>
                      </td>
                      <td style={{ padding:'13px 18px' }}>
                        <div style={{ display:'flex', gap:5, flexWrap:'wrap' }}>
                          {user.role==='technicien' && (
                            <button onClick={() => ouvrirEdition(user)}
                              style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(0,102,255,0.07)', color:'#0066ff', border:'1px solid rgba(0,102,255,0.2)', padding:'4px 10px', borderRadius:7, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
                              <Pencil size={10} />Modifier
                            </button>
                          )}
                          {user.role!=='admin' && (
                            <>
                              <button onClick={() => toggleActif(user.id)}
                                style={{ display:'flex', alignItems:'center', gap:4, background:user.actif?'rgba(251,146,60,0.1)':'rgba(16,185,129,0.1)', color:user.actif?'#c2410c':'#059669', border:`1px solid ${user.actif?'rgba(251,146,60,0.25)':'rgba(16,185,129,0.25)'}`, padding:'4px 10px', borderRadius:7, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
                                <Power size={10} />{user.actif?'Désactiver':'Activer'}
                              </button>
                              <button onClick={() => ouvrirModalSuppression(user)}
                                style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(239,68,68,0.08)', color:'#dc2626', border:'1px solid rgba(239,68,68,0.22)', padding:'4px 10px', borderRadius:7, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
                                <Trash2 size={10} />Supprimer
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* ══ MODAL CRÉER ══ */}
      {modalCreation && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.4)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16 }}
          onClick={e => { if (e.target===e.currentTarget) { setModalCreation(false); setErreurModal('') } }}>
          <div style={{ background:'rgba(255,255,255,0.97)', borderRadius:20, padding:'26px 28px', maxWidth:450, width:'100%', border:'1px solid rgba(226,236,248,0.9)', boxShadow:'0 24px 64px rgba(15,55,103,0.12)', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
              <div>
                <h3 style={{ fontSize:15, fontWeight:800, color:'#0f3767', margin:0 }}>Créer un technicien</h3>
                <p style={{ fontSize:11.5, color:'#8da2bb', margin:'2px 0 0' }}>Remplissez les infos et les domaines de compétence</p>
              </div>
              <button onClick={() => { setModalCreation(false); setErreurModal('') }}
                style={{ background:'rgba(0,0,0,0.05)', border:'none', borderRadius:'50%', width:28, height:28, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <X size={13} color="#64748b" />
              </button>
            </div>
            {erreurModal && <div style={{ background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, padding:'9px 13px', fontSize:12, color:'#dc2626', fontWeight:600, marginBottom:12 }}>⚠️ {erreurModal}</div>}
            <div style={{ background:'rgba(248,251,255,0.6)', border:'1px solid rgba(226,236,248,0.7)', borderRadius:12, padding:'13px 15px', marginBottom:11 }}>
              <p style={{ fontSize:10, fontWeight:700, color:'#a8b9cc', textTransform:'uppercase', letterSpacing:'0.6px', margin:'0 0 11px' }}>Informations personnelles</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9, marginBottom:9 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:'#6b8299', display:'block', marginBottom:4 }}>Nom *</label>
                  <input type="text" placeholder="Nom" value={formulaire.nom} onChange={e => setFormulaire({...formulaire, nom:e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:'#6b8299', display:'block', marginBottom:4 }}>Prénom *</label>
                  <input type="text" placeholder="Prénom" value={formulaire.prenom} onChange={e => setFormulaire({...formulaire, prenom:e.target.value})} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom:9 }}>
                <label style={{ fontSize:11, fontWeight:700, color:'#6b8299', display:'block', marginBottom:4 }}>Email *</label>
                <input type="email" placeholder="technicien@doom.cm" value={formulaire.email} onChange={e => setFormulaire({...formulaire, email:e.target.value})} style={inputStyle} />
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:'#6b8299', display:'block', marginBottom:4 }}>Téléphone</label>
                  <input type="tel" placeholder="+237…" value={formulaire.telephone} onChange={e => setFormulaire({...formulaire, telephone:e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:'#6b8299', display:'block', marginBottom:4 }}>Mot de passe *</label>
                  <input type="password" placeholder="Min. 8 caractères" value={formulaire.motDePasse} onChange={e => setFormulaire({...formulaire, motDePasse:e.target.value})} style={inputStyle} />
                </div>
              </div>
            </div>
            <div style={{ background:'rgba(248,251,255,0.6)', border:'1px solid rgba(226,236,248,0.7)', borderRadius:12, padding:'13px 15px', marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:9 }}>
                <p style={{ fontSize:10, fontWeight:700, color:'#a8b9cc', textTransform:'uppercase', letterSpacing:'0.6px', margin:0 }}>Domaines de compétence</p>
                <span style={{ fontSize:10, color:formulaire.categories.length>0?'#0066ff':'#a8b9cc', fontWeight:600 }}>
                  {formulaire.categories.length>0?`${formulaire.categories.length} sélectionné${formulaire.categories.length>1?'s':''}` : 'Aucun'}
                </span>
              </div>
              <CategorieCheckboxes selectedCats={formulaire.categories} onToggle={cat => setFormulaire(prev => ({...prev, categories:toggleCat(prev.categories, cat)}))} />
            </div>
            <div style={{ display:'flex', gap:9 }}>
              <button onClick={() => { setModalCreation(false); setErreurModal('') }} style={{ flex:1, background:'rgba(241,245,249,0.9)', color:'#64748b', border:'none', padding:10, borderRadius:10, fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Annuler</button>
              <button onClick={creerTechnicien} disabled={enregistrement}
                style={{ flex:2, background:enregistrement?'#e2e8f0':'#0f2942', color:enregistrement?'#94a3b8':'#fff', border:'none', padding:10, borderRadius:10, fontSize:12.5, fontWeight:800, cursor:enregistrement?'not-allowed':'pointer', fontFamily:'inherit' }}
                onMouseEnter={e => { if (!enregistrement) e.currentTarget.style.background='#0066ff' }}
                onMouseLeave={e => { if (!enregistrement) e.currentTarget.style.background='#0f2942' }}>
                {enregistrement?'Création...':'Créer le technicien'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL ÉDITION ══ */}
      {modalEdition && techEdite && (
        <div style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.4)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:16 }}
          onClick={e => { if (e.target===e.currentTarget) setModalEdition(false) }}>
          <div style={{ background:'rgba(255,255,255,0.97)', borderRadius:20, padding:'26px 28px', maxWidth:450, width:'100%', border:'1px solid rgba(226,236,248,0.9)', boxShadow:'0 24px 64px rgba(15,55,103,0.12)', maxHeight:'90vh', overflowY:'auto' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:18 }}>
              <div>
                <h3 style={{ fontSize:15, fontWeight:800, color:'#0f3767', margin:0 }}>Modifier le technicien</h3>
                <p style={{ fontSize:11.5, color:'#8da2bb', margin:'2px 0 0' }}>{techEdite.prenom} {techEdite.nom}</p>
              </div>
              <button onClick={() => setModalEdition(false)} style={{ background:'rgba(0,0,0,0.05)', border:'none', borderRadius:'50%', width:28, height:28, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <X size={13} color="#64748b" />
              </button>
            </div>
            {erreurEdition && <div style={{ background:'rgba(239,68,68,0.07)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:10, padding:'9px 13px', fontSize:12, color:'#dc2626', fontWeight:600, marginBottom:12 }}>⚠️ {erreurEdition}</div>}
            <div style={{ background:'rgba(248,251,255,0.6)', border:'1px solid rgba(226,236,248,0.7)', borderRadius:12, padding:'13px 15px', marginBottom:11 }}>
              <p style={{ fontSize:10, fontWeight:700, color:'#a8b9cc', textTransform:'uppercase', letterSpacing:'0.6px', margin:'0 0 11px' }}>Informations personnelles</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:9, marginBottom:9 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:'#6b8299', display:'block', marginBottom:4 }}>Nom *</label>
                  <input type="text" value={formEdition.nom} onChange={e => setFormEdition({...formEdition, nom:e.target.value})} style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:700, color:'#6b8299', display:'block', marginBottom:4 }}>Prénom *</label>
                  <input type="text" value={formEdition.prenom} onChange={e => setFormEdition({...formEdition, prenom:e.target.value})} style={inputStyle} />
                </div>
              </div>
              <div style={{ marginBottom:9 }}>
                <label style={{ fontSize:11, fontWeight:700, color:'#6b8299', display:'block', marginBottom:4 }}>Email *</label>
                <input type="email" value={formEdition.email} onChange={e => setFormEdition({...formEdition, email:e.target.value})} style={inputStyle} />
              </div>
              <div>
                <label style={{ fontSize:11, fontWeight:700, color:'#6b8299', display:'block', marginBottom:4 }}>Téléphone</label>
                <input type="tel" value={formEdition.telephone} onChange={e => setFormEdition({...formEdition, telephone:e.target.value})} style={inputStyle} />
              </div>
            </div>
            <div style={{ background:'rgba(248,251,255,0.6)', border:'1px solid rgba(226,236,248,0.7)', borderRadius:12, padding:'13px 15px', marginBottom:20 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:9 }}>
                <p style={{ fontSize:10, fontWeight:700, color:'#a8b9cc', textTransform:'uppercase', letterSpacing:'0.6px', margin:0 }}>Domaines de compétence</p>
                <span style={{ fontSize:10, color:formEdition.categories.length>0?'#0066ff':'#a8b9cc', fontWeight:600 }}>
                  {formEdition.categories.length>0?`${formEdition.categories.length} sélectionné${formEdition.categories.length>1?'s':''}` : 'Aucun'}
                </span>
              </div>
              <CategorieCheckboxes selectedCats={formEdition.categories} onToggle={cat => setFormEdition(prev => ({...prev, categories:toggleCat(prev.categories, cat)}))} />
            </div>
            <div style={{ display:'flex', gap:9 }}>
              <button onClick={() => setModalEdition(false)} style={{ flex:1, background:'rgba(241,245,249,0.9)', color:'#64748b', border:'none', padding:10, borderRadius:10, fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Annuler</button>
              <button onClick={sauvegarderEdition} disabled={savingEdit}
                style={{ flex:2, background:savingEdit?'#e2e8f0':'#0f2942', color:savingEdit?'#94a3b8':'#fff', border:'none', padding:10, borderRadius:10, fontSize:12.5, fontWeight:800, cursor:savingEdit?'not-allowed':'pointer', fontFamily:'inherit' }}
                onMouseEnter={e => { if (!savingEdit) e.currentTarget.style.background='#0066ff' }}
                onMouseLeave={e => { if (!savingEdit) e.currentTarget.style.background='#0f2942' }}>
                {savingEdit?'Sauvegarde...':'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL SUPPRESSION ══ */}
      {modalSuppression && userASupprimer && (
        <div style={{ position:'fixed', inset:0, background:'rgba(10,20,50,0.35)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:200, padding:16 }}
          onClick={e => { if (e.target===e.currentTarget) fermerModalSuppression() }}>
          <div style={{ background:'rgba(240,247,255,0.95)', borderRadius:20, border:'1px solid rgba(255,255,255,0.92)', boxShadow:'0 20px 48px rgba(15,55,103,0.14)', padding:'26px 22px 20px', maxWidth:320, width:'100%', textAlign:'center' }}>
            <div style={{ width:46, height:46, borderRadius:'50%', background:'rgba(220,38,38,0.08)', border:'1px solid rgba(220,38,38,0.18)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 14px' }}>
              <AlertTriangle size={19} strokeWidth={1.8} color="#dc2626" />
            </div>
            <h3 style={{ fontSize:14, fontWeight:800, color:'#0f2a5c', margin:'0 0 6px' }}>Supprimer cet utilisateur ?</h3>
            <p style={{ fontSize:12, color:'#5a7aaa', margin:'0 0 18px' }}>
              <strong>{userASupprimer.prenom} {userASupprimer.nom}</strong> sera supprimé définitivement.
            </p>
            <div style={{ display:'flex', gap:8, justifyContent:'center' }}>
              <button onClick={fermerModalSuppression} style={{ padding:'7px 18px', borderRadius:50, background:'rgba(255,255,255,0.7)', border:'1px solid rgba(190,215,255,0.6)', color:'#5a7aaa', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>Annuler</button>
              <button onClick={supprimerUtilisateur} disabled={suppression}
                style={{ display:'flex', alignItems:'center', gap:5, padding:'7px 18px', borderRadius:50, background:suppression?'rgba(190,215,255,0.3)':'#dc2626', border:'none', color:suppression?'#7a9cc5':'#fff', fontSize:12, fontWeight:700, cursor:suppression?'not-allowed':'pointer', fontFamily:'inherit' }}>
                <Trash2 size={11} />{suppression?'Suppression...':'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 600px) {
          .back-label { display: none !important; }
          .btn-create span { display: none !important; }
        }
      `}</style>
    </div>
  )
}