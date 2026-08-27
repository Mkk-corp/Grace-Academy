'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/Modal'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'

const GOLD  = '#c9932c'
const GREEN = '#10b981'

const S = {
  en: {
    back: 'Data Center',
    title: 'Payment Methods',
    subtitle: 'Configure the payment methods available for payroll transfers',
    addBtn: '+ Add Method',
    total: 'Total methods',
    emptyTitle: 'No payment methods yet',
    emptyDesc: 'Add your first payment method to enable payroll transfers.',
    emptyAction: '+ Add Method',
    colName: 'Method Name', colActions: 'Actions',
    edit: 'Edit', delete: 'Delete',
    modalAdd: 'Add Payment Method', modalEdit: 'Edit Payment Method',
    fldName: 'Method Name',
    phName: 'e.g. Bank Transfer',
    cancel: 'Cancel', save: 'Save', create: 'Add Method',
    deleteTitle: 'Delete payment method',
    deleteMsg: 'Are you sure you want to delete this payment method? It will no longer be selectable for new payroll transfers.',
    deleteBtn: 'Delete',
    searchPh: 'Search methods…',
    noMatch: 'No methods match your search',
    required: '*',
  },
  ar: {
    back: 'مركز البيانات',
    title: 'طرق الدفع',
    subtitle: 'إدارة طرق الدفع المتاحة لتحويل الرواتب',
    addBtn: '+ إضافة طريقة',
    total: 'إجمالي الطرق',
    emptyTitle: 'لا توجد طرق دفع بعد',
    emptyDesc: 'أضف أول طريقة دفع لتفعيل تحويلات الرواتب.',
    emptyAction: '+ إضافة طريقة',
    colName: 'اسم الطريقة', colActions: 'الإجراءات',
    edit: 'تعديل', delete: 'حذف',
    modalAdd: 'إضافة طريقة دفع', modalEdit: 'تعديل طريقة الدفع',
    fldName: 'اسم الطريقة',
    phName: 'مثال: تحويل بنكي',
    cancel: 'إلغاء', save: 'حفظ', create: 'إضافة طريقة',
    deleteTitle: 'حذف طريقة الدفع',
    deleteMsg: 'هل أنت متأكد من حذف هذه الطريقة؟ لن تكون متاحة للتحويلات الجديدة.',
    deleteBtn: 'حذف',
    searchPh: 'ابحث عن طريقة…',
    noMatch: 'لا توجد نتائج مطابقة للبحث',
    required: '*',
  },
}

