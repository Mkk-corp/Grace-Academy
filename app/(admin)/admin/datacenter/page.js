'use client'

import { useState, useEffect } from 'react'
import AdminTableSkeleton from '@/components/admin/AdminTableSkeleton'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'
import Select from '@/components/ui/Select'

const S = {
  en: {
    title: 'Data Center',
    subtitle: 'Manage platform data and configuration',
    topicsCard: 'Conversation Topics',
    topicsDesc: 'Topics assessors can select to discuss with students',
    addBtn: '+ Add Topic',
    colNameEn: 'Topic (English)', colNameAr: 'Topic (Arabic)', colStatus: 'Status', colCreatedBy: 'Created By', colDate: 'Date', colActions: 'Actions',
    emptyTitle: 'No topics yet', emptyDesc: 'Topics will appear here. Click "Add Topic" to create the first one, or they will be seeded automatically.',
    emptyAction: 'Add Topic',
    active: 'Active', inactive: 'Inactive', system: 'System',
    edit: 'Edit', delete: 'Delete',
    modalAdd: 'Add Topic', modalEdit: 'Edit Topic',
    fldNameEn: 'Topic Name (English)', fldNameAr: 'Topic Name (Arabic)', fldStatus: 'Status',
    phEn: 'e.g. Travel & Adventure', phAr: 'مثال: السفر والمغامرة',
    optActive: 'Active', optInactive: 'Inactive',
    cancel: 'Cancel', save: 'Save', create: 'Create Topic',
    deleteTitle: 'Delete topic', deleteMsg: 'Are you sure you want to delete this topic? Assessors who have selected it will lose it from their profile.', deleteBtn: 'Delete',
    required: '*',
    searchPh: 'Search topics…',
    totalTopics: 'Total topics',
    activeTopics: 'Active topics',
  },
  ar: {
    title: 'مركز البيانات',
    subtitle: 'إدارة بيانات المنصة والإعدادات',
    topicsCard: 'مواضيع المحادثة',
    topicsDesc: 'المواضيع التي يختارها المستشارون للحديث عنها مع الطلاب',
    addBtn: '+ إضافة موضوع',
    colNameEn: 'الموضوع (إنجليزي)', colNameAr: 'الموضوع (عربي)', colStatus: 'الحالة', colCreatedBy: 'أنشأه', colDate: 'التاريخ', colActions: 'الإجراءات',
    emptyTitle: 'لا توجد مواضيع بعد', emptyDesc: 'ستظهر المواضيع هنا. اضغط "إضافة موضوع" لإنشاء أول موضوع، أو ستُضاف تلقائياً.',
    emptyAction: 'إضافة موضوع',
    active: 'نشط', inactive: 'معطّل', system: 'النظام',
    edit: 'تعديل', delete: 'حذف',
    modalAdd: 'إضافة موضوع', modalEdit: 'تعديل الموضوع',
    fldNameEn: 'اسم الموضوع (إنجليزي)', fldNameAr: 'اسم الموضوع (عربي)', fldStatus: 'الحالة',
    phEn: 'مثال: Travel & Adventure', phAr: 'مثال: السفر والمغامرة',
    optActive: 'نشط', optInactive: 'معطّل',
    cancel: 'إلغاء', save: 'حفظ', create: 'إنشاء موضوع',
    deleteTitle: 'حذف الموضوع', deleteMsg: 'هل أنت متأكد من حذف هذا الموضوع؟ سيفقد المستشارون الذين اختاروه هذا الموضوع من ملفاتهم.', deleteBtn: 'حذف',
    required: '*',
    searchPh: 'ابحث عن موضوع…',
    totalTopics: 'إجمالي المواضيع',
    activeTopics: 'المواضيع النشطة',
  },
}

