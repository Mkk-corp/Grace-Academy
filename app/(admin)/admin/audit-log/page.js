'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'

/* ─── i18n ─────────────────────────────────────────────────────────────── */
const S = {
  en: {
    title:         'Activity Log',
    subtitle:      'A clear record of everything that happens on the portal',
    locked:        'Protected Section',
    lockedSub:     'Enter your admin password to view the activity log.',
    pwdPlaceholder:'Admin password',
    unlock:        'Unlock',
    wrongPwd:      'Incorrect password — please try again.',
    filterRole:    'All User Types',
    filterAction:  'All Activity',
    filterSearch:  'Search by name, action, or keyword…',
    dateFrom:      'From date',
    dateTo:        'To date',
    clear:         'Clear filters',
    apply:         'Search',
    colTime:       'When',
    colActor:      'Who',
    colRole:       'User Type',
    colAction:     'What Happened',
    colEntity:     'Related To',
    colMeta:       'Details',
    empty:         'No activity found for the selected filters.',
    loading:       'Loading activity log…',
    prev:          '← Previous',
    next:          'Next →',
    of:            'of',
    page:          'Page',
    records:       'entries',
  },
  ar: {
    title:         'سجل النشاط',
    subtitle:      'سجل واضح لكل ما يحدث على البوابة',
    locked:        'قسم محمي',
    lockedSub:     'أدخل كلمة مرور المشرف للاطلاع على سجل النشاط.',
    pwdPlaceholder:'كلمة مرور المشرف',
    unlock:        'فتح',
    wrongPwd:      'كلمة المرور غير صحيحة — يرجى المحاولة مرة أخرى.',
    filterRole:    'جميع أنواع المستخدمين',
    filterAction:  'جميع الأنشطة',
    filterSearch:  'بحث بالاسم أو النشاط…',
    dateFrom:      'من تاريخ',
    dateTo:        'إلى تاريخ',
    clear:         'مسح الفلاتر',
    apply:         'بحث',
    colTime:       'التوقيت',
    colActor:      'من',
    colRole:       'نوع المستخدم',
    colAction:     'ما الذي حدث',
    colEntity:     'المتعلق بـ',
    colMeta:       'التفاصيل',
    empty:         'لا يوجد نشاط يطابق الفلاتر المحددة.',
    loading:       'جارٍ تحميل سجل النشاط…',
    prev:          '→ السابق',
    next:          'التالي ←',
    of:            'من',
    page:          'صفحة',
    records:       'إدخال',
  },
}

/* ─── Human-readable label maps ─────────────────────────────────────────── */
const ACTION_LABELS = {
  'login.success':                 'Signed in successfully',
  'login.failed':                  'Failed sign-in attempt',
  'logout':                        'Signed out',
  'admin.login':                   'Admin signed in',
  'admin.login_failed':            'Failed admin sign-in attempt',
  'admin.logout':                  'Admin signed out',
  'user.registered':               'New account created',
  'user.created':                  'Account created by admin',
  'user.updated':                  'Account updated',
  'user.deleted':                  'Account deleted',
  'user.password_reset':           'Password changed',
  'user.password_reset_requested': 'Password reset requested',
  'profile.updated':               'Profile updated',
  'role.created':                  'New user role created',
  'role.updated':                  'User role updated',
  'role.deleted':                  'User role deleted',
  'booking.created':               'Session booked',
  'booking.recording_added':       'Recording link added to session',
  'schedule.created':              'Availability schedule set',
  'slot_request.submitted':        'Schedule change requested',
  'slot_request.approved':         'Schedule change approved',
  'slot_request.rejected':         'Schedule change declined',
  'schedule_limits.updated':       'Booking rules updated',
  'assessor.preferences_updated':  'Academic Consultant preferences saved',
  'content.created':               'Website content added',
  'content.updated':               'Website content updated',
  'content.deleted':               'Website content removed',
  'contact.submitted':             'Contact message received',
  'report.submitted':              'Assessment report submitted',
  'report.updated':                'Assessment report edited',
}

