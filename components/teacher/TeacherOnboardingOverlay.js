'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const LS_KEY = 'ga_teacher_onboard_slide'

const SLIDES = {
  en: [
    {
      img:   '/images/welcome-onboarding.svg',
      badge: 'WELCOME TO GRACE ACADEMY',
      title: "You're part of something great.",
      body:  "We're excited to have you on board as a teacher. Before you can start, there's one quick thing to set up. It only takes a few minutes.",
      cta:   "Let's Get Started →",
    },
    {
      img:   '/images/finish-your-profile.svg',
      step:  'STEP 1',
      title: 'Complete your profile.',
      body:  'Add your name, date of birth, education background, English level, teaching experience, and other details. A complete profile helps us set up your portal correctly.',
      cta:   'Go to My Profile →',
    },
  ],
  ar: [
    {
      img:   '/images/welcome-onboarding.svg',
      badge: 'مرحباً بك في غريس أكاديمي',
      title: 'أنت جزء من شيء رائع.',
      body:  'يسعدنا انضمامك إلينا كمعلّم. قبل أن تبدأ، هناك خطوة واحدة سريعة للإعداد. لن تستغرق سوى دقائق.',
      cta:   'لنبدأ ←',
    },
    {
      img:   '/images/finish-your-profile.svg',
      step:  'الخطوة ١',
      title: 'أكمل ملفك الشخصي.',
      body:  'أضف اسمك، تاريخ ميلادك، خلفيتك التعليمية، مستواك في الإنجليزية، خبرتك في التدريس وغيرها من التفاصيل. الملف الشخصي المكتمل يساعدنا على إعداد بوابتك بشكل صحيح.',
      cta:   'اذهب إلى ملفي الشخصي ←',
    },
  ],
}

export default function TeacherOnboardingOverlay({ isAr, isDark }) {
  const [slide, setSlide] = useState(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem(LS_KEY) : null
      if (saved === null) return 0
      const n = parseInt(saved, 10)
      return isNaN(n) || n < 0 || n > 1 ? 0 : n
    } catch { return 0 }
  })
  const router = useRouter()

  function goToSlide(n) {
    setSlide(n)
    try { localStorage.setItem(LS_KEY, String(n)) } catch {}
  }

  const lang   = isAr ? 'ar' : 'en'
  const slides = SLIDES[lang]
  const s      = slides[slide]
  const dir    = isAr ? 'rtl' : 'ltr'
  const ff     = isAr
    ? "var(--font-tajawal,'Tajawal',sans-serif)"
    : "var(--font-gotham,'Gotham',sans-serif)"

  const gold    = '#c9932c'
  const surface = isDark ? '#10222b' : '#ffffff'
  const bg      = isDark ? 'rgba(6,16,22,.92)' : 'rgba(15,23,42,.65)'
  const border  = isDark ? 'rgba(255,255,255,.09)' : '#e5e7eb'
  const text    = isDark ? '#f1f5f9' : '#111827'
  const muted   = isDark ? 'rgba(255,255,255,.5)' : '#6b7280'

  function handleCta() {
    if (slide === 0) {
      goToSlide(1)
    } else {
      // slide 1 — go complete profile
      router.push('/profile')
    }
  }

  const isFirst = slide === 0

  return (
    <>
      <style>{`
        @keyframes tobIn  { from { opacity:0 } to { opacity:1 } }
        @keyframes tobUp  { from { opacity:0; transform:translateY(20px) scale(.98) } to { opacity:1; transform:none } }
        @keyframes tobImg { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-6px) } }
      `}</style>

      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: bg,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        animation: 'tobIn .25s ease',
        fontFamily: ff,
        direction: dir,
      }}>
        <div key={slide} style={{
          background: surface,
          border: `1px solid ${border}`,
          borderRadius: 20,
          width: '100%',
          maxWidth: 440,
          overflow: 'hidden',
          boxShadow: isDark
            ? '0 24px 64px rgba(0,0,0,.8)'
            : '0 24px 64px rgba(0,0,0,.18)',
          animation: 'tobUp .3s cubic-bezier(.22,1,.36,1)',
        }}>

          {/* gold top bar */}
          <div style={{ height: 4, background: 'linear-gradient(90deg,#c9932c,#e8b84b,#c9932c)' }} />

          {/* progress dots */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 6, padding: '16px 0 0' }}>
            {slides.map((_, i) => (
              <div key={i} style={{
                width: i === slide ? 20 : 6,
                height: 6, borderRadius: 3,
                background: i === slide ? gold : (isDark ? 'rgba(255,255,255,.15)' : '#e5e7eb'),
                transition: 'all .25s',
              }} />
            ))}
          </div>

          {/* illustration */}
          <div style={{ padding: '20px 32px 4px', display: 'flex', justifyContent: 'center' }}>
            <img
              src={s.img} alt=""
              style={{
                width: isFirst ? 160 : 130,
                height: 'auto',
                animation: 'tobImg 3.5s ease-in-out infinite',
              }}
            />
          </div>

          {/* text */}
          <div style={{ padding: '16px 32px 24px' }}>

            {/* badge / step label */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '2px 10px', borderRadius: 100,
              background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.25)',
              fontSize: '.6rem', fontWeight: 800,
              letterSpacing: isAr ? 0 : '.1em', color: gold,
              marginBottom: 10,
            }}>
              <div style={{ width: 5, height: 5, borderRadius: '50%', background: gold }} />
              {isFirst ? s.badge : s.step}
            </div>

            {/* title */}
            <h2 style={{
              fontSize: 'clamp(1.1rem,2.5vw,1.35rem)',
              fontWeight: 900, color: text,
              lineHeight: 1.25, margin: '0 0 10px',
            }}>
              {s.title}
            </h2>

            {/* body */}
            <p style={{
              fontSize: '.84rem', color: muted,
              lineHeight: 1.65, margin: '0 0 22px',
            }}>
              {s.body}
            </p>

            {/* CTA */}
            <button
              onClick={handleCta}
              style={{
                width: '100%', padding: '13px 20px',
                background: 'linear-gradient(135deg,#c9932c,#e8b84b)',
                border: 'none', borderRadius: 12,
                fontSize: '.88rem', fontWeight: 800,
                color: '#fff',
                letterSpacing: isAr ? 0 : '.03em',
                cursor: 'pointer', fontFamily: 'inherit',
                boxShadow: '0 4px 16px rgba(201,147,44,.35)',
                transition: 'transform .14s, box-shadow .14s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 22px rgba(201,147,44,.45)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(201,147,44,.35)' }}
            >
              {s.cta}
            </button>
          </div>

          {/* gold bottom bar */}
          <div style={{ height: 3, background: 'linear-gradient(90deg,#c9932c,#e8b84b,#c9932c)' }} />
        </div>
      </div>
    </>
  )
}
