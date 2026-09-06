'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'
import Select from '@/components/ui/Select'

const GOLD   = '#c9932c'
const BLUE   = '#3b82f6'
const GREEN  = '#10b981'
const PURPLE = '#8b5cf6'
const RED    = '#ef4444'

const LEVELS = [
  { value: 'A1', color: '#10b981' },
  { value: 'A2', color: '#06b6d4' },
  { value: 'B1', color: '#3b82f6' },
  { value: 'B2', color: '#6366f1' },
  { value: 'C1', color: '#8b5cf6' },
  { value: 'C2', color: '#c9932c' },
]

const LIBRARY_OPTIONS = [
  { value: 'videos', labelEn: 'Videos',            labelAr: 'مقاطع الفيديو' },
  { value: 'links',  labelEn: 'Links',             labelAr: 'روابط' },
  { value: 'pdf',    labelEn: 'PDF Files',         labelAr: 'ملفات PDF' },
  { value: 'word',   labelEn: 'Word Files',        labelAr: 'ملفات Word' },
  { value: 'audio',  labelEn: 'Audios & Podcasts', labelAr: 'ملفات صوتية وبودكاست' },
  { value: 'others', labelEn: 'Others',            labelAr: 'أخرى' },
]

const BLANK = {
  nameEn: '', nameAr: '', categoryId: '', level: '',
  descEn: '', descAr: '',
  marketingEn: '', marketingAr: '',
  durationMonths: '', durationSessions: '',
  needsSpeaking: false, speakingSessions: '',
  needsLibrary: false, libraryTypes: [],
  image: '',
  teacherCount: 0, studentCount: 0, teachers: [],
}

/* ─── Sub-components (outside to avoid remount) ─────────────────── */