const ENTITY_LABELS = {
  'Booking':            'Assessment Session',
  'User':               'User Account',
  'Role':               'User Role',
  'SlotRequest':        'Schedule Change Request',
  'ScheduleTemplate':   'Availability Schedule',
  'AssessorPreference': 'Consultant Preferences',
  'AssessmentReport':   'Assessment Report',
  'ContactMessage':     'Contact Message',
  'blog':               'Blog Post',
  'services':           'Service',
  'faq':                'FAQ Item',
  'portfolio':          'Portfolio Item',
  'pricing':            'Pricing Plan',
  'stats':              'Statistics',
  'site_content':       'Website Content',
}

const ROLE_LABELS = {
  'admin':    'Admin',
  'assessor': 'Academic Consultant',
  'teacher':  'Teacher',
  'student':  'Student',
  'user':     'User',
  'visitor':  'Website Visitor',
  'system':   'System',
  'unknown':  'Unknown',
}

/* ─── Filter options (human-readable labels) ────────────────────────────── */
const ACTION_GROUPS = [
  { value: '',                           label: { en: 'All Activity',                    ar: 'جميع الأنشطة' } },
  { value: 'login.success',             label: { en: 'Signed in',                       ar: 'تسجيل دخول' } },
  { value: 'login.failed',              label: { en: 'Failed sign-in attempt',          ar: 'فشل الدخول' } },
  { value: 'logout',                    label: { en: 'Signed out',                      ar: 'تسجيل خروج' } },
  { value: 'admin.login',               label: { en: 'Admin signed in',                 ar: 'دخول مشرف' } },
  { value: 'admin.login_failed',        label: { en: 'Failed admin sign-in',            ar: 'فشل دخول مشرف' } },
  { value: 'admin.logout',              label: { en: 'Admin signed out',                ar: 'خروج مشرف' } },
  { value: 'user.registered',           label: { en: 'New account created',             ar: 'حساب جديد' } },
  { value: 'user.created',              label: { en: 'Account created by admin',        ar: 'إنشاء حساب' } },
  { value: 'user.updated',              label: { en: 'Account updated',                 ar: 'تحديث حساب' } },
  { value: 'user.deleted',              label: { en: 'Account deleted',                 ar: 'حذف حساب' } },
  { value: 'user.password_reset',       label: { en: 'Password changed',               ar: 'تغيير كلمة المرور' } },
  { value: 'profile.updated',           label: { en: 'Profile updated',                ar: 'تحديث الملف الشخصي' } },
  { value: 'role.created',              label: { en: 'New role created',               ar: 'إنشاء دور' } },
  { value: 'role.updated',              label: { en: 'Role updated',                   ar: 'تحديث دور' } },
  { value: 'role.deleted',              label: { en: 'Role deleted',                   ar: 'حذف دور' } },
  { value: 'booking.created',           label: { en: 'Session booked',                 ar: 'حجز جلسة' } },
  { value: 'booking.recording_added',   label: { en: 'Recording link added',           ar: 'رابط التسجيل' } },
  { value: 'schedule.created',          label: { en: 'Availability schedule set',      ar: 'تعيين الجدول' } },
  { value: 'slot_request.submitted',    label: { en: 'Schedule change requested',      ar: 'طلب تغيير الجدول' } },
  { value: 'slot_request.approved',     label: { en: 'Schedule change approved',       ar: 'الموافقة على الجدول' } },
  { value: 'slot_request.rejected',     label: { en: 'Schedule change declined',       ar: 'رفض طلب الجدول' } },
  { value: 'schedule_limits.updated',   label: { en: 'Booking rules updated',          ar: 'قواعد الحجز' } },
  { value: 'assessor.preferences_updated', label: { en: 'Consultant preferences saved', ar: 'تفضيلات المستشار' } },
  { value: 'content.created',           label: { en: 'Website content added',          ar: 'محتوى جديد' } },
  { value: 'content.updated',           label: { en: 'Website content updated',        ar: 'تحديث محتوى' } },
  { value: 'content.deleted',           label: { en: 'Website content removed',        ar: 'حذف محتوى' } },
  { value: 'contact.submitted',         label: { en: 'Contact message received',       ar: 'رسالة تواصل' } },
  { value: 'report.submitted',          label: { en: 'Assessment report submitted',    ar: 'تقرير تقييم' } },
  { value: 'report.updated',            label: { en: 'Assessment report edited',       ar: 'تعديل تقرير' } },
]

