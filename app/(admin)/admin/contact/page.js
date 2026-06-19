'use client'

import { useState, useEffect } from 'react'
import AdminTableSkeleton from '@/components/admin/AdminTableSkeleton'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { useLang } from '@/context/LangContext'

const S = {
  en: {
    title: 'Messages', unreadLabel: 'unread',
    colFrom: 'From', colDate: 'Date', colActions: 'Actions',
    badgeNew: 'NEW',
    emptyTitle: 'No messages yet', emptyDesc: 'Contact form submissions from the website will appear here.',
    selectPrompt: 'Select a message to read it',
    deleteTitle: 'Delete message', deleteMsg: 'Are you sure you want to delete this message? This action cannot be undone.',
    deleteBtn: 'Delete', cancel: 'Cancel',
  },
  ar: {
    title: 'الرسائل', unreadLabel: 'غير مقروء',
    colFrom: 'المُرسِل', colDate: 'التاريخ', colActions: 'الإجراءات',
    badgeNew: 'جديد',
    emptyTitle: 'لا توجد رسائل بعد', emptyDesc: 'رسائل نموذج التواصل من الموقع ستظهر هنا.',
    selectPrompt: 'اختر رسالة لقراءتها',
    deleteTitle: 'حذف الرسالة', deleteMsg: 'هل أنت متأكد من حذف هذه الرسالة؟ لا يمكن التراجع عن هذا الإجراء.',
    deleteBtn: 'حذف', cancel: 'إلغاء',
  },
}

export default function AdminContactPage() {
  const { lang } = useLang()
  const s = S[lang] || S.en
  const [messages, setMessages]   = useState([])
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(null)
  const [deleteTarget, setDelete] = useState(null)

  useEffect(() => {
    fetch('/api/contact').then(r => r.json()).then(msgs => { setMessages(msgs.reverse()); setLoading(false) })
  }, [])

  async function markRead(id) {
    await fetch('/api/contact', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    setMessages(prev => prev.map(m => m.id === id ? { ...m, read: true } : m))
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    await fetch('/api/contact', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: deleteTarget }) })
    setMessages(prev => prev.filter(m => m.id !== deleteTarget))
    if (selected?.id === deleteTarget) setSelected(null)
    setDelete(null)
  }

  const unreadCount = messages.filter(m => !m.read).length

  return (
    <>
      <div className="admin-header">
        <h1>
          {s.title}
          {unreadCount > 0 && (
            <span style={{ fontSize: '.8rem', color: 'var(--text-60)', fontWeight: 400, marginInlineStart: 8 }}>
              ({unreadCount} {s.unreadLabel})
            </span>
          )}
        </h1>
      </div>

      {!loading && messages.length === 0 && (
        <EmptyState title={s.emptyTitle} description={s.emptyDesc} />
      )}

      {(loading || messages.length > 0) && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <table className="admin-table">
              <thead><tr><th>{s.colFrom}</th><th>{s.colDate}</th><th>{s.colActions}</th></tr></thead>
              <tbody>
                {loading ? <AdminTableSkeleton cols={3} rows={5} /> : messages.map(msg => (
                  <tr key={msg.id} onClick={() => { setSelected(msg); if (!msg.read) markRead(msg.id) }} style={{ cursor: 'pointer' }}>
                    <td>
                      {!msg.read && <span className="badge-unread" style={{ marginInlineEnd: 8 }}>{s.badgeNew}</span>}
                      {msg.name}
                    </td>
                    <td style={{ fontSize: '.8rem', color: 'var(--text-60)' }}>
                      {new Date(msg.submittedAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        className="admin-btn admin-btn--danger"
                        onClick={e => { e.stopPropagation(); setDelete(msg.id) }}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px 8px' }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
                          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div>
            {selected ? (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '24px' }}>
                <h3 style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>{selected.name}</h3>
                <p style={{ fontSize: '.8rem', color: 'var(--text-60)', marginBottom: 16 }}>{selected.email} · {selected.phone}</p>
                <p style={{ fontSize: '.9rem', color: 'var(--text-80)', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selected.message}</p>
                <p style={{ fontSize: '.75rem', color: 'var(--text-40)', marginTop: 16 }}>{new Date(selected.submittedAt).toLocaleString()}</p>
              </div>
            ) : (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--r-lg)', padding: '24px', color: 'var(--text-40)', textAlign: 'center' }}>
                {s.selectPrompt}
              </div>
            )}
          </div>
        </div>
      )}

      <Modal open={!!deleteTarget} onClose={() => setDelete(null)} onConfirm={confirmDelete}
        variant="delete" title={s.deleteTitle} message={s.deleteMsg} confirmText={s.deleteBtn} cancelText={s.cancel} />
    </>
  )
}
