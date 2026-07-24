'use client'

import { useState, useEffect, useCallback } from 'react'
import EmptyState from '@/components/ui/EmptyState'
import { useLang } from '@/context/LangContext'

const DAYS = [
  { key: 'sat', en: 'Saturday', ar: 'السبت'   },
  { key: 'sun', en: 'Sunday',   ar: 'الأحد'    },
  { key: 'mon', en: 'Monday',   ar: 'الاثنين'  },
  { key: 'tue', en: 'Tuesday',  ar: 'الثلاثاء' },
  { key: 'wed', en: 'Wednesday',ar: 'الأربعاء' },
  { key: 'thu', en: 'Thursday', ar: 'الخميس'  },
  { key: 'fri', en: 'Friday',   ar: 'الجمعة'   },
]

const S = {
  en: {
    sectionLabel: 'MANAGEMENT',
    pageTitle: 'Slot Requests',
    pending: 'pending',
    filterAll: 'All', filterPending: 'Pending', filterApproved: 'Approved', filterRejected: 'Rejected',
    colAssessor: 'Academic Consultant', colSubmitted: 'Submitted', colDays: 'Days Changed', colStatus: 'Status', colActions: 'Actions',
    daysChanged: (n) => `${n} day${n !== 1 ? 's' : ''}`,
    approve: 'Approve', approving: '…',
    reject: 'Reject',
    confirmReject: 'Confirm Reject', rejecting: 'Rejecting…',
    cancel: 'Cancel',
    deleteRequest: 'Delete Request', deleting: 'Deleting…',
    rejectReasonLabel: 'Rejection reason', optional: '(optional)',
    rejectPlaceholder: 'Explain why the request is being rejected…',
    emptyAll: 'No requests yet', emptyAllDesc: 'Schedule change requests from academic consultants will appear here for review.',
    emptyFiltered: (f) => `No ${f.toLowerCase()} requests`,
    emptyFilteredDesc: (f) => `There are no ${f.toLowerCase()} requests at the moment.`,
    loading: 'Loading…',
    toastApproved: 'Request approved successfully',
    toastRejected: 'Request rejected',
    toastDeleted: 'Request deleted',
    toastError: 'An error occurred',
    actionFailed: 'Action failed',
    deleteFailed: 'Delete failed',
    statusPending: 'Pending', statusApproved: 'Approved', statusRejected: 'Rejected',
    modalLabel: 'SCHEDULE CHANGE REQUEST',
    submitted: 'Submitted', at: 'at',
    resolvedAt: 'Resolved', resolvedBy: 'by',
    currentSchedule: 'CURRENT SCHEDULE', proposedSchedule: 'PROPOSED SCHEDULE',
    reasonLabel: 'REASON FOR CHANGE',
    adminNoteLabel: 'ADMIN NOTE',
    noSchedule: 'No schedule', noActiveDays: 'No active days',
  },
  ar: {
    sectionLabel: 'الإدارة',
    pageTitle: 'طلبات الجدول',
    pending: 'معلّق',
    filterAll: 'الكل', filterPending: 'معلّق', filterApproved: 'موافق عليه', filterRejected: 'مرفوض',
    colAssessor: 'المستشار الأكاديمي', colSubmitted: 'تاريخ الإرسال', colDays: 'الأيام المُغيَّرة', colStatus: 'الحالة', colActions: 'الإجراءات',
    daysChanged: (n) => `${n} ${n === 1 ? 'يوم' : 'أيام'}`,
    approve: 'موافقة', approving: '…',
    reject: 'رفض',
    confirmReject: 'تأكيد الرفض', rejecting: 'جارٍ الرفض…',
    cancel: 'إلغاء',
    deleteRequest: 'حذف الطلب', deleting: 'جارٍ الحذف…',
    rejectReasonLabel: 'سبب الرفض', optional: '(اختياري)',
    rejectPlaceholder: 'أوضح سبب رفض الطلب…',
    emptyAll: 'لا توجد طلبات بعد', emptyAllDesc: 'ستظهر هنا طلبات تغيير الجدول من المستشارين الأكاديميين.',
    emptyFiltered: (f) => `لا توجد طلبات ${f}`,
    emptyFilteredDesc: () => 'لا توجد طلبات في هذه الفئة حالياً.',
    loading: 'جارٍ التحميل…',
    toastApproved: 'تمت الموافقة على الطلب',
    toastRejected: 'تم رفض الطلب',
    toastDeleted: 'تم حذف الطلب',
    toastError: 'حدث خطأ',
    actionFailed: 'فشل الإجراء',
    deleteFailed: 'فشل الحذف',
    statusPending: 'معلّق', statusApproved: 'موافق عليه', statusRejected: 'مرفوض',
    modalLabel: 'طلب تغيير الجدول',
    submitted: 'أُرسل في', at: 'الساعة',
    resolvedAt: 'تمت المعالجة', resolvedBy: 'بواسطة',
    currentSchedule: 'الجدول الحالي', proposedSchedule: 'الجدول المقترح',
    reasonLabel: 'سبب التغيير',
    adminNoteLabel: 'ملاحظة المسؤول',
    noSchedule: 'لا يوجد جدول', noActiveDays: 'لا توجد أيام نشطة',
  },
}

