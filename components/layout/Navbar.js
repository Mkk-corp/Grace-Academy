'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'

const NAV_LINKS = [
  { key: 'navHome',      href: '/' },
  { key: 'navAbout',     href: '/about' },
  { key: 'navServices',  href: '/services' },
  { key: 'navPortfolio', href: '/portfolio' },
  { key: 'navBlog',      href: '/blog' },
  { key: 'navFaq',       href: '/faq' },
  { key: 'navPricing',   href: '/pricing' },
]

export default function Navbar() {
  const { t, lang, toggleLang } = useLang()
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef(null)

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 60) }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function closeMenu() {
    setMenuOpen(false)
    document.body.style.overflow = ''
  }

  function toggleMenu() {
    const next = !menuOpen
    setMenuOpen(next)
    document.body.style.overflow = next ? 'hidden' : ''
  }

  return (
    <nav ref={navRef} id="navbar" className={`nav${scrolled ? ' scrolled' : ''}`}>
      <div className="nav__container">
        <Link href="/" className="nav__logo" onClick={closeMenu}>
          <img src="/images/logo.png" alt="Grace Academy" className="nav__logo-img" />
          <span className="nav__brand">{t('brandName')}</span>
        </Link>

        <ul className={`nav__menu${menuOpen ? ' open' : ''}`} id="navMenu">
          {NAV_LINKS.map(({ key, href }) => (
            <li key={key}>
              <Link
                href={href}
                className={`nav__link${pathname === href ? ' active' : ''}`}
                onClick={closeMenu}
              >
                {t(key)}
              </Link>
            </li>
          ))}
          <li>
            <Link href="/contact" className="nav__link nav__link--cta" onClick={closeMenu}>
              {t('navContact')}
            </Link>
          </li>
        </ul>

        <div className="nav__controls">
          <button
            className="theme-toggle"
            id="themeToggle"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            onClick={toggleTheme}
          >
            <svg className="theme-icon theme-icon--sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            <svg className="theme-icon theme-icon--moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
          </button>

          <button className="lang-toggle" id="langToggle" onClick={toggleLang}>
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>

          <button
            className={`nav__hamburger${menuOpen ? ' open' : ''}`}
            id="burger"
            aria-expanded={menuOpen}
            aria-label="Toggle menu"
            onClick={toggleMenu}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  )
}
