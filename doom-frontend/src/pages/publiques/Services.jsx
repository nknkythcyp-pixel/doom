// ============================================
// SERVICES.JSX — Full dark premium
// Style entièrement sombre comme Connexion
// Glassmorphism, halos, circuits animés
// Filtres, slider, responsive complet
// ============================================

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import {
  Search, Monitor, Wifi, ShieldCheck, Zap, Home, Wrench,
  ChevronLeft, ChevronRight, Clock, ArrowRight, X, SlidersHorizontal,
} from 'lucide-react'

const CAT_ICON = {
  Informatique: Monitor, Réseau: Wifi, Sécurité: ShieldCheck,
  Électricité: Zap, Domotique: Home,
}
const CAT_COLOR = {
  Informatique: { c: '#60a5fa', bg: 'rgba(37,99,235,0.2)',  bd: 'rgba(96,165,250,0.3)' },
  Réseau:       { c: '#34d399', bg: 'rgba(5,150,105,0.2)',  bd: 'rgba(52,211,153,0.3)' },
  Sécurité:     { c: '#f87171', bg: 'rgba(220,38,38,0.2)',  bd: 'rgba(248,113,113,0.3)' },
  Électricité:  { c: '#fbbf24', bg: 'rgba(217,119,6,0.2)',  bd: 'rgba(251,191,36,0.3)' },
  Domotique:    { c: '#a78bfa', bg: 'rgba(124,58,237,0.2)', bd: 'rgba(167,139,250,0.3)' },
}
const CATS    = ['Tous', 'Informatique', 'Réseau', 'Sécurité', 'Électricité', 'Domotique']
const VISIBLE = 3

