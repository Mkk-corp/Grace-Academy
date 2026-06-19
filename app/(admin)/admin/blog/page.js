'use client'

import { useState, useEffect } from 'react'
import AdminTableSkeleton from '@/components/admin/AdminTableSkeleton'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { useLang } from '@/context/LangContext'

const S = {
  en: {
    title: 'Blog Posts', addBtn: '+ Add',
    colTitle: 'Title (EN)', colCategory: 'Category', colPublished: 'Published', colActions: 'Actions',
    emptyTitle: 'No blog posts yet', emptyDesc: 'Start publishing content by adding your first blog post.',
    emptyAction: 'Add Post',
    modalAdd: 'Add Post', modalEdit: 'Edit Post',
    fields: [['Title EN','title.en'],['Title AR','title.ar'],['Excerpt EN','excerpt.en'],['Excerpt AR','excerpt.ar'],['Body EN','body.en'],['Body AR','body.ar'],['Category EN','category.en'],['Category AR','category.ar'],['Date EN','date.en'],['Date AR','date.ar'],['Slug','slug'],['Image URL','image']],
    labelPublished: 'Published', optYes: 'Yes', optNo: 'No (Draft)',
    cancel: 'Cancel', save: 'Save',
    deleteTitle: 'Delete blog post', deleteMsg: 'Are you sure you want to delete this post? This action cannot be undone.', deleteBtn: 'Delete',
  },
  ar: {
    title: 'مقالات المدونة', addBtn: '+ إضافة',
    colTitle: 'العنوان (إنجليزي)', colCategory: 'الفئة', colPublished: 'منشور', colActions: 'الإجراءات',
    emptyTitle: 'لا توجد مقالات بعد', emptyDesc: 'ابدأ بنشر المحتوى بإضافة أول مقال.',
    emptyAction: 'إضافة مقال',
    modalAdd: 'إضافة مقال', modalEdit: 'تعديل المقال',
    fields: [['العنوان (إنجليزي)','title.en'],['العنوان (عربي)','title.ar'],['المقتطف (إنجليزي)','excerpt.en'],['المقتطف (عربي)','excerpt.ar'],['المحتوى (إنجليزي)','body.en'],['المحتوى (عربي)','body.ar'],['الفئة (إنجليزي)','category.en'],['الفئة (عربي)','category.ar'],['التاريخ (إنجليزي)','date.en'],['التاريخ (عربي)','date.ar'],['المسار (Slug)','slug'],['رابط الصورة','image']],
    labelPublished: 'الحالة', optYes: 'منشور', optNo: 'مسودة',
    cancel: 'إلغاء', save: 'حفظ',
    deleteTitle: 'حذف المقال', deleteMsg: 'هل أنت متأكد من حذف هذا المقال؟ لا يمكن التراجع عن هذا الإجراء.', deleteBtn: 'حذف',
  },
}

export default function AdminBlogPage() {
  const { lang } = useLang()
  const s = S[lang] || S.en
  const [items, setItems]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [editing, setEditing]       = useState(null)
  const [deleteTarget, setDelete]   = useState(null)

  const blank = () => ({ id: `new${Date.now()}`, title: { en: '', ar: '' }, excerpt: { en: '', ar: '' }, body: { en: '', ar: '' }, category: { en: '', ar: '' }, date: { en: '', ar: '' }, slug: '', image: '', published: false })

  useEffect(() => { fetch('/api/blog').then(r => r.json()).then(d => { setItems(d); setLoading(false) }) }, [])

  async function save(item) {
    const method = item.id.startsWith('new') ? 'POST' : 'PUT'
    await fetch('/api/blog', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) })
    setItems(await fetch('/api/blog').then(r => r.json()))
    setEditing(null)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    await fetch('/api/blog', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: deleteTarget }) })
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
      {(loading || items.length > 0) && (
        <table className="admin-table">
          <thead><tr><th>{s.colTitle}</th><th>{s.colCategory}</th><th>{s.colPublished}</th><th>{s.colActions}</th></tr></thead>
          <tbody>
            {loading ? <AdminTableSkeleton cols={4} rows={6} /> : items.map(item => (
              <tr key={item.id}>
                <td>{item.title.en}</td>
                <td>{item.category.en}</td>
                <td>
                  {item.published
                    ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16" style={{ color: '#4ade80' }}><polyline points="20 6 9 17 4 12"/></svg>
                    : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" style={{ color: 'var(--text-40)' }}><line x1="5" y1="12" x2="19" y2="12"/></svg>}
                </td>
                <td style={{ display: 'flex', gap: 8 }}>
                  <button className="admin-btn" onClick={() => setEditing({ ...item })}>{lang === 'ar' ? 'تعديل' : 'Edit'}</button>
                  <button className="admin-btn admin-btn--danger" onClick={() => setDelete(item.id)}>{lang === 'ar' ? 'حذف' : 'Delete'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {editing && <BlogModal item={editing} onSave={save} onClose={() => setEditing(null)} s={s} />}

      <Modal open={!!deleteTarget} onClose={() => setDelete(null)} onConfirm={confirmDelete}
        variant="delete" title={s.deleteTitle} message={s.deleteMsg} confirmText={s.deleteBtn} cancelText={lang === 'ar' ? 'إلغاء' : 'Cancel'} />
    </>
  )
}

function BlogModal({ item, onSave, onClose, s }) {
  const [form, setForm] = useState(item)
  const set = (path, val) => {
    const [a, b] = path.split('.')
    setForm(f => b ? { ...f, [a]: { ...f[a], [b]: val } } : { ...f, [a]: val })
  }
  const isNew = item.id.startsWith('new')

  return (
    <div className="admin-modal">
      <div className="admin-modal__box">
        <div className="admin-modal__header">
          <h2 className="admin-modal__title">{isNew ? s.modalAdd : s.modalEdit}</h2>
          <button className="admin-modal__close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        {s.fields.map(([label, path]) => (
          <div key={path} className="admin-field">
            <label>{label}</label>
            {(path.includes('excerpt') || path.includes('body')) ? (
              <textarea value={path.split('.').reduce((o, k) => o?.[k] ?? '', form)} onChange={e => set(path, e.target.value)} rows={path.includes('body') ? 5 : 3} />
            ) : (
              <input value={path.split('.').reduce((o, k) => o?.[k] ?? '', form)} onChange={e => set(path, e.target.value)} />
            )}
          </div>
        ))}
        <div className="admin-field">
          <label>{s.labelPublished}</label>
          <select value={form.published ? 'yes' : 'no'} onChange={e => set('published', e.target.value === 'yes')}>
            <option value="yes">{s.optYes}</option>
            <option value="no">{s.optNo}</option>
          </select>
        </div>
        <div className="admin-actions">
          <button className="admin-btn" onClick={onClose}>{s.cancel}</button>
          <button className="admin-btn admin-btn--primary" onClick={() => onSave(form)}>{s.save}</button>
        </div>
      </div>
    </div>
  )
}
