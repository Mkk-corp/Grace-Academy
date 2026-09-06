'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'
import PortalTopbar from '@/components/portal/PortalTopbar'
import Breadcrumb from '@/components/ui/Breadcrumb'

/* ─── Nav definitions per portal ─────────────────────────────────── */
const NAV_CONFIGS = {
  student: [
    { id: 'dashboard',   icon: 'grid',     en: 'Dashboard',        ar: 'الرئيسية' },
    { id: 'placement',   icon: 'award',    en: 'Placement Test',   ar: 'اختبار التحديد' },
    { id: 'my-sessions', icon: 'video',    en: 'My Sessions',      ar: 'جلساتي' },
    { id: 'courses',     icon: 'book',     en: 'Course Catalog',   ar: 'كتالوج الدورات' },
  ],
  assessor: [
    { id: 'dashboard',   icon: 'grid',       en: 'Dashboard',           ar: 'الرئيسية' },
    { id: 'assessments', icon: 'clipboard',  en: 'My Sessions',         ar: 'جلساتي' },
    { id: 'schedule',    icon: 'calendar',   en: 'My Schedule',         ar: 'جدولي' },
    { id: 'requests',    icon: 'clipboard',  en: 'My Requests',         ar: 'طلباتي' },
    { id: 'students',    icon: 'users',      en: 'Assigned Students',   ar: 'الطلاب المعيّنون' },
    { id: 'reports',     icon: 'file',       en: 'Pending Reports',     ar: 'التقارير المعلّقة' },
    { id: 'payroll',     icon: 'dollar',     en: 'Payroll',             ar: 'الرواتب' },
    { id: 'courses',     icon: 'book',       en: 'Course Catalog',      ar: 'كتالوج الدورات' },
  ],
  teacher: [
    { id: 'dashboard',   icon: 'grid',     en: 'Dashboard',        ar: 'الرئيسية' },
    { id: 'courses',     icon: 'book',     en: 'Course Catalog',   ar: 'كتالوج الدورات' },
  ],
}

const PORTAL_LABELS = {
  student:  { en: 'Student Portal',             ar: 'بوابة الطالب' },
  assessor: { en: 'Academic Consultant Portal', ar: 'بوابة المستشار الأكاديمي' },
  teacher:  { en: 'Teacher Portal',             ar: 'بوابة المعلم' },
}

