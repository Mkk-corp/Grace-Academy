'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'

const GOLD   = '#c9932c'
const BLUE   = '#3b82f6'
const GREEN  = '#10b981'
const PURPLE = '#8b5cf6'
const CYAN   = '#06b6d4'
const INDIGO = '#6366f1'

const LEVELS = [
  { value: 'A1', color: '#10b981', label: 'Beginner',           labelAr: 'مبتدئ',         desc: 'Starting from scratch',          descAr: 'تبدأ من الصفر' },
  { value: 'A2', color: '#06b6d4', label: 'Elementary',         labelAr: 'أساسي',          desc: 'Building foundations',           descAr: 'بناء الأساسيات' },
  { value: 'B1', color: '#3b82f6', label: 'Intermediate',       labelAr: 'متوسط',          desc: 'Gaining confidence',             descAr: 'اكتساب الثقة' },
  { value: 'B2', color: '#6366f1', label: 'Upper-Intermediate', labelAr: 'فوق المتوسط',    desc: 'Handling complex topics',        descAr: 'التعامل مع موضوعات معقدة' },
  { value: 'C1', color: '#8b5cf6', label: 'Advanced',           labelAr: 'متقدم',          desc: 'Near-native fluency',            descAr: 'طلاقة شبه أصيلة' },
  { value: 'C2', color: '#c9932c', label: 'Mastery',            labelAr: 'إتقان',          desc: 'Complete command of English',    descAr: 'إتقان كامل للغة' },
]

const LIBRARY_MAP = {
  videos: { en: 'Videos',      ar: 'مقاطع فيديو' },
  links:  { en: 'Links',       ar: 'روابط' },
  pdf:    { en: 'PDF Files',   ar: 'ملفات PDF' },
  word:   { en: 'Word Files',  ar: 'ملفات Word' },
  audio:  { en: 'Audio & Podcasts', ar: 'صوت وبودكاست' },
  others: { en: 'Others',      ar: 'أخرى' },
}

/* ─── Icon system ─────────────────────────────────────────────────── */
function Ic({ size = 18, color = 'currentColor', children }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" width={size} height={size} style={{ flexShrink: 0 }}>
      {children}
    </svg>
  )
}
function IcArrowL({ size = 18, color = 'currentColor' })  { return <Ic size={size} color={color}><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></Ic> }
function IcStar({ size = 18, color = 'currentColor' })    { return <Ic size={size} color={color}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></Ic> }
function IcClock({ size = 18, color = 'currentColor' })   { return <Ic size={size} color={color}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Ic> }
function IcCalendar({ size = 18, color = 'currentColor' }){ return <Ic size={size} color={color}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></Ic> }
function IcTarget({ size = 18, color = 'currentColor' })  { return <Ic size={size} color={color}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></Ic> }
function IcMic({ size = 18, color = 'currentColor' })     { return <Ic size={size} color={color}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></Ic> }
function IcUsers({ size = 18, color = 'currentColor' })   { return <Ic size={size} color={color}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Ic> }
function IcGradCap({ size = 18, color = 'currentColor' }) { return <Ic size={size} color={color}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></Ic> }
function IcFolder({ size = 18, color = 'currentColor' })  { return <Ic size={size} color={color}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></Ic> }
function IcBook({ size = 18, color = 'currentColor' })    { return <Ic size={size} color={color}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></Ic> }
function IcTag({ size = 18, color = 'currentColor' })     { return <Ic size={size} color={color}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></Ic> }
function IcBolt({ size = 18, color = 'currentColor' })    { return <Ic size={size} color={color}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Ic> }
function IcTrend({ size = 18, color = 'currentColor' })   { return <Ic size={size} color={color}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></Ic> }
function IcVideo({ size = 18, color = 'currentColor' })   { return <Ic size={size} color={color}><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></Ic> }
function IcLink({ size = 18, color = 'currentColor' })    { return <Ic size={size} color={color}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></Ic> }
function IcFile({ size = 18, color = 'currentColor' })    { return <Ic size={size} color={color}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></Ic> }
function IcHeadphones({ size = 18, color = 'currentColor' }) { return <Ic size={size} color={color}><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></Ic> }
function IcSpin({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'cdvSpin .7s linear infinite' }}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
    </svg>
  )
}

