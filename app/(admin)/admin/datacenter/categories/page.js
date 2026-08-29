'use client'

import { useState, useEffect, useRef } from 'react'
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
    back: 'Data Center',
    title: 'Course Categories',
    subtitle: 'Manage categories used to organise courses on the platform',
    addBtn: '+ Add Category',
    colNameEn: 'Category (English)',
    colNameAr: 'Category (Arabic)',
    colCourses: 'Courses',
    colDate: 'Date Added',
    colActions: 'Actions',
    emptyTitle: 'No categories yet',
    emptyDesc: 'Create course categories to organise your content. Each category can hold multiple courses.',
    emptyAction: 'Add Category',
    edit: 'Edit',
    delete: 'Delete',
    modalAdd: 'Add Category',
    modalEdit: 'Edit Category',
    fldNameEn: 'Category Name (English)',
    fldNameAr: 'Category Name (Arabic)',
    phEn: 'e.g. Business English',
    phAr: 'مثال: الإنجليزية للأعمال',
    cancel: 'Cancel',
    save: 'Save Changes',
    create: 'Create Category',
    deleteTitle: 'Delete category',
    deleteMsg: 'Are you sure you want to delete this category? This cannot be undone.',
    deleteBtn: 'Delete',
    required: '*',
    searchPh: 'Search categories…',
    totalCats: 'Total categories',
    catsWithCourses: 'With courses',
    courses: (n) => n === 1 ? '1 course' : `${n} courses`,
    noCourses: 'No courses yet',
  },
  ar: {
    back: 'مركز البيانات',
    title: 'فئات الدورات',
    subtitle: 'إدارة الفئات المستخدمة لتنظيم الدورات على المنصة',
    addBtn: '+ إضافة فئة',
    colNameEn: 'الفئة (إنجليزي)',
    colNameAr: 'الفئة (عربي)',
    colCourses: 'الدورات',
    colDate: 'تاريخ الإضافة',
    colActions: 'الإجراءات',
    emptyTitle: 'لا توجد فئات بعد',
    emptyDesc: 'أنشئ فئات الدورات لتنظيم المحتوى. يمكن لكل فئة أن تضم دورات متعددة.',
    emptyAction: 'إضافة فئة',
    edit: 'تعديل',
    delete: 'حذف',
    modalAdd: 'إضافة فئة',
    modalEdit: 'تعديل الفئة',
    fldNameEn: 'اسم الفئة (إنجليزي)',
    fldNameAr: 'اسم الفئة (عربي)',
    phEn: 'e.g. Business English',
    phAr: 'مثال: الإنجليزية للأعمال',
    cancel: 'إلغاء',
    save: 'حفظ التغييرات',
    create: 'إنشاء فئة',
    deleteTitle: 'حذف الفئة',
    deleteMsg: 'هل أنت متأكد من حذف هذه الفئة؟ لا يمكن التراجع عن هذا الإجراء.',
    deleteBtn: 'حذف',
    required: '*',
    searchPh: 'ابحث عن فئة…',
    totalCats: 'إجمالي الفئات',
    catsWithCourses: 'تحتوي دورات',
    courses: (n) => `${n} دورة`,
    noCourses: 'لا دورات بعد',
  },
}

