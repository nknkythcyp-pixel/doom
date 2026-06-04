// ============================================
// CONNEXION.JSX — Page d'authentification DOOM
// ✅ Validation email   : domaines acceptés (gmail, yahoo, outlook…)
//                         extensions acceptées (.com, .fr, .net…)
// ✅ Validation téléphone : sélecteur de pays + indicatif automatique
//                          format local validé selon le pays
// ✅ Validation mot de passe : min 8 chars, 1 majuscule, 1 chiffre
//                              caractères spéciaux autorisés mais pas obligatoires
// ✅ Feedback visuel temps réel sur chaque champ
// ✅ Design glassmorphism bleu DOOM inchangé
// ============================================

import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexte/AuthContexte'
import {
  Mail, Lock, User, Phone, Eye, EyeOff,
  ArrowRight, CheckCircle, AlertCircle, Loader2,
  ChevronDown, Check, X,
} from 'lucide-react'

// ════════════════════════════════════════════════════════════
// LISTE DES PAYS avec indicatifs et formats de numéros
// Couvre tous les continents
// ════════════════════════════════════════════════════════════
const PAYS = [
  // Afrique centrale
  { code: 'CM', nom: 'Cameroun',          indicatif: '+237', drapeau: '🇨🇲', longueur: 9,  exemple: '6XX XXX XXX' },
  { code: 'CG', nom: 'Congo',             indicatif: '+242', drapeau: '🇨🇬', longueur: 9,  exemple: 'XX XXX XXXX' },
  { code: 'GA', nom: 'Gabon',             indicatif: '+241', drapeau: '🇬🇦', longueur: 8,  exemple: 'XX XX XX XX' },
  { code: 'TD', nom: 'Tchad',             indicatif: '+235', drapeau: '🇹🇩', longueur: 8,  exemple: 'XX XX XX XX' },
  { code: 'CF', nom: 'Centrafrique',      indicatif: '+236', drapeau: '🇨🇫', longueur: 8,  exemple: 'XX XX XX XX' },
  // Afrique de l'ouest
  { code: 'SN', nom: 'Sénégal',           indicatif: '+221', drapeau: '🇸🇳', longueur: 9,  exemple: '7X XXX XXXX' },
  { code: 'CI', nom: "Côte d'Ivoire",     indicatif: '+225', drapeau: '🇨🇮', longueur: 10, exemple: 'XX XX XXX XXX' },
  { code: 'NG', nom: 'Nigeria',           indicatif: '+234', drapeau: '🇳🇬', longueur: 10, exemple: 'XXX XXX XXXX' },
  { code: 'GH', nom: 'Ghana',             indicatif: '+233', drapeau: '🇬🇭', longueur: 9,  exemple: 'XX XXX XXXX' },
  { code: 'ML', nom: 'Mali',              indicatif: '+223', drapeau: '🇲🇱', longueur: 8,  exemple: 'XX XX XX XX' },
  { code: 'BF', nom: 'Burkina Faso',      indicatif: '+226', drapeau: '🇧🇫', longueur: 8,  exemple: 'XX XX XX XX' },
  { code: 'GN', nom: 'Guinée',            indicatif: '+224', drapeau: '🇬🇳', longueur: 9,  exemple: 'XXX XX XX XX' },
  { code: 'BJ', nom: 'Bénin',             indicatif: '+229', drapeau: '🇧🇯', longueur: 8,  exemple: 'XX XX XX XX' },
  { code: 'TG', nom: 'Togo',              indicatif: '+228', drapeau: '🇹🇬', longueur: 8,  exemple: 'XX XX XX XX' },
  // Afrique de l'est
  { code: 'KE', nom: 'Kenya',             indicatif: '+254', drapeau: '🇰🇪', longueur: 9,  exemple: '7XX XXX XXX' },
  { code: 'TZ', nom: 'Tanzanie',          indicatif: '+255', drapeau: '🇹🇿', longueur: 9,  exemple: '7XX XXX XXX' },
  { code: 'ET', nom: 'Éthiopie',          indicatif: '+251', drapeau: '🇪🇹', longueur: 9,  exemple: '9X XXX XXXX' },
  { code: 'RW', nom: 'Rwanda',            indicatif: '+250', drapeau: '🇷🇼', longueur: 9,  exemple: '7XX XXX XXX' },
  // Afrique du nord
  { code: 'MA', nom: 'Maroc',             indicatif: '+212', drapeau: '🇲🇦', longueur: 9,  exemple: '6XX XXX XXX' },
  { code: 'DZ', nom: 'Algérie',           indicatif: '+213', drapeau: '🇩🇿', longueur: 9,  exemple: '5XX XXX XXX' },
  { code: 'TN', nom: 'Tunisie',           indicatif: '+216', drapeau: '🇹🇳', longueur: 8,  exemple: 'XX XXX XXX' },
  { code: 'EG', nom: 'Égypte',            indicatif: '+20',  drapeau: '🇪🇬', longueur: 10, exemple: '1XX XXX XXXX' },
  // Afrique australe
  { code: 'ZA', nom: 'Afrique du Sud',    indicatif: '+27',  drapeau: '🇿🇦', longueur: 9,  exemple: '6X XXX XXXX' },
  // Europe
  { code: 'FR', nom: 'France',            indicatif: '+33',  drapeau: '🇫🇷', longueur: 9,  exemple: '6XX XXX XXX' },
  { code: 'BE', nom: 'Belgique',          indicatif: '+32',  drapeau: '🇧🇪', longueur: 9,  exemple: '4XX XXX XXX' },
  { code: 'CH', nom: 'Suisse',            indicatif: '+41',  drapeau: '🇨🇭', longueur: 9,  exemple: '7X XXX XXXX' },
  { code: 'DE', nom: 'Allemagne',         indicatif: '+49',  drapeau: '🇩🇪', longueur: 10, exemple: '1XX XXXXXXX' },
  { code: 'ES', nom: 'Espagne',           indicatif: '+34',  drapeau: '🇪🇸', longueur: 9,  exemple: '6XX XXX XXX' },
  { code: 'IT', nom: 'Italie',            indicatif: '+39',  drapeau: '🇮🇹', longueur: 10, exemple: '3XX XXX XXXX' },
  { code: 'GB', nom: 'Royaume-Uni',       indicatif: '+44',  drapeau: '🇬🇧', longueur: 10, exemple: '7XXX XXXXXX' },
  { code: 'PT', nom: 'Portugal',          indicatif: '+351', drapeau: '🇵🇹', longueur: 9,  exemple: '9XX XXX XXX' },
  { code: 'NL', nom: 'Pays-Bas',          indicatif: '+31',  drapeau: '🇳🇱', longueur: 9,  exemple: '6XX XXX XXX' },
  // Amérique
  { code: 'US', nom: 'États-Unis',        indicatif: '+1',   drapeau: '🇺🇸', longueur: 10, exemple: '(XXX) XXX-XXXX' },
  { code: 'CA', nom: 'Canada',            indicatif: '+1',   drapeau: '🇨🇦', longueur: 10, exemple: '(XXX) XXX-XXXX' },
  { code: 'BR', nom: 'Brésil',            indicatif: '+55',  drapeau: '🇧🇷', longueur: 11, exemple: '(XX) XXXXX-XXXX' },
  { code: 'MX', nom: 'Mexique',           indicatif: '+52',  drapeau: '🇲🇽', longueur: 10, exemple: 'XXX XXX XXXX' },
  // Asie & Moyen-Orient
  { code: 'CN', nom: 'Chine',             indicatif: '+86',  drapeau: '🇨🇳', longueur: 11, exemple: '1XX XXXX XXXX' },
  { code: 'IN', nom: 'Inde',              indicatif: '+91',  drapeau: '🇮🇳', longueur: 10, exemple: 'XXXXX XXXXX' },
  { code: 'JP', nom: 'Japon',             indicatif: '+81',  drapeau: '🇯🇵', longueur: 10, exemple: '90-XXXX-XXXX' },
  { code: 'AE', nom: 'Émirats arabes',    indicatif: '+971', drapeau: '🇦🇪', longueur: 9,  exemple: '5X XXX XXXX' },
  { code: 'SA', nom: 'Arabie Saoudite',   indicatif: '+966', drapeau: '🇸🇦', longueur: 9,  exemple: '5X XXX XXXX' },
  // Océanie
  { code: 'AU', nom: 'Australie',         indicatif: '+61',  drapeau: '🇦🇺', longueur: 9,  exemple: '4XX XXX XXX' },
]

