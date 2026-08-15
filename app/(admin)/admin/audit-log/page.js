'use client'

import { useState, useEffect, useCallback } from 'react'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'

/* ─── i18n ─────────────────────────────────────────────────────────────── */
const S = {
  en: {
    title:         'Audit Log',
    subtitle:      'Full chronological record of all system activity',
    locked:        'Protected Section',
    lockedSub:     'Enter your admin password to view the audit log.',
    pwdPlaceholder:'Admin password',
    unlock:        'Unlock',
    wrongPwd:      'Incorrect password',
    filterRole:    'All Roles',
    filterAction:  'All Actions',
    filterSearch:  'Search actor, action, entity…',
    dateFrom:      'From',
    dateTo:        'To',
    clear:         'Clear',
    apply:         'Apply',
    colTime:       'Timestamp',
    colActor:      'Actor',
    colRole:       'Role',
    colAction:     'Action',
    colEntity:     'Entity',
    colMeta:       'Details',
    empty:         'No audit records match the current filters.',
    loading:       'Loading audit log…',
    prev:          '← Prev',
    next:          'Next →',
    of:            'of',
    page:          'Page',
    records:       'records',
  },
  ar: {
    title:         'سجل التدقيق',
    subtitle:      'سجل زمني كامل لجميع أنشطة النظام',
    locked:        'قسم محمي',
    lockedSub:     'أدخل كلمة مرور المشرف للاطلاع على سجل التدقيق.',
    pwdPlaceholder:'كلمة مرور المشرف',
    unlock:        'فتح',
    wrongPwd:      'كلمة المرور غير صحيحة',
    filterRole:    'جميع الأدوار',
    filterAction:  'جميع الإجراءات',
    filterSearch:  'بحث عن المستخدم أو الإجراء…',
    dateFrom:      'من',
    dateTo:        'إلى',
    clear:         'مسح',
    apply:         'تطبيق',
    colTime:       'الوقت',
    colActor:      'المستخدم',
    colRole:       'الدور',
    colAction:     'الإجراء',
    colEntity:     'الكيان',
    colMeta:       'التفاصيل',
    empty:         'لا توجد سجلات تطابق الفلاتر الحالية.',
    loading:       'جارٍ تحميل السجل…',
    prev:          '→ السابق',
    next:          'التالي ←',
    of:            'من',
    page:          'صفحة',
    records:       'سجل',
  },
}

/* ─── Action category helpers ───────────────────────────────────────────── */
const ACTION_GROUPS = [
  { value: '',                    label: { en: 'All Actions',      ar: 'جميع الإجراءات' } },
  { value: 'admin.login',         label: { en: 'Admin Login',      ar: 'دخول مشرف' } },
  { value: 'admin.login_failed',  label: { en: 'Login Failed',     ar: 'فشل الدخول' } },
  { value: 'user.created',        label: { en: 'User Created',     ar: 'إنشاء مستخدم' } },
  { value: 'user.updated',        label: { en: 'User Updated',     ar: 'تحديث مستخدم' } },
  { value: 'user.deleted',        label: { en: 'User Deleted',     ar: 'حذف مستخدم' } },
  { value: 'booking.created',     label: { en: 'Booking Created',  ar: 'إنشاء حجز' } },
  { value: 'schedule.created',    label: { en: 'Schedule Set',     ar: 'تعيين جدول' } },
  { value: 'slot_request',        label: { en: 'Slot Requests',    ar: 'طلبات الجدول' } },
  { value: 'schedule_limits',     label: { en: 'Schedule Limits',  ar: 'حدود الجدول' } },
]

const ROLE_OPTIONS = [
  { value: '',         label: { en: 'All Roles',  ar: 'جميع الأدوار' } },
  { value: 'admin',    label: { en: 'Admin',      ar: 'مشرف' } },
  { value: 'assessor', label: { en: 'Assessor',   ar: 'مستشار' } },
  { value: 'teacher',  label: { en: 'Teacher',    ar: 'معلم' } },
  { value: 'student',  label: { en: 'Student',    ar: 'طالب' } },
  { value: 'system',   label: { en: 'System',     ar: 'نظام' } },
]

const ACTION_COLORS = {
  'admin.login':          { bg: 'rgba(16,185,129,.12)',  text: '#10b981', border: 'rgba(16,185,129,.25)' },
  'admin.login_failed':   { bg: 'rgba(239,68,68,.12)',   text: '#ef4444', border: 'rgba(239,68,68,.25)' },
  'user.created':         { bg: 'rgba(59,130,246,.12)',  text: '#3b82f6', border: 'rgba(59,130,246,.25)' },
  'user.updated':         { bg: 'rgba(201,147,44,.12)',  text: '#c9932c', border: 'rgba(201,147,44,.25)' },
  'user.deleted':         { bg: 'rgba(239,68,68,.12)',   text: '#ef4444', border: 'rgba(239,68,68,.25)' },
  'booking.created':      { bg: 'rgba(139,92,246,.12)',  text: '#8b5cf6', border: 'rgba(139,92,246,.25)' },
  'schedule.created':     { bg: 'rgba(16,185,129,.12)',  text: '#10b981', border: 'rgba(16,185,129,.25)' },
  'slot_request.submitted':{ bg: 'rgba(245,158,11,.12)', text: '#f59e0b', border: 'rgba(245,158,11,.25)' },
  'slot_request.approved':{ bg: 'rgba(16,185,129,.12)',  text: '#10b981', border: 'rgba(16,185,129,.25)' },
  'slot_request.rejectd': { bg: 'rgba(239,68,68,.12)',   text: '#ef4444', border: 'rgba(239,68,68,.25)' },
  'schedule_limits.updated':{ bg: 'rgba(201,147,44,.12)',text: '#c9932c', border: 'rgba(201,147,44,.25)' },
}

