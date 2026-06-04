// ============================================
// GESTIONDEMANDES.JSX
// ✅ Panneau latéral "Notes techniques" du technicien
// ✅ Notification admin quand notes sauvegardées (via backend)
// ✅ Recherche, pagination, filtres statut
// ✅ Responsive mobile / tablette / desktop
// ============================================

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import NotificationsBadge from '../../composants/NotificationsBadge'
import {
  ArrowLeft, Clock, CheckCircle2, AlertTriangle,
  Layers, UserCheck, Play, X, Loader2, PackageOpen, Tag,
  Monitor, Wifi, ShieldCheck, Zap, Home,
  Search, ChevronLeft, ChevronRight,
  CheckCheck, AlertCircle, FileText, Info,
  Calendar, Phone, MapPin, StickyNote,
} from 'lucide-react'

// ── Statuts ──
const configStatuts = {
  en_attente: { label:'En attente', couleur:'#92400e', fond:'#fef3c7', bordure:'#fde68a', dot:'#f59e0b' },
  assigne:    { label:'Assigné',    couleur:'#1d4ed8', fond:'#dbeafe', bordure:'#bfdbfe', dot:'#3b82f6' },
  en_cours:   { label:'En cours',   couleur:'#1e40af', fond:'#dbeafe', bordure:'#bfdbfe', dot:'#3b82f6' },
  termine:    { label:'Terminé',    couleur:'#065f46', fond:'#d1fae5', bordure:'#a7f3d0', dot:'#10b981' },
}

const catConfig = {
  Informatique: { bg:'#eff6ff',  text:'#1d4ed8', border:'#bfdbfe', Icon: Monitor     },
  Réseau:       { bg:'#ecfdf5',  text:'#065f46', border:'#a7f3d0', Icon: Wifi        },
  Sécurité:     { bg:'#fef2f2',  text:'#991b1b', border:'#fecaca', Icon: ShieldCheck },
  Électricité:  { bg:'#fffbeb',  text:'#92400e', border:'#fde68a', Icon: Zap         },
  Domotique:    { bg:'#f5f3ff',  text:'#4c1d95', border:'#ddd6fe', Icon: Home        },
}
const defaultCat = { bg:'rgba(100,116,139,0.1)', text:'#475569', border:'rgba(100,116,139,0.25)', Icon: Tag }

const PAR_PAGE = 10

