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

const LIBRARY_OPTIONS = [
  { value: 'videos', labelEn: 'Videos',            labelAr: 'مقاطع الفيديو' },
  { value: 'links',  labelEn: 'Links',             labelAr: 'روابط' },
  { value: 'pdf',    labelEn: 'PDF Files',         labelAr: 'ملفات PDF' },
  { value: 'word',   labelEn: 'Word Files',        labelAr: 'ملفات Word' },
  { value: 'audio',  labelEn: 'Audios & Podcasts', labelAr: 'ملفات صوتية وبودكاست' },
  { value: 'others', labelEn: 'Others',            labelAr: 'أخرى' },
]

const LEVELS = [
  { value: 'A1', color: '#10b981' },
  { value: 'A2', color: '#06b6d4' },
  { value: 'B1', color: '#3b82f6' },
  { value: 'B2', color: '#6366f1' },
  { value: 'C1', color: '#8b5cf6' },
  { value: 'C2', color: '#c9932c' },
]

const BLANK = {
  nameEn: '', nameAr: '', categoryId: '', level: '',
  descEn: '', descAr: '',
  marketingEn: '', marketingAr: '',
  durationMonths: '', durationSessions: '',
  needsSpeaking: false, speakingSessions: '',
  needsLibrary: false, libraryTypes: [],
}

/* ─── Sub-components defined OUTSIDE so React never remounts them ─── */

function Field({ label, lang, required, optional, muted, isAr, children }) {
  const langColor = lang === 'ar' ? GOLD : BLUE
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
        {lang && (
          <span style={{
            fontSize: '.58rem', fontWeight: 800, padding: '1px 7px', borderRadius: 4,
            background: `${langColor}18`, color: langColor,
            letterSpacing: '.06em', textTransform: 'uppercase', flexShrink: 0,
          }}>
            {lang === 'ar' ? 'AR' : 'EN'}
          </span>
        )}
        <span style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: muted }}>
          {label}
        </span>
        {required && <span style={{ color: '#ef4444', fontSize: '.85rem', lineHeight: 1 }}>*</span>}
        {optional && (
          <span style={{
            fontSize: '.6rem', fontWeight: 700, padding: '1px 7px', borderRadius: 100,
            background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.25)',
            color: PURPLE, textTransform: 'none', letterSpacing: 0,
          }}>
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
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '14px 22px',
        borderBottom: `1px solid ${border}`,
        background: isDark ? `${c}0d` : `${c}07`,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, flexShrink: 0,
          background: `${c}16`, border: `1px solid ${c}28`,
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: c,
        }}>
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
    <div
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 16, padding: '13px 16px', borderRadius: 10,
        border: `1px solid ${on ? c + '40' : border}`,
        background: on ? `${c}09` : bg,
        cursor: 'pointer', transition: 'all .2s',
      }}
      onClick={() => onChange(!on)}
    >
      <span style={{ fontSize: '.87rem', fontWeight: 600, color: on ? c : text }}>
        {isAr ? labelAr : label}
      </span>
      <div style={{
        width: 40, height: 22, borderRadius: 100, padding: 2,
        background: on ? c : (isDark ? 'rgba(255,255,255,.12)' : '#d1d5db'),
        transition: 'background .2s', position: 'relative', flexShrink: 0,
      }}>
        <div style={{
          width: 18, height: 18, borderRadius: '50%', background: '#fff',
          boxShadow: '0 1px 3px rgba(0,0,0,.25)',
          position: 'absolute', top: 2, left: on ? 20 : 2,
          transition: 'left .2s',
        }} />
      </div>
    </div>
  )
}