export default function Services() {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [erreur,   setErreur]   = useState('')
  const [query,    setQuery]    = useState('')
  const [cat,      setCat]      = useState('Tous')
  const [slide,    setSlide]    = useState(0)

  useEffect(() => {
    api.get('/services/actifs')
      .then(r => setServices(r.data.services || []))
      .catch(() => setErreur('Impossible de charger les services'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = services.filter(s =>
    (cat === 'Tous' || s.categorie === cat) &&
    (!query || s.nom.toLowerCase().includes(query.toLowerCase()) || (s.description || '').toLowerCase().includes(query.toLowerCase()))
  )
  const maxSlide = Math.max(0, filtered.length - VISIBLE)
  useEffect(() => setSlide(0), [cat, query])
  const prev = useCallback(() => setSlide(s => Math.max(0, s - 1)), [])
  const next = useCallback(() => setSlide(s => Math.min(maxSlide, s + 1)), [maxSlide])

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .sv {
          font-family: 'DM Sans', sans-serif;
          background: radial-gradient(ellipse 120% 80% at 50% 0%, #0a2d5c 0%, #042050 25%, #021024 55%, #010e1d 100%);
          color: #C1E8FF; min-height: 100vh;
        }

        @keyframes spin    { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes hPulse  { 0%,100%{opacity:.35;transform:scale(1)} 50%{opacity:.65;transform:scale(1.06)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gDot    { 0%,100%{opacity:.3} 50%{opacity:1} }
        @keyframes circ1   { from{stroke-dashoffset:400} to{stroke-dashoffset:0} }
        @keyframes circ2   { from{stroke-dashoffset:300} to{stroke-dashoffset:0} }

        .halo { position: absolute; border-radius: 50%; pointer-events: none; filter: blur(80px); animation: hPulse 8s ease-in-out infinite; }
        .circuits { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }

        /* HEADER */
        .sv-head {
          position: relative; overflow: hidden;
          padding: clamp(36px,6vw,64px) clamp(16px,6vw,64px) clamp(28px,4vw,48px);
          min-height: clamp(280px,35vh,380px);
          display: flex; align-items: center;
        }
        .sv-head-in { max-width: 1100px; margin: 0 auto; position: relative; z-index: 2; width: 100%; }

        .sv-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(29,110,245,.15); border: 1px solid rgba(96,165,250,.3);
          color: #93c5fd; font-size: 10px; font-weight: 700;
          padding: 4px 13px; border-radius: 50px; margin-bottom: 14px;
          letter-spacing: 1px; text-transform: uppercase;
          animation: fadeUp .5s ease both;
        }
        .sv-bdot { width: 6px; height: 6px; border-radius: 50%; background: #60a5fa; box-shadow: 0 0 8px #60a5fa; flex-shrink: 0; animation: hPulse 2s ease-in-out infinite; }

        .sv-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(24px,5vw,52px); font-weight: 900;
          color: #fff; letter-spacing: -1.5px; margin-bottom: 8px;
          animation: fadeUp .5s ease .1s both;
        }
        .sv-title span {
          background: linear-gradient(90deg,#60a5fa,#93c5fd);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .sv-sub { font-size: 13px; color: rgba(193,232,255,.45); margin-bottom: 22px; animation: fadeUp .5s ease .2s both; }

        /* searchbar */
        .sv-srch {
          display: flex; align-items: center; max-width: 380px;
          background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.14);
          border-radius: 50px; overflow: hidden; backdrop-filter: blur(12px);
          transition: border-color .2s, box-shadow .2s;
          animation: fadeUp .5s ease .3s both;
        }
        .sv-srch:focus-within { border-color: rgba(96,165,250,.6); box-shadow: 0 0 0 3px rgba(29,110,245,.15); }
        .sv-srch-ic { padding: 0 12px; display: flex; align-items: center; flex-shrink: 0; }
        .sv-srch input {
          flex: 1; border: none; outline: none; background: transparent;
          padding: 10px 0; font-size: 13px; color: #C1E8FF;
          font-family: 'DM Sans', sans-serif; min-width: 0;
        }
        .sv-srch input::placeholder { color: rgba(193,232,255,.3); }
        .sv-srch-x { padding: 0 11px; display: flex; align-items: center; background: none; border: none; cursor: pointer; color: rgba(193,232,255,.4); flex-shrink: 0; transition: color .15s; }
        .sv-srch-x:hover { color: #C1E8FF; }

        /* FILTERS BAR */
        .sv-filters {
          background: rgba(5,38,89,.6); backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(125,160,202,.12);
          padding: 10px clamp(16px,6vw,64px);
        }
        .sv-filters-in { max-width: 1100px; margin: 0 auto; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .filter-lbl { display: flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 700; color: rgba(193,232,255,.45); text-transform: uppercase; letter-spacing: 1px; flex-shrink: 0; }

        .cat-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 4px 12px; border-radius: 50px;
          border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.05);
          backdrop-filter: blur(8px); color: rgba(193,232,255,.6);
          font-size: 12px; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all .15s; white-space: nowrap;
        }
        .cat-btn:hover { border-color: rgba(96,165,250,.4); color: #93c5fd; }
        .cat-btn.on { background: rgba(29,110,245,.2); border-color: rgba(96,165,250,.5); color: #93c5fd; }
        .count-badge { margin-left: auto; font-size: 11px; color: rgba(193,232,255,.35); font-weight: 500; white-space: nowrap; flex-shrink: 0; }

        /* MAIN */
        .sv-main { padding: clamp(28px,4vw,48px) clamp(16px,6vw,64px); }
        .sv-main-in { max-width: 1100px; margin: 0 auto; }

        /* error */
        .err-box {
          background: rgba(220,38,38,.15); border: 1px solid rgba(248,113,113,.3);
          border-radius: 12px; padding: 12px 14px;
          font-size: 13px; color: #f87171; font-weight: 600;
          display: flex; align-items: center; gap: 8px; margin-bottom: 16px;
          backdrop-filter: blur(8px);
        }

        /* loader */
        .loader { text-align: center; padding: 48px 0; }
        .spinner { width: 24px; height: 24px; border: 2.5px solid rgba(255,255,255,.1); border-top: 2.5px solid #60a5fa; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px; }

        /* carousel */
        .car-wrap { overflow: hidden; border-radius: 16px; }
        .car-track { display: flex; gap: 13px; transition: transform .4s cubic-bezier(.25,.8,.25,1); }

        /* service card */
        .svc-card {
          flex: 0 0 calc((100% - 26px) / 3);
          background: rgba(5,38,89,.4); border: 1px solid rgba(125,160,202,.15);
          border-radius: 16px; overflow: hidden; cursor: pointer;
          transition: all .22s cubic-bezier(.25,.8,.25,1);
          backdrop-filter: blur(16px); box-shadow: 0 4px 20px rgba(2,16,36,.4);
        }
        .svc-card:hover {
          border-color: rgba(96,165,250,.4); transform: translateY(-4px);
          box-shadow: 0 16px 44px rgba(29,110,245,.22), inset 0 1px 0 rgba(255,255,255,.08);
        }
        .svc-img { height: 130px; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; }
        .svc-img-ov { position: absolute; inset: 0; background: linear-gradient(to top,rgba(2,16,36,.88) 0%,rgba(2,16,36,.2) 100%); }
        .svc-badge {
          position: absolute; top: 8px; left: 8px;
          display: inline-flex; align-items: center; gap: 4px;
          font-size: 9.5px; font-weight: 700; padding: 3px 9px; border-radius: 50px;
          background: rgba(2,16,36,.75); border: 1px solid rgba(255,255,255,.15);
          backdrop-filter: blur(8px);
        }
        .svc-body { padding: 13px 14px 15px; }
        .svc-name { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 5px; letter-spacing: -.2px; }
        .svc-desc { font-size: 11.5px; color: rgba(193,232,255,.45); line-height: 1.6; margin-bottom: 12px; }
        .svc-foot { display: flex; align-items: center; justify-content: space-between; padding-top: 10px; border-top: 1px solid rgba(255,255,255,.06); }
        .svc-dur { font-size: 11px; color: rgba(193,232,255,.35); display: flex; align-items: center; gap: 4px; }
        .svc-cta { font-size: 11.5px; font-weight: 700; color: #60a5fa; display: flex; align-items: center; gap: 3px; transition: gap .15s; }
        .svc-card:hover .svc-cta { gap: 6px; }

        /* controls */
        .car-ctrl { display: flex; align-items: center; gap: 7px; margin-top: 18px; }
        .car-btn {
          width: 30px; height: 30px; border-radius: 50%;
          border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.06);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all .15s; color: rgba(193,232,255,.6); backdrop-filter: blur(8px);
        }
        .car-btn:hover:not(:disabled) { border-color: rgba(96,165,250,.5); color: #93c5fd; background: rgba(29,110,245,.15); }
        .car-btn:disabled { opacity: .25; cursor: not-allowed; }
        .dots { display: flex; gap: 4px; }
        .dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.2); cursor: pointer; transition: all .2s; }
        .dot.on { width: 14px; border-radius: 3px; background: #60a5fa; }
        .car-count { margin-left: auto; font-size: 11.5px; color: rgba(193,232,255,.35); }

        /* empty */
        .empty { text-align: center; padding: 56px 20px; background: rgba(5,38,89,.3); border-radius: 16px; border: 1px solid rgba(125,160,202,.12); backdrop-filter: blur(12px); }
        .empty-ic { display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: rgba(29,110,245,.12); border: 1px solid rgba(96,165,250,.2); border-radius: 12px; margin-bottom: 12px; }

        @media (max-width: 900px) {
          .svc-card { flex: 0 0 calc((100% - 13px) / 2); }
        }
        @media (max-width: 620px) {
          .svc-card { flex: 0 0 82%; }
          .cat-btn span { display: none; }
          .count-badge { display: none; }
        }
        @media (max-width: 380px) {
          .svc-card { flex: 0 0 92%; }
        }
      `}</style>

      <div className="sv">

        {/* HEADER SOMBRE */}
        <section className="sv-head">
          <div className="halo" style={{ width:500, height:500, top:-180, left:'50%', transform:'translateX(-50%)', background:'radial-gradient(circle,rgba(29,110,245,.22) 0%,transparent 65%)', animationDelay:'0s' }}/>
          <div className="halo" style={{ width:220, height:220, bottom:-60, right:60, background:'radial-gradient(circle,rgba(29,78,216,.12) 0%,transparent 70%)', animationDelay:'2s' }}/>

          {/* Circuits */}
          <div className="circuits">
            <svg width="100%" height="100%" viewBox="0 0 1200 380" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <g stroke="rgba(29,110,245,0.2)" strokeWidth="1.5" fill="none">
                <path d="M0,300 L70,300 L70,250 L140,250 L140,200 L220,200" strokeDasharray="380" strokeDashoffset="380" style={{animation:'circ1 3s ease .5s forwards'}}/>
                <circle cx="70"  cy="300" r="4" fill="rgba(29,110,245,.55)" style={{animation:'gDot 2s ease-in-out 1s infinite'}}/>
                <circle cx="140" cy="250" r="3" fill="rgba(96,165,250,.45)" style={{animation:'gDot 2s ease-in-out 1.3s infinite'}}/>
                <circle cx="220" cy="200" r="4" fill="rgba(29,110,245,.5)" style={{animation:'gDot 2.5s ease-in-out .5s infinite'}}/>
              </g>
              <g stroke="rgba(29,110,245,0.18)" strokeWidth="1.5" fill="none">
                <path d="M1200,80 L1130,80 L1130,130 L1060,130 L1060,180 L970,180" strokeDasharray="340" strokeDashoffset="340" style={{animation:'circ1 3s ease 1s forwards'}}/>
                <path d="M1200,45 L1160,45 L1160,95 L1090,95 L1090,150 L1010,150 L1010,200 L915,200" strokeDasharray="270" strokeDashoffset="270" style={{animation:'circ2 3s ease 1.2s forwards'}}/>
                <circle cx="1130" cy="80"  r="4" fill="rgba(29,110,245,.5)" style={{animation:'gDot 2s ease-in-out .8s infinite'}}/>
                <circle cx="1060" cy="130" r="3" fill="rgba(96,165,250,.4)" style={{animation:'gDot 2.5s ease-in-out 1.1s infinite'}}/>
                <circle cx="970"  cy="180" r="4" fill="rgba(29,110,245,.5)" style={{animation:'gDot 2s ease-in-out .4s infinite'}}/>
              </g>
            </svg>
          </div>

          <div className="sv-head-in">
            <div className="sv-badge">
              <span className="sv-bdot"/> Catalogue
            </div>
            <h1 className="sv-title">
              Tous nos <span>services</span>
            </h1>
            <p className="sv-sub">Trouvez l'intervention dont vous avez besoin</p>

            <div className="sv-srch">
              <div className="sv-srch-ic"><Search size={13} color="rgba(193,232,255,.38)" strokeWidth={2}/></div>
              <input type="text" placeholder="Rechercher un service…" value={query} onChange={e => setQuery(e.target.value)}/>
              {query && (
                <button className="sv-srch-x" onClick={() => setQuery('')}>
                  <X size={13} strokeWidth={2.5}/>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* FILTRES */}
        <div className="sv-filters">
          <div className="sv-filters-in">
            <span className="filter-lbl">
              <SlidersHorizontal size={11} strokeWidth={2}/> Filtrer
            </span>
            {CATS.map(c => {
              const Ic = CAT_ICON[c]
              return (
                <button key={c} className={`cat-btn ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>
                  {Ic && <Ic size={11} strokeWidth={2}/>}
                  <span>{c}</span>
                </button>
              )
            })}
            <span className="count-badge">{filtered.length} service{filtered.length > 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* CONTENU */}
        <div className="sv-main">
          <div className="sv-main-in">

            {erreur && (
              <div className="err-box">
                <ShieldCheck size={14} strokeWidth={2}/> {erreur}
              </div>
            )}

            {loading ? (
              <div className="loader">
                <div className="spinner"/>
                <p style={{ fontSize:13, color:'rgba(193,232,255,.4)' }}>Chargement des services…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty">
                <div className="empty-ic"><Search size={20} strokeWidth={1.8} color="rgba(193,232,255,.4)"/></div>
                <h3 style={{ fontSize:14, fontWeight:700, color:'#fff', marginBottom:6 }}>Aucun service trouvé</h3>
                <p style={{ fontSize:12, color:'rgba(193,232,255,.4)', marginBottom:14 }}>Essayez un autre mot-clé ou catégorie</p>
                <button onClick={() => { setQuery(''); setCat('Tous') }}
                  style={{ padding:'7px 18px', borderRadius:50, background:'linear-gradient(135deg,#1340c0,#1d6ef5)', color:'#fff', border:'none', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", boxShadow:'0 4px 14px rgba(29,110,245,.4)' }}>
                  Réinitialiser
                </button>
              </div>
            ) : (
              <>
                <div className="car-wrap">
                  <div className="car-track" style={{ transform:`translateX(calc(-${slide} * (100% / ${VISIBLE} + 13px / ${VISIBLE})))` }}>
                    {filtered.map(s => {
                      const Ic  = CAT_ICON[s.categorie] || Wrench
                      const col = CAT_COLOR[s.categorie] || { c:'#60a5fa', bg:'rgba(37,99,235,.2)', bd:'rgba(96,165,250,.3)' }
                      return (
                        <div key={s.id} className="svc-card" onClick={() => navigate(`/services/${s.id}`)}>
                          <div className="svc-img" style={{ background:'linear-gradient(135deg,rgba(2,16,36,.9),rgba(4,32,80,.95))' }}>
                            {s.photo
                              ? <img src={s.photo} alt={s.nom} style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0, opacity:.55 }} onError={e => e.target.style.display='none'}/>
                              : <div style={{ width:44, height:44, background:col.bg, border:`1.5px solid ${col.bd}`, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center' }}>
                                  <Ic size={22} strokeWidth={1.8} color={col.c}/>
                                </div>
                            }
                            <div className="svc-img-ov"/>
                            <div className="svc-badge" style={{ color:col.c }}>
                              <Ic size={9} strokeWidth={2}/> {s.categorie}
                            </div>
                          </div>
                          <div className="svc-body">
                            <div className="svc-name">{s.nom}</div>
                            <div className="svc-desc">{s.description?.length > 72 ? s.description.slice(0,72)+'…' : s.description}</div>
                            <div className="svc-foot">
                              <span className="svc-dur"><Clock size={10} strokeWidth={2}/> {s.duree_estimee || 'Sur devis'}</span>
                              <span className="svc-cta">Demander <ArrowRight size={11} strokeWidth={2.5}/></span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                <div className="car-ctrl">
                  <button className="car-btn" onClick={prev} disabled={slide === 0}><ChevronLeft size={14} strokeWidth={2}/></button>
                  <button className="car-btn" onClick={next} disabled={slide >= maxSlide}><ChevronRight size={14} strokeWidth={2}/></button>
                  <div className="dots">
                    {Array.from({ length: maxSlide + 1 }).map((_, i) => (
                      <div key={i} className={`dot ${slide === i ? 'on' : ''}`} onClick={() => setSlide(i)}/>
                    ))}
                  </div>
                  <span className="car-count">{filtered.length} service{filtered.length > 1 ? 's' : ''}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}