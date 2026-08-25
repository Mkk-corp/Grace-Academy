'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import Pagination from '@/components/ui/Pagination'
import TableToolbar from '@/components/ui/TableToolbar'
import { useRouter } from 'next/navigation'
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

function formatDate(dateStr) {
  const [y, mo, d] = dateStr.split('-').map(Number)
  return new Date(y, mo - 1, d).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })
}

function weekdayFromDate(dateStr) {
  const [y, mo, d] = dateStr.split('-').map(Number)
  return new Date(y, mo - 1, d).toLocaleDateString('en-US', { weekday: 'long' })
}

function computeStatus(booking) {
  if (booking.report) return 'done'
  const [y, mo, d] = booking.date.split('-').map(Number)
  const end = new Date(y, mo - 1, d, Math.floor(booking.slotMin / 60), booking.slotMin % 60)
  end.setHours(end.getHours() + 1)
  return new Date() > end ? 'awaiting' : 'upcoming'
}

/* ─── sub-components ──────────────────────────────────────────────── */
function StatusBadge({ status, isDark }) {
  const cfg = {
    done:     { label: 'Done',            dot: '#22c55e', bg: isDark ? 'rgba(34,197,94,.18)'  : 'rgba(34,197,94,.1)',  color: isDark ? '#4ade80' : '#16a34a' },
    upcoming: { label: 'Upcoming',        dot: '#3b82f6', bg: isDark ? 'rgba(59,130,246,.18)' : 'rgba(59,130,246,.1)', color: isDark ? '#60a5fa' : '#1d4ed8' },
    awaiting: { label: 'Awaiting Report', dot: '#f59e0b', bg: isDark ? 'rgba(245,158,11,.18)' : 'rgba(245,158,11,.1)', color: isDark ? '#fbbf24' : '#92400e' },
  }[status] || { label: status, dot: '#9ca3af', bg: 'transparent', color: '#9ca3af' }

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 100,
      background: cfg.bg, color: cfg.color,
      fontSize: '.72rem', fontWeight: 700, letterSpacing: '.04em', whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.dot, flexShrink: 0 }} />
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
    ? { A1: 'rgba(236,72,153,.15)', A2: 'rgba(236,72,153,.15)', B1: 'rgba(59,130,246,.15)', B2: 'rgba(59,130,246,.15)', C1: 'rgba(34,197,94,.15)', C2: 'rgba(16,185,129,.15)' }
    : { A1: 'rgba(219,39,119,.1)',  A2: 'rgba(219,39,119,.1)',  B1: 'rgba(59,130,246,.1)',  B2: 'rgba(59,130,246,.1)',  C1: 'rgba(34,197,94,.1)',  C2: 'rgba(16,185,129,.1)'  }
  return (
    <span style={{
      display: 'inline-flex', padding: '2px 10px', borderRadius: 6,
      background: bg[level] || 'rgba(107,114,128,.12)',
      color: cfg[level] || '#6b7280',
      fontSize: '.75rem', fontWeight: 800, letterSpacing: '.06em',
    }}>
      {level}
    </span>
  )
}

function StatChip({ label, count, dot }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '7px 14px', borderRadius: 10,
      background: 'var(--surface)', border: '1px solid var(--border)',
    }}>
      {dot && <span style={{ width: 7, height: 7, borderRadius: '50%', background: dot }} />}
      <span style={{ fontSize: '.75rem', fontWeight: 700, color: 'var(--text-60)', letterSpacing: '.05em' }}>{label}</span>
      <span style={{ fontSize: '.9rem', fontWeight: 800, color: 'var(--text)', minWidth: 20, textAlign: 'center' }}>{count}</span>
    </div>
  )
}

