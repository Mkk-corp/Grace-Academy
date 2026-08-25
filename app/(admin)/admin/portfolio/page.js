'use client'

import { useState, useEffect } from 'react'
import AdminTableSkeleton from '@/components/admin/AdminTableSkeleton'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { useLang } from '@/context/LangContext'
import Pagination from '@/components/ui/Pagination'
import TableToolbar from '@/components/ui/TableToolbar'

const S = {
  en: {
    title: 'Portfolio', addBtn: '+ Add',
    colTitle: 'Title (EN)', colCategory: 'Category', colActions: 'Actions',
    emptyTitle: 'No portfolio cases yet', emptyDesc: 'Add your first case study to showcase Grace Academy\'s work.',
    emptyAction: 'Add Case Study',
    modalAdd: 'Add Case', modalEdit: 'Edit Case',
    fields: [
      ['Thumb Label','thumbLabel'], ['Category EN','category.en'], ['Category AR','category.ar'],
      ['Title EN','title.en'], ['Title AR','title.ar'],
      ['Challenge EN','challenge.en'], ['Challenge AR','challenge.ar'],
      ['Approach EN','approach.en'], ['Approach AR','approach.ar'],
      ['Outcome EN','outcome.en'], ['Outcome AR','outcome.ar'],
    ],
    cancel: 'Cancel', save: 'Save',
    deleteTitle: 'Delete portfolio case', deleteMsg: 'Are you sure you want to delete this case study? This action cannot be undone.', deleteBtn: 'Delete',
  },
  ar: {
    title: 'أعمالنا', addBtn: '+ إضافة',
    colTitle: 'العنوان (إنجليزي)', colCategory: 'الفئة', colActions: 'الإجراءات',
    emptyTitle: 'لا توجد مشاريع بعد', emptyDesc: 'أضف أول دراسة حالة لعرض أعمال أكاديمية جريس.',
    emptyAction: 'إضافة دراسة حالة',
    modalAdd: 'إضافة مشروع', modalEdit: 'تعديل المشروع',
    fields: [
      ['تسمية الصورة المصغرة','thumbLabel'], ['الفئة (إنجليزي)','category.en'], ['الفئة (عربي)','category.ar'],
      ['العنوان (إنجليزي)','title.en'], ['العنوان (عربي)','title.ar'],
      ['التحدي (إنجليزي)','challenge.en'], ['التحدي (عربي)','challenge.ar'],
      ['المقاربة (إنجليزي)','approach.en'], ['المقاربة (عربي)','approach.ar'],
      ['النتيجة (إنجليزي)','outcome.en'], ['النتيجة (عربي)','outcome.ar'],
    ],
    cancel: 'إلغاء', save: 'حفظ',
    deleteTitle: 'حذف المشروع', deleteMsg: 'هل أنت متأكد من حذف دراسة الحالة هذه؟ لا يمكن التراجع عن هذا الإجراء.', deleteBtn: 'حذف',
  },
}

export default function AdminPortfolioPage() {
  const { lang } = useLang()
  const s = S[lang] || S.en
  const [items, setItems]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [editing, setEditing]     = useState(null)
  const [deleteTarget, setDelete] = useState(null)
  const [page, setPage]           = useState(1)

  const blank = () => ({ id: `new${Date.now()}`, thumbLabel: '', category: { en: '', ar: '' }, title: { en: '', ar: '' }, challenge: { en: '', ar: '' }, approach: { en: '', ar: '' }, outcome: { en: '', ar: '' } })

  useEffect(() => { fetch('/api/portfolio').then(r => r.json()).then(d => { setItems(d); setLoading(false) }) }, [])

  async function save(item) {
    const method = item.id.startsWith('new') ? 'POST' : 'PUT'
    await fetch('/api/portfolio', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) })
    setItems(await fetch('/api/portfolio').then(r => r.json()))
    setEditing(null)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    await fetch('/api/portfolio', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: deleteTarget }) })
    setItems(prev => prev.filter(i => i.id !== deleteTarget))
    setDelete(null)
  }

  return (
    <>
      <div className="admin-header">
        <h1>{s.title}</h1>
        <button className="admin-btn admin-btn--primary" onClick={() => setEditing(blank())}>{s.addBtn}</button>
      </div>
      {!loading && items.length === 0 && (
        <EmptyState title={s.emptyTitle} description={s.emptyDesc} actionLabel={s.emptyAction} onAction={() => setEditing(blank())} />
      )}
      {!loading && items.length > 0 && (
        <TableToolbar
          hasDateFilter={false}
          exportData={items}
          exportCols={[
            { header: 'Title', value: r => r.title?.en || '' },
            { header: 'Title (AR)', value: r => r.title?.ar || '' },
            { header: 'Category', value: r => r.category?.en || '' },
          ]}
          exportFilename="portfolio"
          exportTitle="Portfolio"
          isAr={lang === 'ar'}
        />
      )}
      {(loading || items.length > 0) && (
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <table className="admin-table" style={{ borderRadius: 0 }}>
            <thead><tr><th>{s.colTitle}</th><th>{s.colCategory}</th><th>{s.colActions}</th></tr></thead>
            <tbody>
              {loading ? <AdminTableSkeleton cols={3} rows={6} /> : items.slice((page-1)*25, page*25).map(item => (
                <tr key={item.id}>
                  <td>{item.title.en}</td>
                  <td>{item.category.en}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="admin-btn" onClick={() => setEditing({ ...item })}>{lang === 'ar' ? 'تعديل' : 'Edit'}</button>
                    <button className="admin-btn admin-btn--danger" onClick={() => setDelete(item.id)}>{lang === 'ar' ? 'حذف' : 'Delete'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && <Pagination page={page} total={items.length} onChange={setPage} />}
        </div>
      )}

      {editing && <PortfolioModal item={editing} onSave={save} onClose={() => setEditing(null)} s={s} />}

      <Modal open={!!deleteTarget} onClose={() => setDelete(null)} onConfirm={confirmDelete}
        variant="delete" title={s.deleteTitle} message={s.deleteMsg} confirmText={s.deleteBtn} cancelText={lang === 'ar' ? 'إلغاء' : 'Cancel'} />
    </>
  )
}

function PortfolioModal({ item, onSave, onClose, s }) {
  const [form, setForm] = useState(item)
  const set = (path, val) => {
    const [a, b] = path.split('.')
    setForm(f => b ? { ...f, [a]: { ...f[a], [b]: val } } : { ...f, [a]: val })
  }
  return (
    <div className="admin-modal">
      <div className="admin-modal__box">
        <div className="admin-modal__header">
          <h2 className="admin-modal__title">{item.id.startsWith('new') ? s.modalAdd : s.modalEdit}</h2>
          <button className="admin-modal__close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        {s.fields.map(([label, path]) => (
          <div key={path} className="admin-field">
            <label>{label}</label>
            <textarea
              value={path.split('.').reduce((o, k) => o[k], form)}
              onChange={e => set(path, e.target.value)}
              style={{ minHeight: (path.includes('approach') || path.includes('outcome') || path.includes('challenge')) ? '80px' : '42px' }}
            />
          </div>
        ))}
        <div className="admin-actions">
          <button className="admin-btn" onClick={onClose}>{s.cancel}</button>
          <button className="admin-btn admin-btn--primary" onClick={() => onSave(form)}>{s.save}</button>
        </div>
      </div>
    </div>
  )
}
