// ============================================
// NOUVELLEDEMANDE.JSX — Redesign premium
// ✅ Style identique à DetailService
// ✅ Formulaire compact, même gabarit
// ✅ Hero sombre avec overlay + halo
// ✅ Stepper élégant intégré
// ✅ Services en petites cartes compactes
// ✅ Icônes lucide-react uniquement
// ✅ Responsive mobile/tablette/desktop
// ============================================

import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import {
  Monitor, Wifi, ShieldCheck, Zap, Home, Wrench,
  ArrowLeft, CheckCircle2, AlertTriangle,
  MapPin, Building2, Navigation, Calendar,
  ChevronRight, Loader2, ClipboardList,
} from 'lucide-react'

const CAT_ICON  = { Informatique: Monitor, Réseau: Wifi, Sécurité: ShieldCheck, Électricité: Zap, Domotique: Home }
const CAT_COLOR = {
  Informatique: { c: '#1d6ef5', bg: '#e8f0fe', bd: '#c5d8fd' },
  Réseau:       { c: '#059669', bg: '#d1fae5', bd: '#6ee7b7' },
  Sécurité:     { c: '#dc2626', bg: '#fee2e2', bd: '#fca5a5' },
  Électricité:  { c: '#d97706', bg: '#fef3c7', bd: '#fcd34d' },
  Domotique:    { c: '#7c3aed', bg: '#ede9fe', bd: '#c4b5fd' },
}