export default function PaymentMethodsPage() {
  const { lang }  = useLang()
  const { theme } = useTheme()
  const router    = useRouter()
  const s      = S[lang] || S.en
  const isAr   = lang === 'ar'
  const isDark = theme === 'dark'

  const [methods,      setMethods]  = useState([])
  const [loading,      setLoading]  = useState(true)
  const [search,       setSearch]   = useState('')
  const [editing,      setEditing]  = useState(null)   // null | { name, isNew }
  const [deleteTarget, setDelete]   = useState(null)   // method name string
  const [deleteError,  setDelErr]   = useState('')
  const [saving,       setSaving]   = useState(false)
  const [formError,    setFormErr]  = useState('')

  function load() {
    return fetch('/api/admin/payment-methods')
      .then(r => r.json())
      .then(d => { setMethods(d.methods || []); setLoading(false) })
  }
  useEffect(() => { load() }, [])

  async function handleSave(name, originalName) {
    if (!name.trim()) { setFormErr(isAr ? 'الاسم مطلوب' : 'Name is required'); return }
    setSaving(true); setFormErr('')
    let res
    if (!originalName) {
      res = await fetch('/api/admin/payment-methods', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })
    } else {
      res = await fetch('/api/admin/payment-methods', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName: originalName, newName: name.trim() }),
      })
    }
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setFormErr(data.error || (isAr ? 'فشل الحفظ' : 'Save failed')); return }
    setMethods(data.methods)
    setEditing(null)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    const res = await fetch('/api/admin/payment-methods', {
      method: 'DELETE', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: deleteTarget }),
    })
    if (!res.ok) { setDelErr(isAr ? 'فشل الحذف. حاول مرة أخرى.' : 'Delete failed. Please try again.'); return }
    const data = await res.json()
    setMethods(data.methods)
    setDelete(null); setDelErr('')
  }

  const filtered = methods.filter(m => !search.trim() || m.toLowerCase().includes(search.toLowerCase()))

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
            onMouseEnter={e => e.currentTarget.style.borderColor = GREEN}
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

      {/* Stat */}
      <div style={{ marginBottom: 28 }}>
        <div style={{
          display: 'inline-flex', flexDirection: 'column',
          background: 'var(--surface)', border: '1px solid var(--border)',
          borderRadius: 14, padding: '18px 24px',
          boxShadow: '0 1px 3px rgba(0,0,0,.06)',
        }}>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: GREEN, lineHeight: 1 }}>
            {loading ? '…' : methods.length}
          </div>
          <div style={{ fontSize: '.76rem', color: 'var(--text-60)', marginTop: 6, fontWeight: 500 }}>{s.total}</div>
        </div>
      </div>

      {/* Main card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>

        {/* Card header */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px',
          borderBottom: '1px solid var(--border)',
          background: isDark ? 'rgba(16,185,129,.05)' : 'rgba(16,185,129,.03)',
        }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.8" width="18" height="18">
              <rect x="2" y="5" width="20" height="14" rx="2"/>
              <line x1="2" y1="10" x2="22" y2="10"/>
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '.98rem', fontWeight: 700, color: GREEN }}>{s.title}</div>
            <div style={{ fontSize: '.76rem', color: 'var(--text-60)', marginTop: 2 }}>{s.subtitle}</div>
          </div>
          <button className="admin-btn admin-btn--primary" onClick={() => { setEditing({ name: '', isNew: true }); setFormErr('') }}>
            {s.addBtn}
          </button>
        </div>

        {/* Search bar */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ position: 'relative', maxWidth: 320 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-40)" strokeWidth="2" width="14" height="14"
              style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder={s.searchPh}
              style={{
                width: '100%', padding: '8px 12px 8px 32px',
                background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 8,
                color: 'var(--text)', fontSize: '.85rem', fontFamily: 'inherit', outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = GREEN}
              onBlur={e => e.target.style.borderColor = 'var(--border)'}
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ padding: 32, display: 'flex', justifyContent: 'center' }}>
            <style>{`@keyframes pmSpin{to{transform:rotate(360deg)}}`}</style>
            <div style={{ width: 32, height: 32, borderRadius: '50%', border: `3px solid ${isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb'}`, borderTopColor: GREEN, animation: 'pmSpin .7s linear infinite' }}/>
          </div>
        ) : methods.length === 0 ? (
          /* Empty state */
          <div style={{ padding: '48px 32px', textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', margin: '0 auto 18px',
              background: 'rgba(16,185,129,.08)', border: '1.5px dashed rgba(16,185,129,.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="1.6" width="26" height="26">
                <rect x="2" y="5" width="20" height="14" rx="2"/>
                <line x1="2" y1="10" x2="22" y2="10"/>
              </svg>
            </div>
            <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)', marginBottom: 8 }}>{s.emptyTitle}</div>
            <div style={{ fontSize: '.85rem', color: 'var(--text-60)', marginBottom: 20, maxWidth: 340, margin: '0 auto 20px' }}>{s.emptyDesc}</div>
            <button className="admin-btn admin-btn--primary" onClick={() => { setEditing({ name: '', isNew: true }); setFormErr('') }}>{s.emptyAction}</button>
          </div>
        ) : (
          <>
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table" style={{ borderRadius: 0 }}>
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>#</th>
                    <th>{s.colName}</th>
                    <th>{s.colActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m, i) => (
                    <tr key={m}>
                      <td style={{ color: 'var(--text-40)', fontSize: '.8rem', fontWeight: 600 }}>{i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{
                            width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                            background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <svg viewBox="0 0 24 24" fill="none" stroke={GREEN} strokeWidth="2" width="14" height="14">
                              <rect x="2" y="5" width="20" height="14" rx="2"/>
                              <line x1="2" y1="10" x2="22" y2="10"/>
                            </svg>
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '.92rem' }}>{m}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="admin-btn" onClick={() => { setEditing({ name: m, isNew: false, original: m }); setFormErr('') }}>{s.edit}</button>
                          <button className="admin-btn admin-btn--danger" onClick={() => { setDelete(m); setDelErr('') }}>{s.delete}</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {search.trim() && filtered.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-60)', fontSize: '.88rem' }}>{s.noMatch}</div>
            )}
          </>
        )}
      </div>

      {/* Add / Edit modal */}
      {editing && (
        <MethodModal
          initial={editing}
          s={s}
          isAr={isAr}
          saving={saving}
          error={formError}
          onSave={handleSave}
          onClose={() => { setEditing(null); setFormErr('') }}
        />
      )}

      {/* Delete confirm */}
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

function MethodModal({ initial, s, isAr, saving, error, onSave, onClose }) {
  const [name, setName] = useState(initial.name)
  const inputRef = useRef(null)

  useEffect(() => { inputRef.current?.focus() }, [])

  return (
    <div className="admin-modal">
      <div className="admin-modal__box">
        <div className="admin-modal__header">
          <h2 className="admin-modal__title">{initial.isNew ? s.modalAdd : s.modalEdit}</h2>
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
          <label>{s.fldName} <span style={{ color: '#ef4444' }}>{s.required}</span></label>
          <input
            ref={inputRef}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={s.phName}
            onKeyDown={e => { if (e.key === 'Enter') onSave(name, initial.original || null) }}
          />
        </div>

        <div className="admin-actions">
          <button className="admin-btn" onClick={onClose} disabled={saving}>{s.cancel}</button>
          <button className="admin-btn admin-btn--primary" onClick={() => onSave(name, initial.original || null)} disabled={saving}>
            {saving ? '…' : (initial.isNew ? s.create : s.save)}
          </button>
        </div>
      </div>
    </div>
  )
}
