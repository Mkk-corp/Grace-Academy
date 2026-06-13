'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'

const USER_SECTIONS = [
  {
    href: '/admin/users',
    label: 'Users',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  },
  {
    href: '/admin/roles',
    label: 'Roles',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  },
]

const CONTENT_SECTIONS = [
  {
    href: '/admin/content/home',
    label: 'Home',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  },
  {
    href: '/admin/content/about',
    label: 'About',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  },
  {
    href: '/admin/stats',
    label: 'Stats',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  },
  {
    href: '/admin/services',
    label: 'Services',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>,
  },
  {
    href: '/admin/portfolio',
    label: 'Portfolio',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>,
  },
  {
    href: '/admin/blog',
    label: 'Blog',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
  },
  {
    href: '/admin/faq',
    label: 'FAQ',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  },
  {
    href: '/admin/pricing',
    label: 'Pricing',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
  },
  {
    href: '/admin/contact',
    label: 'Messages',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  },
  {
    href: '/admin/content/contact',
    label: 'Contact Info',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  },
]

function Toggles() {
  const { lang, toggleLang } = useLang()
  const { toggleTheme } = useTheme()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
        <svg className="theme-icon theme-icon--sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
        <svg className="theme-icon theme-icon--moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
      </button>
      <button className="lang-toggle" onClick={toggleLang}>{lang === 'ar' ? 'EN' : 'عربي'}</button>
    </div>
  )
}

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()

  const isContentRelated = pathname !== '/admin' && pathname !== '/admin/login' && !pathname.startsWith('/admin/users') && !pathname.startsWith('/admin/roles')
  const isUserRelated = pathname.startsWith('/admin/users') || pathname.startsWith('/admin/roles')
  const [contentOpen, setContentOpen] = useState(isContentRelated)
  const [usersOpen, setUsersOpen] = useState(isUserRelated)

  useEffect(() => {
    if (isContentRelated) setContentOpen(true)
    if (isUserRelated) setUsersOpen(true)
  }, [pathname])

  async function logout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        {/* Logo */}
        <div className="admin-sidebar__logo">
          <div style={{ fontSize: '.85rem', fontWeight: 700, color: 'var(--gold)', letterSpacing: '.12em', fontFamily: 'var(--font)' }}>
            GRACE ADMIN
          </div>
        </div>

        <nav className="admin-sidebar__nav" style={{ flex: 1, overflowY: 'auto' }}>
          {/* Overview */}
          <Link href="/admin" className={pathname === '/admin' ? 'active' : ''}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
            <span>Overview</span>
          </Link>

          {/* Website Content accordion */}
          <button
            className={`admin-nav-toggle${isContentRelated ? ' active' : ''}`}
            onClick={() => setContentOpen(o => !o)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            <span>Website Content</span>
            <svg
              className={`admin-nav-toggle__chevron${contentOpen ? ' open' : ''}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {contentOpen && (
            <div className="admin-nav-sub">
              {CONTENT_SECTIONS.map(({ href, label, icon }) => (
                <Link key={href} href={href} className={pathname === href ? 'active' : ''}>
                  <span style={{ flexShrink: 0 }}>{icon}</span>
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          )}

          {/* Roles & Users accordion */}
          <button
            className={`admin-nav-toggle${isUserRelated ? ' active' : ''}`}
            onClick={() => setUsersOpen(o => !o)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Roles & Users</span>
            <svg
              className={`admin-nav-toggle__chevron${usersOpen ? ' open' : ''}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          {usersOpen && (
            <div className="admin-nav-sub">
              {USER_SECTIONS.map(({ href, label, icon }) => (
                <Link key={href} href={href} className={pathname.startsWith(href) ? 'active' : ''}>
                  <span style={{ flexShrink: 0 }}>{icon}</span>
                  <span>{label}</span>
                </Link>
              ))}
            </div>
          )}
        </nav>

        {/* Bottom: logout + toggles */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={logout}
            style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '.82rem', color: 'var(--text-60)', background: 'none', border: 'none', cursor: 'pointer', width: '100%', marginBottom: 14, fontFamily: 'var(--font)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Log out
          </button>
          <Toggles />
        </div>
      </aside>

      <main className="admin-main">{children}</main>
    </div>
  )
}
