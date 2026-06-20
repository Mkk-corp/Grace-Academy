'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'
import AvailabilitySettings from '@/components/assessor/AvailabilitySettings'
import WeeklySchedule from '@/components/assessor/WeeklySchedule'
import WeeklyCalendar from '@/components/assessor/WeeklyCalendar'
import SlotRequests from '@/components/assessor/SlotRequests'
import AssignedStudents from '@/components/assessor/AssignedStudents'
import MyAssessments from '@/components/assessor/MyAssessments'
import UpcomingSession from '@/components/shared/UpcomingSession'
import PortalTopbar from '@/components/portal/PortalTopbar'
import NotificationBell from '@/components/ui/NotificationBell'

/* ─── icons ──────────────────────────────────────────────────────────── */
function Icon({ name, size = 18, color = 'currentColor' }) {
  const s = { stroke: color, fill: 'none', strokeWidth: '1.8', width: size, height: size, style: { flexShrink: 0 } }
  switch (name) {
    case 'dashboard':   return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    case 'clipboard':   return <svg viewBox="0 0 24 24" {...s}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
    case 'schedule':    return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><polyline points="9 16 11 18 15 14"/></svg>
    case 'calendar':    return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    case 'students':    return <svg viewBox="0 0 24 24" {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    case 'report':      return <svg viewBox="0 0 24 24" {...s}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg>
    case 'history':     return <svg viewBox="0 0 24 24" {...s}><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/><polyline points="12 7 12 12 16 14"/></svg>
    case 'avail':       return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/><line x1="4.22" y1="4.22" x2="19.78" y2="19.78" strokeDasharray="1 1000" style={{display:'none'}}/></svg>
    case 'resources':   return <svg viewBox="0 0 24 24" {...s}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
    case 'search':      return <svg viewBox="0 0 24 24" {...s}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    case 'menu':        return <svg viewBox="0 0 24 24" {...s}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
    case 'sun':         return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    case 'moon':        return <svg viewBox="0 0 24 24" {...s}><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
    case 'logout':      return <svg viewBox="0 0 24 24" {...s}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
    case 'user':        return <svg viewBox="0 0 24 24" {...s}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    case 'chevron':     return <svg viewBox="0 0 24 24" {...s}><polyline points="9 18 15 12 9 6"/></svg>
    case 'chevronL':    return <svg viewBox="0 0 24 24" {...s}><polyline points="15 18 9 12 15 6"/></svg>
    case 'bell':        return <svg viewBox="0 0 24 24" {...s}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
    default:            return null
  }
}

/* ─── nav items ──────────────────────────────────────────────────────── */
const NAV = [
  { id: 'dashboard',   icon: 'dashboard', en: 'Dashboard',                    ar: 'الرئيسية' },
  { id: 'assessments', icon: 'clipboard', en: 'My Assessments',               ar: 'تقييماتي' },
  { id: 'schedule',    icon: 'schedule',  en: 'My Schedule',                   ar: 'جدولي' },
  { id: 'calendar',    icon: 'calendar',  en: 'My Calendar',                   ar: 'تقويمي' },
  { id: 'requests',    icon: 'clipboard', en: 'My Requests',                   ar: 'طلباتي' },
  { id: 'students',    icon: 'students',  en: 'Assigned Students',             ar: 'الطلاب المعيّنون' },
  { id: 'reports',     icon: 'report',    en: 'Pending Reports',               ar: 'التقارير المعلّقة' },
  { id: 'history',     icon: 'history',   en: 'Assessment History',            ar: 'سجل التقييمات' },
  { id: 'avail',       icon: 'avail',     en: 'Availability Settings',         ar: 'إعدادات التوفر' },
  { id: 'resources',   icon: 'resources', en: 'Resources / Assessment Guidelines', ar: 'الموارد / إرشادات التقييم' },
]

/* ─── placeholder content per tab ───────────────────────────────────── */
function ComingSoon({ tab, isAr, isDark }) {
  const labels = NAV.find(n => n.id === tab) || NAV[0]
  const clr = isDark ? 'rgba(255,255,255,.28)' : '#9ca3af'
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: 14, padding: 40 }}>
      <div style={{ width: 60, height: 60, borderRadius: 16, background: 'var(--as-gold-bg)', border: '1px solid var(--as-gold-bd)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={labels.icon} size={26} color="var(--as-gold)" />
      </div>
      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--as-text)' }}>{isAr ? labels.ar : labels.en}</div>
      <div style={{ fontSize: '.85rem', color: clr, textAlign: 'center', maxWidth: 320 }}>
        {isAr ? 'هذا القسم قيد التطوير. ستظهر المحتويات هنا قريباً.' : 'This section is under development. Content will appear here soon.'}
      </div>
    </div>
  )
}

