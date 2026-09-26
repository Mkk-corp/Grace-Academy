'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useLang } from '@/context/LangContext'

const COURSE_CATS = [
  { key: 'coursesPageAll',    href: '/courses' },
  { key: 'footerConvo',       href: '/courses?cat=Conversational' },
  { key: 'footerBusiness',    href: '/courses?cat=Business' },
  { key: 'footerCatSpeaking', href: '/courses?cat=Speaking' },
  { key: 'footerAcademic',    href: '/courses?cat=Academic' },
  { key: 'footerCatKids',     href: '/courses?cat=Kids' },
  { key: 'footerCatExam',     href: '/courses?cat=Exam' },
]

const PAGES = [
  { key: 'navHome',      href: '/' },
  { key: 'navAbout',     href: '/about' },
  { key: 'navServices',  href: '/services' },
  { key: 'navCourses',   href: '/courses' },
  { key: 'navBlog',      href: '/blog' },
  { key: 'navFaq',       href: '/faq' },
  { key: 'navPricing',   href: '/pricing' },
  { key: 'footerContact',href: '/contact' },
]

const GOLD = '#c9932c'

export default function Footer() {
  const { t } = useLang()

  const [email,    setEmail]    = useState('')
  const [question, setQuestion] = useState('')
  const [sending,  setSending]  = useState(false)
  const [sent,     setSent]     = useState(false)
  const [formErr,  setFormErr]  = useState('')

  async function sendQuestion(e) {
    e.preventDefault()
    if (!email.trim() || !question.trim()) return
    setSending(true); setFormErr('')
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: email, email, message: question }),
      })
      if (res.ok) { setSent(true); setEmail(''); setQuestion('') }
      else setFormErr(t('footerSendError'))
    } catch { setFormErr(t('footerSendError')) }
    finally { setSending(false) }
  }

  const inp = {
    width: '100%', padding: '9px 12px', borderRadius: 8,
    border: '1px solid rgba(255,255,255,.12)', background: 'rgba(255,255,255,.06)',
    color: 'inherit', fontSize: '.84rem', fontFamily: 'inherit',
    outline: 'none', transition: 'border-color .15s',
  }

  return (
    <footer className="footer">
      <style>{`
        .footer__nav { display: grid; grid-template-columns: 1fr 1fr 1.6fr; gap: 40px; }
        @media(max-width: 900px) { .footer__nav { grid-template-columns: 1fr 1fr; } }
        @media(max-width: 580px) { .footer__nav { grid-template-columns: 1fr; } }
        .footer__col h4 { font-size: .72rem; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: ${GOLD}; margin-bottom: 16px; }
        .footer__col ul { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 9px; }
        .footer__col ul li a { font-size: .84rem; color: var(--text-muted, #9ca3af); text-decoration: none; transition: color .15s; }
        .footer__col ul li a:hover { color: ${GOLD}; }
        .footer-form__input:focus { border-color: ${GOLD} !important; }
        .footer-join { display: inline-flex; align-items: center; gap: 8px; margin-top: 20px; font-size: .84rem; font-weight: 700; color: var(--text-muted, #9ca3af); text-decoration: none; transition: color .15s; }
        .footer-join:hover { color: ${GOLD}; }
        .footer-join__badge { font-size: .62rem; font-weight: 700; letter-spacing: .1em; text-transform: uppercase; padding: 2px 7px; border-radius: 100px; background: rgba(201,147,44,.15); color: ${GOLD}; border: 1px solid rgba(201,147,44,.3); }
      `}</style>

      <div className="container">
        <div className="footer__top">
          <div className="footer__brand">
            <img src="/images/logo.png" alt="Grace Academy" className="footer__logo" />
            <div>
              <div className="footer__name">{t('brandName')} ACADEMY</div>
              <div className="footer__motto">{t('footerMotto')}</div>
            </div>
          </div>

          <nav className="footer__nav">
            {/* ── Column 1: Courses ── */}
            <div className="footer__col">
              <h4>{t('footerCourses')}</h4>
              <ul>
                {COURSE_CATS.map(({ key, href }) => (
                  <li key={key}><Link href={href}>{t(key)}</Link></li>
                ))}
              </ul>
            </div>

            {/* ── Column 2: Pages ── */}
            <div className="footer__col">
              <h4>{t('footerPagesCol')}</h4>
              <ul>
                {PAGES.map(({ key, href }) => (
                  <li key={key}><Link href={href}>{t(key)}</Link></li>
                ))}
              </ul>
            </div>

            {/* ── Column 3: Ask a question ── */}
            <div className="footer__col">
              <h4>{t('footerAskTitle')}</h4>

              {sent ? (
                <p style={{ fontSize: '.86rem', color: '#10b981', lineHeight: 1.6 }}>
                  {t('footerSentMsg')}
                </p>
              ) : (
                <form onSubmit={sendQuestion} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <input
                    type="email"
                    className="footer-form__input"
                    placeholder={t('footerEmailPh')}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    style={inp}
                    onFocus={e => e.target.style.borderColor = GOLD}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.12)'}
                  />
                  <textarea
                    className="footer-form__input"
                    placeholder={t('footerQuestionPh')}
                    value={question}
                    onChange={e => setQuestion(e.target.value)}
                    required
                    rows={3}
                    style={{ ...inp, resize: 'vertical' }}
                    onFocus={e => e.target.style.borderColor = GOLD}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,.12)'}
                  />
                  {formErr && <p style={{ fontSize: '.78rem', color: '#ef4444', margin: 0 }}>{formErr}</p>}
                  <button
                    type="submit"
                    disabled={sending}
                    style={{
                      alignSelf: 'flex-start', padding: '9px 22px', borderRadius: 8,
                      border: 'none', background: GOLD, color: '#fff',
                      fontSize: '.84rem', fontWeight: 700, cursor: sending ? 'default' : 'pointer',
                      fontFamily: 'inherit', opacity: sending ? .6 : 1,
                      transition: 'opacity .15s',
                    }}
                  >
                    {sending ? '…' : t('footerSendBtn')}
                  </button>
                </form>
              )}

              {/* Join Our Team */}
              <Link href="/careers" className="footer-join">
                {t('footerJoinTeam')}
                <span className="footer-join__badge">{t('footerComingSoon')}</span>
              </Link>
            </div>
          </nav>
        </div>

        <div className="footer__bottom">
          <span>{t('footerCopy')}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <Link href="/privacy-policy" style={{ fontSize: '.78rem', color: 'var(--text-muted, #9ca3af)', textDecoration: 'none', transition: 'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color = GOLD}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted, #9ca3af)'}>
              {t('footerPrivacy')}
            </Link>
            <span style={{ color: 'var(--text-muted, #9ca3af)', fontSize: '.78rem' }}>·</span>
            <Link href="/terms" style={{ fontSize: '.78rem', color: 'var(--text-muted, #9ca3af)', textDecoration: 'none', transition: 'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color = GOLD}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted, #9ca3af)'}>
              {t('footerTerms')}
            </Link>
          </div>
          <div className="footer__dev">
            <span>{t('footerDev')}</span>
            <img src="/images/dev-logo.png" alt="Developer" className="footer__dev-logo" style={{ height: '32px', width: 'auto' }} />
          </div>
        </div>
      </div>
    </footer>
  )
}
