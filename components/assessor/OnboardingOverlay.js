'use client'

import { useState } from 'react'
import WeeklySchedule from './WeeklySchedule'

/* ─── copy per locale ─────────────────────────────────────────────────── */
const COPY = {
  en: {
    slide1: {
      badge:  'WELCOME TO GRACE ACADEMY',
      title:  "You're part of something great.",
      points: [
        'Guide students to discover their true level and unlock their potential.',
        'Your expertise shapes the very first step of every learning journey.',
        'Flexible sessions, real impact — built entirely around your schedule.',
      ],
      cta: 'Next — Set Up My Schedule',
    },
    slide2: {
      badge: 'STEP 1 · REQUIRED',
      title: 'Set up your schedule first.',
      sub:   "Students can't book you until you've marked your available days and time slots. Take a moment to set them below — you can always update them later.",
      done:  'I\'m All Set, Let Me In →',
      err:   'Please save your schedule (at least 4 days with 4 or more slots each) before continuing.',
      checking: 'Verifying…',
    },
  },
  ar: {
    slide1: {
      badge:  'مرحباً بك في غريس أكاديمي',
      title:  'أنت جزء من شيء رائع.',
      points: [
        'أرشد الطلاب لاكتشاف مستواهم الحقيقي وإطلاق طاقاتهم.',
        'خبرتك تُشكّل الخطوة الأولى في كل رحلة تعليمية.',
        'جلسات مرنة وأثر حقيقي — بنيت حول جدولك الخاص تماماً.',
      ],
      cta: 'التالي — إعداد جدولي',
    },
    slide2: {
      badge: 'الخطوة الأولى · مطلوبة',
      title: 'ابدأ بإعداد جدولك.',
      sub:   'لن يتمكن الطلاب من حجزك حتى تحدد أيام وأوقات توفرك. خصص لحظة لإعدادها أدناه — يمكنك تعديلها في أي وقت لاحقاً.',
      done:  '← أنا جاهز، دعني أدخل',
      err:   'يرجى حفظ جدولك (٤ أيام على الأقل بـ ٤ خانات أو أكثر لكل يوم) قبل المتابعة.',
      checking: 'جارٍ التحقق…',
    },
  },
}

/* ─── tiny check icon ─────────────────────────────────────────────────── */
function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="#c9932c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

