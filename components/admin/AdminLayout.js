'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'
import PortalTopbar from '@/components/portal/PortalTopbar'
import NotificationBell from '@/components/ui/NotificationBell'

/* ─── Sidebar icons ───────────────────────────────────────────────── */
function SbIcon({ d, size = 16 }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width={size} height={size} style={{ flexShrink: 0 }}>
      {d}
    </svg>
  )
}

const ICONS = {
  overview:   <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>,
  layers:     <><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></>,
  users:      <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  shield:     <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>,
  portal:     <><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></>,
  student:    <><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></>,
  teacher:    <><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></>,
  assessor:   <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></>,
  clipboard:  <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></>,
  database:   <><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></>,
  auditlog:   <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></>,
  home:       <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
  about:      <><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></>,
  stats:      <><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></>,
  services:   <><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></>,
  portfolio:  <><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></>,
  blog:       <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>,
  faq:        <><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></>,
  pricing:    <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
  messages:   <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>,
  location:   <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></>,
  user:       <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>,
  logout:     <><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></>,
  chevron:    <><polyline points="6 9 12 15 18 9"/></>,
}

/* ─── Nav definitions ─────────────────────────────────────────────── */
const CONTENT_NAV = (isAr) => [
  { href: '/admin/content/home',    label: isAr ? 'الرئيسية'         : 'Home',         icon: 'home'      },
  { href: '/admin/content/about',   label: isAr ? 'من نحن'           : 'About',        icon: 'about'     },
  { href: '/admin/stats',           label: isAr ? 'الإحصائيات'       : 'Stats',        icon: 'stats'     },
  { href: '/admin/services',        label: isAr ? 'الخدمات'          : 'Services',     icon: 'services'  },
  { href: '/admin/portfolio',       label: isAr ? 'أعمالنا'          : 'Portfolio',    icon: 'portfolio' },
  { href: '/admin/blog',            label: isAr ? 'المدونة'          : 'Blog',         icon: 'blog'      },
  { href: '/admin/faq',             label: isAr ? 'الأسئلة الشائعة'  : 'FAQ',          icon: 'faq'       },
  { href: '/admin/pricing',         label: isAr ? 'الأسعار'          : 'Pricing',      icon: 'pricing'   },
  { href: '/admin/contact',         label: isAr ? 'الرسائل'          : 'Messages',     icon: 'messages'  },
  { href: '/admin/content/contact', label: isAr ? 'معلومات التواصل'  : 'Contact Info', icon: 'location'  },
]

const USERS_NAV = (isAr) => [
  { href: '/admin/users', label: isAr ? 'المستخدمون' : 'Users', icon: 'users'  },
  { href: '/admin/roles', label: isAr ? 'الأدوار'    : 'Roles', icon: 'shield' },
]

