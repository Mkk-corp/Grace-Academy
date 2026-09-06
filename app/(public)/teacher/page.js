'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'
import PortalTopbar from '@/components/portal/PortalTopbar'
import Breadcrumb from '@/components/ui/Breadcrumb'
import CourseCatalog from '@/components/shared/CourseCatalog'

/* ─── Sidebar icons ───────────────────────────────────────────────── */
function Icon({ name, size = 17, color = 'currentColor' }) {
  const s = { stroke: color, fill: 'none', strokeWidth: '1.8', width: size, height: size, style: { flexShrink: 0 } }
  switch (name) {
    case 'dashboard':  return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    case 'classes':    return <svg viewBox="0 0 24 24" {...s}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
    case 'students':   return <svg viewBox="0 0 24 24" {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    case 'assign':     return <svg viewBox="0 0 24 24" {...s}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>
    case 'attend':     return <svg viewBox="0 0 24 24" {...s}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
    case 'grades':     return <svg viewBox="0 0 24 24" {...s}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
    case 'schedule':   return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    case 'resources':  return <svg viewBox="0 0 24 24" {...s}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
    case 'messages':   return <svg viewBox="0 0 24 24" {...s}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    case 'settings':   return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    case 'user':       return <svg viewBox="0 0 24 24" {...s}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    case 'logout':     return <svg viewBox="0 0 24 24" {...s}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
    case 'book':       return <svg viewBox="0 0 24 24" {...s}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
    default:           return null
  }
}


/* ─── Dashboard tab ───────────────────────────────────────────────── */
function DashboardTab({ user, isAr }) {
  const h = new Date().getHours()
  const greeting = isAr
    ? (h < 12 ? 'صباح الخير' : h < 17 ? 'مساء الخير' : 'مساء النور')
    : (h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')
  const firstName = user?.name?.split(' ')[0] || (isAr ? 'معلّم' : 'Teacher')

  const STATS = [
    { icon: 'classes',  en: 'Active Classes',    ar: 'الصفوف النشطة',    value: '—', color: '#c9932c' },
    { icon: 'students', en: 'Total Students',    ar: 'إجمالي الطلاب',    value: '—', color: '#ae6d0c' },
    { icon: 'assign',   en: 'Pending Reviews',   ar: 'مراجعات معلّقة',   value: '—', color: '#c9932c' },
    { icon: 'attend',   en: 'Today\'s Sessions', ar: 'جلسات اليوم',      value: '—', color: '#10b981' },
  ]

  return (
    <div style={{ padding: '28px 24px', maxWidth: 980, margin: '0 auto' }}>
      {/* Welcome banner */}
      <div style={{ background: 'linear-gradient(135deg, #0a1822 0%, #10222b 100%)', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,147,44,.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: '30%', width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(174,109,12,.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.14em', color: 'rgba(201,147,44,.7)', marginBottom: 6 }}>
            {isAr ? 'بوابة المعلم' : 'TEACHER PORTAL'}
          </div>
          <h1 style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.7rem)', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 8 }}>
            {greeting}, <span style={{ color: '#c9932c' }}>{firstName}</span>
          </h1>
          <p style={{ fontSize: '.88rem', color: 'rgba(255,255,255,.45)', maxWidth: 420 }}>
            {isAr ? 'مرحباً بك في بوابة التدريس. إليك ملخص يومك.' : "Welcome to your teaching portal. Here's your day at a glance."}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        {STATS.map(s => (
          <div key={s.en} style={{ background: 'var(--tc-surface)', border: '1px solid var(--tc-border)', borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}18`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={s.icon} size={17} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--tc-text)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '.74rem', color: 'var(--tc-muted)', marginTop: 4 }}>{isAr ? s.ar : s.en}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder sections */}
      {[
        { en: "Today's Classes", ar: 'صفوف اليوم', icon: 'classes' },
        { en: 'Pending Assignments', ar: 'الواجبات المعلّقة', icon: 'assign' },
      ].map(sec => (
        <div key={sec.en} style={{ background: 'var(--tc-surface)', border: '1px solid var(--tc-border)', borderRadius: 14, padding: '20px 22px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Icon name={sec.icon} size={16} color="var(--tc-gold)" />
            <span style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--tc-text)' }}>{isAr ? sec.ar : sec.en}</span>
          </div>
          <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--tc-xmuted)', fontSize: '.84rem' }}>
            {isAr ? 'لا يوجد محتوى بعد.' : 'No content yet — data will appear here soon.'}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Main component ──────────────────────────────────────────────── */
export default function TeacherPage() {
  const router = useRouter()
  const { lang, dir, toggleLang } = useLang()
  const { theme, toggleTheme } = useTheme()
  const isAr  = lang === 'ar'
  const isDark = theme === 'dark'

  const [user,        setUser]        = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [search,      setSearch]      = useState('')
  const [activeTab,   setActiveTab]   = useState('dashboard')

  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false)
  }, [])

  useEffect(() => {
    async function init() {
      const res  = await fetch('/api/auth/me')
      const data = await res.json()
      if (!data.user)                                               { router.replace('/login');    return }
      if (!data.user.isTeacher && !data.user.hasAdminAccess)    { router.replace('/portal');   return }
      setUser(data.user)
      setLoading(false)
    }
    init()
  }, [router])

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
  }

  const SW = sidebarOpen ? 264 : 68
  const ff = isAr ? "var(--font-tajawal,'Tajawal',sans-serif)" : "var(--font-gotham,'Gotham',sans-serif)"

  /* — loading — */
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: isDark ? '#0d1b24' : '#f8fafc', padding: '40px 24px' }}>
        <style>{`@keyframes ldFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-22px) scale(1.03)}}@keyframes ldFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}`}</style>
        <img src="/images/loading.svg" alt="" style={{ width: 'min(500px,82vw)', height: 'min(500px,82vw)', objectFit: 'contain', animation: 'ldFloat 2.8s ease-in-out infinite' }} />
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
        @keyframes tcFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

        :root{
          --tc-bg:#f8fafc; --tc-surface:#ffffff; --tc-sidebar:#ffffff;
          --tc-border:#e5e7eb; --tc-text:#111827; --tc-muted:#6b7280; --tc-xmuted:#9ca3af;
          --tc-shadow:0 1px 3px rgba(0,0,0,.07); --tc-shadow-md:0 4px 20px rgba(0,0,0,.09);
          --tc-hover:#f3f4f6; --tc-gold:#c9932c;
          --tc-gold-bg:rgba(201,147,44,.08); --tc-gold-bd:rgba(201,147,44,.22);
        }
        [data-theme="dark"]{
          --tc-bg:#0d1b24; --tc-surface:#10222b; --tc-sidebar:#0a1b22;
          --tc-border:rgba(255,255,255,.07); --tc-text:#f1f5f9;
          --tc-muted:rgba(255,255,255,.45); --tc-xmuted:rgba(255,255,255,.22);
          --tc-shadow:0 1px 4px rgba(0,0,0,.35); --tc-shadow-md:0 4px 20px rgba(0,0,0,.4);
          --tc-hover:rgba(255,255,255,.04);
          --tc-gold-bg:rgba(201,147,44,.1); --tc-gold-bd:rgba(201,147,44,.28);
        }

        .tc-root{display:flex;min-height:100vh;background:var(--tc-bg);color:var(--tc-text);font-family:${ff};direction:${dir}}

        /* ── SIDEBAR ── */
        .tc-sb{
          position:fixed;top:0;${isAr ? 'right' : 'left'}:0;
          width:${SW}px;height:100vh;background:var(--tc-sidebar);
          border-${isAr ? 'left' : 'right'}:1px solid var(--tc-border);
          display:flex;flex-direction:column;
          transition:width .22s cubic-bezier(.4,0,.2,1);
          z-index:100;overflow:hidden;box-shadow:var(--tc-shadow);
        }
        .tc-sb-brand{
          height:64px;flex-shrink:0;display:flex;align-items:center;
          padding:0 ${sidebarOpen ? 18 : 0}px;gap:${sidebarOpen ? 10 : 0}px;
          border-bottom:1px solid var(--tc-border);
          justify-content:${sidebarOpen ? 'flex-start' : 'center'};
          overflow:hidden;white-space:nowrap;
        }
        .tc-sb-logo{
          width:34px;height:34px;flex-shrink:0;border-radius:10px;
          background:var(--tc-gold-bg);border:1px solid var(--tc-gold-bd);
          display:flex;align-items:center;justify-content:center;
        }
        .tc-sb-lbl{opacity:${sidebarOpen ? 1 : 0};transition:opacity .12s}
        .tc-sb-name{font-size:.68rem;font-weight:800;letter-spacing:${isAr ? 0 : '.15em'};color:var(--tc-gold)}
        .tc-sb-tag{font-size:.54rem;letter-spacing:${isAr ? 0 : '.1em'};color:var(--tc-xmuted);margin-top:2px}

        .tc-sb-nav{flex:1;overflow-y:auto;overflow-x:hidden;padding:10px 0;scrollbar-width:thin;scrollbar-color:var(--tc-border) transparent}

        .tc-ni{
          display:flex;align-items:center;
          gap:${sidebarOpen ? 10 : 0}px;
          padding:9px ${sidebarOpen ? 14 : 0}px;
          margin:1px ${sidebarOpen ? 8 : 6}px;
          border-radius:10px;cursor:pointer;
          transition:all .15s;white-space:nowrap;overflow:hidden;
          justify-content:${sidebarOpen ? 'flex-start' : 'center'};
          color:var(--tc-muted);font-size:.84rem;font-weight:500;border:none;
          background:none;width:calc(100% - ${sidebarOpen ? 16 : 12}px);
          font-family:inherit;text-align:${isAr ? 'right' : 'left'};
        }
        .tc-ni:hover{background:var(--tc-hover);color:var(--tc-text)}
        .tc-ni.active{background:var(--tc-gold-bg);color:var(--tc-gold);font-weight:600}
        .tc-ni-lbl{opacity:${sidebarOpen ? 1 : 0};transition:opacity .12s;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}

        .tc-sb-divider{height:1px;background:var(--tc-border);margin:6px 12px}
        .tc-sb-bot{padding:10px 0;border-top:1px solid var(--tc-border);flex-shrink:0}
        .tc-ni-logout{color:#ef4444 !important}
        .tc-ni-logout:hover{background:rgba(239,68,68,.07) !important}

        /* ── MAIN ── */
        .tc-main{
          ${isAr ? 'margin-right' : 'margin-left'}:${SW}px;
          flex:1;min-height:100vh;display:flex;flex-direction:column;
          transition:${isAr ? 'margin-right' : 'margin-left'} .22s cubic-bezier(.4,0,.2,1);
        }
        .tc-content{flex:1;animation:tcFadeUp .25s ease}

        .tc-backdrop{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:99}
        @media(max-width:768px){
          .tc-backdrop{display:block}
          .tc-sb{
            width:min(80vw,280px) !important;
            transition:transform .22s cubic-bezier(.4,0,.2,1) !important;
            transform:${sidebarOpen ? 'none' : (isAr ? 'translateX(100%)' : 'translateX(-100%)')};
          }
          .tc-main{margin-left:0 !important;margin-right:0 !important}
        }
        @media(max-width:480px){
          .tc-content>div{padding-left:16px !important;padding-right:16px !important}
          .tc-content>div>div{grid-template-columns:repeat(2,1fr) !important}
        }
      `}</style>

      <div className="tc-root">

        {/* Mobile backdrop */}
        {sidebarOpen && <div className="tc-backdrop" onClick={() => setSidebarOpen(false)} />}

        {/* ── SIDEBAR ── */}
        <aside className="tc-sb">
          <div className="tc-sb-brand">
            <div className="tc-sb-logo">
              <Image src="/images/logo.png" alt="" width={20} height={20} style={{ objectFit: 'contain' }} />
            </div>
            <div className="tc-sb-lbl">
              <div className="tc-sb-name">GRACE ACADEMY</div>
              <div className="tc-sb-tag">{isAr ? 'بوابة المعلم' : 'TEACHER PORTAL'}</div>
            </div>
          </div>

          <nav className="tc-sb-nav">
            <button
              className={`tc-ni${activeTab === 'dashboard' ? ' active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              title={sidebarOpen ? undefined : (isAr ? 'الرئيسية' : 'Dashboard')}
            >
              <Icon name="dashboard" size={17} color={activeTab === 'dashboard' ? 'var(--tc-gold)' : 'currentColor'} />
              <span className="tc-ni-lbl">{isAr ? 'الرئيسية' : 'Dashboard'}</span>
            </button>
            <button
              className={`tc-ni${activeTab === 'courses' ? ' active' : ''}`}
              onClick={() => setActiveTab('courses')}
              title={sidebarOpen ? undefined : (isAr ? 'كتالوج الدورات' : 'Course Catalog')}
            >
              <Icon name="book" size={17} color={activeTab === 'courses' ? 'var(--tc-gold)' : 'currentColor'} />
              <span className="tc-ni-lbl">{isAr ? 'كتالوج الدورات' : 'Course Catalog'}</span>
            </button>
          </nav>

          <div className="tc-sb-bot">
            <div className="tc-sb-divider" />
            <Link href="/profile" style={{ textDecoration: 'none' }}>
              <button className="tc-ni" title={sidebarOpen ? undefined : (isAr ? 'ملفي الشخصي' : 'My Profile')}>
                <Icon name="user" size={17} color="currentColor" />
                <span className="tc-ni-lbl">{isAr ? 'ملفي الشخصي' : 'My Profile'}</span>
              </button>
            </Link>
            <button className="tc-ni tc-ni-logout" onClick={handleLogout}>
              <Icon name="logout" size={17} color="currentColor" />
              <span className="tc-ni-lbl">{isAr ? 'تسجيل الخروج' : 'Log Out'}</span>
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="tc-main">

          <PortalTopbar
            user={user} isAr={isAr} isDark={isDark}
            toggleLang={toggleLang} toggleTheme={toggleTheme}
            sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(o => !o)}
            search={search} onSearchChange={setSearch}
            onLogout={handleLogout}
          />

          {/* ── BREADCRUMB ── */}
          <Breadcrumb
            isAr={isAr}
            isDark={isDark}
            crumbs={[
              { label: isAr ? 'بوابة المعلم' : 'Teacher Portal', onClick: activeTab !== 'dashboard' ? () => setActiveTab('dashboard') : undefined },
              { label: activeTab === 'courses' ? (isAr ? 'كتالوج الدورات' : 'Course Catalog') : (isAr ? 'الرئيسية' : 'Dashboard') },
            ]}
          />

          <main className="tc-content">
            {activeTab === 'courses'
              ? <div style={{ padding: '24px' }}><CourseCatalog basePath="/teacher/courses" isAr={isAr} isDark={isDark} /></div>
              : <DashboardTab user={user} isAr={isAr} />
            }
          </main>
        </div>
      </div>
    </>
  )
}