/* ─── main component ──────────────────────────────────────────────────── */
export default function OnboardingOverlay({ user, isAr, isDark, onComplete }) {
  const [slide,    setSlide]    = useState(1)
  const [checking, setChecking] = useState(false)
  const [error,    setError]    = useState('')

  const lang = isAr ? 'ar' : 'en'
  const c    = COPY[lang]
  const dir  = isAr ? 'rtl' : 'ltr'
  const ff   = isAr
    ? "var(--font-tajawal,'Tajawal',sans-serif)"
    : "var(--font-gotham,'Gotham',sans-serif)"

  /* colours */
  const gold    = '#c9932c'
  const surface = isDark ? '#10222b' : '#ffffff'
  const bg      = isDark ? 'rgba(13,27,36,.96)' : 'rgba(15,23,42,.72)'
  const border  = isDark ? 'rgba(255,255,255,.09)' : '#e5e7eb'
  const text    = isDark ? '#f1f5f9' : '#111827'
  const muted   = isDark ? 'rgba(255,255,255,.5)' : '#6b7280'
  const xmuted  = isDark ? 'rgba(255,255,255,.25)' : '#9ca3af'

  async function handleDone() {
    setChecking(true)
    setError('')
    try {
      const res    = await fetch('/api/assessor/schedule')
      const data   = await res.json()
      const dayMap = data?.schedule?.schedule
      const hasSlots = dayMap && Object.values(dayMap).some(arr => Array.isArray(arr) && arr.length > 0)
      if (hasSlots) {
        onComplete()
      } else {
        setError(c.slide2.err)
      }
    } catch {
      setError(c.slide2.err)
    } finally {
      setChecking(false)
    }
  }

  return (
    <>
      <style>{`
        @keyframes obFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes obSlideUp { from { opacity:0; transform:translateY(28px) } to { opacity:1; transform:none } }
        @keyframes obPulse { 0%,100% { transform:scale(1) } 50% { transform:scale(1.015) } }
      `}</style>

      {/* ── full-screen blocker ── */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: bg,
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: slide === 1 ? 'center' : 'flex-start',
        justifyContent: 'center',
        padding: slide === 1 ? '24px' : '24px 24px 0',
        overflowY: 'auto',
        animation: 'obFadeIn .3s ease',
        fontFamily: ff,
        direction: dir,
      }}>

        {/* ════════════════ SLIDE 1 — WELCOME ════════════════ */}
        {slide === 1 && (
          <div style={{
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: 24,
            padding: 'clamp(28px, 5vw, 52px)',
            maxWidth: 560,
            width: '100%',
            boxShadow: isDark
              ? '0 32px 80px rgba(0,0,0,.7)'
              : '0 32px 80px rgba(0,0,0,.18)',
            animation: 'obSlideUp .4s cubic-bezier(.22,1,.36,1)',
            position: 'relative',
            overflow: 'hidden',
          }}>
            {/* gold accent bar top */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: 4,
              background: 'linear-gradient(90deg, #c9932c 0%, #e8b84b 50%, #c9932c 100%)',
              borderRadius: '24px 24px 0 0',
            }} />

            {/* illustration */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 28 }}>
              <img
                src="/images/welcome-onboarding.svg"
                alt=""
                style={{ width: 'min(240px, 56vw)', height: 'auto', animation: 'obPulse 4s ease-in-out infinite' }}
              />
            </div>

            {/* badge */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '3px 12px', borderRadius: 100,
              background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.28)',
              fontSize: '.65rem', fontWeight: 800,
              letterSpacing: isAr ? 0 : '.12em', color: gold,
              marginBottom: 14,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: gold, flexShrink: 0 }} />
              {c.slide1.badge}
            </div>

            {/* title */}
            <h2 style={{
              fontSize: 'clamp(1.35rem, 3vw, 1.8rem)',
              fontWeight: 900, color: text, lineHeight: 1.2, marginBottom: 20,
            }}>
              {c.slide1.title}
            </h2>

            {/* bullet points */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {c.slide1.points.map((pt, i) => (
                <div key={i} style={{
                  display: 'flex', gap: 12, alignItems: 'flex-start',
                  padding: '12px 16px',
                  background: isDark ? 'rgba(201,147,44,.05)' : 'rgba(201,147,44,.04)',
                  border: '1px solid rgba(201,147,44,.15)',
                  borderRadius: 12,
                }}>
                  <div style={{ marginTop: 1, flexShrink: 0 }}><CheckIcon /></div>
                  <span style={{ fontSize: '.88rem', color: muted, lineHeight: 1.55 }}>{pt}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => setSlide(2)}
              style={{
                width: '100%', padding: '15px 24px',
                background: 'linear-gradient(135deg, #c9932c 0%, #e8b84b 100%)',
                border: 'none', borderRadius: 14, cursor: 'pointer',
                fontSize: '.92rem', fontWeight: 800, color: '#fff',
                letterSpacing: isAr ? 0 : '.04em',
                fontFamily: 'inherit',
                boxShadow: '0 6px 20px rgba(201,147,44,.35)',
                transition: 'transform .15s, box-shadow .15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 28px rgba(201,147,44,.45)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 6px 20px rgba(201,147,44,.35)' }}
            >
              {c.slide1.cta}
            </button>
          </div>
        )}

        {/* ════════════════ SLIDE 2 — SCHEDULE SETUP ════════════════ */}
        {slide === 2 && (
          <div style={{
            background: surface,
            border: `1px solid ${border}`,
            borderRadius: 24,
            maxWidth: 900,
            width: '100%',
            marginBottom: 24,
            boxShadow: isDark
              ? '0 32px 80px rgba(0,0,0,.7)'
              : '0 32px 80px rgba(0,0,0,.18)',
            animation: 'obSlideUp .4s cubic-bezier(.22,1,.36,1)',
            overflow: 'hidden',
          }}>
            {/* gold bar */}
            <div style={{
              height: 4,
              background: 'linear-gradient(90deg, #c9932c 0%, #e8b84b 50%, #c9932c 100%)',
            }} />

            {/* header */}
            <div style={{
              padding: 'clamp(20px, 4vw, 36px) clamp(20px, 4vw, 36px) 0',
              display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap',
            }}>
              <img
                src="/images/assessor-schedule.svg"
                alt=""
                style={{ width: 'min(120px, 22vw)', height: 'auto', flexShrink: 0 }}
              />
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '3px 12px', borderRadius: 100,
                  background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.28)',
                  fontSize: '.65rem', fontWeight: 800,
                  letterSpacing: isAr ? 0 : '.12em', color: gold,
                  marginBottom: 10,
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: gold, flexShrink: 0 }} />
                  {c.slide2.badge}
                </div>
                <h2 style={{
                  fontSize: 'clamp(1.2rem, 2.5vw, 1.6rem)',
                  fontWeight: 900, color: text, lineHeight: 1.2, marginBottom: 10,
                }}>
                  {c.slide2.title}
                </h2>
                <p style={{ fontSize: '.86rem', color: muted, lineHeight: 1.6, maxWidth: 480 }}>
                  {c.slide2.sub}
                </p>
              </div>
            </div>

            {/* schedule component */}
            <div style={{ padding: '0 clamp(20px, 4vw, 36px)' }}>
              <WeeklySchedule user={user} isAr={isAr} isDark={isDark} />
            </div>

            {/* sticky footer CTA */}
            <div style={{
              padding: 'clamp(16px, 3vw, 24px) clamp(20px, 4vw, 36px)',
              borderTop: `1px solid ${border}`,
              background: isDark ? 'rgba(10,27,34,.8)' : 'rgba(248,250,252,.9)',
              backdropFilter: 'blur(8px)',
              display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'stretch',
            }}>
              {error && (
                <div style={{
                  padding: '11px 16px', borderRadius: 10,
                  background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)',
                  color: '#ef4444', fontSize: '.83rem', textAlign: 'center',
                }}>
                  {error}
                </div>
              )}
              <button
                onClick={handleDone}
                disabled={checking}
                style={{
                  padding: '15px 24px',
                  background: checking
                    ? (isDark ? 'rgba(255,255,255,.06)' : '#f3f4f6')
                    : 'linear-gradient(135deg, #c9932c 0%, #e8b84b 100%)',
                  border: 'none', borderRadius: 14,
                  cursor: checking ? 'default' : 'pointer',
                  fontSize: '.92rem', fontWeight: 800,
                  color: checking ? xmuted : '#fff',
                  letterSpacing: isAr ? 0 : '.04em',
                  fontFamily: 'inherit',
                  boxShadow: checking ? 'none' : '0 6px 20px rgba(201,147,44,.35)',
                  transition: 'all .15s',
                }}
              >
                {checking ? c.slide2.checking : c.slide2.done}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
