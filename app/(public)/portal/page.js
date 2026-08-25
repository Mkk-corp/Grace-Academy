'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'
import AvailabilitySettings from '@/components/assessor/AvailabilitySettings'
import PlacementTest from '@/components/student/PlacementTest'
import MySessions from '@/components/student/MySessions'
import UpcomingSession from '@/components/shared/UpcomingSession'
import PortalTopbar from '@/components/portal/PortalTopbar'
import StudentOnboarding from '@/components/student/StudentOnboarding'
import Breadcrumb from '@/components/ui/Breadcrumb'

/* ── service icon map ─────────────────────────────────────────────── */
function SvcIcon({ slug, size = 18 }) {
  const s = { stroke: '#c9932c', fill: 'none', strokeWidth: '1.8', width: size, height: size }
  switch (slug) {
    case 'chat':      return <svg viewBox="0 0 24 24" {...s}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    case 'briefcase': return <svg viewBox="0 0 24 24" {...s}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
    case 'award':     return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
    case 'star':      return <svg viewBox="0 0 24 24" {...s}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
    case 'code':      return <svg viewBox="0 0 24 24" {...s}><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>
    case 'users':     return <svg viewBox="0 0 24 24" {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    default:          return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="10"/></svg>
  }
}

/* ── inline SVG icons ─────────────────────────────────────────────── */
function Icon({ name, size = 18, color = 'currentColor' }) {
  const s = { stroke: color, fill: 'none', strokeWidth: '1.8', width: size, height: size, style: { flexShrink: 0 } }
  switch (name) {
    case 'grid':     return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    case 'book':     return <svg viewBox="0 0 24 24" {...s}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
    case 'video':    return <svg viewBox="0 0 24 24" {...s}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
    case 'award':    return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
    case 'calendar': return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    case 'folder':   return <svg viewBox="0 0 24 24" {...s}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
    case 'mail':     return <svg viewBox="0 0 24 24" {...s}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
    case 'settings': return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    case 'logout':   return <svg viewBox="0 0 24 24" {...s}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
    case 'search':   return <svg viewBox="0 0 24 24" {...s}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    case 'menu':     return <svg viewBox="0 0 24 24" {...s}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    case 'x':        return <svg viewBox="0 0 24 24" {...s}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
    case 'bell':     return <svg viewBox="0 0 24 24" {...s}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
    case 'sun':      return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    case 'moon':     return <svg viewBox="0 0 24 24" {...s}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    case 'chevron':  return <svg viewBox="0 0 24 24" {...s}><polyline points="9 18 15 12 9 6"/></svg>
    case 'chevronL': return <svg viewBox="0 0 24 24" {...s}><polyline points="15 18 9 12 15 6"/></svg>
    case 'user':     return <svg viewBox="0 0 24 24" {...s}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    default:         return null
  }
}

const NAV_ITEMS = [
  { id: 'dashboard',   labelEn: 'Dashboard',      labelAr: 'الرئيسية',       icon: 'grid'  },
  { id: 'placement',   labelEn: 'Placement Test', labelAr: 'اختبار التحديد', icon: 'award' },
  { id: 'my-sessions', labelEn: 'My Sessions',    labelAr: 'جلساتي',         icon: 'video' },
]


/* ── main portal component ────────────────────────────────────────── */
export default function PortalPage() {
  const router = useRouter()
  const { lang, dir, toggleLang } = useLang()
  const { theme, toggleTheme } = useTheme()
  const isAr = lang === 'ar'
  const isDark = theme === 'dark'

  const [user,           setUser]           = useState(null)
  const [sidebarOpen,    setSidebarOpen]    = useState(true)
  const [activeNav,      setActiveNav]      = useState('dashboard')
  const [search,         setSearch]         = useState('')
  const [loading,        setLoading]        = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [stats,          setStats]          = useState({ placement: null, courses: 0, certificates: 0, hours: 0 })

  function greeting() {
    const h = new Date().getHours()
    if (isAr) return h < 12 ? 'صباح الخير' : h < 17 ? 'مساء الخير' : 'مساء النور'
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  }

  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false)
  }, [])

  useEffect(() => {
    async function init() {
      const meRes = await fetch('/api/auth/me')
      const me = await meRes.json()
      if (!me.user)                                            { router.replace('/login');    return }
      if (me.user.isAssessor)                              { router.replace('/assessor'); return }
      if (me.user.isTeacher)                               { router.replace('/teacher');  return }

      setUser(me.user)

      // Staff (admin-created users with a role) never see student onboarding
      const isStaff = me.user.source === 'admin' && !!me.user.roleId
      // Persist "onboarding complete" in localStorage keyed by user ID so the
      // popup never reappears even after the placement booking date has passed
      const lsKey = `ga_placement_done_${me.user.id}`
      const alreadyDone = !!localStorage.getItem(lsKey)

      try {
        const placRes  = await fetch('/api/placement/upcoming')
        const placData = await placRes.json()
        const hasBooking = !!placData?.booking
        setStats(s => ({ ...s, placement: hasBooking ? 'confirmed' : null }))
        if (hasBooking && !alreadyDone) localStorage.setItem(lsKey, '1')
        if (!isStaff && !alreadyDone && !hasBooking) setShowOnboarding(true)
      } catch {
        if (!isStaff && !alreadyDone) setShowOnboarding(true)
      }

      setLoading(false)
    }
    init()
  }, [router])

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
  }

  const firstName = user?.name?.split(' ')[0] || (isAr ? 'طالب' : 'Student')
  const SW = sidebarOpen ? 260 : 68

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: isDark ? '#0d1b24' : '#f8fafc', padding: '40px 24px',
      }}>
        <style>{`
          @keyframes ldFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-22px) scale(1.03)}}
          @keyframes ldFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        `}</style>
        <img
          src="/images/loading.svg" alt=""
          style={{ width: 'min(500px,82vw)', height: 'min(500px,82vw)', objectFit: 'contain', animation: 'ldFloat 2.8s ease-in-out infinite' }}
        />
        <div style={{ textAlign: 'center', marginTop: 4, animation: 'ldFadeUp .55s ease both' }}>
          <div style={{ fontSize: 'clamp(1.7rem,4vw,2.5rem)', fontWeight: 900, color: '#c9932c', letterSpacing: isAr ? 0 : '-.02em', lineHeight: 1.1, fontFamily: isAr ? "'Tajawal',sans-serif" : "'Gotham',sans-serif", direction: dir }}>
            {isAr ? 'الصبر ... بيحمل' : 'Hold your horses'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @keyframes prSpin{to{transform:rotate(360deg)}}
        @keyframes prFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}

        :root{
          --pr-bg:#f8fafc; --pr-surface:#ffffff; --pr-sidebar:#ffffff;
          --pr-border:#e5e7eb; --pr-text:#111827; --pr-muted:#6b7280; --pr-xmuted:#9ca3af;
          --pr-shadow:0 1px 3px rgba(0,0,0,.07),0 1px 2px rgba(0,0,0,.04);
          --pr-shadow-md:0 4px 20px rgba(0,0,0,.09);
          --pr-hover:#f3f4f6; --pr-gold:#c9932c;
          --pr-gold-bg:rgba(201,147,44,.08); --pr-gold-bd:rgba(201,147,44,.22);
          --pr-input-bg:#f9fafb; --pr-input-bd:#d1d5db;
        }
        [data-theme="dark"]{
          --pr-bg:#0d1b24; --pr-surface:#10222b; --pr-sidebar:#0a1b22;
          --pr-border:rgba(255,255,255,.07); --pr-text:#f1f5f9;
          --pr-muted:rgba(255,255,255,.45); --pr-xmuted:rgba(255,255,255,.22);
          --pr-shadow:0 1px 4px rgba(0,0,0,.35);
          --pr-shadow-md:0 4px 20px rgba(0,0,0,.4);
          --pr-hover:rgba(255,255,255,.04);
          --pr-gold-bg:rgba(201,147,44,.1); --pr-gold-bd:rgba(201,147,44,.28);
          --pr-input-bg:rgba(255,255,255,.05); --pr-input-bd:rgba(255,255,255,.1);
        }

        .pr-root{display:flex;min-height:100vh;background:var(--pr-bg);color:var(--pr-text);
          font-family:${isAr?"var(--font-tajawal,'Tajawal',sans-serif)":"var(--font-gotham,'Gotham',sans-serif)"};
          direction:${dir}}

        /* ─── SIDEBAR ─────────────────────── */
        .pr-sb{
          position:fixed;top:0;${isAr?'right':'left'}:0;
          width:${SW}px;height:100vh;
          background:var(--pr-sidebar);
          border-${isAr?'left':'right'}:1px solid var(--pr-border);
          display:flex;flex-direction:column;
          transition:width .22s cubic-bezier(.4,0,.2,1);
          z-index:100;overflow:hidden;
          box-shadow:var(--pr-shadow);
        }
        .pr-sb-brand{
          padding:0 ${sidebarOpen?18:0}px;
          display:flex;align-items:center;
          gap:${sidebarOpen?10:0}px;
          border-bottom:1px solid var(--pr-border);
          height:64px;flex-shrink:0;
          justify-content:${sidebarOpen?'flex-start':'center'};
          overflow:hidden;white-space:nowrap;cursor:default;
        }
        .pr-sb-logo{
          width:34px;height:34px;flex-shrink:0;border-radius:10px;
          background:var(--pr-gold-bg);border:1px solid var(--pr-gold-bd);
          display:flex;align-items:center;justify-content:center;
        }
        .pr-sb-label{opacity:${sidebarOpen?1:0};transition:opacity .12s}
        .pr-sb-name{font-size:.7rem;font-weight:800;letter-spacing:.18em;color:var(--pr-gold)}
        .pr-sb-tag{font-size:.55rem;letter-spacing:.12em;color:var(--pr-xmuted);margin-top:2px}

        .pr-sb-nav{flex:1;overflow-y:auto;overflow-x:hidden;padding:10px 0;
          scrollbar-width:thin;scrollbar-color:var(--pr-border) transparent}
        .pr-sb-sec{
          padding:${sidebarOpen?'4px 14px 2px':'4px 0 2px'};
          text-align:${sidebarOpen?'start':'center'};
          font-size:.6rem;font-weight:700;letter-spacing:.14em;
          color:var(--pr-xmuted);text-transform:uppercase;
          margin-top:8px;overflow:hidden;white-space:nowrap;
        }
        .pr-sb-divider{height:1px;background:var(--pr-border);margin:8px 12px}

        .pr-ni{
          display:flex;align-items:center;
          gap:${sidebarOpen?10:0}px;
          padding:9px ${sidebarOpen?14:0}px;
          margin:1px ${sidebarOpen?8:6}px;
          border-radius:10px;cursor:pointer;
          transition:all .15s;
          white-space:nowrap;overflow:hidden;
          justify-content:${sidebarOpen?'flex-start':'center'};
          color:var(--pr-muted);font-size:.85rem;font-weight:500;
        }
        .pr-ni:hover{background:var(--pr-hover);color:var(--pr-text)}
        .pr-ni.active{background:var(--pr-gold-bg);color:var(--pr-gold)}
        .pr-ni-lbl{opacity:${sidebarOpen?1:0};transition:opacity .12s}
        .pr-ni-svc{font-size:.8rem}
        .pr-ni-logout{color:#ef4444 !important}
        .pr-ni-logout:hover{background:rgba(239,68,68,.07) !important}

        .pr-sb-bot{padding:10px 0;border-top:1px solid var(--pr-border);flex-shrink:0}

        /* ─── MAIN ────────────────────────── */
        .pr-main{
          ${isAr?'margin-right':'margin-left'}:${SW}px;
          flex:1;min-height:100vh;display:flex;flex-direction:column;
          transition:${isAr?'margin-right':'margin-left'} .22s cubic-bezier(.4,0,.2,1);
        }

        /* ─── TOPBAR ──────────────────────── */
        .pr-top{
          position:sticky;top:0;z-index:50;height:64px;
          background:var(--pr-surface);
          border-bottom:1px solid var(--pr-border);
          display:flex;align-items:center;gap:10px;
          padding:0 20px;
          box-shadow:var(--pr-shadow);
        }
        .pr-toggle-btn{
          width:36px;height:36px;border-radius:9px;
          background:none;border:1px solid var(--pr-border);
          color:var(--pr-muted);display:flex;align-items:center;justify-content:center;
          cursor:pointer;flex-shrink:0;transition:all .15s;
        }
        .pr-toggle-btn:hover{background:var(--pr-hover);color:var(--pr-text);border-color:transparent}

        .pr-search{flex:1;max-width:440px;position:relative}
        .pr-search-ic{
          position:absolute;${isAr?'right':'left'}:12px;top:50%;transform:translateY(-50%);
          color:var(--pr-xmuted);pointer-events:none;line-height:0;
        }
        .pr-search-input{
          width:100%;
          padding:9px 14px;
          padding-${isAr?'right':'left'}:38px;
          background:var(--pr-input-bg);border:1px solid var(--pr-input-bd);
          border-radius:10px;color:var(--pr-text);font-size:.87rem;
          font-family:inherit;outline:none;
          transition:border-color .15s,box-shadow .15s;
        }
        .pr-search-input::placeholder{color:var(--pr-xmuted)}
        .pr-search-input:focus{border-color:var(--pr-gold-bd);box-shadow:0 0 0 3px var(--pr-gold-bg)}

        .pr-top-spacer{flex:1}
        .pr-top-actions{display:flex;align-items:center;gap:6px;flex-shrink:0}
        .pr-ic-btn{
          width:36px;height:36px;border-radius:9px;background:none;
          border:1px solid var(--pr-border);color:var(--pr-muted);
          display:flex;align-items:center;justify-content:center;
          cursor:pointer;transition:all .15s;position:relative;
        }
        .pr-ic-btn:hover{background:var(--pr-hover);color:var(--pr-text);border-color:transparent}
        .pr-lang-btn{
          height:36px;padding:0 12px;border-radius:9px;background:none;
          border:1px solid var(--pr-border);color:var(--pr-muted);
          font-size:.72rem;font-weight:700;letter-spacing:.06em;
          cursor:pointer;transition:all .15s;font-family:inherit;
        }
        .pr-lang-btn:hover{background:var(--pr-hover);color:var(--pr-text)}
        .pr-notif-badge{
          width:16px;height:16px;border-radius:50%;background:#ef4444;color:#fff;
          font-size:.52rem;font-weight:800;
          display:flex;align-items:center;justify-content:center;
          position:absolute;top:-4px;${isAr?'left':'right'}:-4px;
        }
        .pr-user-chip{
          display:flex;align-items:center;gap:9px;
          padding:4px 12px 4px 4px;
          border:1px solid var(--pr-border);border-radius:100px;
          cursor:default;transition:border-color .15s;
          background:var(--pr-surface);
        }
        .pr-user-chip:hover{border-color:var(--pr-gold-bd)}
        .pr-user-av{
          width:28px;height:28px;border-radius:50%;
          background:linear-gradient(135deg,#c9932c,#ae6d0c);
          display:flex;align-items:center;justify-content:center;
          font-size:.78rem;font-weight:800;color:#fff;flex-shrink:0;
        }
        .pr-user-name{font-size:.8rem;font-weight:600;color:var(--pr-text);max-width:96px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
        .pr-user-role{font-size:.62rem;color:var(--pr-xmuted)}

        /* ─── CONTENT ─────────────────────── */
        .pr-content{flex:1;padding:28px 28px 56px;animation:prFadeUp .28s ease both}
        .pr-welcome{margin-bottom:28px}
        .pr-welcome-h{font-size:1.5rem;font-weight:900;color:var(--pr-text);margin-bottom:3px}
        .pr-welcome-h span{color:var(--pr-gold)}
        .pr-welcome-sub{font-size:.85rem;color:var(--pr-muted)}

        /* Stats row */
        .pr-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:30px}
        .pr-stat{
          background:var(--pr-surface);border:1px solid var(--pr-border);
          border-radius:14px;padding:18px 20px;
          display:flex;align-items:center;gap:14px;
          box-shadow:var(--pr-shadow);transition:box-shadow .2s,transform .18s;
        }
        .pr-stat:hover{box-shadow:var(--pr-shadow-md);transform:translateY(-1px)}
        .pr-stat-ic{width:44px;height:44px;border-radius:12px;display:flex;align-items:center;justify-content:center;flex-shrink:0}
        .pr-stat-val{font-size:1.5rem;font-weight:900;color:var(--pr-text);line-height:1}
        .pr-stat-lbl{font-size:.72rem;color:var(--pr-muted);margin-top:3px}

        /* Section header */
        .pr-sec-hd{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px}
        .pr-sec-title{
          font-size:.95rem;font-weight:800;color:var(--pr-text);
          display:flex;align-items:center;gap:8px;
        }
        .pr-sec-title::before{
          content:'';display:inline-block;width:3px;height:16px;border-radius:2px;background:var(--pr-gold);
        }
        .pr-sec-link{font-size:.78rem;color:var(--pr-gold);font-weight:600;cursor:pointer;text-decoration:none}
        .pr-sec-link:hover{text-decoration:underline}

        /* Services grid */
        .pr-svcs{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:30px}
        .pr-svc{
          background:var(--pr-surface);border:1px solid var(--pr-border);
          border-radius:14px;padding:20px;cursor:pointer;
          transition:all .18s;box-shadow:var(--pr-shadow);position:relative;overflow:hidden;
        }
        .pr-svc::before{
          content:'';position:absolute;inset:0;border-radius:14px;
          background:linear-gradient(135deg,var(--pr-gold-bg) 0%,transparent 60%);
          opacity:0;transition:opacity .2s;
        }
        .pr-svc:hover{border-color:var(--pr-gold-bd);transform:translateY(-2px);box-shadow:var(--pr-shadow-md)}
        .pr-svc:hover::before{opacity:1}
        .pr-svc-ico{
          width:44px;height:44px;border-radius:12px;
          background:var(--pr-gold-bg);border:1px solid var(--pr-gold-bd);
          display:flex;align-items:center;justify-content:center;margin-bottom:14px;position:relative;z-index:1;
        }
        .pr-svc-tag{
          display:inline-block;font-size:.63rem;font-weight:700;letter-spacing:.07em;
          color:var(--pr-gold);background:var(--pr-gold-bg);border:1px solid var(--pr-gold-bd);
          border-radius:100px;padding:2px 9px;margin-bottom:8px;position:relative;z-index:1;
        }
        .pr-svc-title{font-size:.88rem;font-weight:700;color:var(--pr-text);margin-bottom:5px;position:relative;z-index:1}
        .pr-svc-body{
          font-size:.76rem;color:var(--pr-muted);line-height:1.6;position:relative;z-index:1;
          display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;
        }
        .pr-svc-arr{
          position:absolute;${isAr?'left':'right'}:14px;bottom:14px;
          opacity:0;transition:opacity .15s;color:var(--pr-gold);
        }
        .pr-svc:hover .pr-svc-arr{opacity:1}

        /* Activity */
        .pr-activity{
          background:var(--pr-surface);border:1px solid var(--pr-border);
          border-radius:14px;box-shadow:var(--pr-shadow);overflow:hidden;
        }
        .pr-act-empty{
          padding:44px;text-align:center;color:var(--pr-muted);font-size:.85rem;
        }
        .pr-act-dot{
          width:44px;height:44px;border-radius:50%;background:var(--pr-gold-bg);
          border:1.5px dashed var(--pr-gold-bd);
          display:flex;align-items:center;justify-content:center;margin:0 auto 14px;
        }
        .pr-act-hint{font-size:.77rem;color:var(--pr-xmuted);margin-top:6px}

        @media(max-width:1100px){.pr-stats{grid-template-columns:repeat(2,1fr)}.pr-svcs{grid-template-columns:repeat(2,1fr)}}
        .pr-backdrop{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:99}
        @media(max-width:768px){
          .pr-backdrop{display:block}
          .pr-sb{width:min(80vw,280px) !important;transition:transform .22s cubic-bezier(.4,0,.2,1) !important;transform:${sidebarOpen?'none':(isAr?'translateX(100%)':'translateX(-100%)')}}
          .pr-main{${isAr?'margin-right':'margin-left'}:0 !important}
          .pr-content{padding:18px 16px 40px}
          .pr-svcs{grid-template-columns:repeat(2,1fr)}
          .pr-stats{grid-template-columns:repeat(2,1fr)}
        }
        @media(max-width:480px){
          .pr-stats{grid-template-columns:1fr !important}
          .pr-svcs{grid-template-columns:1fr !important}
          .pr-content{padding:14px 12px 32px}
          .pr-welcome-h{font-size:1.2rem}
        }
      `}</style>

      {/* ── Student onboarding gate (blocks until placement test is booked) ── */}
      {showOnboarding && (
        <StudentOnboarding
          user={user}
          isAr={isAr}
          isDark={isDark}
          onGoToPlacement={() => { setShowOnboarding(false); setActiveNav('placement') }}
        />
      )}

      <div className="pr-root">

        {/* Mobile backdrop */}
        {sidebarOpen && <div className="pr-backdrop" onClick={() => setSidebarOpen(false)} />}

        {/* ══ SIDEBAR ══════════════════════════════════════════════════ */}
        <aside className="pr-sb">
          {/* Brand */}
          <div className="pr-sb-brand">
            <div className="pr-sb-logo">
              <Image src="/images/logo.png" alt="Grace" width={20} height={20} style={{ objectFit: 'contain' }} />
            </div>
            <div className="pr-sb-label">
              <div className="pr-sb-name">GRACE</div>
              <div className="pr-sb-tag">ACADEMY</div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="pr-sb-nav">
            {sidebarOpen && <div className="pr-sb-sec">{isAr ? 'القائمة' : 'Navigation'}</div>}
            {NAV_ITEMS.map(item => (
              <div
                key={item.id}
                className={`pr-ni ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => setActiveNav(item.id)}
                title={!sidebarOpen ? (isAr ? item.labelAr : item.labelEn) : undefined}
              >
                <Icon name={item.icon} size={18} color={activeNav === item.id ? '#c9932c' : 'currentColor'} />
                <span className="pr-ni-lbl">{isAr ? item.labelAr : item.labelEn}</span>
              </div>
            ))}

          </nav>

          {/* Sidebar illustration */}
          {sidebarOpen && (
            <div style={{ padding: '0 12px 4px', flexShrink: 0, overflow: 'hidden' }}>
              <Image
                src="/images/sidebar-illustration.svg"
                alt=""
                width={236}
                height={160}
                style={{ width: '100%', height: 'auto', opacity: .55, display: 'block' }}
              />
            </div>
          )}

          {/* Bottom */}
          <div className="pr-sb-bot">
            <Link href="/profile" style={{ textDecoration: 'none', display: 'block' }}>
              <div className="pr-ni" title={!sidebarOpen ? (isAr ? 'الملف الشخصي' : 'Profile') : undefined}>
                <Icon name="user" size={18} />
                <span className="pr-ni-lbl">{isAr ? 'الملف الشخصي' : 'My Profile'}</span>
              </div>
            </Link>
            <div
              className={`pr-ni${activeNav === 'settings' ? ' active' : ''}`}
              onClick={() => setActiveNav('settings')}
              title={!sidebarOpen ? (isAr ? 'الإعدادات' : 'Settings') : undefined}
            >
              <Icon name="settings" size={18} color={activeNav === 'settings' ? '#c9932c' : 'currentColor'} />
              <span className="pr-ni-lbl">{isAr ? 'الإعدادات' : 'Settings'}</span>
            </div>
            <div
              className="pr-ni pr-ni-logout"
              onClick={handleLogout}
              title={!sidebarOpen ? (isAr ? 'تسجيل خروج' : 'Logout') : undefined}
            >
              <Icon name="logout" size={18} color="#ef4444" />
              <span className="pr-ni-lbl">{isAr ? 'تسجيل خروج' : 'Logout'}</span>
            </div>
          </div>
        </aside>

        {/* ══ MAIN ════════════════════════════════════════════════════ */}
        <div className="pr-main">

          {/* ── TOPBAR ── */}
          <PortalTopbar
            user={user} isAr={isAr} isDark={isDark}
            toggleLang={toggleLang} toggleTheme={toggleTheme}
            sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(v => !v)}
            search={search} onSearchChange={setSearch}
            onLogout={handleLogout}
            onSettings={() => setActiveNav('settings')}
          />

          {/* ── BREADCRUMB ── */}
          <Breadcrumb
            isAr={isAr}
            isDark={isDark}
            crumbs={[
              {
                label: isAr ? 'بوابة الطالب' : 'Student Portal',
                onClick: activeNav !== 'dashboard' ? () => setActiveNav('dashboard') : undefined,
              },
              {
                label: isAr
                  ? (activeNav === 'settings' ? 'الإعدادات' : NAV_ITEMS.find(n => n.id === activeNav)?.labelAr || 'الرئيسية')
                  : (activeNav === 'settings' ? 'Settings'  : NAV_ITEMS.find(n => n.id === activeNav)?.labelEn || 'Dashboard'),
              },
            ]}
          />

          {/* ── CONTENT ── */}
          <main className={activeNav === 'settings' ? '' : 'pr-content'}>

          {activeNav === 'settings' ? (
            <AvailabilitySettings user={user} isAr={isAr} isDark={isDark} />
          ) : activeNav === 'placement' ? (
            <PlacementTest
              user={user} isAr={isAr} isDark={isDark}
              onBooked={() => {
                if (user?.id) localStorage.setItem(`ga_placement_done_${user.id}`, '1')
                setShowOnboarding(false)
                setStats(s => ({ ...s, placement: 'confirmed' }))
              }}
            />
          ) : activeNav === 'my-sessions' ? (
            <MySessions isAr={isAr} isDark={isDark} />
          ) : (<>

            {/* Upcoming session */}
            <UpcomingSession isAr={isAr} isDark={isDark} />

            {/* Welcome */}
            <div className="pr-welcome">
              <div className="pr-welcome-h">
                {greeting()}, <span>{firstName}!</span>
              </div>
              <div className="pr-welcome-sub">
                {isAr
                  ? `أهلاً بك في بوابة الطلاب — ${new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                  : `Welcome to your student portal — ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`
                }
              </div>
            </div>

            {/* Stats */}
            {(() => {
              const placementColor = stats.placement === 'confirmed' ? '#10b981' : '#ef4444'
              const STAT_ITEMS = [
                {
                  labelEn: 'Placement Test',
                  labelAr: 'اختبار التحديد',
                  value: stats.placement === 'confirmed'
                    ? (isAr ? 'محجوز' : 'Booked')
                    : (isAr ? 'غير محجوز' : 'Not Booked'),
                  icon: 'award',
                  color: placementColor,
                  small: true,
                },
                { labelEn: 'My Courses',    labelAr: 'دوراتي',          value: stats.courses,      icon: 'book',     color: '#3b82f6' },
                { labelEn: 'Certificates',  labelAr: 'الشهادات',        value: stats.certificates, icon: 'award',    color: '#c9932c' },
                { labelEn: 'Study Hours',   labelAr: 'ساعات الدراسة',   value: stats.hours,        icon: 'calendar', color: '#8b5cf6' },
              ]
              return (
                <div className="pr-stats">
                  {STAT_ITEMS.map(s => (
                    <div key={s.labelEn} className="pr-stat">
                      <div className="pr-stat-ic" style={{ background: `${s.color}18`, border: `1px solid ${s.color}30` }}>
                        <Icon name={s.icon} size={20} color={s.color} />
                      </div>
                      <div>
                        <div className="pr-stat-val" style={s.small ? { fontSize: '1rem', marginTop: 2 } : {}}>
                          {s.value}
                        </div>
                        <div className="pr-stat-lbl">{isAr ? s.labelAr : s.labelEn}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* Recent Activity */}
            <div className="pr-sec-hd">
              <div className="pr-sec-title">{isAr ? 'النشاط الأخير' : 'Recent Activity'}</div>
            </div>
            <div className="pr-activity">
              <div className="pr-act-empty">
                <div className="pr-act-dot">
                  <Icon name="calendar" size={20} color="#c9932c" />
                </div>
                {isAr ? 'لا يوجد نشاط حديث بعد' : 'No recent activity yet'}
                <div className="pr-act-hint">
                  {isAr ? 'ابدأ بالتسجيل في إحدى الخدمات أعلاه' : 'Enroll in a service above to get started'}
                </div>
              </div>
            </div>

          </>)}
          </main>
        </div>
      </div>
    </>
  )
}