// ════════════════════════════════
// TOAST
// ════════════════════════════════
function Toast({ toasts }) {
  return (
    <div style={{ position:'fixed', bottom:24, right:24, display:'flex', flexDirection:'column', gap:10, zIndex:9999, pointerEvents:'none' }}>
      {toasts.map(toast => {
        const couleurs = {
          succes: { bg:'rgba(240,253,248,0.97)', border:'rgba(16,185,129,0.35)', icone:'#10b981', texte:'#065f46', barre:'#10b981' },
          erreur: { bg:'rgba(254,242,242,0.97)', border:'rgba(239,68,68,0.35)',  icone:'#ef4444', texte:'#991b1b', barre:'#ef4444' },
          info:   { bg:'rgba(239,246,255,0.97)', border:'rgba(29,110,245,0.35)', icone:'#1d6ef5', texte:'#1e40af', barre:'#1d6ef5' },
        }
        const c = couleurs[toast.type] || couleurs.info
        return (
          <div key={toast.id} style={{
            display:'flex', alignItems:'flex-start', gap:12,
            background:c.bg, backdropFilter:'blur(20px)',
            border:`1px solid ${c.border}`, borderLeft:`3px solid ${c.barre}`,
            borderRadius:14, padding:'13px 14px',
            boxShadow:'0 8px 32px rgba(20,70,160,0.12)',
            animation:'apparaitre 0.3s cubic-bezier(0.34,1.56,0.64,1)',
            minWidth:260, maxWidth:320, pointerEvents:'auto',
            fontFamily:"'DM Sans','Inter',sans-serif",
          }}>
            <div style={{ width:28, height:28, borderRadius:8, flexShrink:0, background:toast.type==='succes'?'rgba(16,185,129,0.12)':toast.type==='erreur'?'rgba(239,68,68,0.12)':'rgba(29,110,245,0.12)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              {toast.type==='succes' && <CheckCheck  size={14} strokeWidth={2.5} color={c.icone} />}
              {toast.type==='erreur' && <AlertCircle size={14} strokeWidth={2.5} color={c.icone} />}
              {toast.type==='info'   && <Info        size={14} strokeWidth={2.5} color={c.icone} />}
            </div>
            <div style={{ fontSize:12.5, fontWeight:700, color:c.texte, lineHeight:'1.45', flex:1 }}>{toast.message}</div>
          </div>
        )
      })}
    </div>
  )
}

// ════════════════════════════════
// PANNEAU LATÉRAL — DÉTAIL DEMANDE + NOTES
// ════════════════════════════════
function PanneauDetail({ demande, onFermer }) {
  const [detailComplet, setDetailComplet] = useState(null)
  const [chargement, setChargement] = useState(true)

  useEffect(() => {
    if (!demande) return
    setChargement(true)
    api.get(`/demandes/${demande.id}`)
      .then(r => setDetailComplet(r.data.demande))
      .catch(() => setDetailComplet(demande))
      .finally(() => setChargement(false))
  }, [demande?.id])

  if (!demande) return null

  const config  = configStatuts[demande.statut] || configStatuts.en_attente
  const cc      = catConfig[demande.service_categorie] || defaultCat
  const CatIcon = cc.Icon
  const notes   = detailComplet?.notes_techniques

  const dateAffichee = new Date(demande.date_creation).toLocaleDateString('fr-FR', {
    day:'numeric', month:'long', year:'numeric'
  })

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onFermer}
        style={{
          position:'fixed', inset:0,
          background:'rgba(13,42,92,0.32)',
          backdropFilter:'blur(6px)',
          WebkitBackdropFilter:'blur(6px)',
          zIndex:300,
          animation:'fadeIn 0.2s ease',
        }}
      />

      {/* Panneau */}
      <div style={{
        position:'fixed', top:0, right:0, bottom:0,
        width:'min(480px, 100vw)',
        background:'rgba(235,245,255,0.98)',
        backdropFilter:'blur(28px)',
        WebkitBackdropFilter:'blur(28px)',
        borderLeft:'1px solid rgba(190,215,255,0.55)',
        boxShadow:'-12px 0 48px rgba(13,42,92,0.14)',
        zIndex:301,
        display:'flex', flexDirection:'column',
        animation:'glisserDroite 0.3s cubic-bezier(0.34,1.2,0.64,1)',
        fontFamily:"'DM Sans','Inter',sans-serif",
        overflowY:'auto',
      }}>

        {/* Header panneau */}
        <div style={{
          padding:'18px 20px',
          borderBottom:'1px solid rgba(190,215,255,0.4)',
          background:'rgba(255,255,255,0.65)',
          position:'sticky', top:0, zIndex:10,
          display:'flex', alignItems:'center', justifyContent:'space-between', gap:12,
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:36, height:36, borderRadius:10, background:`${cc.bg}`, border:`1.5px solid ${cc.border}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
              <CatIcon size={16} strokeWidth={2} color={cc.text} />
            </div>
            <div>
              <div style={{ fontSize:14, fontWeight:800, color:'#0d2a5c' }}>Demande #{demande.id}</div>
              <div style={{ fontSize:11, color:'#7a9cc5', fontWeight:600 }}>{demande.service_nom}</div>
            </div>
          </div>
          <button onClick={onFermer}
            style={{ width:32, height:32, borderRadius:'50%', background:'rgba(190,215,255,0.3)', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
            onMouseEnter={e => e.currentTarget.style.background='rgba(239,68,68,0.1)'}
            onMouseLeave={e => e.currentTarget.style.background='rgba(190,215,255,0.3)'}>
            <X size={14} strokeWidth={2.5} color="#5a7aaa" />
          </button>
        </div>

        {/* Corps panneau */}
        <div style={{ padding:'20px', display:'flex', flexDirection:'column', gap:16, flex:1 }}>

          {/* Statut */}
          <span style={{ alignSelf:'flex-start', fontSize:11, fontWeight:700, padding:'5px 13px', borderRadius:50, background:config.fond, color:config.couleur, border:`1px solid ${config.bordure}`, display:'inline-flex', alignItems:'center', gap:6 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:config.dot }} />
            {config.label}
          </span>

          {/* Infos client */}
          <div style={{ background:'rgba(255,255,255,0.78)', borderRadius:16, overflow:'hidden', border:'1px solid rgba(190,215,255,0.45)', boxShadow:'0 2px 10px rgba(20,70,160,0.04)' }}>
            <div style={{ padding:'11px 16px', borderBottom:'1px solid rgba(190,215,255,0.3)', background:'rgba(255,255,255,0.55)', display:'flex', alignItems:'center', gap:8 }}>
              <Info size={13} strokeWidth={2} color="#3a6aaa" />
              <span style={{ fontSize:12, fontWeight:800, color:'#0d2a5c' }}>Informations</span>
            </div>

            {[
              { icone:UserCheck, label:'Client',    val:`${demande.client_prenom} ${demande.client_nom}` },
              { icone:Phone,     label:'Téléphone', val:demande.client_telephone || '—' },
              { icone:CatIcon,   label:'Service',   val:demande.service_nom },
              { icone:MapPin,    label:'Lieu',      val:demande.lieu === 'boutique' ? 'En boutique' : demande.adresse || 'À domicile' },
              { icone:Calendar,  label:'Date',      val:dateAffichee },
              { icone:AlertCircle, label:'Urgence', val:demande.urgence?.charAt(0).toUpperCase() + demande.urgence?.slice(1) },
            ].map((row, i, arr) => {
              const Icn = row.icone
              return (
                <div key={i} style={{ display:'grid', gridTemplateColumns:'110px 1fr', gap:8, padding:'10px 16px', borderBottom:i < arr.length-1 ? '1px solid rgba(190,215,255,0.18)' : 'none', alignItems:'start' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <Icn size={11} strokeWidth={2} color="#7a9cc5" />
                    <span style={{ fontSize:10, fontWeight:700, color:'#7a9cc5', textTransform:'uppercase', letterSpacing:'0.4px' }}>{row.label}</span>
                  </div>
                  <span style={{ fontSize:12.5, color:'#0d2a5c', fontWeight:600, lineHeight:'1.5', wordBreak:'break-word' }}>{row.val}</span>
                </div>
              )
            })}
          </div>

          {/* Description */}
          {demande.description && (
            <div style={{ background:'rgba(255,255,255,0.78)', borderRadius:16, overflow:'hidden', border:'1px solid rgba(190,215,255,0.45)' }}>
              <div style={{ padding:'11px 16px', borderBottom:'1px solid rgba(190,215,255,0.3)', background:'rgba(255,255,255,0.55)', display:'flex', alignItems:'center', gap:8 }}>
                <FileText size={13} strokeWidth={2} color="#3a6aaa" />
                <span style={{ fontSize:12, fontWeight:800, color:'#0d2a5c' }}>Description</span>
              </div>
              <div style={{ padding:'14px 16px', fontSize:12.5, color:'#0d2a5c', lineHeight:'1.65' }}>{demande.description}</div>
            </div>
          )}

          {/* Technicien assigné */}
          {demande.technicien_nom && (
            <div style={{ display:'flex', alignItems:'center', gap:12, background:'rgba(16,185,129,0.07)', border:'1px solid rgba(16,185,129,0.22)', borderRadius:14, padding:'12px 16px' }}>
              <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#10b981,#34d399)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#fff', flexShrink:0 }}>
                {demande.technicien_prenom?.charAt(0)}
              </div>
              <div>
                <div style={{ fontSize:11, fontWeight:700, color:'#065f46', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:2 }}>Technicien assigné</div>
                <div style={{ fontSize:13, fontWeight:700, color:'#0d2a5c' }}>{demande.technicien_prenom} {demande.technicien_nom}</div>
              </div>
            </div>
          )}

          {/* ✅ NOTES TECHNIQUES */}
          <div style={{ background:'rgba(255,255,255,0.78)', borderRadius:16, overflow:'hidden', border: notes ? '1.5px solid rgba(29,110,245,0.3)' : '1px solid rgba(190,215,255,0.45)', boxShadow: notes ? '0 4px 16px rgba(29,110,245,0.08)' : '0 2px 10px rgba(20,70,160,0.04)' }}>
            <div style={{ padding:'11px 16px', borderBottom:'1px solid rgba(190,215,255,0.3)', background: notes ? 'rgba(29,110,245,0.06)' : 'rgba(255,255,255,0.55)', display:'flex', alignItems:'center', gap:8 }}>
              <StickyNote size={13} strokeWidth={2} color={ notes ? '#1d6ef5' : '#3a6aaa'} />
              <span style={{ fontSize:12, fontWeight:800, color:'#0d2a5c' }}>Notes techniques</span>
              {notes && (
                <span style={{ marginLeft:'auto', fontSize:9.5, fontWeight:700, padding:'2px 8px', borderRadius:50, background:'rgba(29,110,245,0.1)', color:'#1d6ef5', border:'1px solid rgba(29,110,245,0.2)' }}>
                  Renseignées
                </span>
              )}
            </div>

            <div style={{ padding:'14px 16px' }}>
              {chargement ? (
                <div style={{ display:'flex', alignItems:'center', gap:8, color:'#7a9cc5', fontSize:12 }}>
                  <Loader2 size={14} strokeWidth={2} style={{ animation:'spin 1s linear infinite' }} />
                  Chargement...
                </div>
              ) : notes ? (
                <div style={{ fontSize:13, color:'#0d2a5c', lineHeight:'1.7', background:'rgba(29,110,245,0.04)', border:'1px solid rgba(29,110,245,0.12)', borderRadius:10, padding:'12px 14px', whiteSpace:'pre-wrap', wordBreak:'break-word' }}>
                  {notes}
                </div>
              ) : (
                <div style={{ textAlign:'center', padding:'20px 0' }}>
                  <StickyNote size={28} strokeWidth={1.4} color="#c4d4e8" style={{ marginBottom:8 }} />
                  <p style={{ fontSize:12, color:'#a0b4cc', fontWeight:600, margin:0 }}>
                    Aucune note renseignée par le technicien
                  </p>
                  {demande.statut === 'en_attente' && (
                    <p style={{ fontSize:11, color:'#b8cce0', margin:'4px 0 0' }}>L'intervention n'a pas encore démarré</p>
                  )}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}

// ════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════
export default function GestionDemandes() {
  const navigate = useNavigate()

  const [demandes,            setDemandes]            = useState([])
  const [techniciens,         setTechniciens]         = useState([])
  const [chargement,          setChargement]          = useState(true)
  const [filtreStatut,        setFiltreStatut]        = useState('tous')
  const [recherche,           setRecherche]           = useState('')
  const [page,                setPage]                = useState(1)
  const [demandeSelectionnee, setDemandeSelectionnee] = useState(null)
  const [panneauDemande,      setPanneauDemande]      = useState(null)
  const [hoveredRow,          setHoveredRow]          = useState(null)
  const [actionEnCours,       setActionEnCours]       = useState(null)
  const [toasts,              setToasts]              = useState([])

  const afficherToast = useCallback((message, type = 'succes') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000)
  }, [])

  const chargerDonnees = async () => {
    try {
      const [repD, repT] = await Promise.all([
        api.get('/demandes'),
        api.get('/utilisateurs/techniciens'),
      ])
      setDemandes(repD.data.demandes)
      setTechniciens(repT.data.techniciens)
    } catch (err) {
      console.error(err)
      afficherToast('Erreur lors du chargement des données', 'erreur')
    } finally {
      setChargement(false)
    }
  }

  useEffect(() => { chargerDonnees() }, [])
  useEffect(() => { setPage(1) }, [filtreStatut, recherche])

  const demandesFiltrees = demandes.filter(d => {
    const matchStatut = filtreStatut === 'tous' || d.statut === filtreStatut
    const q = recherche.toLowerCase().trim()
    if (!q) return matchStatut
    const nomClient  = `${d.client_prenom || ''} ${d.client_nom || ''}`.toLowerCase()
    const nomService = (d.service_nom || '').toLowerCase()
    const statut     = (configStatuts[d.statut]?.label || '').toLowerCase()
    const categorie  = (d.service_categorie || '').toLowerCase()
    return matchStatut && (nomClient.includes(q) || nomService.includes(q) || statut.includes(q) || categorie.includes(q))
  })

  const totalPages   = Math.max(1, Math.ceil(demandesFiltrees.length / PAR_PAGE))
  const demandesPage = demandesFiltrees.slice((page - 1) * PAR_PAGE, page * PAR_PAGE)

  const assignerTechnicien = async (demandeId, technicienId, nomTech) => {
    setActionEnCours(demandeId)
    try {
      await api.put(`/demandes/${demandeId}/assigner`, { technicienId })
      await chargerDonnees()
      setDemandeSelectionnee(null)
      afficherToast(`Technicien ${nomTech} assigné avec succès`, 'succes')
    } catch (err) {
      console.error(err)
      afficherToast("Erreur lors de l'assignation", 'erreur')
    } finally {
      setActionEnCours(null)
    }
  }

  const changerStatut = async (demandeId, statut) => {
    setActionEnCours(demandeId)
    try {
      await api.put(`/demandes/${demandeId}/statut`, { statut })
      await chargerDonnees()
      const labels = { en_cours:'Intervention démarrée', termine:'Intervention clôturée avec succès' }
      afficherToast(labels[statut] || 'Statut mis à jour', 'succes')
    } catch (err) {
      console.error(err)
      afficherToast('Erreur lors du changement de statut', 'erreur')
    } finally {
      setActionEnCours(null)
    }
  }

  const getTechniciensPourDemande = (demandeId) => {
    const demande = demandes.find(d => d.id === demandeId)
    if (!demande) return { specialises: [], generalistes: [] }
    const categorieDemande = demande.service_categorie
    const actifs = techniciens.filter(t => t.actif)
    return {
      specialises:  actifs.filter(t => Array.isArray(t.categories) && t.categories.includes(categorieDemande)),
      generalistes: actifs.filter(t => !Array.isArray(t.categories) || t.categories.length === 0),
    }
  }

  const filtres = [
    { val:'tous',       label:'Toutes',     icone:Layers,        count:demandes.length },
    { val:'en_attente', label:'En attente', icone:Clock,         count:demandes.filter(d=>d.statut==='en_attente').length },
    { val:'assigne',    label:'Assignées',  icone:UserCheck,     count:demandes.filter(d=>d.statut==='assigne').length },
    { val:'en_cours',   label:'En cours',   icone:AlertTriangle, count:demandes.filter(d=>d.statut==='en_cours').length },
    { val:'termine',    label:'Terminées',  icone:CheckCircle2,  count:demandes.filter(d=>d.statut==='termine').length },
  ]

  if (chargement) return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(145deg,#b8d4f0,#cfe3f8,#dceeff,#edf5ff)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans','Inter',sans-serif" }}>
      <div style={{ background:'rgba(255,255,255,0.76)', borderRadius:20, padding:'40px 60px', textAlign:'center', border:'1px solid rgba(190,215,255,0.45)', backdropFilter:'blur(24px)' }}>
        <Loader2 size={32} strokeWidth={2} color="#1d6ef5" style={{ marginBottom:14, animation:'spin 1s linear infinite' }} />
        <p style={{ fontSize:14, color:'#5a7aaa', fontWeight:500 }}>Chargement des demandes...</p>
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ fontFamily:"'DM Sans','Inter',-apple-system,sans-serif", background:'linear-gradient(145deg,#b8d4f0 0%,#cfe3f8 35%,#dceeff 65%,#edf5ff 100%)', minHeight:'100vh', padding:'16px', boxSizing:'border-box' }}>
      <div style={{ maxWidth:1380, margin:'0 auto', background:'rgba(240,247,255,0.70)', borderRadius:28, backdropFilter:'blur(24px)', WebkitBackdropFilter:'blur(24px)', border:'1px solid rgba(255,255,255,0.88)', boxShadow:'0 8px 40px rgba(20,70,160,0.09)', overflow:'hidden' }}>

        {/* ══ TOPBAR ══ */}
        <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:'1px solid rgba(180,210,255,0.35)', background:'rgba(255,255,255,0.52)', flexWrap:'wrap', gap:10 }}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ fontSize:18, fontWeight:900, color:'#0d2a5c', letterSpacing:'2px' }}>D<span style={{ color:'#1d6ef5' }}>OO</span>M</div>
            <button onClick={() => navigate('/admin/dashboard')}
              style={{ display:'flex', alignItems:'center', gap:7, background:'rgba(255,255,255,0.72)', border:'1px solid rgba(190,215,255,0.55)', color:'#4a6a9e', fontSize:12.5, fontWeight:600, padding:'8px 16px', borderRadius:50, cursor:'pointer', fontFamily:'inherit' }}>
              <ArrowLeft size={14} strokeWidth={2.2} />Retour
            </button>
          </div>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:14, fontWeight:800, color:'#0d2a5c' }}>Gestion des demandes</div>
            <div style={{ fontSize:11, color:'#5a7aaa', marginTop:2 }}>{demandes.length} demande{demandes.length > 1 ? 's' : ''} au total</div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <NotificationsBadge role="admin" />
            <div style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(29,110,245,0.07)', border:'1px solid rgba(29,110,245,0.2)', borderRadius:50, padding:'6px 14px', fontSize:11.5, fontWeight:700, color:'#0d2a5c' }}>
              <span style={{ width:6, height:6, borderRadius:'50%', background:'#1d6ef5' }} />Admin
            </div>
          </div>
        </header>

        <div style={{ padding:'20px 20px 28px' }}>

          {/* Titre */}
          <div style={{ marginBottom:18 }}>
            <p style={{ fontSize:10.5, fontWeight:700, color:'#1d6ef5', textTransform:'uppercase', letterSpacing:'1.8px', marginBottom:4 }}>Espace admin</p>
            <h1 style={{ fontSize:22, fontWeight:800, color:'#0d2a5c', letterSpacing:'-0.5px', margin:0 }}>Toutes les demandes</h1>
          </div>

          {/* ══ BARRE : filtres + recherche ══ */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, marginBottom:16, flexWrap:'wrap' }}>
            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
              {filtres.map(f => {
                const Icn = f.icone
                const isA = filtreStatut === f.val
                return (
                  <button key={f.val} onClick={() => setFiltreStatut(f.val)}
                    style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:50, border:`1.5px solid ${isA ? '#1d6ef5' : 'rgba(190,215,255,0.55)'}`, background:isA ? 'rgba(29,110,245,0.08)' : 'rgba(255,255,255,0.66)', color:isA ? '#1d6ef5' : '#5a7aaa', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'inherit', transition:'all 0.18s' }}>
                    <Icn size={12} strokeWidth={2.2} />
                    <span className="filtre-label">{f.label}</span>
                    <span style={{ background:isA ? '#1d6ef5' : 'rgba(190,215,255,0.38)', color:isA ? '#fff' : '#5a7aaa', fontSize:10, fontWeight:800, padding:'1px 7px', borderRadius:50 }}>{f.count}</span>
                  </button>
                )
              })}
            </div>

            <div style={{ position:'relative', minWidth:220, flex:'0 0 auto' }}>
              <Search size={14} strokeWidth={2} color="#7a9cc5" style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', pointerEvents:'none' }} />
              <input
                type="text" value={recherche} onChange={e => setRecherche(e.target.value)}
                placeholder="Chercher client, service…"
                style={{ width:'100%', boxSizing:'border-box', padding:'9px 36px 9px 34px', border:'1.5px solid rgba(190,215,255,0.55)', borderRadius:50, fontSize:12.5, outline:'none', fontFamily:'inherit', background:'rgba(255,255,255,0.80)', color:'#0d2a5c', transition:'border-color .2s' }}
                onFocus={e => e.target.style.borderColor = '#1d6ef5'}
                onBlur={e  => e.target.style.borderColor = 'rgba(190,215,255,0.55)'}
              />
              {recherche && (
                <button onClick={() => setRecherche('')} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', padding:2, display:'flex', alignItems:'center' }}>
                  <X size={13} strokeWidth={2.5} color="#7a9cc5" />
                </button>
              )}
            </div>
          </div>

          {/* Résumé */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10, flexWrap:'wrap', gap:8 }}>
            <span style={{ fontSize:11.5, color:'#7a9cc5', fontWeight:600 }}>
              {demandesFiltrees.length} résultat{demandesFiltrees.length > 1 ? 's' : ''}
              {recherche && <> pour "<strong style={{ color:'#1d6ef5' }}>{recherche}</strong>"</>}
            </span>
            {totalPages > 1 && <span style={{ fontSize:11, color:'#7a9cc5', fontWeight:600 }}>Page {page} / {totalPages}</span>}
          </div>

          {/* ══ TABLEAU ══ */}
          <div style={{ background:'rgba(255,255,255,0.76)', borderRadius:20, overflow:'hidden', border:'1px solid rgba(190,215,255,0.45)', boxShadow:'0 3px 18px rgba(20,70,160,0.04)' }}>
            <div style={{ overflowX:'auto' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:720 }}>
                <thead>
                  <tr style={{ background:'rgba(190,215,255,0.14)' }}>
                    {['#','Client','Service','Catégorie','Date','Urgence','Technicien','Statut','Actions'].map((col,i) => (
                      <th key={i} style={{ padding:'11px 14px', textAlign:'left', fontSize:10, fontWeight:700, color:'#7a9cc5', textTransform:'uppercase', letterSpacing:'0.6px', borderBottom:'1px solid rgba(190,215,255,0.25)', whiteSpace:'nowrap' }}>{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {demandesPage.length === 0 && (
                    <tr><td colSpan={9} style={{ padding:48, textAlign:'center' }}>
                      <PackageOpen size={32} strokeWidth={1.5} color="#7a9cc5" style={{ marginBottom:10 }} />
                      <p style={{ fontSize:13, color:'#5a7aaa', margin:0 }}>
                        {recherche ? `Aucun résultat pour "${recherche}"` : 'Aucune demande dans cette catégorie'}
                      </p>
                    </td></tr>
                  )}

                  {demandesPage.map((demande, i) => {
                    const config   = configStatuts[demande.statut] || configStatuts.en_attente
                    const isH      = hoveredRow === demande.id
                    const isUrgent = demande.urgence === 'urgent' || demande.urgence === 'critique'
                    const cc       = catConfig[demande.service_categorie] || defaultCat
                    const CatIcon  = cc.Icon
                    const enAction = actionEnCours === demande.id
                    const aNotes   = !!demande.notes_techniques

                    return (
                      <tr key={demande.id}
                        onMouseEnter={() => setHoveredRow(demande.id)}
                        onMouseLeave={() => setHoveredRow(null)}
                        style={{ borderBottom:i < demandesPage.length-1 ? '1px solid rgba(190,215,255,0.2)' : 'none', background:enAction ? 'rgba(29,110,245,0.04)' : isH ? 'rgba(29,110,245,0.03)' : 'transparent', transition:'background .15s', opacity:enAction ? 0.7 : 1 }}>

                        <td style={{ padding:'13px 14px', fontSize:11.5, color:'#7a9cc5', fontWeight:700, whiteSpace:'nowrap' }}>#{demande.id}</td>

                        <td style={{ padding:'13px 14px' }}>
                          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                            <div style={{ width:28, height:28, borderRadius:'50%', background:'linear-gradient(135deg,#1d6ef5,#60a5fa)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, fontWeight:800, color:'#fff', flexShrink:0 }}>
                              {demande.client_prenom?.charAt(0)}
                            </div>
                            <span style={{ fontSize:12.5, fontWeight:700, color:'#0d2a5c', whiteSpace:'nowrap' }}>{demande.client_prenom} {demande.client_nom}</span>
                          </div>
                        </td>

                        <td style={{ padding:'13px 14px', fontSize:12, color:'#5a7aaa', maxWidth:130, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{demande.service_nom}</td>

                        <td style={{ padding:'13px 14px' }}>
                          <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:10.5, fontWeight:700, padding:'4px 10px', borderRadius:6, background:cc.bg, color:cc.text, border:`1px solid ${cc.border}`, whiteSpace:'nowrap' }}>
                            <CatIcon size={11} strokeWidth={2.3} />
                            {demande.service_categorie || '—'}
                          </span>
                        </td>

                        <td style={{ padding:'13px 14px', fontSize:11.5, color:'#7a9cc5', whiteSpace:'nowrap' }}>
                          {new Date(demande.date_creation).toLocaleDateString('fr-FR')}
                        </td>

                        <td style={{ padding:'13px 14px' }}>
                          <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:50, background:isUrgent ? 'rgba(245,158,11,0.12)' : 'rgba(100,140,200,0.1)', color:isUrgent ? '#b45309' : '#4a6a9e', border:`1px solid ${isUrgent ? 'rgba(245,158,11,0.3)' : 'rgba(100,140,200,0.2)'}`, whiteSpace:'nowrap' }}>
                            {demande.urgence?.charAt(0).toUpperCase() + demande.urgence?.slice(1)}
                          </span>
                        </td>

                        <td style={{ padding:'13px 14px', fontSize:12, color:'#5a7aaa' }}>
                          {demande.technicien_nom
                            ? <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                                <div style={{ width:22, height:22, borderRadius:'50%', background:'linear-gradient(135deg,#10b981,#34d399)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:9, fontWeight:800, color:'#fff', flexShrink:0 }}>
                                  {demande.technicien_prenom?.charAt(0)}
                                </div>
                                <span style={{ fontWeight:600, whiteSpace:'nowrap' }}>{demande.technicien_prenom} {demande.technicien_nom}</span>
                              </div>
                            : <span style={{ color:'#a0b4cc', fontStyle:'italic', fontSize:11.5 }}>Non assigné</span>
                          }
                        </td>

                        <td style={{ padding:'13px 14px' }}>
                          <span style={{ fontSize:10, fontWeight:700, padding:'4px 10px', borderRadius:50, background:config.fond, color:config.couleur, border:`1px solid ${config.bordure}`, display:'inline-flex', alignItems:'center', gap:5, whiteSpace:'nowrap' }}>
                            <span style={{ width:5, height:5, borderRadius:'50%', background:config.dot, flexShrink:0 }} />
                            {config.label}
                          </span>
                        </td>

                        <td style={{ padding:'13px 14px' }}>
                          {enAction ? (
                            <Loader2 size={16} strokeWidth={2} color="#1d6ef5" style={{ animation:'spin 1s linear infinite' }} />
                          ) : (
                            <div style={{ display:'flex', gap:5, flexWrap:'wrap', alignItems:'center' }}>

                              {/* ✅ Bouton Voir notes */}
                              <button
                                onClick={() => setPanneauDemande(demande)}
                                title={aNotes ? 'Voir les notes techniques' : 'Voir le détail'}
                                style={{
                                  display:'flex', alignItems:'center', gap:4,
                                  background: aNotes ? 'rgba(29,110,245,0.1)' : 'rgba(190,215,255,0.25)',
                                  color: aNotes ? '#1d6ef5' : '#7a9cc5',
                                  border: aNotes ? '1px solid rgba(29,110,245,0.25)' : '1px solid rgba(190,215,255,0.45)',
                                  padding:'5px 10px', borderRadius:8, fontSize:11, fontWeight:700,
                                  cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap', position:'relative',
                                }}>
                                <StickyNote size={11} />
                                <span className="btn-notes-label">Notes</span>
                                {aNotes && (
                                  <span style={{ width:6, height:6, borderRadius:'50%', background:'#1d6ef5', position:'absolute', top:-2, right:-2 }} />
                                )}
                              </button>

                              {!demande.technicien_id && (
                                <button onClick={() => setDemandeSelectionnee(demande.id)}
                                  style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(29,110,245,0.08)', color:'#1d6ef5', border:'1px solid rgba(29,110,245,0.2)', padding:'5px 10px', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
                                  <UserCheck size={11} />
                                  <span className="btn-action-label">Assigner</span>
                                </button>
                              )}
                              {demande.statut === 'assigne' && (
                                <button onClick={() => changerStatut(demande.id, 'en_cours')}
                                  style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(59,130,246,0.08)', color:'#1d4ed8', border:'1px solid rgba(59,130,246,0.2)', padding:'5px 10px', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
                                  <Play size={11} />
                                  <span className="btn-action-label">Démarrer</span>
                                </button>
                              )}
                              {demande.statut === 'en_cours' && (
                                <button onClick={() => changerStatut(demande.id, 'termine')}
                                  style={{ display:'flex', alignItems:'center', gap:4, background:'rgba(16,185,129,0.08)', color:'#065f46', border:'1px solid rgba(16,185,129,0.2)', padding:'5px 10px', borderRadius:8, fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', whiteSpace:'nowrap' }}>
                                  <CheckCircle2 size={11} />
                                  <span className="btn-action-label">Clôturer</span>
                                </button>
                              )}
                              {demande.statut === 'termine' && (
                                <span style={{ fontSize:10.5, color:'#10b981', fontWeight:700, display:'flex', alignItems:'center', gap:4 }}>
                                  <CheckCheck size={12} strokeWidth={2.5} />
                                  <span className="btn-action-label">Terminé</span>
                                </span>
                              )}
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* ✅ PAGINATION */}
            {totalPages > 1 && (
              <div style={{ padding:'14px 20px', borderTop:'1px solid rgba(190,215,255,0.25)', display:'flex', alignItems:'center', justifyContent:'space-between', background:'rgba(255,255,255,0.5)', flexWrap:'wrap', gap:10 }}>
                <span style={{ fontSize:11.5, color:'#7a9cc5', fontWeight:600 }}>
                  {(page-1)*PAR_PAGE + 1}–{Math.min(page*PAR_PAGE, demandesFiltrees.length)} sur {demandesFiltrees.length}
                </span>
                <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                  <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page===1}
                    style={{ width:32, height:32, borderRadius:8, background:'rgba(255,255,255,0.8)', border:'1px solid rgba(190,215,255,0.5)', display:'flex', alignItems:'center', justifyContent:'center', cursor:page===1?'not-allowed':'pointer', opacity:page===1?0.4:1 }}>
                    <ChevronLeft size={14} strokeWidth={2.5} color="#4a6a9e" />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i+1)
                    .filter(p => p===1 || p===totalPages || Math.abs(p-page)<=1)
                    .reduce((acc, p, idx, arr) => { if (idx>0 && p-arr[idx-1]>1) acc.push('…'); acc.push(p); return acc }, [])
                    .map((p, idx) => p==='…'
                      ? <span key={`e${idx}`} style={{ padding:'0 4px', fontSize:12, color:'#7a9cc5' }}>…</span>
                      : <button key={p} onClick={() => setPage(p)} style={{ width:32, height:32, borderRadius:8, background:p===page?'#1d6ef5':'rgba(255,255,255,0.8)', border:`1px solid ${p===page?'#1d6ef5':'rgba(190,215,255,0.5)'}`, color:p===page?'#fff':'#4a6a9e', fontSize:12, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>{p}</button>
                    )
                  }
                  <button onClick={() => setPage(p => Math.min(totalPages, p+1))} disabled={page===totalPages}
                    style={{ width:32, height:32, borderRadius:8, background:'rgba(255,255,255,0.8)', border:'1px solid rgba(190,215,255,0.5)', display:'flex', alignItems:'center', justifyContent:'center', cursor:page===totalPages?'not-allowed':'pointer', opacity:page===totalPages?0.4:1 }}>
                    <ChevronRight size={14} strokeWidth={2.5} color="#4a6a9e" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ PANNEAU LATÉRAL NOTES */}
      {panneauDemande && (
        <PanneauDetail
          demande={panneauDemande}
          onFermer={() => setPanneauDemande(null)}
        />
      )}

      {/* ══ MODAL ASSIGNATION ══ */}
      {demandeSelectionnee && (() => {
        const { specialises, generalistes } = getTechniciensPourDemande(demandeSelectionnee)
        const demande  = demandes.find(d => d.id === demandeSelectionnee)
        const cc       = catConfig[demande?.service_categorie] || defaultCat
        const CatIcon  = cc.Icon
        return (
          <div onClick={e => { if (e.target === e.currentTarget) setDemandeSelectionnee(null) }}
            style={{ position:'fixed', inset:0, background:'rgba(13,42,92,0.35)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:400, padding:16 }}>
            <div style={{ background:'rgba(240,247,255,0.97)', backdropFilter:'blur(24px)', borderRadius:24, padding:28, maxWidth:440, width:'100%', border:'1px solid rgba(255,255,255,0.9)', boxShadow:'0 24px 60px rgba(13,42,92,0.2)', maxHeight:'85vh', overflowY:'auto' }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:16 }}>
                <div>
                  <h3 style={{ fontSize:16, fontWeight:800, color:'#0d2a5c', margin:'0 0 6px' }}>Assigner un technicien</h3>
                  <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                    <span style={{ fontSize:12, color:'#5a7aaa' }}>Service :</span>
                    <strong style={{ fontSize:12, color:'#0d2a5c' }}>{demande?.service_nom}</strong>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:5, fontSize:10.5, fontWeight:700, padding:'3px 10px', borderRadius:6, background:cc.bg, color:cc.text, border:`1px solid ${cc.border}` }}>
                      <CatIcon size={11} strokeWidth={2.3} />{demande?.service_categorie}
                    </span>
                  </div>
                </div>
                <button onClick={() => setDemandeSelectionnee(null)}
                  style={{ background:'rgba(190,215,255,0.3)', border:'none', borderRadius:'50%', width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginLeft:8 }}>
                  <X size={15} color="#5a7aaa" />
                </button>
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:10, margin:'16px 0' }}>
                {specialises.length === 0 && generalistes.length === 0 && (
                  <div style={{ textAlign:'center', padding:'24px 16px', color:'#7a9cc5', fontSize:13, background:'rgba(190,215,255,0.15)', borderRadius:12 }}>
                    Aucun technicien disponible.
                  </div>
                )}
                {specialises.length > 0 && (
                  <>
                    <div style={{ fontSize:10, fontWeight:700, color:cc.text, textTransform:'uppercase', letterSpacing:'0.8px', marginBottom:4, display:'flex', alignItems:'center', gap:6 }}>
                      <CatIcon size={12} strokeWidth={2.3} /> Spécialisés en {demande?.service_categorie}
                    </div>
                    {specialises.map(tech => (
                      <div key={tech.id}
                        onClick={() => assignerTechnicien(demandeSelectionnee, tech.id, `${tech.prenom} ${tech.nom}`)}
                        style={{ padding:'14px 16px', border:`1.5px solid ${cc.border}`, borderRadius:14, display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', background:cc.bg, transition:'all .18s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity='0.8'}
                        onMouseLeave={e => e.currentTarget.style.opacity='1'}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:36, height:36, background:`linear-gradient(135deg,${cc.text},${cc.text}88)`, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#fff', flexShrink:0 }}>
                            {tech.prenom?.charAt(0)}{tech.nom?.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize:13, fontWeight:700, color:'#0d2a5c' }}>{tech.prenom} {tech.nom}</div>
                            <div style={{ display:'flex', flexWrap:'wrap', gap:4, marginTop:4 }}>
                              {tech.categories?.map(cat => {
                                const c = catConfig[cat] || defaultCat; const CIcon = c.Icon
                                return (
                                  <span key={cat} style={{ display:'inline-flex', alignItems:'center', gap:4, fontSize:10, fontWeight:700, padding:'2px 8px', borderRadius:50, background:'rgba(255,255,255,0.75)', color:c.text, border:`1px solid ${c.border}` }}>
                                    <CIcon size={10} strokeWidth={2.3} />{cat}
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                        <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:50, background:'rgba(255,255,255,0.8)', color:cc.text, border:`1px solid ${cc.border}`, whiteSpace:'nowrap', flexShrink:0, marginLeft:8 }}>Spécialisé</span>
                      </div>
                    ))}
                  </>
                )}
                {generalistes.length > 0 && (
                  <>
                    <div style={{ fontSize:10, fontWeight:700, color:'#8da2bb', textTransform:'uppercase', letterSpacing:'0.8px', marginTop:8, marginBottom:4 }}>Généralistes</div>
                    {generalistes.map(tech => (
                      <div key={tech.id}
                        onClick={() => assignerTechnicien(demandeSelectionnee, tech.id, `${tech.prenom} ${tech.nom}`)}
                        style={{ padding:'14px 16px', border:'1.5px solid rgba(190,215,255,0.55)', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', background:'rgba(255,255,255,0.72)', transition:'all .18s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor='#1d6ef5'; e.currentTarget.style.background='rgba(29,110,245,0.05)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(190,215,255,0.55)'; e.currentTarget.style.background='rgba(255,255,255,0.72)' }}>
                        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                          <div style={{ width:36, height:36, background:'linear-gradient(135deg,#64748b,#94a3b8)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:800, color:'#fff', flexShrink:0 }}>
                            {tech.prenom?.charAt(0)}{tech.nom?.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontSize:13, fontWeight:700, color:'#0d2a5c' }}>{tech.prenom} {tech.nom}</div>
                            <div style={{ fontSize:10.5, color:'#94a3b8', marginTop:2 }}>Aucune catégorie définie</div>
                          </div>
                        </div>
                        <span style={{ fontSize:10, fontWeight:700, padding:'3px 10px', borderRadius:50, background:'rgba(100,116,139,0.1)', color:'#64748b', border:'1px solid rgba(100,116,139,0.25)', whiteSpace:'nowrap' }}>Généraliste</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
              <button onClick={() => setDemandeSelectionnee(null)}
                style={{ width:'100%', background:'rgba(190,215,255,0.25)', color:'#4a6a9e', border:'1px solid rgba(190,215,255,0.45)', padding:12, borderRadius:50, fontSize:12.5, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                Annuler
              </button>
            </div>
          </div>
        )
      })()}

      <Toast toasts={toasts} />

      <style>{`
        @keyframes spin        { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes apparaitre  { from{opacity:0;transform:translateX(32px) scale(0.95)} to{opacity:1;transform:translateX(0) scale(1)} }
        @keyframes glisserDroite { from{opacity:0;transform:translateX(40px)} to{opacity:1;transform:translateX(0)} }
        @keyframes fadeIn      { from{opacity:0} to{opacity:1} }

        /* Masquer labels sur mobile pour gagner de la place */
        @media (max-width: 860px) {
          .filtre-label    { display: none !important; }
        }
        @media (max-width: 1100px) {
          .btn-notes-label  { display: none !important; }
          .btn-action-label { display: none !important; }
        }
      `}</style>
    </div>
  )
}