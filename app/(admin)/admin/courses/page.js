'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AdminTableSkeleton from '@/components/admin/AdminTableSkeleton'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'
import Pagination from '@/components/ui/Pagination'
import TableToolbar from '@/components/ui/TableToolbar'

const GOLD = '#c9932c'
const PAGE_SIZE = 25

const S = {
  en: {
    title: 'Courses Catalog',
    subtitle: 'Manage all courses offered on the platform',
    addBtn: '+ Add Course',
    colName: 'Course', colSessions: 'Sessions', colSpeaking: 'Speaking',
    colLibrary: 'Library', colTeachers: 'Teachers', colStudents: 'Students',
    colDate: 'Date Added', colActions: 'Actions',
    emptyTitle: 'No courses yet',
    emptyDesc: 'Start building your course catalog. Click "Add Course" to create the first one.',
    emptyAction: 'Add Course',
    delete: 'Delete',
    deleteTitle: 'Delete course',
    deleteMsg: 'Are you sure you want to delete this course? This action cannot be undone.',
    deleteBtn: 'Delete',
    cancel: 'Cancel',
    searchPh: 'Search courses…',
    totalCourses: 'Total courses',
    withSpeaking: 'With speaking',
    sessions: (n) => `${n} session${n !== 1 ? 's' : ''}`,
    yes: 'Yes', no: 'No',
  },
  ar: {
    title: 'كتالوج الدورات',
    subtitle: 'إدارة جميع الدورات المقدَّمة على المنصة',
    addBtn: '+ إضافة دورة',
    colName: 'الدورة', colSessions: 'الجلسات', colSpeaking: 'محادثة',
    colLibrary: 'المكتبة', colTeachers: 'المعلمون', colStudents: 'الطلاب',
    colDate: 'تاريخ الإضافة', colActions: 'الإجراءات',
    emptyTitle: 'لا توجد دورات بعد',
    emptyDesc: 'ابدأ ببناء كتالوج الدورات. اضغط "إضافة دورة" لإنشاء أول دورة.',
    emptyAction: 'إضافة دورة',
    delete: 'حذف',
    deleteTitle: 'حذف الدورة',
    deleteMsg: 'هل أنت متأكد من حذف هذه الدورة؟ لا يمكن التراجع عن هذا الإجراء.',
    deleteBtn: 'حذف',
    cancel: 'إلغاء',
    searchPh: 'ابحث عن دورة…',
    totalCourses: 'إجمالي الدورات',
    withSpeaking: 'تتضمن محادثة',
    sessions: (n) => `${n} جلسة`,
    yes: 'نعم', no: 'لا',
  },
}