function libIcon(type, color) {
  const props = { size: 14, color }
  switch (type) {
    case 'videos': return <IcVideo {...props} />
    case 'links':  return <IcLink {...props} />
    case 'audio':  return <IcHeadphones {...props} />
    default:       return <IcFile {...props} />
  }
}

/* ─── Section card wrapper ────────────────────────────────────────── */
function Section({ title, icon, color = GOLD, surf, border, isDark, children }) {
  return (
    <div style={{ background: surf, border: `1px solid ${border}`, borderRadius: 16, overflow: 'hidden', marginBottom: 18 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '13px 20px', borderBottom: `1px solid ${border}`, background: isDark ? `${color}0d` : `${color}07` }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <span style={{ fontWeight: 700, fontSize: '.86rem', color }}>{title}</span>
      </div>
      <div style={{ padding: '18px 20px' }}>{children}</div>
    </div>
  )
}

/* ─── Bilingual text block ────────────────────────────────────────── */
function BiText({ en, ar, isDark, border }) {
  const text = isDark ? '#f1f5f9' : '#111827'
  const muted = isDark ? 'rgba(255,255,255,.42)' : '#6b7280'
  return (
    <>
      {en && (
        <div style={{ marginBottom: ar ? 16 : 0 }}>
          <span style={{ display: 'inline-block', fontSize: '.55rem', fontWeight: 800, padding: '1px 7px', borderRadius: 4, background: 'rgba(59,130,246,.12)', color: BLUE, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 8 }}>EN</span>
          <p style={{ margin: 0, fontSize: '.9rem', color: text, lineHeight: 1.75 }}>{en}</p>
        </div>
      )}
      {ar && (
        <div style={{ paddingTop: en ? 16 : 0, borderTop: en ? `1px dashed ${border}` : 'none' }}>
          <span style={{ display: 'inline-block', fontSize: '.55rem', fontWeight: 800, padding: '1px 7px', borderRadius: 4, background: 'rgba(201,147,44,.12)', color: GOLD, letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 8 }}>AR</span>
          <p style={{ margin: 0, fontSize: '.9rem', color: text, lineHeight: 1.75, direction: 'rtl', textAlign: 'right' }}>{ar}</p>
        </div>
      )}
      {!en && !ar && <span style={{ color: muted, fontSize: '.85rem' }}>—</span>}
    </>
  )
}

/* ─── Stat row for sidebar ────────────────────────────────────────── */
function StatRow({ icon, label, value, color, border }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${border}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
        <div style={{ width: 26, height: 26, borderRadius: 7, background: `${color}14`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <span style={{ fontSize: '.75rem', fontWeight: 600, color: '#6b7280' }}>{label}</span>
      </div>
      <span style={{ fontWeight: 700, fontSize: '.85rem', color }}>{value}</span>
    </div>
  )
}

/* ─── CEFR progress bar ───────────────────────────────────────────── */
function CefrBar({ level }) {
  const idx = LEVELS.findIndex(l => l.value === level)
  if (idx === -1) return null
  const pct = ((idx + 1) / LEVELS.length) * 100
  const lv = LEVELS[idx]
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
        {LEVELS.map((l, i) => (
          <div key={l.value} style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: i <= idx ? lv.color : 'rgba(255,255,255,.15)', margin: '0 auto 4px', boxShadow: i === idx ? `0 0 8px ${lv.color}90` : 'none', transition: 'all .3s' }} />
            <span style={{ fontSize: '.52rem', fontWeight: i === idx ? 800 : 400, color: i <= idx ? lv.color : 'rgba(255,255,255,.3)' }}>{l.value}</span>
          </div>
        ))}
      </div>
      <div style={{ height: 6, borderRadius: 100, background: 'rgba(255,255,255,.1)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, borderRadius: 100, background: `linear-gradient(90deg, ${lv.color}99, ${lv.color})`, transition: 'width .8s cubic-bezier(.4,0,.2,1)', boxShadow: `0 0 10px ${lv.color}60` }} />
      </div>
    </div>
  )
}

/* ─── Main component ──────────────────────────────────────────────── */
export default function CourseDetailView({ backHref = '/' }) {
  const router    = useRouter()
  const params    = useParams()
  const courseId  = params?.id
  const { lang }  = useLang()
  const { theme } = useTheme()
  const isAr   = lang === 'ar'
  const isDark = theme === 'dark'

  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [imgFail, setImgFail] = useState(false)

  useEffect(() => {
    if (!courseId) return
    fetch(`/api/admin/courses/${courseId}`)
      .then(r => r.json())
      .then(d => { setCourse(d.course || null); setLoading(false) })
      .catch(() => setLoading(false))
  }, [courseId])

  const lv   = course ? LEVELS.find(l => l.value === course.level) : null
  const surf = isDark ? '#10222b' : '#fff'
  const page = isDark ? '#0a1b22' : '#f1f5f9'
  const border = isDark ? 'rgba(255,255,255,.09)' : '#e5e7eb'
  const text = isDark ? '#f1f5f9' : '#111827'
  const muted = isDark ? 'rgba(255,255,255,.42)' : '#6b7280'
  const accent = lv?.color || GOLD

  const ff = isAr ? "var(--font-tajawal,'Tajawal',sans-serif)" : "var(--font-gotham,'Gotham',sans-serif)"

  return (
    <>
      <style>{`
        @keyframes cdvSpin{to{transform:rotate(360deg)}}
        @keyframes cdvFadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
        @keyframes cdvPulse{0%,100%{opacity:1}50%{opacity:.45}}
        .cdv-root *{box-sizing:border-box;margin:0;padding:0}
      `}</style>

      <div className="cdv-root" style={{ minHeight: '100vh', background: page, color: text, fontFamily: ff, direction: isAr ? 'rtl' : 'ltr' }}
        data-theme={isDark ? 'dark' : 'light'}>

        {/* ── Top nav ────────────────────────────────────────────────── */}
        <div style={{ background: surf, borderBottom: `1px solid ${border}`, padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 14, position: 'sticky', top: 0, zIndex: 40, backdropFilter: 'blur(8px)' }}>
          <button
            onClick={() => router.back()}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, background: 'transparent', border: `1px solid ${border}`, color: muted, fontSize: '.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = GOLD; e.currentTarget.style.color = GOLD }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = muted }}
          >
            <IcArrowL size={14} />
            {isAr ? 'العودة للكتالوج' : 'Back to Catalog'}
          </button>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: '.75rem', color: muted }}>{isAr ? 'كتالوج الدورات' : 'Course Catalog'}</span>
            <span style={{ color: muted, fontSize: '.7rem' }}>›</span>
            <span style={{ fontSize: '.75rem', fontWeight: 600, color: text }}>
              {loading ? '…' : (course?.nameEn || (isAr ? 'تفاصيل الدورة' : 'Course Detail'))}
            </span>
          </div>
        </div>

        {/* ── Loading state ──────────────────────────────────────────── */}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 0', gap: 10, color: muted }}>
            <IcSpin size={20} />{isAr ? 'جارٍ التحميل…' : 'Loading…'}
          </div>
        )}

        {/* ── Not found ─────────────────────────────────────────────── */}
        {!loading && !course && (
          <div style={{ textAlign: 'center', padding: '80px 24px' }}>
            <img src="/images/empty-page.svg" alt="" style={{ width: 120, height: 120, marginBottom: 18, opacity: .7 }} />
            <div style={{ fontWeight: 700, fontSize: '1rem', color: text, marginBottom: 8 }}>{isAr ? 'الدورة غير موجودة' : 'Course not found'}</div>
            <button onClick={() => router.back()} style={{ padding: '9px 22px', borderRadius: 10, background: GOLD, border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              {isAr ? 'العودة' : 'Go back'}
            </button>
          </div>
        )}

        {/* ── Course content ─────────────────────────────────────────── */}
        {!loading && course && (
          <div style={{ animation: 'cdvFadeUp .4s ease both' }}>

            {/* Hero banner */}
            <div style={{
              position: 'relative', overflow: 'hidden',
              height: 'clamp(200px,35vw,320px)',
              background: course.image && !imgFail
                ? '#000'
                : lv
                  ? `linear-gradient(135deg, ${lv.color}40 0%, ${lv.color}15 50%, ${isDark ? '#0a1b22' : '#e5e7eb'} 100%)`
                  : `linear-gradient(135deg, ${GOLD}35 0%, ${GOLD}10 100%)`,
            }}>
              {course.image && !imgFail && (
                <img src={course.image} alt="" onError={() => setImgFail(true)}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
              )}
              {/* Overlay gradient */}
              <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to top, ${isDark ? '#0a1b22' : '#fff'}f0 0%, transparent 60%)` }} />
              {!course.image || imgFail ? (
                /* Decorative level text when no image */
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  <span style={{ fontSize: 'clamp(6rem,15vw,11rem)', fontWeight: 900, color: accent, opacity: .12, letterSpacing: '-8px', lineHeight: 1, userSelect: 'none' }}>
                    {course.level || '?'}
                  </span>
                  <img src="/images/welcome-onboarding.svg" alt="" style={{ position: 'absolute', right: '5%', bottom: 0, height: '90%', opacity: .18, objectFit: 'contain' }} />
                </div>
              ) : null}
              {/* Hero content */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px 28px', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                  {lv && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      padding: '5px 14px', borderRadius: 100, fontWeight: 800, fontSize: '.78rem', letterSpacing: '.06em',
                      background: `${lv.color}25`, border: `1.5px solid ${lv.color}60`, color: lv.color,
                      backdropFilter: 'blur(4px)',
                    }}>
                      <IcTarget size={12} color={lv.color} />
                      {lv.value} — {isAr ? lv.labelAr : lv.label}
                    </span>
                  )}
                  {course.category && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '4px 12px', borderRadius: 100, fontSize: '.72rem', fontWeight: 600,
                      background: 'rgba(0,0,0,.45)', backdropFilter: 'blur(6px)',
                      border: '1px solid rgba(255,255,255,.15)', color: 'rgba(255,255,255,.85)',
                    }}>
                      <IcTag size={10} color="rgba(255,255,255,.6)" />
                      {isAr ? (course.category.nameAr || course.category.nameEn) : course.category.nameEn}
                    </span>
                  )}
                </div>
                <h1 style={{ fontSize: 'clamp(1.35rem,3.5vw,2.1rem)', fontWeight: 900, color: '#fff', lineHeight: 1.2, textShadow: '0 2px 10px rgba(0,0,0,.4)', marginBottom: course.nameAr ? 5 : 0 }}>
                  {course.nameEn}
                </h1>
                {course.nameAr && (
                  <div style={{ fontSize: 'clamp(.9rem,2vw,1.15rem)', color: 'rgba(255,255,255,.65)', direction: 'rtl', textAlign: 'right', fontWeight: 500 }}>
                    {course.nameAr}
                  </div>
                )}
              </div>
            </div>

            {/* Body */}
            <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(260px,300px)', gap: 22, alignItems: 'start' }}>

                {/* ── Left column ─────────────────────────────────────── */}
                <div>
                  {/* Description */}
                  <Section title={isAr ? 'عن هذه الدورة' : 'About This Quest'} icon={<IcBook size={14} color={BLUE} />} color={BLUE} surf={surf} border={border} isDark={isDark}>
                    <BiText en={course.descEn} ar={course.descAr} isDark={isDark} border={border} />
                  </Section>

                  {/* Marketing */}
                  {(course.marketingEn || course.marketingAr) && (
                    <Section title={isAr ? 'لماذا هذه الدورة؟' : 'Why Join This Quest?'} icon={<IcBolt size={14} color={GOLD} />} color={GOLD} surf={surf} border={border} isDark={isDark}>
                      <BiText en={course.marketingEn} ar={course.marketingAr} isDark={isDark} border={border} />
                    </Section>
                  )}

                  {/* Speaking */}
                  {course.needsSpeaking && (
                    <Section title={isAr ? 'جلسات المحادثة' : 'Speaking Sessions'} icon={<IcMic size={14} color={GREEN} />} color={GREEN} surf={surf} border={border} isDark={isDark}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{ width: 52, height: 52, borderRadius: 14, background: 'rgba(16,185,129,.12)', border: '1.5px solid rgba(16,185,129,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <IcMic size={22} color={GREEN} />
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '1.3rem', color: GREEN, lineHeight: 1 }}>{course.speakingSessions}</div>
                          <div style={{ fontSize: '.8rem', color: muted, marginTop: 3 }}>{isAr ? 'جلسة محادثة مخصصة' : 'dedicated speaking sessions'}</div>
                        </div>
                      </div>
                    </Section>
                  )}

                  {/* Library */}
                  {course.needsLibrary && course.libraryTypes?.length > 0 && (
                    <Section title={isAr ? 'المكتبة والمواد' : 'Library & Materials'} icon={<IcFolder size={14} color={GOLD} />} color={GOLD} surf={surf} border={border} isDark={isDark}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: 10 }}>
                        {course.libraryTypes.map(t => {
                          const info = LIBRARY_MAP[t]
                          return (
                            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 13px', borderRadius: 10, background: isDark ? 'rgba(201,147,44,.06)' : 'rgba(201,147,44,.05)', border: `1px solid ${GOLD}28` }}>
                              {libIcon(t, GOLD)}
                              <span style={{ fontSize: '.8rem', fontWeight: 600, color: text }}>{info ? (isAr ? info.ar : info.en) : t}</span>
                            </div>
                          )
                        })}
                      </div>
                    </Section>
                  )}

                  {/* Guild stats */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                    {[
                      { icon: <IcGradCap size={22} color={BLUE} />, val: course.teacherCount ?? 0, labelEn: 'Teachers', labelAr: 'معلمون', color: BLUE },
                      { icon: <IcUsers size={22} color={PURPLE} />,  val: course.studentCount ?? 0, labelEn: 'Students', labelAr: 'طلاب',    color: PURPLE },
                    ].map(({ icon, val, labelEn, labelAr, color }) => (
                      <div key={labelEn} style={{ background: surf, border: `1px solid ${border}`, borderRadius: 16, padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center' }}>
                        <div style={{ width: 50, height: 50, borderRadius: 14, background: `${color}12`, border: `1.5px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{icon}</div>
                        <div style={{ fontSize: '2rem', fontWeight: 900, color, lineHeight: 1 }}>{val}</div>
                        <div style={{ fontSize: '.72rem', color: muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.08em' }}>{isAr ? labelAr : labelEn}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Right sidebar ─────────────────────────────────── */}
                <div style={{ position: 'sticky', top: 72 }}>

                  {/* Quest card */}
                  <div style={{
                    borderRadius: 20, overflow: 'hidden', marginBottom: 16,
                    background: isDark ? 'linear-gradient(145deg, #0a1b22, #10222b)' : `linear-gradient(145deg, ${accent}08, ${surf})`,
                    border: `1.5px solid ${accent}30`,
                    boxShadow: isDark ? `0 4px 24px ${accent}15` : `0 4px 18px ${accent}12`,
                  }}>
                    {/* Card header */}
                    <div style={{ padding: '16px 20px', background: isDark ? `${accent}12` : `${accent}0e`, borderBottom: `1px solid ${accent}22` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <IcStar size={14} color={accent} />
                        <span style={{ fontSize: '.65rem', fontWeight: 800, letterSpacing: '.12em', color: accent, textTransform: 'uppercase' }}>
                          {isAr ? 'تفاصيل الدورة' : 'Quest Details'}
                        </span>
                      </div>
                      {/* CEFR bar */}
                      {lv && <CefrBar level={course.level} />}
                    </div>

                    {/* Stats rows */}
                    <div style={{ padding: '4px 20px 16px' }}>
                      {[
                        lv ? { icon: <IcTarget size={13} color={accent} />, label: isAr ? 'المستوى' : 'Level', value: `${lv.value} — ${isAr ? lv.labelAr : lv.label}`, color: accent } : null,
                        { icon: <IcClock size={13} color={BLUE} />, label: isAr ? 'الجلسات' : 'Sessions', value: `${course.durationSessions} ${isAr ? 'جلسة' : 'sessions'}`, color: BLUE },
                        course.durationMonths ? { icon: <IcCalendar size={13} color={PURPLE} />, label: isAr ? 'المدة' : 'Duration', value: `${course.durationMonths} ${isAr ? 'شهر' : 'months'}`, color: PURPLE } : null,
                        course.category ? { icon: <IcTag size={13} color={CYAN} />, label: isAr ? 'التصنيف' : 'Category', value: isAr ? (course.category.nameAr || course.category.nameEn) : course.category.nameEn, color: CYAN } : null,
                        course.needsSpeaking ? { icon: <IcMic size={13} color={GREEN} />, label: isAr ? 'محادثة' : 'Speaking', value: `${course.speakingSessions} ${isAr ? 'جلسة' : 'sessions'}`, color: GREEN } : null,
                        course.needsLibrary  ? { icon: <IcFolder size={13} color={GOLD} />, label: isAr ? 'مكتبة' : 'Library', value: isAr ? 'متضمّنة' : 'Included', color: GOLD } : null,
                      ].filter(Boolean).map((row, i, arr) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < arr.length - 1 ? `1px solid ${border}` : 'none' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                            <div style={{ width: 24, height: 24, borderRadius: 6, background: `${row.color}14`, border: `1px solid ${row.color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              {row.icon}
                            </div>
                            <span style={{ fontSize: '.72rem', color: muted, fontWeight: 500 }}>{row.label}</span>
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '.8rem', color: row.color }}>{row.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Illustration */}
                  <div style={{ background: isDark ? 'rgba(255,255,255,.03)' : 'rgba(201,147,44,.04)', border: `1px solid ${isDark ? 'rgba(255,255,255,.07)' : 'rgba(201,147,44,.18)'}`, borderRadius: 16, padding: '16px', textAlign: 'center' }}>
                    <img src="/images/human-teacher.svg" alt="" style={{ width: '70%', maxWidth: 160, opacity: .82, marginBottom: 12 }} />
                    <div style={{ fontSize: '.75rem', color: muted, lineHeight: 1.5 }}>
                      {isAr ? lv?.descAr || 'اكتشف مسارك التعليمي' : lv?.desc || 'Explore your learning path'}
                    </div>
                    {lv && (
                      <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 5, padding: '5px 14px', borderRadius: 100, background: `${lv.color}18`, border: `1px solid ${lv.color}40`, color: lv.color, fontSize: '.72rem', fontWeight: 700 }}>
                        <IcTrend size={11} color={lv.color} />
                        {isAr ? lv.labelAr : lv.label}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