// ════════════════════════════════════════════════════════════
// RÈGLES DE VALIDATION
// ════════════════════════════════════════════════════════════

/**
 * Valide l'email :
 * - Format général valide (arobase, point)
 * - Domaine accepté : gmail, yahoo, outlook, hotmail, icloud, protonmail, live, msn, aol
 * - OU extension reconnue : .com, .fr, .net, .org, .edu, .gov, .io, .co, .info, .biz
 */
const validerEmail = (email) => {
  const e = email.trim().toLowerCase()

  // Format de base
  const regexBase = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
  if (!regexBase.test(e)) {
    return { valide: false, message: 'Format email invalide (ex: nom@gmail.com)' }
  }

  // Domaines populaires acceptés sans restriction d'extension
  const domainesPopulaires = [
    'gmail.com', 'yahoo.com', 'yahoo.fr', 'outlook.com', 'outlook.fr',
    'hotmail.com', 'hotmail.fr', 'icloud.com', 'protonmail.com',
    'live.com', 'live.fr', 'msn.com', 'aol.com',
  ]

  // Extensions acceptées pour les autres domaines
  const extensionsAcceptees = [
    '.com', '.fr', '.net', '.org', '.edu', '.gov', '.io',
    '.co', '.info', '.biz', '.cm', '.sn', '.ci', '.ma',
    '.dz', '.tn', '.ng', '.gh', '.ke', '.za',
  ]

  const domaine = e.split('@')[1]

  // Si le domaine est dans la liste populaire → OK
  if (domainesPopulaires.includes(domaine)) {
    return { valide: true, message: '' }
  }

  // Sinon vérifie que l'extension est reconnue
  const extensionValide = extensionsAcceptees.some(ext => domaine.endsWith(ext))
  if (!extensionValide) {
    return {
      valide:  false,
      message: 'Utilisez une adresse connue (gmail, yahoo, outlook…) ou une extension valide (.com, .fr, .net…)',
    }
  }

  return { valide: true, message: '' }
}

/**
 * Valide le mot de passe :
 * - Minimum 8 caractères
 * - Au moins 1 lettre majuscule
 * - Au moins 1 chiffre
 * - Les caractères spéciaux sont autorisés mais pas obligatoires
 */
const validerMotDePasse = (mdp) => {
  const erreurs = []

  if (mdp.length < 8)          erreurs.push('8 caractères minimum')
  if (!/[A-Z]/.test(mdp))      erreurs.push('1 majuscule minimum')
  if (!/[0-9]/.test(mdp))      erreurs.push('1 chiffre minimum')

  return {
    valide:   erreurs.length === 0,
    erreurs,
    // Niveau de force : 0 à 4
    force: mdp.length === 0 ? 0
         : erreurs.length >= 3 ? 1
         : erreurs.length === 2 ? 2
         : erreurs.length === 1 ? 3
         : 4,
  }
}

/**
 * Valide le numéro de téléphone selon le pays sélectionné :
 * - Retire les espaces, tirets et parenthèses
 * - Vérifie que le nombre de chiffres correspond au pays
 */
const validerTelephone = (numero, pays) => {
  // Retire tout sauf les chiffres
  const chiffres = numero.replace(/[\s\-().+]/g, '')

  if (chiffres.length === 0) {
    return { valide: false, message: 'Numéro requis' }
  }

  if (chiffres.length !== pays.longueur) {
    return {
      valide:  false,
      message: `${pays.longueur} chiffres requis pour ${pays.nom} (ex: ${pays.exemple})`,
    }
  }

  // Vérifie que ce sont bien des chiffres
  if (!/^\d+$/.test(chiffres)) {
    return { valide: false, message: 'Chiffres uniquement' }
  }

  return { valide: true, message: '' }
}