function Field({ label, lang, required, optional, muted, isAr, children }) {
  const langColor = lang === 'ar' ? GOLD : BLUE
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
        {lang && (
          <span style={{ fontSize: '.58rem', fontWeight: 800, padding: '1px 7px', borderRadius: 4, background: `${langColor}18`, color: langColor, letterSpacing: '.06em', textTransform: 'uppercase', flexShrink: 0 }}>
            {lang === 'ar' ? 'AR' : 'EN'}
          </span>
        )}
        <span style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: muted }}>{label}</span>
        {required && <span style={{ color: RED, fontSize: '.85rem', lineHeight: 1 }}>*</span>}
        {optional && (
          <span style={{ fontSize: '.6rem', fontWeight: 700, padding: '1px 7px', borderRadius: 100, background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.25)', color: PURPLE }}>
            {isAr ? 'اختياري' : 'Optional'}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function SectionCard({ title, icon, color, surf, border, isDark, children }) {
  const c = color || GOLD
  return (
    <div style={{ background: surf, border: `1px solid ${border}`, borderRadius: 16, overflow: 'hidden', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 22px', borderBottom: `1px solid ${border}`, background: isDark ? `${c}0d` : `${c}07` }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, flexShrink: 0, background: `${c}16`, border: `1px solid ${c}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c }}>
          {icon}
        </div>
        <span style={{ fontWeight: 700, fontSize: '.88rem', color: c }}>{title}</span>
      </div>
      <div style={{ padding: '20px 22px' }}>{children}</div>
    </div>
  )
}

function Toggle({ on, onChange, label, labelAr, color, isDark, isAr, border, bg, text }) {
  const c = color || GREEN
  return (
    <div onClick={() => onChange(!on)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '13px 16px', borderRadius: 10, border: `1px solid ${on ? c + '40' : border}`, background: on ? `${c}09` : bg, cursor: 'pointer', transition: 'all .2s' }}>
      <span style={{ fontSize: '.87rem', fontWeight: 600, color: on ? c : text }}>{isAr ? labelAr : label}</span>
      <div style={{ width: 40, height: 22, borderRadius: 100, padding: 2, background: on ? c : (isDark ? 'rgba(255,255,255,.12)' : '#d1d5db'), transition: 'background .2s', position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,.25)', position: 'absolute', top: 2, left: on ? 20 : 2, transition: 'left .2s' }} />
      </div>
    </div>
  )
}

function LevelBadge({ level, size = 'md' }) {
  const info = LEVELS.find(l => l.value === level)
  if (!info) return null
  const pad = size === 'lg' ? '6px 18px' : '3px 12px'
  const fs  = size === 'lg' ? '.9rem' : '.72rem'
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', padding: pad, borderRadius: 100, fontWeight: 800, fontSize: fs, letterSpacing: '.06em', background: `${info.color}18`, border: `1.5px solid ${info.color}50`, color: info.color }}>
      {level}
    </span>
  )
}

function InfoRow({ label, value, muted, text }) {
  if (!value && value !== 0) return null
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: muted, minWidth: 110, paddingTop: 2 }}>{label}</span>
      <span style={{ fontSize: '.88rem', color: text, flex: 1, lineHeight: 1.6 }}>{value}</span>
    </div>
  )
}

/* ─── Main page ─────────────────────────────────────────────────── */

export default function CourseDetailPage() {
  const { lang }  = useLang()
  const { theme } = useTheme()
  const router    = useRouter()
  const params    = useParams()
  const id        = params?.id
  const isNew     = id === 'new'
  const isAr      = lang === 'ar'
  const isDark    = theme === 'dark'

  const [form,       setForm]       = useState(BLANK)
  const [saved,      setSaved]      = useState(BLANK)   // last-saved snapshot for cancel
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(!isNew)
  const [editing,    setEditing]    = useState(isNew)   // new course starts in edit mode
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')
  const [flash,      setFlash]      = useState(false)
  const [uploading,  setUploading]  = useState(false)
  const [uploadErr,  setUploadErr]  = useState('')

  useEffect(() => {
    fetch('/api/admin/categories').then(r => r.json()).then(d => setCategories(d.categories || [])).catch(() => {})
  }, [])

  useEffect(() => {
    if (isNew) return
    fetch(`/api/admin/courses/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.course) {
          const c = d.course
          const snapshot = {
            nameEn: c.nameEn || '', nameAr: c.nameAr || '',
            categoryId: c.categoryId || '', level: c.level || '',
            descEn: c.descEn || '', descAr: c.descAr || '',
            marketingEn: c.marketingEn || '', marketingAr: c.marketingAr || '',
            durationMonths: c.durationMonths ?? '', durationSessions: c.durationSessions ?? '',
            needsSpeaking: !!c.needsSpeaking, speakingSessions: c.speakingSessions ?? '',
            needsLibrary: !!c.needsLibrary, libraryTypes: c.libraryTypes || [],
            image: c.image || '',
            teacherCount: c.teacherCount ?? 0, studentCount: c.studentCount ?? 0,
            teachers: c.teachers || [],
          }
          setForm(snapshot)
          setSaved(snapshot)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id, isNew])

  const set = useCallback((k, v) => setForm(f => ({ ...f, [k]: v })), [])

  function toggleLibraryType(val) {
    setForm(f => {
      const has = f.libraryTypes.includes(val)
      return { ...f, libraryTypes: has ? f.libraryTypes.filter(t => t !== val) : [...f.libraryTypes, val] }
    })
  }

  function cancelEdit() {
    setForm(saved)
    setError('')
    setEditing(false)
  }

  async function handleImageUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setUploadErr('')
    try {
      const fd = new FormData()
      fd.append('file', file)
      const res = await fetch('/api/admin/courses/upload-image', { method: 'POST', body: fd })
      const data = await res.json()
      if (!res.ok) { setUploadErr(data.error || 'Upload failed'); return }
      set('image', data.url)
    } catch {
      setUploadErr('Upload failed — check your connection')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function save() {
    setSaving(true); setError('')
    const url    = isNew ? '/api/admin/courses' : `/api/admin/courses/${id}`
    const method = isNew ? 'POST' : 'PATCH'
    const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error || (isAr ? 'فشل الحفظ' : 'Save failed')); return }
    if (isNew && data.course?.id) {
      router.replace(`/admin/courses/${data.course.id}`)
    } else {
      const snapshot = { ...form }
      setSaved(snapshot)
      setEditing(false)
      setFlash(true)
      setTimeout(() => setFlash(false), 3000)
    }
  }

  /* Tokens */
  const surf   = isDark ? '#10222b' : '#fff'
  const border = isDark ? 'rgba(255,255,255,.09)' : '#e5e7eb'
  const text   = isDark ? '#f1f5f9' : '#111827'
  const muted  = isDark ? 'rgba(255,255,255,.45)' : '#6b7280'
  const bg     = isDark ? 'rgba(255,255,255,.04)' : '#f9fafb'

  const inp = { width: '100%', padding: '10px 13px', borderRadius: 9, border: `1px solid ${border}`, background: bg, color: text, fontSize: '.88rem', fontFamily: 'inherit', outline: 'none', transition: 'border-color .15s' }
  const ta  = { ...inp, resize: 'vertical', minHeight: 112, lineHeight: 1.65 }

  const fp = { muted, isAr }
  const cp = { surf, border, isDark }
  const tp = { isDark, isAr, border, bg, text }

  const catOptions   = categories.map(c => ({ value: c.id, label: c.nameEn, labelAr: c.nameAr }))
  const categoryName = categories.find(c => c.id === form.categoryId)
  const levelInfo    = LEVELS.find(l => l.value === form.level)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', color: muted }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'csSpin .7s linear infinite', marginRight: 8 }}>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
      {isAr ? 'جارٍ التحميل…' : 'Loading…'}
    </div>
  )

  return (
    <>
      <style>{`@keyframes csSpin{to{transform:rotate(360deg)}}`}</style>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
        <button
          onClick={() => router.push('/admin/courses')}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0, padding: '7px 14px', borderRadius: 9, background: surf, border: `1px solid ${border}`, color: muted, fontSize: '.82rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          onMouseEnter={e => e.currentTarget.style.borderColor = GOLD}
          onMouseLeave={e => e.currentTarget.style.borderColor = border}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="13" height="13" style={{ transform: isAr ? 'none' : 'rotate(180deg)' }}>
            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
          </svg>
          {isAr ? 'كتالوج الدورات' : 'Courses'}
        </button>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
            <h1 style={{ fontSize: '1.35rem', fontWeight: 900, color: text, margin: 0 }}>
              {form.nameEn || (isAr ? 'دورة جديدة' : 'New Course')}
            </h1>
            {form.level && !editing && <LevelBadge level={form.level} size="lg" />}
            {categoryName && !editing && (
              <span style={{ fontSize: '.75rem', fontWeight: 600, padding: '3px 12px', borderRadius: 100, background: isDark ? 'rgba(201,147,44,.1)' : 'rgba(201,147,44,.08)', border: '1px solid rgba(201,147,44,.3)', color: GOLD }}>
                {isAr ? categoryName.nameAr || categoryName.nameEn : categoryName.nameEn}
              </span>
            )}
          </div>
          {form.nameAr && (
            <div style={{ fontSize: '.88rem', color: muted, direction: 'rtl', textAlign: 'right' }}>{form.nameAr}</div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {flash && !editing && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '.82rem', color: GREEN, fontWeight: 600 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
              {isAr ? 'تم الحفظ' : 'Saved'}
            </span>
          )}
          {!editing && !isNew && (
            <button
              onClick={() => { setEditing(true); setError('') }}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '9px 20px', borderRadius: 10, background: GOLD, border: 'none', color: '#fff', fontWeight: 700, fontSize: '.88rem', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
              </svg>
              {isAr ? 'تعديل' : 'Edit'}
            </button>
          )}
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 11, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', color: RED, fontSize: '.87rem', marginBottom: 20 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {/* ── VIEW MODE ── */}
      {!editing && !isNew && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, alignItems: 'start' }}>

          {/* Left */}
          <div>

            {/* Course image */}
            {form.image && (
              <div style={{ borderRadius: 14, overflow: 'hidden', border: `1px solid ${border}`, marginBottom: 20, maxHeight: 260, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img src={form.image} alt={form.nameEn} style={{ width: '100%', maxHeight: 260, objectFit: 'cover', display: 'block' }} onError={e => { e.currentTarget.parentElement.style.display = 'none' }} />
              </div>
            )}

            {/* Quick stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
              {[
                { label: isAr ? 'الجلسات' : 'Sessions',  value: form.durationSessions || '—', color: BLUE },
                { label: isAr ? 'الأشهر'  : 'Months',   value: form.durationMonths   || '—', color: PURPLE },
                { label: isAr ? 'المعلمون': 'Teachers',  value: form.teacherCount ?? 0,       color: GOLD },
                { label: isAr ? 'الطلاب'  : 'Students',  value: form.studentCount ?? 0,       color: GREEN },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ background: surf, border: `1px solid ${border}`, borderRadius: 14, padding: '16px 18px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
                  <div style={{ fontSize: '.72rem', color: muted, marginTop: 5, fontWeight: 500 }}>{label}</div>
                </div>
              ))}
            </div>

            {/* Description */}
            <SectionCard {...cp} color={BLUE} title={isAr ? 'وصف الدورة' : 'Description'}
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
            >
              {form.descEn && (
                <div style={{ marginBottom: form.descAr ? 16 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: '.58rem', fontWeight: 800, padding: '1px 7px', borderRadius: 4, background: `${BLUE}18`, color: BLUE, letterSpacing: '.06em', textTransform: 'uppercase' }}>EN</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '.9rem', color: text, lineHeight: 1.7 }}>{form.descEn}</p>
                </div>
              )}
              {form.descAr && (
                <div style={{ paddingTop: form.descEn ? 16 : 0, borderTop: form.descEn ? `1px dashed ${border}` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: '.58rem', fontWeight: 800, padding: '1px 7px', borderRadius: 4, background: `${GOLD}18`, color: GOLD, letterSpacing: '.06em', textTransform: 'uppercase' }}>AR</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '.9rem', color: text, lineHeight: 1.7, direction: 'rtl', textAlign: 'right' }}>{form.descAr}</p>
                </div>
              )}
              {!form.descEn && !form.descAr && <span style={{ color: muted, fontSize: '.85rem' }}>—</span>}
            </SectionCard>

            {/* Marketing */}
            <SectionCard {...cp} color={PURPLE} title={isAr ? 'الرسالة التسويقية' : 'Marketing Message'}
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}
            >
              {form.marketingEn && (
                <div style={{ marginBottom: form.marketingAr ? 16 : 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: '.58rem', fontWeight: 800, padding: '1px 7px', borderRadius: 4, background: `${BLUE}18`, color: BLUE, letterSpacing: '.06em', textTransform: 'uppercase' }}>EN</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '.9rem', color: text, lineHeight: 1.7 }}>{form.marketingEn}</p>
                </div>
              )}
              {form.marketingAr && (
                <div style={{ paddingTop: form.marketingEn ? 16 : 0, borderTop: form.marketingEn ? `1px dashed ${border}` : 'none' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <span style={{ fontSize: '.58rem', fontWeight: 800, padding: '1px 7px', borderRadius: 4, background: `${GOLD}18`, color: GOLD, letterSpacing: '.06em', textTransform: 'uppercase' }}>AR</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '.9rem', color: text, lineHeight: 1.7, direction: 'rtl', textAlign: 'right' }}>{form.marketingAr}</p>
                </div>
              )}
              {!form.marketingEn && !form.marketingAr && <span style={{ color: muted, fontSize: '.85rem' }}>—</span>}
            </SectionCard>

          </div>

          {/* Right */}
          <div>

            {/* Course details */}
            <SectionCard {...cp} color={GOLD} title={isAr ? 'تفاصيل الدورة' : 'Course Details'}
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
            >
              <div style={{ fontSize: '.85rem' }}>
                {form.level && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${border}` }}>
                    <span style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: muted }}>{isAr ? 'المستوى' : 'Level'}</span>
                    <LevelBadge level={form.level} />
                  </div>
                )}
                {categoryName && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${border}` }}>
                    <span style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: muted }}>{isAr ? 'التصنيف' : 'Category'}</span>
                    <span style={{ fontWeight: 600, color: GOLD }}>{isAr ? categoryName.nameAr || categoryName.nameEn : categoryName.nameEn}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${border}` }}>
                  <span style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: muted }}>{isAr ? 'الجلسات' : 'Sessions'}</span>
                  <span style={{ fontWeight: 700, color: BLUE }}>{form.durationSessions || '—'}</span>
                </div>
                {form.durationMonths && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${border}` }}>
                    <span style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: muted }}>{isAr ? 'المدة' : 'Duration'}</span>
                    <span style={{ fontWeight: 600, color: text }}>{form.durationMonths} {isAr ? 'شهر' : 'months'}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: `1px solid ${border}` }}>
                  <span style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: muted }}>{isAr ? 'محادثة' : 'Speaking'}</span>
                  <span style={{ fontWeight: 700, color: form.needsSpeaking ? GREEN : muted }}>
                    {form.needsSpeaking ? `${isAr ? 'نعم' : 'Yes'} (${form.speakingSessions})` : (isAr ? 'لا' : 'No')}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: form.needsLibrary && form.libraryTypes.length > 0 ? `1px solid ${border}` : 'none' }}>
                  <span style={{ fontSize: '.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em', color: muted }}>{isAr ? 'مكتبة' : 'Library'}</span>
                  <span style={{ fontWeight: 700, color: form.needsLibrary ? GREEN : muted }}>{form.needsLibrary ? (isAr ? 'نعم' : 'Yes') : (isAr ? 'لا' : 'No')}</span>
                </div>
                {form.needsLibrary && form.libraryTypes.length > 0 && (
                  <div style={{ paddingTop: 10 }}>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {form.libraryTypes.map(t => {
                        const opt = LIBRARY_OPTIONS.find(o => o.value === t)
                        return (
                          <span key={t} style={{ fontSize: '.7rem', fontWeight: 600, padding: '3px 10px', borderRadius: 100, background: `${GREEN}10`, border: `1px solid ${GREEN}30`, color: GREEN }}>
                            {opt ? (isAr ? opt.labelAr : opt.labelEn) : t}
                          </span>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Teachers */}
            <SectionCard {...cp} color={BLUE} title={isAr ? 'المعلمون والطلاب' : 'Teachers & Students'}
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                {[
                  { label: isAr ? 'المعلمون' : 'Teachers', value: form.teacherCount ?? 0, color: BLUE },
                  { label: isAr ? 'الطلاب'   : 'Students', value: form.studentCount ?? 0, color: GREEN },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ padding: 14, borderRadius: 10, border: `1px solid ${border}`, background: bg, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.7rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: '.7rem', color: muted, marginTop: 5 }}>{label}</div>
                  </div>
                ))}
              </div>
              {(form.teachers || []).length === 0 ? (
                <div style={{ padding: '11px 13px', borderRadius: 9, border: `1px dashed ${border}`, color: muted, fontSize: '.82rem', textAlign: 'center' }}>
                  {isAr ? 'لم يُعيَّن أي معلم بعد' : 'No teachers assigned yet'}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {(form.teachers || []).map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', borderRadius: 8, border: `1px solid ${border}`, background: bg }}>
                      <div style={{ width: 26, height: 26, borderRadius: '50%', background: `${BLUE}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" width="12" height="12"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                      <span style={{ fontSize: '.83rem', color: text }}>{t.name || t}</span>
                    </div>
                  ))}
                </div>
              )}
            </SectionCard>

          </div>
        </div>
      )}

      {/* ── EDIT / CREATE MODE ── */}
      {(editing || isNew) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

          {/* Left */}
          <div>
            {/* Identity */}
            <SectionCard {...cp} color={GOLD} title={isAr ? 'هوية الدورة' : 'Course Identity'}
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 4 }}>
                <Field {...fp} label={isAr ? 'اسم الدورة' : 'Course Name'} lang="en" required>
                  <input value={form.nameEn} onChange={e => set('nameEn', e.target.value)} placeholder="e.g. Business Communication" dir="ltr" style={inp} onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = border} />
                </Field>
                <Field {...fp} label={isAr ? 'اسم الدورة' : 'Course Name'} lang="ar" optional>
                  <input value={form.nameAr} onChange={e => set('nameAr', e.target.value)} placeholder="مثال: التواصل التجاري" dir="rtl" style={inp} onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = border} />
                </Field>
              </div>
              <Field {...fp} label={isAr ? 'التصنيف' : 'Category'} optional>
                <Select value={form.categoryId} onChange={v => set('categoryId', v)} options={catOptions} placeholder="Select a category…" placeholderAr="اختر تصنيفًا…" isAr={isAr} isDark={isDark} />
              </Field>
              <Field {...fp} label={isAr ? 'المستوى' : 'English Level'} optional>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {LEVELS.map(({ value, color }) => {
                    const active = form.level === value
                    return (
                      <button key={value} type="button" onClick={() => set('level', active ? '' : value)}
                        style={{ padding: '7px 18px', borderRadius: 100, fontWeight: 800, fontSize: '.85rem', letterSpacing: '.04em', cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s', border: `2px solid ${active ? color : (isDark ? 'rgba(255,255,255,.12)' : '#e5e7eb')}`, background: active ? color : 'transparent', color: active ? '#fff' : (isDark ? 'rgba(255,255,255,.5)' : '#9ca3af'), transform: active ? 'scale(1.08)' : 'scale(1)', boxShadow: active ? `0 4px 14px ${color}45` : 'none' }}
                      >
                        {value}
                      </button>
                    )
                  })}
                </div>
                {form.level && (
                  <div style={{ marginTop: 8, fontSize: '.75rem', color: levelInfo?.color, fontWeight: 600 }}>
                    {isAr ? `المستوى المختار: ${form.level}` : `Selected: ${form.level}`}
                  </div>
                )}
              </Field>
              <Field {...fp} label={isAr ? 'صورة الدورة' : 'Course Image'} optional>
                <input
                  id="course-img-input"
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
                {form.image ? (
                  <div style={{ borderRadius: 10, overflow: 'hidden', border: `1px solid ${border}`, background: bg, position: 'relative' }}>
                    <img
                      src={form.image}
                      alt=""
                      style={{ width: '100%', maxHeight: 200, objectFit: 'cover', display: 'block' }}
                      onError={e => { e.currentTarget.style.display = 'none' }}
                    />
                    <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
                      <label htmlFor="course-img-input" style={{ cursor: 'pointer', background: 'rgba(0,0,0,.6)', color: '#fff', fontSize: '.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: 6, letterSpacing: '.06em' }}>
                        {isAr ? 'تغيير' : 'Change'}
                      </label>
                      <button type="button" onClick={() => { set('image', ''); setUploadErr('') }} style={{ background: 'rgba(239,68,68,.8)', color: '#fff', fontSize: '.7rem', fontWeight: 700, padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', letterSpacing: '.06em' }}>
                        {isAr ? 'حذف' : 'Remove'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <label htmlFor="course-img-input" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, border: `2px dashed ${uploading ? GOLD : border}`, borderRadius: 10, padding: '28px 20px', cursor: uploading ? 'wait' : 'pointer', background: uploading ? `${GOLD}08` : 'transparent', transition: 'border-color .2s, background .2s' }}>
                    {uploading ? (
                      <>
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke={GOLD} strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                          <circle cx="12" cy="12" r="10" strokeOpacity=".25"/>
                          <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round"/>
                        </svg>
                        <span style={{ fontSize: '.75rem', fontWeight: 700, color: GOLD, letterSpacing: '.06em' }}>{isAr ? 'جاري الرفع...' : 'Uploading...'}</span>
                      </>
                    ) : (
                      <>
                        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke={muted} strokeWidth="1.8">
                          <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
                          <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                        </svg>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '.75rem', fontWeight: 700, color: muted, letterSpacing: '.06em' }}>{isAr ? 'انقر لرفع صورة' : 'Click to upload image'}</div>
                          <div style={{ fontSize: '.65rem', color: muted, opacity: .6, marginTop: 3 }}>PNG, JPEG, SVG · max 5 MB</div>
                        </div>
                      </>
                    )}
                  </label>
                )}
                {uploadErr && <div style={{ marginTop: 6, fontSize: '.72rem', color: RED, fontWeight: 600 }}>{uploadErr}</div>}
                <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              </Field>
            </SectionCard>

            {/* Description */}
            <SectionCard {...cp} color={BLUE} title={isAr ? 'وصف الدورة' : 'Description'}
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
            >
              <Field {...fp} label={isAr ? 'الوصف' : 'Description'} lang="en" required>
                <textarea value={form.descEn} onChange={e => set('descEn', e.target.value)} placeholder="Describe what students will learn…" dir="ltr" style={ta} onFocus={e => e.target.style.borderColor = BLUE} onBlur={e => e.target.style.borderColor = border} />
              </Field>
              <Field {...fp} label={isAr ? 'الوصف' : 'Description'} lang="ar" optional>
                <textarea value={form.descAr} onChange={e => set('descAr', e.target.value)} placeholder="صِف ما سيتعلمه الطلاب في هذه الدورة…" dir="rtl" style={ta} onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = border} />
              </Field>
            </SectionCard>

            {/* Marketing */}
            <SectionCard {...cp} color={PURPLE} title={isAr ? 'الرسالة التسويقية' : 'Marketing Message'}
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}
            >
              <Field {...fp} label={isAr ? 'الرسالة التسويقية' : 'Marketing'} lang="en" required>
                <textarea value={form.marketingEn} onChange={e => set('marketingEn', e.target.value)} placeholder="A compelling reason to enrol…" dir="ltr" style={ta} onFocus={e => e.target.style.borderColor = PURPLE} onBlur={e => e.target.style.borderColor = border} />
              </Field>
              <Field {...fp} label={isAr ? 'الرسالة التسويقية' : 'Marketing'} lang="ar" optional>
                <textarea value={form.marketingAr} onChange={e => set('marketingAr', e.target.value)} placeholder="سبب مقنع لتسجيل الطلاب في هذه الدورة…" dir="rtl" style={ta} onFocus={e => e.target.style.borderColor = GOLD} onBlur={e => e.target.style.borderColor = border} />
              </Field>
            </SectionCard>
          </div>

          {/* Right */}
          <div>
            {/* Schedule */}
            <SectionCard {...cp} color={BLUE} title={isAr ? 'الجدول الزمني' : 'Schedule & Duration'}
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field {...fp} label={isAr ? 'الأشهر' : 'Months'} optional>
                  <input type="number" min="0" step="1" value={form.durationMonths} onChange={e => set('durationMonths', e.target.value)} placeholder="e.g. 3" style={inp} onFocus={e => e.target.style.borderColor = BLUE} onBlur={e => e.target.style.borderColor = border} />
                </Field>
                <Field {...fp} label={isAr ? 'الجلسات' : 'Sessions'} required>
                  <input type="number" min="1" step="1" value={form.durationSessions} onChange={e => set('durationSessions', e.target.value)} placeholder="e.g. 24" style={inp} onFocus={e => e.target.style.borderColor = BLUE} onBlur={e => e.target.style.borderColor = border} />
                </Field>
              </div>
              <div style={{ marginTop: 8 }}>
                <Toggle {...tp} on={form.needsSpeaking} onChange={v => set('needsSpeaking', v)} label="Speaking sessions?" labelAr="تتضمن جلسات محادثة؟" color={BLUE} />
                {form.needsSpeaking && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${border}` }}>
                    <Field {...fp} label={isAr ? 'عدد جلسات المحادثة' : 'No. of speaking sessions'} required>
                      <input type="number" min="1" step="1" value={form.speakingSessions} onChange={e => set('speakingSessions', e.target.value)} placeholder="e.g. 6" style={inp} onFocus={e => e.target.style.borderColor = BLUE} onBlur={e => e.target.style.borderColor = border} />
                    </Field>
                  </div>
                )}
              </div>
            </SectionCard>

            {/* Library */}
            <SectionCard {...cp} color={GREEN} title={isAr ? 'المكتبة والمواد' : 'Library & Materials'}
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>}
            >
              <Toggle {...tp} on={form.needsLibrary} onChange={v => set('needsLibrary', v)} label="Has library & materials?" labelAr="تتضمن مكتبة ومواد؟" color={GREEN} />
              {form.needsLibrary && (
                <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px dashed ${border}` }}>
                  <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: muted, marginBottom: 10 }}>
                    {isAr ? 'أنواع المواد' : 'Material Types'} <span style={{ color: RED }}>*</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {LIBRARY_OPTIONS.map(opt => {
                      const checked = form.libraryTypes.includes(opt.value)
                      return (
                        <div key={opt.value} onClick={() => toggleLibraryType(opt.value)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 13px', borderRadius: 9, cursor: 'pointer', border: `1px solid ${checked ? GREEN + '45' : border}`, background: checked ? GREEN + '0a' : bg, transition: 'all .15s' }}>
                          <div style={{ width: 17, height: 17, borderRadius: 4, flexShrink: 0, border: `2px solid ${checked ? GREEN : (isDark ? 'rgba(255,255,255,.25)' : '#d1d5db')}`, background: checked ? GREEN : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s' }}>
                            {checked && <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" width="10" height="10"><polyline points="20 6 9 17 4 12"/></svg>}
                          </div>
                          <span style={{ fontSize: '.84rem', fontWeight: checked ? 600 : 400, color: checked ? GREEN : text }}>{isAr ? opt.labelAr : opt.labelEn}</span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </SectionCard>

            {/* Stats (edit only, existing course) */}
            {!isNew && (
              <SectionCard {...cp} color={GOLD} title={isAr ? 'إحصائيات الدورة' : 'Course Stats'}
                icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {[
                    { label: isAr ? 'المعلمون' : 'Teachers', value: form.teacherCount ?? 0, color: BLUE },
                    { label: isAr ? 'الطلاب'   : 'Students', value: form.studentCount ?? 0, color: GREEN },
                  ].map(({ label, value, color }) => (
                    <div key={label} style={{ padding: 14, borderRadius: 10, border: `1px solid ${border}`, background: bg, textAlign: 'center' }}>
                      <div style={{ fontSize: '1.7rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
                      <div style={{ fontSize: '.7rem', color: muted, marginTop: 5 }}>{label}</div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}
          </div>
        </div>
      )}

      {/* ── Sticky bottom bar (edit/create mode only) ── */}
      {(editing || isNew) && (
        <div style={{ position: 'sticky', bottom: 20, marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, padding: '14px 20px', borderRadius: 14, background: isDark ? 'rgba(16,34,43,.95)' : 'rgba(255,255,255,.95)', border: `1px solid ${border}`, backdropFilter: 'blur(8px)', boxShadow: isDark ? '0 -4px 32px rgba(0,0,0,.35)' : '0 -2px 20px rgba(0,0,0,.1)' }}>
          {error && <span style={{ flex: 1, fontSize: '.83rem', color: RED }}>{error}</span>}
          {!isNew && (
            <button onClick={cancelEdit} style={{ padding: '9px 22px', borderRadius: 10, background: 'none', border: `1px solid ${border}`, color: muted, fontWeight: 600, fontSize: '.88rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              {isAr ? 'إلغاء' : 'Cancel'}
            </button>
          )}
          <button onClick={save} disabled={saving} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 28px', borderRadius: 10, background: saving ? 'rgba(201,147,44,.45)' : GOLD, border: 'none', color: '#fff', fontWeight: 700, fontSize: '.9rem', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>
            {saving
              ? <><div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', animation: 'csSpin .7s linear infinite' }}/>{isAr ? 'جارٍ الحفظ…' : 'Saving…'}</>
              : isNew ? (isAr ? 'إنشاء الدورة' : 'Create Course') : (isAr ? 'حفظ التغييرات' : 'Save Changes')
            }
          </button>
        </div>
      )}
    </>
  )
}
