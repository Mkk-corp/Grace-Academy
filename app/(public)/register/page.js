'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { COUNTRIES, getFlag, DEFAULT_COUNTRY } from '@/lib/countries'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'

const PWD_CHECKS = [
  { en: 'At least 8 characters',           ar: 'ثمانية أحرف على الأقل',      test: p => p.length >= 8 },
  { en: 'One uppercase letter (A–Z)',       ar: 'حرف كبير واحد (A–Z)',         test: p => /[A-Z]/.test(p) },
  { en: 'One lowercase letter (a–z)',       ar: 'حرف صغير واحد (a–z)',         test: p => /[a-z]/.test(p) },
  { en: 'One number (0–9)',                 ar: 'رقم واحد (0–9)',              test: p => /[0-9]/.test(p) },
  { en: 'One special character (!@#…)',     ar: 'رمز خاص واحد (!@#…)',        test: p => /[^a-zA-Z0-9]/.test(p) },
]

function pwdStrength(p) { return PWD_CHECKS.filter(c => c.test(p)).length }

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

function CountryPicker({ value, onChange }) {
  const { lang } = useLang()
  const { theme } = useTheme()
  const isAr  = lang === 'ar'
  const isDark = theme === 'dark'

  const [open,   setOpen]   = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef(null)

  const filtered = search.trim()
    ? COUNTRIES.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.dial.includes(search))
    : COUNTRIES

  useEffect(() => {
    function h(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  const triggerBg  = isDark ? 'rgba(255,255,255,.05)' : '#fff'
  const triggerBdr = isDark ? 'rgba(201,147,44,.18)'  : '#e2e8f0'
  const dropBg     = isDark ? '#0d2030'               : '#fff'
  const dropBdr    = isDark ? 'rgba(201,147,44,.22)'  : '#e2e8f0'
  const itemColor  = isDark ? '#fff'                  : '#1e293b'
  const searchBg   = isDark ? 'rgba(255,255,255,.06)' : '#f9fafb'
  const searchBdr  = isDark ? 'rgba(255,255,255,.1)'  : '#e2e8f0'
  const searchClr  = isDark ? '#fff'                  : '#111827'

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => { setOpen(v => !v); setSearch('') }}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '13px 10px 13px 13px',
          background: triggerBg, border: `1px solid ${triggerBdr}`,
          borderRight: 'none', borderRadius: `${isAr ? '0 11px 11px 0' : '11px 0 0 11px'}`,
          color: itemColor, cursor: 'pointer', whiteSpace: 'nowrap',
          fontSize: '.88rem', fontFamily: 'inherit', minWidth: 90,
        }}
      >
        <span style={{ fontSize: '1.1rem', lineHeight: 1 }}>{getFlag(value.code)}</span>
        <span style={{ color: '#c9932c', fontWeight: 600, fontSize: '.82rem' }}>{value.dial}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke={isDark ? 'rgba(255,255,255,.4)' : '#9ca3af'} strokeWidth="2" width="11" height="11"
          style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .2s' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, zIndex: 100,
          width: 270, marginTop: 4, background: dropBg,
          border: `1px solid ${dropBdr}`, borderRadius: 11, overflow: 'hidden',
          boxShadow: '0 16px 48px rgba(0,0,0,.35)',
        }}>
          <div style={{ padding: '10px 10px 6px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.07)' : '#f1f5f9'}` }}>
            <div style={{ position: 'relative' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={isDark ? 'rgba(255,255,255,.35)' : '#9ca3af'} strokeWidth="2" width="14" height="14"
                style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input autoFocus value={search} onChange={e => setSearch(e.target.value)}
                placeholder={isAr ? 'ابحث عن دولة…' : 'Search country or code…'}
                style={{ width: '100%', padding: '8px 10px 8px 32px', background: searchBg, border: `1px solid ${searchBdr}`, borderRadius: 7, color: searchClr, fontSize: '.82rem', fontFamily: 'inherit', outline: 'none' }} />
            </div>
          </div>
          <div style={{ maxHeight: 220, overflowY: 'auto' }}>
            {filtered.length === 0
              ? <div style={{ padding: '14px', textAlign: 'center', color: isDark ? 'rgba(255,255,255,.3)' : '#9ca3af', fontSize: '.8rem' }}>{isAr ? 'لا نتائج' : 'No results'}</div>
              : filtered.map(c => (
                <button key={c.code} type="button" onClick={() => { onChange(c); setOpen(false) }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '9px 14px',
                    background: value.code === c.code ? 'rgba(201,147,44,.12)' : 'none',
                    border: 'none', cursor: 'pointer', textAlign: 'left', color: itemColor,
                    fontSize: '.84rem', fontFamily: 'inherit',
                    borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.04)' : '#f8fafc'}`,
                    transition: 'background .12s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.07)' : '#f1f5f9' }}
                  onMouseLeave={e => { e.currentTarget.style.background = value.code === c.code ? 'rgba(201,147,44,.12)' : 'none' }}
                >
                  <span style={{ fontSize: '1.05rem' }}>{getFlag(c.code)}</span>
                  <span style={{ flex: 1, fontSize: '.82rem' }}>{c.name}</span>
                  <span style={{ color: '#c9932c', fontSize: '.78rem', fontWeight: 600 }}>{c.dial}</span>
                </button>
              ))
            }
          </div>
        </div>
      )}
    </div>
  )
}

