// ============================================
// APROPOS.JSX — À propos GENERAL-TECHNOLOGY
// Police Inter (lisible), palette diversifiée
// Boutons CTA connectés avec useNavigate
// Responsive complet
// ============================================

import { useNavigate } from 'react-router-dom'
import {
  Wrench, GraduationCap, Zap, TrendingUp,
  MapPin, Calendar, ArrowRight, Award, Users, Clock,
} from 'lucide-react'

const milestones = [
  {
    year: '2006',
    Icon: Wrench,
    title: 'Les premières réparations',
    desc: "Tout commence dans un simple hangar — réparation de desktops, le premier geste d'un bâtisseur.",
    accent: '#60a5fa',
    bg: 'rgba(37,99,235,0.18)',
    bd: 'rgba(96,165,250,0.3)',
  },
  {
    year: '2008',
    Icon: Calendar,
    title: 'Création officielle',
    desc: 'GENERAL-TECHNOLOGY voit le jour, porté par la vision tenace de M. NYA YOMI DIEUDONNÉ.',
    accent: '#34d399',
    bg: 'rgba(5,150,105,0.18)',
    bd: 'rgba(52,211,153,0.3)',
  },
  {
    year: '2009',
    Icon: Zap,
    title: 'Spécialisation électronique',
    desc: "Extension vers la réparation d'appareils électroniques numériques — montée en compétences.",
    accent: '#fbbf24',
    bg: 'rgba(217,119,6,0.18)',
    bd: 'rgba(251,191,36,0.3)',
  },
  {
    year: '2012',
    Icon: GraduationCap,
    title: 'Formation & transmission',
    desc: 'Lancement des formations pratiques pour étudiants — transformer le savoir en compétences terrain.',
    accent: '#a78bfa',
    bg: 'rgba(124,58,237,0.18)',
    bd: 'rgba(167,139,250,0.3)',
  },
  {
    year: "Aujourd'hui",
    Icon: TrendingUp,
    title: 'Innovation continue',
    desc: "Recherche, innovation et impact régional — GENERAL-TECHNOLOGY évolue avec son époque.",
    accent: '#f87171',
    bg: 'rgba(220,38,38,0.18)',
    bd: 'rgba(248,113,113,0.3)',
  },
]

const stats = [
  { val: '2006', lbl: "Depuis", Icon: Calendar,      accent: '#60a5fa', bg: 'rgba(37,99,235,0.15)',   bd: 'rgba(96,165,250,0.25)' },
  { val: '18+',  lbl: "Années d'expérience", Icon: Clock, accent: '#34d399', bg: 'rgba(5,150,105,0.15)', bd: 'rgba(52,211,153,0.25)' },
  { val: '100+', lbl: "Étudiants formés",    Icon: GraduationCap, accent: '#a78bfa', bg: 'rgba(124,58,237,0.15)', bd: 'rgba(167,139,250,0.25)' },
  { val: 'Cmr',  lbl: "Présence nationale",  Icon: MapPin, accent: '#fbbf24', bg: 'rgba(217,119,6,0.15)',  bd: 'rgba(251,191,36,0.25)' },
]

const values = [
  { Icon: Award,      title: 'Excellence',   desc: 'Chaque réparation, chaque formation — au meilleur niveau.',          color: '#60a5fa', bg: 'rgba(37,99,235,0.15)',   bd: 'rgba(96,165,250,0.25)' },
  { Icon: Users,      title: 'Transmission', desc: "Former les techniciens de demain, c'est notre mission première.",    color: '#34d399', bg: 'rgba(5,150,105,0.15)',   bd: 'rgba(52,211,153,0.25)' },
  { Icon: TrendingUp, title: 'Innovation',   desc: 'Évoluer en parallèle des avancées technologiques du siècle.',        color: '#a78bfa', bg: 'rgba(124,58,237,0.15)',  bd: 'rgba(167,139,250,0.25)' },
  { Icon: Wrench,     title: 'Terrain',      desc: 'De la théorie à la pratique — prêts pour les réalités du métier.',   color: '#fbbf24', bg: 'rgba(217,119,6,0.15)',   bd: 'rgba(251,191,36,0.25)' },
]