/* ─── Inline icon ─────────────────────────────────────────────────── */
function Icon({ name, size = 17, color = 'currentColor' }) {
  const s = { stroke: color, fill: 'none', strokeWidth: '1.8', width: size, height: size, strokeLinecap: 'round', strokeLinejoin: 'round', flexShrink: 0 }
  switch (name) {
    case 'grid':      return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    case 'book':      return <svg viewBox="0 0 24 24" {...s}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
    case 'video':     return <svg viewBox="0 0 24 24" {...s}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>
    case 'award':     return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
    case 'calendar':  return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    case 'users':     return <svg viewBox="0 0 24 24" {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    case 'clipboard': return <svg viewBox="0 0 24 24" {...s}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
    case 'file':      return <svg viewBox="0 0 24 24" {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
    case 'dollar':    return <svg viewBox="0 0 24 24" {...s}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
    case 'user':      return <svg viewBox="0 0 24 24" {...s}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    case 'logout':    return <svg viewBox="0 0 24 24" {...s}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
    case 'menu':      return <svg viewBox="0 0 24 24" {...s}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    default:          return null
  }
}

export default function CoursePageShell({ portalType = 'student', backHref = '/', courseName, courseNameAr, children }) {
  const router = useRouter()
  const { lang, dir, toggleLang } = useLang()
  const { theme, toggleTheme } = useTheme()
  const isAr  = lang === 'ar'
  const isDark = theme === 'dark'

  const [user,        setUser]        = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [search,      setSearch]      = useState('')

  const navItems = NAV_CONFIGS[portalType] || NAV_CONFIGS.student
  const portalLabel = PORTAL_LABELS[portalType] || PORTAL_LABELS.student
  const SW = sidebarOpen ? 260 : 68
  const ff = isAr ? "var(--font-tajawal,'Tajawal',sans-serif)" : "var(--font-gotham,'Gotham',sans-serif)"

  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false)
  }, [])

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { setUser(d.user || null); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
  }

  const courseTitle = isAr
    ? (courseNameAr || courseName || '…')
    : (courseName || '…')

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        :root{
          --cps-bg:#f8fafc;--cps-surface:#fff;--cps-sidebar:#fff;
          --cps-border:#e5e7eb;--cps-text:#111827;--cps-muted:#6b7280;--cps-xmuted:#9ca3af;
          --cps-hover:#f3f4f6;--cps-gold:#c9932c;
          --cps-gold-bg:rgba(201,147,44,.08);--cps-gold-bd:rgba(201,147,44,.22);
          --cps-shadow:0 1px 3px rgba(0,0,0,.07);
        }
        [data-theme="dark"]{
          --cps-bg:#0d1b24;--cps-surface:#10222b;--cps-sidebar:#0a1b22;
          --cps-border:rgba(255,255,255,.07);--cps-text:#f1f5f9;
          --cps-muted:rgba(255,255,255,.45);--cps-xmuted:rgba(255,255,255,.22);
          --cps-hover:rgba(255,255,255,.04);
          --cps-gold-bg:rgba(201,147,44,.1);--cps-gold-bd:rgba(201,147,44,.28);
          --cps-shadow:0 1px 4px rgba(0,0,0,.35);
        }
        .cps-root{display:flex;min-height:100vh;background:var(--cps-bg);color:var(--cps-text);
          font-family:${ff};direction:${dir}}
        .cps-sb{
          position:fixed;top:0;${isAr ? 'right' : 'left'}:0;
          width:${SW}px;height:100vh;
          background:var(--cps-sidebar);
          border-${isAr ? 'left' : 'right'}:1px solid var(--cps-border);
          display:flex;flex-direction:column;
          transition:width .22s cubic-bezier(.4,0,.2,1);
          z-index:100;overflow:hidden;
          box-shadow:var(--cps-shadow);
        }
        .cps-brand{
          padding:0 ${sidebarOpen ? 18 : 0}px;
          display:flex;align-items:center;gap:${sidebarOpen ? 10 : 0}px;
          border-bottom:1px solid var(--cps-border);
          height:64px;flex-shrink:0;
          justify-content:${sidebarOpen ? 'flex-start' : 'center'};
          overflow:hidden;white-space:nowrap;
        }
        .cps-logo{
          width:34px;height:34px;flex-shrink:0;border-radius:10px;
          background:var(--cps-gold-bg);border:1px solid var(--cps-gold-bd);
          display:flex;align-items:center;justify-content:center;
        }
        .cps-lbl{opacity:${sidebarOpen ? 1 : 0};transition:opacity .12s}
        .cps-name{font-size:.68rem;font-weight:800;letter-spacing:.16em;color:var(--cps-gold)}
        .cps-tag{font-size:.55rem;letter-spacing:.1em;color:var(--cps-xmuted);margin-top:2px}
        .cps-nav{flex:1;overflow-y:auto;overflow-x:hidden;padding:10px 0;
          scrollbar-width:thin;scrollbar-color:var(--cps-border) transparent}
        .cps-ni{
          display:flex;align-items:center;
          gap:${sidebarOpen ? 10 : 0}px;
          padding:9px ${sidebarOpen ? 14 : 0}px;
          margin:1px ${sidebarOpen ? 8 : 6}px;
          border-radius:10px;cursor:pointer;
          transition:all .15s;white-space:nowrap;overflow:hidden;
          justify-content:${sidebarOpen ? 'flex-start' : 'center'};
          color:var(--cps-muted);font-size:.85rem;font-weight:500;
          background:none;border:none;font-family:inherit;width:calc(100% - ${sidebarOpen ? 16 : 12}px);
          text-align:${isAr ? 'right' : 'left'};
        }
        .cps-ni:hover{background:var(--cps-hover);color:var(--cps-text)}
        .cps-ni.active{background:var(--cps-gold-bg);color:var(--cps-gold)}
        .cps-ni-lbl{opacity:${sidebarOpen ? 1 : 0};transition:opacity .12s}
        .cps-bot{padding:10px 0;border-top:1px solid var(--cps-border);flex-shrink:0}
        .cps-divider{height:1px;background:var(--cps-border);margin:8px 12px}
        .cps-logout{color:#ef4444!important}
        .cps-logout:hover{background:rgba(239,68,68,.07)!important}
        .cps-main{
          ${isAr ? 'margin-right' : 'margin-left'}:${SW}px;
          flex:1;min-height:100vh;display:flex;flex-direction:column;
          transition:${isAr ? 'margin-right' : 'margin-left'} .22s cubic-bezier(.4,0,.2,1);
        }
        .cps-content{flex:1;overflow-y:auto}
      `}</style>

      <div className="cps-root" data-theme={isDark ? 'dark' : 'light'}>

        {/* ── Sidebar ─────────────────────────────────────────────── */}
        <aside className="cps-sb">
          {/* Brand */}
          <div className="cps-brand">
            <div className="cps-logo">
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--cps-gold)" strokeWidth="1.8" width="18" height="18">
                <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
              </svg>
            </div>
            <div className="cps-lbl">
              <div className="cps-name">GRACE</div>
              <div className="cps-tag">{isAr ? portalLabel.ar : portalLabel.en}</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="cps-nav">
            {navItems.map(item => {
              const isActive = item.id === 'courses'
              return (
                <button
                  key={item.id}
                  className={`cps-ni${isActive ? ' active' : ''}`}
                  onClick={() => { if (!isActive) router.push(backHref) }}
                  title={sidebarOpen ? undefined : (isAr ? item.ar : item.en)}
                >
                  <Icon name={item.icon} size={17} color={isActive ? 'var(--cps-gold)' : 'currentColor'} />
                  <span className="cps-ni-lbl">{isAr ? item.ar : item.en}</span>
                </button>
              )
            })}
          </nav>

          {/* Bottom */}
          <div className="cps-bot">
            <div className="cps-divider" />
            <Link href="/profile" style={{ textDecoration: 'none' }}>
              <button className="cps-ni" title={sidebarOpen ? undefined : (isAr ? 'ملفي الشخصي' : 'My Profile')}>
                <Icon name="user" size={17} color="currentColor" />
                <span className="cps-ni-lbl">{isAr ? 'ملفي الشخصي' : 'My Profile'}</span>
              </button>
            </Link>
            <button className="cps-ni cps-logout" onClick={handleLogout} title={sidebarOpen ? undefined : (isAr ? 'تسجيل الخروج' : 'Log Out')}>
              <Icon name="logout" size={17} color="currentColor" />
              <span className="cps-ni-lbl">{isAr ? 'تسجيل الخروج' : 'Log Out'}</span>
            </button>
          </div>
        </aside>

        {/* ── Main ────────────────────────────────────────────────── */}
        <div className="cps-main">
          <PortalTopbar
            user={user} isAr={isAr} isDark={isDark}
            toggleLang={toggleLang} toggleTheme={toggleTheme}
            sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(o => !o)}
            search={search} onSearchChange={setSearch}
            onLogout={handleLogout}
          />

          <Breadcrumb
            isAr={isAr}
            isDark={isDark}
            crumbs={[
              { label: isAr ? portalLabel.ar : portalLabel.en, onClick: () => router.push(backHref) },
              { label: isAr ? 'كتالوج الدورات' : 'Course Catalog', onClick: () => router.push(backHref) },
              { label: courseTitle },
            ]}
          />

          <div className="cps-content">
            {children}
          </div>
        </div>
      </div>
    </>
  )
}
