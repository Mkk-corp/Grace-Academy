'use client'

import { useState, useEffect, useRef, useCallback, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'

/* ── password rules ─────────────────────────────────────────────────── */
const PWD_RULES = [
  { en: 'At least 12 characters',         ar: '١٢ حرفاً على الأقل',          test: p => p.length >= 12 },
  { en: 'One uppercase letter (A–Z)',      ar: 'حرف كبير واحد (A–Z)',          test: p => /[A-Z]/.test(p) },
  { en: 'One lowercase letter (a–z)',      ar: 'حرف صغير واحد (a–z)',          test: p => /[a-z]/.test(p) },
  { en: 'One number (0–9)',               ar: 'رقم واحد (0–9)',               test: p => /[0-9]/.test(p) },
  { en: 'One special character (!@#…)',   ar: 'رمز خاص واحد (!@#…)',         test: p => /[^a-zA-Z0-9]/.test(p) },
  { en: 'No spaces',                      ar: 'بدون مسافات',                  test: p => !/\s/.test(p) },
]
function pwdStrength(p) { return PWD_RULES.filter(c => c.test(p)).length }

/* ── countdown hook ─────────────────────────────────────────────────── */
function useCountdown(initial = 0) {
  const [secs, setSecs] = useState(initial)
  const ref = useRef(null)
  const start = useCallback((s) => {
    clearInterval(ref.current); setSecs(s)
    ref.current = setInterval(() => {
      setSecs(v => { if (v <= 1) { clearInterval(ref.current); return 0 } return v - 1 })
    }, 1000)
  }, [])
  useEffect(() => () => clearInterval(ref.current), [])
  return { secs, start, running: secs > 0 }
}

/* ── AuthToggles ─────────────────────────────────────────────────────── */
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

/* ── OTP input ───────────────────────────────────────────────────────── */
function OtpInput({ value, onChange }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const containerRef = useRef(null)
  const digits = value.split('')

  function getInput(i) { return containerRef.current?.querySelectorAll('input')[i] }

  function handleKey(i, e) {
    const d = e.key
    if (d === 'Backspace') { onChange(value.slice(0, i) + value.slice(i + 1)); if (i > 0) getInput(i - 1)?.focus(); return }
    if (!/^\d$/.test(d)) return
    const next = value.slice(0, i) + d + value.slice(i + 1)
    onChange(next.slice(0, 8))
    if (i < 7) getInput(i + 1)?.focus()
  }

  function handlePaste(e) {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8)
    onChange(text); getInput(Math.min(text.length, 7))?.focus(); e.preventDefault()
  }

  const textColor = isDark ? '#fff' : '#111827'
  const borderFocused = 'rgba(201,147,44,.7)'

  return (
    <div ref={containerRef} style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {Array.from({ length: 8 }).map((_, i) => (
        <input key={i} type="text" inputMode="numeric" maxLength={1} value={digits[i] || ''}
          onKeyDown={e => handleKey(i, e)} onPaste={handlePaste} onChange={() => {}} onClick={e => e.target.select()}
          style={{
            width: 44, height: 52, textAlign: 'center', fontSize: '1.3rem', fontWeight: 700,
            color: textColor,
            background: digits[i] ? 'rgba(201,147,44,.15)' : (isDark ? 'rgba(255,255,255,.05)' : '#f9fafb'),
            border: `1.5px solid ${digits[i] ? 'rgba(201,147,44,.5)' : (isDark ? 'rgba(255,255,255,.12)' : '#e2e8f0')}`,
            borderRadius: 10, outline: 'none', fontFamily: "'Courier New', monospace",
            transition: 'all .15s', caretColor: 'transparent',
          }}
          onFocus={e => e.target.style.borderColor = borderFocused}
          onBlur={e => e.target.style.borderColor = digits[i] ? 'rgba(201,147,44,.5)' : (isDark ? 'rgba(255,255,255,.12)' : '#e2e8f0')}
        />
      ))}
    </div>
  )
}