export default function CoursesPage() {
  const { lang } = useLang()
  const { theme } = useTheme()
  const router = useRouter()
  const s = S[lang] || S.en
  const isAr  = lang === 'ar'
  const isDark = theme === 'dark'

  const [courses,      setCourses]  = useState([])
  const [loading,      setLoading]  = useState(true)
  const [deleteTarget, setDelete]   = useState(null)
  const [deleteError,  setDelErr]   = useState('')
  const [search,       setSearch]   = useState('')
  const [page,         setPage]     = useState(1)
  const [dateFrom,     setDateFrom] = useState('')
  const [dateTo,       setDateTo]   = useState('')

  function load() {
    return fetch('/api/admin/courses').then(r => r.json()).then(d => {
      setCourses(d.courses || [])
      setLoading(false)
    })
  }
  useEffect(() => { load() }, [])

  async function confirmDelete() {
    if (!deleteTarget) return
    const res = await fetch(`/api/admin/courses/${deleteTarget}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) { setDelErr(data.error || (isAr ? 'فشل الحذف' : 'Delete failed')); return }
    setCourses(prev => prev.filter(c => c.id !== deleteTarget))
    setDelete(null); setDelErr('')
  }

  function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const filtered = courses.filter(c => {
    const matchSearch = !search.trim() ||
      c.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      (c.nameAr || '').includes(search)
    const d = c.createdAt ? c.createdAt.substring(0, 10) : null
    const matchDate = (!dateFrom || (d && d >= dateFrom)) && (!dateTo || (d && d <= dateTo))
    return matchSearch && matchDate
  })

  const exportCols = [
    { header: 'Course (EN)',       value: r => r.nameEn || '' },
    { header: 'Course (AR)',       value: r => r.nameAr || '' },
    { header: 'Sessions',          value: r => r.durationSessions ?? 0 },
    { header: 'Duration (months)', value: r => r.durationMonths ?? '' },
    { header: 'Speaking',          value: r => r.needsSpeaking ? 'Yes' : 'No' },
    { header: 'Speaking Sessions', value: r => r.speakingSessions ?? '' },
    { header: 'Library',           value: r => r.needsLibrary ? 'Yes' : 'No' },
    { header: 'Library Types',     value: r => (r.libraryTypes || []).join(', ') },
    { header: 'Teachers',          value: r => r.teacherCount ?? 0 },
    { header: 'Students',          value: r => r.studentCount ?? 0 },
    { header: 'Date Added',        value: r => r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB') : '' },
  ]

  const withSpeaking = courses.filter(c => c.needsSpeaking).length

  return (
    <>
      {/* Header */}
      <div className="admin-header">
        <div>
          <h1>{s.title}</h1>
          <div style={{ fontSize: '.8rem', color: 'var(--text-60)', marginTop: 2 }}>{s.subtitle}</div>
        </div>
        <button className="admin-btn admin-btn--primary" onClick={() => router.push('/admin/courses/new')}>
          {s.addBtn}
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: s.totalCourses, value: loading ? '…' : courses.length, color: GOLD },
          { label: s.withSpeaking, value: loading ? '…' : withSpeaking,   color: '#3b82f6' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color, lineHeight: 1 }}>{value}</div>
            <div style={{ fontSize: '.76rem', color: 'var(--text-60)', marginTop: 6, fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Table card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>

        {/* Card header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px',
          borderBottom: '1px solid var(--border)',
          background: isDark ? 'rgba(201,147,44,.05)' : 'rgba(201,147,44,.03)',
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="1.8" width="18" height="18">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '.98rem', fontWeight: 700, color: GOLD }}>{s.title}</div>
            <div style={{ fontSize: '.76rem', color: 'var(--text-60)', marginTop: 2 }}>{s.subtitle}</div>
          </div>
        </div>

        {/* Search + toolbar */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 320 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-40)" strokeWidth="2" width="14" height="14"
              style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              placeholder={s.searchPh}
              style={{
                width: '100%', padding: '8px 12px 8px 32px',
                background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8,
                color: 'var(--text)', fontSize: '.85rem', fontFamily: 'inherit', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = GOLD}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
          {!loading && courses.length > 0 && (
            <TableToolbar
              dateFrom={dateFrom} dateTo={dateTo}
              onDateChange={(f, t) => { setDateFrom(f); setDateTo(t); setPage(1) }}
              exportData={filtered}
              exportCols={exportCols}
              exportFilename="courses"
              exportTitle="Courses Catalog"
              isAr={isAr}
            />
          )}
        </div>

        {!loading && courses.length === 0 && (
          <div style={{ padding: 20 }}>
            <EmptyState
              title={s.emptyTitle}
              description={s.emptyDesc}
              actionLabel={s.emptyAction}
              onAction={() => router.push('/admin/courses/new')}
            />
          </div>
        )}

        {(loading || courses.length > 0) && (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ borderRadius: 0 }}>
              <thead>
                <tr>
                  <th>{s.colName}</th>
                  <th style={{ textAlign: 'center' }}>{s.colSessions}</th>
                  <th style={{ textAlign: 'center' }}>{s.colSpeaking}</th>
                  <th style={{ textAlign: 'center' }}>{s.colLibrary}</th>
                  <th style={{ textAlign: 'center' }}>{s.colTeachers}</th>
                  <th style={{ textAlign: 'center' }}>{s.colStudents}</th>
                  <th>{s.colDate}</th>
                  <th>{s.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? <AdminTableSkeleton cols={8} rows={8} />
                  : filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(c => (
                    <tr
                      key={c.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => router.push(`/admin/courses/${c.id}`)}
                    >
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '.88rem', color: 'var(--text)' }}>{c.nameEn}</div>
                        {c.nameAr && (
                          <div style={{ fontSize: '.75rem', color: 'var(--text-60)', direction: 'rtl', textAlign: 'right', marginTop: 2 }}>{c.nameAr}</div>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '3px 10px', borderRadius: 100, fontSize: '.72rem', fontWeight: 700,
                          background: 'rgba(59,130,246,.1)', border: '1px solid rgba(59,130,246,.25)', color: '#3b82f6',
                        }}>
                          {s.sessions(c.durationSessions ?? 0)}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <BoolBadge on={c.needsSpeaking} yes={s.yes} no={s.no} />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <BoolBadge on={c.needsLibrary} yes={s.yes} no={s.no} />
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text)' }}>
                        {c.teacherCount ?? 0}
                      </td>
                      <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text)' }}>
                        {c.studentCount ?? 0}
                      </td>
                      <td style={{ fontSize: '.82rem', color: 'var(--text-60)' }}>{formatDate(c.createdAt)}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <button
                          className="admin-btn admin-btn--danger"
                          onClick={() => { setDelete(c.id); setDelErr('') }}
                        >
                          {s.delete}
                        </button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}

        {!loading && courses.length > 0 && (
          <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
        )}
        {!loading && search.trim() && filtered.length === 0 && courses.length > 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-60)', fontSize: '.88rem' }}>
            {isAr ? 'لا توجد نتائج مطابقة للبحث' : 'No courses match your search'}
          </div>
        )}
      </div>

      <Modal
        open={!!deleteTarget}
        onClose={() => { setDelete(null); setDelErr('') }}
        onConfirm={confirmDelete}
        variant="delete"
        title={s.deleteTitle}
        message={deleteError || s.deleteMsg}
        confirmText={s.deleteBtn}
        cancelText={s.cancel}
      />
    </>
  )
}

function BoolBadge({ on, yes, no }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '3px 10px', borderRadius: 100, fontSize: '.72rem', fontWeight: 700,
      background: on ? 'rgba(16,185,129,.1)' : 'rgba(0,0,0,.04)',
      border: `1px solid ${on ? 'rgba(16,185,129,.3)' : 'var(--border)'}`,
      color: on ? '#10b981' : 'var(--text-40)',
    }}>
      {on ? yes : no}
    </span>
  )
}