const ROLE_OPTIONS = [
  { value: '',         label: { en: 'All User Types',         ar: 'جميع أنواع المستخدمين' } },
  { value: 'admin',    label: { en: 'Admin',                  ar: 'مشرف' } },
  { value: 'assessor', label: { en: 'Academic Consultant',    ar: 'مستشار أكاديمي' } },
  { value: 'teacher',  label: { en: 'Teacher',               ar: 'معلم' } },
  { value: 'student',  label: { en: 'Student',               ar: 'طالب' } },
  { value: 'user',     label: { en: 'User',                  ar: 'مستخدم' } },
  { value: 'visitor',  label: { en: 'Website Visitor',       ar: 'زائر الموقع' } },
  { value: 'system',   label: { en: 'System',                ar: 'نظام' } },
]

/* ─── Action color map ───────────────────────────────────────────────────── */
const ACTION_COLORS = {
  'login.success':                 { bg: 'rgba(16,185,129,.12)',  text: '#10b981', border: 'rgba(16,185,129,.25)' },
  'login.failed':                  { bg: 'rgba(239,68,68,.12)',   text: '#ef4444', border: 'rgba(239,68,68,.25)' },
  'logout':                        { bg: 'rgba(107,114,128,.12)', text: '#6b7280', border: 'rgba(107,114,128,.25)' },
  'admin.login':                   { bg: 'rgba(16,185,129,.12)',  text: '#10b981', border: 'rgba(16,185,129,.25)' },
  'admin.login_failed':            { bg: 'rgba(239,68,68,.12)',   text: '#ef4444', border: 'rgba(239,68,68,.25)' },
  'admin.logout':                  { bg: 'rgba(107,114,128,.12)', text: '#6b7280', border: 'rgba(107,114,128,.25)' },
  'user.registered':               { bg: 'rgba(59,130,246,.12)',  text: '#3b82f6', border: 'rgba(59,130,246,.25)' },
  'user.created':                  { bg: 'rgba(59,130,246,.12)',  text: '#3b82f6', border: 'rgba(59,130,246,.25)' },
  'user.updated':                  { bg: 'rgba(201,147,44,.12)',  text: '#c9932c', border: 'rgba(201,147,44,.25)' },
  'user.deleted':                  { bg: 'rgba(239,68,68,.12)',   text: '#ef4444', border: 'rgba(239,68,68,.25)' },
  'user.password_reset':           { bg: 'rgba(245,158,11,.12)',  text: '#f59e0b', border: 'rgba(245,158,11,.25)' },
  'user.password_reset_requested': { bg: 'rgba(245,158,11,.12)',  text: '#f59e0b', border: 'rgba(245,158,11,.25)' },
  'profile.updated':               { bg: 'rgba(201,147,44,.12)',  text: '#c9932c', border: 'rgba(201,147,44,.25)' },
  'role.created':                  { bg: 'rgba(59,130,246,.12)',  text: '#3b82f6', border: 'rgba(59,130,246,.25)' },
  'role.updated':                  { bg: 'rgba(201,147,44,.12)',  text: '#c9932c', border: 'rgba(201,147,44,.25)' },
  'role.deleted':                  { bg: 'rgba(239,68,68,.12)',   text: '#ef4444', border: 'rgba(239,68,68,.25)' },
  'booking.created':               { bg: 'rgba(139,92,246,.12)',  text: '#8b5cf6', border: 'rgba(139,92,246,.25)' },
  'booking.recording_added':       { bg: 'rgba(139,92,246,.12)',  text: '#8b5cf6', border: 'rgba(139,92,246,.25)' },
  'schedule.created':              { bg: 'rgba(16,185,129,.12)',  text: '#10b981', border: 'rgba(16,185,129,.25)' },
  'slot_request.submitted':        { bg: 'rgba(245,158,11,.12)',  text: '#f59e0b', border: 'rgba(245,158,11,.25)' },
  'slot_request.approved':         { bg: 'rgba(16,185,129,.12)',  text: '#10b981', border: 'rgba(16,185,129,.25)' },
  'slot_request.rejected':         { bg: 'rgba(239,68,68,.12)',   text: '#ef4444', border: 'rgba(239,68,68,.25)' },
  'schedule_limits.updated':       { bg: 'rgba(201,147,44,.12)',  text: '#c9932c', border: 'rgba(201,147,44,.25)' },
  'assessor.preferences_updated':  { bg: 'rgba(20,184,166,.12)',  text: '#14b8a6', border: 'rgba(20,184,166,.25)' },
  'content.created':               { bg: 'rgba(59,130,246,.12)',  text: '#3b82f6', border: 'rgba(59,130,246,.25)' },
  'content.updated':               { bg: 'rgba(201,147,44,.12)',  text: '#c9932c', border: 'rgba(201,147,44,.25)' },
  'content.deleted':               { bg: 'rgba(239,68,68,.12)',   text: '#ef4444', border: 'rgba(239,68,68,.25)' },
  'contact.submitted':             { bg: 'rgba(139,92,246,.12)',  text: '#8b5cf6', border: 'rgba(139,92,246,.25)' },
  'report.submitted':              { bg: 'rgba(16,185,129,.12)',  text: '#10b981', border: 'rgba(16,185,129,.25)' },
  'report.updated':                { bg: 'rgba(201,147,44,.12)',  text: '#c9932c', border: 'rgba(201,147,44,.25)' },
}