// ════════════════════════════════════════════════════════════
// COMPOSANT CHAMP DE FORMULAIRE réutilisable
// ════════════════════════════════════════════════════════════
const Champ = ({ id, label, type = 'text', placeholder, valeur, onChange, Icon, eye, onKeyDown, erreur, succes }) => (
  <div style={{ marginBottom: 10 }}>
    <label htmlFor={id} style={{
      display: 'block', fontSize: 10, fontWeight: 700,
      color: 'rgba(125,160,202,0.8)', letterSpacing: '1.8px',
      textTransform: 'uppercase', marginBottom: 5,
    }}>
      {label}
    </label>
    <div style={{
      display: 'flex', alignItems: 'center',
      background: erreur ? 'rgba(239,68,68,0.07)' : succes ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.06)',
      border: `1px solid ${erreur ? 'rgba(239,68,68,0.45)' : succes ? 'rgba(16,185,129,0.45)' : 'rgba(125,160,202,0.20)'}`,
      borderRadius: 10, padding: '0 12px', gap: 8, transition: 'all 0.2s',
    }}
      onFocus={() => {}}
    >
      {Icon && <Icon size={13} strokeWidth={2} color={erreur ? '#ef4444' : succes ? '#10b981' : '#5483B3'} style={{ flexShrink: 0 }} />}
      <input
        id={id} type={type} placeholder={placeholder} value={valeur}
        onChange={onChange} onKeyDown={onKeyDown}
        autoComplete="new-password" autoCorrect="off" autoCapitalize="off" spellCheck="false"
        name={`doom-${id}`}
        onFocus={e => {
          const p = e.target.closest('div')
          if (p && !erreur && !succes) {
            p.style.borderColor = 'rgba(29,110,245,0.7)'
            p.style.background  = 'rgba(29,110,245,0.08)'
            p.style.boxShadow   = '0 0 0 3px rgba(29,110,245,0.10)'
          }
        }}
        onBlur={e => {
          const p = e.target.closest('div')
          if (p && !erreur && !succes) {
            p.style.borderColor = 'rgba(125,160,202,0.20)'
            p.style.background  = 'rgba(255,255,255,0.06)'
            p.style.boxShadow   = 'none'
          }
        }}
        style={{
          flex: 1, border: 'none', outline: 'none',
          padding: '11px 0', fontSize: 13.5, fontWeight: 400,
          color: '#C1E8FF', background: 'transparent',
          fontFamily: "'DM Sans','Inter',sans-serif",
          width: '100%', minWidth: 0,
        }}
      />
      {/* Icône état validation */}
      {succes && !eye && <Check size={13} strokeWidth={2.5} color="#10b981" style={{ flexShrink: 0 }} />}
      {erreur && !eye && <X    size={13} strokeWidth={2.5} color="#ef4444" style={{ flexShrink: 0 }} />}
      {eye && (
        <button type="button" onClick={eye} tabIndex={-1}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: '#5483B3', display: 'flex', flexShrink: 0 }}>
          {type === 'password' ? <Eye size={13} strokeWidth={2} /> : <EyeOff size={13} strokeWidth={2} />}
        </button>
      )}
    </div>
    {/* Message d'erreur sous le champ */}
    {erreur && (
      <p style={{ fontSize: 10.5, color: '#fca5a5', fontWeight: 600, margin: '4px 0 0 4px', lineHeight: 1.4 }}>
        {erreur}
      </p>
    )}
  </div>
)

