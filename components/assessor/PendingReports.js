'use client'

import { useState, useEffect, useRef } from 'react'
import EmptyState from '@/components/ui/EmptyState'
import Pagination from '@/components/ui/Pagination'
import TableToolbar from '@/components/ui/TableToolbar'

/* ─── Helpers ────────────────────────────────────────────────────────────── */
function slotMinToTime(slotMin) {
  const h    = Math.floor(slotMin / 60)
  const m    = slotMin % 60
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

function fmtDate(dateStr) {
  try {
    return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    })
  } catch { return dateStr }
}

const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const LEVEL_DESC = {
  A1: 'Beginner',
  A2: 'Elementary',
  B1: 'Intermediate',
  B2: 'Upper-Intermediate',
  C1: 'Advanced',
  C2: 'Proficiency',
}

/* ─── Session header card ────────────────────────────────────────────────── */
function SessionHeader({ booking, isAr, isDark, gold, text, muted, border }) {
  return (
    <div style={{
      background: isDark
        ? 'linear-gradient(135deg, #0a1820 0%, #10222b 100%)'
        : 'linear-gradient(135deg, #fffbf0 0%, #fef9ee 100%)',
      border: `1px solid ${isDark ? 'rgba(201,147,44,.22)' : 'rgba(201,147,44,.2)'}`,
      borderRadius: 14, padding: '20px 24px',
      display: 'grid', gridTemplateColumns: '1fr 1px 1fr 1px 1fr',
      gap: 0, alignItems: 'center',
    }}>
      {/* Student */}
      <div style={{ paddingRight: 20 }}>
        <div style={{ fontSize: '.63rem', fontWeight: 700, letterSpacing: '.1em', color: gold, marginBottom: 6 }}>
          {isAr ? 'الطالب' : 'STUDENT'}
        </div>
        <div style={{ fontWeight: 800, color: text, fontSize: '.95rem', marginBottom: 2 }}>{booking.studentName}</div>
        <div style={{ fontSize: '.78rem', color: muted }}>{booking.studentEmail}</div>
      </div>

      <div style={{ width: 1, height: 48, background: isDark ? 'rgba(201,147,44,.2)' : 'rgba(201,147,44,.18)', margin: '0 20px' }} />

      {/* Session time */}
      <div style={{ padding: '0 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '.63rem', fontWeight: 700, letterSpacing: '.1em', color: gold, marginBottom: 6 }}>
          {isAr ? 'موعد الجلسة' : 'SESSION'}
        </div>
        <div style={{ fontWeight: 800, color: text, fontSize: '.9rem', marginBottom: 2 }}>{fmtDate(booking.date)}</div>
        <div style={{ fontSize: '.8rem', color: muted }}>{slotMinToTime(booking.slotMin)} · 60 {isAr ? 'دقيقة' : 'min'}</div>
      </div>

      <div style={{ width: 1, height: 48, background: isDark ? 'rgba(201,147,44,.2)' : 'rgba(201,147,44,.18)', margin: '0 20px' }} />

      {/* Assessor */}
      <div style={{ paddingLeft: 20 }}>
        <div style={{ fontSize: '.63rem', fontWeight: 700, letterSpacing: '.1em', color: gold, marginBottom: 6 }}>
          {isAr ? 'المستشار الأكاديمي' : 'ACADEMIC CONSULTANT'}
        </div>
        <div style={{ fontWeight: 800, color: text, fontSize: '.95rem', marginBottom: 2 }}>{booking.assessorName}</div>
        <div style={{ fontSize: '.78rem', color: muted }}>{booking.assessorEmail}</div>
      </div>
    </div>
  )
}

/* ─── Report form (inline expandable) ───────────────────────────────────── */
function ReportForm({ booking, onSubmitted, isAr, isDark, gold, text, muted, border, surface2 }) {
  const [feedback,        setFeedback]        = useState('')
  const [englishLevel,    setEnglishLevel]    = useState('')
  const [suggestedCourse, setSuggestedCourse] = useState('')
  const [saving,          setSaving]          = useState(false)
  const [error,           setError]           = useState('')
  const textareaRef = useRef(null)

  const charCount = feedback.length

  async function submit() {
    if (!feedback.trim())       { setError(isAr ? 'الرجاء كتابة التقرير'        : 'Please write your feedback');          return }
    if (feedback.trim().length < 50) { setError(isAr ? 'التقرير قصير جداً (50 حرف على الأقل)' : 'Feedback too short — at least 50 characters'); return }
    if (!englishLevel)          { setError(isAr ? 'الرجاء اختيار مستوى اللغة'  : 'Please select the English level');       return }
    if (!suggestedCourse.trim()){ setError(isAr ? 'الرجاء كتابة الكورس المقترح' : 'Please enter the suggested course');     return }

    setSaving(true); setError('')
    try {
      const res  = await fetch('/api/assessor/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: booking.id, feedback, englishLevel, suggestedCourse }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to save'); return }
      onSubmitted(data.report)
    } catch {
      setError(isAr ? 'خطأ في الاتصال' : 'Connection error')
    } finally {
      setSaving(false)
    }
  }

  const inp = {
    width: '100%', background: surface2,
    border: `1.5px solid ${border}`, borderRadius: 10,
    color: text, fontFamily: 'inherit', outline: 'none',
    transition: 'border-color .15s',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* ── Feedback ── */}
      <div>
        <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: muted, marginBottom: 8 }}>
          {isAr ? 'التقرير التفصيلي' : 'Detailed Assessment Feedback'} <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <div style={{ position: 'relative' }}>
          <textarea
            ref={textareaRef}
            value={feedback}
            onChange={e => { setFeedback(e.target.value); setError('') }}
            placeholder={isAr
              ? 'اكتب تقييمك التفصيلي للطالب هنا — شمل نقاط القوة والضعف وتوصياتك...'
              : 'Write your detailed assessment of the student here — include strengths, areas for improvement, specific observations, and recommendations...'}
            rows={8}
            style={{
              ...inp,
              padding: '14px 16px',
              fontSize: '.88rem', lineHeight: 1.7,
              resize: 'vertical', minHeight: 180,
            }}
            onFocus={e => { e.target.style.borderColor = gold }}
            onBlur={e => { e.target.style.borderColor = border }}
          />
          <div style={{
            position: 'absolute', bottom: 10, right: 12,
            fontSize: '.68rem', color: charCount < 50 ? '#ef4444' : muted,
            fontWeight: charCount < 50 ? 700 : 400, pointerEvents: 'none',
          }}>
            {charCount} {isAr ? 'حرف' : 'chars'} {charCount < 50 ? `(${isAr ? 'الحد الأدنى' : 'min'} 50)` : ''}
          </div>
        </div>
      </div>

      {/* ── English level ── */}
      <div>
        <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: muted, marginBottom: 10 }}>
          {isAr ? 'مستوى الإنجليزية' : "Student's English Level"} <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {LEVELS.map(lvl => {
            const active = englishLevel === lvl
            return (
              <button
                key={lvl}
                type="button"
                onClick={() => { setEnglishLevel(lvl); setError('') }}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                  padding: '10px 18px', borderRadius: 10, cursor: 'pointer',
                  background: active ? gold : surface2,
                  border: `1.5px solid ${active ? gold : border}`,
                  color: active ? '#fff' : muted,
                  transition: 'all .15s', fontFamily: 'inherit',
                  boxShadow: active ? `0 3px 12px rgba(201,147,44,.35)` : 'none',
                  minWidth: 70,
                }}
              >
                <span style={{ fontSize: '1rem', fontWeight: 900 }}>{lvl}</span>
                <span style={{ fontSize: '.6rem', fontWeight: 600, opacity: .75, letterSpacing: '.03em' }}>{LEVEL_DESC[lvl]}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ── Suggested course ── */}
      <div>
        <label style={{ display: 'block', fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: muted, marginBottom: 8 }}>
          {isAr ? 'الكورس المقترح' : 'Suggested Course to Start With'} <span style={{ color: '#ef4444' }}>*</span>
        </label>
        <input
          type="text"
          value={suggestedCourse}
          onChange={e => { setSuggestedCourse(e.target.value); setError('') }}
          placeholder={isAr ? 'مثال: General English A1 Foundation' : 'e.g. General English A1 Foundation, Business English B1…'}
          style={{ ...inp, padding: '11px 14px', fontSize: '.88rem' }}
          onFocus={e => { e.target.style.borderColor = gold }}
          onBlur={e => { e.target.style.borderColor = border }}
        />
      </div>

      {/* ── Error + Submit ── */}
      {error && (
        <div style={{
          padding: '11px 14px', borderRadius: 9, fontSize: '.82rem', fontWeight: 600, color: '#ef4444',
          background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)',
        }}>
          {error}
        </div>
      )}

      <button
        onClick={submit}
        disabled={saving}
        style={{
          alignSelf: 'flex-end',
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '12px 28px', borderRadius: 11, border: 'none',
          background: saving ? (isDark ? 'rgba(255,255,255,.08)' : '#f3f4f6') : gold,
          color: saving ? muted : '#fff',
          fontWeight: 800, fontSize: '.9rem', cursor: saving ? 'default' : 'pointer',
          fontFamily: 'inherit',
          boxShadow: saving ? 'none' : '0 4px 16px rgba(201,147,44,.4)',
          transition: 'all .15s',
        }}
      >
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        {saving
          ? (isAr ? 'جارٍ الحفظ…' : 'Submitting…')
          : (isAr ? 'إرسال التقرير' : 'Submit Report')}
      </button>
    </div>
  )
}