const NouvelleDemande = () => {
  const navigate = useNavigate()
  const [etape, setEtape]               = useState(1)
  const [envoye, setEnvoye]             = useState(false)
  const [envoi, setEnvoi]               = useState(false)
  const [erreur, setErreur]             = useState('')
  const [listeServices, setListeServices] = useState([])
  const [loading, setLoading]           = useState(true)

  const [formulaire, setFormulaire] = useState({
    serviceId: '',
    description: '',
    urgence: 'normal',
    lieu: 'boutique',
    adresse: '',
    dateSouhaitee: '',
  })

  useEffect(() => {
    const charger = async () => {
      try {
        const reponse = await api.get('/services/actifs')
        setListeServices(reponse.data.services)
      } catch (err) {
        console.error('Erreur chargement services :', err)
      } finally {
        setLoading(false)
      }
    }
    charger()
  }, [])

  const handleChange = (e) => setFormulaire({ ...formulaire, [e.target.name]: e.target.value })

  const handleSoumettre = async () => {
    setEnvoi(true)
    setErreur('')
    try {
      await api.post('/demandes', {
        serviceId:     formulaire.serviceId,
        description:   formulaire.description,
        urgence:       formulaire.urgence,
        lieu:          formulaire.lieu,
        adresse:       formulaire.adresse || null,
        dateSouhaitee: formulaire.dateSouhaitee || null,
      })
      setEnvoye(true)
    } catch (err) {
      setErreur(err.response?.data?.message || "Erreur lors de l'envoi.")
    } finally {
      setEnvoi(false)
    }
  }

  const serviceSelectionne = listeServices.find(s => s.id === formulaire.serviceId)

  // ── Confirmation ──────────────────────────────────────
  if (envoye) return (
    <>
      <style>{globalStyles}</style>
      <div className="nd">
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,.07)', borderRadius: 18, padding: '32px 28px', textAlign: 'center', maxWidth: 360, width: '100%' }}>
            <div style={{ width: 52, height: 52, background: 'linear-gradient(135deg,#1d6ef5,#60a5fa)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle2 size={22} strokeWidth={2} color="#fff"/>
            </div>
            <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f1923', marginBottom: 8, letterSpacing: '-.3px', fontFamily: "'Syne',sans-serif" }}>
              Demande envoyée !
            </h2>
            <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.75, marginBottom: 22 }}>
              Votre demande a été soumise avec succès.<br/>
              Un technicien vous sera assigné rapidement.
            </p>
            <button
              onClick={() => navigate('/client/demandes')}
              className="submit-btn"
              style={{ background: 'linear-gradient(135deg,#1340c0 0%,#1d6ef5 55%,#3b82f6 100%)', color: '#fff', boxShadow: '0 6px 20px rgba(29,110,245,.35)', display: 'inline-flex', width: 'auto', padding: '9px 22px' }}
            >
              Voir mes demandes <ChevronRight size={13} strokeWidth={2.5}/>
            </button>
          </div>
        </div>
      </div>
    </>
  )

  return (
    <>
      <style>{globalStyles}</style>
      <div className="nd">

        {/* ── HERO ─────────────────────────────────────── */}
        <div className="nd-hero">
          <div className="nd-hero-halo"/>
          <div className="nd-hero-ov"/>
          <div className="nd-hero-info">
            <button className="nd-back" onClick={() => navigate('/client/dashboard')}>
              <ArrowLeft size={12} strokeWidth={2}/> Tableau de bord
            </button>
            <div className="nd-cat-badge">
              <ClipboardList size={10} strokeWidth={2}/> Nouvelle demande
            </div>
            <div className="nd-title">Soumettre une intervention</div>
            <p className="nd-subtitle">Remplissez les informations pour créer votre demande</p>
          </div>
        </div>

        {/* ── STEPPER ──────────────────────────────────── */}
        <div className="nd-stepper">
          {[
            { num: 1, label: 'Choisir le service' },
            { num: 2, label: 'Détails' },
            { num: 3, label: 'Confirmation' },
          ].map((step, i) => (
            <div key={step.num} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <div className={`step-circle ${etape >= step.num ? 'active' : ''}`}>
                  {etape > step.num ? <CheckCircle2 size={13} strokeWidth={2.5}/> : step.num}
                </div>
                <span className={`step-label ${etape >= step.num ? 'active' : ''}`}>{step.label}</span>
              </div>
              {i < 2 && <div className={`step-line ${etape > step.num ? 'done' : ''}`}/>}
            </div>
          ))}
        </div>

        {/* ── LAYOUT ───────────────────────────────────── */}
        <div className="nd-layout">

          {/* ════ ÉTAPE 1 — Choisir le service ════ */}
          {etape === 1 && (
            <div className="nd-main animate-in">
              <div className="section-head">
                <h2 className="section-title">Quel service souhaitez-vous ?</h2>
                <p className="section-sub">Sélectionnez le type d'intervention</p>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '32px 0' }}>
                  <Loader2 size={22} strokeWidth={2} color="#1d6ef5" style={{ animation: 'spin 1s linear infinite' }}/>
                  <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>Chargement des services…</p>
                </div>
              ) : (
                <div className="services-grid">
                  {listeServices.map(service => {
                    const Ic  = CAT_ICON[service.categorie]  || Wrench
                    const col = CAT_COLOR[service.categorie] || { c: '#1d6ef5', bg: '#e8f0fe', bd: '#c5d8fd' }
                    const selected = formulaire.serviceId === service.id
                    return (
                      <div
                        key={service.id}
                        className={`service-card ${selected ? 'selected' : ''}`}
                        style={{ borderColor: selected ? col.c : 'rgba(0,0,0,.07)' }}
                        onClick={() => setFormulaire({ ...formulaire, serviceId: service.id })}
                      >
                        <div className="svc-ic" style={{ background: col.bg, border: `1px solid ${col.bd}` }}>
                          <Ic size={13} strokeWidth={2} color={col.c}/>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="svc-nom" style={{ color: selected ? col.c : '#0f1923' }}>{service.nom}</div>
                          <div className="svc-cat">{service.categorie}</div>
                        </div>
                        {selected && (
                          <CheckCircle2 size={14} strokeWidth={2} color={col.c} style={{ flexShrink: 0 }}/>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              <button
                className="submit-btn"
                onClick={() => formulaire.serviceId && setEtape(2)}
                disabled={!formulaire.serviceId}
                style={{
                  marginTop: 20,
                  background: formulaire.serviceId
                    ? 'linear-gradient(135deg,#1340c0 0%,#1d6ef5 55%,#3b82f6 100%)'
                    : '#e5e7eb',
                  color: formulaire.serviceId ? '#fff' : '#9ca3af',
                  boxShadow: formulaire.serviceId ? '0 6px 20px rgba(29,110,245,.3)' : 'none',
                  cursor: formulaire.serviceId ? 'pointer' : 'not-allowed',
                }}
              >
                Continuer <ChevronRight size={13} strokeWidth={2.5}/>
              </button>
            </div>
          )}

          {/* ════ ÉTAPE 2 — Détails ════ */}
          {etape === 2 && (
            <div className="nd-main animate-in">
              <div className="section-head">
                <h2 className="section-title">Détails de votre demande</h2>
                <p className="section-sub">Plus vous êtes précis, plus l'intervention sera efficace</p>
              </div>

              {/* Résumé service sélectionné */}
              {serviceSelectionne && (() => {
                const Ic  = CAT_ICON[serviceSelectionne.categorie]  || Wrench
                const col = CAT_COLOR[serviceSelectionne.categorie] || { c: '#1d6ef5', bg: '#e8f0fe', bd: '#c5d8fd' }
                return (
                  <div className="svc-recap" style={{ borderColor: col.bd, background: col.bg }}>
                    <div className="svc-ic" style={{ background: '#fff', border: `1px solid ${col.bd}` }}>
                      <Ic size={13} strokeWidth={2} color={col.c}/>
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: col.c }}>{serviceSelectionne.nom}</div>
                      <div style={{ fontSize: 11, color: '#6b7280' }}>{serviceSelectionne.categorie}</div>
                    </div>
                    <button className="change-btn" onClick={() => setEtape(1)}>Changer</button>
                  </div>
                )
              })()}

              {/* Description */}
              <div className="f-group">
                <label className="f-label">Description du problème *</label>
                <textarea
                  className="f-textarea"
                  name="description"
                  value={formulaire.description}
                  onChange={handleChange}
                  placeholder="Décrivez votre problème en détail…"
                  rows={4}
                />
              </div>

              {/* Urgence */}
              <div className="f-group">
                <label className="f-label">Niveau d'urgence *</label>
                <div className="urg-grid">
                  {[
                    { val: 'normal',   label: 'Normal',   sub: 'Sous 48h',    cls: 'on-g', color: '#059669' },
                    { val: 'urgent',   label: 'Urgent',   sub: 'Sous 24h',    cls: 'on-y', color: '#d97706' },
                    { val: 'critique', label: 'Critique', sub: 'Le plus tôt', cls: 'on-r', color: '#dc2626' },
                  ].map(u => (
                    <div
                      key={u.val}
                      className={`urg-btn ${formulaire.urgence === u.val ? u.cls : ''}`}
                      onClick={() => setFormulaire({ ...formulaire, urgence: u.val })}
                    >
                      <div className="urg-label" style={{ color: formulaire.urgence === u.val ? u.color : '#0f1923' }}>
                        {u.label}
                      </div>
                      <div className="urg-sub">{u.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Lieu */}
              <div className="f-group">
                <label className="f-label">Lieu d'intervention *</label>
                <div className="lieu-grid">
                  {[
                    { val: 'boutique', label: 'En boutique', sub: 'Apportez votre équipement', Icon: Building2 },
                    { val: 'domicile', label: 'À domicile',  sub: 'Le technicien se déplace',  Icon: Navigation },
                  ].map(l => (
                    <div
                      key={l.val}
                      className={`lieu-btn ${formulaire.lieu === l.val ? 'on' : ''}`}
                      onClick={() => setFormulaire({ ...formulaire, lieu: l.val })}
                    >
                      <l.Icon size={15} strokeWidth={1.8} color={formulaire.lieu === l.val ? '#1d6ef5' : '#9ca3af'}/>
                      <div className="lieu-label" style={{ color: formulaire.lieu === l.val ? '#1d6ef5' : '#0f1923' }}>
                        {l.label}
                      </div>
                      <div className="lieu-sub">{l.sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Adresse si domicile */}
              {formulaire.lieu === 'domicile' && (
                <div className="f-group">
                  <label className="f-label">
                    <MapPin size={10} strokeWidth={2} style={{ display: 'inline', marginRight: 4 }}/>
                    Adresse complète *
                  </label>
                  <input
                    className="f-input"
                    type="text" name="adresse"
                    value={formulaire.adresse}
                    onChange={handleChange}
                    placeholder="Votre adresse complète…"
                  />
                </div>
              )}

              {/* Date */}
              <div className="f-group">
                <label className="f-label">
                  <Calendar size={10} strokeWidth={2} style={{ display: 'inline', marginRight: 4 }}/>
                  Date souhaitée
                </label>
                <input
                  className="f-input"
                  type="date" name="dateSouhaitee"
                  value={formulaire.dateSouhaitee}
                  onChange={handleChange}
                />
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button
                  onClick={() => setEtape(1)}
                  className="back-btn"
                >
                  <ArrowLeft size={13} strokeWidth={2}/> Retour
                </button>
                <button
                  className="submit-btn"
                  onClick={() => formulaire.description.trim() && setEtape(3)}
                  disabled={!formulaire.description.trim()}
                  style={{
                    flex: 2,
                    background: formulaire.description.trim()
                      ? 'linear-gradient(135deg,#1340c0 0%,#1d6ef5 55%,#3b82f6 100%)'
                      : '#e5e7eb',
                    color: formulaire.description.trim() ? '#fff' : '#9ca3af',
                    boxShadow: formulaire.description.trim() ? '0 6px 20px rgba(29,110,245,.3)' : 'none',
                    cursor: formulaire.description.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Continuer <ChevronRight size={13} strokeWidth={2.5}/>
                </button>
              </div>
            </div>
          )}

          {/* ════ ÉTAPE 3 — Récapitulatif ════ */}
          {etape === 3 && (
            <div className="nd-main animate-in">
              <div className="section-head">
                <h2 className="section-title">Récapitulatif</h2>
                <p className="section-sub">Vérifiez les informations avant d'envoyer</p>
              </div>

              {erreur && (
                <div className="err-msg">
                  <AlertTriangle size={12} strokeWidth={2}/> {erreur}
                </div>
              )}

              <div className="recap-card">
                {[
                  { label: 'Service',       val: serviceSelectionne?.nom || '—' },
                  { label: 'Description',   val: formulaire.description },
                  { label: 'Urgence',       val: formulaire.urgence.charAt(0).toUpperCase() + formulaire.urgence.slice(1) },
                  { label: 'Lieu',          val: formulaire.lieu === 'boutique' ? 'En boutique' : 'À domicile' },
                  ...(formulaire.adresse ? [{ label: 'Adresse', val: formulaire.adresse }] : []),
                  { label: 'Date souhaitée', val: formulaire.dateSouhaitee || 'Non précisée' },
                ].map((ligne, i, arr) => (
                  <div key={i} className="recap-row" style={{ borderBottom: i < arr.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <span className="recap-label">{ligne.label}</span>
                    <span className="recap-val">{ligne.val}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => setEtape(2)} className="back-btn">
                  <ArrowLeft size={13} strokeWidth={2}/> Modifier
                </button>
                <button
                  className="submit-btn"
                  onClick={handleSoumettre}
                  disabled={envoi}
                  style={{
                    flex: 2,
                    background: envoi ? '#e5e7eb' : 'linear-gradient(135deg,#1340c0 0%,#1d6ef5 55%,#3b82f6 100%)',
                    color: envoi ? '#9ca3af' : '#fff',
                    boxShadow: envoi ? 'none' : '0 6px 20px rgba(29,110,245,.35)',
                    cursor: envoi ? 'not-allowed' : 'pointer',
                  }}
                >
                  {envoi
                    ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }}/> Envoi…</>
                    : <>Envoyer la demande <ChevronRight size={13} strokeWidth={2.5}/></>
                  }
                </button>
              </div>

              <p style={{ fontSize: 11, color: '#9ca3af', textAlign: 'center', marginTop: 10 }}>
                Votre demande sera traitée rapidement
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// ── Styles globaux ────────────────────────────────────────────────────────────
const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --accent:  #1d6ef5;
    --accent2: #60a5fa;
    --ink:     #0f1923;
    --dim:     #4b5563;
    --muted:   #9ca3af;
    --bg:      #f7f8fc;
    --surface: #ffffff;
    --border:  rgba(0,0,0,0.07);
    --r-sm:    8px;
    --r-md:    12px;
    --r-lg:    16px;
  }

  .nd { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--ink); min-height: 100vh; }

  @keyframes spin   { from{transform:rotate(0)} to{transform:rotate(360deg)} }
  @keyframes hPulse { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.7;transform:scale(1.05)} }
  @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }

  .animate-in { animation: fadeUp .38s ease both; }

  /* ── HERO ── */
  .nd-hero {
    position: relative; height: clamp(170px,24vw,240px); overflow: hidden;
    background: linear-gradient(135deg, #021024 0%, #0a2d5c 50%, #021024 100%);
  }
  .nd-hero-halo {
    position: absolute; border-radius: 50%; pointer-events: none; filter: blur(80px);
    width: 400px; height: 400px; top: -140px; right: 40px;
    background: radial-gradient(circle,rgba(29,110,245,.22) 0%,transparent 65%);
    animation: hPulse 7s ease-in-out infinite;
  }
  .nd-hero-ov {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(2,16,36,.95) 0%, rgba(2,16,36,.1) 100%);
  }
  .nd-hero-info {
    position: absolute; bottom: clamp(14px,4vw,26px); left: clamp(16px,5vw,40px);
    animation: fadeUp .5s ease both;
  }
  .nd-back {
    display: inline-flex; align-items: center; gap: 5px;
    background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.18);
    color: rgba(255,255,255,.7); font-size: 11.5px; font-weight: 600;
    padding: 4px 12px; border-radius: 50px; cursor: pointer;
    font-family: 'DM Sans', sans-serif; margin-bottom: 9px; transition: background .15s;
  }
  .nd-back:hover { background: rgba(255,255,255,.16); }
  .nd-cat-badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 50px;
    background: rgba(2,16,36,.7); border: 1px solid rgba(255,255,255,.2);
    color: var(--accent2); margin-bottom: 7px;
  }
  .nd-title {
    font-family: 'Syne', sans-serif;
    font-size: clamp(17px,3.5vw,26px); font-weight: 900; color: #fff; letter-spacing: -.8px;
  }
  .nd-subtitle {
    font-size: 12px; color: rgba(255,255,255,.4); margin-top: 4px;
  }

  /* ── STEPPER ── */
  .nd-stepper {
    background: #fff; padding: 14px clamp(16px,5vw,40px);
    border-bottom: 1px solid #eaecf0;
    display: flex; align-items: center; flex-wrap: wrap; gap: 0;
    overflow-x: auto;
  }
  .step-circle {
    width: 27px; height: 27px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; font-weight: 800; flex-shrink: 0;
    background: #f1f5f9; color: #94a3b8; transition: all .25s;
  }
  .step-circle.active {
    background: linear-gradient(135deg,#1d6ef5,#60a5fa); color: #fff;
  }
  .step-label {
    font-size: 12.5px; font-weight: 600; color: #94a3b8; white-space: nowrap; transition: color .25s;
  }
  .step-label.active { color: #0f1923; }
  .step-line {
    width: clamp(24px,4vw,52px); height: 1.5px; margin: 0 10px;
    background: #e2e8f0; transition: background .25s; flex-shrink: 0;
  }
  .step-line.done { background: var(--accent); }

  /* ── LAYOUT ── */
  .nd-layout {
    padding: clamp(20px,3vw,32px) clamp(16px,5vw,40px);
    max-width: 680px; margin: 0 auto;
  }

  /* ── MAIN CONTENT ── */
  .nd-main {
    background: #fff; border: 1.5px solid var(--border);
    border-radius: var(--r-lg); padding: clamp(18px,3vw,26px);
    box-shadow: 0 1px 8px rgba(0,0,0,.05);
  }
  .section-head { margin-bottom: 18px; }
  .section-title {
    font-family: 'Syne', sans-serif;
    font-size: 16px; font-weight: 800; color: #0f1923; letter-spacing: -.3px;
  }
  .section-sub { font-size: 12px; color: #9ca3af; margin-top: 4px; }

  /* ── SERVICES GRID ── */
  .services-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
    gap: 8px;
    margin-bottom: 4px;
  }
  .service-card {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px; border-radius: var(--r-md);
    border: 1.5px solid var(--border); background: #fff;
    cursor: pointer; transition: all .18s;
  }
  .service-card:hover { border-color: #93c5fd; background: #f0f7ff; }
  .service-card.selected { background: #eff6ff; }
  .svc-ic {
    width: 30px; height: 30px; border-radius: var(--r-sm);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .svc-nom { font-size: 12.5px; font-weight: 700; line-height: 1.3; }
  .svc-cat { font-size: 10.5px; color: #9ca3af; margin-top: 2px; }

  /* ── SERVICE RECAP (étape 2) ── */
  .svc-recap {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 12px; border-radius: var(--r-md);
    border: 1.5px solid; margin-bottom: 16px;
  }
  .change-btn {
    margin-left: auto; font-size: 11px; font-weight: 700; color: var(--accent);
    background: none; border: none; cursor: pointer; font-family: 'DM Sans', sans-serif;
    padding: 0; text-decoration: underline; text-underline-offset: 2px;
  }

  /* ── FORM ELEMENTS ── */
  .f-label {
    font-size: 11px; font-weight: 700; color: var(--ink);
    display: block; margin-bottom: 5px;
  }
  .f-group { margin-bottom: 13px; }

  .f-textarea {
    width: 100%; padding: 8px 10px;
    border: 1.5px solid #e5e7eb; border-radius: var(--r-sm);
    font-size: 12.5px; outline: none; resize: vertical;
    font-family: 'DM Sans', sans-serif; color: var(--ink); background: #fff;
    transition: border-color .15s, box-shadow .15s; min-height: 82px;
  }
  .f-textarea:focus { border-color: #93c5fd; box-shadow: 0 0 0 3px rgba(29,110,245,.08); }

  .f-input {
    width: 100%; padding: 8px 10px;
    border: 1.5px solid #e5e7eb; border-radius: var(--r-sm);
    font-size: 12.5px; outline: none;
    font-family: 'DM Sans', sans-serif; color: var(--ink); background: #fff;
    transition: border-color .15s, box-shadow .15s;
  }
  .f-input:focus { border-color: #93c5fd; box-shadow: 0 0 0 3px rgba(29,110,245,.08); }

  /* urgence pills */
  .urg-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 6px; }
  .urg-btn {
    padding: 8px 4px; border-radius: var(--r-sm); cursor: pointer;
    text-align: center; border: 1.5px solid #e5e7eb; background: #fff; transition: all .15s;
  }
  .urg-btn.on-g { border-color: #059669; background: #d1fae5; }
  .urg-btn.on-y { border-color: #d97706; background: #fef3c7; }
  .urg-btn.on-r { border-color: #dc2626; background: #fee2e2; }
  .urg-label { font-size: 11.5px; font-weight: 700; }
  .urg-sub   { font-size: 10px; color: var(--muted); margin-top: 2px; }

  /* lieu pills */
  .lieu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
  .lieu-btn {
    padding: 10px 8px; border-radius: var(--r-sm); cursor: pointer;
    text-align: center; border: 1.5px solid #e5e7eb; background: #fff;
    transition: all .15s; display: flex; flex-direction: column; align-items: center; gap: 4px;
  }
  .lieu-btn.on { border-color: #93c5fd; background: #eff6ff; }
  .lieu-label { font-size: 11.5px; font-weight: 700; }
  .lieu-sub   { font-size: 10px; color: var(--muted); }

  /* error */
  .err-msg {
    background: #fee2e2; border: 1.5px solid #fca5a5;
    border-radius: var(--r-sm); padding: 9px 12px;
    font-size: 12px; color: #dc2626; font-weight: 600;
    display: flex; align-items: center; gap: 6px; margin-bottom: 14px;
  }

  /* ── RECAP CARD ── */
  .recap-card {
    background: #fafbff; border: 1.5px solid #eaecf0;
    border-radius: var(--r-md); overflow: hidden; margin-bottom: 18px;
  }
  .recap-row {
    padding: 11px 14px;
    display: grid; grid-template-columns: 120px 1fr; gap: 10px;
    align-items: start;
  }
  .recap-label { font-size: 11px; font-weight: 700; color: #9ca3af; padding-top: 1px; }
  .recap-val   { font-size: 12.5px; color: #0f1923; font-weight: 500; line-height: 1.5; word-break: break-word; }

  /* ── BOUTONS ── */
  .submit-btn {
    width: 100%; padding: 10px; border-radius: 50px;
    font-size: 13px; font-weight: 800; cursor: pointer;
    font-family: 'DM Sans', sans-serif; border: none;
    display: flex; align-items: center; justify-content: center; gap: 7px;
    transition: opacity .15s, transform .15s;
  }
  .submit-btn:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
  .submit-btn:disabled { opacity: .55; }

  .back-btn {
    flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px;
    padding: 10px 14px; border-radius: 50px;
    background: #fff; color: #0f1923;
    border: 1.5px solid #e5e7eb; font-size: 13px; font-weight: 700;
    cursor: pointer; font-family: 'DM Sans', sans-serif; transition: background .15s;
  }
  .back-btn:hover { background: #f1f5f9; }

  /* ── RESPONSIVE ── */
  @media (max-width: 520px) {
    .services-grid  { grid-template-columns: 1fr; }
    .urg-grid       { grid-template-columns: 1fr; }
    .nd-stepper     { gap: 4px; }
    .step-line      { width: 18px; margin: 0 6px; }
    .step-label     { display: none; }
  }
  @media (max-width: 360px) {
    .recap-row      { grid-template-columns: 1fr; gap: 3px; }
    .recap-label    { font-size: 10px; }
  }
`

export default NouvelleDemande