function actionChip(action, isDark) {
  const label = ACTION_LABELS[action] || action
  const c = ACTION_COLORS[action] || { bg: isDark ? 'rgba(255,255,255,.06)' : '#f3f4f6', text: isDark ? 'rgba(255,255,255,.55)' : '#6b7280', border: 'transparent' }
  return (
    <span style={{
      display: 'inline-block', padding: '4px 11px', borderRadius: 100, fontSize: '.72rem',
      fontWeight: 700, lineHeight: 1.4,
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
    }}>{label}</span>
  )
}

function roleBadge(role) {
  const ROLE_COLORS = {
    admin:    { bg: 'rgba(201,147,44,.12)', text: '#c9932c' },
    assessor: { bg: 'rgba(59,130,246,.1)',  text: '#3b82f6' },
    teacher:  { bg: 'rgba(139,92,246,.1)',  text: '#8b5cf6' },
    student:  { bg: 'rgba(16,185,129,.1)',  text: '#10b981' },
    system:   { bg: 'rgba(107,114,128,.1)', text: '#6b7280' },
  }
  const c = ROLE_COLORS[role] || ROLE_COLORS.system
  const label = ROLE_LABELS[role] || role || '—'
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 100, fontSize: '.7rem',
      fontWeight: 700, background: c.bg, color: c.text, whiteSpace: 'nowrap',
    }}>{label}</span>
  )
}

