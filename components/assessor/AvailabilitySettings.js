'use client'

import { useState } from 'react'

const delay = ms => new Promise(r => setTimeout(r, ms))

/* ─── Google brand icons ──────────────────────────────────────────────── */
function GoogleG({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

function GCalIcon({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" style={{ flexShrink: 0 }}>
      <rect width="56" height="56" rx="11" fill="white" stroke="#e0e0e0" strokeWidth="1"/>
      <rect width="56" height="18" rx="11" fill="#1a73e8"/>
      <rect y="9" width="56" height="9" fill="#1a73e8"/>
      <circle cx="16" cy="7" r="4.5" fill="white"/><circle cx="16" cy="7" r="2.8" fill="#1557b0"/>
      <circle cx="40" cy="7" r="4.5" fill="white"/><circle cx="40" cy="7" r="2.8" fill="#1557b0"/>
      <text x="7"  y="26" fontSize="5.2" fill="rgba(255,255,255,.75)" fontFamily="Arial,sans-serif">S</text>
      <text x="14" y="26" fontSize="5.2" fill="rgba(255,255,255,.75)" fontFamily="Arial,sans-serif">M</text>
      <text x="22" y="26" fontSize="5.2" fill="rgba(255,255,255,.75)" fontFamily="Arial,sans-serif">T</text>
      <text x="30" y="26" fontSize="5.2" fill="rgba(255,255,255,.75)" fontFamily="Arial,sans-serif">W</text>
      <text x="38" y="26" fontSize="5.2" fill="rgba(255,255,255,.75)" fontFamily="Arial,sans-serif">T</text>
      <text x="46" y="26" fontSize="5.2" fill="rgba(255,255,255,.75)" fontFamily="Arial,sans-serif">F</text>
      <text x="28" y="48" textAnchor="middle" fontSize="21" fontWeight="900" fill="#1a73e8" fontFamily="Arial,sans-serif">31</text>
    </svg>
  )
}

function GMeetIcon({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" style={{ flexShrink: 0 }}>
      <rect width="56" height="56" rx="11" fill="#00897B"/>
      <rect x="8" y="16" width="25" height="24" rx="4.5" fill="white"/>
      <path d="M34 20.5 L48 14 L48 42 L34 35.5 Z" fill="white"/>
      <circle cx="20.5" cy="28" r="4" fill="#00897B"/>
    </svg>
  )
}

/* ─── Animated bounce arrow ───────────────────────────────────────────── */
function BounceArrow({ show }) {
  if (!show) return null
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '6px 0', animation: 'asArrowBounce 1.2s ease-in-out infinite' }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <circle cx="14" cy="14" r="13" fill="rgba(201,147,44,.12)" stroke="rgba(201,147,44,.3)" strokeWidth="1"/>
        <path d="M9 11 L14 17 L19 11" stroke="#c9932c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )
}

/* ─── Progress stepper ────────────────────────────────────────────────── */
function ProgressSteps({ googleOk, calOk, meetOk, isAr }) {
  const steps = [
    { en: 'Verify Account', ar: 'تحقق من الحساب', done: googleOk },
    { en: 'Google Calendar',  ar: 'تقويم Google',  done: calOk  },
    { en: 'Google Meet',      ar: 'Google Meet',    done: meetOk },
  ]
  const activeIdx = !googleOk ? 0 : !calOk ? 1 : !meetOk ? 2 : 3

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0, marginBottom: 36, padding: '0 8px' }}>
      {steps.map((s, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i < steps.length - 1 ? 1 : 'none' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: s.done ? '#10b981' : i === activeIdx ? '#c9932c' : 'var(--as-border)',
              border: `2px solid ${s.done ? '#10b981' : i === activeIdx ? '#c9932c' : 'var(--as-border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all .3s', position: 'relative',
              boxShadow: i === activeIdx ? '0 0 0 6px rgba(201,147,44,.15)' : 'none',
            }}>
              {s.done
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                : <span style={{ fontSize: '.78rem', fontWeight: 800, color: i === activeIdx ? 'white' : 'var(--as-xmuted)' }}>{i + 1}</span>
              }
              {i === activeIdx && !s.done && (
                <div style={{ position: 'absolute', inset: -4, borderRadius: '50%', border: '2px solid rgba(201,147,44,.3)', animation: 'asPulseRing 1.6s ease-out infinite' }} />
              )}
            </div>
            <span style={{ fontSize: '.7rem', fontWeight: 600, color: s.done ? '#10b981' : i === activeIdx ? '#c9932c' : 'var(--as-xmuted)', whiteSpace: 'nowrap', letterSpacing: isAr ? 0 : '.03em' }}>
              {isAr ? s.ar : s.en}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 2, background: steps[i].done ? '#10b981' : 'var(--as-border)', margin: '0 6px', marginBottom: 22, transition: 'background .4s' }} />
          )}
        </div>
      ))}
    </div>
  )
}

/* ─── Step 1 — Google Account Verification ────────────────────────────── */
function Step1({ googleOk, email, setEmail, emailErr, otpSent, otp, setOtp, otpErr, status, sendOtp, verifyOtp, isAr, isDark }) {
  const done = googleOk

  if (done) {
    return (
      <div style={{
        border: '1.5px solid #10b981', borderRadius: 16, padding: '16px 20px',
        background: isDark ? 'rgba(16,185,129,.06)' : 'rgba(16,185,129,.05)',
        display: 'flex', alignItems: 'center', gap: 14, animation: 'asFadeUp .3s ease',
      }}>
        <div style={{ width: 42, height: 42, borderRadius: 12, background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <GoogleG size={22} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{ fontSize: '.82rem', fontWeight: 700, color: '#10b981' }}>{isAr ? 'تم التحقق من حساب Google' : 'Google Account Verified'}</span>
          </div>
          <div style={{ fontSize: '.78rem', color: 'var(--as-muted)', marginTop: 2 }}>{email || googleOk}</div>
        </div>
        <div style={{ fontSize: '.68rem', color: '#10b981', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)', borderRadius: 100, padding: '3px 10px', fontWeight: 700 }}>
          {isAr ? 'متصل' : 'CONNECTED'}
        </div>
      </div>
    )
  }

  const inputStyle = {
    width: '100%', padding: '11px 14px', background: isDark ? 'rgba(255,255,255,.05)' : '#f9fafb',
    border: `1.5px solid ${isDark ? 'rgba(255,255,255,.1)' : '#e2e8f0'}`, borderRadius: 10,
    color: isDark ? '#f1f5f9' : '#111827', fontSize: '.88rem', outline: 'none',
    fontFamily: 'inherit', transition: 'border-color .15s',
    direction: 'ltr', textAlign: isAr ? 'right' : 'left',
  }
  const btnPrimary = {
    padding: '11px 22px', background: '#c9932c', color: 'white', border: 'none',
    borderRadius: 10, fontSize: '.88rem', fontWeight: 700, cursor: 'pointer',
    fontFamily: 'inherit', transition: 'all .15s', letterSpacing: isAr ? 0 : '.02em',
    display: 'flex', alignItems: 'center', gap: 8,
  }

  return (
    <div style={{
      border: `1.5px solid #c9932c`, borderRadius: 16, overflow: 'hidden',
      boxShadow: '0 0 0 4px rgba(201,147,44,.08)', animation: 'asFadeUp .3s ease',
    }}>
      {/* Card header */}
      <div style={{ background: isDark ? 'rgba(201,147,44,.08)' : 'rgba(201,147,44,.05)', padding: '18px 22px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.06)' : '#f3f0e8'}`, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 46, height: 46, borderRadius: 13, background: isDark ? 'rgba(255,255,255,.07)' : 'white', border: '1.5px solid rgba(201,147,44,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,.08)' }}>
          <GoogleG size={24} />
        </div>
        <div>
          <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.12em', color: '#c9932c', marginBottom: 3 }}>
            {isAr ? 'الخطوة ١' : 'STEP 1'}
          </div>
          <div style={{ fontSize: '.95rem', fontWeight: 800, color: 'var(--as-text)' }}>
            {isAr ? 'التحقق من حساب Google' : 'Verify Your Google Account'}
          </div>
          <div style={{ fontSize: '.78rem', color: 'var(--as-muted)', marginTop: 2 }}>
            {isAr ? 'أدخل بريدك الإلكتروني Gmail لبدء الإعداد' : 'Enter your Gmail to begin setup'}
          </div>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '22px' }}>
        {!otpSent ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--as-muted)', display: 'block', marginBottom: 7, letterSpacing: isAr ? 0 : '.04em' }}>
                {isAr ? 'عنوان Gmail الخاص بك' : 'YOUR GMAIL ADDRESS'}
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)' }}>
                  <GoogleG size={16} />
                </div>
                <input
                  type="email"
                  placeholder={isAr ? 'you@gmail.com' : 'you@gmail.com'}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendOtp()}
                  style={{ ...inputStyle, paddingLeft: 40 }}
                />
              </div>
              {emailErr && <div style={{ fontSize: '.75rem', color: '#ef4444', marginTop: 6 }}>{emailErr}</div>}
            </div>
            <div style={{ background: isDark ? 'rgba(255,255,255,.04)' : '#f8fafc', border: `1px solid ${isDark ? 'rgba(255,255,255,.06)' : '#e5e7eb'}`, borderRadius: 10, padding: '12px 14px' }}>
              <div style={{ fontSize: '.77rem', color: 'var(--as-muted)', lineHeight: 1.6 }}>
                {isAr
                  ? 'سنرسل رمز تحقق مكوناً من 6 أرقام إلى بريدك الإلكتروني للتأكد من ملكيتك لهذا الحساب.'
                  : 'We\'ll send a 6-digit verification code to confirm you own this Google account.'
                }
              </div>
            </div>
            <button
              style={{ ...btnPrimary, justifyContent: 'center' }}
              onClick={sendOtp}
              disabled={status === 'sending'}
            >
              {status === 'sending'
                ? <><Spinner />{isAr ? 'جارٍ الإرسال...' : 'Sending...'}</>
                : <>{isAr ? 'إرسال رمز التحقق' : 'Send Verification Code'}</>
              }
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'asFadeUp .25s ease' }}>
            <div style={{ background: isDark ? 'rgba(16,185,129,.08)' : 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <span style={{ fontSize: '.8rem', color: '#10b981', fontWeight: 600 }}>
                {isAr ? `تم إرسال الرمز إلى ${email}` : `Code sent to ${email}`}
              </span>
            </div>
            <div>
              <label style={{ fontSize: '.78rem', fontWeight: 600, color: 'var(--as-muted)', display: 'block', marginBottom: 7, letterSpacing: isAr ? 0 : '.04em' }}>
                {isAr ? 'رمز التحقق (8 أرقام)' : 'VERIFICATION CODE (8 DIGITS)'}
              </label>
              <input
                type="text"
                placeholder="00000000"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 8))}
                maxLength={8}
                style={{ ...inputStyle, letterSpacing: '.25em', fontSize: '1.1rem', textAlign: 'center' }}
              />
              {otpErr && <div style={{ fontSize: '.75rem', color: '#ef4444', marginTop: 6 }}>{otpErr}</div>}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button style={{ ...btnPrimary, flex: 1, justifyContent: 'center' }} onClick={verifyOtp} disabled={status === 'verifying' || status === 'done'}>
                {status === 'verifying'
                  ? <><Spinner />{isAr ? 'جارٍ التحقق...' : 'Verifying...'}</>
                  : status === 'done'
                  ? <>{isAr ? '✓ تم التحقق' : '✓ Verified'}</>
                  : <>{isAr ? 'تحقق من الرمز' : 'Verify Code'}</>
                }
              </button>
              <button
                style={{ padding: '11px 18px', background: 'none', border: `1px solid var(--as-border)`, borderRadius: 10, color: 'var(--as-muted)', fontSize: '.84rem', cursor: 'pointer', fontFamily: 'inherit' }}
                onClick={() => { setOtp(''); setOtpSent(false); setStatus('idle'); setOtpErr(''); }}
              >
                {isAr ? 'تغيير' : 'Change'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Step 2 — Google Calendar ────────────────────────────────────────── */
function Step2({ active, done, onDone, isAr, isDark }) {
  const [marking, setMarking] = useState(false)
  const EMAIL_SHARE = 'graceisforyou9@gmail.com'
  const [copied, setCopied] = useState(false)

  async function copyEmail() {
    await navigator.clipboard.writeText(EMAIL_SHARE).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  async function handleDone() {
    setMarking(true)
    await delay(800)
    onDone()
  }

  const steps = isAr ? [
    'افتح Google Calendar على calendar.google.com وسجّل الدخول بحسابك المُتحقق منه',
    'في الشريط الجانبي الأيسر، اضغط على أيقونة القائمة ⋮ بجانب اسم تقويمك تحت «تقاويمي»',
    'اختر «الإعدادات والمشاركة»',
    <>انتقل إلى قسم «المشاركة مع أشخاص أو مجموعات بعينها» واضغط <strong>«+ إضافة أشخاص»</strong></>,
    <>أدخل عنوان البريد: <strong style={{ color: '#1a73e8', direction: 'ltr', display: 'inline-block' }}>{EMAIL_SHARE}</strong> — ثم اضبط الإذن على <strong>«رؤية جميع تفاصيل الأحداث»</strong></>,
    'اضغط «إرسال» — سيحصل نظام الأكاديمية على صلاحية قراءة تقويمك',
  ] : [
    <>Open <strong>Google Calendar</strong> at <span style={{ color: '#1a73e8' }}>calendar.google.com</span> and sign in with the Gmail you verified</>,
    'In the left sidebar, hover over your calendar under "My calendars" and click the three-dot menu ⋮',
    'Select "Settings and sharing"',
    <>Scroll to <strong>"Share with specific people or groups"</strong> and click <strong>"+ Add people"</strong></>,
    <>Enter <strong style={{ color: '#1a73e8' }}>{EMAIL_SHARE}</strong> and set permission to <strong>"See all event details"</strong></>,
    'Click "Send" — Grace Academy will receive read access to your calendar',
  ]

  if (done) {
    return (
      <div style={{ border: '1.5px solid #10b981', borderRadius: 16, padding: '16px 20px', background: isDark ? 'rgba(16,185,129,.06)' : 'rgba(16,185,129,.05)', display: 'flex', alignItems: 'center', gap: 14, animation: 'asFadeUp .3s ease' }}>
        <GCalIcon size={42} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{ fontSize: '.82rem', fontWeight: 700, color: '#10b981' }}>{isAr ? 'تم ربط Google Calendar' : 'Google Calendar Linked'}</span>
          </div>
          <div style={{ fontSize: '.76rem', color: 'var(--as-muted)', marginTop: 2 }}>{EMAIL_SHARE}</div>
        </div>
        <div style={{ fontSize: '.68rem', color: '#10b981', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)', borderRadius: 100, padding: '3px 10px', fontWeight: 700 }}>
          {isAr ? 'متصل' : 'LINKED'}
        </div>
      </div>
    )
  }

  if (!active) {
    return (
      <div style={{ border: `1.5px solid var(--as-border)`, borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, opacity: 0.45 }}>
        <GCalIcon size={42} />
        <div>
          <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.1em', color: 'var(--as-xmuted)', marginBottom: 3 }}>{isAr ? 'الخطوة ٢' : 'STEP 2'}</div>
          <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--as-muted)' }}>{isAr ? 'ربط Google Calendar' : 'Link Google Calendar'}</div>
          <div style={{ fontSize: '.75rem', color: 'var(--as-xmuted)', marginTop: 2 }}>{isAr ? 'أكمل الخطوة ١ أولاً' : 'Complete step 1 first'}</div>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ marginLeft: 'auto', color: 'var(--as-xmuted)', flexShrink: 0 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
    )
  }

  return (
    <div style={{ border: '1.5px solid #1a73e8', borderRadius: 16, overflow: 'hidden', boxShadow: '0 0 0 4px rgba(26,115,232,.07)', animation: 'asFadeUp .3s ease' }}>
      <div style={{ background: isDark ? 'rgba(26,115,232,.08)' : 'rgba(26,115,232,.04)', padding: '18px 22px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.06)' : '#e8f0fe'}`, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 54, height: 54, borderRadius: 14, background: isDark ? 'rgba(255,255,255,.06)' : 'white', border: '1.5px solid rgba(26,115,232,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,.08)' }}>
          <GCalIcon size={42} />
        </div>
        <div>
          <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.12em', color: '#1a73e8', marginBottom: 3 }}>{isAr ? 'الخطوة ٢' : 'STEP 2'}</div>
          <div style={{ fontSize: '.95rem', fontWeight: 800, color: 'var(--as-text)' }}>{isAr ? 'ربط Google Calendar' : 'Link Google Calendar'}</div>
          <div style={{ fontSize: '.77rem', color: 'var(--as-muted)', marginTop: 2 }}>{isAr ? 'شارك تقويمك مع نظام الأكاديمية' : 'Share your calendar with Grace Academy'}</div>
        </div>
      </div>

      <div style={{ padding: 22 }}>
        <div style={{ marginBottom: 18 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 14, animation: `asFadeUp .3s ease ${i * .06}s both` }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#1a73e8', color: 'white', fontSize: '.72rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
              <div style={{ fontSize: '.84rem', color: 'var(--as-text)', lineHeight: 1.65, paddingTop: 3 }}>{step}</div>
            </div>
          ))}
        </div>

        {/* Copy email helper */}
        <div style={{ background: isDark ? 'rgba(26,115,232,.07)' : '#e8f0fe', border: '1px solid rgba(26,115,232,.2)', borderRadius: 10, padding: '11px 14px', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span style={{ fontSize: '.78rem', color: '#1a73e8', flex: 1, direction: 'ltr' }}>{EMAIL_SHARE}</span>
          <button onClick={copyEmail} style={{ padding: '4px 10px', background: copied ? '#10b981' : '#1a73e8', color: 'white', border: 'none', borderRadius: 7, fontSize: '.72rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}>
            {copied ? (isAr ? '✓ تم النسخ' : '✓ Copied') : (isAr ? 'نسخ' : 'Copy')}
          </button>
        </div>

        <button
          onClick={handleDone}
          disabled={marking}
          style={{ width: '100%', padding: '12px', background: marking ? '#10b981' : '#1a73e8', color: 'white', border: 'none', borderRadius: 10, fontSize: '.88rem', fontWeight: 700, cursor: marking ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'all .25s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          {marking ? <><Spinner color="white" />{isAr ? 'جارٍ الحفظ...' : 'Saving...'}</> : <>{isAr ? '✓ لقد أكملت هذه الخطوات' : '✓ I\'ve completed these steps'}</>}
        </button>
      </div>
    </div>
  )
}

/* ─── Step 3 — Google Meet ────────────────────────────────────────────── */
function Step3({ active, done, onDone, isAr, isDark }) {
  const [marking, setMarking] = useState(false)

  async function handleDone() {
    setMarking(true)
    await delay(800)
    onDone()
  }

  const steps = isAr ? [
    <>افتح <strong>Google Meet</strong> على <span style={{ color: '#00897B', direction: 'ltr', display: 'inline-block' }}>meet.google.com</span> وسجّل الدخول بحسابك المُتحقق منه</>,
    'اضغط «اجتماع جديد» ← «بدء اجتماع فوري» للتأكد من أن الكاميرا والميكروفون يعملان',
    'اسمح بالوصول إلى الكاميرا والميكروفون عند الطلب',
    'لجدولة جلسات التقييم، افتح Google Calendar وأنشئ حدثاً جديداً',
    'اضغط «إضافة تكييف فيديو من Google Meet» — سيُنشأ رابط Meet تلقائياً',
    'سيرى الطلاب المُعيّنون رابط الاجتماع عند جدولة جلسات التقييم',
  ] : [
    <>Open <strong>Google Meet</strong> at <span style={{ color: '#00897B' }}>meet.google.com</span> and sign in with your verified Gmail</>,
    'Click "New meeting" → "Start an instant meeting" to confirm your camera and microphone work',
    'Allow camera and microphone access when prompted by your browser',
    'For scheduled assessments, open Google Calendar and create a new event',
    'Click "Add Google Meet video conferencing" — a unique Meet link is auto-generated',
    'Assigned students will see the meeting link when assessment sessions are scheduled',
  ]

  if (done) {
    return (
      <div style={{ border: '1.5px solid #10b981', borderRadius: 16, padding: '16px 20px', background: isDark ? 'rgba(16,185,129,.06)' : 'rgba(16,185,129,.05)', display: 'flex', alignItems: 'center', gap: 14, animation: 'asFadeUp .3s ease' }}>
        <GMeetIcon size={42} />
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            <span style={{ fontSize: '.82rem', fontWeight: 700, color: '#10b981' }}>{isAr ? 'تم ربط Google Meet' : 'Google Meet Linked'}</span>
          </div>
          <div style={{ fontSize: '.76rem', color: 'var(--as-muted)', marginTop: 2 }}>{isAr ? 'جاهز لجلسات التقييم الافتراضية' : 'Ready for virtual assessment sessions'}</div>
        </div>
        <div style={{ fontSize: '.68rem', color: '#10b981', background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)', borderRadius: 100, padding: '3px 10px', fontWeight: 700 }}>
          {isAr ? 'متصل' : 'LINKED'}
        </div>
      </div>
    )
  }

  if (!active) {
    return (
      <div style={{ border: '1.5px solid var(--as-border)', borderRadius: 16, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, opacity: 0.45 }}>
        <GMeetIcon size={42} />
        <div>
          <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.1em', color: 'var(--as-xmuted)', marginBottom: 3 }}>{isAr ? 'الخطوة ٣' : 'STEP 3'}</div>
          <div style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--as-muted)' }}>{isAr ? 'ربط Google Meet' : 'Link Google Meet'}</div>
          <div style={{ fontSize: '.75rem', color: 'var(--as-xmuted)', marginTop: 2 }}>{isAr ? 'أكمل الخطوة ٢ أولاً' : 'Complete step 2 first'}</div>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" style={{ marginLeft: 'auto', color: 'var(--as-xmuted)', flexShrink: 0 }}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
    )
  }

  return (
    <div style={{ border: '1.5px solid #00897B', borderRadius: 16, overflow: 'hidden', boxShadow: '0 0 0 4px rgba(0,137,123,.07)', animation: 'asFadeUp .3s ease' }}>
      <div style={{ background: isDark ? 'rgba(0,137,123,.08)' : 'rgba(0,137,123,.04)', padding: '18px 22px', borderBottom: `1px solid ${isDark ? 'rgba(255,255,255,.06)' : '#e0f2f1'}`, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 54, height: 54, borderRadius: 14, background: isDark ? 'rgba(255,255,255,.06)' : 'white', border: '1.5px solid rgba(0,137,123,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 8px rgba(0,0,0,.08)' }}>
          <GMeetIcon size={42} />
        </div>
        <div>
          <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.12em', color: '#00897B', marginBottom: 3 }}>{isAr ? 'الخطوة ٣' : 'STEP 3'}</div>
          <div style={{ fontSize: '.95rem', fontWeight: 800, color: 'var(--as-text)' }}>{isAr ? 'ربط Google Meet' : 'Link Google Meet'}</div>
          <div style={{ fontSize: '.77rem', color: 'var(--as-muted)', marginTop: 2 }}>{isAr ? 'جهّز حسابك للجلسات الافتراضية' : 'Set up your account for virtual sessions'}</div>
        </div>
      </div>

      <div style={{ padding: 22 }}>
        <div style={{ marginBottom: 18 }}>
          {steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', gap: 14, marginBottom: 14, animation: `asFadeUp .3s ease ${i * .06}s both` }}>
              <div style={{ width: 26, height: 26, borderRadius: '50%', background: '#00897B', color: 'white', fontSize: '.72rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
              <div style={{ fontSize: '.84rem', color: 'var(--as-text)', lineHeight: 1.65, paddingTop: 3 }}>{step}</div>
            </div>
          ))}
        </div>

        <div style={{ background: isDark ? 'rgba(0,137,123,.07)' : '#e0f2f1', border: '1px solid rgba(0,137,123,.2)', borderRadius: 10, padding: '11px 14px', display: 'flex', gap: 9, marginBottom: 18 }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#00897B" strokeWidth="2" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <span style={{ fontSize: '.78rem', color: isDark ? '#4db6ac' : '#00695C', lineHeight: 1.55 }}>
            {isAr
              ? 'Google Meet مرتبط تلقائياً بحساب Google الخاص بك — لا حاجة إلى تطبيقات إضافية.'
              : 'Google Meet is automatically tied to your Google account — no additional apps needed.'
            }
          </span>
        </div>

        <button
          onClick={handleDone}
          disabled={marking}
          style={{ width: '100%', padding: '12px', background: marking ? '#10b981' : '#00897B', color: 'white', border: 'none', borderRadius: 10, fontSize: '.88rem', fontWeight: 700, cursor: marking ? 'default' : 'pointer', fontFamily: 'inherit', transition: 'all .25s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          {marking ? <><Spinner color="white" />{isAr ? 'جارٍ الحفظ...' : 'Saving...'}</> : <>{isAr ? '✓ لقد أكملت هذه الخطوات' : '✓ I\'ve completed these steps'}</>}
        </button>
      </div>
    </div>
  )
}

/* ─── Configured / all-done view ──────────────────────────────────────── */
function ConfiguredView({ cfg, onReset, isAr, isDark }) {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px' }}>
      {/* Success banner */}
      <div style={{ background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)', borderRadius: 18, padding: '28px 30px', marginBottom: 28, position: 'relative', overflow: 'hidden', animation: 'asFadeUp .4s ease' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,.08) 0%, transparent 65%)' }} />
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 52, height: 52, borderRadius: 15, background: 'rgba(255,255,255,.15)', border: '1.5px solid rgba(255,255,255,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.12em', color: 'rgba(255,255,255,.65)', marginBottom: 4 }}>
              {isAr ? 'اكتمل الإعداد' : 'SETUP COMPLETE'}
            </div>
            <h2 style={{ fontSize: 'clamp(1rem, 2vw, 1.35rem)', fontWeight: 900, color: 'white', lineHeight: 1.2, marginBottom: 4 }}>
              {isAr ? 'تم تهيئة جميع التكاملات بنجاح!' : 'All integrations configured successfully!'}
            </h2>
            <p style={{ fontSize: '.82rem', color: 'rgba(255,255,255,.6)' }}>
              {isAr ? 'أنت جاهز لإجراء جلسات التقييم الفعلية والافتراضية.' : 'You\'re ready to conduct in-person and virtual assessment sessions.'}
            </p>
          </div>
        </div>
      </div>

      {/* Integration cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
        {/* Google Account */}
        <div style={{ background: 'var(--as-surface)', border: '1.5px solid var(--as-border)', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, animation: 'asFadeUp .4s ease .05s both' }}>
          <div style={{ width: 48, height: 48, borderRadius: 13, background: isDark ? 'rgba(255,255,255,.06)' : '#f8f9ff', border: '1.5px solid rgba(66,133,244,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <GoogleG size={26} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--as-text)' }}>{isAr ? 'حساب Google' : 'Google Account'}</div>
            <div style={{ fontSize: '.76rem', color: 'var(--as-muted)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'ltr', textAlign: isAr ? 'right' : 'left' }}>{cfg.googleEmail}</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 3px rgba(16,185,129,.2)' }} />
            <span style={{ fontSize: '.74rem', fontWeight: 700, color: '#10b981' }}>{isAr ? 'متحقق منه' : 'Verified'}</span>
          </div>
        </div>

        {/* Google Calendar */}
        <div style={{ background: 'var(--as-surface)', border: '1.5px solid var(--as-border)', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, animation: 'asFadeUp .4s ease .1s both' }}>
          <div style={{ width: 48, height: 48, borderRadius: 13, background: isDark ? 'rgba(255,255,255,.06)' : '#f8f9ff', border: '1.5px solid rgba(26,115,232,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 3 }}>
            <GCalIcon size={42} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--as-text)' }}>Google Calendar</div>
            <div style={{ fontSize: '.76rem', color: 'var(--as-muted)', marginTop: 2 }}>
              {isAr ? 'مشارَك مع نظام جريس أكاديمي' : 'Shared with Grace Academy system'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 3px rgba(16,185,129,.2)' }} />
            <span style={{ fontSize: '.74rem', fontWeight: 700, color: '#10b981' }}>{isAr ? 'مرتبط' : 'Linked'}</span>
          </div>
        </div>

        {/* Google Meet */}
        <div style={{ background: 'var(--as-surface)', border: '1.5px solid var(--as-border)', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, animation: 'asFadeUp .4s ease .15s both' }}>
          <div style={{ width: 48, height: 48, borderRadius: 13, background: isDark ? 'rgba(255,255,255,.06)' : '#f8f9ff', border: '1.5px solid rgba(0,137,123,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, padding: 3 }}>
            <GMeetIcon size={42} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--as-text)' }}>Google Meet</div>
            <div style={{ fontSize: '.76rem', color: 'var(--as-muted)', marginTop: 2 }}>
              {isAr ? 'جاهز لجلسات التقييم الافتراضية' : 'Ready for virtual assessment sessions'}
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 0 3px rgba(16,185,129,.2)' }} />
            <span style={{ fontSize: '.74rem', fontWeight: 700, color: '#10b981' }}>{isAr ? 'مرتبط' : 'Linked'}</span>
          </div>
        </div>
      </div>

      {/* Reconfigure */}
      <div style={{ textAlign: 'center', marginBottom: 40 }}>
        <button
          onClick={onReset}
          style={{ background: 'none', border: `1px solid var(--as-border)`, borderRadius: 9, padding: '9px 18px', color: 'var(--as-muted)', fontSize: '.82rem', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', display: 'inline-flex', alignItems: 'center', gap: 7 }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>
          {isAr ? 'إعادة الإعداد / تغيير الحساب' : 'Reconfigure / Change Account'}
        </button>
      </div>

      {/* Bottom illustration */}
      <Illustration isDark={isDark} />
    </div>
  )
}

/* ─── Bottom illustration ─────────────────────────────────────────────── */
function Illustration({ isDark }) {
  return (
    <div style={{ textAlign: 'center', marginTop: 20, opacity: isDark ? 0.55 : 0.85, filter: isDark ? 'brightness(0.75) contrast(0.9)' : 'none', transition: 'opacity .3s, filter .3s' }}>
      <img
        src="/images/assessor-settings.svg"
        alt=""
        style={{ width: '100%', maxWidth: 480, height: 'auto' }}
      />
    </div>
  )
}

/* ─── Spinner ─────────────────────────────────────────────────────────── */
function Spinner({ color = 'white', size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" style={{ animation: 'asSpinnerRotate .8s linear infinite', flexShrink: 0 }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
    </svg>
  )
}

/* ─── Main exported component ─────────────────────────────────────────── */
export default function AvailabilitySettings({ user, isAr, isDark }) {
  const KEY = `ga-integrations-${user?.id || 'anon'}`

  const [cfg, setCfg] = useState(() => {
    try {
      const s = typeof window !== 'undefined' ? localStorage.getItem(KEY) : null
      return s ? JSON.parse(s) : { googleEmail: null, calDone: false, meetDone: false }
    } catch { return { googleEmail: null, calDone: false, meetDone: false } }
  })

  function save(patch) {
    const next = { ...cfg, ...patch }
    setCfg(next)
    localStorage.setItem(KEY, JSON.stringify(next))
  }

  const googleOk = !!cfg.googleEmail
  const calOk    = cfg.calDone
  const meetOk   = cfg.meetDone
  const allOk    = googleOk && calOk && meetOk

  /* — Step 1 OTP state — */
  const [email,   setEmail]   = useState(cfg.googleEmail || '')
  const [emailErr,setEmailErr]= useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp,     setOtp]     = useState('')
  const [otpErr,  setOtpErr]  = useState('')
  const [status,  setStatus]  = useState('idle') // idle|sending|sent|verifying|done

  async function sendOtp() {
    const v = email.trim()
    if (!v.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      setEmailErr(isAr ? 'أدخل بريداً إلكترونياً صحيحاً' : 'Please enter a valid email address')
      return
    }
    setEmailErr('')
    setStatus('sending')
    try {
      const res = await fetch('/api/assessor/send-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: v }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'locked') {
          const mins = Math.ceil(data.lockedSeconds / 60)
          setEmailErr(isAr ? `محاولات كثيرة. حاول بعد ${mins} دقيقة.` : `Too many attempts. Try again in ${mins} min.`)
        } else {
          setEmailErr(data.error || (isAr ? 'فشل إرسال الرمز' : 'Failed to send code'))
        }
        setStatus('idle')
        return
      }
      setStatus('sent')
      setOtpSent(true)
    } catch {
      setEmailErr(isAr ? 'خطأ في الشبكة. حاول مرة أخرى.' : 'Network error. Please try again.')
      setStatus('idle')
    }
  }

  async function verifyOtp() {
    if (otp.length < 6) {
      setOtpErr(isAr ? 'الرمز قصير جداً' : 'Code is too short')
      return
    }
    setOtpErr('')
    setStatus('verifying')
    try {
      const res = await fetch('/api/assessor/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp }),
      })
      const data = await res.json()
      if (!res.ok) {
        if (data.error === 'locked') {
          const mins = Math.ceil(data.lockedSeconds / 60)
          setOtpErr(isAr ? `محاولات كثيرة. حاول بعد ${mins} دقيقة.` : `Too many attempts. Try again in ${mins} min.`)
        } else if (data.error?.includes('expired')) {
          setOtpErr(isAr ? 'انتهت صلاحية الرمز. أرسل رمزاً جديداً.' : 'Code expired. Send a new code.')
        } else if (data.error?.includes('match') || data.error?.includes('does not')) {
          setOtpErr(isAr ? 'الرمز غير صحيح. تحقق وحاول مرة أخرى.' : 'Incorrect code. Check and try again.')
        } else {
          setOtpErr(data.error || (isAr ? 'فشل التحقق' : 'Verification failed'))
        }
        setStatus('sent')
        return
      }
      setStatus('done')
      await delay(500)
      save({ googleEmail: email.trim() })
    } catch {
      setOtpErr(isAr ? 'خطأ في الشبكة. حاول مرة أخرى.' : 'Network error. Please try again.')
      setStatus('sent')
    }
  }

  function handleReset() {
    save({ googleEmail: null, calDone: false, meetDone: false })
    setEmail('')
    setOtp('')
    setOtpSent(false)
    setStatus('idle')
    setEmailErr('')
    setOtpErr('')
  }

  if (allOk) {
    return (
      <>
        <style>{`
          @keyframes asFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
          @keyframes asSpinnerRotate{to{transform:rotate(360deg)}}
        `}</style>
        <ConfiguredView cfg={cfg} onReset={handleReset} isAr={isAr} isDark={isDark} />
      </>
    )
  }

  return (
    <>
      <style>{`
        @keyframes asFadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes asArrowBounce{0%,100%{transform:translateY(0)}50%{transform:translateY(7px)}}
        @keyframes asPulseRing{0%{opacity:.8;transform:scale(1)}100%{opacity:0;transform:scale(1.55)}}
        @keyframes asSpinnerRotate{to{transform:rotate(360deg)}}
        @keyframes asShine{0%{transform:translateX(-100%)}100%{transform:translateX(200%)}}
      `}</style>

      <div style={{ maxWidth: 680, margin: '0 auto', padding: '32px 20px 20px' }}>

        {/* Page header */}
        <div style={{ marginBottom: 30, animation: 'asFadeUp .3s ease' }}>
          <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.14em', color: '#c9932c', marginBottom: 6 }}>
            {isAr ? 'إعداد الحساب' : 'ACCOUNT SETUP'}
          </div>
          <h2 style={{ fontSize: 'clamp(1.1rem,2vw,1.5rem)', fontWeight: 900, color: 'var(--as-text)', marginBottom: 8, lineHeight: 1.2 }}>
            {isAr ? 'ربط حساب Google الخاص بك' : 'Connect Your Google Account'}
          </h2>
          <p style={{ fontSize: '.85rem', color: 'var(--as-muted)', lineHeight: 1.65, maxWidth: 520 }}>
            {isAr
              ? 'اتبع الخطوات الثلاث أدناه لربط حساب Google الخاص بك وتفعيل التقويم والاجتماعات الافتراضية لجلسات التقييم.'
              : 'Complete the three steps below to link your Google account and enable calendar sync and virtual meetings for assessment sessions.'
            }
          </p>
        </div>

        {/* Progress stepper */}
        <ProgressSteps googleOk={googleOk} calOk={calOk} meetOk={meetOk} isAr={isAr} />

        {/* Step 1 */}
        <Step1
          googleOk={googleOk}
          email={email} setEmail={setEmail} emailErr={emailErr}
          otpSent={otpSent} otp={otp} setOtp={setOtp} otpErr={otpErr}
          status={status} sendOtp={sendOtp} verifyOtp={verifyOtp}
          isAr={isAr} isDark={isDark}
        />

        {/* Arrow 1→2 */}
        <BounceArrow show={googleOk} />

        {/* Step 2 */}
        <Step2 active={googleOk && !calOk} done={calOk} onDone={() => save({ calDone: true })} isAr={isAr} isDark={isDark} />

        {/* Arrow 2→3 */}
        <BounceArrow show={calOk} />

        {/* Step 3 */}
        <Step3 active={calOk && !meetOk} done={meetOk} onDone={() => save({ meetDone: true })} isAr={isAr} isDark={isDark} />

        {/* Bottom illustration */}
        <div style={{ marginTop: 48 }}>
          <Illustration isDark={isDark} />
        </div>
      </div>
    </>
  )
}