/* ─── dashboard tab ──────────────────────────────────────────────────── */
function DashboardTab({ user, isAr, isDark }) {
  function greeting() {
    const h = new Date().getHours()
    if (isAr) return h < 12 ? 'صباح الخير' : h < 17 ? 'مساء الخير' : 'مساء النور'
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  }
  const firstName = user?.name?.split(' ')[0] || (isAr ? 'مقيّم' : 'Assessor')

  const STATS = [
    { icon: 'students',  en: 'Assigned Students', ar: 'الطلاب المعيّنون', value: '—', color: '#3b82f6' },
    { icon: 'clipboard', en: 'Pending Assessments', ar: 'تقييمات معلّقة',  value: '—', color: '#c9932c' },
    { icon: 'report',    en: 'Pending Reports',    ar: 'تقارير معلّقة',   value: '—', color: '#ef4444' },
    { icon: 'history',   en: 'Completed Today',    ar: 'مكتمل اليوم',     value: '—', color: '#10b981' },
  ]

  return (
    <div style={{ padding: '28px 24px', maxWidth: 960, margin: '0 auto' }}>
      {/* Upcoming session widget */}
      <UpcomingSession isAr={isAr} isDark={isDark} />

      {/* Welcome banner */}
      <div style={{ background: 'linear-gradient(135deg, #0a1b22 0%, #10222b 100%)', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,147,44,.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '.75rem', fontWeight: 600, letterSpacing: isAr ? 0 : '.12em', color: 'rgba(201,147,44,.7)', marginBottom: 6 }}>
            {isAr ? 'بوابة المقيّم' : 'ASSESSOR PORTAL'}
          </div>
          <h1 style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.7rem)', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 8 }}>
            {greeting()}, <span style={{ color: '#c9932c' }}>{firstName}</span>
          </h1>
          <p style={{ fontSize: '.88rem', color: 'rgba(255,255,255,.45)', maxWidth: 420 }}>
            {isAr ? 'مرحباً بك في بوابة التقييم. إليك ملخص يومك.' : "Welcome to your assessment portal. Here's your day at a glance."}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        {STATS.map(s => (
          <div key={s.en} style={{ background: 'var(--as-surface)', border: '1px solid var(--as-border)', borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}18`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={s.icon} size={17} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--as-text)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '.74rem', color: 'var(--as-muted)', marginTop: 4 }}>{isAr ? s.ar : s.en}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder sections */}
      {[
        { titleEn: "Today's Schedule", titleAr: 'جدول اليوم', icon: 'schedule' },
        { titleEn: 'Recent Activity',  titleAr: 'النشاط الأخير', icon: 'history' },
      ].map(sec => (
        <div key={sec.titleEn} style={{ background: 'var(--as-surface)', border: '1px solid var(--as-border)', borderRadius: 14, padding: '20px 22px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Icon name={sec.icon} size={16} color="var(--as-gold)" />
            <span style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--as-text)' }}>{isAr ? sec.titleAr : sec.titleEn}</span>
          </div>
          <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--as-xmuted)', fontSize: '.84rem' }}>
            {isAr ? 'لا يوجد محتوى بعد — ستظهر البيانات هنا قريباً.' : 'No content yet — data will appear here soon.'}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── main component ─────────────────────────────────────────────────── */
export default function AssessorPage() {
  const router = useRouter()
  const { lang, dir, toggleLang } = useLang()
  const { theme, toggleTheme } = useTheme()
  const isAr  = lang === 'ar'
  const isDark = theme === 'dark'

  const [user,        setUser]        = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab,   setActiveTab]   = useState('dashboard')
  const [search,      setSearch]      = useState('')

  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false)
  }, [])

  useEffect(() => {
    async function init() {
      const res  = await fetch('/api/auth/me')
      const data = await res.json()
      if (!data.user)                                                      { router.replace('/login');  return }
      if (!data.user.isAssessor && !data.user.hasAdminAccess)              { router.replace('/portal'); return }
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
  const avatarSrc = `/images/avatar-${user?.avatar || 'user1'}.svg`
  const firstName = user?.name?.split(' ')[0] || (isAr ? 'مقيّم' : 'Assessor')

  /* — loading — */
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: isDark ? '#0d1b24' : '#f8fafc', padding: '40px 24px' }}>
        <style>{`
          @keyframes ldFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-22px) scale(1.03)}}
          @keyframes ldFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        `}</style>
        <img src="/images/loading.svg" alt="" style={{ width: 'min(500px,82vw)', height: 'min(500px,82vw)', objectFit: 'contain', animation: 'ldFloat 2.8s ease-in-out infinite' }} />
        <div style={{ textAlign: 'center', marginTop: 4, animation: 'ldFadeUp .55s ease both' }}>
          <div style={{ fontSize: 'clamp(1.7rem,4vw,2.5rem)', fontWeight: 900, color: '#c9932c', letterSpacing: isAr ? 0 : '-.02em', lineHeight: 1.1, fontFamily: isAr ? "'Tajawal',sans-serif" : "'Gotham',sans-serif", direction: dir }}>
            {isAr ? 'الصبر ... بيحمل' : 'Hold your horses'}
          </div>
        </div>
      </div>
    )
  }

  const ff = isAr ? "var(--font-tajawal,'Tajawal',sans-serif)" : "var(--font-gotham,'Gotham',sans-serif)"

  return (
    <>
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @keyframes asFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

        :root{
          --as-bg:#f8fafc; --as-surface:#ffffff; --as-sidebar:#ffffff;
          --as-border:#e5e7eb; --as-text:#111827; --as-muted:#6b7280; --as-xmuted:#9ca3af;
          --as-shadow:0 1px 3px rgba(0,0,0,.07); --as-shadow-md:0 4px 20px rgba(0,0,0,.09);
          --as-hover:#f3f4f6; --as-gold:#c9932c;
          --as-gold-bg:rgba(201,147,44,.08); --as-gold-bd:rgba(201,147,44,.22);
          --as-input-bg:#f9fafb; --as-input-bd:#d1d5db;
        }
        [data-theme="dark"]{
          --as-bg:#0d1b24; --as-surface:#10222b; --as-sidebar:#0a1b22;
          --as-border:rgba(255,255,255,.07); --as-text:#f1f5f9;
          --as-muted:rgba(255,255,255,.45); --as-xmuted:rgba(255,255,255,.22);
          --as-shadow:0 1px 4px rgba(0,0,0,.35); --as-shadow-md:0 4px 20px rgba(0,0,0,.4);
          --as-hover:rgba(255,255,255,.04);
          --as-gold-bg:rgba(201,147,44,.1); --as-gold-bd:rgba(201,147,44,.28);
          --as-input-bg:rgba(255,255,255,.05); --as-input-bd:rgba(255,255,255,.1);
        }

        .as-root{display:flex;min-height:100vh;background:var(--as-bg);color:var(--as-text);
          font-family:${ff};direction:${dir}}

        /* ── SIDEBAR ── */
        .as-sb{
          position:fixed;top:0;${isAr ? 'right' : 'left'}:0;
          width:${SW}px;height:100vh;
          background:var(--as-sidebar);
          border-${isAr ? 'left' : 'right'}:1px solid var(--as-border);
          display:flex;flex-direction:column;
          transition:width .22s cubic-bezier(.4,0,.2,1);
          z-index:100;overflow:hidden;box-shadow:var(--as-shadow);
        }

        .as-sb-brand{
          height:64px;flex-shrink:0;
          display:flex;align-items:center;
          padding:0 ${sidebarOpen ? 18 : 0}px;
          gap:${sidebarOpen ? 10 : 0}px;
          border-bottom:1px solid var(--as-border);
          justify-content:${sidebarOpen ? 'flex-start' : 'center'};
          overflow:hidden;white-space:nowrap;
        }
        .as-sb-logo{
          width:34px;height:34px;flex-shrink:0;border-radius:10px;
          background:var(--as-gold-bg);border:1px solid var(--as-gold-bd);
          display:flex;align-items:center;justify-content:center;
        }
        .as-sb-lbl{opacity:${sidebarOpen ? 1 : 0};transition:opacity .12s}
        .as-sb-name{font-size:.68rem;font-weight:800;letter-spacing:${isAr ? 0 : '.15em'};color:var(--as-gold)}
        .as-sb-tag{font-size:.54rem;letter-spacing:${isAr ? 0 : '.1em'};color:var(--as-xmuted);margin-top:2px}

        .as-sb-nav{flex:1;overflow-y:auto;overflow-x:hidden;padding:10px 0;
          scrollbar-width:thin;scrollbar-color:var(--as-border) transparent}

        .as-ni{
          display:flex;align-items:center;
          gap:${sidebarOpen ? 10 : 0}px;
          padding:9px ${sidebarOpen ? 14 : 0}px;
          margin:1px ${sidebarOpen ? 8 : 6}px;
          border-radius:10px;cursor:pointer;
          transition:all .15s;white-space:nowrap;overflow:hidden;
          justify-content:${sidebarOpen ? 'flex-start' : 'center'};
          color:var(--as-muted);font-size:.84rem;font-weight:500;border:none;
          background:none;width:calc(100% - ${sidebarOpen ? 16 : 12}px);
          font-family:inherit;text-align:${isAr ? 'right' : 'left'};
        }
        .as-ni:hover{background:var(--as-hover);color:var(--as-text)}
        .as-ni.active{background:var(--as-gold-bg);color:var(--as-gold);font-weight:600}
        .as-ni-lbl{opacity:${sidebarOpen ? 1 : 0};transition:opacity .12s;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}

        .as-sb-divider{height:1px;background:var(--as-border);margin:6px 12px}
        .as-sb-bot{padding:10px 0;border-top:1px solid var(--as-border);flex-shrink:0}
        .as-ni-logout{color:#ef4444 !important}
        .as-ni-logout:hover{background:rgba(239,68,68,.07) !important}

        /* ── MAIN ── */
        .as-main{
          ${isAr ? 'margin-right' : 'margin-left'}:${SW}px;
          flex:1;min-height:100vh;display:flex;flex-direction:column;
          transition:${isAr ? 'margin-right' : 'margin-left'} .22s cubic-bezier(.4,0,.2,1);
        }

        /* ── TOPBAR ── */
        .as-top{
          position:sticky;top:0;z-index:50;height:64px;
          background:var(--as-surface);border-bottom:1px solid var(--as-border);
          display:flex;align-items:center;gap:10px;padding:0 20px;
          box-shadow:var(--as-shadow);
        }
        .as-top-btn{
          width:36px;height:36px;border-radius:9px;
          background:none;border:1px solid var(--as-border);
          color:var(--as-muted);display:flex;align-items:center;justify-content:center;
          cursor:pointer;flex-shrink:0;transition:all .15s;
        }
        .as-top-btn:hover{background:var(--as-hover);color:var(--as-text);border-color:var(--as-gold-bd)}

        .as-search{
          flex:1;max-width:380px;position:relative;
        }
        .as-search-icon{
          position:absolute;${isAr ? 'right' : 'left'}:11px;top:50%;
          transform:translateY(-50%);color:var(--as-xmuted);pointer-events:none;
        }
        .as-search-input{
          width:100%;padding:9px ${isAr ? '38px' : '14px'} 9px ${isAr ? '14px' : '38px'};
          background:var(--as-input-bg);border:1px solid var(--as-input-bd);
          border-radius:10px;color:var(--as-text);font-size:.84rem;
          font-family:inherit;outline:none;transition:border-color .15s;
        }
        .as-search-input:focus{border-color:var(--as-gold-bd)}
        .as-search-input::placeholder{color:var(--as-xmuted)}

        .as-top-spacer{flex:1}
        .as-top-actions{display:flex;align-items:center;gap:8px;flex-shrink:0}
        .as-lang-btn{
          height:36px;padding:0 11px;border-radius:9px;border:1px solid var(--as-border);
          background:none;color:var(--as-gold);font-size:.76rem;font-weight:700;
          letter-spacing:${isAr ? 0 : '.06em'};cursor:pointer;font-family:inherit;
          transition:all .15s;
        }
        .as-lang-btn:hover{background:var(--as-gold-bg);border-color:var(--as-gold-bd)}

        /* avatar chip */
        .as-avatar-wrap{position:relative}
        .as-avatar-btn{
          display:flex;align-items:center;gap:8px;
          padding:4px 10px 4px 4px;border-radius:100px;
          background:var(--as-gold-bg);border:1px solid var(--as-gold-bd);
          cursor:pointer;
        }
        .as-avatar-img{
          width:32px;height:32px;border-radius:50%;object-fit:cover;
          border:2px solid var(--as-gold-bd);background:var(--as-surface);
          flex-shrink:0;
        }
        .as-avatar-name{font-size:.8rem;font-weight:600;color:var(--as-gold);white-space:nowrap}

        .as-profile-drop{
          position:absolute;${isAr ? 'left' : 'right'}:0;top:calc(100% + 8px);
          background:var(--as-surface);border:1px solid var(--as-border);border-radius:13px;
          padding:6px;min-width:200px;
          box-shadow:var(--as-shadow-md);z-index:200;
          animation:asFadeUp .18s ease;
        }
        .as-drop-item{
          display:flex;align-items:center;gap:9px;
          padding:9px 12px;border-radius:9px;cursor:pointer;
          color:var(--as-muted);font-size:.84rem;transition:all .12s;
          background:none;border:none;width:100%;font-family:inherit;
          text-align:${isAr ? 'right' : 'left'};
        }
        .as-drop-item:hover{background:var(--as-hover);color:var(--as-text)}
        .as-drop-item.danger{color:#ef4444}
        .as-drop-item.danger:hover{background:rgba(239,68,68,.07)}
        .as-drop-divider{height:1px;background:var(--as-border);margin:4px 6px}

        /* ── CONTENT ── */
        .as-content{flex:1;animation:asFadeUp .25s ease}

        .as-backdrop{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:99}
        @media(max-width:768px){
          .as-backdrop{display:block}
          .as-sb{
            width:min(80vw,280px) !important;
            transition:transform .22s cubic-bezier(.4,0,.2,1) !important;
            transform:${sidebarOpen ? 'none' : (isAr ? 'translateX(100%)' : 'translateX(-100%)')};
          }
          .as-main{margin-left:0 !important;margin-right:0 !important}
          .as-search{display:none}
        }
        @media(max-width:480px){
          .as-content>div{padding-left:16px !important;padding-right:16px !important}
        }
      `}</style>

      <div className="as-root">

        {/* Mobile backdrop */}
        {sidebarOpen && <div className="as-backdrop" onClick={() => setSidebarOpen(false)} />}

        {/* ── SIDEBAR ── */}
        <aside className="as-sb">
          {/* Brand */}
          <div className="as-sb-brand">
            <div className="as-sb-logo">
              <Image src="/images/logo.png" alt="" width={20} height={20} style={{ objectFit: 'contain' }} />
            </div>
            <div className="as-sb-lbl">
              <div className="as-sb-name">GRACE ACADEMY</div>
              <div className="as-sb-tag">{isAr ? 'بوابة المقيّم' : 'ASSESSOR PORTAL'}</div>
            </div>
          </div>

          {/* Nav */}
          <nav className="as-sb-nav">
            {NAV.map(item => (
              <button
                key={item.id}
                className={`as-ni${activeTab === item.id ? ' active' : ''}`}
                onClick={() => setActiveTab(item.id)}
                title={sidebarOpen ? undefined : (isAr ? item.ar : item.en)}
              >
                <Icon name={item.icon} size={17} color={activeTab === item.id ? 'var(--as-gold)' : 'currentColor'} />
                <span className="as-ni-lbl">{isAr ? item.ar : item.en}</span>
              </button>
            ))}
          </nav>

          {/* Bottom — profile + logout */}
          <div className="as-sb-bot">
            <div className="as-sb-divider" />
            <Link href="/profile" style={{ textDecoration: 'none' }}>
              <button className="as-ni" style={{ color: 'var(--as-muted)' }}>
                <Icon name="user" size={17} color="currentColor" />
                <span className="as-ni-lbl">{isAr ? 'ملفي الشخصي' : 'My Profile'}</span>
              </button>
            </Link>
            <button className="as-ni as-ni-logout" onClick={handleLogout}>
              <Icon name="logout" size={17} color="currentColor" />
              <span className="as-ni-lbl">{isAr ? 'تسجيل الخروج' : 'Log Out'}</span>
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="as-main">

          {/* TOPBAR */}
          <PortalTopbar
            user={user} isAr={isAr} isDark={isDark}
            toggleLang={toggleLang} toggleTheme={toggleTheme}
            sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(o => !o)}
            search={search} onSearchChange={setSearch}
            onLogout={handleLogout}
            onSettings={() => setActiveTab('avail')}
            notificationBell={<NotificationBell isDark={isDark} isAr={isAr} userId={user?.id} />}
          />

          {/* CONTENT */}
          <main className="as-content" key={activeTab}>
            {activeTab === 'dashboard'
              ? <DashboardTab user={user} isAr={isAr} isDark={isDark} />
              : activeTab === 'assessments'
              ? <MyAssessments user={user} isAr={isAr} isDark={isDark} />
              : activeTab === 'students'
              ? <AssignedStudents user={user} isAr={isAr} isDark={isDark} />
              : activeTab === 'avail'
              ? <AvailabilitySettings user={user} isAr={isAr} isDark={isDark} />
              : activeTab === 'schedule'
              ? <WeeklySchedule user={user} isAr={isAr} isDark={isDark} />
              : activeTab === 'calendar'
              ? <WeeklyCalendar user={user} isAr={isAr} isDark={isDark} />
              : activeTab === 'requests'
              ? <SlotRequests user={user} isAr={isAr} isDark={isDark} />
              : <ComingSoon tab={activeTab} isAr={isAr} isDark={isDark} />
            }
          </main>
        </div>
      </div>
    </>
  )
}