/* ─── Submitted report view ──────────────────────────────────────────────── */
function ReportView({ report, booking, onEdit, isAr, isDark, gold, text, muted, border, surface2 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {/* Level + course chips */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '6px 16px', borderRadius: 100,
          background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.28)',
        }}>
          <span style={{ fontSize: '.65rem', fontWeight: 700, color: muted, letterSpacing: '.08em' }}>
            {isAr ? 'المستوى' : 'LEVEL'}
          </span>
          <span style={{ fontSize: '1.05rem', fontWeight: 900, color: gold }}>{report.englishLevel}</span>
          <span style={{ fontSize: '.72rem', color: muted }}>{LEVEL_DESC[report.englishLevel]}</span>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          padding: '6px 14px', borderRadius: 100,
          background: isDark ? 'rgba(59,130,246,.1)' : 'rgba(59,130,246,.07)',
          border: '1px solid rgba(59,130,246,.22)',
        }}>
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#3b82f6" strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
          <span style={{ fontSize: '.78rem', fontWeight: 700, color: '#3b82f6' }}>{report.suggestedCourse}</span>
        </div>
      </div>

      {/* Feedback block */}
      <div style={{
        background: surface2, border: `1px solid ${border}`,
        borderRadius: 12, padding: '18px 20px',
        fontSize: '.88rem', color: text, lineHeight: 1.8,
        whiteSpace: 'pre-wrap',
      }}>
        {report.feedback}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span style={{ fontSize: '.72rem', color: muted }}>
          {isAr ? 'أُرسل في' : 'Submitted'}{' '}
          {new Date(report.submittedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </span>
        <button
          onClick={onEdit}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 16px', borderRadius: 9,
            border: `1px solid ${border}`, background: 'none',
            color: muted, fontSize: '.78rem', fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit', transition: 'all .15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = gold; e.currentTarget.style.color = gold }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = muted }}
        >
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
          </svg>
          {isAr ? 'تعديل التقرير' : 'Edit Report'}
        </button>
      </div>
    </div>
  )
}