// ════════════════════════════════════════════════════════════
// COMPOSANT SÉLECTEUR DE PAYS
// ════════════════════════════════════════════════════════════
const SelecteurPays = ({ paysSelectionne, onChange }) => {
  const [ouvert,    setOuvert]    = useState(false)
  const [recherche, setRecherche] = useState('')
  const ref = useRef(null)

  // Ferme le dropdown en cliquant dehors
  useEffect(() => {
    const gerer = (e) => { if (ref.current && !ref.current.contains(e.target)) setOuvert(false) }
    if (ouvert) document.addEventListener('mousedown', gerer)
    return () => document.removeEventListener('mousedown', gerer)
  }, [ouvert])

  // Filtre les pays selon la recherche
  const paysFiltres = PAYS.filter(p =>
    p.nom.toLowerCase().includes(recherche.toLowerCase()) ||
    p.indicatif.includes(recherche)
  )

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bouton sélecteur */}
      <button
        type="button"
        onClick={() => setOuvert(!ouvert)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(125,160,202,0.20)',
          borderRadius: 10, padding: '11px 10px',
          cursor: 'pointer', fontFamily: 'inherit',
          color: '#C1E8FF', fontSize: 13,
          transition: 'all 0.2s', whiteSpace: 'nowrap',
          minWidth: 110,
        }}
      >
        <span style={{ fontSize: 15 }}>{paysSelectionne.drapeau}</span>
        <span style={{ fontWeight: 700, color: '#7DA0CA', fontSize: 12 }}>{paysSelectionne.indicatif}</span>
        <ChevronDown size={11} strokeWidth={2.5} color="#5483B3"
          style={{ transform: ouvert ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      {/* Dropdown liste des pays */}
      {ouvert && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 4,
          background: 'rgba(5,38,89,0.97)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(125,160,202,0.25)', borderRadius: 12,
          boxShadow: '0 16px 40px rgba(2,16,36,0.7)',
          zIndex: 200, width: 260, maxHeight: 280, overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Champ de recherche dans le dropdown */}
          <div style={{ padding: '8px 10px', borderBottom: '1px solid rgba(125,160,202,0.15)' }}>
            <input
              type="text"
              placeholder="Rechercher un pays…"
              value={recherche}
              onChange={e => setRecherche(e.target.value)}
              autoFocus
              style={{
                width: '100%', background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(125,160,202,0.20)', borderRadius: 7,
                padding: '7px 10px', fontSize: 12, color: '#C1E8FF',
                outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
              }}
            />
          </div>
          {/* Liste des pays filtrés */}
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {paysFiltres.length === 0 ? (
              <p style={{ fontSize: 12, color: '#7DA0CA', textAlign: 'center', padding: '16px 0' }}>
                Aucun résultat
              </p>
            ) : paysFiltres.map(p => (
              <button
                key={p.code}
                type="button"
                onClick={() => { onChange(p); setOuvert(false); setRecherche('') }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: '9px 14px', border: 'none',
                  background: p.code === paysSelectionne.code
                    ? 'rgba(29,110,245,0.15)'
                    : 'transparent',
                  cursor: 'pointer', fontFamily: 'inherit',
                  transition: 'background 0.15s', textAlign: 'left',
                }}
                onMouseEnter={e => { if (p.code !== paysSelectionne.code) e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
                onMouseLeave={e => { if (p.code !== paysSelectionne.code) e.currentTarget.style.background = 'transparent' }}
              >
                <span style={{ fontSize: 16 }}>{p.drapeau}</span>
                <span style={{ fontSize: 12, color: '#C1E8FF', fontWeight: 600, flex: 1 }}>{p.nom}</span>
                <span style={{ fontSize: 11, color: '#7DA0CA', fontWeight: 700 }}>{p.indicatif}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ════════════════════════════════════════════════════════════
export default function Connexion() {
  const { connexion, inscription } = useAuth()

  // ── États généraux ──
  const [mode,    setMode]    = useState('connexion')
  const [erreur,  setErreur]  = useState('')
  const [loading, setLoading] = useState(false)
  const [voirMdp, setVoirMdp] = useState(false)
  const [voirCf,  setVoirCf]  = useState(false)
  const [mounted, setMounted] = useState(false)

  // ── Champs connexion ──
  const [co, setCo] = useState({ email: '', motDePasse: '' })
  const emailRef = useRef(null)
  const pwRef    = useRef(null)

  // ── Champs inscription ──
  const [ins, setIns] = useState({
    nom: '', prenom: '', email: '',
    telephone: '', motDePasse: '', confirmation: '',
  })

  // ── Pays sélectionné pour le téléphone (Cameroun par défaut) ──
  const [paysSelectionne, setPaysSelectionne] = useState(
    PAYS.find(p => p.code === 'CM')
  )

  // ── États de validation en temps réel ──
  const [toucheEmail, setToucheEmail]   = useState(false) // l'utilisateur a commencé à taper
  const [toucheTel,   setToucheTel]     = useState(false)
  const [toucheMdp,   setToucheMdp]     = useState(false)
  const [toucheCf,    setToucheCf]      = useState(false)

  useEffect(() => {
    setTimeout(() => setMounted(true), 60)
    setCo({ email: '', motDePasse: '' })
    setTimeout(() => {
      if (emailRef.current) emailRef.current.value = ''
      if (pwRef.current)    pwRef.current.value    = ''
    }, 100)
  }, [])

  // Remet les champs à zéro quand on revient sur "connexion"
  useEffect(() => {
    if (mode === 'connexion') {
      setCo({ email: '', motDePasse: '' })
      setToucheEmail(false)
      setTimeout(() => {
        if (emailRef.current) emailRef.current.value = ''
        if (pwRef.current)    pwRef.current.value    = ''
      }, 50)
    }
    if (mode === 'inscription') {
      // Remet l'état de validation à zéro quand on bascule
      setToucheEmail(false)
      setToucheTel(false)
      setToucheMdp(false)
      setToucheCf(false)
    }
  }, [mode])

  // ── Calcul des validations en temps réel ──
  const validEmail   = validerEmail(ins.email)
  const validTel     = validerTelephone(ins.telephone, paysSelectionne)
  const validMdp     = validerMotDePasse(ins.motDePasse)
  const mdpIdentique = ins.motDePasse === ins.confirmation && ins.confirmation.length > 0

  // Couleur de la barre de force du mot de passe
  const couleurForce = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981'][validMdp.force]
  const libelleForce = ['', 'Très faible', 'Faible', 'Moyen', 'Fort'][validMdp.force]

  // ── Numéro de téléphone complet avec indicatif ──
  const telephoneComplet = ins.telephone
    ? `${paysSelectionne.indicatif}${ins.telephone.replace(/[\s\-().+]/g, '')}`
    : ''

  // ════════════════════════
  // SOUMETTRE CONNEXION
  // ════════════════════════
  const soumettreCo = async () => {
    setErreur('')
    const email = emailRef.current?.value || co.email
    const mdp   = pwRef.current?.value   || co.motDePasse
    if (!email || !mdp) { setErreur('Remplissez tous les champs'); return }
    setLoading(true)
    const r = await connexion(email, mdp)
    if (!r.succes) setErreur(r.message)
    setLoading(false)
  }

  // ════════════════════════
  // SOUMETTRE INSCRIPTION
  // ════════════════════════
  const soumettreIns = async () => {
    setErreur('')

    // Marque tous les champs comme touchés pour afficher les erreurs
    setToucheEmail(true)
    setToucheTel(true)
    setToucheMdp(true)
    setToucheCf(true)

    // Vérifie les champs obligatoires
    if (!ins.nom || !ins.prenom) {
      setErreur('Nom et prénom sont obligatoires')
      return
    }

    // Validation email
    if (!validEmail.valide) {
      setErreur(validEmail.message)
      return
    }

    // Validation téléphone
    if (ins.telephone && !validTel.valide) {
      setErreur(validTel.message)
      return
    }

    // Validation mot de passe
    if (!validMdp.valide) {
      setErreur(`Mot de passe : ${validMdp.erreurs.join(', ')}`)
      return
    }

    // Confirmation mot de passe
    if (ins.motDePasse !== ins.confirmation) {
      setErreur('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    const r = await inscription({
      nom:       ins.nom,
      prenom:    ins.prenom,
      email:     ins.email,
      // Envoie le numéro avec l'indicatif pays
      telephone: telephoneComplet || ins.telephone,
      motDePasse: ins.motDePasse,
    })
    if (!r.succes) setErreur(r.message)
    setLoading(false)
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        html,body{height:100%}

        @keyframes fadeUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes slideIn  { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
        @keyframes spin     { from{transform:rotate(0)} to{transform:rotate(360deg)} }
        @keyframes pulse    { 0%,100%{opacity:0.4;transform:scale(1)} 50%{opacity:0.7;transform:scale(1.04)} }
        @keyframes floatY   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes circuit1 { 0%{stroke-dashoffset:400} 100%{stroke-dashoffset:0} }
        @keyframes circuit2 { 0%{stroke-dashoffset:300} 100%{stroke-dashoffset:0} }
        @keyframes glowDot  { 0%,100%{opacity:0.3} 50%{opacity:1} }

        .page {
          min-height:100vh; min-height:100dvh;
          display:flex; flex-direction:column; align-items:center; justify-content:center;
          padding:24px 16px;
          font-family:'DM Sans','Inter',sans-serif;
          position:relative; overflow:hidden;
          background: radial-gradient(ellipse 120% 80% at 50% 0%, #0a2d5c 0%, #042050 25%, #021024 60%, #010e1d 100%);
        }
        .halo { position:absolute; border-radius:50%; pointer-events:none; filter:blur(80px); animation:pulse 8s ease-in-out infinite; }
        .circuits { position:absolute; inset:0; pointer-events:none; overflow:hidden; }

        .wrap {
          width:100%; max-width:380px; position:relative; z-index:2;
          opacity:0; transform:translateY(22px);
          transition: opacity 0.5s cubic-bezier(0.25,0.8,0.25,1), transform 0.5s cubic-bezier(0.25,0.8,0.25,1);
        }
        .wrap.show { opacity:1; transform:translateY(0); }

        .logo-zone { text-align:center; margin-bottom:20px; }
        .logo-icon {
          display:inline-flex; align-items:center; justify-content:center;
          width:64px; height:64px; margin:0 auto 10px;
          background:linear-gradient(145deg,#1340c0,#1d6ef5); border-radius:16px;
          box-shadow:0 8px 24px rgba(29,110,245,0.40), inset 0 1px 0 rgba(255,255,255,0.15);
          animation:floatY 4s ease-in-out infinite; position:relative; overflow:hidden;
        }
        .logo-icon::before { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.12) 0%,transparent 60%); }
        .logo-text { font-size:22px; font-weight:900; color:#C1E8FF; letter-spacing:5px; display:block; }

        .accroche { text-align:center; margin-bottom:22px; }
        .accroche h1 { font-size:clamp(18px,4vw,24px); font-weight:900; color:#fff; line-height:1.2; letter-spacing:-0.3px; margin-bottom:6px; }
        .accroche h1 em { font-style:normal; background:linear-gradient(90deg,#60a5fa 0%,#93c5fd 50%,#C1E8FF 100%); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .accroche p { font-size:11.5px; color:rgba(125,160,202,0.7); font-weight:400; }

        .card {
          background:rgba(5,38,89,0.30); backdrop-filter:blur(24px); -webkit-backdrop-filter:blur(24px);
          border:1px solid rgba(125,160,202,0.18); border-radius:18px; padding:22px 22px 18px;
          box-shadow:0 24px 64px rgba(2,16,36,0.55),0 4px 16px rgba(29,110,245,0.12),inset 0 1px 0 rgba(255,255,255,0.07);
        }

        .tog { display:flex; background:rgba(2,16,36,0.55); border-radius:50px; padding:3px; margin-bottom:18px; border:1px solid rgba(84,131,179,0.14); gap:3px; }
        .tb  { flex:1; padding:8px 12px; border-radius:50px; border:none; font-size:12px; font-weight:700; cursor:pointer; font-family:inherit; transition:all 0.25s cubic-bezier(0.25,0.8,0.25,1); }

        .ft { font-size:17px; font-weight:900; color:#C1E8FF; margin-bottom:3px; letter-spacing:-0.3px; }
        .fs { font-size:11px; color:rgba(84,131,179,0.8); margin-bottom:16px; }

        .er { display:flex; align-items:flex-start; gap:7px; background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.22); border-radius:8px; padding:9px 11px; margin-bottom:12px; animation:fadeIn 0.2s ease; }

        .g2 { display:grid; grid-template-columns:1fr 1fr; gap:0 10px; }
        @media(max-width:340px){ .g2{grid-template-columns:1fr} }

        .btn {
          width:100%; padding:12px; border-radius:50px; border:none;
          font-size:13.5px; font-weight:800; cursor:pointer; font-family:inherit;
          display:flex; align-items:center; justify-content:center; gap:8px;
          background:linear-gradient(135deg,#1340c0 0%,#1d6ef5 55%,#3b82f6 100%); color:#fff;
          box-shadow:0 6px 20px rgba(29,110,245,0.40),0 2px 6px rgba(29,110,245,0.20);
          transition:all 0.25s cubic-bezier(0.25,0.8,0.25,1); margin-top:10px; position:relative; overflow:hidden;
        }
        .btn::after { content:''; position:absolute; inset:0; background:linear-gradient(135deg,rgba(255,255,255,0.10) 0%,transparent 60%); pointer-events:none; }
        .btn:hover:not(:disabled){ transform:translateY(-2px); box-shadow:0 10px 28px rgba(29,110,245,0.55); }
        .btn:active:not(:disabled){ transform:translateY(0); }
        .btn:disabled{ background:rgba(5,38,89,0.5); color:rgba(84,131,179,0.6); box-shadow:none; cursor:not-allowed; }

        .lien { color:#7DA0CA; font-weight:700; cursor:pointer; transition:color 0.15s; }
        .lien:hover { color:#C1E8FF; }

        /* Barres force mot de passe */
        .bars { display:flex; gap:3px; margin:-4px 0 8px; }
        .bar  { flex:1; height:3px; border-radius:2px; transition:background 0.3s; }

        .form-enter { animation:slideIn 0.25s cubic-bezier(0.25,0.8,0.25,1) both; }

        /* Scrollbar du dropdown pays */
        .dropdown-pays::-webkit-scrollbar { width:4px; }
        .dropdown-pays::-webkit-scrollbar-track { background:transparent; }
        .dropdown-pays::-webkit-scrollbar-thumb { background:rgba(125,160,202,0.3); border-radius:2px; }

        @media(max-width:420px){
          .page{ padding:20px 12px; justify-content:flex-start; padding-top:32px; }
          .wrap{ max-width:100%; }
          .card{ padding:18px 16px 14px; border-radius:14px; }
          .logo-icon{ width:54px; height:54px; border-radius:13px; }
        }
        @media(max-width:340px){ .card{ padding:14px 13px 12px; } .logo-text{ font-size:19px; } }
      `}</style>

      <div className="page">

        {/* ── Halos de fond ── */}
        <div className="halo" style={{ width:500, height:500, top:-200, left:'50%', transform:'translateX(-50%)', background:'radial-gradient(circle,rgba(29,110,245,0.20) 0%,transparent 65%)', animationDelay:'0s' }} />
        <div className="halo" style={{ width:300, height:300, bottom:-80, right:-60, background:'radial-gradient(circle,rgba(5,38,89,0.85) 0%,transparent 70%)', animationDelay:'3s' }} />
        <div className="halo" style={{ width:200, height:200, top:'30%', left:-50, background:'radial-gradient(circle,rgba(29,78,216,0.12) 0%,transparent 70%)', animationDelay:'1.5s' }} />

        {/* ── Circuits décoratifs ── */}
        <div className="circuits">
          <svg width="100%" height="100%" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
            <g stroke="rgba(29,110,245,0.25)" strokeWidth="1.5" fill="none">
              <path d="M0,500 L60,500 L60,460 L120,460 L120,420 L200,420" strokeDasharray="400" strokeDashoffset="400" style={{ animation:'circuit1 3s ease 0.5s forwards' }} />
              <path d="M0,540 L40,540 L40,490 L100,490 L100,440 L160,440 L160,400 L240,400" strokeDasharray="300" strokeDashoffset="300" style={{ animation:'circuit2 3s ease 0.8s forwards' }} />
              <circle cx="60"  cy="500" r="4" fill="rgba(29,110,245,0.5)" style={{ animation:'glowDot 2s ease-in-out 1s infinite' }} />
              <circle cx="120" cy="460" r="3" fill="rgba(29,110,245,0.4)" style={{ animation:'glowDot 2s ease-in-out 1.3s infinite' }} />
              <circle cx="200" cy="420" r="4" fill="rgba(29,110,245,0.5)" style={{ animation:'glowDot 2.5s ease-in-out 0.5s infinite' }} />
            </g>
            <g stroke="rgba(29,110,245,0.22)" strokeWidth="1.5" fill="none">
              <path d="M800,80 L740,80 L740,120 L680,120 L680,160 L600,160" strokeDasharray="350" strokeDashoffset="350" style={{ animation:'circuit1 3s ease 1s forwards' }} />
              <path d="M800,40 L760,40 L760,90 L700,90 L700,140 L640,140 L640,180 L560,180" strokeDasharray="280" strokeDashoffset="280" style={{ animation:'circuit2 3s ease 1.2s forwards' }} />
              <circle cx="740" cy="80"  r="4" fill="rgba(29,110,245,0.5)" style={{ animation:'glowDot 2s ease-in-out 0.8s infinite' }} />
              <circle cx="680" cy="120" r="3" fill="rgba(125,160,202,0.4)" style={{ animation:'glowDot 2.5s ease-in-out 1.1s infinite' }} />
              <circle cx="600" cy="160" r="4" fill="rgba(29,110,245,0.5)" style={{ animation:'glowDot 2s ease-in-out 0.4s infinite' }} />
            </g>
          </svg>
        </div>

        {/* ══ WRAPPER PRINCIPAL ══ */}
        <div className={`wrap ${mounted ? 'show' : ''}`}>

          {/* Logo DOOM */}
          <div className="logo-zone">
            <Link to="/" style={{ textDecoration: 'none' }}>
              <div className="logo-icon">
                <svg width="38" height="34" viewBox="0 0 38 34" fill="none">
                  <path d="M19 2L35 31H3L19 2Z" fill="white" fillOpacity="0.95" />
                  <path d="M19 8L30 28H8L19 8Z" fill="#1d6ef5" fillOpacity="0.6" />
                  <rect x="17" y="16" width="4" height="10" fill="white" fillOpacity="0.9" />
                  <circle cx="19" cy="6" r="2.5" fill="#93c5fd" />
                </svg>
              </div>
              <span className="logo-text">D<span style={{ color:'#60a5fa' }}>OO</span>M<span style={{ color:'#60a5fa' }}>.</span></span>
            </Link>
          </div>

          {/* Accroche dynamique */}
          <div className="accroche">
            <h1 key={mode} style={{ animation:'fadeIn 0.3s ease both' }}>
              {mode === 'connexion' ? <><em>Bienvenue</em> sur DOOM</> : <>Rejoignez <em>DOOM</em></>}
            </h1>
            <p key={mode + 's'} style={{ animation:'fadeIn 0.3s ease 0.1s both' }}>
              {mode === 'connexion'
                ? 'Gérez vos interventions techniques en temps réel.'
                : 'Des techniciens qualifiés à portée de main.'}
            </p>
          </div>

          {/* ══ CARD ══ */}
          <div className="card">

            {/* Toggle connexion / inscription */}
            <div className="tog">
              {[{ v:'connexion', l:'Se connecter' }, { v:'inscription', l:"S'inscrire" }].map(m => {
                const a = mode === m.v
                return (
                  <button key={m.v} className="tb"
                    onClick={() => { setMode(m.v); setErreur('') }}
                    style={{ background:a?'linear-gradient(135deg,#052659,#1d4ed8)':'transparent', color:a?'#C1E8FF':'rgba(84,131,179,0.8)', boxShadow:a?'0 3px 12px rgba(29,78,216,0.30)':'none' }}>
                    {m.l}
                  </button>
                )
              })}
            </div>

            <div className="ft" key={mode+'t'} style={{ animation:'fadeIn 0.25s ease both' }}>
              {mode === 'connexion' ? 'Bon retour !' : 'Créer un compte'}
            </div>
            <div className="fs">{mode === 'connexion' ? 'Entrez vos identifiants' : 'Inscription gratuite'}</div>

            {/* Alerte d'erreur globale */}
            {erreur && (
              <div className="er">
                <AlertCircle size={13} strokeWidth={2} color="#ef4444" style={{ flexShrink:0, marginTop:1 }} />
                <span style={{ fontSize:11.5, color:'#fca5a5', fontWeight:600, lineHeight:1.4 }}>{erreur}</span>
              </div>
            )}

            {/* ══════════════════════
                FORMULAIRE CONNEXION
            ══════════════════════ */}
            {mode === 'connexion' && (
              <div className="form-enter">
                {/* Email connexion */}
                <div style={{ marginBottom:10 }}>
                  <label htmlFor="cx-email" style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(125,160,202,0.8)', letterSpacing:'1.8px', textTransform:'uppercase', marginBottom:5 }}>Email</label>
                  <div style={{ display:'flex', alignItems:'center', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(125,160,202,0.20)', borderRadius:10, padding:'0 12px', gap:8, transition:'all 0.2s' }}>
                    <Mail size={13} strokeWidth={2} color="#5483B3" style={{ flexShrink:0 }} />
                    <input
                      id="cx-email" ref={emailRef} type="text" placeholder="votre@email.com"
                      autoComplete="off" autoCorrect="off" name={`em-${Date.now()}`}
                      onChange={e => setCo(p => ({ ...p, email: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && soumettreCo()}
                      onFocus={e => { const p=e.target.closest('div'); if(p){p.style.borderColor='rgba(29,110,245,0.7)';p.style.background='rgba(29,110,245,0.08)';p.style.boxShadow='0 0 0 3px rgba(29,110,245,0.10)'} }}
                      onBlur={e  => { const p=e.target.closest('div'); if(p){p.style.borderColor='rgba(125,160,202,0.20)';p.style.background='rgba(255,255,255,0.06)';p.style.boxShadow='none'} }}
                      style={{ flex:1, border:'none', outline:'none', padding:'11px 0', fontSize:13.5, color:'#C1E8FF', background:'transparent', fontFamily:"'DM Sans','Inter',sans-serif", width:'100%', minWidth:0 }}
                    />
                  </div>
                </div>
                {/* Mot de passe connexion */}
                <div style={{ marginBottom:10 }}>
                  <label htmlFor="cx-pw" style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(125,160,202,0.8)', letterSpacing:'1.8px', textTransform:'uppercase', marginBottom:5 }}>Mot de passe</label>
                  <div style={{ display:'flex', alignItems:'center', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(125,160,202,0.20)', borderRadius:10, padding:'0 12px', gap:8, transition:'all 0.2s' }}>
                    <Lock size={13} strokeWidth={2} color="#5483B3" style={{ flexShrink:0 }} />
                    <input
                      id="cx-pw" ref={pwRef} type={voirMdp?'text':'password'} placeholder="••••••••"
                      autoComplete="new-password" name={`pw-${Date.now()}`}
                      onChange={e => setCo(p => ({ ...p, motDePasse: e.target.value }))}
                      onKeyDown={e => e.key === 'Enter' && soumettreCo()}
                      onFocus={e => { const p=e.target.closest('div'); if(p){p.style.borderColor='rgba(29,110,245,0.7)';p.style.background='rgba(29,110,245,0.08)';p.style.boxShadow='0 0 0 3px rgba(29,110,245,0.10)'} }}
                      onBlur={e  => { const p=e.target.closest('div'); if(p){p.style.borderColor='rgba(125,160,202,0.20)';p.style.background='rgba(255,255,255,0.06)';p.style.boxShadow='none'} }}
                      style={{ flex:1, border:'none', outline:'none', padding:'11px 0', fontSize:13.5, color:'#C1E8FF', background:'transparent', fontFamily:"'DM Sans','Inter',sans-serif", width:'100%', minWidth:0 }}
                    />
                    <button type="button" onClick={() => setVoirMdp(!voirMdp)} tabIndex={-1}
                      style={{ background:'none', border:'none', cursor:'pointer', padding:0, color:'#5483B3', display:'flex', flexShrink:0 }}>
                      {voirMdp ? <EyeOff size={13} strokeWidth={2}/> : <Eye size={13} strokeWidth={2}/>}
                    </button>
                  </div>
                </div>
                <button className="btn" onClick={soumettreCo} disabled={loading}>
                  {loading ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }}/>Connexion...</> : <>Se connecter <ArrowRight size={14} strokeWidth={2.5}/></>}
                </button>
                <p style={{ textAlign:'center', fontSize:11.5, color:'rgba(84,131,179,0.8)', marginTop:14, fontWeight:500 }}>
                  Pas de compte ?{' '}<span className="lien" onClick={() => { setMode('inscription'); setErreur('') }}>S'inscrire</span>
                </p>
              </div>
            )}

            {/* ══════════════════════════════
                FORMULAIRE INSCRIPTION
                Avec toutes les validations
            ══════════════════════════════ */}
            {mode === 'inscription' && (
              <div className="form-enter">

                {/* Nom + Prénom */}
                <div className="g2">
                  <Champ id="in-nom" label="Nom *" placeholder="Nom" valeur={ins.nom}
                    onChange={e => setIns(p => ({ ...p, nom: e.target.value }))} Icon={User} />
                  <Champ id="in-pre" label="Prénom *" placeholder="Prénom" valeur={ins.prenom}
                    onChange={e => setIns(p => ({ ...p, prenom: e.target.value }))} Icon={User} />
                </div>

                {/* ── Email avec validation temps réel ── */}
                <Champ
                  id="in-em" label="Email *" type="email"
                  placeholder="votre@gmail.com"
                  valeur={ins.email}
                  onChange={e => { setIns(p => ({ ...p, email: e.target.value })); setToucheEmail(true) }}
                  Icon={Mail}
                  // Affiche erreur seulement si l'utilisateur a commencé à taper
                  erreur={toucheEmail && ins.email.length > 0 && !validEmail.valide ? validEmail.message : ''}
                  succes={toucheEmail && ins.email.length > 0 && validEmail.valide}
                />
                {/* Exemples de domaines acceptés */}
                {!toucheEmail && (
                  <p style={{ fontSize:10, color:'rgba(84,131,179,0.5)', margin:'-6px 0 10px 4px' }}>
                    gmail, yahoo, outlook, hotmail… ou extension .com .fr .net
                  </p>
                )}

                {/* ── Téléphone : sélecteur de pays + champ numéro ── */}
                <div style={{ marginBottom:10 }}>
                  <label style={{ display:'block', fontSize:10, fontWeight:700, color:'rgba(125,160,202,0.8)', letterSpacing:'1.8px', textTransform:'uppercase', marginBottom:5 }}>
                    Téléphone *
                  </label>
                  <div style={{ display:'flex', gap:8, alignItems:'flex-start' }}>
                    {/* Sélecteur pays avec indicatif */}
                    <SelecteurPays
                      paysSelectionne={paysSelectionne}
                      onChange={(pays) => {
                        setPaysSelectionne(pays)
                        // Revalide quand on change de pays
                        if (ins.telephone) setToucheTel(true)
                      }}
                    />
                    {/* Champ numéro local (sans l'indicatif) */}
                    <div style={{ flex:1 }}>
                      <div style={{
                        display:'flex', alignItems:'center',
                        background: toucheTel && ins.telephone && !validTel.valide ? 'rgba(239,68,68,0.07)' : toucheTel && ins.telephone && validTel.valide ? 'rgba(16,185,129,0.07)' : 'rgba(255,255,255,0.06)',
                        border:`1px solid ${toucheTel && ins.telephone && !validTel.valide ? 'rgba(239,68,68,0.45)' : toucheTel && ins.telephone && validTel.valide ? 'rgba(16,185,129,0.45)' : 'rgba(125,160,202,0.20)'}`,
                        borderRadius:10, padding:'0 12px', gap:8, transition:'all 0.2s',
                      }}>
                        <Phone size={13} strokeWidth={2} color={toucheTel && ins.telephone && !validTel.valide ? '#ef4444' : toucheTel && ins.telephone && validTel.valide ? '#10b981' : '#5483B3'} style={{ flexShrink:0 }} />
                        <input
                          type="tel"
                          placeholder={paysSelectionne.exemple}
                          value={ins.telephone}
                          onChange={e => {
                            // N'accepte que les chiffres, espaces et tirets
                            const v = e.target.value.replace(/[^0-9\s\-().]/g, '')
                            setIns(p => ({ ...p, telephone: v }))
                            setToucheTel(true)
                          }}
                          autoComplete="off"
                          style={{ flex:1, border:'none', outline:'none', padding:'11px 0', fontSize:13.5, color:'#C1E8FF', background:'transparent', fontFamily:"'DM Sans','Inter',sans-serif", width:'100%', minWidth:0 }}
                        />
                        {toucheTel && ins.telephone && validTel.valide  && <Check size={13} strokeWidth={2.5} color="#10b981" style={{ flexShrink:0 }} />}
                        {toucheTel && ins.telephone && !validTel.valide && <X    size={13} strokeWidth={2.5} color="#ef4444" style={{ flexShrink:0 }} />}
                      </div>
                      {/* Erreur téléphone */}
                      {toucheTel && ins.telephone && !validTel.valide && (
                        <p style={{ fontSize:10.5, color:'#fca5a5', fontWeight:600, margin:'4px 0 0 4px', lineHeight:1.4 }}>
                          {validTel.message}
                        </p>
                      )}
                      {/* Aperçu du numéro complet */}
                      {toucheTel && ins.telephone && validTel.valide && (
                        <p style={{ fontSize:10.5, color:'#6ee7b7', fontWeight:600, margin:'4px 0 0 4px' }}>
                          ✓ {paysSelectionne.indicatif} {ins.telephone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Mot de passe avec indicateur de force ── */}
                <Champ
                  id="in-mp" label="Mot de passe *"
                  type={voirMdp ? 'text' : 'password'}
                  placeholder="Min. 8 car., 1 majuscule, 1 chiffre"
                  valeur={ins.motDePasse}
                  onChange={e => { setIns(p => ({ ...p, motDePasse: e.target.value })); setToucheMdp(true) }}
                  Icon={Lock}
                  eye={() => setVoirMdp(!voirMdp)}
                  erreur={toucheMdp && ins.motDePasse.length > 0 && !validMdp.valide ? validMdp.erreurs.join(' · ') : ''}
                  succes={toucheMdp && validMdp.valide}
                />

                {/* Barres de force du mot de passe */}
                {ins.motDePasse.length > 0 && (
                  <>
                    <div className="bars">
                      {[1,2,3,4].map(n => (
                        <div key={n} className="bar"
                          style={{ background: validMdp.force >= n ? couleurForce : 'rgba(84,131,179,0.15)' }} />
                      ))}
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:10, color:couleurForce, fontWeight:700, marginBottom:8, marginTop:-4 }}>
                      <span>{libelleForce}</span>
                      {/* Critères en temps réel */}
                      <span style={{ display:'flex', gap:8, color:'rgba(125,160,202,0.7)', fontWeight:500 }}>
                        <span style={{ color: /[A-Z]/.test(ins.motDePasse) ? '#10b981' : 'rgba(125,160,202,0.5)' }}>A↑</span>
                        <span style={{ color: /[0-9]/.test(ins.motDePasse) ? '#10b981' : 'rgba(125,160,202,0.5)' }}>123</span>
                        <span style={{ color: ins.motDePasse.length >= 8     ? '#10b981' : 'rgba(125,160,202,0.5)' }}>8+</span>
                      </span>
                    </div>
                  </>
                )}

                {/* ── Confirmation mot de passe ── */}
                <Champ
                  id="in-cf" label="Confirmer *"
                  type={voirCf ? 'text' : 'password'}
                  placeholder="Répétez le mot de passe"
                  valeur={ins.confirmation}
                  onChange={e => { setIns(p => ({ ...p, confirmation: e.target.value })); setToucheCf(true) }}
                  Icon={Lock}
                  eye={() => setVoirCf(!voirCf)}
                  erreur={toucheCf && ins.confirmation.length > 0 && !mdpIdentique ? 'Les mots de passe ne correspondent pas' : ''}
                  succes={toucheCf && mdpIdentique}
                />

                {/* Bouton inscription */}
                <button className="btn" onClick={soumettreIns} disabled={loading}>
                  {loading
                    ? <><Loader2 size={14} style={{ animation:'spin 1s linear infinite' }}/>Création...</>
                    : <>Créer mon compte <ArrowRight size={14} strokeWidth={2.5}/></>
                  }
                </button>

                <p style={{ textAlign:'center', fontSize:11.5, color:'rgba(84,131,179,0.8)', marginTop:12, fontWeight:500 }}>
                  Déjà inscrit ?{' '}<span className="lien" onClick={() => { setMode('connexion'); setErreur('') }}>Se connecter</span>
                </p>
              </div>
            )}

            <p style={{ textAlign:'center', marginTop:14, fontSize:10, color:'rgba(84,131,179,0.35)', fontWeight:500 }}>
              🔒 Données chiffrées &amp; sécurisées
            </p>
          </div>
        </div>
      </div>
    </>
  )
}