function PasswordChecklist({ password }) {
  const { lang } = useLang()
  const { theme } = useTheme()
  const isAr  = lang === 'ar'
  const isDark = theme === 'dark'
  const strength = pwdStrength(password)
  const colors = ['', '#ef4444', '#f97316', '#eab308', '#22c55e', '#22c55e']
  const strengthLabels = {
    en: ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'],
    ar: ['', 'ضعيفة', 'مقبولة', 'جيدة', 'قوية', 'قوية جداً'],
  }
  const mutedColor = isDark ? 'rgba(255,255,255,.32)' : '#9ca3af'
  const trackColor = isDark ? 'rgba(255,255,255,.1)'  : '#e5e7eb'
  const strengthLbl = isDark ? 'rgba(255,255,255,.4)' : '#6b7280'

  return (
    <div style={{ marginTop: 12 }}>
      {password.length > 0 && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
            <span style={{ fontSize: '.7rem', letterSpacing: isAr ? 0 : '.06em', color: strengthLbl }}>{isAr ? 'قوة كلمة المرور' : 'PASSWORD STRENGTH'}</span>
            <span style={{ fontSize: '.72rem', fontWeight: 600, color: colors[strength] }}>{strengthLabels[isAr ? 'ar' : 'en'][strength]}</span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ flex: 1, height: 3, borderRadius: 99, background: i <= strength ? colors[strength] : trackColor, transition: 'background .3s' }} />
            ))}
          </div>
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
        {PWD_CHECKS.map(({ en, ar, test }) => {
          const ok = password.length > 0 && test(password)
          return (
            <div key={en} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '.76rem', color: ok ? '#4ade80' : mutedColor, transition: 'color .3s' }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', flexShrink: 0, border: `1.5px solid ${ok ? '#4ade80' : mutedColor}`, background: ok ? '#4ade80' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .3s' }}>
                {ok && <svg viewBox="0 0 12 12" fill="none" stroke="#0a1b22" strokeWidth="2.2" width="9" height="9"><polyline points="2 6 5 9 10 3"/></svg>}
              </div>
              <span>{isAr ? ar : en}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const { lang } = useLang()
  const { theme } = useTheme()
  const isAr  = lang === 'ar'
  const isDark = theme === 'dark'

  const [form,         setForm]         = useState({ name: '', username: '', email: '', phone: '', password: '', confirm: '' })
  const [country,      setCountry]      = useState(DEFAULT_COUNTRY)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [success,      setSuccess]      = useState(false)
  const [error,        setError]        = useState('')
  const [fieldErrors,  setFieldErrors]  = useState({})

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setFieldErrors(e => ({ ...e, [k]: '' })) }

  function validate() {
    const errs = {}
    if (!form.name.trim())     errs.name     = isAr ? 'الاسم الكامل مطلوب' : 'Full name is required'
    if (!form.username.trim()) errs.username  = isAr ? 'اسم المستخدم مطلوب' : 'Username is required'
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username)) errs.username = isAr ? 'أحرف وأرقام وشرطة سفلية فقط' : 'Letters, numbers and underscores only'
    if (!form.email.trim())    errs.email    = isAr ? 'البريد الإلكتروني مطلوب' : 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = isAr ? 'أدخل بريداً إلكترونياً صحيحاً' : 'Enter a valid email address'
    if (form.phone) {
      const digits = form.phone.replace(/\D/g, '')
      if (digits.length < country.min || digits.length > country.max)
        errs.phone = isAr ? `يجب أن يكون الهاتف ${country.min}–${country.max} أرقام` : `Phone should be ${country.min}${country.min !== country.max ? `–${country.max}` : ''} digits for ${country.name}`
    }
    if (!form.password)        errs.password = isAr ? 'كلمة المرور مطلوبة' : 'Password is required'
    else if (pwdStrength(form.password) < 4) errs.password = isAr ? 'كلمة المرور ضعيفة — استوفِ 4 شروط على الأقل' : 'Password is too weak — meet at least 4 conditions'
    if (!form.confirm)         errs.confirm  = isAr ? 'يرجى تأكيد كلمة المرور' : 'Please confirm your password'
    else if (form.password !== form.confirm) errs.confirm = isAr ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match'
    return errs
  }

  async function submit(e) {
    e.preventDefault(); setError('')
    const errs = validate()
    if (Object.keys(errs).length) { setFieldErrors(errs); return }
    setLoading(true)
    const res  = await fetch('/api/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: form.name.trim(), username: form.username.trim(), email: form.email.trim(), phone: form.phone ? `${country.dial} ${form.phone}` : '', password: form.password }) })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || (isAr ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'Something went wrong. Please try again.')); return }
    setSuccess(true)
  }

  const ff = isAr ? "var(--font-tajawal,'Tajawal',sans-serif)" : "var(--font-montserrat,'Montserrat',sans-serif)"

  /* — color tokens — */
  const bgRight    = isDark ? '#10222b' : '#f8fafc'
  const textMain   = isDark ? '#fff'    : '#0f172a'
  const textMuted  = isDark ? 'rgba(255,255,255,.38)' : '#64748b'
  const labelClr   = isDark ? 'rgba(255,255,255,.45)' : '#374151'
  const inputBg    = isDark ? 'rgba(255,255,255,.05)' : '#fff'
  const inputBdr   = isDark ? 'rgba(201,147,44,.18)'  : '#e2e8f0'
  const inputClr   = isDark ? '#fff'    : '#0f172a'
  const phClr      = isDark ? 'rgba(255,255,255,.2)'  : '#9ca3af'
  const eyeClr     = isDark ? 'rgba(255,255,255,.3)'  : '#9ca3af'
  const dividerLn  = isDark ? 'rgba(255,255,255,.08)' : '#e2e8f0'
  const dividerTx  = isDark ? 'rgba(255,255,255,.22)' : '#94a3b8'
  const googleBg   = isDark ? 'rgba(255,255,255,.06)' : '#fff'
  const googleBdr  = isDark ? 'rgba(255,255,255,.12)' : '#e2e8f0'
  const googleClr  = isDark ? '#fff'    : '#1e293b'
  const loginClr   = isDark ? 'rgba(255,255,255,.38)' : '#64748b'
  const footerClr  = isDark ? 'rgba(255,255,255,.18)' : '#94a3b8'
  const errClr     = isDark ? '#f87171' : '#ef4444'

  const inputStyle = { width: '100%', padding: `12px 14px 12px ${isAr ? '14px' : '40px'}`, paddingRight: isAr ? '40px' : '14px', background: inputBg, border: `1px solid ${inputBdr}`, borderRadius: 11, color: inputClr, fontSize: '.88rem', fontFamily: 'inherit', outline: 'none', transition: 'border-color .2s, background .2s' }
  const inputPrStyle = { ...inputStyle, paddingRight: isAr ? '40px' : '42px', paddingLeft: isAr ? '42px' : '40px' }
  const labelStyle = { display: 'block', fontSize: '.7rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.1em', color: labelClr, marginBottom: 7 }
  const iconL = isAr ? { position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(201,147,44,.65)', lineHeight: 0, pointerEvents: 'none' }
               : { position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: 'rgba(201,147,44,.65)', lineHeight: 0, pointerEvents: 'none' }
  const eyeStyle = { position: 'absolute', [isAr ? 'left' : 'right']: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: eyeClr, padding: 0, lineHeight: 0 }

  const PERKS = {
    en: ['Access to all enrolled courses', 'Personal learning dashboard', 'Track your progress 24/7', 'Community & live sessions', 'Digital certificates'],
    ar: ['الوصول إلى جميع الدورات المسجّلة', 'لوحة تعلّم شخصية', 'تتبّع تقدمك على مدار الساعة', 'مجتمع وجلسات مباشرة', 'شهادات رقمية'],
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .rg-root  { display: flex; min-height: 100vh; }
        .rg-left  { position: relative; flex: 0 0 48%; background: #0a1b22; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; padding: 48px 52px; }
        .rg-left__bg { position: absolute; inset: 0; background-image: url(/images/signup-illustration.svg); background-size: contain; background-repeat: no-repeat; background-position: center bottom; opacity: .32; }
        .rg-left__glow1 { position: absolute; top: -150px; left: -100px; width: 500px; height: 500px; background: radial-gradient(circle, rgba(201,147,44,.22) 0%, transparent 65%); pointer-events: none; }
        .rg-left__glow2 { position: absolute; bottom: -100px; right: -60px; width: 380px; height: 380px; background: radial-gradient(circle, rgba(73,80,65,.3) 0%, transparent 65%); pointer-events: none; }
        .rg-left__grid    { position: absolute; inset: 0; background-image: linear-gradient(rgba(201,147,44,.04) 1px, transparent 1px), linear-gradient(90deg, rgba(201,147,44,.04) 1px, transparent 1px); background-size: 48px 48px; pointer-events: none; }
        .rg-left__divider { position: absolute; top: 0; right: 0; bottom: 0; width: 1px; background: linear-gradient(to bottom, transparent, rgba(201,147,44,.3) 30%, rgba(201,147,44,.3) 70%, transparent); }
        [dir="rtl"] .rg-left__divider { right: auto; left: 0; }

        .rg-brand         { position: relative; z-index: 2; display: flex; align-items: center; gap: 14px; }
        .rg-brand__emblem { width: 46px; height: 46px; border-radius: 50%; background: rgba(201,147,44,.12); border: 1px solid rgba(201,147,44,.3); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .rg-brand__name   { font-size: .7rem; font-weight: 700; letter-spacing: .2em; color: #c9932c; }
        .rg-brand__tag    { font-size: .55rem; letter-spacing: .16em; color: rgba(201,147,44,.5); margin-top: 3px; }
        [dir="rtl"] .rg-brand__name, [dir="rtl"] .rg-brand__tag { letter-spacing: 0; }

        .rg-hero           { position: relative; z-index: 2; flex: 1; display: flex; flex-direction: column; justify-content: center; padding: 50px 0 30px; }
        .rg-hero__badge    { display: inline-flex; align-items: center; gap: 7px; background: rgba(201,147,44,.1); border: 1px solid rgba(201,147,44,.22); border-radius: 100px; padding: 5px 14px; font-size: .67rem; font-weight: 600; letter-spacing: .12em; color: #c9932c; margin-bottom: 24px; width: fit-content; }
        [dir="rtl"] .rg-hero__badge { letter-spacing: 0; }
        .rg-hero__dot      { width: 6px; height: 6px; border-radius: 50%; background: #c9932c; animation: rgPulse 2s ease-in-out infinite; }
        .rg-hero__title    { font-size: clamp(1.8rem, 2.8vw, 2.5rem); font-weight: 900; color: #fff; line-height: 1.1; margin-bottom: 16px; }
        .rg-hero__title span { background: linear-gradient(135deg, #c9932c 0%, #e8b84b 50%, #ae6d0c 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .rg-hero__sub      { font-size: .88rem; color: rgba(255,255,255,.4); line-height: 1.75; max-width: 340px; margin-bottom: 28px; }
        .rg-perks          { display: flex; flex-direction: column; gap: 12px; position: relative; z-index: 2; }
        .rg-perk           { display: flex; align-items: center; gap: 10px; }
        .rg-perk__dot      { width: 6px; height: 6px; border-radius: 50%; background: linear-gradient(135deg, #c9932c, #ae6d0c); flex-shrink: 0; }
        .rg-perk__text     { font-size: .8rem; color: rgba(255,255,255,.5); }
        .rg-left__footer   { position: relative; z-index: 2; font-size: .68rem; letter-spacing: .07em; color: rgba(255,255,255,.18); margin-top: 24px; }
        [dir="rtl"] .rg-left__footer { letter-spacing: 0; }

        .rg-right  { flex: 1; overflow-y: auto; display: flex; flex-direction: column; align-items: center; padding: 48px 52px; min-height: 100vh; }
        .rg-inner  { width: 100%; max-width: 420px; }
        .rg-spinner { width: 15px; height: 15px; border: 2px solid rgba(255,255,255,.3); border-top-color: #fff; border-radius: 50%; animation: rgSpin .7s linear infinite; }
        .rg-btn   { width: 100%; padding: 14px; background: linear-gradient(135deg, #c9932c 0%, #ae6d0c 100%); border: none; border-radius: 11px; color: #fff; font-size: .92rem; font-weight: 700; letter-spacing: .07em; cursor: pointer; font-family: inherit; display: flex; align-items: center; justify-content: center; gap: 9px; transition: opacity .2s; margin-top: 8px; }
        .rg-btn:hover:not(:disabled) { opacity: .88; }
        .rg-btn:disabled { opacity: .5; cursor: not-allowed; }

        @keyframes rgSpin  { to { transform: rotate(360deg); } }
        @keyframes rgPulse { 0%, 100% { opacity: 1; } 50% { opacity: .4; } }

        @media (max-width: 860px) { .rg-left { display: none; } .rg-right { padding: 36px 24px; } }
        @media (max-width: 480px) { .rg-right { padding: 28px 18px; } }
      `}</style>

      <AuthToggles />

      <div className="rg-root" style={{ fontFamily: ff }}>
        {/* LEFT */}
        <div className="rg-left">
          <div className="rg-left__bg" /><div className="rg-left__glow1" /><div className="rg-left__glow2" />
          <div className="rg-left__grid" /><div className="rg-left__divider" />

          <Link href="/" className="rg-brand" style={{ textDecoration: 'none' }}>
            <div className="rg-brand__emblem">
              <Image src="/images/logo.png" alt="Grace Academy" width={26} height={26} style={{ objectFit: 'contain' }} />
            </div>
            <div>
              <div className="rg-brand__name">GRACE ACADEMY</div>
              <div className="rg-brand__tag">{isAr ? 'العلم نور الحياة' : 'LONG LIVE LEARN'}</div>
            </div>
          </Link>

          <div className="rg-hero">
            <div className="rg-hero__badge">
              <span className="rg-hero__dot" />
              {isAr ? 'انضم إلى الأكاديمية' : 'JOIN THE ACADEMY'}
            </div>
            <h2 className="rg-hero__title">
              {isAr
                ? <>ابدأ رحلتك<br /><span>التعليمية</span><br />اليوم.</>
                : <>Start your<br /><span>learning journey</span><br />today.</>
              }
            </h2>
            <p className="rg-hero__sub">
              {isAr
                ? 'أنشئ حساب أكاديمية غريس واحصل على وصول فوري إلى برامج اللغة الإنجليزية عالمية المستوى.'
                : 'Create your Grace Academy account and get instant access to world-class English programmes.'
              }
            </p>
            <div className="rg-perks">
              {(isAr ? PERKS.ar : PERKS.en).map(perk => (
                <div className="rg-perk" key={perk}>
                  <div className="rg-perk__dot" />
                  <span className="rg-perk__text">{perk}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rg-left__footer">{isAr ? '© 2025 أكاديمية غريس · العلم نور الحياة' : '© 2025 GRACE ACADEMY · LONG LIVE LEARN'}</div>
        </div>

        {/* RIGHT */}
        <div className="rg-right" style={{ background: bgRight }}>
          <div className="rg-inner">
            {success ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'rgba(74,222,128,.1)', border: '2px solid rgba(74,222,128,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" width="30" height="30"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: textMain, marginBottom: 10 }}>{isAr ? 'تم إنشاء الحساب!' : 'Account Created!'}</h2>
                <p style={{ fontSize: '.9rem', color: textMuted, lineHeight: 1.7, marginBottom: 28 }}>
                  {isAr ? 'مرحباً بك في أكاديمية غريس! حسابك الطلابي جاهز. سجّل دخولك لبدء رحلتك.' : 'Welcome to Grace Academy! Your student account is ready. Sign in to begin your learning journey.'}
                </p>
                <Link href="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '13px 32px', borderRadius: 11, textDecoration: 'none', background: 'linear-gradient(135deg, #c9932c 0%, #ae6d0c 100%)', color: '#fff', fontWeight: 700, fontSize: '.92rem' }}>
                  {isAr ? 'تسجيل الدخول الآن' : 'Sign In Now'}
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </Link>
              </div>
            ) : (
              <>
                {/* Heading */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.28)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="#c9932c" strokeWidth="1.8" width="19" height="19"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                  </div>
                  <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: textMain, letterSpacing: '-.01em', marginBottom: 5 }}>{isAr ? 'إنشاء حسابك' : 'Create your account'}</h1>
                  <p style={{ fontSize: '.84rem', color: textMuted }}>{isAr ? 'انضم إلى آلاف الطلاب في أكاديمية غريس' : 'Join thousands of learners at Grace Academy'}</p>
                </div>

                {error && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.28)', borderRadius: 9, padding: '10px 13px', marginBottom: 16, color: errClr, fontSize: '.84rem' }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {error}
                  </div>
                )}

                <form onSubmit={submit} noValidate>
                  {/* Name + Username row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 14px' }}>
                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>{isAr ? 'الاسم الكامل *' : 'FULL NAME *'}</label>
                      <div style={{ position: 'relative' }}>
                        <span style={iconL}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
                        <input style={{ ...inputStyle, borderColor: fieldErrors.name ? 'rgba(239,68,68,.5)' : inputBdr }} type="text" value={form.name} onChange={e => set('name', e.target.value)} placeholder={isAr ? 'اسمك الكامل' : 'Your full name'} />
                      </div>
                      {fieldErrors.name && <div style={{ fontSize: '.72rem', color: errClr, marginTop: 5 }}>⚠ {fieldErrors.name}</div>}
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <label style={labelStyle}>{isAr ? 'اسم المستخدم *' : 'USERNAME *'}</label>
                      <div style={{ position: 'relative' }}>
                        <span style={{ ...iconL, fontFamily: 'monospace', fontWeight: 700, fontSize: '.85rem' }}>@</span>
                        <input style={{ ...inputStyle, borderColor: fieldErrors.username ? 'rgba(239,68,68,.5)' : inputBdr }} type="text" value={form.username} onChange={e => set('username', e.target.value)} placeholder="username" />
                      </div>
                      {fieldErrors.username && <div style={{ fontSize: '.72rem', color: errClr, marginTop: 5 }}>⚠ {fieldErrors.username}</div>}
                    </div>
                  </div>

                  {/* Email */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>{isAr ? 'البريد الإلكتروني *' : 'EMAIL ADDRESS *'}</label>
                    <div style={{ position: 'relative' }}>
                      <span style={iconL}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
                      <input style={{ ...inputStyle, borderColor: fieldErrors.email ? 'rgba(239,68,68,.5)' : inputBdr }} type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="your@email.com" />
                    </div>
                    {fieldErrors.email && <div style={{ fontSize: '.72rem', color: errClr, marginTop: 5 }}>⚠ {fieldErrors.email}</div>}
                  </div>

                  {/* Phone */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>{isAr ? 'رقم الهاتف' : 'PHONE NUMBER'}</label>
                    <div style={{ display: 'flex' }}>
                      <CountryPicker value={country} onChange={setCountry} />
                      <input
                        style={{ ...inputStyle, flex: 1, padding: '12px 14px', borderRadius: isAr ? '11px 0 0 11px' : '0 11px 11px 0', borderLeft: isAr ? `1px solid ${inputBdr}` : 'none', borderRight: isAr ? 'none' : undefined, borderColor: fieldErrors.phone ? 'rgba(239,68,68,.5)' : inputBdr }}
                        type="tel" value={form.phone}
                        onChange={e => set('phone', e.target.value.replace(/[^\d\s\-()]/g, ''))}
                        placeholder={`${country.min}–${country.max} ${isAr ? 'أرقام' : 'digits'}`}
                      />
                    </div>
                    {fieldErrors.phone && <div style={{ fontSize: '.72rem', color: errClr, marginTop: 5 }}>⚠ {fieldErrors.phone}</div>}
                  </div>

                  {/* Password */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={labelStyle}>{isAr ? 'كلمة المرور *' : 'PASSWORD *'}</label>
                    <div style={{ position: 'relative' }}>
                      <span style={iconL}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                      <input style={{ ...inputPrStyle, borderColor: fieldErrors.password ? 'rgba(239,68,68,.5)' : inputBdr }} type={showPassword ? 'text' : 'password'} value={form.password} onChange={e => set('password', e.target.value)} placeholder={isAr ? 'أنشئ كلمة مرور قوية' : 'Create a strong password'} />
                      <button type="button" style={eyeStyle} onClick={() => setShowPassword(v => !v)}>
                        {showPassword
                          ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                      </button>
                    </div>
                    {fieldErrors.password && <div style={{ fontSize: '.72rem', color: errClr, marginTop: 5 }}>⚠ {fieldErrors.password}</div>}
                    <PasswordChecklist password={form.password} />
                  </div>

                  {/* Confirm */}
                  <div style={{ marginBottom: 22 }}>
                    <label style={labelStyle}>{isAr ? 'تأكيد كلمة المرور *' : 'CONFIRM PASSWORD *'}</label>
                    <div style={{ position: 'relative' }}>
                      <span style={iconL}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg></span>
                      <input style={{ ...inputPrStyle, borderColor: fieldErrors.confirm ? 'rgba(239,68,68,.5)' : inputBdr }} type={showConfirm ? 'text' : 'password'} value={form.confirm} onChange={e => set('confirm', e.target.value)} placeholder={isAr ? 'أعد كتابة كلمة المرور' : 'Repeat your password'} />
                      <button type="button" style={eyeStyle} onClick={() => setShowConfirm(v => !v)}>
                        {showConfirm
                          ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                          : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        }
                      </button>
                    </div>
                    {fieldErrors.confirm && <div style={{ fontSize: '.72rem', color: errClr, marginTop: 5 }}>⚠ {fieldErrors.confirm}</div>}
                    {form.confirm && form.password === form.confirm && (
                      <div style={{ fontSize: '.72rem', color: '#4ade80', marginTop: 5, display: 'flex', alignItems: 'center', gap: 5 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" width="12" height="12"><polyline points="20 6 9 17 4 12"/></svg>
                        {isAr ? 'كلمتا المرور متطابقتان' : 'Passwords match'}
                      </div>
                    )}
                  </div>

                  <button type="submit" className="rg-btn" disabled={loading}>
                    {loading
                      ? <><span className="rg-spinner" /> {isAr ? 'جارٍ إنشاء الحساب…' : 'Creating Account…'}</>
                      : <>{isAr ? 'إنشاء حسابي' : 'Create My Account'} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="15" height="15"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>
                    }
                  </button>
                </form>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
                  <div style={{ flex: 1, height: 1, background: dividerLn }} />
                  <span style={{ fontSize: '.7rem', letterSpacing: isAr ? 0 : '.08em', color: dividerTx, whiteSpace: 'nowrap' }}>{isAr ? 'أو سجّل باستخدام' : 'OR SIGN UP WITH'}</span>
                  <div style={{ flex: 1, height: 1, background: dividerLn }} />
                </div>

                <a href="/api/auth/google" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', padding: '13px 14px', background: googleBg, border: `1px solid ${googleBdr}`, borderRadius: 11, color: googleClr, fontSize: '.9rem', fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer', textDecoration: 'none', transition: 'background .18s' }}>
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  {isAr ? 'تابع مع Google' : 'Continue with Google'}
                </a>

                <p style={{ textAlign: 'center', marginTop: 20, fontSize: '.84rem', color: loginClr }}>
                  {isAr ? 'هل لديك حساب بالفعل؟ ' : 'Already have an account? '}
                  <Link href="/login" style={{ color: '#c9932c', fontWeight: 600, textDecoration: 'none' }}>{isAr ? 'تسجيل الدخول' : 'Sign in'}</Link>
                  {' · '}
                  <Link href="/forgot-password" style={{ color: 'rgba(201,147,44,.7)', fontWeight: 600, textDecoration: 'none' }}>{isAr ? 'نسيت كلمة المرور؟' : 'Forgot password?'}</Link>
                </p>
              </>
            )}

            <p style={{ textAlign: 'center', marginTop: 28, fontSize: '.68rem', letterSpacing: isAr ? 0 : '.07em', color: footerClr }}>
              {isAr ? '© 2025 أكاديمية غريس · جميع الحقوق محفوظة' : '© 2025 GRACE ACADEMY · LONG LIVE LEARN'}
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