/* ─── Edit report form ───────────────────────────────────────────────────── */
function EditReportForm({ report, onSaved, onCancel, isAr, isDark, gold, text, muted, border, surface2 }) {
  const [feedback,        setFeedback]        = useState(report.feedback)
  const [englishLevel,    setEnglishLevel]    = useState(report.englishLevel)
  const [suggestedCourse, setSuggestedCourse] = useState(report.suggestedCourse)
  const [saving,          setSaving]          = useState(false)
  const [error,           setError]           = useState('')

  async function save() {
    if (!feedback.trim() || feedback.trim().length < 50) { setError(isAr ? 'التقرير قصير جداً' : 'Feedback too short'); return }
    if (!englishLevel)           { setError(isAr ? 'اختر مستوى اللغة'   : 'Select English level');    return }
    if (!suggestedCourse.trim()) { setError(isAr ? 'أدخل الكورس المقترح' : 'Enter the suggested course'); return }
    setSaving(true); setError('')
    try {
      const res  = await fetch('/api/assessor/reports', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: report.id, feedback, englishLevel, suggestedCourse }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed'); return }
      onSaved(data.report)
    } catch {
      setError(isAr ? 'خطأ في الاتصال' : 'Connection error')
    } finally {
      setSaving(false)
    }
  }

  const inp = { width: '100%', background: surface2, border: `1.5px solid ${border}`, borderRadius: 10, color: text, fontFamily: 'inherit', outline: 'none', transition: 'border-color .15s' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={8}
        style={{ ...inp, padding: '14px 16px', fontSize: '.88rem', lineHeight: 1.7, resize: 'vertical', minHeight: 180 }}
        onFocus={e => { e.target.style.borderColor = gold }} onBlur={e => { e.target.style.borderColor = border }}
      />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {LEVELS.map(lvl => {
          const active = englishLevel === lvl
          return (
            <button key={lvl} type="button" onClick={() => setEnglishLevel(lvl)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
              padding: '10px 18px', borderRadius: 10, cursor: 'pointer',
              background: active ? gold : surface2, border: `1.5px solid ${active ? gold : border}`,
              color: active ? '#fff' : muted, transition: 'all .15s', fontFamily: 'inherit', minWidth: 70,
              boxShadow: active ? '0 3px 12px rgba(201,147,44,.35)' : 'none',
            }}>
              <span style={{ fontSize: '1rem', fontWeight: 900 }}>{lvl}</span>
              <span style={{ fontSize: '.6rem', fontWeight: 600, opacity: .75 }}>{LEVEL_DESC[lvl]}</span>
            </button>
          )
        })}
      </div>
      <input type="text" value={suggestedCourse} onChange={e => setSuggestedCourse(e.target.value)}
        style={{ ...inp, padding: '11px 14px', fontSize: '.88rem' }}
        onFocus={e => { e.target.style.borderColor = gold }} onBlur={e => { e.target.style.borderColor = border }}
      />
      {error && <div style={{ padding: '10px 14px', borderRadius: 9, fontSize: '.82rem', fontWeight: 600, color: '#ef4444', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)' }}>{error}</div>}
      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{ padding: '9px 18px', borderRadius: 9, border: `1px solid ${border}`, background: 'none', color: muted, fontSize: '.83rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
          {isAr ? 'إلغاء' : 'Cancel'}
        </button>
        <button onClick={save} disabled={saving} style={{
          padding: '9px 22px', borderRadius: 9, border: 'none',
          background: saving ? (isDark ? 'rgba(255,255,255,.08)' : '#f3f4f6') : gold,
          color: saving ? muted : '#fff', fontWeight: 700, fontSize: '.83rem',
          cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit',
          boxShadow: saving ? 'none' : '0 3px 12px rgba(201,147,44,.35)',
        }}>
          {saving ? (isAr ? 'جارٍ الحفظ…' : 'Saving…') : (isAr ? 'حفظ التعديلات' : 'Save Changes')}
        </button>
      </div>
    </div>
  )
}

/* ─── Report card wrapper ────────────────────────────────────────────────── */
function ReportCard({ booking, report: initReport, autoOpen, isAr, isDark, onReportChange }) {
  const [open,     setOpen]     = useState(autoOpen)
  const [report,   setReport]   = useState(initReport || null)
  const [editing,  setEditing]  = useState(false)

  const gold    = '#c9932c'
  const text    = isDark ? '#f1f5f9' : '#111827'
  const muted   = isDark ? 'rgba(241,245,249,.55)' : '#6b7280'
  const border  = isDark ? 'rgba(255,255,255,.08)' : '#e5e7eb'
  const surface = isDark ? '#10222b' : '#fff'
  const surface2 = isDark ? '#0a1820' : '#f9fafb'

  const hasReport = !!report
  const statusColor = hasReport ? '#10b981' : '#f59e0b'
  const statusLabel = hasReport
    ? (isAr ? 'تم إرسال التقرير' : 'Report Submitted')
    : (isAr ? 'بانتظار التقرير' : 'Report Pending')

  return (
    <div style={{
      background: surface, border: `1px solid ${border}`,
      borderRadius: 16, overflow: 'hidden',
      boxShadow: isDark ? '0 2px 16px rgba(0,0,0,.35)' : '0 1px 6px rgba(0,0,0,.07)',
      transition: 'box-shadow .18s',
    }}>
      {/* ── Card header (always visible, click to expand) ── */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'none', border: 'none', cursor: 'pointer',
          padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16,
          borderBottom: open ? `1px solid ${border}` : 'none',
          fontFamily: 'inherit', textAlign: isAr ? 'right' : 'left',
          transition: 'background .15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = isDark ? 'rgba(255,255,255,.02)' : 'rgba(201,147,44,.02)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'none' }}
      >
        {/* Status dot */}
        <div style={{
          width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
          background: statusColor,
          boxShadow: `0 0 0 3px ${statusColor}22`,
        }} />

        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 3 }}>
            <span style={{ fontWeight: 800, color: text, fontSize: '.92rem' }}>{booking.studentName}</span>
            <span style={{
              fontSize: '.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 100,
              background: `${statusColor}18`, color: statusColor,
              border: `1px solid ${statusColor}35`,
            }}>{statusLabel}</span>
            {hasReport && (
              <span style={{
                fontSize: '.65rem', fontWeight: 700, padding: '2px 8px', borderRadius: 100,
                background: 'rgba(201,147,44,.1)', color: gold, border: '1px solid rgba(201,147,44,.25)',
              }}>
                {report.englishLevel} · {report.suggestedCourse}
              </span>
            )}
          </div>
          <div style={{ fontSize: '.78rem', color: muted }}>
            {fmtDate(booking.date)} · {slotMinToTime(booking.slotMin)} · {booking.studentEmail}
          </div>
        </div>

        {/* Expand chevron */}
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={muted} strokeWidth="2.5"
          style={{ flexShrink: 0, transition: 'transform .2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {/* ── Expanded body ── */}
      {open && (
        <div style={{ padding: '22px 24px', display: 'flex', flexDirection: 'column', gap: 22, animation: 'rpSlide .18s ease' }}>
          <style>{`@keyframes rpSlide{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}`}</style>

          {/* Session header */}
          <SessionHeader booking={booking} isAr={isAr} isDark={isDark} gold={gold} text={text} muted={muted} border={border} />

          {/* Divider */}
          <div style={{ height: 1, background: border }} />

          {/* Form / View */}
          {!hasReport ? (
            <ReportForm
              booking={booking}
              onSubmitted={r => { setReport(r); onReportChange && onReportChange('submit', booking.id, r) }}
              isAr={isAr} isDark={isDark} gold={gold} text={text} muted={muted} border={border} surface2={surface2}
            />
          ) : editing ? (
            <EditReportForm
              report={report}
              onSaved={r => { setReport(r); setEditing(false); onReportChange && onReportChange('update', booking.id, r) }}
              onCancel={() => setEditing(false)}
              isAr={isAr} isDark={isDark} gold={gold} text={text} muted={muted} border={border} surface2={surface2}
            />
          ) : (
            <ReportView
              report={report} booking={booking}
              onEdit={() => setEditing(true)}
              isAr={isAr} isDark={isDark} gold={gold} text={text} muted={muted} border={border} surface2={surface2}
            />
          )}
        </div>
      )}
    </div>
  )
}

/* ─── Main PendingReports component ─────────────────────────────────────── */
export default function PendingReports({ isAr, isDark }) {
  const [pending,   setPending]   = useState([])
  const [submitted, setSubmitted] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [tab,          setTab]          = useState('pending')
  const [pagePending,  setPagePending]  = useState(1)
  const [pageSubmitted,setPageSubmitted]= useState(1)
  const [dateFrom, setDateFrom]         = useState('')
  const [dateTo, setDateTo]             = useState('')

  const text  = isDark ? '#f1f5f9' : '#111827'
  const muted = isDark ? 'rgba(241,245,249,.55)' : '#6b7280'
  const gold  = '#c9932c'
  const border = isDark ? 'rgba(255,255,255,.08)' : '#e5e7eb'

  useEffect(() => {
    fetch('/api/assessor/reports')
      .then(r => r.ok ? r.json() : { pending: [], submitted: [] })
      .then(d => {
        setPending(d.pending   || [])
        setSubmitted(d.submitted || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function handleReportChange(type, bookingId, report) {
    if (type === 'submit') {
      // Move from pending to submitted
      const booking = pending.find(b => b.id === bookingId)
      if (booking) {
        setPending(prev => prev.filter(b => b.id !== bookingId))
        setSubmitted(prev => [{ ...booking, report }, ...prev])
      }
    }
  }

  const filteredPending   = pending.filter(b => {
    if (dateFrom && b.date < dateFrom) return false
    if (dateTo   && b.date > dateTo)   return false
    return true
  })
  const filteredSubmitted = submitted.filter(b => {
    if (dateFrom && b.date < dateFrom) return false
    if (dateTo   && b.date > dateTo)   return false
    return true
  })

  const prExportCols = [
    { header: 'Student',        value: r => r.studentName || '' },
    { header: 'Date',           value: r => r.date        || '' },
    { header: 'Time',           value: r => slotMinToTime(r.slotMin) },
    { header: 'Status',         value: r => r.report ? 'Submitted' : 'Pending' },
    { header: 'Level',          value: r => r.report?.englishLevel  || '—' },
    { header: 'Suggested Course', value: r => r.report?.suggestedCourse || '—' },
  ]

  const Spinner = () => (
    <div style={{ padding: 60, textAlign: 'center', color: muted }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%', margin: '0 auto 14px',
        border: `3px solid ${isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb'}`,
        borderTopColor: gold, animation: 'rpSpin .7s linear infinite',
      }}/>
      <style>{`@keyframes rpSpin{to{transform:rotate(360deg)}}`}</style>
      {isAr ? 'جارٍ التحميل...' : 'Loading...'}
    </div>
  )

  return (
    <div style={{ padding: '28px 24px', maxWidth: 920, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: text, margin: '0 0 4px' }}>
          {isAr ? 'التقارير' : 'Assessment Reports'}
        </h2>
        <p style={{ fontSize: '.82rem', color: muted, margin: 0 }}>
          {isAr
            ? 'أكمل تقارير التقييم لكل جلسة منتهية'
            : 'Complete an assessment report for each finished session'}
        </p>
      </div>

      {/* Tab toggle */}
      <div style={{
        display: 'inline-flex', gap: 4, padding: 4,
        background: isDark ? 'rgba(255,255,255,.05)' : '#f3f4f6',
        borderRadius: 12, marginBottom: 20,
      }}>
        {[
          { key: 'pending',   en: 'Pending',   ar: 'معلّقة',  badge: pending.length,   color: '#f59e0b' },
          { key: 'submitted', en: 'Submitted',  ar: 'مكتملة', badge: submitted.length, color: '#10b981' },
        ].map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 18px', borderRadius: 9, border: 'none', cursor: 'pointer',
              background: tab === t.key ? (isDark ? '#10222b' : '#fff') : 'none',
              color: tab === t.key ? text : muted,
              fontWeight: tab === t.key ? 700 : 500, fontSize: '.83rem',
              fontFamily: 'inherit',
              boxShadow: tab === t.key ? (isDark ? '0 1px 6px rgba(0,0,0,.4)' : '0 1px 4px rgba(0,0,0,.1)') : 'none',
              transition: 'all .15s',
            }}
          >
            {isAr ? t.ar : t.en}
            {t.badge > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                minWidth: 18, height: 18, borderRadius: 100, fontSize: '.63rem', fontWeight: 800,
                background: tab === t.key ? `${t.color}18` : (isDark ? 'rgba(255,255,255,.08)' : '#e5e7eb'),
                color: tab === t.key ? t.color : muted, border: `1px solid ${tab === t.key ? t.color + '30' : 'transparent'}`,
                padding: '0 4px',
              }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? <Spinner /> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, animation: 'asFadeUp .22s ease' }}>
          {tab === 'pending' ? (
            pending.length === 0 ? (
              <EmptyState
                isAdmin={false}
                title={isAr ? 'لا توجد جلسات بعد' : 'No sessions yet'}
                description={isAr ? 'ستظهر التقارير المعلّقة هنا بعد اكتمال الجلسات.' : 'Pending reports will appear here once sessions are completed.'}
              />
            ) : (
              <>
                <TableToolbar
                  isDark={isDark} isAr={isAr}
                  dateFrom={dateFrom} dateTo={dateTo}
                  onDateChange={(f, t) => { setDateFrom(f); setDateTo(t); setPagePending(1); setPageSubmitted(1) }}
                  exportData={filteredPending}
                  exportCols={prExportCols}
                  exportFilename="pending-reports"
                  exportTitle="Pending Assessment Reports"
                />
                {filteredPending.slice((pagePending-1)*25, pagePending*25).map((booking, i) => (
                  <ReportCard
                    key={booking.id}
                    booking={booking}
                    report={null}
                    autoOpen={i === 0}
                    isAr={isAr}
                    isDark={isDark}
                    onReportChange={handleReportChange}
                  />
                ))}
                <Pagination page={pagePending} total={filteredPending.length} onChange={setPagePending} isDark={isDark} />
              </>
            )
          ) : (
            submitted.length === 0 ? (
              <EmptyState
                isAdmin={false}
                title={isAr ? 'لا توجد تقارير مكتملة بعد' : 'No sessions yet'}
                description={isAr ? 'ستظهر التقارير المكتملة هنا بعد إرسالها.' : 'Completed reports will appear here once submitted.'}
              />
            ) : (
              <>
                <TableToolbar
                  isDark={isDark} isAr={isAr}
                  dateFrom={dateFrom} dateTo={dateTo}
                  onDateChange={(f, t) => { setDateFrom(f); setDateTo(t); setPagePending(1); setPageSubmitted(1) }}
                  exportData={filteredSubmitted}
                  exportCols={prExportCols}
                  exportFilename="submitted-reports"
                  exportTitle="Submitted Assessment Reports"
                />
                {filteredSubmitted.slice((pageSubmitted-1)*25, pageSubmitted*25).map(booking => (
                  <ReportCard
                    key={booking.id}
                    booking={booking}
                    report={booking.report}
                    autoOpen={false}
                    isAr={isAr}
                    isDark={isDark}
                  />
                ))}
                <Pagination page={pageSubmitted} total={filteredSubmitted.length} onChange={setPageSubmitted} isDark={isDark} />
              </>
            )
          )}
        </div>
      )}
    </div>
  )
}
