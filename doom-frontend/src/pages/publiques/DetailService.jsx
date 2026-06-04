// ============================================
// DETAILSERVICE.JSX — Redesign premium
// ✅ Style cohérent Accueil + Connexion
// ✅ Formulaire compact & joli
// ✅ Hero sombre avec overlay
// ✅ Cartes & boutons petits, bien arrondis
// ✅ Icônes lucide-react uniquement
// ✅ Responsive mobile/tablette/desktop
// ============================================

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import {
  Monitor, Wifi, ShieldCheck, Zap, Home, Wrench,
  Clock, ArrowLeft, CheckCircle2, AlertTriangle, Lock,
  MapPin, Building2, Navigation, Calendar, ChevronRight,
  Loader2,
} from 'lucide-react'

const CAT_ICON  = { Informatique: Monitor, Réseau: Wifi, Sécurité: ShieldCheck, Électricité: Zap, Domotique: Home }
const CAT_COLOR = {
  Informatique: { c: '#1d6ef5', bg: '#e8f0fe', bd: '#c5d8fd' },
  Réseau:       { c: '#059669', bg: '#d1fae5', bd: '#6ee7b7' },
  Sécurité:     { c: '#dc2626', bg: '#fee2e2', bd: '#fca5a5' },
  Électricité:  { c: '#d97706', bg: '#fef3c7', bd: '#fcd34d' },
  Domotique:    { c: '#7c3aed', bg: '#ede9fe', bd: '#c4b5fd' },
}

const estConnecte = () => !!localStorage.getItem('doom_token')

