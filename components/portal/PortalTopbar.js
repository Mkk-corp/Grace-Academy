'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

/* ─── Role badge config ───────────────────────────────────────────── */
const ROLES = {
  Student:        { text: '#c9932c', bg: 'rgba(201,147,44,.12)',  bd: 'rgba(201,147,44,.3)',  en: 'STUDENT',   ar: 'طالب'    },
  Assessor:       { text: '#00897B', bg: 'rgba(0,137,123,.1)',    bd: 'rgba(0,137,123,.3)',   en: 'ASSESSOR',  ar: 'مقيّم'   },
  Teacher:        { text: '#c9932c', bg: 'rgba(201,147,44,.12)',  bd: 'rgba(201,147,44,.3)',  en: 'TEACHER',   ar: 'معلّم'   },
  Administrator:  { text: '#ef4444', bg: 'rgba(239,68,68,.08)',   bd: 'rgba(239,68,68,.25)',  en: 'ADMIN',     ar: 'مدير'    },
  'Content Editor':{ text:'#3b82f6', bg: 'rgba(59,130,246,.08)', bd: 'rgba(59,130,246,.25)', en: 'EDITOR',    ar: 'محرر'    },
}

/* ─── Tiny inline icons ───────────────────────────────────────────── */
function I({ children, size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      {children}
    </svg>
  )
}
const MenuI    = ({ c }) => <I color={c}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></I>
const SearchI  = ({ c }) => <I color={c}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></I>
const SunI     = ({ c }) => <I color={c}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></I>
const MoonI    = ({ c }) => <I color={c}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></I>
const BellI    = ({ c }) => <I color={c}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></I>
const ChevI    = ({ c, up }) => <I color={c} size={13}>{up ? <polyline points="18 15 12 9 6 15"/> : <polyline points="6 9 12 15 18 9"/>}</I>
const UserI    = ({ c, s = 15 }) => <I color={c} size={s}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></I>
const SettI    = ({ c, s = 15 }) => <I color={c} size={s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></I>
const LogoutI  = ({ c, s = 15 }) => <I color={c} size={s}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></I>

/* ─── Dropdown item ───────────────────────────────────────────────── */
function DropItem({ icon, label, danger, onClick, muted, hoverBg, textColor, isAr }) {
  const [hov, setHov] = useState(false)
  const c = danger ? '#ef4444' : (hov ? textColor : muted)
  const bg = hov ? (danger ? 'rgba(239,68,68,.07)' : hoverBg) : 'none'
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '9px 12px', borderRadius: 9, cursor: 'pointer', color: c, fontSize: '.84rem', background: bg, border: 'none', width: '100%', fontFamily: 'inherit', textAlign: isAr ? 'right' : 'left', transition: 'all .12s', direction: 'inherit' }}
    >
      {icon === 'user'    && <UserI   c={c} />}
      {icon === 'settings'&& <SettI   c={c} />}
      {icon === 'logout'  && <LogoutI c={c} />}
      {label}
    </button>
  )
}

