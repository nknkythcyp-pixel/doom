// ============================================
// NOTIFICATIONSBADGE.JSX — Cloche notifications
// ✅ Navigation vers /admin/utilisateurs pour nouveau_client
// ✅ Badge "NOUVEAU" sur les notifs non lues de type nouveau_client
//    qui disparaît au survol/clic
// Réutilisable dans les 3 espaces (Admin, Technicien, Client)
// ============================================

import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { io } from 'socket.io-client'
import api from '../services/api'
import {
  Bell, BellRing, Check, CheckCheck,
  Trash2, ChevronRight, Loader2,
  MessageSquare, UserCheck, Settings,
  ClipboardList, AlertCircle, X, UserPlus,
} from 'lucide-react'

// ── Icône selon le type de notification ──
const iconeParType = (type) => {
  switch (type) {
    case 'nouvelle_demande':  return ClipboardList
    case 'nouveau_client':    return UserPlus
    case 'demande_assignee':  return UserCheck
    case 'statut_change':     return Settings
    case 'nouveau_message':   return MessageSquare
    default:                  return AlertCircle
  }
}

// ── Couleur accent selon le type ──
const couleurParType = (type) => {
  switch (type) {
    case 'nouvelle_demande':  return { bg: 'rgba(139,92,246,0.12)', color: '#7c3aed', dot: '#8b5cf6' }
    case 'nouveau_client':    return { bg: 'rgba(16,185,129,0.12)',  color: '#065f46', dot: '#10b981' }
    case 'demande_assignee':  return { bg: 'rgba(16,185,129,0.12)',  color: '#065f46', dot: '#10b981' }
    case 'statut_change':     return { bg: 'rgba(245,158,11,0.12)',  color: '#92400e', dot: '#f59e0b' }
    case 'nouveau_message':   return { bg: 'rgba(29,110,245,0.12)', color: '#1e40af', dot: '#1d6ef5' }
    default:                  return { bg: 'rgba(122,156,197,0.12)', color: '#4a6a9e', dot: '#7a9cc5' }
  }
}

// ── Formater la date relative ──
const dateRelative = (dateStr) => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'À l\'instant'
  if (m < 60) return `Il y a ${m} min`
  const h = Math.floor(m / 60)
  if (h < 24) return `Il y a ${h}h`
  const j = Math.floor(h / 24)
  return `Il y a ${j}j`
}

// ── Est-ce une notif "nouveau client" ? ──
const estNouveauClient = (notif) =>
  notif.type === 'nouveau_client' ||
  (notif.titre && notif.titre.toLowerCase().includes('client inscrit'))

