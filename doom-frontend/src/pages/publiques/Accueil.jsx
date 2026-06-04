// ============================================
// ACCUEIL.JSX — Full dark premium
// Style entièrement sombre comme Connexion
// Glassmorphism, halos, circuits animés
// Cartes dark & arrondies, slider services
// Responsive complet
// ============================================

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import {
  Search, Monitor, Wifi, ShieldCheck, Zap, Home, Wrench,
  ChevronLeft, ChevronRight, Clock, ArrowRight, X,
  Shield, MessageSquare, TrendingUp, CheckCircle,
} from 'lucide-react'

const CAT_ICON = {
  Informatique: Monitor, Réseau: Wifi, Sécurité: ShieldCheck,
  Électricité: Zap, Domotique: Home,
}
const CAT_COLOR = {
  Informatique: { c: '#60a5fa', bg: 'rgba(37,99,235,0.2)',   bd: 'rgba(96,165,250,0.3)' },
  Réseau:       { c: '#34d399', bg: 'rgba(5,150,105,0.2)',   bd: 'rgba(52,211,153,0.3)' },
  Sécurité:     { c: '#f87171', bg: 'rgba(220,38,38,0.2)',   bd: 'rgba(248,113,113,0.3)' },
  Électricité:  { c: '#fbbf24', bg: 'rgba(217,119,6,0.2)',   bd: 'rgba(251,191,36,0.3)' },
  Domotique:    { c: '#a78bfa', bg: 'rgba(124,58,237,0.2)',  bd: 'rgba(167,139,250,0.3)' },
}
const CATS    = ['Tous', 'Informatique', 'Réseau', 'Sécurité', 'Électricité', 'Domotique']
const VISIBLE = 3