export default function CategoriesPage() {
  const { lang } = useLang()
  const { theme } = useTheme()
  const router = useRouter()
  const s = S[lang] || S.en
  const isAr  = lang === 'ar'
  const isDark = theme === 'dark'

  const [cats,         setCats]    = useState([])
  const [loading,      setLoading] = useState(true)
  const [editing,      setEditing] = useState(null)
  const [deleteTarget, setDelete]  = useState(null)
  const [deleteError,  setDelErr]  = useState('')
  const [search,       setSearch]  = useState('')
  const [error,        setError]   = useState('')
  const [page,         setPage]    = useState(1)
  const [dateFrom,     setDateFrom] = useState('')
  const [dateTo,       setDateTo]   = useState('')

  function loadCats() {
    return fetch('/api/admin/categories').then(r => r.json()).then(d => {
      setCats(d.categories || [])
      setLoading(false)
    })
  }
  useEffect(() => { loadCats() }, [])

  async function save(form) {
    setError('')
    const isNew = form.id.startsWith('new')
    const res = await fetch('/api/admin/categories', {
      method: isNew ? 'POST' : 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || (isAr ? 'فشل الحفظ' : 'Save failed')); return }
    setError('')
    await loadCats()
    setEditing(null)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    const res = await fetch('/api/admin/categories', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deleteTarget }),
    })
    const data = await res.json()
    if (!res.ok) { setDelErr(data.error || (isAr ? 'فشل الحذف' : 'Delete failed')); return }
    setCats(prev => prev.filter(c => c.id !== deleteTarget))
    setDelete(null)
    setDelErr('')
  }

  function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const filtered = cats.filter(c => {
    const matchSearch = !search.trim() ||
      c.nameEn.toLowerCase().includes(search.toLowerCase()) ||
      (c.nameAr || '').includes(search)
    const d = c.createdAt ? c.createdAt.substring(0, 10) : null
    const matchDate =
      (!dateFrom || (d && d >= dateFrom)) &&
      (!dateTo   || (d && d <= dateTo))
    return matchSearch && matchDate
  })

  const exportCols = [
    { header: 'Category (EN)',  value: r => r.nameEn || '' },
    { header: 'Category (AR)',  value: r => r.nameAr || '' },
    { header: 'Courses',        value: r => r.courseCount ?? 0 },
    { header: 'Date Added',     value: r => r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-GB') : '' },
  ]

  const withCourses = cats.filter(c => (c.courseCount ?? 0) > 0).length
  const newBlank = () => setEditing({ id: `new${Date.now()}`, nameEn: '', nameAr: '' })

  return (
    <>
      {/* Header */}
      <div className="admin-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => router.push('/admin/datacenter')}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
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
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
            {s.back}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: s.totalCats,      value: loading ? '…' : cats.length, color: GOLD },
          { label: s.catsWithCourses, value: loading ? '…' : withCourses, color: '#8b5cf6' },
        ].map(({ label, value, color }) => (
          <div key={label} style={{
            background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 20px',
            boxShadow: '0 1px 3px rgba(0,0,0,.06)',
          }}>
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
          background: isDark ? 'rgba(139,92,246,.05)' : 'rgba(139,92,246,.03)',
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.8" width="18" height="18">
              <path d="M4 7h16M4 12h10M4 17h7"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '.98rem', fontWeight: 700, color: '#8b5cf6' }}>{s.title}</div>
            <div style={{ fontSize: '.76rem', color: 'var(--text-60)', marginTop: 2 }}>{s.subtitle}</div>
          </div>
          <button className="admin-btn admin-btn--primary" onClick={newBlank}>{s.addBtn}</button>
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
          {!loading && cats.length > 0 && (
            <TableToolbar
              dateFrom={dateFrom} dateTo={dateTo}
              onDateChange={(f, t) => { setDateFrom(f); setDateTo(t); setPage(1) }}
              exportData={filtered}
              exportCols={exportCols}
              exportFilename="categories"
              exportTitle="Course Categories"
              isAr={isAr}
            />
          )}
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', padding: '10px 20px', color: '#ef4444', fontSize: '.88rem' }}>
            {error}
          </div>
        )}

        {!loading && cats.length === 0 && (
          <div style={{ padding: 20 }}>
            <EmptyState title={s.emptyTitle} description={s.emptyDesc} actionLabel={s.emptyAction} onAction={newBlank} />
          </div>
        )}

        {(loading || cats.length > 0) && (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ borderRadius: 0 }}>
              <thead>
                <tr>
                  <th>{s.colNameEn}</th>
                  <th>{s.colNameAr}</th>
                  <th style={{ textAlign: 'center' }}>{s.colCourses}</th>
                  <th>{s.colDate}</th>
                  <th>{s.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? <AdminTableSkeleton cols={5} rows={8} />
                  : filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(c => {
                      const count = c.courseCount ?? 0
                      return (
                        <tr key={c.id}>
                          <td style={{ fontWeight: 500 }}>{c.nameEn}</td>
                          <td style={{ direction: 'rtl', textAlign: 'right' }}>{c.nameAr || '—'}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '3px 12px', borderRadius: 100, fontSize: '.72rem', fontWeight: 700,
                              background: count > 0 ? 'rgba(139,92,246,.1)' : 'rgba(0,0,0,.04)',
                              border: `1px solid ${count > 0 ? 'rgba(139,92,246,.3)' : 'var(--border)'}`,
                              color: count > 0 ? '#8b5cf6' : 'var(--text-40)',
                            }}>
                              {count > 0 ? s.courses(count) : s.noCourses}
                            </span>
                          </td>
                          <td style={{ fontSize: '.82rem', color: 'var(--text-60)' }}>{formatDate(c.createdAt)}</td>
                          <td>
                            <div style={{ display: 'flex', gap: 8 }}>
                              <button className="admin-btn" onClick={() => { setEditing({ ...c }); setError('') }}>{s.edit}</button>
                              <button className="admin-btn admin-btn--danger" onClick={() => { setDelete(c.id); setDelErr('') }}>{s.delete}</button>
                            </div>
                          </td>
                        </tr>
                      )
                    })
                }
              </tbody>
            </table>
          </div>
        )}

        {!loading && cats.length > 0 && (
          <Pagination page={page} total={filtered.length} pageSize={PAGE_SIZE} onChange={setPage} />
        )}
        {!loading && search.trim() && filtered.length === 0 && cats.length > 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-60)', fontSize: '.88rem' }}>
            {isAr ? 'لا توجد نتائج مطابقة للبحث' : 'No categories match your search'}
          </div>
        )}
      </div>

      {editing && (
        <CategoryModal
          cat={editing}
          onSave={save}
          onClose={() => { setEditing(null); setError('') }}
          s={s} error={error} isAr={isAr} isDark={isDark}
        />
      )}

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