/* ── password checklist ──────────────────────────────────────────────── */
function PwdChecklist({ password }) {
  const { lang } = useLang()
  const { theme } = useTheme()
  const isAr  = lang === 'ar'
  const isDark = theme === 'dark'
  const strength = pwdStrength(password)
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#22c55e', '#22c55e']
  const strengthLabels = {
    en: ['', 'Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'],
    ar: ['', 'ضعيفة جداً', 'ضعيفة', 'مقبولة', 'جيدة', 'قوية', 'قوية جداً'],
  }
  const mutedClr  = isDark ? 'rgba(255,255,255,.3)' : '#9ca3af'
  const trackClr  = isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb'
  const headerClr = isDark ? 'rgba(255,255,255,.4)' : '#6b7280'
  return (
    <div style={{ marginTop: 12 }}>
      {password.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: '.7rem', letterSpacing: isAr ? 0 : '.06em', color: headerClr }}>{isAr ? 'قوة كلمة المرور' : 'PASSWORD STRENGTH'}</span>
            <span style={{ fontSize: '.72rem', fontWeight: 600, color: colors[strength] }}>{strengthLabels[isAr ? 'ar' : 'en'][strength]}</span>
          </div>
          <div style={{ display: 'flex', gap: 3 }}>
            {[1,2,3,4,5,6].map(i => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= strength ? colors[strength] : trackClr, transition: 'background .3s' }} />
            ))}
          </div>
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '5px 12px' }}>
        {PWD_RULES.map(({ en, ar, test }) => {
          const ok = password.length > 0 && test(password)
          return (
            <div key={en} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.74rem', color: ok ? '#4ade80' : mutedClr, transition: 'color .3s' }}>
              <div style={{ width: 14, height: 14, borderRadius: '50%', flexShrink: 0, border: `1.5px solid ${ok ? '#4ade80' : mutedClr}`, background: ok ? '#4ade80' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .3s' }}>
                {ok && <svg viewBox="0 0 12 12" fill="none" stroke="#0a1b22" strokeWidth="2.5" width="8" height="8"><polyline points="2 6 5 9 10 3"/></svg>}
              </div>
              <span>{isAr ? ar : en}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/* ── main page ───────────────────────────────────────────────────────── */
function ForgotPasswordPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { lang } = useLang()
  const { theme } = useTheme()
  const isAr  = lang === 'ar'
  const isDark = theme === 'dark'

  const firstLogin = searchParams.get('mode') === 'first-login'
  const [step,         setStep]         = useState('email')
  const [email,        setEmail]        = useState('')
  const [otp,          setOtp]          = useState('')
  const [password,     setPassword]     = useState('')
  const [confirm,      setConfirm]      = useState('')
  const [showPwd,      setShowPwd]      = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [error,        setError]        = useState('')
  const [loading,      setLoading]      = useState(false)
  const [resendCount,  setResendCount]  = useState(0)
  const countdown  = useCountdown()
  const lock       = useCountdown()
  const didAutoSend = useRef(false)

  useEffect(() => {
    if (!firstLogin || didAutoSend.current) return
    const emailParam = searchParams.get('email') || ''
    if (!emailParam) return
    didAutoSend.current = true
    setEmail(emailParam); setStep('otp')
    fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: emailParam }) })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) { if (data.error === 'locked') { lock.start(data.lockedSeconds) } else setError(data.error); return }
        setResendCount(data.resendCount || 0); countdown.start(180)
      }).catch(() => {})
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function requestOtp(isResend = false) {
    setError(''); setLoading(true)
    const res  = await fetch('/api/auth/forgot-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      if (data.error === 'locked') { lock.start(data.lockedSeconds); setStep('otp'); setError(isAr ? `طلبات كثيرة. مقفل لـ ${Math.ceil(data.lockedSeconds / 60)} دقيقة.` : `Too many OTP requests. Locked for ${Math.ceil(data.lockedSeconds / 60)} min.`); return }
      setError(data.error); return
    }
    setResendCount(data.resendCount || 0); countdown.start(180)
    if (!isResend) setStep('otp'); else setOtp('')
  }

  async function verifyOtp() {
    if (otp.length < 8) { setError(isAr ? 'أدخل الرمز المكوّن من 8 أرقام.' : 'Please enter the complete 8-digit code.'); return }
    setError(''); setLoading(true)
    const res  = await fetch('/api/auth/verify-otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, otp }) })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { if (data.error === 'locked') { lock.start(data.lockedSeconds); setError(isAr ? 'الحساب مقفل مؤقتاً.' : 'Account temporarily locked.'); return } setError(data.error); return }
    setStep('password')
  }

  async function resetPassword() {
    setError('')
    if (pwdStrength(password) < 6) { setError(isAr ? 'كلمة المرور لا تستوفي جميع الشروط.' : 'Password does not meet all requirements.'); return }
    if (password !== confirm)       { setError(isAr ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.'); return }
    setLoading(true)
    const res  = await fetch('/api/auth/reset-password', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, confirmPassword: confirm }) })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error); return }
    setStep('success'); setTimeout(() => router.push(data.redirect || '/portal'), 2500)
  }

  /* — left panel per step — */
  const leftIllustration = step === 'password' || step === 'success'
    ? '/images/reset-password-illustration.svg' : '/images/reset-mail-illustration.svg'

  const stepIdx = { email: 0, otp: 1, password: 2, success: 3 }[step]

  const stepNames = isAr
    ? ['البريد', 'الرمز', 'كلمة المرور', 'تم']
    : ['Email', 'OTP', 'Password', 'Done']

  const leftBadge = isAr
    ? (['استعادة الحساب', 'التحقق من هويتك', 'تأمين حسابك', 'عُدت بأمان!'])[stepIdx]
    : (['ACCOUNT RECOVERY', 'VERIFY YOUR IDENTITY', 'SECURE YOUR ACCOUNT', 'ACCESS RESTORED'])[stepIdx]

  const leftTitle = isAr ? (
    [<>استعِد الوصول<br />إلى <span>حسابك.</span></>,
     firstLogin ? <>مرحباً!<br />دعنا <span>نؤمّن حسابك.</span></> : <>تحقّق من<br /><span>بريدك.</span></>,
     <>أنشئ كلمة مرور<br /><span>قوية جديدة.</span></>,
     <>عُدت<br /><span>بنجاح!</span></>]
  )[stepIdx] : (
    [<>Regain access<br />to your <span>account.</span></>,
     firstLogin ? <>Welcome!<br />Let's secure your <span>account.</span></> : <>Check your<br /><span>inbox.</span></>,
     <>Create a new<br /><span>secure password.</span></>,
     <>You're back<br /><span>in!</span></>]
  )[stepIdx]

  const leftSub = isAr ? (
    ['أدخل بريدك الإلكتروني المسجّل وسنرسل لك رمزاً للتحقق من هويتك.',
     firstLogin
       ? `أُنشئ حسابك من قِبل المشرف. أرسلنا رمز تحقق إلى ${email} — أدخله لضبط كلمة مرورك.`
       : `أرسلنا رمزاً مكوّناً من 8 أرقام إلى ${email}. أدخله أدناه — ينتهي خلال 3 دقائق.`,
     firstLogin ? 'تم التحقق من هويتك. اختر كلمة مرور قوية لحماية حسابك الجديد.' : 'تم التحقق من هويتك. اضبط كلمة مرور قوية لحماية حسابك.',
     firstLogin ? 'تم ضبط كلمة المرور! جارٍ تسجيل دخولك…' : 'تم إعادة ضبط كلمة مرورك. جارٍ تسجيل دخولك تلقائياً…']
  )[stepIdx] : (
    ["Enter your registered email and we'll send a one-time code to verify your identity.",
     firstLogin
       ? `Your account was created by an admin. We sent a verification code to ${email} — enter it to set your own password.`
       : `We sent an 8-digit code to ${email}. Enter it below — it expires in 3 minutes.`,
     firstLogin ? 'Identity confirmed. Choose a strong password to secure your new account.' : 'Your identity is confirmed. Set a new strong password to protect your account.',
     firstLogin ? 'Password set! Signing you in to your new account…' : 'Your password has been reset. Signing you in automatically…']
  )[stepIdx]

  const ff = isAr ? "var(--font-tajawal,'Tajawal',sans-serif)" : "var(--font-montserrat,'Montserrat',sans-serif)"

  /* — color tokens — */
  const bgRight   = isDark ? '#10222b' : '#f8fafc'
  const textMain  = isDark ? '#fff'    : '#0f172a'
  const textMuted = isDark ? 'rgba(255,255,255,.38)' : '#64748b'
  const labelClr  = isDark ? 'rgba(255,255,255,.45)' : '#374151'
  const inputBg   = isDark ? 'rgba(255,255,255,.05)' : '#fff'
  const inputBdr  = isDark ? 'rgba(201,147,44,.18)'  : '#e2e8f0'
  const inputClr  = isDark ? '#fff'    : '#0f172a'
  const phClr     = isDark ? 'rgba(255,255,255,.2)'  : '#9ca3af'
  const eyeClr    = isDark ? 'rgba(255,255,255,.3)'  : '#9ca3af'
  const timerLbl  = isDark ? 'rgba(255,255,255,.3)'  : '#9ca3af'
  const resendClr = isDark ? 'rgba(255,255,255,.35)' : '#64748b'
  const errClr    = isDark ? '#f87171' : '#ef4444'

  const inputStyle = { width: '100%', padding: `13px 14px 13px ${isAr ? '14px' : '42px'}`, paddingRight: isAr ? '42px' : '14px', background: inputBg, border: `1px solid ${inputBdr}`, borderRadius: 11, color: inputClr, fontSize: '.9rem', fontFamily: 'inherit', outline: 'none', transition: 'border-color .2s, background .2s' }
  const inputPrStyle = { ...inputStyle, paddingRight: isAr ? '42px' : '44px', paddingLeft: isAr ? '44px' : '42px' }
  const labelStyle = { display: 'block', fontSize: '.7rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.1em', color: labelClr, marginBottom: 7 }
  const iconL = isAr
    ? { position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(201,147,44,.65)', lineHeight: 0, pointerEvents: 'none' }
    : { position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(201,147,44,.65)', lineHeight: 0, pointerEvents: 'none' }
  const eyeStyle = { position: 'absolute', [isAr ? 'left' : 'right']: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: eyeClr, padding: 0, lineHeight: 0 }
  const backStyle = { display: 'flex', alignItems: 'center', gap: 6, fontSize: '.82rem', color: resendClr, marginTop: 20, textDecoration: 'none', cursor: 'pointer', background: 'none', border: 'none', fontFamily: 'inherit', padding: 0 }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .fp-root { display: flex; min-height: 100vh; }

        .fp-left { position: relative; flex: 0 0 48%; background: #0a1b22; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; padding: 48px 52px; }
        .fp-left__bg { position: absolute; inset: 0; background-size: contain; background-repeat: no-repeat; background-position: center bottom; opacity: .3; transition: background-image .4s; }
        .fp-glow1 { position: absolute; top: -150px; left: -100px; width: 500px; height: 500px; background: radial-gradient(circle, rgba(201,147,44,.22) 0%, transparent 65%); pointer-events: none; }
        .fp-glow2 { position: absolute; bottom: -100px; right: -60px; width: 380px; height: 380px; background: radial-gradient(circle, rgba(73,80,65,.3) 0%, transparent 65%); pointer-events: none; }
        .fp-grid    { position: absolute; inset: 0; background-image: linear-gradient(rgba(201,147,44,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,147,44,.04) 1px, transparent 1px); background-size: 48px 48px; pointer-events: none; }
        .fp-divider { position: absolute; top: 0; right: 0; bottom: 0; width: 1px; background: linear-gradient(to bottom, transparent, rgba(201,147,44,.3) 30%, rgba(201,147,44,.3) 70%, transparent); }
        [dir="rtl"] .fp-divider { right: auto; left: 0; }

        .fp-brand      { position: relative; z-index: 2; display: flex; align-items: center; gap: 14px; }
        .fp-brand__em  { width: 46px; height: 46px; border-radius: 50%; background: rgba(201,147,44,.12); border: 1px solid rgba(201,147,44,.3); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .fp-brand__name { font-size: .7rem; font-weight: 700; letter-spacing: .2em; color: #c9932c; }
        .fp-brand__tag  { font-size: .55rem; letter-spacing: .16em; color: rgba(201,147,44,.5); margin-top: 3px; }
        [dir="rtl"] .fp-brand__name, [dir="rtl"] .fp-brand__tag { letter-spacing: 0; }

        .fp-hero   { position: relative; z-index: 2; flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 48px 0 28px; }
        .fp-badge  { display: inline-flex; align-items: center; gap: 7px; background: rgba(201,147,44,.1); border: 1px solid rgba(201,147,44,.22); border-radius: 100px; padding: 5px 14px; font-size: .67rem; font-weight: 600; letter-spacing: .12em; color: #c9932c; margin-bottom: 22px; width: fit-content; }
        [dir="rtl"] .fp-badge { letter-spacing: 0; }
        .fp-badge__dot { width: 6px; height: 6px; border-radius: 50%; background: #c9932c; animation: fpPulse 2s ease-in-out infinite; }
        .fp-title  { font-size: clamp(1.8rem, 2.8vw, 2.5rem); font-weight: 900; color: #fff; line-height: 1.1; margin-bottom: 16px; }
        .fp-title span { background: linear-gradient(135deg, #c9932c 0%, #e8b84b 50%, #ae6d0c 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .fp-sub    { font-size: .88rem; color: rgba(255,255,255,.4); line-height: 1.75; max-width: 340px; }

        .fp-steps  { position: relative; z-index: 2; display: flex; gap: 8px; flex-wrap: wrap; }
        .fp-step   { display: flex; align-items: center; gap: 6px; font-size: .7rem; font-weight: 600; padding: 5px 12px; border-radius: 100px; transition: all .3s; }
        .fp-step--done    { background: rgba(74,222,128,.1); border: 1px solid rgba(74,222,128,.3); color: #4ade80; }
        .fp-step--active  { background: rgba(201,147,44,.15); border: 1px solid rgba(201,147,44,.4); color: #c9932c; }
        .fp-step--pending { background: rgba(255,255,255,.04); border: 1px solid rgba(255,255,255,.08); color: rgba(255,255,255,.25); }
        .fp-left__footer  { position: relative; z-index: 2; font-size: .68rem; letter-spacing: .07em; color: rgba(255,255,255,.18); margin-top: 24px; }
        [dir="rtl"] .fp-left__footer { letter-spacing: 0; }

        .fp-right   { flex: 1; overflow-y: auto; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 48px 52px; min-height: 100vh; }
        .fp-inner   { width: 100%; max-width: 400px; }
        .fp-spinner { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: fpSpin .7s linear infinite; }
        .fp-btn     { width: 100%; padding: 14px; background: linear-gradient(135deg, #c9932c 0%, #ae6d0c 100%); border: none; border-radius: 11px; color: #fff; font-size: .92rem; font-weight: 700; letter-spacing: .07em; cursor: pointer; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 9px; transition: opacity .2s; margin-top: 4px; }
        .fp-btn:hover:not(:disabled) { opacity: .88; }
        .fp-btn:disabled { opacity: .45; cursor: not-allowed; }

        .fp-ring       { position: relative; width: 72px; height: 72px; }
        .fp-ring svg   { transform: rotate(-90deg); }
        .fp-ring__secs { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-size: .88rem; font-weight: 800; color: #c9932c; font-family: 'Courier New', monospace; }

        @keyframes fpSpin  { to { transform: rotate(360deg); } }
        @keyframes fpPulse { 0%,100% { opacity:1; } 50% { opacity:.4; } }

        @media (max-width: 860px) { .fp-left { display: none; } .fp-right { padding: 40px 24px; justify-content: flex-start; padding-top: 52px; } }
      `}</style>

      <AuthToggles />

      <div className="fp-root" style={{ fontFamily: ff }}>
        {/* ── LEFT ── */}
        <div className="fp-left">
          <div className="fp-left__bg" style={{ backgroundImage: `url(${leftIllustration})` }} />
          <div className="fp-glow1" /><div className="fp-glow2" /><div className="fp-grid" /><div className="fp-divider" />

          <Link href="/" className="fp-brand" style={{ textDecoration: 'none' }}>
            <div className="fp-brand__em">
              <Image src="/images/logo.png" alt="Grace Academy" width={26} height={26} style={{ objectFit: 'contain' }} />
            </div>
            <div>
              <div className="fp-brand__name">GRACE ACADEMY</div>
              <div className="fp-brand__tag">{isAr ? 'العلم نور الحياة' : 'LONG LIVE LEARN'}</div>
            </div>
          </Link>

          <div className="fp-hero">
            <div className="fp-badge"><span className="fp-badge__dot" />{leftBadge}</div>
            <h2 className="fp-title">{leftTitle}</h2>
            <p className="fp-sub">{leftSub}</p>
          </div>

          <div className="fp-steps">
            {stepNames.map((s, i) => (
              <div key={s} className={`fp-step ${i < stepIdx ? 'fp-step--done' : i === stepIdx ? 'fp-step--active' : 'fp-step--pending'}`}>
                {i < stepIdx
                  ? <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5" width="10" height="10"><polyline points="2 6 5 9 10 3"/></svg>
                  : <span style={{ fontSize: '.65rem', fontWeight: 800 }}>{i + 1}</span>
                }
                {s}
              </div>
            ))}
          </div>

          <div className="fp-left__footer">{isAr ? '© 2025 أكاديمية غريس · العلم نور الحياة' : '© 2025 GRACE ACADEMY · LONG LIVE LEARN'}</div>
        </div>

        {/* ── RIGHT ── */}
        <div className="fp-right" style={{ background: bgRight }}>
          <div className="fp-inner">

            {/* ─── STEP: EMAIL ─── */}
            {step === 'email' && (
              <>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#c9932c" strokeWidth="1.8" width="22" height="22"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: textMain, marginBottom: 5 }}>{isAr ? 'نسيت كلمة المرور؟' : 'Forgot your password?'}</h1>
                <p style={{ fontSize: '.84rem', color: textMuted, marginBottom: 28, lineHeight: 1.6 }}>{isAr ? 'أدخل بريدك الإلكتروني المسجّل وسنرسل لك رمزاً آمناً.' : "Enter your registered email address and we'll send you a secure one-time code."}</p>

                {error && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 9, padding: '10px 13px', marginBottom: 18, color: errClr, fontSize: '.84rem' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {error}
                  </div>
                )}

                <div style={{ marginBottom: 20 }}>
                  <label style={labelStyle}>{isAr ? 'البريد الإلكتروني' : 'EMAIL ADDRESS'}</label>
                  <div style={{ position: 'relative' }}>
                    <span style={iconL}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
                    <input style={inputStyle} type="email" value={email} autoFocus onChange={e => { setEmail(e.target.value); setError('') }} onKeyDown={e => e.key === 'Enter' && requestOtp()} placeholder="your@email.com" />
                  </div>
                </div>

                <button className="fp-btn" onClick={() => requestOtp()} disabled={loading || !email.trim()}>
                  {loading ? <><span className="fp-spinner" /> {isAr ? 'جارٍ الإرسال…' : 'Sending Code…'}</> : <>{isAr ? 'إرسال رمز OTP' : 'Send OTP Code'} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>}
                </button>

                <div style={{ textAlign: 'center', marginTop: 20 }}>
                  <Link href="/login" style={backStyle}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="15 18 9 12 15 6"/></svg>
                    {isAr ? 'العودة إلى تسجيل الدخول' : 'Back to Sign In'}
                  </Link>
                </div>
              </>
            )}

            {/* ─── STEP: OTP ─── */}
            {step === 'otp' && (
              <>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#c9932c" strokeWidth="1.8" width="22" height="22"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: textMain, marginBottom: 5 }}>{isAr ? (firstLogin ? 'تحقق من هويتك' : 'أدخل رمز OTP') : (firstLogin ? 'Verify your identity' : 'Enter your OTP')}</h1>
                <p style={{ fontSize: '.84rem', color: textMuted, marginBottom: 28, lineHeight: 1.6 }}>
                  {isAr ? (firstLogin ? 'مرحباً بك في أكاديمية غريس! أرسلنا رمز تحقق إلى ' : 'أرسلنا رمزاً مكوّناً من 8 أرقام إلى ')
                         : (firstLogin ? "Welcome to Grace Academy! We've sent a verification code to " : 'We sent an 8-digit code to ')}
                  <strong style={{ color: '#c9932c' }}>{email}</strong>
                </p>

                {lock.running ? (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,.1)', border: '2px solid rgba(239,68,68,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" width="28" height="28"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, color: textMain, marginBottom: 8 }}>{isAr ? 'الحساب مقفل مؤقتاً' : 'Account Temporarily Locked'}</div>
                    <p style={{ fontSize: '.84rem', color: textMuted, lineHeight: 1.7, marginBottom: 20 }}>{isAr ? 'طلبات OTP كثيرة. يرجى الانتظار قبل المحاولة مجدداً.' : 'Too many OTP requests. Please wait before trying again.'}</p>
                    <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#ef4444', fontFamily: "'Courier New', monospace", letterSpacing: 4 }}>
                      {String(Math.floor(lock.secs / 60)).padStart(2,'0')}:{String(lock.secs % 60).padStart(2,'0')}
                    </div>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 9, padding: '10px 13px', marginBottom: 18, color: errClr, fontSize: '.84rem' }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {error}
                      </div>
                    )}

                    <div style={{ marginBottom: 8 }}>
                      <OtpInput value={otp} onChange={v => { setOtp(v); setError('') }} />
                    </div>

                    {/* Countdown ring */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, margin: '20px 0 16px' }}>
                      <div className="fp-ring">
                        <svg viewBox="0 0 72 72" width="72" height="72">
                          <circle cx="36" cy="36" r="30" fill="none" stroke={isDark ? 'rgba(255,255,255,.07)' : 'rgba(0,0,0,.07)'} strokeWidth="5"/>
                          <circle cx="36" cy="36" r="30" fill="none"
                            stroke={countdown.secs > 60 ? '#c9932c' : countdown.secs > 30 ? '#f97316' : '#ef4444'}
                            strokeWidth="5" strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 30}`}
                            strokeDashoffset={`${2 * Math.PI * 30 * (1 - countdown.secs / 180)}`}
                            style={{ transition: 'stroke-dashoffset 1s linear, stroke .5s' }}
                          />
                        </svg>
                        <div className="fp-ring__secs">
                          {String(Math.floor(countdown.secs / 60)).padStart(2,'0')}:{String(countdown.secs % 60).padStart(2,'0')}
                        </div>
                      </div>
                      <div style={{ fontSize: '.7rem', letterSpacing: isAr ? 0 : '.1em', color: timerLbl }}>{countdown.running ? (isAr ? 'ينتهي الرمز خلال' : 'CODE EXPIRES IN') : (isAr ? 'انتهت صلاحية الرمز' : 'CODE EXPIRED')}</div>
                    </div>

                    <button className="fp-btn" onClick={verifyOtp} disabled={loading || otp.length < 8} style={{ marginBottom: 10 }}>
                      {loading ? <><span className="fp-spinner" /> {isAr ? 'جارٍ التحقق…' : 'Verifying…'}</> : <>{isAr ? 'تحقق من الرمز' : 'Verify Code'} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15"><polyline points="20 6 9 17 4 12"/></svg></>}
                    </button>

                    <div style={{ textAlign: 'center', fontSize: '.82rem', color: resendClr, marginTop: 4 }}>
                      {isAr ? 'لم تتلقَّ الرمز؟ ' : "Didn't receive the code? "}
                      {resendCount >= 3
                        ? <span style={{ color: 'rgba(239,68,68,.6)' }}>{isAr ? 'تجاوزت الحد الأقصى للإعادة' : 'Maximum resends reached'}</span>
                        : (
                          <button onClick={() => requestOtp(true)} disabled={countdown.running || loading}
                            style={{ background: 'none', border: 'none', color: countdown.running ? (isDark ? 'rgba(255,255,255,.2)' : '#d1d5db') : '#c9932c', fontWeight: 600, cursor: countdown.running ? 'not-allowed' : 'pointer', fontSize: '.82rem', fontFamily: 'inherit', padding: 0 }}>
                            {isAr ? `إعادة الإرسال${resendCount > 0 ? ` (${3 - resendCount} متبق)` : ''}` : `Resend OTP${resendCount > 0 ? ` (${3 - resendCount} left)` : ''}`}
                          </button>
                        )
                      }
                    </div>
                  </>
                )}

                {!firstLogin && (
                  <button style={backStyle} onClick={() => { setStep('email'); setOtp(''); setError('') }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><polyline points="15 18 9 12 15 6"/></svg>
                    {isAr ? 'تغيير البريد الإلكتروني' : 'Change Email'}
                  </button>
                )}
              </>
            )}

            {/* ─── STEP: PASSWORD ─── */}
            {step === 'password' && (
              <>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#c9932c" strokeWidth="1.8" width="22" height="22"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                </div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: textMain, marginBottom: 5 }}>{isAr ? (firstLogin ? 'إنشاء كلمة مرورك' : 'ضبط كلمة مرور جديدة') : (firstLogin ? 'Create your password' : 'Set new password')}</h1>
                <p style={{ fontSize: '.84rem', color: textMuted, marginBottom: 28, lineHeight: 1.6 }}>
                  {isAr ? (firstLogin ? 'اختر كلمة مرور قوية لحساب ' : 'أنشئ كلمة مرور قوية لـ ') : (firstLogin ? 'Choose a strong password to secure your account at ' : 'Create a strong password for ')}
                  <strong style={{ color: '#c9932c' }}>{email}</strong>
                </p>

                {error && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 9, padding: '10px 13px', marginBottom: 18, color: errClr, fontSize: '.84rem' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {error}
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <label style={labelStyle}>{isAr ? 'كلمة المرور الجديدة *' : 'NEW PASSWORD *'}</label>
                  <div style={{ position: 'relative' }}>
                    <span style={iconL}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                    <input style={inputPrStyle} type={showPwd ? 'text' : 'password'} value={password} onChange={e => { setPassword(e.target.value); setError('') }} placeholder={isAr ? 'الحد الأدنى 12 حرفاً' : 'Minimum 12 characters'} autoFocus />
                    <button type="button" style={eyeStyle} onClick={() => setShowPwd(v => !v)}>
                      {showPwd
                        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                    </button>
                  </div>
                  <PwdChecklist password={password} />
                </div>

                <div style={{ marginBottom: 22 }}>
                  <label style={labelStyle}>{isAr ? 'تأكيد كلمة المرور *' : 'CONFIRM PASSWORD *'}</label>
                  <div style={{ position: 'relative' }}>
                    <span style={iconL}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                    <input style={inputPrStyle} type={showConfirm ? 'text' : 'password'} value={confirm} onChange={e => { setConfirm(e.target.value); setError('') }} placeholder={isAr ? 'أعد كتابة كلمة المرور الجديدة' : 'Repeat your new password'} />
                    <button type="button" style={eyeStyle} onClick={() => setShowConfirm(v => !v)}>
                      {showConfirm
                        ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                    </button>
                  </div>
                  {confirm && password === confirm && (
                    <div style={{ fontSize: '.72rem', color: '#4ade80', marginTop: 6, display: 'flex', alignItems: 'center', gap: 5 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>
                      {isAr ? 'كلمتا المرور متطابقتان' : 'Passwords match'}
                    </div>
                  )}
                </div>

                <button className="fp-btn" onClick={resetPassword} disabled={loading || pwdStrength(password) < 6 || !confirm}>
                  {loading ? <><span className="fp-spinner" /> {isAr ? 'جارٍ التحديث…' : 'Updating Password…'}</> : <>{isAr ? 'إعادة ضبط كلمة المرور' : 'Reset Password'} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15"><polyline points="20 6 9 17 4 12"/></svg></>}
                </button>
              </>
            )}

            {/* ─── STEP: SUCCESS ─── */}
            {step === 'success' && (
              <div style={{ textAlign: 'center', padding: '24px 0' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'rgba(74,222,128,.1)', border: '2px solid rgba(74,222,128,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" width="32" height="32"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h1 style={{ fontSize: '1.3rem', fontWeight: 800, color: textMain, marginBottom: 8 }}>{isAr ? 'تم إعادة ضبط كلمة المرور!' : 'Password Reset!'}</h1>
                <p style={{ fontSize: '.88rem', color: textMuted, lineHeight: 1.7, marginBottom: 24 }}>
                  {isAr ? 'تم تحديث كلمة مرورك بنجاح.\nجارٍ تسجيل دخولك تلقائياً…' : 'Your password has been updated successfully.\nSigning you in automatically…'}
                </p>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <span className="fp-spinner" style={{ width: 20, height: 20, borderWidth: 2.5, borderColor: 'rgba(201,147,44,.3)', borderTopColor: '#c9932c' }} />
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  )
}

export default function ForgotPasswordPageWrapper() {
  return (
    <Suspense>
      <ForgotPasswordPage />
    </Suspense>
  )
}