/* ─── Human-readable detail formatter ───────────────────────────────────── */
function fmtMetaHuman(action, meta) {
  if (!meta || typeof meta !== 'object') return null
  const m = meta
  const parts = []

  switch (action) {
    case 'login.failed':
      if (m.identifier) parts.push(`Entered: ${m.identifier}`)
      break
    case 'login.success':
    case 'admin.login':
      // no noise needed — "signed in" is self-explanatory
      break
    case 'logout':
    case 'admin.logout':
      break
    case 'user.registered':
      if (m.email) parts.push(`Email: ${m.email}`)
      if (m.source && m.source !== 'website') parts.push(`Via: ${m.source}`)
      break
    case 'user.created':
      if (m.name)  parts.push(`Name: ${m.name}`)
      if (m.email) parts.push(`Email: ${m.email}`)
      break
    case 'user.updated':
      if (m.fields?.length) parts.push(`Fields changed: ${m.fields.join(', ')}`)
      break
    case 'user.deleted':
      if (m.name)  parts.push(`Name: ${m.name}`)
      if (m.email) parts.push(`Email: ${m.email}`)
      break
    case 'user.password_reset':
    case 'user.password_reset_requested':
      if (m.email) parts.push(`Email: ${m.email}`)
      break
    case 'profile.updated':
      if (m.fields?.length) parts.push(`Updated: ${m.fields.join(', ')}`)
      break
    case 'role.created':
      if (m.name) parts.push(`Role name: ${m.name}`)
      if (m.permissions?.length) parts.push(`Permissions: ${m.permissions.length}`)
      break
    case 'role.updated':
      if (m.roleName) parts.push(`Role: ${m.roleName}`)
      if (m.fields?.length) parts.push(`Changed: ${m.fields.join(', ')}`)
      break
    case 'role.deleted':
      if (m.name) parts.push(`Role: ${m.name}`)
      break
    case 'booking.created':
      if (m.studentName) parts.push(`Student: ${m.studentName}`)
      if (m.date)        parts.push(`Date: ${m.date}`)
      break
    case 'booking.recording_added':
      if (m.studentName) parts.push(`Student: ${m.studentName}`)
      if (m.date)        parts.push(`Session date: ${m.date}`)
      break
    case 'schedule.created':
      if (m.totalSlots != null) parts.push(`${m.totalSlots} time slots`)
      if (m.days)               parts.push(`Days: ${m.days}`)
      break
    case 'slot_request.submitted':
      if (m.reason) parts.push(`Reason: ${m.reason}`)
      break
    case 'slot_request.approved':
    case 'slot_request.rejected':
      if (m.assessorName) parts.push(`For: ${m.assessorName}`)
      if (m.adminNote)    parts.push(`Note: ${m.adminNote}`)
      break
    case 'schedule_limits.updated':
      if (m.fields?.length) parts.push(`Updated: ${m.fields.join(', ')}`)
      break
    case 'assessor.preferences_updated':
      if (m.accent)     parts.push(`Accent: ${m.accent}`)
      if (m.topicCount != null) parts.push(`Topics: ${m.topicCount}`)
      break
    case 'content.created':
    case 'content.updated':
    case 'content.deleted':
      if (m.title) parts.push(`"${m.title}"`)
      break
    case 'contact.submitted':
      if (m.email) parts.push(`From: ${m.email}`)
      break
    case 'report.submitted':
      if (m.studentName)    parts.push(`Student: ${m.studentName}`)
      if (m.englishLevel)   parts.push(`Level: ${m.englishLevel}`)
      if (m.suggestedCourse) parts.push(`Course: ${m.suggestedCourse}`)
      break
    case 'report.updated':
      if (m.fields?.length) parts.push(`Updated: ${m.fields.join(', ')}`)
      break
    default:
      // fallback: show key-value pairs but skip noisy internal fields
      Object.entries(m)
        .filter(([k, v]) => !['id','entityId','redirect'].includes(k) && v !== null && v !== undefined && v !== '')
        .slice(0, 4)
        .forEach(([k, v]) => parts.push(`${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`))
  }

  return parts.length ? parts.join('  ·  ') : null
}

function fmtTime(iso) {
  const d = new Date(iso)
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
    hour12: false,
  })
}

