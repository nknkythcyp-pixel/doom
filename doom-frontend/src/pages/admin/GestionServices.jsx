// ============================================
// GESTIONSERVICES.JSX — ✅ FULL RESPONSIVE
// Fonctionne sur : téléphone, tablette, desktop, TV 4K
// ============================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Plus, Pencil, Power, Trash2, X, Image, PlusCircle, Minus, Menu } from 'lucide-react'
import api from '../../services/api'

const categories = ['Informatique', 'Réseau', 'Sécurité', 'Électricité', 'Domotique']

const formulaireVide = {
  nom: '', categorie: 'Informatique', description: '',
  dureeEstimee: '', photo: '', inclus: [],
}

/* ── CSS global injecté une seule fois ── */
const STYLES = `
  *, *::before, *::after { box-sizing: border-box; }

  /* Input / select / textarea */
  .gs-input {
    width: 100%; padding: 11px 14px;
    border: 1.5px solid rgba(226,236,248,0.9);
    border-radius: 12px; font-size: 14px; outline: none;
    font-family: inherit;
    background: rgba(248,251,255,0.8);
    color: #0f3767; transition: border-color .2s;
  }
  .gs-input:focus { border-color: #0066ff; }
  .gs-label {
    font-size: 12px; font-weight: 700;
    color: #0f3767; display: block; margin-bottom: 7px;
  }

  /* ── HEADER ── */
  .gs-header {
    background: rgba(255,255,255,0.45);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border-bottom: 1px solid rgba(255,255,255,0.7);
    padding: 0 16px;
    display: flex; align-items: center;
    justify-content: space-between;
    height: 64px;
    position: sticky; top: 0; z-index: 50;
    gap: 12px;
  }

  /* ── Tableau ── */
  .gs-table-wrap {
    background: rgba(255,255,255,0.65);
    backdrop-filter: blur(20px);
    border-radius: 20px; overflow: hidden;
    border: 1px solid rgba(255,255,255,0.8);
    box-shadow: 0 4px 24px rgba(15,55,103,0.06);
  }
  .gs-table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  .gs-table {
    width: 100%; border-collapse: collapse;
    min-width: 700px;
  }
  .gs-th {
    padding: 13px 16px; text-align: left;
    font-size: 10px; font-weight: 700; color: #8da2bb;
    text-transform: uppercase; letter-spacing: 0.6px;
    border-bottom: 1px solid rgba(226,236,248,0.8);
    white-space: nowrap;
  }
  .gs-td { padding: 12px 16px; }

  /* ── Cartes mobiles (< 640px) ── */
  .gs-cards { display: none; flex-direction: column; gap: 12px; }
  .gs-card {
    background: rgba(255,255,255,0.8);
    border-radius: 16px; padding: 16px;
    border: 1px solid rgba(226,236,248,0.8);
    box-shadow: 0 2px 12px rgba(15,55,103,0.06);
  }

  /* ── Modal ── */
  .gs-modal-inner {
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(24px);
    border-radius: 24px;
    padding: 28px 24px;
    width: calc(100% - 32px);
    max-width: 560px;
    border: 1px solid rgba(255,255,255,0.9);
    box-shadow: 0 24px 64px rgba(15,55,103,0.15);
    max-height: 90vh; overflow-y: auto;
    margin: 16px;
  }

  /* ── Boutons actions ── */
  .gs-actions { display: flex; gap: 6px; flex-wrap: wrap; }
  .gs-btn-action {
    display: flex; align-items: center; gap: 4px;
    padding: 5px 10px; border-radius: 8px;
    font-size: 11px; font-weight: 700;
    cursor: pointer; font-family: inherit;
    white-space: nowrap; border: 1px solid;
  }

  /* ── RESPONSIVE ── */

  /* Très petit (< 360px) — watch, mini */
  @media (max-width: 359px) {
    .gs-header { height: 56px; padding: 0 10px; }
    .gs-logo   { font-size: 16px !important; }
    .gs-back-text { display: none !important; }
    .gs-header-title { display: none !important; }
    .gs-add-text    { display: none !important; }
    .gs-modal-inner { padding: 18px 14px; border-radius: 18px; }
    .gs-table-scroll { display: none; }
    .gs-cards { display: flex !important; }
    main { padding: 12px 10px !important; }
  }

  /* Mobile (360–639px) */
  @media (max-width: 639px) {
    .gs-table-scroll { display: none; }
    .gs-cards { display: flex !important; }
    main { padding: 16px 12px !important; }
    .gs-header-title p { display: none; }
    .gs-add-text { display: none; }
    .gs-modal-inner { padding: 22px 16px; border-radius: 20px; }
    .gs-back-text { display: none; }
  }

  /* Tablette portrait (640–767px) */
  @media (min-width: 640px) and (max-width: 767px) {
    .gs-table-scroll { display: none; }
    .gs-cards { display: flex !important; }
    main { padding: 20px 16px !important; }
    .gs-add-text { display: none; }
  }

  /* Tablette paysage / petits desktops (768–1023px) */
  @media (min-width: 768px) and (max-width: 1023px) {
    .gs-header { padding: 0 24px; }
    main { padding: 24px 20px !important; }
  }

  /* Desktop (1024px+) */
  @media (min-width: 1024px) {
    .gs-header { padding: 0 40px; height: 72px; }
    main { padding: 32px 40px !important; }
    .gs-modal-inner { padding: 36px; }
  }

  /* Grand écran / TV 4K */
  @media (min-width: 2560px) {
    .gs-header { height: 88px; }
    .gs-logo   { font-size: 26px !important; }
    .gs-th, .gs-td { padding: 18px 22px !important; font-size: 14px !important; }
    main { padding: 48px 80px !important; max-width: 2400px; margin: 0 auto; }
    .gs-modal-inner { max-width: 700px; padding: 48px; }
  }
`