const PORTALS_NAV = (isAr) => [
  { href: '/portal',   label: isAr ? 'بوابة الطالب'   : 'Student Portal',  icon: 'student',  color: '#c9932c' },
  { href: '/teacher',  label: isAr ? 'بوابة المعلم'   : 'Teacher Portal',  icon: 'teacher',  color: '#c9932c' },
  { href: '/assessor', label: isAr ? 'بوابة المستشار الأكاديمي' : 'Academic Consultant Portal', icon: 'assessor', color: '#00897B' },
]

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router   = useRouter()
  const { lang, toggleLang } = useLang()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const isAr   = lang === 'ar'

  const [user,        setUser]        = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile,    setIsMobile]    = useState(false)
  const [search,      setSearch]      = useState('')

  /* Detect mobile, auto-close sidebar */
  useEffect(() => {
    function check() {
      const mobile = window.innerWidth < 768
      setIsMobile(mobile)
      if (mobile) setSidebarOpen(false)
    }
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  /* Accordions — auto-open on matching path */
  const isContent  = pathname !== '/admin' && !pathname.startsWith('/admin/users') && !pathname.startsWith('/admin/roles') && !pathname.startsWith('/admin/login')
  const isUsers    = pathname.startsWith('/admin/users') || pathname.startsWith('/admin/roles')
  const [contentOpen,  setContentOpen]  = useState(isContent)
  const [usersOpen,    setUsersOpen]    = useState(isUsers)
  const [portalsOpen,  setPortalsOpen]  = useState(false)

  useEffect(() => { if (isContent) setContentOpen(true) }, [isContent])
  useEffect(() => { if (isUsers)   setUsersOpen(true)   }, [isUsers])

  /* Auth guard */
  useEffect(() => {
    if (pathname === '/admin/login') return
    fetch('/api/auth/me').then(r => r.json()).then(({ user }) => {
      if (!user)               { router.replace('/admin/login'); return }
      if (!user.hasAdminAccess){ router.replace('/unauthorized');return }
      setUser(user)
    }).catch(() => router.replace('/admin/login'))
  }, [pathname, router])

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
  }

  if (pathname === '/admin/login') return <>{children}</>

  const SW = sidebarOpen ? 264 : 68

  /* Light / dark CSS vars for child pages */
  const lightVars = `
    --bg:#f5f7fa; --surface:#fff; --surface-2:#edf0f5;
    --text:#1c2433; --text-80:rgba(28,36,51,.82); --text-60:rgba(28,36,51,.6); --text-40:rgba(28,36,51,.38);
    --border:rgba(28,36,51,.09); --border-gold:rgba(174,109,12,.22); --accent-dim:rgba(201,147,44,.08);
  `
  const darkVars = `
    --bg:#0d1b24; --surface:#10222b; --surface-2:#0a1820;
    --text:#f1f5f9; --text-80:rgba(241,245,249,.82); --text-60:rgba(241,245,249,.6); --text-40:rgba(241,245,249,.38);
    --border:rgba(255,255,255,.07); --border-gold:rgba(201,147,44,.28); --accent-dim:rgba(201,147,44,.1);
  `

  /* Sidebar accent for active state */
  const GOLD = '#c9932c'

  /* inline color tokens computed from isDark */
  const bg      = isDark ? '#0d1b24'  : '#f5f7fa'
  const surface = isDark ? '#10222b'  : '#ffffff'
  const border  = isDark ? 'rgba(255,255,255,.07)' : 'rgba(28,36,51,.09)'
  const text    = isDark ? '#f1f5f9'  : '#1c2433'
  const muted   = isDark ? 'rgba(241,245,249,.55)' : 'rgba(28,36,51,.55)'
  const hover   = isDark ? 'rgba(255,255,255,.04)' : 'rgba(201,147,44,.06)'

  /* ── Sidebar nav item ─────────────────────────────────────────── */
  function NavLink({ href, label, icon, color, startsWith }) {
    const active = startsWith ? pathname.startsWith(href) : pathname === href
    const accent = color || GOLD
    return (
      <Link href={href} style={{ textDecoration: 'none' }}>
        <div style={{
          display: 'flex', alignItems: 'center',
          gap: sidebarOpen ? 10 : 0,
          padding: `8px ${sidebarOpen ? 12 : 0}px`,
          margin: `1px ${sidebarOpen ? 8 : 6}px`,
          borderRadius: 9,
          background: active ? `${accent}14` : 'transparent',
          color: active ? accent : muted,
          fontWeight: active ? 600 : 400,
          fontSize: '.83rem', cursor: 'pointer', transition: 'all .15s',
          justifyContent: sidebarOpen ? 'flex-start' : 'center',
          whiteSpace: 'nowrap', overflow: 'hidden',
          borderLeft: active && !isAr ? `2px solid ${accent}` : '2px solid transparent',
          borderRight: active && isAr  ? `2px solid ${accent}` : '2px solid transparent',
        }}
          onMouseEnter={e => { if (!active) { e.currentTarget.style.background = hover; e.currentTarget.style.color = text } }}
          onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = muted } }}
        >
          <SbIcon d={ICONS[icon]} />
          {sidebarOpen && <span style={{ opacity: sidebarOpen ? 1 : 0, transition: 'opacity .12s', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: isAr ? "var(--font-tajawal,'Tajawal',sans-serif)" : "var(--font-comfortaa,'Comfortaa',sans-serif)" }}>{label}</span>}
        </div>
      </Link>
    )
  }

  /* ── Accordion toggle ─────────────────────────────────────────── */
  function AccordionToggle({ label, icon, open, onClick, active }) {
    return (
      <button onClick={onClick} style={{
        display: 'flex', alignItems: 'center',
        gap: sidebarOpen ? 10 : 0,
        padding: `9px ${sidebarOpen ? 14 : 0}px`,
        margin: `2px ${sidebarOpen ? 6 : 4}px`,
        width: `calc(100% - ${sidebarOpen ? 12 : 8}px)`,
        borderRadius: 10, background: 'none', border: 'none', cursor: 'pointer',
        color: active ? GOLD : muted, fontWeight: active ? 600 : 500,
        fontSize: '.83rem', transition: 'all .15s', textAlign: isAr ? 'right' : 'left',
        justifyContent: sidebarOpen ? 'flex-start' : 'center',
        whiteSpace: 'nowrap', overflow: 'hidden', fontFamily: 'inherit',
      }}
        onMouseEnter={e => { e.currentTarget.style.background = hover; e.currentTarget.style.color = text }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = active ? GOLD : muted }}
      >
        <SbIcon d={ICONS[icon]} />
        {sidebarOpen && <>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: isAr ? "var(--font-tajawal,'Tajawal',sans-serif)" : "var(--font-comfortaa,'Comfortaa',sans-serif)" }}>{label}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13"
            style={{ flexShrink: 0, opacity: .45, transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </>}
      </button>
    )
  }

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @keyframes adFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

        .admin-layout {
          display:flex; min-height:100vh;
          ${isDark ? darkVars : lightVars}
          background:var(--bg);
          --gold:#c9932c; --gold-dark:#ae6d0c; --r:8px; --r-lg:12px;
          --ease:.15s ease; --font:${isAr ? "var(--font-tajawal,'Tajawal',sans-serif)" : "var(--font-comfortaa,'Comfortaa',sans-serif)"};
          --font-en:var(--font-comfortaa,'Comfortaa',sans-serif);
        }
        .admin-main {
          flex:1; padding:32px; overflow-x:auto; background:var(--bg);
          animation:adFadeUp .22s ease;
          margin-${isAr ? 'right' : 'left'}:${SW}px;
          transition:margin .22s cubic-bezier(.4,0,.2,1);
          min-height:100vh;
        }
        .admin-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:28px; }
        .admin-header h1 { font-size:1.5rem; font-weight:700; color:var(--text); font-family:var(--font); }
        .admin-table { width:100%; border-collapse:collapse; background:var(--surface); border-radius:var(--r-lg); overflow:hidden; }
        .admin-table th { padding:12px 16px; font-size:.75rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--gold); background:var(--surface-2); text-align:start; font-family:var(--font); }
        .admin-table td { padding:14px 16px; font-size:.875rem; color:var(--text-80); border-top:1px solid var(--border); vertical-align:middle; font-family:var(--font); }
        .admin-table tr:hover td { background:rgba(201,147,44,.04); }
        .admin-btn { display:inline-flex; align-items:center; gap:6px; padding:7px 16px; border-radius:var(--r); font-size:.8rem; font-weight:600; cursor:pointer; transition:all var(--ease); border:1px solid var(--border); background:var(--surface); color:var(--text-60); font-family:var(--font); }
        .admin-btn:hover { border-color:var(--gold); color:var(--gold); }
        .admin-btn--primary { background:var(--gold); color:#fff; border-color:var(--gold); }
        .admin-btn--primary:hover { background:var(--gold-dark); border-color:var(--gold-dark); color:#fff; }
        .admin-btn--danger { border-color:rgba(220,53,69,.4); color:#dc3545; }
        .admin-btn--danger:hover { background:rgba(220,53,69,.1); border-color:#dc3545; }
        .admin-modal { position:fixed; inset:0; background:rgba(0,0,0,.55); backdrop-filter:blur(3px); z-index:1000; display:flex; align-items:center; justify-content:center; padding:24px; animation:adFadeUp .16s ease; }
        .admin-modal__box { background:var(--surface); border-radius:20px; padding:28px; width:100%; max-width:560px; max-height:90vh; overflow-y:auto; box-shadow:0 24px 64px rgba(0,0,0,.18); }
        .admin-modal__header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; }
        .admin-modal__title { font-size:1.1rem; font-weight:700; color:var(--text); font-family:var(--font); }
        .admin-modal__close { background:none; border:none; cursor:pointer; color:var(--text-40); padding:4px; line-height:0; border-radius:6px; transition:color var(--ease); flex-shrink:0; }
        .admin-modal__close:hover { color:var(--text); }
        .admin-field { margin-bottom:16px; }
        .admin-field label { display:block; font-size:.75rem; font-weight:600; text-transform:uppercase; letter-spacing:.08em; color:var(--text-60); margin-bottom:6px; font-family:var(--font); }
        .admin-field input,.admin-field textarea,.admin-field select { width:100%; background:var(--bg); border:1px solid var(--border); border-radius:var(--r); padding:.65rem .9rem; color:var(--text); font-size:.9rem; font-family:inherit; transition:border-color var(--ease); }
        .admin-field input:focus,.admin-field textarea:focus,.admin-field select:focus { outline:none; border-color:var(--gold); }
        .admin-field textarea { resize:vertical; min-height:90px; }
        .badge-unread { display:inline-flex; align-items:center; padding:2px 8px; background:rgba(232,160,32,.15); color:#e8a020; border:1px solid rgba(232,160,32,.3); border-radius:100px; font-size:.65rem; font-weight:700; letter-spacing:.08em; font-family:var(--font); }
        .theme-toggle,.lang-toggle { display:none; }
        @media(max-width:768px) {
          .admin-main { margin-left:0 !important; margin-right:0 !important; padding:20px; }
        }
      `}</style>

      <div className="admin-layout">

        {/* Mobile backdrop */}
        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.5)', zIndex: 99 }}
          />
        )}

        {/* ── SIDEBAR ── */}
        <aside style={{
          position: 'fixed', top: 0, [isAr ? 'right' : 'left']: 0,
          width: isMobile ? 264 : SW, height: '100vh',
          background: surface, borderRight: isAr ? 'none' : `1px solid ${border}`,
          borderLeft: isAr ? `1px solid ${border}` : 'none',
          display: 'flex', flexDirection: 'column',
          transition: 'width .22s cubic-bezier(.4,0,.2,1), transform .22s cubic-bezier(.4,0,.2,1)',
          transform: isMobile && !sidebarOpen ? `translateX(${isAr ? '100%' : '-100%'})` : 'none',
          zIndex: 100, overflow: 'hidden',
          boxShadow: isDark ? '0 1px 4px rgba(0,0,0,.35)' : '0 1px 3px rgba(0,0,0,.07)',
        }}>

          {/* Brand */}
          <div style={{
            height: 64, flexShrink: 0,
            display: 'flex', alignItems: 'center',
            padding: sidebarOpen ? '0 18px' : '0',
            gap: sidebarOpen ? 10 : 0,
            borderBottom: `1px solid ${border}`,
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
            overflow: 'hidden', whiteSpace: 'nowrap',
          }}>
            <div style={{
              width: 34, height: 34, flexShrink: 0, borderRadius: 10,
              background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Image src="/images/logo.png" alt="" width={20} height={20} style={{ objectFit: 'contain' }} />
            </div>
            {sidebarOpen && (
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '.68rem', fontWeight: 800, letterSpacing: isAr ? 0 : '.15em', color: GOLD, fontFamily: isAr ? "var(--font-tajawal,'Tajawal',sans-serif)" : "var(--font-comfortaa,'Comfortaa',sans-serif)" }}>GRACE ACADEMY</div>
                <div style={{ fontSize: '.54rem', letterSpacing: '.1em', color: muted, marginTop: 2 }}>{isAr ? 'لوحة الإدارة' : 'ADMIN PORTAL'}</div>
              </div>
            )}
          </div>

          {/* Nav */}
          <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 0', scrollbarWidth: 'thin', scrollbarColor: `${border} transparent` }}>

            {/* Overview */}
            <NavLink href="/admin" label={isAr ? 'نظرة عامة' : 'Overview'} icon="overview" />

            <div style={{ height: 1, background: border, margin: '8px 12px' }} />

            {/* Website Content */}
            <AccordionToggle
              label={isAr ? 'محتوى الموقع' : 'Website Content'} icon="layers"
              open={contentOpen} onClick={() => setContentOpen(o => !o)}
              active={isContent}
            />
            {contentOpen && sidebarOpen && (
              <div style={{ paddingLeft: isAr ? 0 : 8, paddingRight: isAr ? 8 : 0 }}>
                {CONTENT_NAV(isAr).map(item => (
                  <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} />
                ))}
              </div>
            )}

            <div style={{ height: 1, background: border, margin: '8px 12px' }} />

            {/* Roles & Users */}
            <AccordionToggle
              label={isAr ? 'الأدوار والمستخدمون' : 'Roles & Users'} icon="users"
              open={usersOpen} onClick={() => setUsersOpen(o => !o)}
              active={isUsers}
            />
            {usersOpen && sidebarOpen && (
              <div style={{ paddingLeft: isAr ? 0 : 8, paddingRight: isAr ? 8 : 0 }}>
                {USERS_NAV(isAr).map(item => (
                  <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} startsWith />
                ))}
              </div>
            )}

            <div style={{ height: 1, background: border, margin: '8px 12px' }} />

            {/* Portals */}
            <AccordionToggle
              label={isAr ? 'البوابات' : 'Portals'} icon="portal"
              open={portalsOpen} onClick={() => setPortalsOpen(o => !o)}
              active={false}
            />
            {portalsOpen && sidebarOpen && (
              <div style={{ paddingLeft: isAr ? 0 : 8, paddingRight: isAr ? 8 : 0 }}>
                {PORTALS_NAV(isAr).map(item => (
                  <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} color={item.color} />
                ))}
              </div>
            )}

            {/* When collapsed, show portal icons directly */}
            {!sidebarOpen && PORTALS_NAV(isAr).map(item => (
              <NavLink key={item.href} href={item.href} label={item.label} icon={item.icon} color={item.color} />
            ))}

            <div style={{ height: 1, background: border, margin: '8px 12px' }} />

            {/* Slot Requests */}
            <NavLink href="/admin/requests" label={isAr ? 'طلبات الجدول' : 'Slot Requests'} icon="clipboard" startsWith />

            <div style={{ height: 1, background: border, margin: '8px 12px' }} />

            {/* Placement Tests */}
            <NavLink href="/admin/placement-tests" label={isAr ? 'اختبارات التحديد' : 'Placement Tests'} icon="assessor" startsWith />

            <div style={{ height: 1, background: border, margin: '8px 12px' }} />

            {/* Data Center */}
            <NavLink href="/admin/datacenter" label={isAr ? 'مركز البيانات' : 'Data Center'} icon="database" startsWith />

            <div style={{ height: 1, background: border, margin: '8px 12px' }} />

            {/* Audit Log */}
            <NavLink href="/admin/audit-log" label={isAr ? 'سجل التدقيق' : 'Audit Log'} icon="auditlog" startsWith />
          </nav>

          {/* Bottom */}
          <div style={{ borderTop: `1px solid ${border}`, flexShrink: 0, padding: '8px 0' }}>
            <Link href="/profile" style={{ textDecoration: 'none' }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: sidebarOpen ? 10 : 0,
                padding: `9px ${sidebarOpen ? 12 : 0}px`,
                margin: `1px ${sidebarOpen ? 8 : 6}px`,
                borderRadius: 9, cursor: 'pointer',
                color: muted, fontSize: '.83rem',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                transition: 'all .15s', whiteSpace: 'nowrap', overflow: 'hidden',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = hover; e.currentTarget.style.color = text }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = muted }}
              >
                <SbIcon d={ICONS.user} />
                {sidebarOpen && <span style={{ fontFamily: isAr ? "var(--font-tajawal,'Tajawal',sans-serif)" : "var(--font-comfortaa,'Comfortaa',sans-serif)" }}>{isAr ? 'ملفي الشخصي' : 'My Profile'}</span>}
              </div>
            </Link>
            <div
              onClick={handleLogout}
              style={{
                display: 'flex', alignItems: 'center',
                gap: sidebarOpen ? 10 : 0,
                padding: `9px ${sidebarOpen ? 12 : 0}px`,
                margin: `1px ${sidebarOpen ? 8 : 6}px`,
                borderRadius: 9, cursor: 'pointer',
                color: '#ef4444', fontSize: '.83rem',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                transition: 'all .15s', whiteSpace: 'nowrap', overflow: 'hidden',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,.07)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
            >
              <SbIcon d={ICONS.logout} />
              {sidebarOpen && <span style={{ fontFamily: isAr ? "var(--font-tajawal,'Tajawal',sans-serif)" : "var(--font-comfortaa,'Comfortaa',sans-serif)" }}>{isAr ? 'تسجيل الخروج' : 'Log Out'}</span>}
            </div>
          </div>
        </aside>

        {/* ── MAIN COLUMN ── */}
        <div style={{
          [isAr ? 'marginRight' : 'marginLeft']: isMobile ? 0 : SW,
          flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh',
          transition: `${isAr ? 'margin-right' : 'margin-left'} .22s cubic-bezier(.4,0,.2,1)`,
        }}>

          <PortalTopbar
            user={user}
            isAr={isAr}
            isDark={isDark}
            toggleLang={toggleLang}
            toggleTheme={toggleTheme}
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(o => !o)}
            search={search}
            onSearchChange={setSearch}
            onLogout={handleLogout}
            notificationBell={<NotificationBell isDark={isDark} isAr={isAr} userId={user?.id} notificationsHref="/admin/notifications" />}
          />

          <main className="admin-main" style={{ marginLeft: 0, marginRight: 0 }}>
            {children}
          </main>
        </div>
      </div>
    </>
  )
}