function minutesToLabel(m) {
  const h = Math.floor(m / 60)
  const min = m % 60
  const p = h < 12 ? 'AM' : 'PM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${min.toString().padStart(2, '0')} ${p}`
}

function StatusBadge({ status, s }) {
  const MAP = {
    pending:  { color: '#d97706', bg: 'rgba(217,119,6,.1)',  bd: 'rgba(217,119,6,.28)',  label: s.statusPending  },
    approved: { color: '#10b981', bg: 'rgba(16,185,129,.1)', bd: 'rgba(16,185,129,.28)', label: s.statusApproved },
    rejected: { color: '#ef4444', bg: 'rgba(239,68,68,.1)',  bd: 'rgba(239,68,68,.28)',  label: s.statusRejected },
  }
  const cfg = MAP[status] || MAP.pending
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 100,
      background: cfg.bg, border: `1px solid ${cfg.bd}`,
      fontSize: '.72rem', fontWeight: 700, color: cfg.color,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, flexShrink: 0, display: 'inline-block' }} />
      {cfg.label}
    </span>
  )
}

function ScheduleColumn({ schedule, label, s, isAr }) {
  if (!schedule) return (
    <div>
      <div style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-40)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: '.8rem', color: 'var(--text-40)', fontStyle: 'italic' }}>{s.noSchedule}</div>
    </div>
  )
  const activeDays = DAYS.filter(d => (schedule[d.key] || []).length > 0)
  return (
    <div>
      <div style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-40)', marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {activeDays.map(day => {
          const slots = (schedule[day.key] || []).sort((a, b) => a - b)
          return (
            <div key={day.key}>
              <div style={{ fontSize: '.76rem', fontWeight: 700, color: '#c9932c', marginBottom: 4 }}>{isAr ? day.ar : day.en}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {slots.map(slot => (
                  <span key={slot} style={{
                    fontSize: '.64rem', direction: 'ltr',
                    background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.22)',
                    borderRadius: 100, padding: '2px 8px', color: '#c9932c', fontWeight: 600,
                  }}>
                    {minutesToLabel(slot)}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
        {activeDays.length === 0 && <div style={{ fontSize: '.8rem', color: 'var(--text-40)', fontStyle: 'italic' }}>{s.noActiveDays}</div>}
      </div>
    </div>
  )
}

function countDaysChanged(current, proposed) {
  if (!current) return DAYS.filter(d => (proposed?.[d.key] || []).length > 0).length
  let changed = 0
  for (const day of DAYS) {
    const c = JSON.stringify((current[day.key] || []).sort())
    const p = JSON.stringify((proposed?.[day.key] || []).sort())
    if (c !== p) changed++
  }
  return changed
}

/* ─── Request detail modal ─────────────────────────────────────────── */
function RequestModal({ req, onClose, onApprove, onReject, onDelete, actionLoading, s, isAr, lang }) {
  const [rejectNote, setRejectNote]       = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  if (!req) return null
  const isPending  = req.status === 'pending'
  const isResolved = req.status === 'approved' || req.status === 'rejected'
  const daysN = countDaysChanged(req.currentSchedule, req.proposedSchedule)
  const locale = lang === 'ar' ? 'ar-SA' : 'en-US'

  return (
    <div
      className="admin-modal"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="admin-modal__box" style={{ maxWidth: 720 }}>
        <div className="admin-modal__header">
          <div>
            <div style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em', color: 'var(--gold)', marginBottom: 3 }}>
              {s.modalLabel}
            </div>
            <div className="admin-modal__title">{req.assessorName}</div>
            <div style={{ fontSize: '.78rem', color: 'var(--text-40)', marginTop: 2 }}>{req.assessorEmail}</div>
          </div>
          <button className="admin-modal__close" onClick={onClose} aria-label="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Status + meta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <StatusBadge status={req.status} s={s} />
          <span style={{ fontSize: '.76rem', color: 'var(--text-40)' }}>
            {s.submitted} {new Date(req.createdAt).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}
            {' '}{s.at}{' '}
            {new Date(req.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span style={{ fontSize: '.76rem', fontWeight: 600, color: '#c9932c' }}>
            {s.daysChanged(daysN)}
          </span>
        </div>

        {/* Schedule comparison */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20,
          background: 'var(--bg)', borderRadius: 12, padding: '18px 20px',
          border: '1px solid var(--border)',
        }}>
          <ScheduleColumn schedule={req.currentSchedule}  label={s.currentSchedule}  s={s} isAr={isAr} />
          <div style={{ width: 1, background: 'var(--border)' }} />
          <ScheduleColumn schedule={req.proposedSchedule} label={s.proposedSchedule} s={s} isAr={isAr} />
        </div>

        {/* Reason */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-40)', marginBottom: 6 }}>
            {s.reasonLabel}
          </div>
          <div style={{ fontSize: '.88rem', color: 'var(--text-80)', lineHeight: 1.7, background: 'var(--bg)', borderRadius: 9, padding: '12px 14px', border: '1px solid var(--border)' }}>
            {req.reason}
          </div>
        </div>

        {/* Admin note (if resolved) */}
        {req.adminNote && (
          <div style={{
            marginBottom: 16, padding: '12px 14px', borderRadius: 9,
            background: req.status === 'rejected' ? 'rgba(239,68,68,.06)' : 'rgba(16,185,129,.06)',
            border: `1px solid ${req.status === 'rejected' ? 'rgba(239,68,68,.2)' : 'rgba(16,185,129,.2)'}`,
          }}>
            <div style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-40)', marginBottom: 5 }}>
              {s.adminNoteLabel}
            </div>
            <div style={{ fontSize: '.84rem', color: 'var(--text-80)', lineHeight: 1.65 }}>{req.adminNote}</div>
          </div>
        )}

        {req.resolvedAt && (
          <div style={{ fontSize: '.72rem', color: 'var(--text-40)', marginBottom: 16 }}>
            {s.resolvedAt} {new Date(req.resolvedAt).toLocaleString(locale)}
            {req.resolvedByName && ` · ${s.resolvedBy} ${req.resolvedByName}`}
          </div>
        )}

        {/* Inline reject form */}
        {showRejectForm && isPending && (
          <div style={{ marginBottom: 16, padding: '16px', background: 'rgba(239,68,68,.04)', borderRadius: 10, border: '1px solid rgba(239,68,68,.15)' }}>
            <div className="admin-field" style={{ marginBottom: 10 }}>
              <label>
                {s.rejectReasonLabel}{' '}
                <span style={{ color: 'var(--text-40)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>{s.optional}</span>
              </label>
              <textarea
                value={rejectNote}
                onChange={e => setRejectNote(e.target.value)}
                placeholder={s.rejectPlaceholder}
                rows={3}
              />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                className="admin-btn admin-btn--danger"
                disabled={!!actionLoading}
                onClick={() => onReject(req.id, rejectNote)}
                style={{ opacity: actionLoading ? .6 : 1 }}
              >
                {actionLoading ? s.rejecting : s.confirmReject}
              </button>
              <button className="admin-btn" onClick={() => setShowRejectForm(false)}>{s.cancel}</button>
            </div>
          </div>
        )}

        {/* Footer actions */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--border)', gap: 10, flexWrap: 'wrap' }}>
          {isResolved && (
            <button
              className="admin-btn admin-btn--danger"
              disabled={!!actionLoading}
              onClick={() => onDelete(req.id)}
              style={{ opacity: actionLoading ? .6 : 1, display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
              </svg>
              {actionLoading === req.id + 'delete' ? s.deleting : s.deleteRequest}
            </button>
          )}
          {!isResolved && <div />}

          {isPending && !showRejectForm && (
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="admin-btn admin-btn--danger"
                disabled={!!actionLoading}
                onClick={() => setShowRejectForm(true)}
              >
                {s.reject}
              </button>
              <button
                disabled={!!actionLoading}
                onClick={() => onApprove(req.id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '7px 20px', borderRadius: 8,
                  background: actionLoading ? '#6ee7b7' : '#10b981',
                  color: '#fff', border: 'none', fontWeight: 700, fontSize: '.84rem',
                  cursor: actionLoading ? 'default' : 'pointer', fontFamily: 'inherit',
                  transition: 'background .15s', opacity: actionLoading ? .7 : 1,
                }}
                onMouseEnter={e => { if (!actionLoading) e.currentTarget.style.background = '#059669' }}
                onMouseLeave={e => { if (!actionLoading) e.currentTarget.style.background = '#10b981' }}
              >
                {actionLoading ? s.approving : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {s.approve}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Schedule limits config card ───────────────────────────────────── */
function ScheduleLimitsCard({ isAr }) {
  const [limits, setLimits] = useState({ minDays: 2, maxDays: 5, minSlots: 4, maxSlots: 32 })
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState(null)
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState(null)

  useEffect(() => {
    fetch('/api/admin/schedule-limits')
      .then(r => r.json())
      .then(d => { if (d.limits) setLimits(d.limits) })
      .catch(() => {})
  }, [])

  function openEdit() {
    setDraft({ ...limits })
    setMsg(null)
    setOpen(true)
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/schedule-limits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(draft),
      })
      const data = await res.json()
      if (!res.ok) { setMsg({ text: data.error || 'Save failed', ok: false }); return }
      setLimits(data.limits)
      setOpen(false)
      setMsg({ text: isAr ? 'تم الحفظ' : 'Saved', ok: true })
      setTimeout(() => setMsg(null), 3000)
    } catch {
      setMsg({ text: isAr ? 'خطأ' : 'Error', ok: false })
    } finally {
      setSaving(false)
    }
  }

  const labelStyle = { fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-40)', marginBottom: 4 }
  const valStyle   = { fontSize: '.88rem', fontWeight: 700, color: 'var(--text)' }

  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 20px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <span style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.1em', color: 'var(--gold)' }}>
            {isAr ? 'حدود الجدول' : 'SCHEDULE LIMITS'}
          </span>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { l: isAr ? 'أيام (حد أدنى)' : 'Min Days',   v: limits.minDays  },
              { l: isAr ? 'أيام (حد أقصى)' : 'Max Days',   v: limits.maxDays  },
              { l: isAr ? 'خانات (حد أدنى)' : 'Min Slots', v: limits.minSlots },
              { l: isAr ? 'خانات (حد أقصى)' : 'Max Slots', v: limits.maxSlots },
            ].map(({ l, v }) => (
              <div key={l} style={{ textAlign: 'center' }}>
                <div style={labelStyle}>{l}</div>
                <div style={valStyle}>{v}</div>
              </div>
            ))}
          </div>
        </div>
        <button className="admin-btn" onClick={openEdit}>
          {isAr ? 'تعديل' : 'Edit'}
        </button>
      </div>

      {msg && (
        <div style={{ marginTop: 10, fontSize: '.8rem', fontWeight: 600, color: msg.ok ? '#10b981' : '#ef4444' }}>
          {msg.text}
        </div>
      )}

      {open && draft && (
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 12 }}>
          {[
            { key: 'minDays',  label: isAr ? 'أيام (حد أدنى)' : 'Min Days'   },
            { key: 'maxDays',  label: isAr ? 'أيام (حد أقصى)' : 'Max Days'   },
            { key: 'minSlots', label: isAr ? 'خانات (حد أدنى)' : 'Min Slots' },
            { key: 'maxSlots', label: isAr ? 'خانات (حد أقصى)' : 'Max Slots' },
          ].map(({ key, label }) => (
            <div key={key} className="admin-field">
              <label>{label}</label>
              <input
                type="number"
                min={1}
                value={draft[key]}
                onChange={e => setDraft(d => ({ ...d, [key]: parseInt(e.target.value, 10) || 1 }))}
              />
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, gridColumn: '1 / -1' }}>
            <button className="admin-btn admin-btn--primary" disabled={saving} onClick={save}>
              {saving ? '…' : (isAr ? 'حفظ' : 'Save')}
            </button>
            <button className="admin-btn" onClick={() => setOpen(false)}>{isAr ? 'إلغاء' : 'Cancel'}</button>
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Main page ─────────────────────────────────────────────────────── */
export default function AdminRequestsPage() {
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const s = S[lang] || S.en
  const locale = lang === 'ar' ? 'ar-SA' : 'en-US'

  const FILTERS = [
    { key: 'All',      label: s.filterAll      },
    { key: 'Pending',  label: s.filterPending  },
    { key: 'Approved', label: s.filterApproved },
    { key: 'Rejected', label: s.filterRejected },
  ]

  const [requests, setRequests]           = useState([])
  const [loading, setLoading]             = useState(true)
  const [filter, setFilter]               = useState('All')
  const [selectedReq, setSelectedReq]     = useState(null)
  const [rejectingId, setRejectingId]     = useState(null)
  const [rejectNote, setRejectNote]       = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast]                 = useState(null)

  const fetchRequests = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/slot-requests')
      const data = await res.json()
      setRequests(data.requests || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRequests() }, [fetchRequests])

  function showToast(msg, type = 'success') {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  async function handleApprove(id) {
    setActionLoading(id + 'approve')
    try {
      const res = await fetch('/api/admin/slot-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'approve' }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || s.actionFailed, 'error'); return }
      showToast(s.toastApproved)
      setSelectedReq(null)
      await fetchRequests()
    } catch {
      showToast(s.toastError, 'error')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleReject(id, adminNote) {
    setActionLoading(id + 'reject')
    try {
      const res = await fetch('/api/admin/slot-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action: 'reject', adminNote }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || s.actionFailed, 'error'); return }
      showToast(s.toastRejected)
      setRejectingId(null)
      setRejectNote('')
      setSelectedReq(null)
      await fetchRequests()
    } catch {
      showToast(s.toastError, 'error')
    } finally {
      setActionLoading(null)
    }
  }

  async function handleDelete(id) {
    setActionLoading(id + 'delete')
    try {
      const res = await fetch('/api/admin/slot-requests', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || s.deleteFailed, 'error'); return }
      showToast(s.toastDeleted)
      setSelectedReq(null)
      await fetchRequests()
    } catch {
      showToast(s.toastError, 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length
  const filtered = filter === 'All' ? requests : requests.filter(r => r.status === filter.toLowerCase())

  return (
    <>
      <style>{`
        @keyframes adToast{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes adExpand{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
        .req-row { cursor: pointer; }
        .req-row:hover td { background: rgba(201,147,44,.04) !important; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          background: toast.type === 'success' ? '#10b981' : '#ef4444',
          color: '#fff', padding: '12px 20px', borderRadius: 10,
          fontWeight: 600, fontSize: '.84rem',
          boxShadow: '0 8px 32px rgba(0,0,0,.2)',
          animation: 'adToast .2s ease',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Modal */}
      {selectedReq && (
        <RequestModal
          req={selectedReq}
          onClose={() => setSelectedReq(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onDelete={handleDelete}
          actionLoading={actionLoading}
          s={s} isAr={isAr} lang={lang}
        />
      )}

      {/* Page header */}
      <div className="admin-header">
        <div>
          <div style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em', color: 'var(--gold)', marginBottom: 4 }}>
            {s.sectionLabel}
          </div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {s.pageTitle}
            {pendingCount > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', padding: '2px 10px',
                background: 'rgba(217,119,6,.12)', border: '1px solid rgba(217,119,6,.3)',
                borderRadius: 100, fontSize: '.72rem', fontWeight: 700, color: '#d97706',
              }}>
                {pendingCount} {s.pending}
              </span>
            )}
          </h1>
        </div>
      </div>

      {/* Schedule limits config */}
      <ScheduleLimitsCard isAr={isAr} />

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(({ key, label }) => {
          const count = key === 'All' ? requests.length : requests.filter(r => r.status === key.toLowerCase()).length
          const active = filter === key
          return (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="admin-btn"
              style={{
                background: active ? 'var(--gold)' : 'var(--surface)',
                color: active ? '#fff' : 'var(--text-60)',
                borderColor: active ? 'var(--gold)' : 'var(--border)',
                fontWeight: active ? 700 : 500,
              }}
            >
              {label}
              {count > 0 && (
                <span style={{
                  background: active ? 'rgba(255,255,255,.25)' : 'var(--accent-dim)',
                  borderRadius: 100, padding: '1px 7px', fontSize: '.68rem',
                }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-40)' }}>{s.loading}</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title={filter === 'All' ? s.emptyAll : s.emptyFiltered(FILTERS.find(f => f.key === filter)?.label || filter)}
          description={filter === 'All' ? s.emptyAllDesc : s.emptyFilteredDesc(filter)}
        />
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>{s.colAssessor}</th>
                <th>{s.colSubmitted}</th>
                <th>{s.colDays}</th>
                <th>{s.colStatus}</th>
                <th>{s.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(req => (
                <>
                  <tr
                    key={req.id}
                    className="req-row"
                    onClick={() => setSelectedReq(req)}
                  >
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text)' }}>{req.assessorName}</div>
                      <div style={{ fontSize: '.74rem', color: 'var(--text-40)' }}>{req.assessorEmail}</div>
                    </td>
                    <td>
                      <div>{new Date(req.createdAt).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div style={{ fontSize: '.74rem', color: 'var(--text-40)' }}>
                        {new Date(req.createdAt).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--gold)' }}>
                        {s.daysChanged(countDaysChanged(req.currentSchedule, req.proposedSchedule))}
                      </span>
                    </td>
                    <td><StatusBadge status={req.status} s={s} /></td>
                    <td onClick={e => e.stopPropagation()}>
                      {req.status === 'pending' ? (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <button
                            disabled={!!actionLoading}
                            onClick={() => handleApprove(req.id)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '6px 14px', borderRadius: 7,
                              background: actionLoading === req.id + 'approve' ? '#6ee7b7' : '#10b981',
                              color: '#fff', border: 'none', fontWeight: 600, fontSize: '.78rem',
                              cursor: actionLoading ? 'default' : 'pointer', fontFamily: 'inherit',
                              transition: 'background .15s',
                              opacity: actionLoading === req.id + 'approve' ? .7 : 1,
                            }}
                            onMouseEnter={e => { if (!actionLoading) e.currentTarget.style.background = '#059669' }}
                            onMouseLeave={e => { if (!actionLoading) e.currentTarget.style.background = '#10b981' }}
                          >
                            {actionLoading === req.id + 'approve' ? s.approving : s.approve}
                          </button>
                          <button
                            className="admin-btn admin-btn--danger"
                            disabled={!!actionLoading}
                            onClick={() => { setRejectingId(req.id); setRejectNote('') }}
                          >
                            {s.reject}
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '.78rem', color: 'var(--text-40)' }}>
                            {req.resolvedAt ? new Date(req.resolvedAt).toLocaleDateString(locale) : '—'}
                          </span>
                          <button
                            className="admin-btn admin-btn--danger"
                            disabled={!!actionLoading}
                            onClick={() => handleDelete(req.id)}
                            style={{ padding: '4px 10px', opacity: actionLoading === req.id + 'delete' ? .6 : 1 }}
                            title={s.deleteRequest}
                          >
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/>
                            </svg>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>

                  {/* Inline reject form */}
                  {rejectingId === req.id && (
                    <tr key={`${req.id}-reject`}>
                      <td colSpan={5} style={{ padding: 0, borderTop: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
                        <div style={{
                          padding: '16px 20px',
                          background: 'rgba(239,68,68,.04)',
                          animation: 'adExpand .18s ease',
                        }}>
                          <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
                            {s.rejectReasonLabel}{' '}
                            <span style={{ color: 'var(--text-40)', fontWeight: 400 }}>{s.optional}</span>
                          </div>
                          <div className="admin-field" style={{ marginBottom: 10 }}>
                            <textarea
                              value={rejectNote}
                              onChange={e => setRejectNote(e.target.value)}
                              placeholder={s.rejectPlaceholder}
                              rows={2}
                              style={{ minHeight: 60 }}
                            />
                          </div>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              className="admin-btn admin-btn--danger"
                              disabled={!!actionLoading}
                              onClick={() => handleReject(req.id, rejectNote)}
                              style={{ opacity: actionLoading === req.id + 'reject' ? .6 : 1 }}
                            >
                              {actionLoading === req.id + 'reject' ? s.rejecting : s.confirmReject}
                            </button>
                            <button className="admin-btn" onClick={() => setRejectingId(null)}>{s.cancel}</button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