/* ─── Password gate ──────────────────────────────────────────────────────── */
function PasswordGate({ s, isDark, onUnlock }) {
  const [pwd,     setPwd]     = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const GOLD = '#c9932c'

  async function submit(e) {
    e.preventDefault()
    if (!pwd) return
    setError('')
    setLoading(true)
    try {
      const res = await fetch('/api/admin/audit-log/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      })
      if (res.ok) { onUnlock(); return }
      setError(s.wrongPwd)
    } catch {
      setError(s.wrongPwd)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', padding: '40px 20px' }}>
      <div style={{
        background: 'var(--surface)', border: '1.5px solid var(--border-gold)',
        borderRadius: 20, padding: '48px 40px', maxWidth: 420, width: '100%',
        textAlign: 'center',
        boxShadow: isDark ? '0 8px 40px rgba(0,0,0,.4)' : '0 8px 40px rgba(0,0,0,.1)',
      }}>
        <div style={{ width: 68, height: 68, borderRadius: 18, margin: '0 auto 24px', background: 'rgba(201,147,44,.1)', border: '1.5px solid rgba(201,147,44,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.14em', color: GOLD, marginBottom: 8 }}>
          ACTIVITY LOG
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text)', marginBottom: 8 }}>
          {s.locked}
        </h2>
        <p style={{ fontSize: '.86rem', color: 'var(--text-60)', marginBottom: 28, lineHeight: 1.6 }}>
          {s.lockedSub}
        </p>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="password" value={pwd} onChange={e => setPwd(e.target.value)}
            placeholder={s.pwdPlaceholder} autoFocus
            style={{
              padding: '12px 16px', borderRadius: 10, fontSize: '.9rem',
              background: 'var(--surface-2)', border: `1.5px solid ${error ? '#ef4444' : 'var(--border)'}`,
              color: 'var(--text)', outline: 'none', width: '100%', fontFamily: 'inherit',
              transition: 'border-color .15s', textAlign: 'center', letterSpacing: '.1em',
            }}
            onFocus={e => { e.target.style.borderColor = GOLD }}
            onBlur={e => { e.target.style.borderColor = error ? '#ef4444' : 'var(--border)' }}
          />
          {error && <div style={{ fontSize: '.8rem', color: '#ef4444', fontWeight: 600 }}>{error}</div>}
          <button
            type="submit" disabled={loading || !pwd}
            style={{
              padding: '12px', borderRadius: 10, border: 'none',
              background: loading || !pwd ? (isDark ? 'rgba(255,255,255,.08)' : '#f3f4f6') : GOLD,
              color: loading || !pwd ? 'var(--text-40)' : '#fff',
              fontWeight: 700, fontSize: '.9rem', cursor: loading || !pwd ? 'default' : 'pointer',
              fontFamily: 'inherit', transition: 'all .15s',
              boxShadow: !loading && pwd ? '0 4px 16px rgba(201,147,44,.35)' : 'none',
            }}
          >
            {loading ? '…' : s.unlock}
          </button>
        </form>
      </div>
    </div>
  )
}

/* ─── Main page ──────────────────────────────────────────────────────────── */
export default function AuditLogPage() {
  const { lang } = useLang()
  const { theme } = useTheme()
  const isAr  = lang === 'ar'
  const isDark = theme === 'dark'
  const s     = S[isAr ? 'ar' : 'en']
  const GOLD  = '#c9932c'

  const [unlocked, setUnlocked] = useState(false)
  const [logs,     setLogs]     = useState([])
  const [total,    setTotal]    = useState(0)
  const [pages,    setPages]    = useState(1)
  const [page,     setPage]     = useState(1)
  const [loading,  setLoading]  = useState(false)

  const [actorRole,  setActorRole]  = useState('')
  const [action,     setAction]     = useState('')
  const [search,     setSearch]     = useState('')
  const [dateFrom,   setDateFrom]   = useState('')
  const [dateTo,     setDateTo]     = useState('')
  const [applied,    setApplied]    = useState({ actorRole: '', action: '', search: '', dateFrom: '', dateTo: '' })

  const fetchLogs = useCallback(async (p = 1, filters = applied) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: p, limit: 50 })
      if (filters.actorRole) params.set('actorRole', filters.actorRole)
      if (filters.action)    params.set('action',    filters.action)
      if (filters.search)    params.set('search',    filters.search)
      if (filters.dateFrom)  params.set('dateFrom',  filters.dateFrom)
      if (filters.dateTo)    params.set('dateTo',    filters.dateTo)
      const res  = await fetch(`/api/admin/audit-log?${params}`)
      const data = await res.json()
      setLogs(data.logs || [])
      setTotal(data.total || 0)
      setPages(data.pages || 1)
      setPage(p)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [applied])

  useEffect(() => {
    if (unlocked) fetchLogs(1, applied)
  }, [unlocked]) // eslint-disable-line

  function applyFilters() {
    const f = { actorRole, action, search, dateFrom, dateTo }
    setApplied(f)
    fetchLogs(1, f)
  }

  function clearFilters() {
    setActorRole(''); setAction(''); setSearch(''); setDateFrom(''); setDateTo('')
    const f = { actorRole: '', action: '', search: '', dateFrom: '', dateTo: '' }
    setApplied(f)
    fetchLogs(1, f)
  }

  const sel = { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--text)', padding: '8px 12px', borderRadius: 8, fontSize: '.83rem', fontFamily: 'inherit', outline: 'none', cursor: 'pointer' }
  const inp = { ...sel, minWidth: 0 }

  if (!unlocked) return <PasswordGate s={s} isDark={isDark} onUnlock={() => setUnlocked(true)} />

  const cols = [s.colTime, s.colActor, s.colRole, s.colAction, s.colEntity, s.colMeta]

  return (
    <div style={{ padding: '28px 28px 60px', maxWidth: 1400, margin: '0 auto', animation: 'adFadeUp .25s ease' }}>
      <style>{`
        @keyframes adFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
        .al-row:hover td { background: var(--accent-dim) !important; }
        .al-row td { transition: background .12s; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
      `}</style>

      {/* ─── Header ─── */}
      <div className="admin-header" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          </div>
          <div>
            <h1 style={{ fontSize: 'clamp(1.1rem,2vw,1.4rem)', fontWeight: 900, color: 'var(--text)', marginBottom: 3 }}>
              {s.title}
            </h1>
            <p style={{ fontSize: '.82rem', color: 'var(--text-60)', margin: 0 }}>{s.subtitle}</p>
          </div>
          <div style={{ marginLeft: 'auto', padding: '6px 14px', borderRadius: 100, background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)', fontSize: '.72rem', fontWeight: 700, color: '#10b981', letterSpacing: '.06em', display: 'flex', alignItems: 'center', gap: 6 }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#10b981"><circle cx="12" cy="12" r="10"/></svg>
            UNLOCKED
          </div>
        </div>
      </div>

      {/* ─── Filters ─── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 160 }}>
          <label style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--text-60)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
            {isAr ? 'نوع المستخدم' : 'User Type'}
          </label>
          <select value={actorRole} onChange={e => setActorRole(e.target.value)} style={sel}>
            {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{isAr ? o.label.ar : o.label.en}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 200 }}>
          <label style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--text-60)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
            {isAr ? 'نوع النشاط' : 'Activity Type'}
          </label>
          <select value={action} onChange={e => setAction(e.target.value)} style={sel}>
            {ACTION_GROUPS.map(o => <option key={o.value} value={o.value}>{isAr ? o.label.ar : o.label.en}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 140 }}>
          <label style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--text-60)', letterSpacing: '.08em', textTransform: 'uppercase' }}>{s.dateFrom}</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inp} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 140 }}>
          <label style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--text-60)', letterSpacing: '.08em', textTransform: 'uppercase' }}>{s.dateTo}</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inp} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, flex: 1, minWidth: 200 }}>
          <label style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--text-60)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
            {isAr ? 'بحث' : 'Search'}
          </label>
          <div style={{ position: 'relative' }}>
            <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-40)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input
              type="text" value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && applyFilters()}
              placeholder={s.filterSearch}
              style={{ ...inp, width: '100%', paddingLeft: 32 }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <button onClick={clearFilters} style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', color: 'var(--text-60)', fontSize: '.83rem', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            {s.clear}
          </button>
          <button onClick={applyFilters} style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: GOLD, color: '#fff', fontSize: '.83rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 2px 10px rgba(201,147,44,.35)' }}>
            {s.apply}
          </button>
        </div>
      </div>

      {/* ─── Stats bar ─── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ fontSize: '.82rem', color: 'var(--text-60)' }}>
          <strong style={{ color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{total.toLocaleString()}</strong>{' '}{s.records}
          {' · '}{s.page} <strong style={{ color: 'var(--text)' }}>{page}</strong> {s.of} <strong style={{ color: 'var(--text)' }}>{pages}</strong>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => fetchLogs(page - 1, applied)} disabled={page <= 1 || loading} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', color: page <= 1 ? 'var(--text-40)' : 'var(--text)', fontSize: '.8rem', fontWeight: 600, cursor: page <= 1 ? 'default' : 'pointer', fontFamily: 'inherit' }}>
            {s.prev}
          </button>
          <button onClick={() => fetchLogs(page + 1, applied)} disabled={page >= pages || loading} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', color: page >= pages ? 'var(--text-40)' : 'var(--text)', fontSize: '.8rem', fontWeight: 600, cursor: page >= pages ? 'default' : 'pointer', fontFamily: 'inherit' }}>
            {s.next}
          </button>
        </div>
      </div>

      {/* ─── Table ─── */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: isDark ? '0 2px 20px rgba(0,0,0,.3)' : '0 1px 8px rgba(0,0,0,.06)' }}>
        {loading ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-60)' }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2" style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
            </svg>
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ marginTop: 12, fontSize: '.84rem' }}>{s.loading}</div>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--accent-dim)', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            </div>
            <div style={{ color: 'var(--text-60)', fontSize: '.88rem' }}>{s.empty}</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.83rem' }}>
              <thead>
                <tr style={{ background: isDark ? 'rgba(255,255,255,.03)' : '#f9fafb', borderBottom: '1px solid var(--border)' }}>
                  {cols.map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: isAr ? 'right' : 'left', fontWeight: 700, fontSize: '.72rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-60)', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map(log => {
                  const detail = fmtMetaHuman(log.action, log.meta)
                  const entityLabel = ENTITY_LABELS[log.entity] || log.entity
                  return (
                    <tr key={log.id} className="al-row">
                      {/* When */}
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', color: 'var(--text-60)', fontVariantNumeric: 'tabular-nums', fontSize: '.78rem', fontFamily: 'monospace' }}>
                        {fmtTime(log.createdAt)}
                      </td>
                      {/* Who */}
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', maxWidth: 160 }}>
                        <div style={{ fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {log.actorName || <span style={{ color: 'var(--text-40)', fontStyle: 'italic' }}>System</span>}
                        </div>
                        {log.ip && (
                          <div style={{ fontSize: '.68rem', color: 'var(--text-40)', marginTop: 2 }}>{log.ip.split(',')[0].trim()}</div>
                        )}
                      </td>
                      {/* User Type */}
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                        {roleBadge(log.actorRole)}
                      </td>
                      {/* What Happened */}
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                        {actionChip(log.action, isDark)}
                      </td>
                      {/* Related To */}
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                        {entityLabel
                          ? <span style={{ fontWeight: 600, color: 'var(--text)', fontSize: '.8rem' }}>{entityLabel}</span>
                          : <span style={{ color: 'var(--text-40)' }}>—</span>
                        }
                      </td>
                      {/* Details */}
                      <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', color: 'var(--text-60)', fontSize: '.78rem', maxWidth: 300 }}>
                        {detail
                          ? <span style={{ lineHeight: 1.5 }}>{detail}</span>
                          : <span style={{ color: 'var(--text-40)' }}>—</span>
                        }
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── Pagination bottom ─── */}
      {pages > 1 && !loading && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20 }}>
          <button onClick={() => fetchLogs(1, applied)} disabled={page <= 1} style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', color: 'var(--text-60)', fontSize: '.8rem', cursor: page <= 1 ? 'default' : 'pointer', fontFamily: 'inherit' }}>«</button>
          <button onClick={() => fetchLogs(page - 1, applied)} disabled={page <= 1} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', color: page <= 1 ? 'var(--text-40)' : 'var(--text)', fontSize: '.8rem', fontWeight: 600, cursor: page <= 1 ? 'default' : 'pointer', fontFamily: 'inherit' }}>{s.prev}</button>
          {Array.from({ length: Math.min(7, pages) }, (_, i) => {
            const p = pages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= pages - 3 ? pages - 6 + i : page - 3 + i
            return (
              <button key={p} onClick={() => fetchLogs(p, applied)} style={{ padding: '7px 12px', borderRadius: 8, border: `1px solid ${p === page ? GOLD : 'var(--border)'}`, background: p === page ? GOLD : 'none', color: p === page ? '#fff' : 'var(--text-60)', fontSize: '.8rem', fontWeight: p === page ? 700 : 400, cursor: 'pointer', fontFamily: 'inherit', minWidth: 36 }}>{p}</button>
            )
          })}
          <button onClick={() => fetchLogs(page + 1, applied)} disabled={page >= pages} style={{ padding: '7px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', color: page >= pages ? 'var(--text-40)' : 'var(--text)', fontSize: '.8rem', fontWeight: 600, cursor: page >= pages ? 'default' : 'pointer', fontFamily: 'inherit' }}>{s.next}</button>
          <button onClick={() => fetchLogs(pages, applied)} disabled={page >= pages} style={{ padding: '7px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'none', color: 'var(--text-60)', fontSize: '.8rem', cursor: page >= pages ? 'default' : 'pointer', fontFamily: 'inherit' }}>»</button>
        </div>
      )}
    </div>
  )
}
