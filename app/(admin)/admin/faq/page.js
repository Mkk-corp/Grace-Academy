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
    title: 'FAQ', addBtn: '+ Add',
    colQuestion: 'Question (EN)', colActions: 'Actions',
    emptyTitle: 'No FAQ entries yet', emptyDesc: 'Add your first frequently asked question to help your audience.',
    emptyAction: 'Add Question',
    modalAdd: 'Add FAQ', modalEdit: 'Edit FAQ',
    fields: [['Question EN','question.en'],['Question AR','question.ar'],['Answer EN','answer.en'],['Answer AR','answer.ar']],
    cancel: 'Cancel', save: 'Save',
    deleteTitle: 'Delete FAQ item', deleteMsg: 'Are you sure you want to delete this question? This action cannot be undone.', deleteBtn: 'Delete',
  },
  ar: {
    title: 'الأسئلة الشائعة', addBtn: '+ إضافة',
    colQuestion: 'السؤال (إنجليزي)', colActions: 'الإجراءات',
    emptyTitle: 'لا توجد أسئلة شائعة بعد', emptyDesc: 'أضف أول سؤال شائع لمساعدة زوار الموقع.',
    emptyAction: 'إضافة سؤال',
    modalAdd: 'إضافة سؤال', modalEdit: 'تعديل السؤال',
    fields: [['السؤال (إنجليزي)','question.en'],['السؤال (عربي)','question.ar'],['الإجابة (إنجليزي)','answer.en'],['الإجابة (عربي)','answer.ar']],
    cancel: 'إلغاء', save: 'حفظ',
    deleteTitle: 'حذف السؤال الشائع', deleteMsg: 'هل أنت متأكد من حذف هذا السؤال؟ لا يمكن التراجع عن هذا الإجراء.', deleteBtn: 'حذف',
  },
}

export default function AdminFaqPage() {
  const { lang } = useLang()
  const s = S[lang] || S.en
  const [items, setItems]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [editing, setEditing]     = useState(null)
  const [deleteTarget, setDelete] = useState(null)
  const [page, setPage]           = useState(1)

  const blank = () => ({ id: `new${Date.now()}`, question: { en: '', ar: '' }, answer: { en: '', ar: '' } })

  useEffect(() => { fetch('/api/faq').then(r => r.json()).then(d => { setItems(d); setLoading(false) }) }, [])

  async function save(item) {
    const method = item.id.startsWith('new') ? 'POST' : 'PUT'
    await fetch('/api/faq', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(item) })
    setItems(await fetch('/api/faq').then(r => r.json()))
    setEditing(null)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    await fetch('/api/faq', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: deleteTarget }) })
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
            { header: 'Question (EN)', value: r => r.question?.en || '' },
            { header: 'Question (AR)', value: r => r.question?.ar || '' },
            { header: 'Answer (EN)', value: r => r.answer?.en || '' },
            { header: 'Answer (AR)', value: r => r.answer?.ar || '' },
          ]}
          exportFilename="faq"
          exportTitle="FAQ"
          isAr={lang === 'ar'}
        />
      )}
      {(loading || items.length > 0) && (
        <div style={{ background: 'var(--surface)', borderRadius: 'var(--r-lg)', overflow: 'hidden', border: '1px solid var(--border)' }}>
          <table className="admin-table" style={{ borderRadius: 0 }}>
            <thead><tr><th>{s.colQuestion}</th><th>{s.colActions}</th></tr></thead>
            <tbody>
              {loading ? <AdminTableSkeleton cols={2} rows={8} /> : items.slice((page-1)*25, page*25).map(item => (
                <tr key={item.id}>
                  <td>{item.question.en}</td>
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

      {editing && (
        <div className="admin-modal">
          <div className="admin-modal__box">
            <div className="admin-modal__header">
              <h2 className="admin-modal__title">{editing.id.startsWith('new') ? s.modalAdd : s.modalEdit}</h2>
              <button className="admin-modal__close" onClick={() => setEditing(null)} aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <FaqForm item={editing} onSave={save} onClose={() => setEditing(null)} s={s} />
          </div>
        </div>
      )}

      <Modal open={!!deleteTarget} onClose={() => setDelete(null)} onConfirm={confirmDelete}
        variant="delete" title={s.deleteTitle} message={s.deleteMsg} confirmText={s.deleteBtn} cancelText={lang === 'ar' ? 'إلغاء' : 'Cancel'} />
    </>
  )
}

function FaqForm({ item, onSave, onClose, s }) {
  const [form, setForm] = useState(item)
  const set = (path, val) => {
    const [a, b] = path.split('.')
    setForm(f => ({ ...f, [a]: { ...f[a], [b]: val } }))
  }
  return (
    <>
      {s.fields.map(([label, path]) => (
        <div key={path} className="admin-field">
          <label>{label}</label>
          <textarea value={path.split('.').reduce((o, k) => o[k], form)} onChange={e => set(path, e.target.value)} />
        </div>
      ))}
      <div className="admin-actions">
        <button className="admin-btn" onClick={onClose}>{s.cancel}</button>
        <button className="admin-btn admin-btn--primary" onClick={() => onSave(form)}>{s.save}</button>
      </div>
    </>
  )
}
