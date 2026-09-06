'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'

const GOLD = '#c9932c'

const LEVELS = [
  { value: 'A1', color: '#10b981', label: 'Beginner',            labelAr: 'مبتدئ' },
  { value: 'A2', color: '#06b6d4', label: 'Elementary',          labelAr: 'أساسي' },
  { value: 'B1', color: '#3b82f6', label: 'Intermediate',        labelAr: 'متوسط' },
  { value: 'B2', color: '#6366f1', label: 'Upper-Intermediate',  labelAr: 'فوق المتوسط' },
  { value: 'C1', color: '#8b5cf6', label: 'Advanced',            labelAr: 'متقدم' },
  { value: 'C2', color: '#c9932c', label: 'Mastery',             labelAr: 'إتقان' },
]

/* ─── Icon system ─────────────────────────────────────────────────── */
function Ic({ size = 16, color = 'currentColor', children }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" width={size} height={size} style={{ flexShrink: 0 }}>
      {children}
    </svg>
  )
}
function IcSearch({ size = 16, color = 'currentColor' })   { return <Ic size={size} color={color}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></Ic> }
function IcMic({ size = 16, color = 'currentColor' })      { return <Ic size={size} color={color}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></Ic> }
function IcClock({ size = 16, color = 'currentColor' })    { return <Ic size={size} color={color}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></Ic> }
function IcUsers({ size = 16, color = 'currentColor' })    { return <Ic size={size} color={color}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Ic> }
function IcGradCap({ size = 16, color = 'currentColor' })  { return <Ic size={size} color={color}><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></Ic> }
function IcFolder({ size = 16, color = 'currentColor' })   { return <Ic size={size} color={color}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></Ic> }
function IcTarget({ size = 16, color = 'currentColor' })   { return <Ic size={size} color={color}><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></Ic> }
function IcBolt({ size = 16, color = 'currentColor' })     { return <Ic size={size} color={color}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></Ic> }
function IcGrid({ size = 16, color = 'currentColor' })     { return <Ic size={size} color={color}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></Ic> }
function IcTag({ size = 16, color = 'currentColor' })      { return <Ic size={size} color={color}><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></Ic> }
function IcChevR({ size = 13, color = 'currentColor' })    { return <Ic size={size} color={color}><polyline points="9 18 15 12 9 6"/></Ic> }
function IcX({ size = 13, color = 'currentColor' })        { return <Ic size={size} color={color}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Ic> }

/* ─── Level chip ──────────────────────────────────────────────────── */
function LevelChip({ level }) {
  const info = LEVELS.find(l => l.value === level)
  if (!info) return null
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 9px', borderRadius: 100,
      fontWeight: 800, fontSize: '.62rem', letterSpacing: '.06em',
      background: `${info.color}18`, border: `1.5px solid ${info.color}55`, color: info.color,
    }}>
      {level}
    </span>
  )
}

/* ─── Stat chip ───────────────────────────────────────────────────── */
function Chip({ icon, label, color }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 9px', borderRadius: 100, fontSize: '.67rem', fontWeight: 600, background: `${color}10`, border: `1px solid ${color}28`, color }}>
      {icon}{label}
    </span>
  )
}