export default function APropos() {
  const navigate = useNavigate()

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .ap {
          font-family: 'Inter', sans-serif;
          background:
            radial-gradient(ellipse 90% 60% at 20% 20%, rgba(29,110,245,0.12) 0%, transparent 55%),
            radial-gradient(ellipse 70% 50% at 80% 70%, rgba(124,58,237,0.08) 0%, transparent 50%),
            radial-gradient(ellipse 80% 70% at 50% 100%, rgba(5,150,105,0.06) 0%, transparent 55%),
            linear-gradient(160deg, #0c1a2e 0%, #071120 40%, #050d1a 100%);
          color: #e2eeff;
          min-height: 100vh;
        }

        @keyframes hPulse  { 0%,100%{opacity:.3;transform:scale(1)} 50%{opacity:.55;transform:scale(1.05)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes circ1   { from{stroke-dashoffset:400} to{stroke-dashoffset:0} }
        @keyframes gDot    { 0%,100%{opacity:.25} 50%{opacity:.9} }

        .halo {
          position: absolute; border-radius: 50%; pointer-events: none;
          filter: blur(90px); animation: hPulse 9s ease-in-out infinite;
        }
        .sec-div { border: none; border-top: 1px solid rgba(255,255,255,.05); margin: 0; }
        .sec { padding: clamp(40px,6vw,72px) clamp(16px,6vw,64px); position: relative; }
        .sec-in { max-width: 1100px; margin: 0 auto; }

        .sec-lbl {
          display: inline-flex; align-items: center; gap: 7px;
          font-size: 11px; font-weight: 700; letter-spacing: 2.5px;
          text-transform: uppercase; margin-bottom: 10px;
        }
        .sec-lbl::before {
          content: ''; display: block; width: 18px; height: 2px;
          border-radius: 2px; flex-shrink: 0;
        }
        .sec-lbl.blue  { color: #60a5fa; } .sec-lbl.blue::before  { background: #60a5fa; }
        .sec-lbl.green { color: #34d399; } .sec-lbl.green::before { background: #34d399; }
        .sec-lbl.purple{ color: #a78bfa; } .sec-lbl.purple::before{ background: #a78bfa; }
        .sec-lbl.amber { color: #fbbf24; } .sec-lbl.amber::before { background: #fbbf24; }
        .sec-lbl.red   { color: #f87171; } .sec-lbl.red::before   { background: #f87171; }

        .sec-ttl {
          font-size: clamp(20px,3vw,30px); font-weight: 800;
          color: #fff; letter-spacing: -.5px; margin-bottom: 8px; line-height: 1.2;
        }

        /* ── HERO ── */
        .ap-hero {
          position: relative; overflow: hidden;
          padding: clamp(60px,9vw,110px) clamp(16px,6vw,64px) clamp(50px,7vw,88px);
          min-height: clamp(360px,50vh,500px);
          display: flex; align-items: center;
        }
        .ap-hero-in { max-width: 1100px; margin: 0 auto; position: relative; z-index: 2; width: 100%; }

        .ap-badge {
          display: inline-flex; align-items: center; gap: 8px;
          background: rgba(52,211,153,0.1); border: 1px solid rgba(52,211,153,0.3);
          color: #34d399; font-size: 11px; font-weight: 700;
          padding: 5px 14px; border-radius: 50px; margin-bottom: 22px;
          letter-spacing: 1px; text-transform: uppercase;
          animation: fadeUp .5s ease both;
        }
        .ap-bdot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #34d399; box-shadow: 0 0 8px rgba(52,211,153,.7);
          animation: hPulse 2s ease-in-out infinite; flex-shrink: 0;
        }
        .ap-title {
          font-size: clamp(28px,5.5vw,56px); font-weight: 900;
          line-height: 1.1; letter-spacing: -1.5px; color: #fff;
          margin-bottom: 18px; animation: fadeUp .5s ease .1s both;
        }
        .ap-acc-blue   { color: #60a5fa; }
        .ap-acc-purple { color: #a78bfa; }

        .ap-sub {
          font-size: clamp(14px,1.8vw,16px); color: rgba(226,238,255,.5);
          line-height: 1.75; max-width: 540px;
          font-weight: 400;
          animation: fadeUp .5s ease .2s both;
        }
        .circuits { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }

        /* ── STATS ── */
        .stats-grid {
          display: grid; grid-template-columns: repeat(4,1fr); gap: 12px;
          margin-top: 32px;
        }
        .stat-card {
          border-radius: 18px; padding: 22px 16px; text-align: center;
          backdrop-filter: blur(16px);
          transition: transform .22s, box-shadow .22s;
        }
        .stat-card:hover { transform: translateY(-4px); }
        .stat-ic {
          width: 40px; height: 40px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 12px;
        }
        .stat-val {
          font-size: clamp(24px,3vw,32px); font-weight: 900;
          color: #fff; letter-spacing: -1px; line-height: 1;
        }
        .stat-lbl { font-size: 11.5px; color: rgba(226,238,255,.5); margin-top: 5px; font-weight: 500; }

        /* ── TIMELINE ── */
        .timeline { position: relative; margin-top: 36px; }
        .tl-line {
          position: absolute; left: 50%; top: 0; bottom: 0; width: 1px;
          background: linear-gradient(to bottom, transparent, rgba(226,238,255,.15) 15%, rgba(226,238,255,.15) 85%, transparent);
          transform: translateX(-50%);
        }
        .tl-item {
          display: grid; grid-template-columns: 1fr 48px 1fr;
          align-items: center; margin-bottom: 24px; position: relative;
        }
        .tl-item:nth-child(even) .tl-content-left  { opacity: 0; pointer-events: none; }
        .tl-item:nth-child(odd)  .tl-content-right { opacity: 0; pointer-events: none; }

        .tl-content {
          border-radius: 16px; padding: 18px 20px;
          backdrop-filter: blur(16px);
          transition: transform .22s, box-shadow .22s;
        }
        .tl-content:hover { transform: translateY(-2px); }
        .tl-content-left  { grid-column: 1; text-align: right; }
        .tl-content-right { grid-column: 3; }

        .tl-year-tag {
          display: inline-flex; align-items: center;
          font-size: 10px; font-weight: 800; letter-spacing: 1.5px;
          text-transform: uppercase; padding: 3px 10px; border-radius: 50px;
          margin-bottom: 8px;
        }
        .tl-title { font-size: 13.5px; font-weight: 700; color: #fff; margin-bottom: 5px; }
        .tl-desc  { font-size: 12px; color: rgba(226,238,255,.5); line-height: 1.65; }

        .tl-node {
          grid-column: 2; display: flex; align-items: center;
          justify-content: center; z-index: 2;
        }
        .tl-dot {
          width: 38px; height: 38px; border-radius: 50%; border: 1.5px solid;
          background: rgba(8,18,38,.85); display: flex; align-items: center;
          justify-content: center; backdrop-filter: blur(12px);
          transition: transform .22s;
        }
        .tl-dot:hover { transform: scale(1.1); }

        /* ── VALEURS ── */
        .val-grid {
          display: grid; grid-template-columns: repeat(4,1fr); gap: 12px;
          margin-top: 28px;
        }
        .val-card {
          border-radius: 18px; padding: 24px 18px;
          backdrop-filter: blur(16px);
          transition: transform .22s;
        }
        .val-card:hover { transform: translateY(-4px); }
        .val-ic {
          width: 44px; height: 44px; border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 16px;
        }
        .val-title { font-size: 14.5px; font-weight: 700; color: #fff; margin-bottom: 7px; }
        .val-desc  { font-size: 12.5px; color: rgba(226,238,255,.5); line-height: 1.65; }

        /* ── FONDATEUR ── */
        .founder-wrap {
          display: grid; grid-template-columns: 260px 1fr; gap: 40px; align-items: center;
        }
        .founder-card {
          border-radius: 20px; padding: 30px 24px; text-align: center;
          background: rgba(29,110,245,0.08);
          border: 1px solid rgba(96,165,250,0.2);
          backdrop-filter: blur(20px);
        }
        .founder-avatar {
          width: 76px; height: 76px; border-radius: 50%; margin: 0 auto 16px;
          background: linear-gradient(135deg, #1d6ef5, #7c3aed);
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; font-weight: 900; color: #fff; letter-spacing: -1px;
          border: 2px solid rgba(96,165,250,0.4);
          box-shadow: 0 0 28px rgba(29,110,245,0.35);
        }
        .founder-name { font-size: 15px; font-weight: 800; color: #fff; margin-bottom: 4px; line-height: 1.3; }
        .founder-role { font-size: 11.5px; color: #60a5fa; font-weight: 600; letter-spacing: .5px; margin-bottom: 12px; }
        .founder-loc  {
          display: flex; align-items: center; justify-content: center; gap: 5px;
          font-size: 11px; color: rgba(226,238,255,.4);
        }

        .founder-quote {
          font-size: clamp(15px,2vw,19px); font-weight: 700;
          color: #fff; line-height: 1.45; margin-bottom: 20px;
          border-left: 3px solid #a78bfa; padding-left: 20px;
          font-style: italic;
        }
        .founder-p { font-size: 13.5px; color: rgba(226,238,255,.55); line-height: 1.8; margin-bottom: 12px; }

        /* ── CTA ── */
        .cta-wrap { padding: 0 clamp(16px,6vw,64px) clamp(48px,7vw,80px); }
        .cta-sec {
          border-radius: 22px; position: relative; overflow: hidden;
          background: linear-gradient(135deg, rgba(29,110,245,0.15) 0%, rgba(124,58,237,0.12) 50%, rgba(5,150,105,0.1) 100%);
          border: 1px solid rgba(96,165,250,0.2);
          padding: clamp(28px,5vw,50px) clamp(22px,5vw,52px);
          display: flex; align-items: center; justify-content: space-between;
          gap: 24px; flex-wrap: wrap;
          backdrop-filter: blur(24px);
        }
        .cta-sec::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(ellipse 60% 80% at 85% 50%, rgba(124,58,237,0.15) 0%, transparent 60%);
          pointer-events: none;
        }
        .cta-lbl { font-size: 10.5px; font-weight: 700; color: rgba(226,238,255,.5); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 6px; }
        .cta-t { font-size: clamp(17px,2.8vw,23px); font-weight: 800; color: #fff; margin-bottom: 5px; line-height: 1.25; }
        .cta-d { font-size: 12.5px; color: rgba(226,238,255,.45); }
        .cta-btns { display: flex; gap: 10px; flex-shrink: 0; flex-wrap: wrap; position: relative; z-index: 1; }

        .cta-ghost {
          padding: 10px 22px; border-radius: 50px;
          background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.2);
          color: rgba(226,238,255,.85); font-size: 13px; font-weight: 600;
          cursor: pointer; font-family: 'Inter', sans-serif; transition: all .15s;
        }
        .cta-ghost:hover { background: rgba(255,255,255,.13); border-color: rgba(255,255,255,.35); }

        .cta-main {
          padding: 10px 24px; border-radius: 50px;
          background: linear-gradient(135deg, #1340c0, #1d6ef5);
          border: none; color: #fff; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: 'Inter', sans-serif;
          display: flex; align-items: center; gap: 7px;
          box-shadow: 0 6px 22px rgba(29,110,245,.45); transition: all .15s;
        }
        .cta-main:hover { transform: translateY(-1px); box-shadow: 0 10px 30px rgba(29,110,245,.55); }

        /* ── RESPONSIVE ── */
        @media (max-width: 960px) {
          .stats-grid { grid-template-columns: repeat(2,1fr); }
          .val-grid   { grid-template-columns: repeat(2,1fr); }
          .founder-wrap { grid-template-columns: 1fr; }
          .tl-line { left: 19px; }
          .tl-item { grid-template-columns: 38px 1fr; }
          .tl-node { grid-column: 1; grid-row: 1; }
          .tl-content-left  { opacity:1!important; pointer-events:auto!important; grid-column:2; text-align:left; }
          .tl-content-right { opacity:1!important; pointer-events:auto!important; grid-column:2; }
          .tl-item:nth-child(even) .tl-content-left  { display:none; }
          .tl-item:nth-child(odd)  .tl-content-right { display:none; }
          .tl-item:nth-child(even) .tl-content-right { display:block; }
          .tl-item:nth-child(odd)  .tl-content-left  { display:block; }
        }
        @media (max-width: 580px) {
          .cta-sec { flex-direction: column; }
          .val-grid { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 400px) {
          .val-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="ap">

        {/* ══ HERO ══ */}
        <section className="ap-hero">
          <div className="halo" style={{ width:500, height:500, top:-200, left:'30%', background:'radial-gradient(circle,rgba(29,110,245,.18) 0%,transparent 65%)', animationDelay:'0s' }}/>
          <div className="halo" style={{ width:350, height:350, top:-100, right:'10%', background:'radial-gradient(circle,rgba(124,58,237,.14) 0%,transparent 65%)', animationDelay:'3s' }}/>
          <div className="halo" style={{ width:280, height:280, bottom:-80, left:'60%', background:'radial-gradient(circle,rgba(5,150,105,.1) 0%,transparent 65%)', animationDelay:'1.5s' }}/>

          <div className="circuits">
            <svg width="100%" height="100%" viewBox="0 0 1200 520" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
              <g stroke="rgba(29,110,245,0.18)" strokeWidth="1.5" fill="none">
                <path d="M0,430 L80,430 L80,380 L160,380 L160,330 L260,330" strokeDasharray="400" strokeDashoffset="400" style={{animation:'circ1 3s ease .5s forwards'}}/>
                <circle cx="80" cy="430" r="4" fill="rgba(29,110,245,.5)" style={{animation:'gDot 2.5s ease-in-out 1s infinite'}}/>
                <circle cx="160" cy="380" r="3" fill="rgba(96,165,250,.45)" style={{animation:'gDot 2s ease-in-out 1.4s infinite'}}/>
              </g>
              <g stroke="rgba(124,58,237,0.15)" strokeWidth="1.5" fill="none">
                <path d="M1200,90 L1110,90 L1110,140 L1020,140 L1020,195 L910,195" strokeDasharray="350" strokeDashoffset="350" style={{animation:'circ1 3s ease 1s forwards'}}/>
                <circle cx="1110" cy="90" r="4" fill="rgba(167,139,250,.5)" style={{animation:'gDot 2s ease-in-out .8s infinite'}}/>
                <circle cx="1020" cy="140" r="3" fill="rgba(167,139,250,.4)" style={{animation:'gDot 2.5s ease-in-out 1.2s infinite'}}/>
              </g>
            </svg>
          </div>

          <div className="ap-hero-in">
            <div className="ap-badge">
              <span className="ap-bdot"/>
              Depuis 2008 — Douala, Cameroun
            </div>
            <h1 className="ap-title">
              Une histoire de{' '}
              <span className="ap-acc-blue">persévérance</span>
              <br/>& d'<span className="ap-acc-purple">innovation</span>
            </h1>
            <p className="ap-sub">
              De la réparation d'un simple desktop à une plateforme de formation
              et d'intervention technique — l'aventure GENERAL-TECHNOLOGY.
            </p>
          </div>
        </section>

        <hr className="sec-div"/>

        {/* ══ STATS ══ */}
        <section className="sec">
          <div className="sec-in">
            <div className="stats-grid">
              {stats.map((s, i) => (
                <div key={i} className="stat-card" style={{ background: s.bg, border: `1px solid ${s.bd}` }}>
                  <div className="stat-ic" style={{ background: `${s.accent}15`, border: `1px solid ${s.accent}30` }}>
                    <s.Icon size={17} strokeWidth={2} color={s.accent}/>
                  </div>
                  <div className="stat-val" style={{ color: s.accent }}>{s.val}</div>
                  <div className="stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="sec-div"/>

        {/* ══ TIMELINE ══ */}
        <section className="sec">
          <div className="sec-in">
            <div style={{ textAlign:'center', marginBottom: 8 }}>
              <div className="sec-lbl blue" style={{ justifyContent:'center' }}>Notre parcours</div>
              <div className="sec-ttl">Une trajectoire construite dans la durée</div>
            </div>
            <div className="timeline">
              <div className="tl-line"/>
              {milestones.map((m, i) => (
                <div key={i} className="tl-item">
                  <div className="tl-content tl-content-left" style={{ background: m.bg, border: `1px solid ${m.bd}` }}>
                    <div className="tl-year-tag" style={{ background: `${m.accent}15`, border: `1px solid ${m.accent}30`, color: m.accent }}>{m.year}</div>
                    <div className="tl-title">{m.title}</div>
                    <div className="tl-desc">{m.desc}</div>
                  </div>
                  <div className="tl-node">
                    <div className="tl-dot" style={{ borderColor: m.bd }}>
                      <m.Icon size={15} strokeWidth={2} color={m.accent}/>
                    </div>
                  </div>
                  <div className="tl-content tl-content-right" style={{ background: m.bg, border: `1px solid ${m.bd}` }}>
                    <div className="tl-year-tag" style={{ background: `${m.accent}15`, border: `1px solid ${m.accent}30`, color: m.accent }}>{m.year}</div>
                    <div className="tl-title">{m.title}</div>
                    <div className="tl-desc">{m.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="sec-div"/>

        {/* ══ VALEURS ══ */}
        <section className="sec">
          <div className="sec-in">
            <div style={{ textAlign:'center', marginBottom: 4 }}>
              <div className="sec-lbl purple" style={{ justifyContent:'center' }}>Ce qui nous guide</div>
              <div className="sec-ttl">Nos valeurs fondatrices</div>
            </div>
            <div className="val-grid">
              {values.map((v, i) => (
                <div key={i} className="val-card" style={{ background: v.bg, border: `1px solid ${v.bd}` }}>
                  <div className="val-ic" style={{ background: `${v.color}15`, border: `1px solid ${v.color}30` }}>
                    <v.Icon size={21} strokeWidth={2} color={v.color}/>
                  </div>
                  <div className="val-title">{v.title}</div>
                  <div className="val-desc">{v.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <hr className="sec-div"/>

        {/* ══ FONDATEUR ══ */}
        <section className="sec">
          <div className="sec-in">
            <div className="sec-lbl amber" style={{ marginBottom: 24 }}>Le fondateur</div>
            <div className="founder-wrap">
              <div className="founder-card">
                <div className="founder-avatar">NY</div>
                <div className="founder-name">M. NYA YOMI<br/>DIEUDONNÉ</div>
                <div className="founder-role">Fondateur & Directeur</div>
                <div className="founder-loc">
                  <MapPin size={11} strokeWidth={2}/> Douala, Cameroun
                </div>
              </div>
              <div>
                <p className="founder-quote">
                  "Surmonter chaque obstacle pour concrétiser une vision — c'est l'ADN de GENERAL-TECHNOLOGY."
                </p>
                <p className="founder-p">
                  En 2006, M. NYA YOMI DIEUDONNÉ démarre seul, depuis un hangar, avec une conviction forte : la technologie doit être accessible à tous. Face aux difficultés, il persévère et fonde officiellement GENERAL-TECHNOLOGY en 2008.
                </p>
                <p className="founder-p">
                  Sa vision dépasse la simple réparation. En 2012, il lance un programme de formation pratique pour permettre aux jeunes techniciens de passer du savoir théorique à la maîtrise du terrain.
                </p>
                <p className="founder-p" style={{ marginBottom: 0 }}>
                  Aujourd'hui, cette vision se prolonge à travers DOOM — plateforme numérique qui incarne l'héritage GENERAL-TECHNOLOGY dans l'ère digitale.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ══ CTA ══ */}
        <div className="cta-wrap">
          <div className="cta-sec">
            <div style={{ position:'relative', zIndex:1 }}>
              <div className="cta-lbl">Rejoignez l'aventure</div>
              <div className="cta-t">Faites confiance à 18 ans d'expertise</div>
              <div className="cta-d">Techniciens certifiés · Suivi en temps réel · Intervention rapide</div>
            </div>
            <div className="cta-btns">
              <button className="cta-ghost" onClick={() => navigate('/services')}>
                Voir nos services
              </button>
              <button className="cta-main" onClick={() => navigate('/connexion')}>
                Démarrer <ArrowRight size={14} strokeWidth={2.5}/>
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  )
}