export default function DetailService() {
  const { id }   = useParams()
  const navigate = useNavigate()

  const [service,   setService]   = useState(null)
  const [loading,   setLoading]   = useState(true)
  const [erreurBDD, setErreurBDD] = useState('')

  const [form, setForm] = useState({
    description: '', urgence: 'normal', lieu: 'boutique',
    adresse: '', dateSouhaitee: '',
  })
  const [envoi,  setEnvoi]  = useState(false)
  const [envoye, setEnvoye] = useState(false)
  const [erreur, setErreur] = useState('')

  useEffect(() => {
    api.get(`/services/${id}`)
      .then(r => setService(r.data.service))
      .catch(e => setErreurBDD(e.response?.status === 404 ? 'introuvable' : 'erreur'))
      .finally(() => setLoading(false))
  }, [id])

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async () => {
    if (!estConnecte()) {
      sessionStorage.setItem('redirect_after_login', window.location.pathname)
      navigate('/connexion')
      return
    }
    if (!form.description.trim()) { setErreur('Veuillez décrire votre problème.'); return }
    setEnvoi(true); setErreur('')
    try {
      await api.post('/demandes', {
        serviceId: service.id, description: form.description,
        urgence: form.urgence, lieu: form.lieu,
        adresse: form.adresse || null, dateSouhaitee: form.dateSouhaitee || null,
      })
      setEnvoye(true)
    } catch (e) {
      if (e.response?.status === 401) { localStorage.removeItem('doom_token'); navigate('/connexion'); return }
      setErreur(e.response?.data?.message || "Erreur lors de l'envoi.")
    } finally {
      setEnvoi(false)
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f7f8fc', fontFamily: "'DM Sans',sans-serif" }}>
      <div style={{ textAlign: 'center' }}>
        <Loader2 size={26} strokeWidth={2} color="#1d6ef5" style={{ animation: 'spin 1s linear infinite', marginBottom: 10 }}/>
        <p style={{ fontSize: 13, color: '#9ca3af' }}>Chargement…</p>
        <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  if (erreurBDD || !service) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12, background: '#f7f8fc', fontFamily: "'DM Sans',sans-serif" }}>
      <AlertTriangle size={34} strokeWidth={1.5} color="#9ca3af"/>
      <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0f1923' }}>Service introuvable</h2>
      <p style={{ fontSize: 13, color: '#6b7280' }}>Ce service n'existe pas ou a été supprimé.</p>
      <button onClick={() => navigate('/services')} style={{ padding: '7px 18px', borderRadius: 50, background: '#1d6ef5', color: '#fff', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
        Retour aux services
      </button>
    </div>
  )

  if (envoye) return (
    <div style={{ minHeight: '100vh', background: '#f7f8fc', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans',sans-serif", padding: 16 }}>
      <div style={{ background: '#fff', border: '1.5px solid rgba(0,0,0,.07)', borderRadius: 18, padding: '32px 28px', textAlign: 'center', maxWidth: 360, width: '100%' }}>
        <div style={{ width: 50, height: 50, background: 'linear-gradient(135deg,#1d6ef5,#60a5fa)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <CheckCircle2 size={22} strokeWidth={2} color="#fff"/>
        </div>
        <h2 style={{ fontSize: 17, fontWeight: 800, color: '#0f1923', marginBottom: 7, letterSpacing: '-.3px' }}>Demande envoyée !</h2>
        <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7, marginBottom: 20 }}>
          Votre demande pour <strong>{service.nom}</strong> a été soumise.<br/>
          Un technicien vous sera assigné rapidement.
        </p>
        <button onClick={() => navigate('/client/demandes')} style={{ padding: '8px 20px', borderRadius: 50, background: 'linear-gradient(135deg,#1d6ef5,#60a5fa)', color: '#fff', border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
          Voir mes demandes
        </button>
      </div>
    </div>
  )

  const Ic  = CAT_ICON[service.categorie]  || Wrench
  const col = CAT_COLOR[service.categorie] || { c: '#1d6ef5', bg: '#e8f0fe', bd: '#c5d8fd' }
  const inclus    = Array.isArray(service.inclus) ? service.inclus : []
  const connecte  = estConnecte()

  return (
    <>
      <style>{`
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

        .ds { font-family: 'DM Sans', sans-serif; background: var(--bg); color: var(--ink); }

        @keyframes spin    { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes hPulse  { 0%,100%{opacity:.4;transform:scale(1)} 50%{opacity:.7;transform:scale(1.05)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }

        /* ── HERO ── */
        .ds-hero {
          position: relative; height: clamp(190px,28vw,270px); overflow: hidden;
          background: #021024;
        }
        .ds-hero img { width: 100%; height: 100%; object-fit: cover; filter: brightness(.35); }
        .ds-hero-ov {
          position: absolute; inset: 0;
          background: linear-gradient(to top,rgba(2,16,36,.96) 0%,rgba(2,16,36,.25) 100%);
        }
        .ds-hero-halo {
          position: absolute; border-radius: 50%; pointer-events: none; filter: blur(70px);
          width: 350px; height: 350px; top: -120px; right: 60px;
          background: radial-gradient(circle,rgba(29,110,245,.18) 0%,transparent 65%);
          animation: hPulse 7s ease-in-out infinite;
        }
        .ds-hero-info {
          position: absolute; bottom: clamp(14px,4vw,26px); left: clamp(16px,5vw,40px);
          animation: fadeUp .5s ease both;
        }
        .ds-back {
          display: inline-flex; align-items: center; gap: 5px;
          background: rgba(255,255,255,.1); border: 1px solid rgba(255,255,255,.18);
          color: rgba(255,255,255,.7); font-size: 11.5px; font-weight: 600;
          padding: 4px 12px; border-radius: 50px; cursor: pointer;
          font-family: 'DM Sans', sans-serif; margin-bottom: 9px; transition: background .15s;
        }
        .ds-back:hover { background: rgba(255,255,255,.16); }
        .ds-cat-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 50px;
          background: rgba(2,16,36,.7); border: 1px solid rgba(255,255,255,.2); margin-bottom: 7px;
        }
        .ds-svc-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(18px,4vw,28px); font-weight: 900; color: #fff; letter-spacing: -.8px;
        }

        /* ── LAYOUT ── */
        .ds-layout {
          display: grid; grid-template-columns: 1fr 340px; gap: 18px;
          padding: clamp(14px,3vw,28px) clamp(16px,5vw,40px);
          max-width: 1060px; margin: 0 auto; align-items: start;
        }

        /* ── CARDS ── */
        .ds-card {
          background: #fff; border: 1.5px solid var(--border);
          border-radius: var(--r-lg); overflow: hidden; margin-bottom: 12px;
          box-shadow: 0 1px 6px rgba(0,0,0,.04);
        }
        .ds-card-head {
          padding: 11px 14px; border-bottom: 1px solid #f3f4f6;
          display: flex; align-items: center; gap: 8px; background: #fafbff;
        }
        .ds-card-head-ic {
          width: 26px; height: 26px; border-radius: var(--r-sm);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .ds-card-head-t { font-size: 12.5px; font-weight: 700; color: var(--ink); }
        .ds-card-body { padding: 13px 14px; }
        .desc-text { font-size: 13px; color: var(--dim); line-height: 1.75; }

        .inclus-item {
          display: flex; align-items: center; gap: 9px; padding: 7px 0;
          border-bottom: 1px solid #f9fafb;
        }
        .inclus-item:last-child { border-bottom: none; }
        .inclus-dot {
          width: 18px; height: 18px; background: linear-gradient(135deg,#1d6ef5,#60a5fa);
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          font-size: 9px; color: #fff; font-weight: 800; flex-shrink: 0;
        }

        .dur-banner {
          background: radial-gradient(ellipse 120% 80% at 50% 0%,#0a2d5c 0%,#042050 40%,#021024 100%);
          border-radius: var(--r-lg); padding: 13px 14px;
          display: flex; align-items: center; gap: 11px;
          border: 1px solid rgba(29,110,245,.2);
        }
        .dur-ic {
          width: 36px; height: 36px; background: rgba(96,165,250,.12);
          border: 1px solid rgba(96,165,250,.2); border-radius: var(--r-sm);
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }

        /* ── FORM CARD ── */
        .form-card {
          background: #fff; border: 1.5px solid var(--border);
          border-radius: var(--r-lg); padding: 18px;
          box-shadow: 0 1px 6px rgba(0,0,0,.04);
          position: sticky; top: 72px;
        }

        /* form elements */
        .f-label { font-size: 11px; font-weight: 700; color: var(--ink); display: block; margin-bottom: 5px; }
        .f-group { margin-bottom: 13px; }

        .f-textarea {
          width: 100%; padding: 8px 10px;
          border: 1.5px solid #e5e7eb; border-radius: var(--r-sm);
          font-size: 12.5px; outline: none; resize: vertical;
          font-family: 'DM Sans', sans-serif; color: var(--ink); background: #fff;
          transition: border-color .15s, box-shadow .15s; min-height: 78px;
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
        .urg-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 5px; }
        .urg-btn {
          padding: 7px 4px; border-radius: var(--r-sm); cursor: pointer;
          text-align: center; border: 1.5px solid #e5e7eb; background: #fff; transition: all .15s;
        }
        .urg-btn.on-g { border-color: #059669; background: #d1fae5; }
        .urg-btn.on-y { border-color: #d97706; background: #fef3c7; }
        .urg-btn.on-r { border-color: #dc2626; background: #fee2e2; }
        .urg-label { font-size: 11px; font-weight: 700; }
        .urg-sub   { font-size: 9.5px; color: var(--muted); margin-top: 1px; }

        /* lieu pills */
        .lieu-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; }
        .lieu-btn {
          padding: 9px 7px; border-radius: var(--r-sm); cursor: pointer;
          text-align: center; border: 1.5px solid #e5e7eb; background: #fff;
          transition: all .15s; display: flex; flex-direction: column; align-items: center; gap: 4px;
        }
        .lieu-btn.on { border-color: #93c5fd; background: #eff6ff; }
        .lieu-label { font-size: 11px; font-weight: 700; }
        .lieu-sub   { font-size: 9.5px; color: var(--muted); }

        /* banners */
        .not-conn {
          background: #fff7ed; border: 1.5px solid #fed7aa;
          border-radius: var(--r-sm); padding: 9px 11px; margin-bottom: 11px;
          display: flex; align-items: flex-start; gap: 7px;
        }
        .err-msg {
          background: #fee2e2; border: 1.5px solid #fca5a5;
          border-radius: var(--r-sm); padding: 8px 11px;
          font-size: 12px; color: #dc2626; font-weight: 600;
          display: flex; align-items: center; gap: 6px; margin-bottom: 11px;
        }

        /* submit */
        .submit-btn {
          width: 100%; padding: 10px; border-radius: 50px;
          font-size: 13px; font-weight: 800; cursor: pointer;
          font-family: 'DM Sans', sans-serif; border: none;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: opacity .15s, transform .15s;
        }
        .submit-btn:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
        .submit-btn:disabled { opacity: .5; cursor: not-allowed; }

        /* ── RESPONSIVE ── */
        @media (max-width: 860px) {
          .ds-layout { grid-template-columns: 1fr; }
          .form-card  { position: static; }
        }
        @media (max-width: 480px) {
          .urg-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ds">

        {/* ── HERO ── */}
        <div className="ds-hero">
          <div className="ds-hero-halo"/>
          <img
            src={service.photo || 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1200&q=80'}
            alt={service.nom}
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=1200&q=80' }}
          />
          <div className="ds-hero-ov"/>
          <div className="ds-hero-info">
            <button className="ds-back" onClick={() => navigate('/services')}>
              <ArrowLeft size={12} strokeWidth={2}/> Services
            </button>
            <div className="ds-cat-badge" style={{ color: col.c }}>
              <Ic size={10} strokeWidth={2}/> {service.categorie}
            </div>
            <div className="ds-svc-title">{service.nom}</div>
          </div>
        </div>

        {/* ── LAYOUT ── */}
        <div className="ds-layout">

          {/* ── GAUCHE ── */}
          <div>
            {/* Description */}
            <div className="ds-card">
              <div className="ds-card-head">
                <div className="ds-card-head-ic" style={{ background: col.bg, border: `1px solid ${col.bd}` }}>
                  <Ic size={12} strokeWidth={2} color={col.c}/>
                </div>
                <span className="ds-card-head-t">À propos de ce service</span>
              </div>
              <div className="ds-card-body">
                <p className="desc-text">{service.description || 'Aucune description disponible.'}</p>
              </div>
            </div>

            {/* Ce qui est inclus */}
            {inclus.length > 0 && (
              <div className="ds-card">
                <div className="ds-card-head">
                  <div className="ds-card-head-ic" style={{ background: '#e8f0fe', border: '1px solid #c5d8fd' }}>
                    <CheckCircle2 size={12} strokeWidth={2} color="#1d6ef5"/>
                  </div>
                  <span className="ds-card-head-t">Ce qui est inclus</span>
                </div>
                <div className="ds-card-body">
                  {inclus.map((item, i) => (
                    <div key={i} className="inclus-item">
                      <div className="inclus-dot">✓</div>
                      <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Durée */}
            <div className="dur-banner">
              <div className="dur-ic">
                <Clock size={17} strokeWidth={2} color="#93c5fd"/>
              </div>
              <div>
                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,.4)', marginBottom: 2 }}>Durée estimée</div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#93c5fd' }}>{service.duree_estimee || 'Sur devis'}</div>
              </div>
            </div>
          </div>

          {/* ── DROITE : FORMULAIRE ── */}
          <div className="form-card">
            <h2 style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--ink)', marginBottom: 3, letterSpacing: '-.2px' }}>
              Demander ce service
            </h2>
            <p style={{ fontSize: '11px', color: 'var(--muted)', marginBottom: 14 }}>
              Plus vous êtes précis, plus l'intervention sera efficace
            </p>

            {!connecte && (
              <div className="not-conn">
                <Lock size={13} strokeWidth={2} color="#b45309" style={{ flexShrink: 0, marginTop: 1 }}/>
                <div>
                  <div style={{ fontSize: 11.5, fontWeight: 700, color: '#b45309', marginBottom: 2 }}>Connexion requise</div>
                  <span style={{ fontSize: 11, color: '#92400e' }}>
                    <span style={{ cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }} onClick={() => navigate('/connexion')}>
                      Connectez-vous
                    </span>{' '}pour soumettre une demande
                  </span>
                </div>
              </div>
            )}

            {erreur && (
              <div className="err-msg">
                <AlertTriangle size={12} strokeWidth={2}/> {erreur}
              </div>
            )}

            {/* Description */}
            <div className="f-group">
              <label className="f-label">Description du problème *</label>
              <textarea
                className="f-textarea"
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Décrivez votre problème…"
                rows={3}
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
                    className={`urg-btn ${form.urgence === u.val ? u.cls : ''}`}
                    onClick={() => setForm({ ...form, urgence: u.val })}
                  >
                    <div className="urg-label" style={{ color: form.urgence === u.val ? u.color : 'var(--ink)' }}>
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
                    className={`lieu-btn ${form.lieu === l.val ? 'on' : ''}`}
                    onClick={() => setForm({ ...form, lieu: l.val })}
                  >
                    <l.Icon size={15} strokeWidth={1.8} color={form.lieu === l.val ? '#1d6ef5' : '#9ca3af'}/>
                    <div className="lieu-label" style={{ color: form.lieu === l.val ? '#1d6ef5' : 'var(--ink)' }}>
                      {l.label}
                    </div>
                    <div className="lieu-sub">{l.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Adresse si domicile */}
            {form.lieu === 'domicile' && (
              <div className="f-group">
                <label className="f-label">
                  <MapPin size={10} strokeWidth={2} style={{ display: 'inline', marginRight: 4 }}/>
                  Adresse complète *
                </label>
                <input
                  className="f-input"
                  type="text" name="adresse"
                  value={form.adresse} onChange={handleChange}
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
                value={form.dateSouhaitee} onChange={handleChange}
              />
            </div>

            {/* Bouton */}
            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={envoi}
              style={{
                background: envoi
                  ? '#e5e7eb'
                  : 'linear-gradient(135deg,#1340c0 0%,#1d6ef5 55%,#3b82f6 100%)',
                color: envoi ? '#9ca3af' : '#fff',
                boxShadow: envoi ? 'none' : '0 6px 20px rgba(29,110,245,.35)',
              }}
            >
              {envoi
                ? <><Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }}/> Envoi…</>
                : <>{connecte ? 'Envoyer la demande' : 'Se connecter pour envoyer'} <ChevronRight size={13} strokeWidth={2.5}/></>
              }
            </button>

            <p style={{ fontSize: '11px', color: 'var(--muted)', textAlign: 'center', marginTop: 9 }}>
              {connecte ? 'Votre demande sera traitée rapidement' : 'Connexion requise pour soumettre'}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}