/* ─── page ────────────────────────────────────────────────────────── */
export default function PlacementTestsPage() {
  const router  = useRouter()
  const { lang } = useLang()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const isAr   = lang === 'ar'

  const [bookings, setBookings] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')
  const [filter,   setFilter]   = useState('all')
  const [search,   setSearch]   = useState('')
  const [page,     setPage]     = useState(1)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo,   setDateTo]   = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/placement-tests')
      if (!res.ok) throw new Error()
      const data = await res.json()
      setBookings(data.bookings || [])
    } catch {
      setError('Failed to load sessions. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  const enriched = useMemo(() =>
    bookings.map(b => ({ ...b, _status: computeStatus(b) })),
    [bookings]
  )

  const stats = useMemo(() => ({
    total:    enriched.length,
    upcoming: enriched.filter(b => b._status === 'upcoming').length,
    awaiting: enriched.filter(b => b._status === 'awaiting').length,
    done:     enriched.filter(b => b._status === 'done').length,
  }), [enriched])

  const filtered = useMemo(() => {
    let list = filter === 'all' ? enriched : enriched.filter(b => b._status === filter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(b =>
        b.studentName.toLowerCase().includes(q) ||
        b.studentEmail.toLowerCase().includes(q) ||
        b.assessorName.toLowerCase().includes(q)
      )
    }
    if (dateFrom) list = list.filter(b => b.date >= dateFrom)
    if (dateTo)   list = list.filter(b => b.date <= dateTo)
    return list
  }, [enriched, filter, search, dateFrom, dateTo])

  const ptExportCols = [
    { header: 'Student',    value: r => r.studentName  || '' },
    { header: 'Email',      value: r => r.studentEmail || '' },
    { header: 'Consultant', value: r => r.assessorName || '' },
    { header: 'Date',       value: r => r.date         || '' },
    { header: 'Weekday',    value: r => weekdayFromDate(r.date) },
    { header: 'Time',       value: r => slotMinToTime(r.slotMin) },
    { header: 'Duration',   value: _  => '60 min' },
    { header: 'Status',     value: r => r._status      || '' },
    { header: 'Level',      value: r => r.report?.englishLevel || '—' },
  ]

  const FILTERS = [
    { key: 'all',      label: 'All',            count: stats.total },
    { key: 'upcoming', label: 'Upcoming',        count: stats.upcoming },
    { key: 'awaiting', label: 'Awaiting Report', count: stats.awaiting },
    { key: 'done',     label: 'Done',            count: stats.done },
  ]

  return (
    <>
      <style>{`
        .pt-row { cursor: pointer; }
        .pt-row:hover td { background: rgba(201,147,44,.04); }
        @keyframes ptSpin { to { transform: rotate(360deg) } }
        .pt-search { width:100%; background:var(--bg); border:1px solid var(--border); border-radius:var(--r); padding:.6rem .9rem .6rem 2.4rem; color:var(--text); font-size:.85rem; font-family:inherit; transition:border-color .15s; outline:none; }
        .pt-search:focus { border-color:var(--gold); }
        .pt-filter-btn { border:1px solid var(--border); background:transparent; border-radius:100px; padding:5px 14px; font-size:.78rem; font-weight:600; cursor:pointer; transition:all .15s; font-family:inherit; white-space:nowrap; }
        .pt-filter-btn:hover { border-color:var(--gold); color:var(--gold); }
        .pt-filter-btn.active { background:var(--gold); color:#fff; border-color:var(--gold); }
      `}</style>

      {/* Header */}
      <div className="admin-header">
        <div>
          <p style={{ fontSize: '.68rem', fontWeight: 800, letterSpacing: '.14em', color: 'var(--gold)', marginBottom: 4 }}>
            MANAGEMENT
          </p>
          <h1>Placement Tests</h1>
          <p style={{ fontSize: '.85rem', color: 'var(--text-60)', marginTop: 4 }}>
            All placement test sessions — view sessions, feedback, and results.
          </p>
        </div>
        <button className="admin-btn" onClick={load} disabled={loading}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13"
            style={{ animation: loading ? 'ptSpin .7s linear infinite' : 'none' }}>
            <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 22, flexWrap: 'wrap' }}>
        <StatChip label="Total" count={stats.total} />
        <StatChip label="Upcoming"        count={stats.upcoming} dot="#3b82f6" />
        <StatChip label="Awaiting Report" count={stats.awaiting} dot="#f59e0b" />
        <StatChip label="Done"            count={stats.done}     dot="#22c55e" />
      </div>

      {/* Filters + Search */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 22, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => { setFilter(f.key); setPage(1) }}
              className={`pt-filter-btn${filter === f.key ? ' active' : ''}`}
              style={{ color: filter === f.key ? '#fff' : 'var(--text-60)' }}>
              {f.label}
              <span style={{
                marginLeft: 6, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 18, height: 18, borderRadius: '50%', fontSize: '.65rem', fontWeight: 800,
                background: filter === f.key ? 'rgba(255,255,255,.2)' : 'var(--surface-2)',
                color: filter === f.key ? '#fff' : 'var(--text-60)',
              }}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
        <div style={{ flex: 1, minWidth: 220, position: 'relative' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14"
            style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-40)', pointerEvents: 'none' }}>
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className="pt-search"
            type="text"
            placeholder="Search by student or consultant name…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
      </div>

      {/* Toolbar */}
      {!loading && !error && enriched.length > 0 && (
        <TableToolbar
          dateFrom={dateFrom} dateTo={dateTo}
          onDateChange={(f, t) => { setDateFrom(f); setDateTo(t); setPage(1) }}
          exportData={filtered}
          exportCols={ptExportCols}
          exportFilename="placement-tests"
          exportTitle="Placement Tests"
          isAr={isAr}
        />
      )}

      {/* Error */}
      {error && (
        <div style={{ padding: '12px 16px', borderRadius: 'var(--r)', background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)', color: '#ef4444', fontSize: '.85rem', marginBottom: 20 }}>
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            border: '3px solid var(--border)', borderTopColor: 'var(--gold)',
            animation: 'ptSpin .7s linear infinite',
          }} />
        </div>
      )}

      {/* Table */}
      {!loading && !error && (
        filtered.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 24px',
            background: 'var(--surface)', borderRadius: 'var(--r-lg)',
            border: '1px solid var(--border)',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" width="48" height="48"
              style={{ color: 'var(--text-40)', marginBottom: 14 }}>
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
              <rect x="8" y="2" width="8" height="4" rx="1"/>
              <line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/>
            </svg>
            <p style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6 }}>No sessions found</p>
            <p style={{ fontSize: '.85rem', color: 'var(--text-60)' }}>
              {search ? 'No sessions match your search.' : 'No placement test sessions have been booked yet.'}
            </p>
          </div>
        ) : (
          <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
            <table className="admin-table" style={{ borderRadius: 0 }}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Consultant</th>
                  <th>Date</th>
                  <th>Weekday</th>
                  <th>Time</th>
                  <th>Duration</th>
                  <th>Status</th>
                  <th>Level</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice((page-1)*25, page*25).map(b => (
                  <tr
                    key={b.id}
                    className="pt-row"
                    onClick={() => router.push(`/admin/placement-tests/${b.id}`)}
                  >
                    {/* Student */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Image
                          src={`/images/avatar-${b.student?.avatar || 'user1'}.svg`}
                          alt={b.studentName}
                          width={34} height={34}
                          style={{ borderRadius: '50%', border: '2px solid rgba(201,147,44,.2)', flexShrink: 0 }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 700, fontSize: '.875rem', color: 'var(--text)', whiteSpace: 'nowrap' }}>
                            {b.studentName}
                          </div>
                          <div style={{ fontSize: '.73rem', color: 'var(--text-40)', marginTop: 1 }}>
                            {b.studentEmail}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Consultant */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Image
                          src={`/images/avatar-${b.assessor?.avatar || 'user1'}.svg`}
                          alt={b.assessorName}
                          width={28} height={28}
                          style={{ borderRadius: '50%', border: '1.5px solid var(--border)', flexShrink: 0 }}
                        />
                        <span style={{ fontWeight: 500, fontSize: '.875rem', color: 'var(--text-80)' }}>
                          {b.assessorName}
                        </span>
                      </div>
                    </td>

                    {/* Date */}
                    <td style={{ whiteSpace: 'nowrap', fontWeight: 500, fontSize: '.84rem' }}>
                      {formatDate(b.date)}
                    </td>

                    {/* Weekday */}
                    <td style={{ color: 'var(--text-60)', fontSize: '.84rem' }}>
                      {weekdayFromDate(b.date)}
                    </td>

                    {/* Time */}
                    <td style={{ whiteSpace: 'nowrap', fontWeight: 600, color: 'var(--gold)', fontSize: '.84rem' }}>
                      {slotMinToTime(b.slotMin)}
                    </td>

                    {/* Duration */}
                    <td style={{ color: 'var(--text-60)', fontSize: '.84rem' }}>
                      60 min
                    </td>

                    {/* Status */}
                    <td>
                      <StatusBadge status={b._status} isDark={isDark} />
                    </td>

                    {/* Level */}
                    <td>
                      <LevelBadge level={b.report?.englishLevel} isDark={isDark} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <Pagination page={page} total={filtered.length} onChange={setPage} />
          </div>
        )
      )}
    </>
  )
}