export default function Accueil() {
  const navigate = useNavigate()
  const [services, setServices] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [query,    setQuery]    = useState('')
  const [cat,      setCat]      = useState('Tous')
  const [slide,    setSlide]    = useState(0)

  useEffect(() => {
    api.get('/services/actifs')
      .then(r => setServices(r.data.services || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = services.filter(s =>
    (cat === 'Tous' || s.categorie === cat) &&
    (!query || s.nom.toLowerCase().includes(query.toLowerCase()))
  )
  const maxSlide = Math.max(0, filtered.length - VISIBLE)
  useEffect(() => setSlide(0), [cat, query])
  const prev = useCallback(() => setSlide(s => Math.max(0, s - 1)), [])
  const next = useCallback(() => setSlide(s => Math.min(maxSlide, s + 1)), [maxSlide])

  const features = [
    { Icon: Shield,        t: 'Techniciens certifiés', d: 'Chaque intervenant est vérifié et qualifié.' },
    { Icon: Clock,         t: 'Réponse rapide',         d: "Prise en charge en moins de 2h selon l'urgence." },
    { Icon: MessageSquare, t: 'Chat intégré',            d: 'Suivez votre intervention en temps réel.' },
    { Icon: TrendingUp,    t: 'Suivi qualité',           d: "Notez chaque intervention pour l'excellence." },
  ]
  const steps = [
    { n: '01', t: 'Choisissez', d: 'Parcourez notre catalogue.', Icon: Search },
    { n: '02', t: 'Soumettez',  d: 'Décrivez en 2 minutes.',     Icon: ArrowRight },
    { n: '03', t: 'Assigné',    d: 'Un technicien qualifié.',     Icon: CheckCircle },
    { n: '04', t: 'Suivi live', d: 'Messagerie et statut direct.',Icon: MessageSquare },
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }

        .ac {
          font-family: 'DM Sans', sans-serif;
          background: radial-gradient(ellipse 120% 80% at 50% 0%, #0a2d5c 0%, #042050 25%, #021024 55%, #010e1d 100%);
          color: #C1E8FF; min-height: 100vh;
        }

        @keyframes spin     { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes hPulse   { 0%,100%{opacity:.35;transform:scale(1)} 50%{opacity:.65;transform:scale(1.06)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gDot     { 0%,100%{opacity:.3} 50%{opacity:1} }
        @keyframes circ1    { from{stroke-dashoffset:400} to{stroke-dashoffset:0} }
        @keyframes circ2    { from{stroke-dashoffset:300} to{stroke-dashoffset:0} }

        .halo {
          position: absolute; border-radius: 50%; pointer-events: none;
          filter: blur(80px); animation: hPulse 8s ease-in-out infinite;
        }
        .circuits { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
        .sec-div  { border: none; border-top: 1px solid rgba(255,255,255,.06); margin: 0; }

        /* HERO */
        .hero {
          position: relative; overflow: hidden;
          padding: clamp(56px,9vw,100px) clamp(16px,6vw,64px) clamp(48px,7vw,84px);
          min-height: clamp(500px,62vh,660px);
          display: flex; align-items: center;
        }
        .hero-in { max-width: 1100px; margin: 0 auto; position: relative; z-index: 2; width: 100%; }

        .hero-badge {
          display: inline-flex; align-items: center; gap: 7px;
          background: rgba(29,110,245,.15); border: 1px solid rgba(96,165,250,.3);
          color: #93c5fd; font-size: 10.5px; font-weight: 700;
          padding: 5px 14px; border-radius: 50px; margin-bottom: 20px;
          letter-spacing: 1px; text-transform: uppercase;
          animation: fadeUp .5s ease both;
        }
        .hero-bdot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #60a5fa; box-shadow: 0 0 8px #60a5fa;
          flex-shrink: 0; animation: hPulse 2s ease-in-out infinite;
        }
        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(30px,6vw,64px); font-weight: 900;
          line-height: 1.07; letter-spacing: -2px; color: #fff;
          margin-bottom: 16px; animation: fadeUp .5s ease .1s both;
        }
        .hero-acc {
          background: linear-gradient(90deg,#60a5fa,#93c5fd,#C1E8FF);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .hero-sub {
          font-size: clamp(13px,2vw,16px); color: rgba(193,232,255,.5);
          line-height: 1.8; max-width: 500px; margin-bottom: 32px;
          animation: fadeUp .5s ease .2s both;
        }

        /* searchbar */
        .srch {
          display: flex; align-items: center; max-width: 400px;
          background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.14);
          border-radius: 50px; overflow: hidden; backdrop-filter: blur(12px);
          transition: border-color .2s, box-shadow .2s;
          animation: fadeUp .5s ease .3s both;
        }
        .srch:focus-within { border-color: rgba(96,165,250,.6); box-shadow: 0 0 0 3px rgba(29,110,245,.15); }
        .srch-ic { padding: 0 13px; display: flex; align-items: center; flex-shrink: 0; }
        .srch input {
          flex: 1; border: none; outline: none; background: transparent;
          padding: 11px 0; font-size: 13px; color: #C1E8FF;
          font-family: 'DM Sans', sans-serif; min-width: 0;
        }
        .srch input::placeholder { color: rgba(193,232,255,.3); }
        .srch-x { padding: 0 11px; display: flex; align-items: center; background: none; border: none; cursor: pointer; color: rgba(193,232,255,.4); flex-shrink: 0; transition: color .15s; }
        .srch-x:hover { color: #C1E8FF; }
        .srch-btn {
          margin: 4px; padding: 8px 18px; border-radius: 50px;
          background: linear-gradient(135deg,#1340c0,#1d6ef5); color: #fff; border: none;
          font-size: 12px; font-weight: 700; cursor: pointer; font-family: 'DM Sans', sans-serif;
          display: flex; align-items: center; gap: 6px; transition: all .15s; flex-shrink: 0;
          box-shadow: 0 4px 14px rgba(29,110,245,.4);
        }
        .srch-btn:hover { box-shadow: 0 6px 20px rgba(29,110,245,.55); }

        /* hero tags */
        .hero-tags { display: flex; gap: 7px; margin-top: 16px; flex-wrap: wrap; animation: fadeUp .5s ease .4s both; }
        .hero-tag {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 13px; border-radius: 50px;
          border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.05);
          backdrop-filter: blur(8px); color: rgba(193,232,255,.6);
          font-size: 11.5px; font-weight: 500; cursor: pointer; transition: all .15s;
        }
        .hero-tag:hover { border-color: rgba(96,165,250,.5); color: #93c5fd; background: rgba(29,110,245,.12); }

        /* SECTION */
        .sec { padding: clamp(40px,6vw,72px) clamp(16px,6vw,64px); position: relative; }
        .sec-in { max-width: 1100px; margin: 0 auto; }
        .sec-lbl { font-size: 10px; font-weight: 700; color: #60a5fa; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 6px; }
        .sec-ttl { font-family: 'Syne', sans-serif; font-size: clamp(20px,3.5vw,30px); font-weight: 800; color: #fff; letter-spacing: -.5px; margin-bottom: 5px; }
        .sec-sub { font-size: 13px; color: rgba(193,232,255,.45); line-height: 1.65; }

        /* SERVICES */
        .svc-head { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 10px; margin-bottom: 16px; }
        .see-all {
          display: flex; align-items: center; gap: 5px; padding: 6px 15px; border-radius: 50px;
          background: rgba(29,110,245,.15); border: 1px solid rgba(96,165,250,.3);
          color: #93c5fd; font-size: 12px; font-weight: 700; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all .15s;
        }
        .see-all:hover { background: rgba(29,110,245,.25); }

        .cats-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 20px; }
        .cat-btn {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 5px 13px; border-radius: 50px;
          border: 1px solid rgba(255,255,255,.1); background: rgba(255,255,255,.05);
          backdrop-filter: blur(8px); color: rgba(193,232,255,.6);
          font-size: 12px; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif; transition: all .15s;
        }
        .cat-btn:hover { border-color: rgba(96,165,250,.4); color: #93c5fd; }
        .cat-btn.on { background: rgba(29,110,245,.2); border-color: rgba(96,165,250,.5); color: #93c5fd; }

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
        .svc-img { height: 120px; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; }
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
          cursor: pointer; transition: all .15s; color: rgba(193,232,255,.6);
          backdrop-filter: blur(8px);
        }
        .car-btn:hover:not(:disabled) { border-color: rgba(96,165,250,.5); color: #93c5fd; background: rgba(29,110,245,.15); }
        .car-btn:disabled { opacity: .25; cursor: not-allowed; }
        .dots { display: flex; gap: 4px; }
        .dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(255,255,255,.2); cursor: pointer; transition: all .2s; }
        .dot.on { width: 14px; border-radius: 3px; background: #60a5fa; }
        .car-count { margin-left: auto; font-size: 11.5px; color: rgba(193,232,255,.35); }

        /* empty */
        .empty { text-align: center; padding: 48px 20px; background: rgba(5,38,89,.3); border-radius: 16px; border: 1px solid rgba(125,160,202,.12); backdrop-filter: blur(12px); }

        /* HOW */
        .how-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; margin-top: 28px; }
        .how-card {
          background: rgba(5,38,89,.35); border: 1px solid rgba(125,160,202,.12);
          border-radius: 16px; padding: 20px 15px; text-align: center;
          transition: all .22s; backdrop-filter: blur(16px);
          box-shadow: 0 4px 20px rgba(2,16,36,.3);
        }
        .how-card:hover { border-color: rgba(96,165,250,.35); transform: translateY(-3px); box-shadow: 0 10px 30px rgba(29,110,245,.15); }
        .how-num { font-size: 9.5px; font-weight: 800; color: #60a5fa; letter-spacing: 2.5px; text-transform: uppercase; margin-bottom: 12px; }
        .how-ic { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; background: rgba(29,110,245,.15); border: 1px solid rgba(96,165,250,.25); }
        .how-t { font-size: 13px; font-weight: 700; color: #fff; margin-bottom: 5px; }
        .how-d { font-size: 11px; color: rgba(193,232,255,.45); line-height: 1.6; }

        /* FEATURES */
        .feat-wrap { display: grid; grid-template-columns: 1fr 1fr; gap: 48px; align-items: center; }
        .feat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 9px; margin-top: 20px; }
        .feat-card {
          display: flex; gap: 11px; align-items: flex-start;
          background: rgba(5,38,89,.35); border: 1px solid rgba(125,160,202,.12);
          border-radius: 14px; padding: 14px; transition: all .22s; backdrop-filter: blur(12px);
        }
        .feat-card:hover { border-color: rgba(96,165,250,.3); background: rgba(5,38,89,.55); }
        .feat-ic { width: 34px; height: 34px; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; background: rgba(29,110,245,.15); border: 1px solid rgba(96,165,250,.25); }
        .feat-t { font-size: 12.5px; font-weight: 700; color: #fff; margin-bottom: 3px; }
        .feat-d { font-size: 11px; color: rgba(193,232,255,.45); line-height: 1.55; }

        .feat-img-wrap { border-radius: 18px; overflow: hidden; height: 340px; position: relative; border: 1px solid rgba(125,160,202,.15); box-shadow: 0 20px 60px rgba(2,16,36,.6); }
        .feat-img-wrap img { width: 100%; height: 100%; object-fit: cover; filter: brightness(.75); }
        .feat-img-ov { position: absolute; inset: 0; background: linear-gradient(to top,rgba(2,16,36,.82) 0%,rgba(2,16,36,.1) 60%); }
        .live-badge { position: absolute; bottom: 14px; left: 14px; right: 14px; background: rgba(5,38,89,.85); backdrop-filter: blur(20px); border: 1px solid rgba(125,160,202,.2); border-radius: 12px; padding: 11px 14px; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 20px rgba(2,16,36,.5); }
        .live-dot { width: 7px; height: 7px; border-radius: 50%; background: #34d399; box-shadow: 0 0 6px rgba(52,211,153,.7); flex-shrink: 0; animation: hPulse 2s ease-in-out infinite; }
        .live-pill { margin-left: auto; font-size: 10.5px; font-weight: 700; color: #34d399; background: rgba(5,150,105,.2); padding: 3px 9px; border-radius: 50px; border: 1px solid rgba(52,211,153,.3); }

        /* CTA */
        .cta-wrap { padding: 0 clamp(16px,6vw,64px) clamp(48px,7vw,80px); }
        .cta-sec {
          border-radius: 20px; position: relative; overflow: hidden;
          background: rgba(5,38,89,.5); backdrop-filter: blur(24px);
          border: 1px solid rgba(29,110,245,.25);
          padding: clamp(30px,5vw,52px) clamp(22px,5vw,52px);
          display: flex; align-items: center; justify-content: space-between;
          gap: 24px; flex-wrap: wrap;
          box-shadow: 0 20px 60px rgba(2,16,36,.5), inset 0 1px 0 rgba(255,255,255,.04);
        }
        .cta-sec::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse 70% 70% at 80% 50%,rgba(29,110,245,.2) 0%,transparent 65%); pointer-events: none; }
        .cta-lbl { font-size: 10px; font-weight: 700; color: rgba(193,232,255,.5); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; }
        .cta-t { font-family: 'Syne',sans-serif; font-size: clamp(18px,3vw,24px); font-weight: 800; color: #fff; margin-bottom: 5px; }
        .cta-d { font-size: 12px; color: rgba(193,232,255,.4); }
        .cta-btns { display: flex; gap: 9px; flex-shrink: 0; flex-wrap: wrap; position: relative; z-index: 1; }
        .cta-ghost { padding: 9px 20px; border-radius: 50px; background: rgba(255,255,255,.08); border: 1px solid rgba(255,255,255,.18); color: rgba(193,232,255,.8); font-size: 12px; font-weight: 600; cursor: pointer; font-family: 'DM Sans',sans-serif; transition: all .15s; }
        .cta-ghost:hover { background: rgba(255,255,255,.14); }
        .cta-main { padding: 9px 22px; border-radius: 50px; background: linear-gradient(135deg,#1340c0,#1d6ef5); border: none; color: #fff; font-size: 12px; font-weight: 800; cursor: pointer; font-family: 'DM Sans',sans-serif; display: flex; align-items: center; gap: 6px; box-shadow: 0 6px 20px rgba(29,110,245,.45); transition: all .15s; }
        .cta-main:hover { transform: translateY(-1px); box-shadow: 0 10px 28px rgba(29,110,245,.55); }

        /* loader */
        .loader { text-align: center; padding: 48px 0; }
        .spinner { width: 24px; height: 24px; border: 2.5px solid rgba(255,255,255,.1); border-top: 2.5px solid #60a5fa; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 10px; }

        @media (max-width: 900px) {
          .svc-card { flex: 0 0 calc((100% - 13px) / 2); }
          .how-grid { grid-template-columns: repeat(2,1fr); }
          .feat-wrap { grid-template-columns: 1fr; }
          .feat-img-wrap { height: 260px; }
        }
        @media (max-width: 620px) {
          .svc-card { flex: 0 0 82%; }
          .how-grid { grid-template-columns: 1fr 1fr; }
          .feat-grid { grid-template-columns: 1fr; }
          .cta-sec { flex-direction: column; }
        }
        @media (max-width: 400px) {
          .svc-card { flex: 0 0 92%; }
          .how-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="ac">

        {/* ══ HERO ══ */}
        <section className="hero">
          <div className="halo" style={{ width:600, height:600, top:-220, left:'50%', transform:'translateX(-50%)', background:'radial-gradient(circle,rgba(29,110,245,.22) 0%,transparent 65%)', animationDelay:'0s' }}/>
          <div className="halo" style={{ width:280, height:280, bottom:-80, right:-30, background:'radial-gradient(circle,rgba(29,78,216,.14) 0%,transparent 70%)', animationDelay:'2.5s' }}/>
          <div className="halo" style={{ width:180, height:180, top:'35%', left:-50, background:'radial-gradient(circle,rgba(124,58,237,.1) 0%,transparent 70%)', animationDelay:'1.5s' }}/>

          {/* Circuits décoratifs */}
          <div className="circuits">
            <svg width="100%" height="100%" viewBox="0 0 1200 660" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <g stroke="rgba(29,110,245,0.2)" strokeWidth="1.5" fill="none">
                <path d="M0,530 L90,530 L90,475 L170,475 L170,420 L270,420" strokeDasharray="400" strokeDashoffset="400" style={{animation:'circ1 3s ease .5s forwards'}}/>
                <path d="M0,570 L55,570 L55,505 L140,505 L140,445 L210,445 L210,390 L320,390" strokeDasharray="300" strokeDashoffset="300" style={{animation:'circ2 3s ease .8s forwards'}}/>
                <circle cx="90"  cy="530" r="4" fill="rgba(29,110,245,.6)" style={{animation:'gDot 2s ease-in-out 1s infinite'}}/>
                <circle cx="170" cy="475" r="3" fill="rgba(96,165,250,.5)" style={{animation:'gDot 2s ease-in-out 1.3s infinite'}}/>
                <circle cx="270" cy="420" r="4" fill="rgba(29,110,245,.5)" style={{animation:'gDot 2.5s ease-in-out .5s infinite'}}/>
                <circle cx="55"  cy="570" r="3" fill="rgba(96,165,250,.4)" style={{animation:'gDot 2s ease-in-out .9s infinite'}}/>
                <circle cx="140" cy="505" r="4" fill="rgba(29,110,245,.5)" style={{animation:'gDot 2.5s ease-in-out 1.5s infinite'}}/>
              </g>
              <g stroke="rgba(29,110,245,0.18)" strokeWidth="1.5" fill="none">
                <path d="M1200,110 L1110,110 L1110,160 L1030,160 L1030,210 L930,210" strokeDasharray="350" strokeDashoffset="350" style={{animation:'circ1 3s ease 1s forwards'}}/>
                <path d="M1200,65 L1155,65 L1155,115 L1075,115 L1075,175 L995,175 L995,230 L885,230" strokeDasharray="280" strokeDashoffset="280" style={{animation:'circ2 3s ease 1.2s forwards'}}/>
                <circle cx="1110" cy="110" r="4" fill="rgba(29,110,245,.5)" style={{animation:'gDot 2s ease-in-out .8s infinite'}}/>
                <circle cx="1030" cy="160" r="3" fill="rgba(96,165,250,.4)" style={{animation:'gDot 2.5s ease-in-out 1.1s infinite'}}/>
                <circle cx="930"  cy="210" r="4" fill="rgba(29,110,245,.5)" style={{animation:'gDot 2s ease-in-out .4s infinite'}}/>
              </g>
            </svg>
          </div>

          <div className="hero-in">
            <div className="hero-badge">
              <span className="hero-bdot"/>
              Plateforme IT &amp; Électrique — Cameroun
            </div>
            <h1 className="hero-title">
              Vos pannes résolues<br/>
              <span className="hero-acc">plus vite que jamais</span>
            </h1>
            <p className="hero-sub">
              Soumettez une demande, suivez chaque étape en temps réel
              et échangez directement avec votre technicien.
            </p>

            <div className="srch">
              <div className="srch-ic"><Search size={14} color="rgba(193,232,255,.38)" strokeWidth={2}/></div>
              <input type="text" placeholder="Rechercher un service…" value={query} onChange={e => setQuery(e.target.value)}/>
              {query && <button className="srch-x" onClick={() => setQuery('')}><X size={13} strokeWidth={2.5}/></button>}
              <button className="srch-btn"><Search size={11} strokeWidth={2.5}/> Rechercher</button>
            </div>

            <div className="hero-tags">
              {['Informatique','Réseau','Électricité'].map(c => {
                const Ic  = CAT_ICON[c]
                const col = CAT_COLOR[c]
                return (
                  <span key={c} className="hero-tag" onClick={() => { setCat(c); document.getElementById('svc-sec')?.scrollIntoView({ behavior:'smooth' }) }}>
                    <Ic size={11} strokeWidth={2} color={col?.c}/> {c}
                  </span>
                )
              })}
            </div>
          </div>
        </section>

        <hr className="sec-div"/>

        {/* ══ SERVICES ══ */}
        <section className="sec" id="svc-sec">
          <div className="sec-in">
            <div className="svc-head">
              <div>
                <div className="sec-lbl">Ce qu'on propose</div>
                <div className="sec-ttl">Nos services</div>
                <div className="sec-sub">Des techniciens spécialisés pour chaque besoin.</div>
              </div>
              <button className="see-all" onClick={() => navigate('/services')}>
                Voir tout <ArrowRight size={12} strokeWidth={2.5}/>
              </button>
            </div>

            <div className="cats-row">
              {CATS.map(c => {
                const Ic = CAT_ICON[c]
                return (
                  <button key={c} className={`cat-btn ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>
                    {Ic && <Ic size={11} strokeWidth={2}/>} {c}
                  </button>
                )
              })}
            </div>

            {loading ? (
              <div className="loader">
                <div className="spinner"/>
                <p style={{ fontSize:13, color:'rgba(193,232,255,.4)' }}>Chargement…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="empty">
                <Search size={28} strokeWidth={1.5} color="rgba(193,232,255,.3)" style={{ marginBottom:10 }}/>
                <p style={{ fontSize:13, color:'rgba(193,232,255,.4)', marginBottom:13 }}>Aucun service trouvé</p>
                <button onClick={() => { setQuery(''); setCat('Tous') }}
                  style={{ padding:'7px 18px', borderRadius:50, background:'linear-gradient(135deg,#1340c0,#1d6ef5)', color:'#fff', border:'none', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
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
                            <div className="svc-desc">{s.description?.length > 70 ? s.description.slice(0,70)+'…' : s.description}</div>
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
        </section>

        <hr className="sec-div"/>

        {/* ══ HOW ══ */}
        <section className="sec">
          <div className="sec-in">
            <div style={{ textAlign:'center', marginBottom:4 }}>
              <div className="sec-lbl">Processus</div>
              <div className="sec-ttl">Comment ça marche ?</div>
            </div>
            <div className="how-grid">
              {steps.map((s,i) => (
                <div key={i} className="how-card">
                  <div className="how-num">Étape {s.n}</div>
                  <div className="how-ic"><s.Icon size={18} strokeWidth={2} color="#60a5fa"/></div>
                  <div className="how-t">{s.t}</div>
                  <div className="how-d">{s.d}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="sec-div"/>

        {/* ══ FEATURES ══ */}
        <section className="sec">
          <div className="sec-in">
            <div className="feat-wrap">
              <div>
                <div className="sec-lbl">Pourquoi DOOM ?</div>
                <div className="sec-ttl">Une plateforme pensée pour vous</div>
                <p style={{ fontSize:13, color:'rgba(193,232,255,.45)', lineHeight:1.75, margin:'10px 0 16px' }}>
                  Fini les appels sans réponse. Gérez tout depuis une interface claire et moderne.
                </p>
                <div className="feat-grid">
                  {features.map((f,i) => (
                    <div key={i} className="feat-card">
                      <div className="feat-ic"><f.Icon size={16} strokeWidth={2} color="#60a5fa"/></div>
                      <div>
                        <div className="feat-t">{f.t}</div>
                        <div className="feat-d">{f.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="feat-img-wrap">
                <img src="https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=700&q=80" alt="technicien"/>
                <div className="feat-img-ov"/>
                <div className="live-badge">
                  <div className="live-dot"/>
                  <div>
                    <div style={{ fontSize:12, fontWeight:700, color:'#fff' }}>Intervention en cours</div>
                    <div style={{ fontSize:10.5, color:'rgba(193,232,255,.45)', marginTop:1 }}>Suivi en temps réel activé</div>
                  </div>
                  <div className="live-pill">Live</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ CTA ══ */}
        <div className="cta-wrap">
          <div className="cta-sec">
            <div style={{ position:'relative', zIndex:1 }}>
              <div className="cta-lbl">Prêt à commencer ?</div>
              <div className="cta-t">Démarrez votre première intervention</div>
              <div className="cta-d">Inscription gratuite · Aucune carte · 2 minutes</div>
            </div>
            <div className="cta-btns">
              <button className="cta-ghost">En savoir plus</button>
              <button className="cta-main" onClick={() => navigate('/connexion')}>
                Commencer <ArrowRight size={13} strokeWidth={2.5}/>
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}