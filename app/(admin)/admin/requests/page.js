'use client'

import { useState, useEffect, useCallback } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'

const DAYS = [
  { key: 'sat', en: 'Sat', ar: 'السبت'   },
  { key: 'sun', en: 'Sun', ar: 'الأحد'    },
  { key: 'mon', en: 'Mon', ar: 'الاثنين'  },
  { key: 'tue', en: 'Tue', ar: 'الثلاثاء' },
  { key: 'wed', en: 'Wed', ar: 'الأربعاء' },
  { key: 'thu', en: 'Thu', ar: 'الخميس'  },
  { key: 'fri', en: 'Fri', ar: 'الجمعة'   },
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
    <span className="badge-unread" style={{ background: cfg.bg, border: `1px solid ${cfg.bd}`, color: cfg.color }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, display: 'inline-block', marginRight: 4 }} />
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
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {activeDays.map(day => {
          const slots = (schedule[day.key] || []).sort((a, b) => a - b)
          return (
            <div key={day.key}>
              <div style={{ fontSize: '.74rem', fontWeight: 700, color: '#c9932c', marginBottom: 3 }}>{day.en}</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                {slots.map(slot => (
                  <span key={slot} style={{ fontSize: '.62rem', direction: 'ltr', background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.22)', borderRadius: 100, padding: '1px 6px', color: '#c9932c', fontWeight: 600 }}>
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
  if (!current || !proposed) return DAYS.filter(d => (proposed?.[d.key] || []).length > 0).length
  let changed = 0
  for (const day of DAYS) {
    const c = JSON.stringify((current[day.key] || []).sort())
    const p = JSON.stringify((proposed[day.key] || []).sort())
    if (c !== p) changed++
  }
  return changed
}

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected']

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('All')
  const [expanded, setExpanded] = useState(null)
  const [rejectingId, setRejectingId] = useState(null)
  const [rejectNote, setRejectNote] = useState('')
  const [actionLoading, setActionLoading] = useState(null)
  const [toast, setToast] = useState(null)

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

  async function handleAction(id, action, adminNote) {
    setActionLoading(id + action)
    try {
      const res = await fetch('/api/admin/slot-requests', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action, adminNote }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error || 'Action failed', 'error'); return }
      showToast(action === 'approve' ? 'Request approved successfully' : 'Request rejected', 'success')
      setRejectingId(null)
      setRejectNote('')
      await fetchRequests()
    } catch (e) {
      showToast('An error occurred', 'error')
    } finally {
      setActionLoading(null)
    }
  }

  const pendingCount = requests.filter(r => r.status === 'pending').length
  const filtered = filter === 'All' ? requests : requests.filter(r => r.status === filter.toLowerCase())

  return (
    <AdminLayout>
      <style>{`
        @keyframes adToast{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
        @keyframes adExpand{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:none}}
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

      <div className="admin-header">
        <div>
          <div style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.12em', color: 'var(--gold)', marginBottom: 4 }}>SLOT REQUESTS</div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            Requests
            {pendingCount > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', background: 'rgba(217,119,6,.12)', border: '1px solid rgba(217,119,6,.3)', borderRadius: 100, fontSize: '.72rem', fontWeight: 700, color: '#d97706' }}>
                {pendingCount} pending
              </span>
            )}
          </h1>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {FILTERS.map(f => {
          const count = f === 'All' ? requests.length : requests.filter(r => r.status === f.toLowerCase()).length
          const active = filter === f
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="admin-btn"
              style={{
                background: active ? 'var(--gold)' : 'var(--surface)',
                color: active ? '#fff' : 'var(--text-60)',
                borderColor: active ? 'var(--gold)' : 'var(--border)',
                fontWeight: active ? 700 : 500,
              }}
            >
              {f}
              {count > 0 && (
                <span style={{ background: active ? 'rgba(255,255,255,.25)' : 'var(--accent-dim)', borderRadius: 100, padding: '1px 7px', fontSize: '.68rem' }}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {loading ? (
        <div style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-40)' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '56px 32px', textAlign: 'center' }}>
          <div style={{ fontSize: '.88rem', color: 'var(--text-40)' }}>No {filter !== 'All' ? filter.toLowerCase() : ''} requests found.</div>
        </div>
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
              {filtered.map(req => (
                <>
                  <tr
                    key={req.id}
                    onClick={() => setExpanded(expanded === req.id ? null : req.id)}
                    style={{ cursor: 'pointer' }}
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
                            className="admin-btn admin-btn--primary"
                            disabled={!!actionLoading}
                            onClick={() => handleAction(req.id, 'approve')}
                            style={{ opacity: actionLoading === req.id + 'approve' ? .6 : 1 }}
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

                  {/* Inline reject form */}
                  {rejectingId === req.id && (
                    <tr key={`${req.id}-reject`}>
                      <td colSpan={5} style={{ padding: 0, borderTop: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '16px 20px', background: 'rgba(239,68,68,.04)', borderBottom: '1px solid rgba(239,68,68,.15)', animation: 'adExpand .18s ease' }}>
                          <div style={{ fontSize: '.8rem', fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Rejection reason (optional)</div>
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
                              onClick={() => handleAction(req.id, 'reject', rejectNote)}
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

                  {/* Expanded detail */}
                  {expanded === req.id && rejectingId !== req.id && (
                    <tr key={`${req.id}-detail`}>
                      <td colSpan={5} style={{ padding: 0, borderTop: '1px solid var(--border)' }}>
                        <div style={{ padding: '24px 24px', background: 'var(--bg)', animation: 'adExpand .18s ease' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 20 }}>
                            <ScheduleColumn schedule={req.currentSchedule} label="CURRENT SCHEDULE" />
                            <ScheduleColumn schedule={req.proposedSchedule} label="PROPOSED SCHEDULE" />
                          </div>

                          <div style={{ padding: '12px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 9, marginBottom: req.adminNote ? 12 : 0 }}>
                            <div style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-40)', marginBottom: 5 }}>REASON</div>
                            <div style={{ fontSize: '.84rem', color: 'var(--text-80)', lineHeight: 1.65 }}>{req.reason}</div>
                          </div>

                          {req.adminNote && (
                            <div style={{ padding: '12px 16px', background: req.status === 'rejected' ? 'rgba(239,68,68,.06)' : 'rgba(16,185,129,.06)', border: `1px solid ${req.status === 'rejected' ? 'rgba(239,68,68,.2)' : 'rgba(16,185,129,.2)'}`, borderRadius: 9 }}>
                              <div style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--text-40)', marginBottom: 5 }}>ADMIN NOTE</div>
                              <div style={{ fontSize: '.84rem', color: 'var(--text-80)', lineHeight: 1.65 }}>{req.adminNote}</div>
                            </div>
                          )}

                          {req.resolvedAt && (
                            <div style={{ marginTop: 12, fontSize: '.72rem', color: 'var(--text-40)' }}>
                              Resolved {new Date(req.resolvedAt).toLocaleString()}
                              {req.resolvedByName && ` · by ${req.resolvedByName}`}
                            </div>
                          )}
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
