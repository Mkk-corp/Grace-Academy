'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'

const GOOGLE_ERRORS = {
  google_cancelled: { en: 'Google sign-in was cancelled.',           ar: 'تم إلغاء تسجيل الدخول عبر Google.' },
  google_failed:    { en: 'Google sign-in failed. Please try again.', ar: 'فشل تسجيل الدخول عبر Google. يرجى المحاولة مرة أخرى.' },
}

function AuthToggles() {
  const { lang, toggleLang } = useLang()
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  const isAr = lang === 'ar'
  const btn = {
    border: `1px solid ${isDark ? 'rgba(201,147,44,.3)' : '#e2e8f0'}`,
    background: isDark ? 'rgba(201,147,44,.08)' : '#fff',
    color: '#c9932c', cursor: 'pointer', borderRadius: 9,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  }
  return (
    <>
      <Link href="/" style={{ position: 'fixed', top: 16, left: 16, zIndex: 200, display: 'flex', alignItems: 'center', gap: 7, padding: '8px 14px', borderRadius: 9, border: `1px solid ${isDark ? 'rgba(201,147,44,.3)' : '#e2e8f0'}`, background: isDark ? 'rgba(201,147,44,.08)' : '#fff', color: '#c9932c', fontSize: '.78rem', fontWeight: 700, textDecoration: 'none', letterSpacing: isAr ? 0 : '.04em' }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="13" height="13"><polyline points="15 18 9 12 15 6"/></svg>
        {isAr ? 'الموقع' : 'Website'}
      </Link>
      <div style={{ position: 'fixed', top: 16, right: 16, display: 'flex', gap: 8, zIndex: 200, direction: 'ltr' }}>
        <button onClick={toggleTheme} style={{ ...btn, width: 36, height: 36 }} aria-label="Toggle theme">
          {isDark
            ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
            : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
          }
        </button>
        <button onClick={toggleLang} style={{ ...btn, height: 36, padding: '0 12px', fontSize: '.78rem', fontWeight: 700, letterSpacing: '.04em', fontFamily: 'inherit' }}>
          {lang === 'ar' ? 'EN' : 'عربي'}
        </button>
      </div>
    </>
  )
}

function LoginPage() {
  const { lang } = useLang()
  const { theme } = useTheme()
  const isAr  = lang === 'ar'
  const isDark = theme === 'dark'

  const [identifier,    setIdentifier]    = useState('')
  const [password,      setPassword]      = useState('')
  const [showPassword,  setShowPassword]  = useState(false)
  const [error,         setError]         = useState('')
  const [loading,       setLoading]       = useState(false)
  const router       = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const e = searchParams.get('error')
    if (e && GOOGLE_ERRORS[e]) setError(GOOGLE_ERRORS[e][lang] || GOOGLE_ERRORS[e].en)
  }, [searchParams, lang])

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError('')
    const res  = await fetch('/api/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ identifier, password }) })
    const data = await res.json()
    if (res.ok && data.forceReset) {
      router.push(`/forgot-password?email=${encodeURIComponent(data.email)}&mode=first-login`)
    } else if (res.ok) {
      router.push(data.redirect || '/portal')
    } else {
      setError(data.error || (isAr ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials'))
      setLoading(false)
    }
  }

  const ff = isAr ? "var(--font-tajawal,'Tajawal',sans-serif)" : "var(--font-montserrat,'Montserrat',sans-serif)"

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .lg-root { display: flex; min-height: 100vh; }

        /* LEFT — always dark */
        .lg-left { position: relative; flex: 0 0 58%; background: #0a1b22; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; padding: 48px 56px; }
        .lg-left__bg { position: absolute; inset: 0; background-image: url(/images/login-illustration.svg); background-size: cover; background-position: center 30%; opacity: .22; }
        .lg-left__glow1 { position: absolute; top: -200px; left: -100px; width: 600px; height: 600px; background: radial-gradient(circle, rgba(201,147,44,.2) 0%, transparent 65%); pointer-events: none; }
        .lg-left__glow2 { position: absolute; bottom: -150px; right: -80px; width: 440px; height: 440px; background: radial-gradient(circle, rgba(73,80,65,.3) 0%, transparent 65%); pointer-events: none; }
        .lg-left__grid { position: absolute; inset: 0; background-image: linear-gradient(rgba(201,147,44,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,147,44,.04) 1px, transparent 1px); background-size: 48px 48px; pointer-events: none; }
        .lg-left__divider { position: absolute; top: 0; right: 0; bottom: 0; width: 1px; background: linear-gradient(to bottom, transparent, rgba(201,147,44,.3) 30%, rgba(201,147,44,.3) 70%, transparent); }

        .lg-brand { position: relative; z-index: 2; display: flex; align-items: center; gap: 14px; }
        .lg-brand__emblem { width: 46px; height: 46px; border-radius: 50%; background: rgba(201,147,44,.12); border: 1px solid rgba(201,147,44,.32); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .lg-brand__name { font-size: .7rem; font-weight: 700; letter-spacing: .2em; color: #c9932c; }
        .lg-brand__tag  { font-size: .55rem; letter-spacing: .16em; color: rgba(201,147,44,.5); margin-top: 3px; }

        .lg-hero { position: relative; z-index: 2; flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 60px 0 40px; }
        .lg-hero__badge { display: inline-flex; align-items: center; gap: 7px; background: rgba(201,147,44,.1); border: 1px solid rgba(201,147,44,.22); border-radius: 100px; padding: 5px 14px; font-size: .67rem; font-weight: 600; letter-spacing: .12em; color: #c9932c; margin-bottom: 28px; width: fit-content; }
        .lg-hero__dot   { width: 6px; height: 6px; border-radius: 50%; background: #c9932c; animation: lgPulse 2s ease-in-out infinite; }
        .lg-hero__title { font-size: clamp(2rem, 3.2vw, 2.8rem); font-weight: 900; color: #fff; line-height: 1.1; margin-bottom: 18px; }
        .lg-hero__title span { background: linear-gradient(135deg, #c9932c 0%, #e8b84b 50%, #ae6d0c 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .lg-hero__sub   { font-size: .9rem; color: rgba(255,255,255,.42); line-height: 1.75; max-width: 360px; }

        .lg-stats        { position: relative; z-index: 2; display: flex; gap: 32px; padding-top: 36px; border-top: 1px solid rgba(201,147,44,.12); }
        .lg-stats__num   { font-size: 1.5rem; font-weight: 800; color: #c9932c; line-height: 1; margin-bottom: 4px; }
        .lg-stats__label { font-size: .68rem; letter-spacing: .08em; color: rgba(255,255,255,.32); text-transform: uppercase; }

        /* RIGHT — theme-responsive */
        .lg-right { flex: 1; background: #10222b; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 52px; position: relative; }
        .lg-inner { width: 100%; max-width: 360px; }

        .lg-icon   { width: 42px; height: 42px; border-radius: 50%; background: rgba(201,147,44,.1); border: 1px solid rgba(201,147,44,.28); display: flex; align-items: center; justify-content: center; margin-bottom: 20px; }
        .lg-title  { font-size: 1.6rem; font-weight: 800; color: #fff; letter-spacing: -.01em; margin-bottom: 5px; }
        .lg-sub    { font-size: .85rem; color: rgba(255,255,255,.38); margin-bottom: 36px; }
        .lg-label  { display: block; font-size: .72rem; font-weight: 700; letter-spacing: .1em; color: rgba(255,255,255,.48); margin-bottom: 8px; }
        .lg-field  { margin-bottom: 18px; }
        .lg-iw     { position: relative; }
        .lg-icon-left { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: rgba(201,147,44,.65); line-height: 0; pointer-events: none; }
        .lg-input  { width: 100%; padding: 13px 14px 13px 42px; background: rgba(255,255,255,.05); border: 1px solid rgba(201,147,44,.18); border-radius: 11px; color: #fff; font-size: .9rem; font-family: inherit; outline: none; transition: border-color .2s, background .2s; }
        .lg-input:focus { border-color: rgba(201,147,44,.5); background: rgba(255,255,255,.07); }
        .lg-input::placeholder { color: rgba(255,255,255,.2); }
        .lg-input--pr  { padding-right: 44px; }
        .lg-eye  { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: rgba(255,255,255,.3); padding: 0; line-height: 0; transition: color .15s; }
        .lg-eye:hover { color: rgba(255,255,255,.65); }
        .lg-error { display: flex; align-items: center; gap: 8px; background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.28); border-radius: 9px; padding: 10px 13px; margin-bottom: 18px; color: #f87171; font-size: .84rem; }
        .lg-btn   { width: 100%; padding: 14px; background: linear-gradient(135deg, #c9932c 0%, #ae6d0c 100%); border: none; border-radius: 11px; color: #fff; font-size: .92rem; font-weight: 700; letter-spacing: .07em; cursor: pointer; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 9px; transition: opacity .2s; margin-top: 6px; }
        .lg-btn:hover:not(:disabled) { opacity: .88; }
        .lg-btn:disabled { opacity: .5; cursor: not-allowed; }
        .lg-spinner { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: lgSpin .7s linear infinite; }
        .lg-divider { display: flex; align-items: center; gap: 12px; margin: 24px 0; }
        .lg-divider__line { flex: 1; height: 1px; background: rgba(255,255,255,.08); }
        .lg-divider__text { font-size: .7rem; letter-spacing: .08em; color: rgba(255,255,255,.22); white-space: nowrap; }
        .lg-google { display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; padding: 13px 14px; background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12); border-radius: 11px; color: #fff; font-size: .9rem; font-weight: 600; font-family: inherit; cursor: pointer; text-decoration: none; transition: background .18s, border-color .18s; }
        .lg-google:hover { background: rgba(255,255,255,.1); border-color: rgba(255,255,255,.22); }
        .lg-register { text-align: center; font-size: .84rem; color: rgba(255,255,255,.38); }
        .lg-register a { color: #c9932c; font-weight: 600; text-decoration: none; }
        .lg-register a:hover { text-decoration: underline; }
        .lg-footer { position: absolute; bottom: 22px; font-size: .68rem; letter-spacing: .07em; color: rgba(255,255,255,.14); text-align: center; }

        @keyframes lgSpin  { to { transform: rotate(360deg); } }
        @keyframes lgPulse { 0%, 100% { opacity: 1; } 50% { opacity: .4; } }

        /* ── LIGHT MODE ── */
        [data-theme="light"] .lg-right            { background: #f8fafc; }
        [data-theme="light"] .lg-title            { color: #0f172a; }
        [data-theme="light"] .lg-sub              { color: #64748b; }
        [data-theme="light"] .lg-label            { color: #374151; }
        [data-theme="light"] .lg-input            { background: #fff; border-color: #e2e8f0; color: #0f172a; }
        [data-theme="light"] .lg-input:focus      { border-color: rgba(201,147,44,.55); background: #fff; }
        [data-theme="light"] .lg-input::placeholder { color: #9ca3af; }
        [data-theme="light"] .lg-eye              { color: #9ca3af; }
        [data-theme="light"] .lg-eye:hover        { color: #6b7280; }
        [data-theme="light"] .lg-divider__line    { background: #e2e8f0; }
        [data-theme="light"] .lg-divider__text    { color: #94a3b8; }
        [data-theme="light"] .lg-google           { background: #fff; border-color: #e2e8f0; color: #1e293b; }
        [data-theme="light"] .lg-google:hover     { background: #f1f5f9; border-color: #d1d5db; }
        [data-theme="light"] .lg-register         { color: #64748b; }
        [data-theme="light"] .lg-footer           { color: #94a3b8; }

        /* ── RTL ── */
        [dir="rtl"] .lg-left__divider  { right: auto; left: 0; }
        [dir="rtl"] .lg-hero__badge    { letter-spacing: 0; }
        [dir="rtl"] .lg-stats__label   { letter-spacing: 0; }
        [dir="rtl"] .lg-label          { letter-spacing: 0; }
        [dir="rtl"] .lg-divider__text  { letter-spacing: 0; }
        [dir="rtl"] .lg-brand__name, [dir="rtl"] .lg-brand__tag { letter-spacing: 0; }
        [dir="rtl"] .lg-footer         { letter-spacing: 0; }
        [dir="rtl"] .lg-icon-left      { left: auto; right: 13px; }
        [dir="rtl"] .lg-input          { padding: 13px 42px 13px 14px; }
        [dir="rtl"] .lg-input--pr      { padding-left: 44px; }
        [dir="rtl"] .lg-eye            { right: auto; left: 12px; }

        @media (max-width: 768px) {
          .lg-left  { display: none; }
          .lg-right { padding: 40px 28px; }
        }
      `}</style>

      <AuthToggles />

      <div className="lg-root" style={{ fontFamily: ff }}>

        {/* ── LEFT ── */}
        <div className="lg-left">
          <div className="lg-left__bg" /><div className="lg-left__glow1" /><div className="lg-left__glow2" />
          <div className="lg-left__grid" /><div className="lg-left__divider" />

          <Link href="/" className="lg-brand" style={{ textDecoration: 'none' }}>
            <div className="lg-brand__emblem">
              <Image src="/images/logo.png" alt="Grace Academy" width={26} height={26} style={{ objectFit: 'contain' }} />
            </div>
            <div>
              <div className="lg-brand__name">GRACE ACADEMY</div>
              <div className="lg-brand__tag">{isAr ? 'العلم نور الحياة' : 'LONG LIVE LEARN'}</div>
            </div>
          </Link>

          <div className="lg-hero">
            <div className="lg-hero__badge">
              <span className="lg-hero__dot" />
              {isAr ? 'رحلتك التعليمية' : 'YOUR LEARNING JOURNEY'}
            </div>
            <h2 className="lg-hero__title">
              {isAr
                ? <>عالم لا تتوقف فيه<br /><span>الرغبة في التعلم.</span></>
                : <>The world where<br /><span>learning never stops.</span></>
              }
            </h2>
            <p className="lg-hero__sub">
              {isAr
                ? 'طلاب ومعلمون — سجّل الدخول بحساب واحد للوصول إلى تجربتك المخصصة في أكاديمية غريس.'
                : 'Students and instructors — sign in with a single account to access your personalised Grace Academy experience.'
              }
            </p>
          </div>

          <div className="lg-stats">
            {[
              { num: '24/7', en: 'Learning Access', ar: 'تعلّم متواصل' },
              { num: '100%', en: 'Secure',          ar: 'أمان تام' },
              { num: '∞',   en: 'Possibilities',   ar: 'لا حدود' },
            ].map(({ num, en, ar }) => (
              <div key={num}>
                <div className="lg-stats__num">{num}</div>
                <div className="lg-stats__label">{isAr ? ar : en}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── RIGHT ── */}
        <div className="lg-right">
          <div className="lg-inner">
            <div className="lg-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#c9932c" strokeWidth="1.8" width="19" height="19">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                <polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/>
              </svg>
            </div>
            <h1 className="lg-title">{isAr ? 'أهلاً بعودتك' : 'Welcome back'}</h1>
            <p className="lg-sub">{isAr ? 'سجّل الدخول إلى حساب أكاديمية غريس' : 'Sign in to your Grace Academy account'}</p>

            <form onSubmit={handleSubmit}>
              <div className="lg-field">
                <label className="lg-label">{isAr ? 'البريد · اسم المستخدم · الهاتف' : 'EMAIL · USERNAME · PHONE'}</label>
                <div className="lg-iw">
                  <span className="lg-icon-left">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  </span>
                  <input className="lg-input" type="text" value={identifier} onChange={e => setIdentifier(e.target.value)}
                    placeholder={isAr ? 'أدخل بريدك أو اسم المستخدم أو هاتفك' : 'Enter email, username or phone'}
                    autoFocus required />
                </div>
              </div>

              <div className="lg-field" style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <label className="lg-label" style={{ margin: 0 }}>{isAr ? 'كلمة المرور' : 'PASSWORD'}</label>
                  <Link href="/forgot-password" style={{ fontSize: '.75rem', color: '#c9932c', textDecoration: 'none', fontWeight: 600 }}>
                    {isAr ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                  </Link>
                </div>
                <div className="lg-iw">
                  <span className="lg-icon-left">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <input className="lg-input lg-input--pr" type={showPassword ? 'text' : 'password'}
                    value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
                  <button type="button" className="lg-eye" onClick={() => setShowPassword(v => !v)}>
                    {showPassword
                      ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="17" height="17"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>

              {error && (
                <div className="lg-error">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error}
                </div>
              )}

              <button type="submit" className="lg-btn" disabled={loading}>
                {loading
                  ? <><span className="lg-spinner" /> {isAr ? 'جارٍ التسجيل…' : 'Signing in…'}</>
                  : <>{isAr ? 'تسجيل الدخول' : 'Sign In'} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>
                }
              </button>
            </form>

            <div className="lg-divider">
              <div className="lg-divider__line" />
              <span className="lg-divider__text">{isAr ? 'أو تابع باستخدام' : 'OR CONTINUE WITH'}</span>
              <div className="lg-divider__line" />
            </div>

            <a href="/api/auth/google" className="lg-google">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isAr ? 'تابع مع Google' : 'Continue with Google'}
            </a>

            <div className="lg-divider" style={{ marginTop: 20 }}>
              <div className="lg-divider__line" />
              <span className="lg-divider__text">{isAr ? 'جديد في أكاديمية غريس؟' : 'NEW TO GRACE ACADEMY?'}</span>
              <div className="lg-divider__line" />
            </div>

            <p className="lg-register">
              {isAr ? 'ليس لديك حساب؟ ' : "Don't have an account? "}
              <Link href="/register">{isAr ? 'أنشئ حساباً مجاناً' : 'Create one free'}</Link>
            </p>
          </div>

          <p className="lg-footer">{isAr ? '© 2025 أكاديمية غريس · جميع الحقوق محفوظة' : '© 2025 GRACE ACADEMY · ALL RIGHTS RESERVED'}</p>
        </div>
      </div>
    </>
  )
}

export default function LoginPageWrapper() {
  return (
    <Suspense>
      <LoginPage />
    </Suspense>
  )
}