function CategoryModal({ cat, onSave, onClose, s, error, isAr, isDark }) {
  const [form, setForm] = useState({ nameEn: cat.nameEn || '', nameAr: cat.nameAr || '', id: cat.id })
  const isNew = cat.id.startsWith('new')
  const nameEnRef = useRef(null)

  useEffect(() => { nameEnRef.current?.focus() }, [])

  function set(k, v) { setForm(f => ({ ...f, [k]: v })) }

  function onKeyDown(e) { if (e.key === 'Enter') onSave(form) }

  const border = isDark ? 'rgba(255,255,255,.09)' : '#e5e7eb'
  const text   = isDark ? '#f1f5f9' : '#111827'
  const muted  = isDark ? 'rgba(255,255,255,.45)' : '#6b7280'
  const bg     = isDark ? 'rgba(255,255,255,.05)' : '#f9fafb'

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: 9,
    border: `1px solid ${border}`, background: bg,
    color: text, fontSize: '.88rem', fontFamily: 'inherit', outline: 'none',
    transition: 'border-color .15s',
  }

  return (
    <div className="admin-modal">
      <div className="admin-modal__box">
        <div className="admin-modal__header">
          <h2 className="admin-modal__title">{isNew ? s.modalAdd : s.modalEdit}</h2>
          <button className="admin-modal__close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 16, color: '#ef4444', fontSize: '.85rem' }}>
            {error}
          </div>
        )}

        <div className="admin-field">
          <label>
            {s.fldNameEn} <span style={{ color: '#ef4444' }}>{s.required}</span>
          </label>
          <input
            ref={nameEnRef}
            value={form.nameEn}
            onChange={e => set('nameEn', e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={s.phEn}
            dir="ltr"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = GOLD}
            onBlur={e => e.target.style.borderColor = border}
          />
        </div>

        <div className="admin-field">
          <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {s.fldNameAr}
            <span style={{
              fontSize: '.65rem', fontWeight: 700, padding: '1px 7px', borderRadius: 100,
              background: 'rgba(139,92,246,.1)', border: '1px solid rgba(139,92,246,.25)', color: '#8b5cf6',
            }}>
              {isAr ? 'اختياري' : 'Optional'}
            </span>
          </label>
          <input
            value={form.nameAr}
            onChange={e => set('nameAr', e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={s.phAr}
            dir="rtl"
            style={inputStyle}
            onFocus={e => e.target.style.borderColor = GOLD}
            onBlur={e => e.target.style.borderColor = border}
          />
        </div>

        {!isNew && (cat.courseCount ?? 0) > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px', borderRadius: 9, marginBottom: 4,
            background: 'rgba(139,92,246,.07)', border: '1px solid rgba(139,92,246,.2)',
            fontSize: '.82rem', color: '#8b5cf6',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {isAr
              ? `هذه الفئة تحتوي على ${cat.courseCount} دورة. تعديل الاسم لن يؤثر على الدورات.`
              : `This category has ${cat.courseCount} course${cat.courseCount !== 1 ? 's' : ''} assigned. Renaming will not affect them.`
            }
          </div>
        )}

        <div className="admin-actions">
          <button className="admin-btn" onClick={onClose}>{s.cancel}</button>
          <button className="admin-btn admin-btn--primary" onClick={() => onSave(form)}>
            {isNew ? s.create : s.save}
          </button>
        </div>
      </div>
    </div>
  )
}