export default function DataCenterPage() {
  const { lang } = useLang()
  const { theme } = useTheme()
  const s = S[lang] || S.en
  const isDark = theme === 'dark'

  const [topics,      setTopics]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [editing,     setEditing]     = useState(null)
  const [deleteTarget,setDelete]      = useState(null)
  const [deleteError, setDelErr]      = useState('')
  const [search,      setSearch]      = useState('')
  const [error,       setError]       = useState('')

  function loadTopics() {
    return fetch('/api/topics').then(r => r.json()).then(d => {
      setTopics(d.topics || [])
      setLoading(false)
    })
  }

  useEffect(() => { loadTopics() }, [])

  async function save(item) {
    setError('')
    const isNew = item.id.startsWith('new')
    const res = await fetch('/api/topics', {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || (lang === 'ar' ? 'فشل الحفظ' : 'Save failed')); return }
    setError('')
    await loadTopics()
    setEditing(null)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    const res = await fetch('/api/topics', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deleteTarget }),
    })
    if (!res.ok) { setDelErr(lang === 'ar' ? 'فشل الحذف. حاول مرة أخرى.' : 'Delete failed. Please try again.'); return }
    setTopics(prev => prev.filter(t => t.id !== deleteTarget))
    setDelete(null); setDelErr('')
  }

  function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const filtered = search.trim()
    ? topics.filter(t =>
        t.nameEn.toLowerCase().includes(search.toLowerCase()) ||
        t.nameAr.includes(search)
      )
    : topics

  const totalActive = topics.filter(t => t.active !== false).length
  const newBlank = () => setEditing({ id: `new${Date.now()}`, nameEn: '', nameAr: '', active: true })

  const GOLD = '#c9932c'

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>{s.title}</h1>
          <div style={{ fontSize: '.8rem', color: 'var(--text-60)', marginTop: 2 }}>{s.subtitle}</div>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: s.totalTopics, value: loading ? '…' : topics.length, color: GOLD },
          { label: s.activeTopics, value: loading ? '…' : totalActive, color: '#4ade80' },
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

      {/* Topics card */}
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
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
              <line x1="7" y1="7" x2="7.01" y2="7"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '.98rem', fontWeight: 700, color: GOLD }}>{s.topicsCard}</div>
            <div style={{ fontSize: '.76rem', color: 'var(--text-60)', marginTop: 2 }}>{s.topicsDesc}</div>
          </div>
          <button className="admin-btn admin-btn--primary" onClick={newBlank}>{s.addBtn}</button>
        </div>

        {/* Search bar */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', maxWidth: 320 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-40)" strokeWidth="2" width="14" height="14"
              style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder={s.searchPh}
              style={{
                width: '100%', padding: '8px 12px 8px 32px',
                background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8,
                color: 'var(--text)', fontSize: '.85rem', fontFamily: 'inherit', outline: 'none',
                transition: 'border-color .15s',
              }}
              onFocus={e => e.target.style.borderColor = GOLD}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {error && (
          <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 0, padding: '10px 20px', color: '#ef4444', fontSize: '.88rem' }}>
            {error}
          </div>
        )}

        {!loading && topics.length === 0 && (
          <div style={{ padding: 20 }}>
            <EmptyState title={s.emptyTitle} description={s.emptyDesc} actionLabel={s.emptyAction} onAction={newBlank} />
          </div>
        )}

        {(loading || topics.length > 0) && (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table" style={{ borderRadius: 0 }}>
              <thead>
                <tr>
                  <th>{s.colNameEn}</th>
                  <th>{s.colNameAr}</th>
                  <th>{s.colStatus}</th>
                  <th>{s.colCreatedBy}</th>
                  <th>{s.colDate}</th>
                  <th>{s.colActions}</th>
                </tr>
              </thead>
              <tbody>
                {loading
                  ? <AdminTableSkeleton cols={6} rows={8} />
                  : filtered.map(t => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 500 }}>{t.nameEn}</td>
                      <td style={{ direction: 'rtl', textAlign: 'right' }}>{t.nameAr}</td>
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '3px 10px', borderRadius: 100, fontSize: '.72rem', fontWeight: 700,
                          background: t.active !== false ? 'rgba(74,222,128,.1)' : 'rgba(239,68,68,.08)',
                          border: `1px solid ${t.active !== false ? 'rgba(74,222,128,.3)' : 'rgba(239,68,68,.2)'}`,
                          color: t.active !== false ? '#4ade80' : '#f87171',
                        }}>
                          {t.active !== false ? s.active : s.inactive}
                        </span>
                      </td>
                      <td style={{ fontSize: '.82rem', color: 'var(--text-60)' }}>
                        {t.createdBy === 'system' ? s.system : (t.createdBy || s.system)}
                      </td>
                      <td style={{ fontSize: '.82rem', color: 'var(--text-60)' }}>{formatDate(t.createdAt)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="admin-btn" onClick={() => { setEditing({ ...t }); setError('') }}>{s.edit}</button>
                          <button className="admin-btn admin-btn--danger" onClick={() => { setDelete(t.id); setDelErr('') }}>{s.delete}</button>
                        </div>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        )}

        {!loading && search.trim() && filtered.length === 0 && topics.length > 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-60)', fontSize: '.88rem' }}>
            {lang === 'ar' ? 'لا توجد نتائج مطابقة للبحث' : 'No topics match your search'}
          </div>
        )}
      </div>

      {editing && (
        <TopicModal topic={editing} onSave={save} onClose={() => { setEditing(null); setError('') }} s={s} error={error} />
      )}

      <Modal open={!!deleteTarget} onClose={() => { setDelete(null); setDelErr('') }} onConfirm={confirmDelete}
        variant="delete" title={s.deleteTitle} message={deleteError || s.deleteMsg} confirmText={s.deleteBtn} cancelText={s.cancel} />
    </>
  )
}

function TopicModal({ topic, onSave, onClose, s, error }) {
  const { lang } = useLang()
  const { theme } = useTheme()
  const isAr  = lang === 'ar'
  const isDark = theme === 'dark'
  const [form, setForm] = useState(topic)
  const isNew = topic.id.startsWith('new')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

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
          <label>{s.fldNameEn} <span style={{ color: '#ef4444' }}>{s.required}</span></label>
          <input value={form.nameEn} onChange={e => set('nameEn', e.target.value)} placeholder={s.phEn} dir="ltr" />
        </div>

        <div className="admin-field">
          <label>{s.fldNameAr}</label>
          <input value={form.nameAr || ''} onChange={e => set('nameAr', e.target.value)} placeholder={s.phAr} dir="rtl" />
        </div>

        {!isNew && (
          <div className="admin-field">
            <label>{s.fldStatus}</label>
            <Select
              value={form.active !== false ? 'active' : 'inactive'}
              onChange={v => set('active', v === 'active')}
              options={[
                { value: 'active',   label: s.optActive,   labelAr: s.optActive   },
                { value: 'inactive', label: s.optInactive, labelAr: s.optInactive },
              ]}
              isAr={isAr} isDark={isDark}
            />
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