export default function NotificationsBadge({ role = 'client' }) {
  const navigate = useNavigate()

  const [ouvert,        setOuvert]        = useState(false)
  const [notifications, setNotifications] = useState([])
  const [nonLues,       setNonLues]       = useState(0)
  const [chargement,    setChargement]    = useState(true)
  const [sonnette,      setSonnette]      = useState(false)
  // IDs des notifs "nouveau client" dont le badge a été vu (survol/clic)
  const [badgesVus,     setBadgesVus]     = useState(new Set())

  const panneauRef = useRef(null)
  const socketRef  = useRef(null)

  // ════════════════════════════════
  // Charger les notifications
  // ════════════════════════════════
  const charger = useCallback(async () => {
    try {
      const reponse = await api.get('/notifications')
      setNotifications(reponse.data.notifications || [])
      setNonLues(reponse.data.nonLues || 0)
    } catch (err) {
      console.error('Erreur chargement notifications :', err)
    } finally {
      setChargement(false)
    }
  }, [])

  // ════════════════════════════════
  // Socket.io — réception temps réel
  // ════════════════════════════════
  useEffect(() => {
    charger()

    const token = localStorage.getItem('doom_token')
    if (!token) return

    const socket = io('http://localhost:5000', { auth: { token } })
    socketRef.current = socket

    socket.emit('rejoindre-espace-perso', token)

    socket.on('nouvelle-notification', (notif) => {
      setNotifications(prev => [notif, ...prev].slice(0, 50))
      setNonLues(prev => prev + 1)
      setSonnette(true)
      setTimeout(() => setSonnette(false), 2000)
    })

    return () => socket.disconnect()
  }, [charger])

  // ════════════════════════════════
  // Fermer le panneau en cliquant dehors
  // ════════════════════════════════
  useEffect(() => {
    const gerer = (e) => {
      if (panneauRef.current && !panneauRef.current.contains(e.target)) {
        setOuvert(false)
      }
    }
    if (ouvert) document.addEventListener('mousedown', gerer)
    return () => document.removeEventListener('mousedown', gerer)
  }, [ouvert])

  // ════════════════════════════════
  // Marquer une notification lue + naviguer
  // ════════════════════════════════
  const clicNotification = async (notif) => {
    // Marquer le badge "NOUVEAU" comme vu
    if (estNouveauClient(notif)) {
      setBadgesVus(prev => new Set([...prev, notif.id]))
    }

    try {
      if (!notif.lu) {
        await api.patch(`/notifications/${notif.id}/lu`)
        setNotifications(prev =>
          prev.map(n => n.id === notif.id ? { ...n, lu: 1 } : n)
        )
        setNonLues(prev => Math.max(0, prev - 1))
      }

      setOuvert(false)

      // ── Navigation selon le type et le rôle ──
      if (estNouveauClient(notif) && role === 'admin') {
        // Notif "nouveau client inscrit" → page utilisateurs
        navigate('/admin/utilisateurs')
      } else if (notif.demande_id) {
        const liens = {
          admin:      '/admin/demandes',
          technicien: `/technicien/interventions/${notif.demande_id}`,
          client:     `/client/demandes/${notif.demande_id}`,
        }
        navigate(liens[role] || '/admin/demandes')
      }
    } catch (err) {
      console.error('Erreur clic notification :', err)
    }
  }

  // ── Marquer le badge vu au survol ──
  const survolNotification = (notif) => {
    if (estNouveauClient(notif) && !badgesVus.has(notif.id)) {
      setBadgesVus(prev => new Set([...prev, notif.id]))
    }
  }

  // ════════════════════════════════
  // Tout marquer lu
  // ════════════════════════════════
  const toutMarquerLu = async (e) => {
    e.stopPropagation()
    try {
      await api.patch('/notifications/tout-lire')
      setNotifications(prev => prev.map(n => ({ ...n, lu: 1 })))
      setNonLues(0)
      // Marquer tous les badges comme vus
      setBadgesVus(new Set(notifications.map(n => n.id)))
    } catch (err) {
      console.error('Erreur tout marquer lu :', err)
    }
  }

  // ════════════════════════════════
  // Supprimer une notification
  // ════════════════════════════════
  const supprimer = async (e, notifId) => {
    e.stopPropagation()
    try {
      await api.delete(`/notifications/${notifId}`)
      const notif = notifications.find(n => n.id === notifId)
      setNotifications(prev => prev.filter(n => n.id !== notifId))
      if (notif && !notif.lu) setNonLues(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Erreur suppression notification :', err)
    }
  }

  const BellIcon = sonnette ? BellRing : Bell

  return (
    <div ref={panneauRef} style={{ position: 'relative' }}>

      {/* ── Bouton cloche ── */}
      <button
        onClick={() => setOuvert(prev => !prev)}
        title="Notifications"
        style={{
          position: 'relative', width: '40px', height: '40px', borderRadius: '50%',
          background: ouvert ? 'rgba(29,110,245,0.12)' : 'rgba(255,255,255,0.72)',
          border: `1px solid ${ouvert ? 'rgba(29,110,245,0.30)' : 'rgba(190,215,255,0.55)'}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0, transition: 'all 0.2s',
          animation: sonnette ? 'sonnette 0.5s ease-in-out 2' : 'none',
        }}
        onMouseEnter={e => { if (!ouvert) { e.currentTarget.style.background = 'rgba(29,110,245,0.08)'; e.currentTarget.style.borderColor = 'rgba(29,110,245,0.25)' } }}
        onMouseLeave={e => { if (!ouvert) { e.currentTarget.style.background = 'rgba(255,255,255,0.72)'; e.currentTarget.style.borderColor = 'rgba(190,215,255,0.55)' } }}
      >
        <BellIcon size={17} strokeWidth={2} color={ouvert || nonLues > 0 ? '#1d6ef5' : '#4a6a9e'} style={{ transition: 'color 0.2s' }} />
        {nonLues > 0 && (
          <span style={{
            position: 'absolute', top: '-2px', right: '-2px',
            minWidth: '17px', height: '17px', borderRadius: '50px',
            background: '#ef4444', color: '#fff', fontSize: '9px', fontWeight: '800',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '0 4px', border: '2px solid rgba(240,247,255,0.9)', lineHeight: 1, fontFamily: 'inherit',
          }}>
            {nonLues > 99 ? '99+' : nonLues}
          </span>
        )}
      </button>

      {/* ── Panneau déroulant ── */}
      {ouvert && (
        <div style={{
          position: 'absolute', top: '48px', right: 0, width: '370px', maxHeight: '500px',
          background: 'rgba(235,245,255,0.96)', backdropFilter: 'blur(28px)', WebkitBackdropFilter: 'blur(28px)',
          borderRadius: '20px', border: '1px solid rgba(190,215,255,0.60)',
          boxShadow: '0 16px 48px rgba(13,42,92,0.14)', zIndex: 300,
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'apparaitre 0.18s ease',
        }}>

          {/* En-tête */}
          <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid rgba(190,215,255,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: '800', color: '#0d2a5c', margin: 0 }}>Notifications</h3>
              <p style={{ fontSize: '11px', color: '#7a9cc5', margin: '2px 0 0', fontWeight: '500' }}>
                {nonLues > 0 ? `${nonLues} non lue${nonLues > 1 ? 's' : ''}` : 'Tout est lu'}
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {nonLues > 0 && (
                <button onClick={toutMarquerLu} title="Tout marquer comme lu"
                  style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(29,110,245,0.07)', border: 'none', color: '#1d6ef5', fontSize: '11px', fontWeight: '700', padding: '5px 10px', borderRadius: '50px', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <CheckCheck size={12} strokeWidth={2.5} />Tout lire
                </button>
              )}
              <button onClick={() => setOuvert(false)}
                style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(190,215,255,0.25)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#5a7aaa' }}>
                <X size={13} strokeWidth={2.2} />
              </button>
            </div>
          </div>

          {/* Corps */}
          <div style={{ overflowY: 'auto', flex: 1 }}>

            {chargement && (
              <div style={{ padding: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <Loader2 size={16} strokeWidth={2} color="#1d6ef5" style={{ animation: 'spin 1s linear infinite' }} />
                <span style={{ fontSize: '12px', color: '#7a9cc5' }}>Chargement...</span>
              </div>
            )}

            {!chargement && notifications.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center' }}>
                <div style={{ width: '48px', height: '48px', margin: '0 auto 12px', background: 'rgba(190,215,255,0.25)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Bell size={22} strokeWidth={1.5} color="#7a9cc5" />
                </div>
                <p style={{ fontSize: '13px', fontWeight: '600', color: '#5a7aaa', margin: '0 0 4px' }}>Aucune notification</p>
                <p style={{ fontSize: '11.5px', color: '#7a9cc5', margin: 0 }}>Vous êtes à jour !</p>
              </div>
            )}

            {!chargement && notifications.map((notif, i) => {
              const Icn       = iconeParType(notif.type)
              const couleur   = couleurParType(notif.type)
              const nonLue    = notif.lu === 0
              const isNvClient = estNouveauClient(notif)
              const badgeVu   = badgesVus.has(notif.id)
              const montrerBadge = isNvClient && nonLue && !badgeVu

              return (
                <div
                  key={notif.id}
                  onClick={() => clicNotification(notif)}
                  onMouseEnter={() => survolNotification(notif)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: '11px',
                    padding: '13px 16px',
                    cursor: (notif.demande_id || isNvClient) ? 'pointer' : 'default',
                    background: nonLue ? 'rgba(29,110,245,0.04)' : 'transparent',
                    borderBottom: i < notifications.length - 1 ? '1px solid rgba(190,215,255,0.22)' : 'none',
                    transition: 'background 0.15s', position: 'relative',
                  }}
                  onMouseEnterCapture={e => { if (notif.demande_id || isNvClient) e.currentTarget.style.background = nonLue ? 'rgba(29,110,245,0.08)' : 'rgba(190,215,255,0.12)' }}
                  onMouseLeaveCapture={e => { e.currentTarget.style.background = nonLue ? 'rgba(29,110,245,0.04)' : 'transparent' }}
                >
                  {/* Icône type */}
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '10px',
                    background: couleur.bg,
                    border: `1px solid ${couleur.bg.replace('0.12', '0.25')}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0, marginTop: '1px',
                  }}>
                    <Icn size={15} strokeWidth={2} color={couleur.color} />
                  </div>

                  {/* Texte */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '12.5px', fontWeight: nonLue ? '700' : '600', color: '#0d2a5c', lineHeight: '1.4' }}>
                        {notif.titre}
                      </span>
                      {/* Badge NOUVEAU */}
                      {montrerBadge && (
                        <span style={{
                          fontSize: '8.5px', fontWeight: '800', padding: '2px 7px',
                          borderRadius: '50px', background: '#10b981', color: '#fff',
                          letterSpacing: '0.5px', textTransform: 'uppercase',
                          animation: 'pulseBadge 1.8s ease-in-out infinite',
                          flexShrink: 0,
                        }}>
                          NOUVEAU
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: '11.5px', color: '#5a7aaa', fontWeight: '500', lineHeight: '1.5',
                      overflow: 'hidden', display: '-webkit-box',
                      WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                    }}>
                      {notif.message}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '5px' }}>
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: couleur.dot, flexShrink: 0 }} />
                      <span style={{ fontSize: '10px', color: '#7a9cc5', fontWeight: '600' }}>
                        {dateRelative(notif.date_creation)}
                      </span>
                      {(notif.demande_id || isNvClient) && (
                        <>
                          <span style={{ color: 'rgba(122,156,197,0.4)', fontSize: '10px' }}>·</span>
                          <span style={{ fontSize: '10px', color: '#1d6ef5', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '2px' }}>
                            {isNvClient ? 'Voir utilisateurs' : 'Voir'}
                            <ChevronRight size={9} strokeWidth={2.5} />
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions : point lu + supprimer */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 }}>
                    {nonLue && (
                      <span style={{
                        width: '7px', height: '7px', borderRadius: '50%',
                        background: '#1d6ef5', boxShadow: '0 0 5px rgba(29,110,245,0.5)',
                        display: 'block', alignSelf: 'flex-end', marginBottom: '4px',
                      }} />
                    )}
                    <button
                      onClick={e => supprimer(e, notif.id)}
                      title="Supprimer"
                      style={{
                        width: '24px', height: '24px', borderRadius: '6px',
                        background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.15)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', color: '#ef4444', flexShrink: 0, transition: 'all 0.15s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)' }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.07)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)' }}
                    >
                      <Trash2 size={11} strokeWidth={2} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Pied de panneau */}
          {notifications.length > 0 && (
            <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(190,215,255,0.30)', flexShrink: 0, textAlign: 'center', background: 'rgba(255,255,255,0.50)' }}>
              <span style={{ fontSize: '11px', color: '#7a9cc5', fontWeight: '500' }}>
                {notifications.length} notification{notifications.length > 1 ? 's' : ''} au total
              </span>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }
        @keyframes sonnette { 0%, 100% { transform: rotate(0deg) } 25% { transform: rotate(-15deg) } 75% { transform: rotate(15deg) } }
        @keyframes apparaitre { from { opacity: 0; transform: translateY(-8px) scale(0.97) } to { opacity: 1; transform: translateY(0) scale(1) } }
        @keyframes pulseBadge { 0%, 100% { opacity: 1; transform: scale(1) } 50% { opacity: 0.75; transform: scale(0.95) } }
      `}</style>
    </div>
  )
}