/* ─── Course card ─────────────────────────────────────────────────── */
function CourseCard({ course, isAr, isDark, onClick }) {
  const [hov, setHov] = useState(false)
  const [imgFail, setImgFail] = useState(false)

  const lv     = LEVELS.find(l => l.value === course.level)
  const accent = lv?.color || GOLD
  const surf   = isDark ? '#10222b' : '#fff'
  const border = isDark ? 'rgba(255,255,255,.08)' : '#e5e7eb'
  const text   = isDark ? '#f1f5f9' : '#111827'
  const muted  = isDark ? 'rgba(255,255,255,.42)' : '#6b7280'
  const bg     = isDark ? 'rgba(255,255,255,.04)' : '#f9fafb'

  const hasImg = !!(course.image && !imgFail)

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: surf,
        border: `1.5px solid ${hov ? accent : border}`,
        borderRadius: 18, overflow: 'hidden', cursor: 'pointer',
        display: 'flex', flexDirection: 'column',
        transition: 'all .22s cubic-bezier(.4,0,.2,1)',
        transform: hov ? 'translateY(-5px) scale(1.01)' : 'none',
        boxShadow: hov
          ? `0 16px 44px ${accent}28, 0 4px 14px rgba(0,0,0,.1)`
          : isDark ? '0 2px 8px rgba(0,0,0,.22)' : '0 2px 6px rgba(0,0,0,.05)',
      }}
    >
      {/* Hero */}
      <div style={{
        height: 152, position: 'relative', overflow: 'hidden', flexShrink: 0,
        background: hasImg
          ? bg
          : lv
            ? `linear-gradient(140deg, ${lv.color}32 0%, ${lv.color}0e 60%, ${isDark ? '#0a1b22' : '#f8fafc'} 100%)`
            : `linear-gradient(140deg, ${GOLD}28 0%, ${GOLD}09 100%)`,
      }}>
        {hasImg ? (
          <img src={course.image} alt="" onError={() => setImgFail(true)}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .4s', transform: hov ? 'scale(1.07)' : 'scale(1)' }} />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <span style={{ fontSize: '3.8rem', fontWeight: 900, color: accent, opacity: hov ? .65 : .3, transition: 'opacity .22s', letterSpacing: '-2px', lineHeight: 1 }}>
              {course.level || ''}
            </span>
          </div>
        )}
        {course.level && (
          <div style={{ position: 'absolute', top: 10, right: 10 }}><LevelChip level={course.level} /></div>
        )}
        {course.category && (
          <div style={{ position: 'absolute', top: 10, left: 10 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '3px 9px', borderRadius: 100, fontSize: '.58rem', fontWeight: 700,
              background: isDark ? 'rgba(0,0,0,.58)' : 'rgba(255,255,255,.92)',
              backdropFilter: 'blur(6px)',
              border: `1px solid ${isDark ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.07)'}`,
              color: isDark ? 'rgba(255,255,255,.7)' : '#374151',
            }}>
              <IcTag size={8} color={isDark ? 'rgba(255,255,255,.45)' : '#9ca3af'} />
              {isAr ? (course.category.nameAr || course.category.nameEn) : course.category.nameEn}
            </span>
          </div>
        )}
        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 48, background: `linear-gradient(to top, ${surf}e0, transparent)`, pointerEvents: 'none' }} />
        {/* Hover glow */}
        {hov && <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(to bottom, transparent 50%, ${accent}22)`, pointerEvents: 'none' }} />}
      </div>

      {/* Body */}
      <div style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontWeight: 800, fontSize: '.93rem', color: text, lineHeight: 1.3, marginBottom: course.nameAr ? 2 : 8 }}>
          {course.nameEn}
        </div>
        {course.nameAr && (
          <div style={{ fontSize: '.72rem', color: muted, direction: 'rtl', textAlign: 'right', fontWeight: 500, marginBottom: 8 }}>
            {course.nameAr}
          </div>
        )}
        <div style={{ height: 1, background: border, marginBottom: 9 }} />

        {/* Chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 9 }}>
          <Chip icon={<IcClock size={9} color="#3b82f6" />} label={`${course.durationSessions} ${isAr ? 'جلسة' : 'sess.'}`} color="#3b82f6" />
          {course.durationMonths ? <Chip icon={<IcTarget size={9} color="#8b5cf6" />} label={`${course.durationMonths} ${isAr ? 'شهر' : 'mo.'}`} color="#8b5cf6" /> : null}
          {course.needsSpeaking && <Chip icon={<IcMic size={9} color="#10b981" />} label={isAr ? 'محادثة' : 'Speaking'} color="#10b981" />}
          {course.needsLibrary  && <Chip icon={<IcFolder size={9} color={GOLD} />} label={isAr ? 'مكتبة' : 'Library'} color={GOLD} />}
        </div>

        {/* Roster */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '.68rem', color: muted }}>
            <IcGradCap size={11} color={muted} />{course.teacherCount ?? 0} {isAr ? 'معلم' : 'teachers'}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '.68rem', color: muted }}>
            <IcUsers size={11} color={muted} />{course.studentCount ?? 0} {isAr ? 'طالب' : 'students'}
          </span>
        </div>

        {/* CTA */}
        <button
          onClick={e => { e.stopPropagation(); onClick() }}
          style={{
            marginTop: 'auto', width: '100%', padding: '9px 0', borderRadius: 10,
            background: hov ? accent : 'transparent',
            border: `1.5px solid ${accent}`,
            color: hov ? '#fff' : accent,
            fontWeight: 700, fontSize: '.8rem', cursor: 'pointer', fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
            transition: 'all .18s',
          }}
        >
          {isAr ? 'استكشف الدورة' : 'Explore Quest'}
          <IcChevR color={hov ? '#fff' : accent} />
        </button>
      </div>
    </div>
  )
}

/* ─── Main export ─────────────────────────────────────────────────── */
export default function CourseCatalog({ basePath = '/portal/courses', isAr = false, isDark = false }) {
  const router = useRouter()
  const [courses, setCourses]     = useState([])
  const [loading, setLoading]     = useState(true)
  const [fLevel, setFLevel]       = useState('')
  const [fCat, setFCat]           = useState('')
  const [fQ, setFQ]               = useState('')
  const [fSpeak, setFSpeak]       = useState(false)
  const [fLib, setFLib]           = useState(false)

  useEffect(() => {
    fetch('/api/courses')
      .then(r => r.json())
      .then(d => { setCourses(d.courses || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const categories = useMemo(() => {
    const seen = new Set()
    return courses.flatMap(c => c.category ? [c.category] : []).filter(c => !seen.has(c.id) && seen.add(c.id))
  }, [courses])

  const filtered = useMemo(() => courses.filter(c => {
    if (fLevel && c.level !== fLevel) return false
    if (fCat   && c.categoryId !== fCat) return false
    if (fSpeak && !c.needsSpeaking) return false
    if (fLib   && !c.needsLibrary) return false
    if (fQ.trim()) {
      const q = fQ.toLowerCase()
      if (!c.nameEn?.toLowerCase().includes(q) && !(c.nameAr || '').includes(q) && !c.descEn?.toLowerCase().includes(q)) return false
    }
    return true
  }), [courses, fLevel, fCat, fQ, fSpeak, fLib])

  const nF = [fLevel, fCat, fSpeak, fLib, fQ.trim()].filter(Boolean).length
  function clear() { setFLevel(''); setFCat(''); setFQ(''); setFSpeak(false); setFLib(false) }

  const surf   = isDark ? '#10222b' : '#fff'
  const border = isDark ? 'rgba(255,255,255,.09)' : '#e5e7eb'
  const text   = isDark ? '#f1f5f9' : '#111827'
  const muted  = isDark ? 'rgba(255,255,255,.42)' : '#6b7280'
  const bg     = isDark ? 'rgba(255,255,255,.04)' : '#f9fafb'

  return (
    <div style={{ padding: '0 0 56px' }}>
      <style>{`
        @keyframes ccPulse{0%,100%{opacity:1}50%{opacity:.45}}
        @keyframes ccUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:none}}
      `}</style>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div style={{
        borderRadius: 20, marginBottom: 22, padding: '28px 30px',
        position: 'relative', overflow: 'hidden',
        background: isDark
          ? 'linear-gradient(135deg, #0a1b22 0%, #10222b 55%, rgba(201,147,44,.07) 100%)'
          : 'linear-gradient(135deg, #fdfaf6 0%, #fff9ee 100%)',
        border: `1.5px solid ${isDark ? 'rgba(201,147,44,.18)' : 'rgba(201,147,44,.22)'}`,
        display: 'flex', alignItems: 'center', gap: 24, minHeight: 168,
      }}>
        {/* Rings */}
        {[300, 240, 180].map((s, i) => (
          <div key={i} style={{ position: 'absolute', top: '50%', right: isAr ? 'auto' : 168, left: isAr ? 168 : 'auto', transform: 'translateY(-50%)', width: s, height: s, borderRadius: '50%', border: `1px solid rgba(201,147,44,${.08 - i * .02})`, pointerEvents: 'none' }} />
        ))}

        <div style={{ flex: 1, zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
            <div style={{ width: 26, height: 26, borderRadius: 7, background: `${GOLD}18`, border: `1px solid ${GOLD}35`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <IcBolt size={13} color={GOLD} />
            </div>
            <span style={{ fontSize: '.6rem', fontWeight: 800, letterSpacing: '.14em', color: GOLD, textTransform: 'uppercase' }}>
              {isAr ? 'رحلة التعلم' : 'Learning Quest Board'}
            </span>
          </div>
          <h1 style={{ fontSize: 'clamp(1.25rem,3vw,1.6rem)', fontWeight: 900, color: text, margin: '0 0 7px', lineHeight: 1.2 }}>
            {isAr ? 'اكتشف مساراتك التعليمية' : 'Discover Your Next Quest'}
          </h1>
          <p style={{ margin: '0 0 16px', fontSize: '.86rem', color: muted, lineHeight: 1.6, maxWidth: 380 }}>
            {loading
              ? (isAr ? 'جارٍ تحميل الدورات…' : 'Loading courses…')
              : isAr ? `${courses.length} دورة متاحة لترقية مهاراتك` : `${courses.length} course${courses.length !== 1 ? 's' : ''} ready for you`}
          </p>
          {/* Level filter pills in hero */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {LEVELS.map(l => (
              <button key={l.value}
                onClick={() => setFLevel(fLevel === l.value ? '' : l.value)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '3px 10px', borderRadius: 100, fontSize: '.6rem', fontWeight: 700,
                  cursor: 'pointer', fontFamily: 'inherit', letterSpacing: '.04em',
                  background: fLevel === l.value ? `${l.color}28` : `${l.color}10`,
                  border: `1px solid ${fLevel === l.value ? l.color : `${l.color}32`}`,
                  color: l.color, transition: 'all .15s',
                  transform: fLevel === l.value ? 'scale(1.1)' : 'scale(1)',
                  boxShadow: fLevel === l.value ? `0 2px 8px ${l.color}35` : 'none',
                }}>
                {l.value} <span style={{ opacity: .7, fontSize: '.55rem' }}>· {isAr ? l.labelAr : l.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Illustration */}
        <div style={{ flexShrink: 0, zIndex: 1 }}>
          <img src="/images/human-teacher.svg" alt="" style={{ width: 128, height: 128, objectFit: 'contain', opacity: .88 }} />
        </div>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────── */}
      <div style={{ background: surf, border: `1px solid ${border}`, borderRadius: 14, padding: '15px 18px', marginBottom: 16 }}>
        {/* Search row */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <div style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <IcSearch size={14} color={muted} />
            </div>
            <input value={fQ} onChange={e => setFQ(e.target.value)}
              placeholder={isAr ? 'ابحث عن دورة…' : 'Search courses…'}
              style={{ width: '100%', padding: '9px 13px 9px 34px', borderRadius: 9, border: `1px solid ${border}`, background: bg, color: text, fontSize: '.86rem', fontFamily: 'inherit', outline: 'none', transition: 'border-color .15s' }}
              onFocus={e => e.target.style.borderColor = GOLD}
              onBlur={e => e.target.style.borderColor = border}
            />
          </div>
          {nF > 0 && (
            <button onClick={clear}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '7px 14px', borderRadius: 9, background: 'rgba(239,68,68,.07)', border: '1px solid rgba(239,68,68,.22)', color: '#ef4444', fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
              <IcX color="#ef4444" /> {isAr ? `مسح (${nF})` : `Clear (${nF})`}
            </button>
          )}
        </div>
        {/* Feature toggles row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {categories.length > 0 && (
            <select value={fCat} onChange={e => setFCat(e.target.value)}
              style={{ padding: '7px 12px', borderRadius: 9, border: `1px solid ${fCat ? GOLD : border}`, background: fCat ? `${GOLD}0c` : bg, color: fCat ? GOLD : text, fontSize: '.8rem', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }}>
              <option value="">{isAr ? 'جميع التصنيفات' : 'All categories'}</option>
              {categories.map(c => <option key={c.id} value={c.id}>{isAr ? (c.nameAr || c.nameEn) : c.nameEn}</option>)}
            </select>
          )}
          <button onClick={() => setFSpeak(v => !v)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, border: `1.5px solid ${fSpeak ? '#10b981' : border}`, background: fSpeak ? 'rgba(16,185,129,.1)' : 'transparent', color: fSpeak ? '#10b981' : muted, fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>
            <IcMic size={13} color={fSpeak ? '#10b981' : muted} />
            {isAr ? 'محادثة' : 'Speaking'}
          </button>
          <button onClick={() => setFLib(v => !v)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '7px 14px', borderRadius: 9, border: `1.5px solid ${fLib ? GOLD : border}`, background: fLib ? `${GOLD}10` : 'transparent', color: fLib ? GOLD : muted, fontSize: '.78rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s' }}>
            <IcFolder size={13} color={fLib ? GOLD : muted} />
            {isAr ? 'مكتبة' : 'Library'}
          </button>
        </div>
      </div>

      {/* ── Summary bar ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '.82rem', color: muted }}>
          <IcGrid size={13} color={muted} />
          {isAr
            ? `${filtered.length} دورة${nF ? ' (مفلترة)' : ''}`
            : `${filtered.length} course${filtered.length !== 1 ? 's' : ''}${nF ? ' filtered' : ''}`}
        </span>
        <div style={{ display: 'flex', gap: 14 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '.75rem', color: muted }}>
            <IcMic size={11} color="#10b981" /><b style={{ color: '#10b981' }}>{courses.filter(c => c.needsSpeaking).length}</b> {isAr ? 'محادثة' : 'speaking'}
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '.75rem', color: muted }}>
            <IcFolder size={11} color={GOLD} /><b style={{ color: GOLD }}>{courses.filter(c => c.needsLibrary).length}</b> {isAr ? 'مكتبة' : 'library'}
          </span>
        </div>
      </div>

      {/* ── Skeleton ─────────────────────────────────────────────────── */}
      {loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(265px,1fr))', gap: 18 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ borderRadius: 18, overflow: 'hidden', background: surf, border: `1px solid ${border}`, animation: `ccPulse 1.4s ease-in-out ${i * .12}s infinite` }}>
              <div style={{ height: 152, background: bg }} />
              <div style={{ padding: '14px 16px' }}>
                <div style={{ height: 13, borderRadius: 7, background: bg, marginBottom: 8, width: '68%' }} />
                <div style={{ height: 10, borderRadius: 6, background: bg, width: '42%' }} />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Empty ────────────────────────────────────────────────────── */}
      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px' }}>
          <img src="/images/empty-page.svg" alt="" style={{ width: 128, height: 128, marginBottom: 18, opacity: .7 }} />
          <div style={{ fontWeight: 700, fontSize: '1rem', color: text, marginBottom: 6 }}>{isAr ? 'لا توجد دورات مطابقة' : 'No courses match'}</div>
          <div style={{ fontSize: '.85rem', color: muted, marginBottom: 18 }}>{isAr ? 'جرّب تغيير الفلاتر أو البحث بكلمة مختلفة' : 'Try adjusting filters or searching differently'}</div>
          {nF > 0 && (
            <button onClick={clear} style={{ padding: '9px 22px', borderRadius: 10, background: GOLD, border: 'none', color: '#fff', fontWeight: 700, fontSize: '.85rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              {isAr ? 'مسح الفلاتر' : 'Clear filters'}
            </button>
          )}
        </div>
      )}

      {/* ── Grid ─────────────────────────────────────────────────────── */}
      {!loading && filtered.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(265px,1fr))', gap: 18 }}>
          {filtered.map((c, i) => (
            <div key={c.id} style={{ animation: 'ccUp .35s ease both', animationDelay: `${Math.min(i * .05, .42)}s` }}>
              <CourseCard course={c} isAr={isAr} isDark={isDark} onClick={() => router.push(`${basePath}/${c.id}`)} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