/* ─── Main page ─────────────────────────────────────────────────────── */

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
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(!isNew)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')
  const [saved,      setSaved]      = useState(false)

  useEffect(() => {
    fetch('/api/admin/categories')
      .then(r => r.json())
      .then(d => setCategories(d.categories || []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (isNew) return
    fetch(`/api/admin/courses/${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.course) {
          const c = d.course
          setForm({
            nameEn:           c.nameEn          || '',
            nameAr:           c.nameAr          || '',
            categoryId:       c.categoryId      || '',
            descEn:           c.descEn          || '',
            descAr:           c.descAr          || '',
            marketingEn:      c.marketingEn     || '',
            marketingAr:      c.marketingAr     || '',
            durationMonths:   c.durationMonths  ?? '',
            durationSessions: c.durationSessions ?? '',
            level:            c.level           || '',
            needsSpeaking:    !!c.needsSpeaking,
            speakingSessions: c.speakingSessions ?? '',
            needsLibrary:     !!c.needsLibrary,
            libraryTypes:     c.libraryTypes    || [],
            teacherCount:     c.teacherCount    ?? 0,
            studentCount:     c.studentCount    ?? 0,
            teachers:         c.teachers        || [],
          })
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

  async function save() {
    setSaving(true); setError(''); setSaved(false)
    const url    = isNew ? '/api/admin/courses' : `/api/admin/courses/${id}`
    const method = isNew ? 'POST' : 'PATCH'
    const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setError(data.error || (isAr ? 'فشل الحفظ' : 'Save failed')); return }
    if (isNew && data.course?.id) {
      router.replace(`/admin/courses/${data.course.id}`)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  /* ── Theme tokens ──────────────────────────────────────────────── */
  const surf   = isDark ? '#10222b' : '#fff'
  const border = isDark ? 'rgba(255,255,255,.09)' : '#e5e7eb'
  const text   = isDark ? '#f1f5f9' : '#111827'
  const muted  = isDark ? 'rgba(255,255,255,.45)' : '#6b7280'
  const bg     = isDark ? 'rgba(255,255,255,.04)' : '#f9fafb'

  const inp = {
    width: '100%', padding: '10px 13px', borderRadius: 9,
    border: `1px solid ${border}`, background: bg,
    color: text, fontSize: '.88rem', fontFamily: 'inherit',
    outline: 'none', transition: 'border-color .15s',
  }
  const ta = { ...inp, resize: 'vertical', minHeight: 112, lineHeight: 1.65 }

  /* Prop bundles to avoid repetition */
  const fp = { muted, isAr }
  const cp = { surf, border, isDark }
  const tp = { isDark, isAr, border, bg, text }

  const catOptions = categories.map(c => ({ value: c.id, label: c.nameEn, labelAr: c.nameAr }))

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0', color: muted }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        style={{ animation: 'adSpin .7s linear infinite', marginRight: 8 }}>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
      {isAr ? 'جارٍ التحميل…' : 'Loading…'}
    </div>
  )

  return (
    <>
      <style>{`@keyframes adSpin{to{transform:rotate(360deg)}}`}</style>

      {/* ── Page header ── */}
      <div className="admin-header" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          <button
            onClick={() => router.push('/admin/courses')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, flexShrink: 0,
              padding: '6px 14px', borderRadius: 9,
              background: 'var(--surface)', border: '1px solid var(--border)',
              color: 'var(--text-60)', fontSize: '.82rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: 'inherit', transition: 'border-color .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.borderColor = GOLD}
            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="13" height="13"
              style={{ transform: isAr ? 'none' : 'rotate(180deg)' }}>
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
            {isAr ? 'كتالوج الدورات' : 'Courses Catalog'}
          </button>
          <div style={{ minWidth: 0 }}>
            <h1 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {form.nameEn || (isNew ? (isAr ? 'دورة جديدة' : 'New Course') : '…')}
            </h1>
            {!isNew && form.nameAr && (
              <div style={{ fontSize: '.78rem', color: 'var(--text-60)', direction: 'rtl' }}>{form.nameAr}</div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          {saved && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '.82rem', color: GREEN, fontWeight: 600 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
              {isAr ? 'تم الحفظ' : 'Saved'}
            </span>
          )}
          <button
            onClick={save} disabled={saving}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '9px 22px', borderRadius: 10,
              background: saving ? 'rgba(201,147,44,.45)' : GOLD,
              border: 'none', color: '#fff', fontWeight: 700, fontSize: '.88rem',
              cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
            }}
          >
            {saving ? (
              <><div style={{ width: 13, height: 13, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', animation: 'adSpin .7s linear infinite' }}/>{isAr ? 'جارٍ الحفظ…' : 'Saving…'}</>
            ) : (
              isNew ? (isAr ? 'إنشاء الدورة' : 'Create Course') : (isAr ? 'حفظ التغييرات' : 'Save Changes')
            )}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderRadius: 11, background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', color: '#ef4444', fontSize: '.87rem', marginBottom: 20 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="15" height="15" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20, alignItems: 'start' }}>

        {/* ══ LEFT COLUMN ══ */}
        <div>

          {/* Identity */}
          <SectionCard {...cp} color={GOLD} title={isAr ? 'هوية الدورة' : 'Course Identity'}
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 4 }}>
              <Field {...fp} label={isAr ? 'اسم الدورة' : 'Course Name'} lang="en" required>
                <input
                  value={form.nameEn}
                  onChange={e => set('nameEn', e.target.value)}
                  placeholder="e.g. Business Communication"
                  dir="ltr"
                  style={inp}
                  onFocus={e => e.target.style.borderColor = GOLD}
                  onBlur={e  => e.target.style.borderColor = border}
                />
              </Field>
              <Field {...fp} label={isAr ? 'اسم الدورة' : 'Course Name'} lang="ar" optional>
                <input
                  value={form.nameAr}
                  onChange={e => set('nameAr', e.target.value)}
                  placeholder="مثال: التواصل التجاري"
                  dir="rtl"
                  style={inp}
                  onFocus={e => e.target.style.borderColor = GOLD}
                  onBlur={e  => e.target.style.borderColor = border}
                />
              </Field>
            </div>
            <Field {...fp} label={isAr ? 'التصنيف' : 'Category'} optional>
              <Select
                value={form.categoryId}
                onChange={v => set('categoryId', v)}
                options={catOptions}
                placeholder="Select a category…"
                placeholderAr="اختر تصنيفًا…"
                isAr={isAr}
                isDark={isDark}
              />
            </Field>
            <Field {...fp} label={isAr ? 'المستوى' : 'English Level'} optional>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {LEVELS.map(({ value, color }) => {
                  const active = form.level === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => set('level', active ? '' : value)}
                      style={{
                        padding: '7px 18px', borderRadius: 100, fontWeight: 800,
                        fontSize: '.85rem', letterSpacing: '.04em', cursor: 'pointer',
                        fontFamily: 'inherit', transition: 'all .15s',
                        border: `2px solid ${active ? color : (isDark ? 'rgba(255,255,255,.12)' : '#e5e7eb')}`,
                        background: active ? color : 'transparent',
                        color: active ? '#fff' : (isDark ? 'rgba(255,255,255,.5)' : '#9ca3af'),
                        transform: active ? 'scale(1.08)' : 'scale(1)',
                        boxShadow: active ? `0 4px 14px ${color}45` : 'none',
                      }}
                    >
                      {value}
                    </button>
                  )
                })}
              </div>
              {form.level && (
                <div style={{ marginTop: 8, fontSize: '.75rem', color: LEVELS.find(l => l.value === form.level)?.color, fontWeight: 600 }}>
                  {isAr ? `المستوى المختار: ${form.level}` : `Selected: ${form.level}`}
                </div>
              )}
            </Field>
          </SectionCard>

          {/* Description */}
          <SectionCard {...cp} color={BLUE} title={isAr ? 'وصف الدورة' : 'Description'}
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
          >
            <Field {...fp} label={isAr ? 'الوصف' : 'Description'} lang="en" required>
              <textarea
                value={form.descEn}
                onChange={e => set('descEn', e.target.value)}
                placeholder="Describe what students will learn in this course…"
                dir="ltr"
                style={ta}
                onFocus={e => e.target.style.borderColor = BLUE}
                onBlur={e  => e.target.style.borderColor = border}
              />
            </Field>
            <Field {...fp} label={isAr ? 'الوصف' : 'Description'} lang="ar" optional>
              <textarea
                value={form.descAr}
                onChange={e => set('descAr', e.target.value)}
                placeholder="صِف ما سيتعلمه الطلاب في هذه الدورة…"
                dir="rtl"
                style={ta}
                onFocus={e => e.target.style.borderColor = GOLD}
                onBlur={e  => e.target.style.borderColor = border}
              />
            </Field>
          </SectionCard>

          {/* Marketing */}
          <SectionCard {...cp} color={PURPLE} title={isAr ? 'الرسالة التسويقية' : 'Marketing Message'}
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>}
          >
            <Field {...fp} label={isAr ? 'الرسالة التسويقية' : 'Marketing'} lang="en" required>
              <textarea
                value={form.marketingEn}
                onChange={e => set('marketingEn', e.target.value)}
                placeholder="A compelling reason for students to enrol in this course…"
                dir="ltr"
                style={ta}
                onFocus={e => e.target.style.borderColor = PURPLE}
                onBlur={e  => e.target.style.borderColor = border}
              />
            </Field>
            <Field {...fp} label={isAr ? 'الرسالة التسويقية' : 'Marketing'} lang="ar" optional>
              <textarea
                value={form.marketingAr}
                onChange={e => set('marketingAr', e.target.value)}
                placeholder="سبب مقنع لتسجيل الطلاب في هذه الدورة…"
                dir="rtl"
                style={ta}
                onFocus={e => e.target.style.borderColor = GOLD}
                onBlur={e  => e.target.style.borderColor = border}
              />
            </Field>
          </SectionCard>

        </div>

        {/* ══ RIGHT COLUMN ══ */}
        <div>

          {/* Schedule */}
          <SectionCard {...cp} color={BLUE} title={isAr ? 'الجدول الزمني' : 'Schedule & Duration'}
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>}
          >
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field {...fp} label={isAr ? 'الأشهر' : 'Months'} optional>
                <input
                  type="number" min="0" step="1"
                  value={form.durationMonths}
                  onChange={e => set('durationMonths', e.target.value)}
                  placeholder="e.g. 3"
                  style={inp}
                  onFocus={e => e.target.style.borderColor = BLUE}
                  onBlur={e  => e.target.style.borderColor = border}
                />
              </Field>
              <Field {...fp} label={isAr ? 'الجلسات' : 'Sessions'} required>
                <input
                  type="number" min="1" step="1"
                  value={form.durationSessions}
                  onChange={e => set('durationSessions', e.target.value)}
                  placeholder="e.g. 24"
                  style={inp}
                  onFocus={e => e.target.style.borderColor = BLUE}
                  onBlur={e  => e.target.style.borderColor = border}
                />
              </Field>
            </div>

            <div style={{ marginTop: 8 }}>
              <Toggle {...tp} on={form.needsSpeaking} onChange={v => set('needsSpeaking', v)}
                label="Speaking sessions?" labelAr="تتضمن جلسات محادثة؟" color={BLUE}
              />
              {form.needsSpeaking && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px dashed ${border}` }}>
                  <Field {...fp} label={isAr ? 'عدد جلسات المحادثة' : 'No. of speaking sessions'} required>
                    <input
                      type="number" min="1" step="1"
                      value={form.speakingSessions}
                      onChange={e => set('speakingSessions', e.target.value)}
                      placeholder="e.g. 6"
                      style={inp}
                      onFocus={e => e.target.style.borderColor = BLUE}
                      onBlur={e  => e.target.style.borderColor = border}
                    />
                  </Field>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Library */}
          <SectionCard {...cp} color={GREEN} title={isAr ? 'المكتبة والمواد' : 'Library & Materials'}
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>}
          >
            <Toggle {...tp} on={form.needsLibrary} onChange={v => set('needsLibrary', v)}
              label="Has library & materials?" labelAr="تتضمن مكتبة ومواد؟" color={GREEN}
            />
            {form.needsLibrary && (
              <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px dashed ${border}` }}>
                <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: muted, marginBottom: 10 }}>
                  {isAr ? 'أنواع المواد' : 'Material Types'}{' '}
                  <span style={{ color: '#ef4444' }}>*</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {LIBRARY_OPTIONS.map(opt => {
                    const checked = form.libraryTypes.includes(opt.value)
                    return (
                      <div
                        key={opt.value}
                        onClick={() => toggleLibraryType(opt.value)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '9px 13px', borderRadius: 9, cursor: 'pointer',
                          border: `1px solid ${checked ? GREEN + '45' : border}`,
                          background: checked ? GREEN + '0a' : bg,
                          transition: 'all .15s',
                        }}
                      >
                        <div style={{
                          width: 17, height: 17, borderRadius: 4, flexShrink: 0,
                          border: `2px solid ${checked ? GREEN : (isDark ? 'rgba(255,255,255,.25)' : '#d1d5db')}`,
                          background: checked ? GREEN : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all .15s',
                        }}>
                          {checked && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" width="10" height="10">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </div>
                        <span style={{ fontSize: '.84rem', fontWeight: checked ? 600 : 400, color: checked ? GREEN : text }}>
                          {isAr ? opt.labelAr : opt.labelEn}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </SectionCard>

          {/* Stats (edit only) */}
          {!isNew && (
            <SectionCard {...cp} color={GOLD} title={isAr ? 'إحصائيات الدورة' : 'Course Stats'}
              icon={<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>}
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                {[
                  { label: isAr ? 'المعلمون' : 'Teachers', value: form.teacherCount ?? 0, color: BLUE },
                  { label: isAr ? 'الطلاب'   : 'Students',  value: form.studentCount ?? 0, color: GREEN },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ padding: 14, borderRadius: 10, border: `1px solid ${border}`, background: bg, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.7rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
                    <div style={{ fontSize: '.7rem', color: muted, marginTop: 5 }}>{label}</div>
                  </div>
                ))}
              </div>

              <div style={{ fontSize: '.7rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: muted, marginBottom: 8 }}>
                {isAr ? 'قائمة المعلمين' : 'Teachers List'}
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
                        <svg viewBox="0 0 24 24" fill="none" stroke={BLUE} strokeWidth="2" width="12" height="12">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                        </svg>
                      </div>
                      <span style={{ fontSize: '.83rem', color: text }}>{t.name || t}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 8, background: isDark ? 'rgba(201,147,44,.07)' : 'rgba(201,147,44,.06)', border: '1px solid rgba(201,147,44,.2)', fontSize: '.72rem', color: GOLD }}>
                {isAr ? 'يتم تعيين المعلمين تلقائياً من خلال النظام' : 'Teachers are assigned automatically by the system'}
              </div>
            </SectionCard>
          )}

        </div>
      </div>

      {/* ── Sticky bottom save bar ── */}
      <div style={{
        position: 'sticky', bottom: 20, marginTop: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12,
        padding: '14px 20px', borderRadius: 14,
        background: isDark ? 'rgba(16,34,43,.95)' : 'rgba(255,255,255,.95)',
        border: `1px solid ${border}`, backdropFilter: 'blur(8px)',
        boxShadow: isDark ? '0 -4px 32px rgba(0,0,0,.35)' : '0 -2px 20px rgba(0,0,0,.1)',
      }}>
        {error && <span style={{ flex: 1, fontSize: '.83rem', color: '#ef4444' }}>{error}</span>}
        {saved && (
          <span style={{ fontSize: '.83rem', color: GREEN, display: 'flex', alignItems: 'center', gap: 5 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
            {isAr ? 'تم الحفظ بنجاح' : 'Changes saved'}
          </span>
        )}
        <button
          onClick={save} disabled={saving}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 28px', borderRadius: 10,
            background: saving ? 'rgba(201,147,44,.45)' : GOLD,
            border: 'none', color: '#fff', fontWeight: 700, fontSize: '.9rem',
            cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
          }}
        >
          {saving ? (
            <><div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid rgba(255,255,255,.3)', borderTopColor: '#fff', animation: 'adSpin .7s linear infinite' }}/>{isAr ? 'جارٍ الحفظ…' : 'Saving…'}</>
          ) : (
            isNew ? (isAr ? 'إنشاء الدورة' : 'Create Course') : (isAr ? 'حفظ التغييرات' : 'Save Changes')
          )}
        </button>
      </div>
    </>
  )
}