function inject(id, css) {
  if (typeof document === 'undefined') return
  if (document.getElementById(id)) return
  const s = document.createElement('style')
  s.id = id; s.textContent = css
  document.head.appendChild(s)
}

export default function GestionServices() {
  inject('gs-styles', STYLES)

  const navigate = useNavigate()
  const [services,         setServices]         = useState([])
  const [chargement,       setChargement]       = useState(true)
  const [modalOuvert,      setModalOuvert]      = useState(false)
  const [serviceEnEdition, setServiceEnEdition] = useState(null)
  const [enregistrement,   setEnregistrement]   = useState(false)
  const [formulaire,       setFormulaire]       = useState(formulaireVide)
  const [apercuPhoto,      setApercuPhoto]      = useState(false)
  const [nouvelInclus,     setNouvelInclus]     = useState('')

  const chargerServices = async () => {
    try {
      const r = await api.get('/services')
      setServices(r.data.services)
    } catch (err) { console.error(err) }
    finally { setChargement(false) }
  }
  useEffect(() => { chargerServices() }, [])

  const ouvrirAjout = () => {
    setServiceEnEdition(null); setFormulaire(formulaireVide)
    setApercuPhoto(false); setNouvelInclus(''); setModalOuvert(true)
  }

  const ouvrirEdition = (s) => {
    setServiceEnEdition(s)
    setFormulaire({
      nom: s.nom, categorie: s.categorie,
      description: s.description || '',
      dureeEstimee: s.duree_estimee || '',
      photo: s.photo || '',
      inclus: Array.isArray(s.inclus) ? [...s.inclus] : [],
    })
    setApercuPhoto(!!s.photo); setNouvelInclus(''); setModalOuvert(true)
  }

  const ajouterInclus = () => {
    const v = nouvelInclus.trim(); if (!v) return
    setFormulaire(p => ({ ...p, inclus: [...p.inclus, v] })); setNouvelInclus('')
  }
  const supprimerInclus = (i) => setFormulaire(p => ({ ...p, inclus: p.inclus.filter((_, j) => j !== i) }))
  const modifierInclus  = (i, v) => setFormulaire(p => { const c = [...p.inclus]; c[i] = v; return { ...p, inclus: c } })
  const handleKeyInclus = (e) => { if (e.key === 'Enter') { e.preventDefault(); ajouterInclus() } }

  const sauvegarder = async () => {
    if (!formulaire.nom.trim()) return
    setEnregistrement(true)
    try {
      const payload = {
        nom: formulaire.nom, categorie: formulaire.categorie,
        description: formulaire.description, dureeEstimee: formulaire.dureeEstimee,
        photo: formulaire.photo || null, inclus: formulaire.inclus,
      }
      if (serviceEnEdition) {
        await api.put(`/services/${serviceEnEdition.id}`, { ...payload, actif: serviceEnEdition.actif })
      } else {
        await api.post('/services', payload)
      }
      await chargerServices(); setModalOuvert(false)
    } catch (err) { console.error(err) }
    finally { setEnregistrement(false) }
  }

  const toggleActif = async (id) => {
    try { await api.patch(`/services/${id}/toggle`); await chargerServices() } catch (err) { console.error(err) }
  }
  const supprimerService = async (id) => {
    if (!window.confirm('Supprimer ce service définitivement ?')) return
    try { await api.delete(`/services/${id}`); await chargerServices() } catch (err) { console.error(err) }
  }

  if (chargement) return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(145deg,#dce9f8,#c5d9f2,#d4e4f7)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'DM Sans','Inter',sans-serif", padding:16 }}>
      <div style={{ background:'rgba(255,255,255,0.6)', backdropFilter:'blur(20px)', borderRadius:20, padding:'32px 48px', textAlign:'center', border:'1px solid rgba(255,255,255,0.8)' }}>
        <div style={{ fontSize:32, marginBottom:10 }}>⏳</div>
        <p style={{ fontSize:14, color:'#6b8299', fontWeight:500, margin:0 }}>Chargement des services...</p>
      </div>
    </div>
  )

  // ── Carte mobile d'un service ──
  const ServiceCard = ({ service }) => (
    <div className="gs-card">
      <div style={{ display:'flex', gap:12, marginBottom:12 }}>
        {service.photo ? (
          <img src={service.photo} alt={service.nom}
            style={{ width:56, height:44, objectFit:'cover', borderRadius:8, border:'1px solid rgba(226,236,248,0.8)', flexShrink:0 }}
            onError={e => e.target.style.display='none'} />
        ) : (
          <div style={{ width:56, height:44, background:'rgba(226,236,248,0.5)', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Image size={16} color="#8da2bb" />
          </div>
        )}
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontSize:14, fontWeight:800, color:'#0f3767', marginBottom:4 }}>{service.nom}</div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            <span style={{ fontSize:10, fontWeight:700, padding:'2px 10px', borderRadius:50, background:'rgba(99,102,241,0.1)', color:'#4338ca', border:'1px solid rgba(99,102,241,0.2)' }}>{service.categorie}</span>
            <span style={{ fontSize:10, fontWeight:700, padding:'2px 10px', borderRadius:50, background:service.actif?'rgba(16,185,129,0.12)':'rgba(148,163,184,0.12)', color:service.actif?'#059669':'#94a3b8', border:`1px solid ${service.actif?'rgba(16,185,129,0.3)':'rgba(148,163,184,0.3)'}` }}>
              {service.actif ? 'Actif' : 'Inactif'}
            </span>
          </div>
        </div>
      </div>
      {service.description && (
        <p style={{ fontSize:12, color:'#64748b', margin:'0 0 10px', lineHeight:1.5 }}>
          {service.description.substring(0,80)}{service.description.length>80?'…':''}
        </p>
      )}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
        <span style={{ fontSize:11, fontWeight:700, padding:'2px 10px', borderRadius:50, background:'rgba(14,165,233,0.1)', color:'#0284c7', border:'1px solid rgba(14,165,233,0.2)' }}>
          {Array.isArray(service.inclus) ? service.inclus.length : 0} éléments
        </span>
        {service.duree_estimee && <span style={{ fontSize:11, color:'#64748b' }}>{service.duree_estimee}</span>}
      </div>
      <div className="gs-actions">
        <button onClick={() => ouvrirEdition(service)}
          style={{ flex:1, justifyContent:'center', background:'rgba(59,130,246,0.1)', color:'#2563eb', borderColor:'rgba(59,130,246,0.25)' }}
          className="gs-btn-action"><Pencil size={11} /> Modifier</button>
        <button onClick={() => toggleActif(service.id)}
          style={{ flex:1, justifyContent:'center', background:service.actif?'rgba(251,146,60,0.1)':'rgba(16,185,129,0.1)', color:service.actif?'#c2410c':'#059669', borderColor:service.actif?'rgba(251,146,60,0.25)':'rgba(16,185,129,0.25)' }}
          className="gs-btn-action"><Power size={11} /> {service.actif?'Désactiver':'Activer'}</button>
        <button onClick={() => supprimerService(service.id)}
          style={{ flex:1, justifyContent:'center', background:'rgba(239,68,68,0.1)', color:'#dc2626', borderColor:'rgba(239,68,68,0.25)' }}
          className="gs-btn-action"><Trash2 size={11} /> Supprimer</button>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'linear-gradient(145deg,#dce9f8 0%,#c5d9f2 50%,#d4e4f7 100%)', fontFamily:"'DM Sans','Inter',-apple-system,sans-serif" }}>

      {/* ── HEADER ── */}
      <header className="gs-header">
        <div style={{ display:'flex', alignItems:'center', gap:16, flexShrink:0 }}>
          <div className="gs-logo" style={{ fontSize:20, fontWeight:900, color:'#0f3767', letterSpacing:'1px', flexShrink:0 }}>
            DOOM<span style={{ color:'#0066ff' }}>.</span>
          </div>
          <button onClick={() => navigate('/admin/dashboard')}
            style={{ display:'flex', alignItems:'center', gap:6, background:'transparent', border:'none', color:'#6b8299', fontSize:13, fontWeight:600, cursor:'pointer', fontFamily:'inherit', padding:'6px 10px', borderRadius:8 }}>
            <ArrowLeft size={15} />
            <span className="gs-back-text">Tableau de bord</span>
          </button>
        </div>

        <div className="gs-header-title" style={{ textAlign:'center', flexShrink:0 }}>
          <h2 style={{ fontSize:16, fontWeight:800, color:'#0f3767', margin:0, whiteSpace:'nowrap' }}>Gestion des services</h2>
          <p style={{ fontSize:11, color:'#8da2bb', margin:'2px 0 0', fontWeight:500 }}>
            {services.length} services · {services.filter(s=>s.actif).length} actifs
          </p>
        </div>

        <button onClick={ouvrirAjout}
          style={{ display:'flex', alignItems:'center', gap:7, background:'#0f2942', color:'#fff', border:'none', padding:'9px 18px', borderRadius:50, fontSize:13, fontWeight:800, cursor:'pointer', fontFamily:'inherit', boxShadow:'0 8px 24px rgba(15,41,66,0.25)', whiteSpace:'nowrap', flexShrink:0 }}
          onMouseEnter={e => e.currentTarget.style.background='#0066ff'}
          onMouseLeave={e => e.currentTarget.style.background='#0f2942'}>
          <Plus size={15} />
          <span className="gs-add-text">Ajouter un service</span>
        </button>
      </header>

      {/* ── MAIN ── */}
      <main style={{ padding:'24px 16px' }}>

        {/* ── Tableau (tablette / desktop) ── */}
        <div className="gs-table-wrap">
          <div className="gs-table-scroll">
            <table className="gs-table">
              <thead>
                <tr style={{ background:'rgba(248,250,252,0.7)' }}>
                  {['Photo','Service','Catégorie','Description','Inclus','Durée','Statut','Actions'].map((col,i) => (
                    <th key={i} className="gs-th">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {services.map((service, i) => (
                  <tr key={service.id}
                    style={{ borderBottom:i<services.length-1?'1px solid rgba(226,236,248,0.6)':'none', transition:'background .15s' }}
                    onMouseEnter={e => e.currentTarget.style.background='rgba(0,102,255,0.025)'}
                    onMouseLeave={e => e.currentTarget.style.background='transparent'}>

                    <td className="gs-td">
                      {service.photo ? (
                        <img src={service.photo} alt={service.nom} style={{ width:48, height:36, objectFit:'cover', borderRadius:6, border:'1px solid rgba(226,236,248,0.8)' }} onError={e => e.target.style.display='none'} />
                      ) : (
                        <div style={{ width:48, height:36, background:'rgba(226,236,248,0.5)', borderRadius:6, display:'flex', alignItems:'center', justifyContent:'center' }}>
                          <Image size={14} color="#8da2bb" />
                        </div>
                      )}
                    </td>
                    <td className="gs-td" style={{ fontSize:13, fontWeight:700, color:'#0f3767', whiteSpace:'nowrap' }}>{service.nom}</td>
                    <td className="gs-td">
                      <span style={{ fontSize:11, fontWeight:700, padding:'3px 12px', borderRadius:50, background:'rgba(99,102,241,0.1)', color:'#4338ca', border:'1px solid rgba(99,102,241,0.2)' }}>{service.categorie}</span>
                    </td>
                    <td className="gs-td" style={{ fontSize:12, color:'#94a3b8', maxWidth:160 }}>
                      {service.description ? service.description.substring(0,50)+(service.description.length>50?'…':'') : '—'}
                    </td>
                    <td className="gs-td">
                      <span style={{ fontSize:11, fontWeight:700, padding:'3px 10px', borderRadius:50, background:'rgba(14,165,233,0.1)', color:'#0284c7', border:'1px solid rgba(14,165,233,0.2)' }}>
                        {Array.isArray(service.inclus) ? service.inclus.length : 0} éléments
                      </span>
                    </td>
                    <td className="gs-td" style={{ fontSize:12, color:'#64748b', whiteSpace:'nowrap' }}>{service.duree_estimee||'—'}</td>
                    <td className="gs-td">
                      <span style={{ fontSize:11, fontWeight:700, padding:'3px 12px', borderRadius:50, background:service.actif?'rgba(16,185,129,0.12)':'rgba(148,163,184,0.12)', color:service.actif?'#059669':'#94a3b8', border:`1px solid ${service.actif?'rgba(16,185,129,0.3)':'rgba(148,163,184,0.3)'}` }}>
                        {service.actif ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="gs-td">
                      <div className="gs-actions">
                        <button onClick={() => ouvrirEdition(service)} className="gs-btn-action" style={{ background:'rgba(59,130,246,0.1)', color:'#2563eb', borderColor:'rgba(59,130,246,0.25)' }}>
                          <Pencil size={11} /> Modifier
                        </button>
                        <button onClick={() => toggleActif(service.id)} className="gs-btn-action" style={{ background:service.actif?'rgba(251,146,60,0.1)':'rgba(16,185,129,0.1)', color:service.actif?'#c2410c':'#059669', borderColor:service.actif?'rgba(251,146,60,0.25)':'rgba(16,185,129,0.25)' }}>
                          <Power size={11} /> {service.actif?'Désactiver':'Activer'}
                        </button>
                        <button onClick={() => supprimerService(service.id)} className="gs-btn-action" style={{ background:'rgba(239,68,68,0.1)', color:'#dc2626', borderColor:'rgba(239,68,68,0.25)' }}>
                          <Trash2 size={11} /> Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {services.length === 0 && (
              <div style={{ padding:48, textAlign:'center', color:'#8da2bb', fontSize:14 }}>
                Aucun service créé. Cliquez sur "Ajouter un service" pour commencer.
              </div>
            )}
          </div>
        </div>

        {/* ── Cartes mobiles ── */}
        <div className="gs-cards">
          {services.length === 0 ? (
            <div style={{ padding:48, textAlign:'center', color:'#8da2bb', fontSize:14, background:'rgba(255,255,255,0.6)', borderRadius:16 }}>
              Aucun service. Appuyez sur <Plus size={13} style={{ verticalAlign:'middle' }} /> pour commencer.
            </div>
          ) : (
            services.map(s => <ServiceCard key={s.id} service={s} />)
          )}
        </div>
      </main>

      {/* ════ MODAL ════ */}
      {modalOuvert && (
        <div
          style={{ position:'fixed', inset:0, background:'rgba(15,23,42,0.4)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:100, padding:0, overflowY:'auto' }}
          onClick={e => { if (e.target===e.currentTarget) setModalOuvert(false) }}
        >
          <div className="gs-modal-inner">
            {/* En-tête */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:22 }}>
              <h3 style={{ fontSize:17, fontWeight:800, color:'#0f3767', margin:0 }}>
                {serviceEnEdition ? 'Modifier le service' : 'Ajouter un service'}
              </h3>
              <button onClick={() => setModalOuvert(false)} style={{ background:'rgba(0,0,0,0.05)', border:'none', borderRadius:'50%', width:32, height:32, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
                <X size={15} style={{ color:'#64748b' }} />
              </button>
            </div>

            {/* Nom */}
            <div style={{ marginBottom:14 }}>
              <label className="gs-label">Nom du service *</label>
              <input type="text" className="gs-input" value={formulaire.nom}
                onChange={e => setFormulaire({ ...formulaire, nom: e.target.value })}
                placeholder="Ex: Maintenance informatique" />
            </div>

            {/* Catégorie */}
            <div style={{ marginBottom:14 }}>
              <label className="gs-label">Catégorie *</label>
              <select className="gs-input" value={formulaire.categorie}
                onChange={e => setFormulaire({ ...formulaire, categorie: e.target.value })}
                style={{ cursor:'pointer' }}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* Description */}
            <div style={{ marginBottom:14 }}>
              <label className="gs-label">Description</label>
              <textarea className="gs-input" value={formulaire.description}
                onChange={e => setFormulaire({ ...formulaire, description: e.target.value })}
                placeholder="Décrivez ce service..." rows={3} style={{ resize:'vertical' }} />
            </div>

            {/* Durée */}
            <div style={{ marginBottom:14 }}>
              <label className="gs-label">Durée estimée</label>
              <input type="text" className="gs-input" value={formulaire.dureeEstimee}
                onChange={e => setFormulaire({ ...formulaire, dureeEstimee: e.target.value })}
                placeholder="Ex: ~2h" />
            </div>

            {/* Photo */}
            <div style={{ marginBottom:14 }}>
              <label className="gs-label">
                <span style={{ display:'flex', alignItems:'center', gap:6 }}><Image size={12} /> URL de la photo</span>
              </label>
              <input type="url" className="gs-input" value={formulaire.photo}
                onChange={e => { setFormulaire({ ...formulaire, photo: e.target.value }); setApercuPhoto(false) }}
                placeholder="https://images.unsplash.com/..." />
              {formulaire.photo && (
                <button onClick={() => setApercuPhoto(!apercuPhoto)}
                  style={{ marginTop:8, background:'none', border:'none', color:'#0066ff', fontSize:11, fontWeight:700, cursor:'pointer', fontFamily:'inherit', padding:0 }}>
                  {apercuPhoto ? '▲ Masquer l\'aperçu' : '▼ Voir l\'aperçu'}
                </button>
              )}
              {apercuPhoto && formulaire.photo && (
                <div style={{ marginTop:10, borderRadius:10, overflow:'hidden', border:'1.5px solid rgba(226,236,248,0.9)', height:100 }}>
                  <img src={formulaire.photo} alt="Aperçu" style={{ width:'100%', height:'100%', objectFit:'cover' }}
                    onError={e => { e.target.src=''; setApercuPhoto(false) }} />
                </div>
              )}
            </div>

            {/* Inclus */}
            <div style={{ marginBottom:24 }}>
              <label className="gs-label">
                <span style={{ display:'flex', alignItems:'center', gap:6 }}>
                  Ce qui est inclus
                  <span style={{ fontSize:10, fontWeight:600, color:'#94a3b8', background:'rgba(148,163,184,0.1)', padding:'1px 8px', borderRadius:50 }}>
                    {formulaire.inclus.length} élément{formulaire.inclus.length!==1?'s':''}
                  </span>
                </span>
              </label>

              {formulaire.inclus.length > 0 && (
                <div style={{ marginBottom:10, display:'flex', flexDirection:'column', gap:8 }}>
                  {formulaire.inclus.map((item, index) => (
                    <div key={index} style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:22, height:22, background:'linear-gradient(135deg,#0096c7,#48cae4)', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:800, color:'#fff', flexShrink:0 }}>✓</div>
                      <input type="text" className="gs-input" value={item}
                        onChange={e => modifierInclus(index, e.target.value)}
                        style={{ flex:1, padding:'8px 12px', borderRadius:8, fontSize:12 }} />
                      <button onClick={() => supprimerInclus(index)}
                        style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, width:30, height:30, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0 }}>
                        <Minus size={13} color="#dc2626" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display:'flex', gap:8 }}>
                <input type="text" className="gs-input" value={nouvelInclus}
                  onChange={e => setNouvelInclus(e.target.value)}
                  onKeyDown={handleKeyInclus}
                  placeholder="Ex: Diagnostic complet du matériel"
                  style={{ flex:1, padding:'9px 12px', borderRadius:10, fontSize:12, borderStyle:'dashed' }} />
                <button onClick={ajouterInclus} disabled={!nouvelInclus.trim()}
                  style={{ background:nouvelInclus.trim()?'#0f2942':'rgba(226,232,240,0.9)', color:nouvelInclus.trim()?'#fff':'#94a3b8', border:'none', borderRadius:10, padding:'0 14px', cursor:nouvelInclus.trim()?'pointer':'not-allowed', display:'flex', alignItems:'center', gap:5, fontSize:12, fontWeight:700, fontFamily:'inherit', whiteSpace:'nowrap' }}>
                  <PlusCircle size={14} /> Ajouter
                </button>
              </div>
              <p style={{ fontSize:10.5, color:'#94a3b8', marginTop:6 }}>Entrée ou bouton pour ajouter.</p>
            </div>

            {/* Boutons */}
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setModalOuvert(false)}
                style={{ flex:1, background:'rgba(241,245,249,0.9)', color:'#64748b', border:'none', padding:13, borderRadius:12, fontSize:13, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>
                Annuler
              </button>
              <button onClick={sauvegarder} disabled={enregistrement || !formulaire.nom.trim()}
                style={{ flex:2, background:formulaire.nom.trim()&&!enregistrement?'#0f2942':'rgba(226,232,240,0.9)', color:formulaire.nom.trim()&&!enregistrement?'#fff':'#94a3b8', border:'none', padding:13, borderRadius:12, fontSize:13, fontWeight:800, cursor:formulaire.nom.trim()?'pointer':'not-allowed', fontFamily:'inherit', transition:'background .2s' }}
                onMouseEnter={e => { if (formulaire.nom.trim()&&!enregistrement) e.currentTarget.style.background='#0066ff' }}
                onMouseLeave={e => { if (formulaire.nom.trim()&&!enregistrement) e.currentTarget.style.background='#0f2942' }}>
                {enregistrement ? 'Enregistrement...' : serviceEnEdition ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}