function actionChip(action, isDark) {
  const c = ACTION_COLORS[action] || { bg: isDark ? 'rgba(255,255,255,.06)' : '#f3f4f6', text: isDark ? 'rgba(255,255,255,.55)' : '#6b7280', border: 'transparent' }
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 100, fontSize: '.72rem',
      fontWeight: 700, letterSpacing: '.04em',
      background: c.bg, color: c.text, border: `1px solid ${c.border}`,
      whiteSpace: 'nowrap',
    }}>{action}</span>
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
  return (
    <span style={{
      display: 'inline-block', padding: '2px 9px', borderRadius: 100, fontSize: '.7rem',
      fontWeight: 700, background: c.bg, color: c.text,
    }}>{role || '—'}</span>
  )
}

function fmtMeta(meta) {
  if (!meta || Object.keys(meta).length === 0) return '—'
  return Object.entries(meta)
    .filter(([, v]) => v !== null && v !== undefined && v !== '')
    .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
    .join(' · ')
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
      const res  = await fetch('/api/admin/audit-log/verify', {
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
        {/* Lock icon */}
        <div style={{
          width: 68, height: 68, borderRadius: 18, margin: '0 auto 24px',
          background: 'rgba(201,147,44,.1)', border: '1.5px solid rgba(201,147,44,.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.14em', color: GOLD, marginBottom: 8 }}>
          AUDIT LOG
        </div>
        <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--text)', marginBottom: 8 }}>
          {s.locked}
        </h2>
        <p style={{ fontSize: '.86rem', color: 'var(--text-60)', marginBottom: 28, lineHeight: 1.6 }}>
          {s.lockedSub}
        </p>
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="password"
            value={pwd}
            onChange={e => setPwd(e.target.value)}
            placeholder={s.pwdPlaceholder}
            autoFocus
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
            type="submit"
            disabled={loading || !pwd}
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

  // Filter state
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
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '16px 20px', marginBottom: 20,
        display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'flex-end',
      }}>
        {/* Role */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 140 }}>
          <label style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--text-60)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
            {isAr ? 'الدور' : 'Role'}
          </label>
          <select value={actorRole} onChange={e => setActorRole(e.target.value)} style={sel}>
            {ROLE_OPTIONS.map(o => <option key={o.value} value={o.value}>{isAr ? o.label.ar : o.label.en}</option>)}
          </select>
        </div>

        {/* Action */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 170 }}>
          <label style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--text-60)', letterSpacing: '.08em', textTransform: 'uppercase' }}>
            {isAr ? 'الإجراء' : 'Action'}
          </label>
          <select value={action} onChange={e => setAction(e.target.value)} style={sel}>
            {ACTION_GROUPS.map(o => <option key={o.value} value={o.value}>{isAr ? o.label.ar : o.label.en}</option>)}
          </select>
        </div>

        {/* Date From */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 140 }}>
          <label style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--text-60)', letterSpacing: '.08em', textTransform: 'uppercase' }}>{s.dateFrom}</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={inp} />
        </div>

        {/* Date To */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, minWidth: 140 }}>
          <label style={{ fontSize: '.68rem', fontWeight: 700, color: 'var(--text-60)', letterSpacing: '.08em', textTransform: 'uppercase' }}>{s.dateTo}</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={inp} />
        </div>

        {/* Search */}
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

        {/* Buttons */}
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
        {/* Pagination top */}
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
                  {[s.colTime, s.colActor, s.colRole, s.colAction, s.colEntity, s.colMeta].map(h => (
                    <th key={h} style={{ padding: '11px 16px', textAlign: isAr ? 'right' : 'left', fontWeight: 700, fontSize: '.72rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-60)', whiteSpace: 'nowrap' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log.id} className="al-row">
                    {/* Timestamp */}
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap', color: 'var(--text-60)', fontVariantNumeric: 'tabular-nums', fontSize: '.78rem', fontFamily: 'monospace' }}>
                      {fmtTime(log.createdAt)}
                    </td>
                    {/* Actor */}
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', maxWidth: 160 }}>
                      <div style={{ fontWeight: 600, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {log.actorName || <span style={{ color: 'var(--text-40)', fontStyle: 'italic' }}>system</span>}
                      </div>
                      {log.actorId && <div style={{ fontSize: '.68rem', color: 'var(--text-40)', marginTop: 2, fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis' }}>{log.actorId.slice(0, 12)}…</div>}
                    </td>
                    {/* Role */}
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                      {roleBadge(log.actorRole)}
                    </td>
                    {/* Action */}
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', whiteSpace: 'nowrap' }}>
                      {actionChip(log.action, isDark)}
                    </td>
                    {/* Entity */}
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                      {log.entity ? (
                        <div>
                          <div style={{ fontWeight: 600, color: 'var(--text)', fontSize: '.8rem' }}>{log.entity}</div>
                          {log.entityId && <div style={{ fontSize: '.68rem', color: 'var(--text-40)', fontFamily: 'monospace', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 120 }}>{log.entityId.slice(0, 14)}…</div>}
                        </div>
                      ) : <span style={{ color: 'var(--text-40)' }}>—</span>}
                    </td>
                    {/* Meta */}
                    <td style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', color: 'var(--text-60)', fontSize: '.76rem', maxWidth: 280, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {fmtMeta(log.meta)}
                    </td>
                  </tr>
                ))}
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
