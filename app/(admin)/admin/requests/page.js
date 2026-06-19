'use client'

import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import EmptyState from '@/components/ui/EmptyState'

const DAYS = [
  { key: 'sat', en: 'Saturday', ar: 'السبت'   },
  { key: 'sun', en: 'Sunday',   ar: 'الأحد'    },
  { key: 'mon', en: 'Monday',   ar: 'الاثنين'  },
  { key: 'tue', en: 'Tuesday',  ar: 'الثلاثاء' },
  { key: 'wed', en: 'Wednesday',ar: 'الأربعاء' },
  { key: 'thu', en: 'Thursday', ar: 'الخميس'  },
  { key: 'fri', en: 'Friday',   ar: 'الجمعة'   },
]

function minutesToLabel(m) {
  const h = Math.floor(m / 60)
  const min = m % 60
  const p = h < 12 ? 'AM' : 'PM'
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${h12}:${min.toString().padStart(2, '0')} ${p}`
}

function StatusBadge({ status }) {
  const MAP = {
    pending:  { color: '#d97706', bg: 'rgba(217,119,6,.1)',  bd: 'rgba(217,119,6,.28)',  label: 'Pending'  },
    approved: { color: '#10b981', bg: 'rgba(16,185,129,.1)', bd: 'rgba(16,185,129,.28)', label: 'Approved' },
    rejected: { color: '#ef4444', bg: 'rgba(239,68,68,.1)',  bd: 'rgba(239,68,68,.28)',  label: 'Rejected' },
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

function ScheduleColumn({ schedule, label }) {
  if (!schedule) return (
    <div>
      <div style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-40)', marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: '.8rem', color: 'var(--text-40)', fontStyle: 'italic' }}>No schedule</div>
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
              <div style={{ fontSize: '.76rem', fontWeight: 700, color: '#c9932c', marginBottom: 4 }}>{day.en}</div>
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
        {activeDays.length === 0 && <div style={{ fontSize: '.8rem', color: 'var(--text-40)', fontStyle: 'italic' }}>No active days</div>}
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
function RequestModal({ req, onClose, onApprove, onReject, actionLoading }) {
  const [rejectNote, setRejectNote] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)

  if (!req) return null
  const isPending = req.status === 'pending'

  return (
    <div
      className="admin-modal"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="admin-modal__box" style={{ maxWidth: 720 }}>
        <div className="admin-modal__header">
          <div>
            <div style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em', color: 'var(--gold)', marginBottom: 3 }}>SCHEDULE CHANGE REQUEST</div>
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
          <StatusBadge status={req.status} />
          <span style={{ fontSize: '.76rem', color: 'var(--text-40)' }}>
            Submitted {new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            {' '}at{' '}
            {new Date(req.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <span style={{ fontSize: '.76rem', fontWeight: 600, color: '#c9932c' }}>
            {countDaysChanged(req.currentSchedule, req.proposedSchedule)} day{countDaysChanged(req.currentSchedule, req.proposedSchedule) !== 1 ? 's' : ''} changed
          </span>
        </div>

        {/* Schedule comparison */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20,
          background: 'var(--bg)', borderRadius: 12, padding: '18px 20px',
          border: '1px solid var(--border)',
        }}>
          <ScheduleColumn schedule={req.currentSchedule} label="CURRENT SCHEDULE" />
          <div style={{ width: 1, background: 'var(--border)' }} />
          <ScheduleColumn schedule={req.proposedSchedule} label="PROPOSED SCHEDULE" />
        </div>

        {/* Reason */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-40)', marginBottom: 6 }}>REASON FOR CHANGE</div>
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
            <div style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-40)', marginBottom: 5 }}>ADMIN NOTE</div>
            <div style={{ fontSize: '.84rem', color: 'var(--text-80)', lineHeight: 1.65 }}>{req.adminNote}</div>
          </div>
        )}

        {req.resolvedAt && (
          <div style={{ fontSize: '.72rem', color: 'var(--text-40)', marginBottom: 16 }}>
            Resolved {new Date(req.resolvedAt).toLocaleString()}
            {req.resolvedByName && ` · by ${req.resolvedByName}`}
          </div>
        )}

        {/* Reject form (inline inside modal) */}
        {showRejectForm && isPending && (
          <div style={{ marginBottom: 16, padding: '16px', background: 'rgba(239,68,68,.04)', borderRadius: 10, border: '1px solid rgba(239,68,68,.15)' }}>
            <div className="admin-field" style={{ marginBottom: 10 }}>
              <label>Rejection reason (optional)</label>
              <textarea
                value={rejectNote}
                onChange={e => setRejectNote(e.target.value)}
                placeholder="Explain why the request is being rejected..."
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
                {actionLoading ? 'Rejecting…' : 'Confirm Reject'}
              </button>
              <button className="admin-btn" onClick={() => setShowRejectForm(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Actions */}
        {isPending && !showRejectForm && (
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 16, borderTop: '1px solid var(--border)' }}>
            <button
              className="admin-btn admin-btn--danger"
              disabled={!!actionLoading}
              onClick={() => setShowRejectForm(true)}
            >
              Reject
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
              {actionLoading ? '…' : (
                <>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Approve
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Main page ─────────────────────────────────────────────────────── */
export default function AdminRequestsPage() {
  const [requests, setRequests]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [selectedReq, setSelectedReq] = useState(null)
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectNote, setRejectNote]   = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast]             = useState(null)

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
      if (!res.ok) { showToast(data.error || 'Action failed', 'error'); return }
      showToast('Request approved successfully')
      setSelectedReq(null)
      await fetchRequests()
    } catch {
      showToast('An error occurred', 'error')
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
      if (!res.ok) { showToast(data.error || 'Action failed', 'error'); return }
      showToast('Request rejected')
      setRejectingId(null)
      setRejectNote('')
      setSelectedReq(null)
      await fetchRequests()
    } catch {
      showToast('An error occurred', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length

  return (
    <AdminLayout>
      <style>{`
        @keyframes adToast{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes adExpand{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
        .req-row { cursor: pointer; transition: background .12s; }
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
          actionLoading={actionLoading}
        />
      )}

      {/* Page header */}
      <div className="admin-header">
        <div>
          <div style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em', color: 'var(--gold)', marginBottom: 4 }}>MANAGEMENT</div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            Slot Requests
            {pendingCount > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', padding: '2px 10px',
                background: 'rgba(217,119,6,.12)', border: '1px solid rgba(217,119,6,.3)',
                borderRadius: 100, fontSize: '.72rem', fontWeight: 700, color: '#d97706',
              }}>
                {pendingCount} pending
              </span>
            )}
          </h1>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-40)' }}>Loading…</div>
      ) : requests.length === 0 ? (
        <EmptyState
          title="No requests yet"
          description="Schedule change requests from assessors will appear here for review."
        />
      ) : (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Assessor</th>
                <th>Submitted</th>
                <th>Days Changed</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
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
                      <div>{new Date(req.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                      <div style={{ fontSize: '.74rem', color: 'var(--text-40)' }}>
                        {new Date(req.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: 700, color: 'var(--gold)' }}>
                        {countDaysChanged(req.currentSchedule, req.proposedSchedule)} days
                      </span>
                    </td>
                    <td><StatusBadge status={req.status} /></td>
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
                            {actionLoading === req.id + 'approve' ? '…' : 'Approve'}
                          </button>
                          <button
                            className="admin-btn admin-btn--danger"
                            disabled={!!actionLoading}
                            onClick={() => { setRejectingId(req.id); setRejectNote('') }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '.78rem', color: 'var(--text-40)' }}>
                          {req.resolvedAt ? new Date(req.resolvedAt).toLocaleDateString() : '—'}
                        </span>
                      )}
                    </td>
                  </tr>

                  {/* Inline reject form (table row) */}
                  {rejectingId === req.id && (
                    <tr key={`${req.id}-reject`}>
                      <td colSpan={5} style={{ padding: 0, borderTop: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
                        <div style={{
                          padding: '16px 20px',
                          background: 'rgba(239,68,68,.04)',
                          borderBottom: '1px solid rgba(239,68,68,.15)',
                          animation: 'adExpand .18s ease',
                        }}>
                          <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
                            Rejection reason <span style={{ color: 'var(--text-40)', fontWeight: 400 }}>(optional)</span>
                          </div>
                          <div className="admin-field" style={{ marginBottom: 10 }}>
                            <textarea
                              value={rejectNote}
                              onChange={e => setRejectNote(e.target.value)}
                              placeholder="Explain why the request is being rejected..."
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
                              {actionLoading === req.id + 'reject' ? 'Rejecting…' : 'Confirm Reject'}
                            </button>
                            <button className="admin-btn" onClick={() => setRejectingId(null)}>Cancel</button>
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
    </AdminLayout>
  )
}