/* ─── Main component ──────────────────────────────────────────────── */
export default function PortalTopbar({
  user, isAr, isDark,
  toggleLang, toggleTheme,
  sidebarOpen, onToggleSidebar,
  search, onSearchChange,
  onLogout, onSettings,
  notificationBell,
}) {
  const [open, setOpen] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    if (!open) return
    function h(e) { if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [open])

  /* — theme tokens — */
  const surface = isDark ? '#10222b'               : '#ffffff'
  const border  = isDark ? 'rgba(255,255,255,.07)' : '#e5e7eb'
  const text    = isDark ? '#f1f5f9'               : '#111827'
  const muted   = isDark ? 'rgba(255,255,255,.45)' : '#6b7280'
  const xmuted  = isDark ? 'rgba(255,255,255,.22)' : '#9ca3af'
  const hoverBg = isDark ? 'rgba(255,255,255,.04)' : '#f3f4f6'
  const inBg    = isDark ? 'rgba(255,255,255,.05)' : '#f9fafb'
  const inBd    = isDark ? 'rgba(255,255,255,.1)'  : '#d1d5db'
  const gBg     = isDark ? 'rgba(201,147,44,.1)'   : 'rgba(201,147,44,.08)'
  const gBd     = isDark ? 'rgba(201,147,44,.28)'  : 'rgba(201,147,44,.22)'
  const shadow  = isDark ? '0 4px 24px rgba(0,0,0,.5)' : '0 4px 20px rgba(0,0,0,.1)'

  const avatarSrc = `/images/avatar-${user?.avatar || 'user1'}.svg`
  const firstName = user?.name?.split(' ')[0] || (isAr ? 'مستخدم' : 'User')
  const roleKey   = user?.roleName || 'Student'
  const role      = ROLES[roleKey] || ROLES.Student

  const iconBtn = {
    width: 36, height: 36, borderRadius: 9,
    background: 'none', border: `1px solid ${border}`,
    color: muted, display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0, transition: 'all .15s',
  }

  return (
    <>
      <style>{`
        @keyframes ptbFadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}
        .ptb-search{flex:1;max-width:400px;position:relative}
        .ptb-bell{display:flex}
        .ptb-lang{display:flex}
        .ptb-chip-name{display:inline-block}
        @media(max-width:640px){
          .ptb-search{display:none!important}
          .ptb-bell{display:none!important}
        }
        @media(max-width:440px){
          .ptb-lang{display:none!important}
          .ptb-chip-name{display:none!important}
        }
        @media(max-width:360px){
          .ptb-topbar{padding:0 10px!important;gap:6px!important}
        }
      `}</style>
      <header className="ptb-topbar" style={{
        position: 'sticky', top: 0, zIndex: 50, height: 64,
        background: surface, borderBottom: `1px solid ${border}`,
        display: 'flex', alignItems: 'center', gap: 10, padding: '0 20px',
        boxShadow: isDark ? '0 1px 4px rgba(0,0,0,.35)' : '0 1px 3px rgba(0,0,0,.07)',
      }}>

        {/* Sidebar toggle */}
        <button style={iconBtn} onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <MenuI c={muted} />
        </button>

        {/* Search */}
        <div className="ptb-search" style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', [isAr ? 'right' : 'left']: 11, top: '50%', transform: 'translateY(-50%)', color: xmuted, pointerEvents: 'none', lineHeight: 0 }}>
            <SearchI c={xmuted} />
          </span>
          <input
            value={search}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={isAr ? 'بحث…' : 'Search…'}
            style={{
              width: '100%', background: inBg, border: `1px solid ${inBd}`,
              borderRadius: 10, color: text, fontSize: '.84rem',
              fontFamily: 'inherit', outline: 'none', transition: 'border-color .15s',
              padding: `9px ${isAr ? '38px' : '14px'} 9px ${isAr ? '14px' : '38px'}`,
              direction: 'ltr', textAlign: isAr ? 'right' : 'left',
            }}
          />
        </div>

        <div style={{ flex: 1 }} />

        {/* Theme */}
        <button style={iconBtn} onClick={toggleTheme} aria-label="Toggle theme">
          {isDark ? <SunI c={muted} /> : <MoonI c={muted} />}
        </button>

        {/* Language */}
        <button
          className="ptb-lang"
          onClick={toggleLang}
          style={{ height: 36, padding: '0 12px', borderRadius: 9, border: `1px solid ${border}`, background: 'none', color: '#c9932c', fontSize: '.76rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.06em', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0, transition: 'all .15s' }}
        >
          {isAr ? 'EN' : 'عربي'}
        </button>

        {/* Bell */}
        <div className="ptb-bell">
          {notificationBell || (
            <button style={iconBtn} aria-label="Notifications">
              <BellI c={muted} />
            </button>
          )}
        </div>

        {/* ── Profile chip + dropdown ── */}
        <div ref={dropRef} style={{ position: 'relative', flexShrink: 0 }}>
          <button
            onClick={() => setOpen(o => !o)}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px 4px 4px', borderRadius: 100, background: gBg, border: `1px solid ${gBd}`, cursor: 'pointer', transition: 'all .15s' }}
          >
            <img
              src={avatarSrc} alt={user?.name}
              style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${gBd}`, background: surface, flexShrink: 0 }}
            />
            <span className="ptb-chip-name" style={{ fontSize: '.8rem', fontWeight: 600, color: '#c9932c', whiteSpace: 'nowrap', maxWidth: 96, overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {firstName}
            </span>
            <ChevI c="#c9932c" up={open} />
          </button>

          {open && (
            <div style={{
              position: 'absolute', [isAr ? 'left' : 'right']: 0, top: 'calc(100% + 8px)',
              background: surface, border: `1px solid ${border}`, borderRadius: 13,
              padding: 6, minWidth: 220, maxWidth: 'calc(100vw - 24px)', boxShadow: shadow, zIndex: 200,
              animation: 'ptbFadeUp .18s ease',
            }}>
              {/* User header */}
              <div style={{ padding: '10px 12px 10px', borderBottom: `1px solid ${border}`, marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <img src={avatarSrc} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: `2px solid ${gBd}`, flexShrink: 0 }} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '.88rem', color: text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
                    <div style={{ fontSize: '.72rem', color: xmuted, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'ltr', textAlign: isAr ? 'right' : 'left' }}>{user?.email}</div>
                  </div>
                </div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: role.bg, border: `1px solid ${role.bd}`, borderRadius: 100, padding: '2px 9px' }}>
                  <div style={{ width: 5, height: 5, borderRadius: '50%', background: role.text }} />
                  <span style={{ fontSize: '.67rem', fontWeight: 700, color: role.text, letterSpacing: isAr ? 0 : '.08em' }}>
                    {isAr ? role.ar : role.en}
                  </span>
                </div>
              </div>

              <Link href="/profile" style={{ textDecoration: 'none' }} onClick={() => setOpen(false)}>
                <DropItem icon="user" label={isAr ? 'الملف الشخصي' : 'My Profile'} muted={muted} textColor={text} hoverBg={hoverBg} isAr={isAr} />
              </Link>

              {onSettings && (
                <DropItem icon="settings" label={isAr ? 'الإعدادات' : 'Settings'} muted={muted} textColor={text} hoverBg={hoverBg} isAr={isAr} onClick={() => { onSettings(); setOpen(false) }} />
              )}

              <div style={{ height: 1, background: border, margin: '4px 6px' }} />

              <DropItem icon="logout" label={isAr ? 'تسجيل الخروج' : 'Log Out'} danger muted={muted} textColor={text} hoverBg={hoverBg} isAr={isAr} onClick={() => { setOpen(false); onLogout() }} />
            </div>
          )}
        </div>

      </header>
    </>
  )
}
