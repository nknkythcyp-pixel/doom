// ============================================
// NAVBAR.JSX — Responsive, moderne, compact
// ============================================
import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexte/AuthContexte'
import { Menu, X, ChevronDown, LayoutDashboard, User, LogOut, Zap } from 'lucide-react'

const Navbar = () => {
  const { utilisateur, estConnecte, deconnexion } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuProfil, setMenuProfil] = useState(false)
  const [menuMobile, setMenuMobile] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMenuMobile(false); setMenuProfil(false) }, [location.pathname])

  const lienDashboard = () => {
    if (utilisateur?.role === 'admin') return '/admin/dashboard'
    if (utilisateur?.role === 'technicien') return '/technicien/dashboard'
    return '/client/dashboard'
  }

  const navLinks = [
    { label: 'Accueil', to: '/' },
    { label: 'Services', to: '/services' },
    { label: 'À propos', to: '/a-propos' },
  ]

  const isActive = (to) => location.pathname === to

  return (
    <>
      <style>{`
        .nav-root {
          position: sticky; top: 0; z-index: 1000;
          transition: background .25s, box-shadow .25s, border-color .25s;
        }
        .nav-root.scrolled {
          background: rgba(7,12,28,0.97);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 1px 0 rgba(255,255,255,0.06);
        }
        .nav-root.top { background: #070c1c; }
        .nav-inner {
          max-width: 1200px; margin: 0 auto;
          display: flex; align-items: center;
          justify-content: space-between;
          padding: 0 20px; height: 56px;
        }
        .nav-logo {
          font-size: 18px; font-weight: 900;
          color: #fff; letter-spacing: 4px;
          text-decoration: none; font-style: italic;
          display: flex; align-items: center; gap: 6px;
        }
        .nav-logo span { color: #38bdf8; }
        .nav-links { display: flex; align-items: center; gap: 2px; }
        .nav-link {
          padding: 6px 14px; border-radius: 20px;
          font-size: 13px; font-weight: 500; color: rgba(255,255,255,0.55);
          text-decoration: none; transition: all .18s;
          position: relative;
        }
        .nav-link:hover { color: #fff; background: rgba(255,255,255,0.07); }
        .nav-link.active { color: #38bdf8; background: rgba(56,189,248,0.1); }
        .nav-right { display: flex; align-items: center; gap: 8px; }
        .btn-ghost {
          padding: 6px 14px; border-radius: 20px;
          background: transparent; border: 1px solid rgba(255,255,255,0.15);
          color: rgba(255,255,255,0.65); font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all .18s; font-family: inherit;
        }
        .btn-ghost:hover { border-color: rgba(255,255,255,0.35); color: #fff; }
        .btn-primary {
          padding: 6px 16px; border-radius: 20px;
          background: #0ea5e9; border: none;
          color: #fff; font-size: 12px; font-weight: 700;
          cursor: pointer; transition: all .18s; font-family: inherit;
        }
        .btn-primary:hover { background: #38bdf8; }
        .profile-btn {
          display: flex; align-items: center; gap: 8px;
          padding: 5px 10px 5px 5px; border-radius: 24px;
          background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12);
          cursor: pointer; transition: all .18s;
        }
        .profile-btn:hover { background: rgba(255,255,255,0.12); }
        .avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: linear-gradient(135deg, #0ea5e9, #38bdf8);
          display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 800; color: #fff; flex-shrink: 0;
        }
        .profile-name { font-size: 12px; font-weight: 600; color: #fff; }
        .profile-role { font-size: 10px; color: #38bdf8; text-transform: capitalize; }
        .dropdown {
          position: absolute; right: 0; top: calc(100% + 8px);
          background: #111827; border: 1px solid rgba(255,255,255,0.1);
          border-radius: 12px; min-width: 180px; overflow: hidden;
          box-shadow: 0 16px 40px rgba(0,0,0,0.5);
          animation: dropIn .15s ease;
        }
        @keyframes dropIn { from{opacity:0;transform:translateY(-6px)} to{opacity:1;transform:translateY(0)} }
        .drop-item {
          display: flex; align-items: center; gap: 10px;
          padding: 11px 14px; font-size: 12.5px; font-weight: 500;
          color: rgba(255,255,255,0.75); cursor: pointer;
          transition: background .15s; border: none; background: transparent;
          width: 100%; font-family: inherit;
        }
        .drop-item:hover { background: rgba(255,255,255,0.07); color: #fff; }
        .drop-item.danger { color: #f87171; }
        .drop-item.danger:hover { background: rgba(248,113,113,0.08); }
        .drop-sep { height: 1px; background: rgba(255,255,255,0.07); margin: 2px 0; }
        .mobile-btn {
          display: none; background: transparent; border: none;
          color: rgba(255,255,255,0.7); cursor: pointer; padding: 4px;
        }
        .mobile-menu {
          position: fixed; inset: 0; top: 56px;
          background: rgba(7,12,28,0.98); backdrop-filter: blur(20px);
          z-index: 999; display: flex; flex-direction: column;
          padding: 20px; gap: 4px; overflow-y: auto;
          animation: mobileIn .2s ease;
        }
        @keyframes mobileIn { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        .mob-link {
          display: block; padding: 13px 16px; border-radius: 12px;
          font-size: 15px; font-weight: 600; color: rgba(255,255,255,0.7);
          text-decoration: none; transition: all .15s;
        }
        .mob-link:hover, .mob-link.active { background: rgba(255,255,255,0.07); color: #fff; }
        .mob-sep { height: 1px; background: rgba(255,255,255,0.08); margin: 8px 0; }
        .mob-actions { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
        @media (max-width: 640px) {
          .nav-links { display: none; }
          .mobile-btn { display: flex; }
          .nav-right .btn-ghost, .nav-right .btn-primary { display: none; }
          .nav-right .profile-btn .profile-name, .nav-right .profile-btn .profile-role { display: none; }
        }
        @media (max-width: 768px) {
          .nav-inner { padding: 0 16px; }
        }
      `}</style>

      <nav className={`nav-root ${scrolled ? 'scrolled' : 'top'}`}>
        <div className="nav-inner">
          {/* Logo */}
          <Link to="/" className="nav-logo">
            D<span>O</span>OM<span style={{color:'rgba(255,255,255,0.3)',fontWeight:300}}>.</span>
          </Link>

          {/* Links desktop */}
          <div className="nav-links">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to} className={`nav-link ${isActive(l.to) ? 'active' : ''}`}>{l.label}</Link>
            ))}
          </div>

          {/* Droite */}
          <div className="nav-right">
            {estConnecte ? (
              <div style={{position:'relative'}}>
                <div className="profile-btn" onClick={() => setMenuProfil(!menuProfil)}>
                  <div className="avatar">{utilisateur?.prenom?.charAt(0)}{utilisateur?.nom?.charAt(0)}</div>
                  <div>
                    <div className="profile-name">{utilisateur?.prenom}</div>
                    <div className="profile-role">{utilisateur?.role}</div>
                  </div>
                  <ChevronDown size={12} color="rgba(255,255,255,0.4)" style={{transition:'transform .2s', transform: menuProfil?'rotate(180deg)':'rotate(0)'}} />
                </div>
                {menuProfil && (
                  <div className="dropdown">
                    <button className="drop-item" onClick={() => { navigate(lienDashboard()); setMenuProfil(false) }}>
                      <LayoutDashboard size={14} /> Tableau de bord
                    </button>
                    {utilisateur?.role === 'client' && (
                      <button className="drop-item" onClick={() => { navigate('/client/profil'); setMenuProfil(false) }}>
                        <User size={14} /> Mon profil
                      </button>
                    )}
                    <div className="drop-sep" />
                    <button className="drop-item danger" onClick={() => { deconnexion(); setMenuProfil(false) }}>
                      <LogOut size={14} /> Se déconnecter
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button className="btn-ghost" onClick={() => navigate('/connexion')}>Connexion</button>
                <button className="btn-primary" onClick={() => navigate('/connexion')}>S'inscrire</button>
              </>
            )}
            <button className="mobile-btn" onClick={() => setMenuMobile(!menuMobile)}>
              {menuMobile ? <X size={22}/> : <Menu size={22}/>}
            </button>
          </div>
        </div>
      </nav>

      {/* Menu mobile */}
      {menuMobile && (
        <div className="mobile-menu">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} className={`mob-link ${isActive(l.to)?'active':''}`}>{l.label}</Link>
          ))}
          <div className="mob-sep"/>
          {estConnecte ? (
            <>
              <div style={{padding:'12px 16px',display:'flex',alignItems:'center',gap:10}}>
                <div className="avatar" style={{width:36,height:36,fontSize:13}}>{utilisateur?.prenom?.charAt(0)}{utilisateur?.nom?.charAt(0)}</div>
                <div>
                  <div style={{fontSize:14,fontWeight:700,color:'#fff'}}>{utilisateur?.prenom} {utilisateur?.nom}</div>
                  <div style={{fontSize:11,color:'#38bdf8',textTransform:'capitalize'}}>{utilisateur?.role}</div>
                </div>
              </div>
              <Link to={lienDashboard()} className="mob-link">📊 Tableau de bord</Link>
              {utilisateur?.role === 'client' && <Link to="/client/profil" className="mob-link">👤 Mon profil</Link>}
              <button className="mob-link" style={{background:'rgba(248,113,113,0.08)',color:'#f87171',border:'none',cursor:'pointer',fontFamily:'inherit',textAlign:'left',width:'100%'}} onClick={deconnexion}>🚪 Déconnexion</button>
            </>
          ) : (
            <div className="mob-actions">
              <button style={{padding:'13px',borderRadius:12,background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.15)',color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer',fontFamily:'inherit'}} onClick={() => navigate('/connexion')}>Se connecter</button>
              <button style={{padding:'13px',borderRadius:12,background:'#0ea5e9',border:'none',color:'#fff',fontSize:14,fontWeight:700,cursor:'pointer',fontFamily:'inherit'}} onClick={() => navigate('/connexion')}>S'inscrire</button>
            </div>
          )}
        </div>
      )}
    </>
  )
}

export default Navbar