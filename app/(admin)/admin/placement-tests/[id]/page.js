'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'

/* ─── helpers ─────────────────────────────────────────────────────── */
function slotMinToTime(m) {
  const h = Math.floor(m / 60)
  const min = m % 60
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${String(min).padStart(2, '0')} ${ampm}`
}

function slotMinToEndTime(m) {
  return slotMinToTime(m + 30)
}

function formatDate(dateStr, locale = 'en-US') {
  const [y, mo, d] = dateStr.split('-').map(Number)
  return new Date(y, mo - 1, d).toLocaleDateString(locale, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  })
}

function formatDateShort(dateStr, locale = 'en-US') {
  const [y, mo, d] = dateStr.split('-').map(Number)
  return new Date(y, mo - 1, d).toLocaleDateString(locale, {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function weekdayFromDate(dateStr, locale = 'en-US') {
  const [y, mo, d] = dateStr.split('-').map(Number)
  return new Date(y, mo - 1, d).toLocaleDateString(locale, { weekday: 'long' })
}

function computeStatus(booking) {
  if (booking.report) return 'done'
  const [y, mo, d] = booking.date.split('-').map(Number)
  const end = new Date(y, mo - 1, d, Math.floor(booking.slotMin / 60), booking.slotMin % 60)
  end.setMinutes(end.getMinutes() + 30)
  return new Date() > end ? 'awaiting' : 'upcoming'
}

/* ─── sub-components ──────────────────────────────────────────────── */
function StatusBadge({ status, isDark, large, isAr }) {
  const cfg = {
    done:     {
      label: isAr ? 'مكتملة'          : 'Done',
      dot: '#22c55e', bg: isDark ? 'rgba(34,197,94,.18)'  : 'rgba(34,197,94,.1)',  color: isDark ? '#4ade80' : '#16a34a',
    },
    upcoming: {
      label: isAr ? 'قادمة'            : 'Upcoming',
      dot: '#3b82f6', bg: isDark ? 'rgba(59,130,246,.18)' : 'rgba(59,130,246,.1)', color: isDark ? '#60a5fa' : '#1d4ed8',
    },
    awaiting: {
      label: isAr ? 'بانتظار التقرير' : 'Awaiting Report',
      dot: '#f59e0b', bg: isDark ? 'rgba(245,158,11,.18)' : 'rgba(245,158,11,.1)', color: isDark ? '#fbbf24' : '#92400e',
    },
  }[status] || { label: status, dot: '#9ca3af', bg: 'transparent', color: '#9ca3af' }

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: large ? '6px 14px' : '3px 10px',
      borderRadius: 100, background: cfg.bg, color: cfg.color,
      fontSize: large ? '.82rem' : '.72rem',
      fontWeight: 700, letterSpacing: '.04em', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: large ? 8 : 6, height: large ? 8 : 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
      {cfg.label}
    </span>
  )
}

function LevelBadge({ level, isDark }) {
  if (!level) return <span style={{ color: 'var(--text-40)' }}>—</span>
  const cfg = isDark
    ? { A1: '#f472b6', A2: '#ec4899', B1: '#60a5fa', B2: '#3b82f6', C1: '#4ade80', C2: '#34d399' }
    : { A1: '#be185d', A2: '#9d174d', B1: '#1e40af', B2: '#1d4ed8', C1: '#166534', C2: '#065f46' }
  const bg = isDark
    ? { A1: 'rgba(236,72,153,.18)', A2: 'rgba(236,72,153,.18)', B1: 'rgba(59,130,246,.18)', B2: 'rgba(59,130,246,.18)', C1: 'rgba(34,197,94,.18)', C2: 'rgba(16,185,129,.18)' }
    : { A1: 'rgba(219,39,119,.1)',  A2: 'rgba(219,39,119,.1)',  B1: 'rgba(59,130,246,.1)',  B2: 'rgba(59,130,246,.1)',  C1: 'rgba(34,197,94,.1)',  C2: 'rgba(16,185,129,.1)'  }
  return (
    <span style={{
      display: 'inline-flex', padding: '4px 14px', borderRadius: 8,
      background: bg[level] || 'rgba(107,114,128,.1)',
      color: cfg[level] || 'var(--text-60)',
      fontSize: '1rem', fontWeight: 900, letterSpacing: '.08em',
    }}>
      {level}
    </span>
  )
}

function InfoRow({ label, value, accent }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em', color: 'var(--text-40)', textTransform: 'uppercase', marginBottom: 3 }}>
        {label}
      </div>
      <div style={{ fontSize: '.88rem', color: accent ? 'var(--gold)' : 'var(--text)', fontWeight: accent ? 700 : 500 }}>
        {value || '—'}
      </div>
    </div>
  )
}

function SectionHeader({ icon, title, subtitle }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
      <div style={{
        width: 34, height: 34, borderRadius: 9,
        background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: '.92rem', color: 'var(--text)' }}>{title}</div>
        {subtitle && <div style={{ fontSize: '.75rem', color: 'var(--text-60)', marginTop: 1 }}>{subtitle}</div>}
      </div>
    </div>
  )
}

/* ─── page ────────────────────────────────────────────────────────── */
export default function PlacementTestDetailPage() {
  const { id } = useParams()
  const router  = useRouter()
  const { lang } = useLang()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const isAr   = lang === 'ar'
  const locale  = isAr ? 'ar-SA' : 'en-US'

  const [booking, setBooking] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!id) return
    fetch(`/api/admin/placement-tests/${id}`)
      .then(async r => {
        if (r.status === 404) { router.replace('/admin/placement-tests'); return }
        if (!r.ok) throw new Error()
        const data = await r.json()
        setBooking(data.booking)
      })
      .catch(() => setError(isAr ? 'فشل تحميل تفاصيل الجلسة.' : 'Failed to load session details.'))
      .finally(() => setLoading(false))
  }, [id, router, isAr])

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--gold)', animation: 'ptdSpin .7s linear infinite' }}>
        <style>{`@keyframes ptdSpin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  if (error) return (
    <div style={{ padding: '20px 0' }}>
      <Link href="/admin/placement-tests" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-60)', textDecoration: 'none', fontSize: '.85rem', marginBottom: 20 }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
          <polyline points={isAr ? '9 18 15 12 9 6' : '15 18 9 12 15 6'}/>
        </svg>
        {isAr ? 'العودة إلى اختبارات التحديد' : 'Back to Placement Tests'}
      </Link>
      <div style={{ padding: '16px 20px', borderRadius: 'var(--r)', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.2)', color: '#ef4444' }}>{error}</div>
    </div>
  )

  if (!booking) return null

  const status   = computeStatus(booking)
  const s        = booking.student  || {}
  const a        = booking.assessor || {}
  const report   = booking.report

  const CARD = {
    background: 'var(--surface)',
    borderRadius: 'var(--r-lg)',
    border: '1px solid var(--border)',
    padding: '24px',
  }

  const submittedDateStr = report
    ? new Date(report.submittedAt).toLocaleDateString(locale, { month: 'long', day: 'numeric', year: 'numeric' })
    : ''

  return (
    <>
      <style>{`@keyframes ptdSpin{to{transform:rotate(360deg)}}`}</style>

      {/* Back nav */}
      <Link href="/admin/placement-tests" style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        color: 'var(--text-60)', textDecoration: 'none', fontSize: '.83rem',
        marginBottom: 20, transition: 'color .15s',
      }}
        onMouseEnter={e => { e.currentTarget.style.color = 'var(--gold)' }}
        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-60)' }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" width="14" height="14">
          <polyline points={isAr ? '9 18 15 12 9 6' : '15 18 9 12 15 6'}/>
        </svg>
        {isAr ? 'العودة إلى اختبارات التحديد' : 'Back to Placement Tests'}
      </Link>

      {/* Page header */}
      <div className="admin-header">
        <div>
          <p style={{ fontSize: '.68rem', fontWeight: 800, letterSpacing: '.14em', color: 'var(--gold)', marginBottom: 4 }}>
            {isAr ? 'اختبار التحديد' : 'PLACEMENT TEST'}
          </p>
          <h1 style={{ marginBottom: 6 }}>{isAr ? 'تفاصيل الجلسة' : 'Session Details'}</h1>
          <p style={{ fontSize: '.84rem', color: 'var(--text-60)' }}>
            {formatDate(booking.date, locale)}
          </p>
        </div>
        <StatusBadge status={status} isDark={isDark} isAr={isAr} large />
      </div>

      {/* ── Session Banner ───────────────────────────────────────────── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: 12, marginBottom: 24,
        background: 'var(--surface-2)',
        borderRadius: 'var(--r-lg)', padding: '20px 24px',
        border: '1px solid var(--border)',
      }}>
        {[
          {
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
            label: isAr ? 'التاريخ'     : 'Date',
            value: formatDateShort(booking.date, locale),
          },
          {
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
            label: isAr ? 'الوقت'       : 'Time',
            value: `${slotMinToTime(booking.slotMin)} – ${slotMinToEndTime(booking.slotMin)}`,
          },
          {
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
            label: isAr ? 'المدة'       : 'Duration',
            value: isAr ? '30 دقيقة'   : '30 minutes',
          },
          {
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
            label: isAr ? 'اليوم'       : 'Weekday',
            value: weekdayFromDate(booking.date, locale),
          },
          {
            icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="16" height="16"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
            label: isAr ? 'معرّف الجلسة' : 'Session ID',
            value: booking.id.slice(0, 10) + '…',
          },
        ].map(item => (
          <div key={item.label}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6, color: 'var(--gold)' }}>
              {item.icon}
              <span style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--text-40)' }}>
                {item.label}
              </span>
            </div>
            <div style={{ fontWeight: 600, fontSize: '.88rem', color: 'var(--text)' }}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* ── Student + Assessor side by side ──────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>

        {/* Student card */}
        <div style={CARD}>
          <SectionHeader
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="#c9932c" strokeWidth="1.8" width="16" height="16"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>}
            title={isAr ? 'الطالب'              : 'Student'}
            subtitle={isAr ? 'معلومات الملف الشخصي' : 'Profile information'}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <Image
              src={`/images/avatar-${s.avatar || 'user1'}.svg`}
              alt={s.name || 'Student'}
              width={52} height={52}
              style={{ borderRadius: '50%', border: '2px solid rgba(201,147,44,.25)', flexShrink: 0 }}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}>{s.name || booking.studentName}</div>
              <div style={{ fontSize: '.78rem', color: 'var(--text-60)', marginTop: 2 }}>{s.email || booking.studentEmail}</div>
              {s.city && <div style={{ fontSize: '.75rem', color: 'var(--text-40)', marginTop: 1 }}>{[s.city, s.country].filter(Boolean).join(', ')}</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            <InfoRow label={isAr ? 'تاريخ الميلاد'     : 'Date of Birth'}    value={s.dob} />
            <InfoRow label={isAr ? 'الجنس'             : 'Gender'}           value={s.gender} />
            <InfoRow label={isAr ? 'البلد'             : 'Country'}          value={s.country} />
            <InfoRow label={isAr ? 'المدينة'           : 'City'}             value={s.city} />
            <InfoRow label={isAr ? 'المستوى التعليمي'  : 'Education Level'}  value={s.educationLevel} />
            <InfoRow label={isAr ? 'مستوى الإنجليزية' : 'English Level'}    value={s.englishLevel} />
            <InfoRow label={isAr ? 'دورات سابقة'       : 'Prior Courses'}    value={s.coursesTaken} />
            <InfoRow label={isAr ? 'المستوى المتوقع'   : 'Expected Level'}   value={s.expectedLevel} />
            {s.isEmployed !== null && s.isEmployed !== undefined && (
              <InfoRow
                label={isAr ? 'موظّف' : 'Employed'}
                value={s.isEmployed ? (isAr ? 'نعم' : 'Yes') : (isAr ? 'لا' : 'No')}
              />
            )}
            {s.jobTitle   && <InfoRow label={isAr ? 'المسمى الوظيفي' : 'Job Title'}  value={s.jobTitle} />}
            {s.employer   && <InfoRow label={isAr ? 'جهة العمل'      : 'Employer'}   value={s.employer} />}
            {s.faculty    && <InfoRow label={isAr ? 'الكلية'         : 'Faculty'}    value={s.faculty} />}
            {s.university && <InfoRow label={isAr ? 'الجامعة'        : 'University'} value={s.university} />}
          </div>

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            <Link href={`/admin/users`} target="_blank"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.77rem', color: 'var(--text-60)', textDecoration: 'none', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '5px 10px', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-60)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              {isAr ? 'عرض في قائمة المستخدمين' : 'View in Users'}
            </Link>
          </div>
        </div>

        {/* Assessor card */}
        <div style={CARD}>
          <SectionHeader
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="#c9932c" strokeWidth="1.8" width="16" height="16"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>}
            title={isAr ? 'المستشار الأكاديمي' : 'Academic Consultant'}
            subtitle={isAr ? 'مدير الجلسة'        : 'Session facilitator'}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid var(--border)' }}>
            <Image
              src={`/images/avatar-${a.avatar || 'user1'}.svg`}
              alt={a.name || 'Assessor'}
              width={52} height={52}
              style={{ borderRadius: '50%', border: '2px solid rgba(201,147,44,.25)', flexShrink: 0 }}
            />
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}>{a.name || booking.assessorName}</div>
              <div style={{ fontSize: '.78rem', color: 'var(--text-60)', marginTop: 2 }}>{a.email || booking.assessorEmail}</div>
              {a.city && <div style={{ fontSize: '.75rem', color: 'var(--text-40)', marginTop: 1 }}>{[a.city, a.country].filter(Boolean).join(', ')}</div>}
            </div>
          </div>

          {a.bio && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em', color: 'var(--text-40)', textTransform: 'uppercase', marginBottom: 6 }}>
                {isAr ? 'السيرة الذاتية' : 'Bio'}
              </div>
              <p style={{ fontSize: '.86rem', color: 'var(--text-80)', lineHeight: 1.65, margin: 0 }}>{a.bio}</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
            {a.country && <InfoRow label={isAr ? 'البلد'    : 'Country'} value={a.country} />}
            {a.city    && <InfoRow label={isAr ? 'المدينة'  : 'City'}    value={a.city} />}
            {a.phone   && <InfoRow label={isAr ? 'الهاتف'   : 'Phone'}   value={a.phone} />}
          </div>

          <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
            <Link href="/admin/users" target="_blank"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.77rem', color: 'var(--text-60)', textDecoration: 'none', border: '1px solid var(--border)', borderRadius: 'var(--r)', padding: '5px 10px', transition: 'all .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--gold)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-60)' }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              {isAr ? 'عرض في قائمة المستخدمين' : 'View in Users'}
            </Link>
          </div>
        </div>
      </div>

      {/* ── Session Links ─────────────────────────────────────────────── */}
      <div style={{ ...CARD, marginBottom: 24 }}>
        <SectionHeader
          icon={<svg viewBox="0 0 24 24" fill="none" stroke="#c9932c" strokeWidth="1.8" width="16" height="16"><path d="M15 7h3a5 5 0 0 1 5 5 5 5 0 0 1-5 5h-3m-6 0H6a5 5 0 0 1-5-5 5 5 0 0 1 5-5h3"/><line x1="8" y1="12" x2="16" y2="12"/></svg>}
          title={isAr ? 'روابط الجلسة'          : 'Session Links'}
          subtitle={isAr ? 'غرفة الاجتماع والتسجيل' : 'Meeting room and recording'}
        />
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {booking.meetLink ? (
            <a href={booking.meetLink} target="_blank" rel="noopener noreferrer"
              className="admin-btn admin-btn--primary"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.36a1 1 0 0 1-1.447.889L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"/></svg>
              {isAr ? 'انضم إلى غرفة الاجتماع' : 'Join Meeting Room'}
            </a>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 16px', borderRadius: 'var(--r)', border: '1px dashed var(--border)', color: 'var(--text-40)', fontSize: '.82rem' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14"><path d="M15 10l4.553-2.069A1 1 0 0 1 21 8.82v6.36a1 1 0 0 1-1.447.889L15 14M3 8a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8z"/></svg>
              {isAr ? 'رابط الاجتماع غير متاح' : 'Meet link not available'}
            </div>
          )}

          {booking.recordingLink ? (
            <a href={booking.recordingLink} target="_blank" rel="noopener noreferrer"
              className="admin-btn"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
              {isAr ? 'مشاهدة التسجيل' : 'Watch Recording'}
            </a>
          ) : (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, padding: '7px 16px', borderRadius: 'var(--r)', border: '1px dashed var(--border)', color: 'var(--text-40)', fontSize: '.82rem' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>
              {isAr ? 'التسجيل غير متاح بعد' : 'Recording not yet available'}
            </div>
          )}
        </div>
      </div>

      {/* ── Assessment Report ─────────────────────────────────────────── */}
      {report ? (
        <div style={CARD}>
          <SectionHeader
            icon={<svg viewBox="0 0 24 24" fill="none" stroke="#c9932c" strokeWidth="1.8" width="16" height="16"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>}
            title={isAr ? 'تقرير التقييم' : 'Assessment Report'}
            subtitle={isAr
              ? `أُرسل بواسطة ${report.assessorName || a.name || 'المستشار'} في ${submittedDateStr}`
              : `Submitted by ${report.assessorName || a.name || 'consultant'} on ${submittedDateStr}`}
          />

          {/* Key outcomes */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16, marginBottom: 24,
            padding: '16px 20px',
            background: 'var(--bg)',
            borderRadius: 'var(--r)', border: '1px solid var(--border)',
          }}>
            <div>
              <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em', color: 'var(--text-40)', textTransform: 'uppercase', marginBottom: 8 }}>
                {isAr ? 'المستوى الناتج' : 'Resulted Level'}
              </div>
              <LevelBadge level={report.englishLevel} isDark={isDark} />
            </div>
            <div>
              <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em', color: 'var(--text-40)', textTransform: 'uppercase', marginBottom: 8 }}>
                {isAr ? 'الكورس المقترح' : 'Suggested Course'}
              </div>
              <div style={{ fontWeight: 600, fontSize: '.92rem', color: 'var(--text)' }}>
                {report.suggestedCourse || '—'}
              </div>
            </div>
            <div>
              <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em', color: 'var(--text-40)', textTransform: 'uppercase', marginBottom: 8 }}>
                {isAr ? 'تاريخ الإرسال' : 'Submitted At'}
              </div>
              <div style={{ fontWeight: 500, fontSize: '.88rem', color: 'var(--text-80)' }}>
                {new Date(report.submittedAt).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
            {report.updatedAt && report.updatedAt !== report.submittedAt && (
              <div>
                <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em', color: 'var(--text-40)', textTransform: 'uppercase', marginBottom: 8 }}>
                  {isAr ? 'آخر تحديث' : 'Last Updated'}
                </div>
                <div style={{ fontWeight: 500, fontSize: '.88rem', color: 'var(--text-80)' }}>
                  {new Date(report.updatedAt).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            )}
          </div>

          {/* Written feedback */}
          <div>
            <div style={{ fontSize: '.65rem', fontWeight: 700, letterSpacing: '.12em', color: 'var(--text-40)', textTransform: 'uppercase', marginBottom: 10 }}>
              {isAr ? 'التغذية الراجعة المكتوبة' : 'Written Feedback'}
            </div>
            <div style={{
              background: 'var(--bg)', borderRadius: 'var(--r)',
              border: '1px solid var(--border)',
              padding: '18px 20px',
              fontSize: '.9rem', color: 'var(--text-80)',
              lineHeight: 1.75, whiteSpace: 'pre-wrap',
              fontStyle: 'normal',
            }}>
              {report.feedback}
            </div>
          </div>
        </div>
      ) : (
        <div style={{
          ...CARD,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          padding: '40px 24px', textAlign: 'center',
          border: '1px dashed var(--border)',
          background: 'transparent',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%',
            background: 'rgba(201,147,44,.08)', border: '1px solid rgba(201,147,44,.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 14,
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="1.8" width="22" height="22">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="8" y1="13" x2="16" y2="13"/>
              <line x1="8" y1="17" x2="13" y2="17"/>
            </svg>
          </div>
          <p style={{ fontWeight: 700, color: 'var(--text)', fontSize: '.95rem', marginBottom: 6 }}>
            {isAr ? 'لا يوجد تقرير بعد' : 'No Report Yet'}
          </p>
          <p style={{ fontSize: '.84rem', color: 'var(--text-60)', maxWidth: 340, lineHeight: 1.6 }}>
            {status === 'upcoming'
              ? (isAr
                  ? 'لم تبدأ الجلسة بعد. سيظهر التقرير هنا بمجرد إرساله من المستشار.'
                  : 'The session has not taken place yet. The report will appear here once the consultant submits it.')
              : (isAr
                  ? 'اكتملت هذه الجلسة ولم يُرسل المستشار الأكاديمي تقريراً بعد.'
                  : 'This session has been completed but the academic consultant has not submitted a report yet.')}
          </p>
        </div>
      )}
    </>
  )
}
