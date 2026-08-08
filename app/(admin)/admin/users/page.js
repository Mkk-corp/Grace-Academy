'use client'

import { useState, useEffect } from 'react'
import AdminTableSkeleton from '@/components/admin/AdminTableSkeleton'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { useLang } from '@/context/LangContext'
import PhoneInput from '@/components/ui/PhoneInput'
import Select from '@/components/ui/Select'
import { useTheme } from '@/context/ThemeContext'
import { DEFAULT_COUNTRY, parsePhone } from '@/lib/countries'

const S = {
  en: {
    title: 'Users', addBtn: '+ Add User',
    colName: 'Name', colEmail: 'Email', colPhone: 'Phone', colRole: 'Role', colSource: 'Source', colJoined: 'Joined', colActions: 'Actions',
    emptyTitle: 'No users yet', emptyDesc: 'Users who register from the website will appear here. You can also add users manually.', emptyAction: 'Add User',
    unassigned: 'Unassigned', srcWebsite: 'Website', srcAdmin: 'Admin',
    edit: 'Edit', delete: 'Delete',
    modalAdd: 'Add User', modalEdit: 'Edit User',
    fldName: 'Full Name', fldUsername: 'Username', fldEmail: 'Email', fldPhone: 'Phone',
    fldPassword: 'Password', fldPasswordEdit: 'New Password (leave blank to keep)',
    fldRole: 'Role', noRole: '— No Role —',
    phName: 'Full name', phUsername: 'username', phEmail: 'email@example.com', phPhone: '+966 5xx xxx xxxx',
    phPass: 'Password', phPassEdit: 'Leave blank to keep current',
    cancel: 'Cancel', create: 'Create User', saveChanges: 'Save Changes',
    deleteTitle: 'Delete user', deleteMsg: 'Are you sure you want to delete this user? This action cannot be undone.', deleteBtn: 'Delete',
    required: '*',
  },
  ar: {
    title: 'المستخدمون', addBtn: '+ إضافة مستخدم',
    colName: 'الاسم', colEmail: 'البريد الإلكتروني', colPhone: 'الهاتف', colRole: 'الدور', colSource: 'المصدر', colJoined: 'تاريخ الانضمام', colActions: 'الإجراءات',
    emptyTitle: 'لا يوجد مستخدمون بعد', emptyDesc: 'المستخدمون الذين يسجلون من الموقع سيظهرون هنا. يمكنك أيضاً إضافتهم يدوياً.', emptyAction: 'إضافة مستخدم',
    unassigned: 'غير معيَّن', srcWebsite: 'الموقع', srcAdmin: 'الإدارة',
    edit: 'تعديل', delete: 'حذف',
    modalAdd: 'إضافة مستخدم', modalEdit: 'تعديل المستخدم',
    fldName: 'الاسم الكامل', fldUsername: 'اسم المستخدم', fldEmail: 'البريد الإلكتروني', fldPhone: 'رقم الهاتف',
    fldPassword: 'كلمة المرور', fldPasswordEdit: 'كلمة مرور جديدة (اتركه فارغاً للإبقاء على الحالية)',
    fldRole: 'الدور', noRole: '— بدون دور —',
    phName: 'الاسم الكامل', phUsername: 'اسم_المستخدم', phEmail: 'بريدك@example.com', phPhone: '+966 5xx xxx xxxx',
    phPass: 'كلمة المرور', phPassEdit: 'اتركه فارغاً للإبقاء على الحالية',
    cancel: 'إلغاء', create: 'إنشاء مستخدم', saveChanges: 'حفظ التغييرات',
    deleteTitle: 'حذف المستخدم', deleteMsg: 'هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.', deleteBtn: 'حذف',
    required: '*',
  },
}

export default function AdminUsersPage() {
  const { lang } = useLang()
  const s = S[lang] || S.en
  const [users, setUsers]           = useState([])
  const [roles, setRoles]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [editing, setEditing]       = useState(null)
  const [error, setError]           = useState('')
  const [deleteTarget, setDelete]   = useState(null)
  const [deleteError, setDelErr]    = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/admin/roles').then(r => r.json()),
    ]).then(([u, r]) => { setUsers(u); setRoles(r); setLoading(false) })
  }, [])

  async function save(user) {
    const isNew = user.id.startsWith('new')
    const res = await fetch('/api/admin/users', {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || (lang === 'ar' ? 'فشل الحفظ' : 'Save failed')); return false }
    setError('')
    setUsers(await fetch('/api/admin/users').then(r => r.json()))
    if (!isNew) setEditing(null) // edits close immediately; new-user stays open for creds screen
    return true
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deleteTarget }),
    })
    if (!res.ok) { setDelErr(lang === 'ar' ? 'فشل الحذف. حاول مرة أخرى.' : 'Delete failed. Please try again.'); return }
    setUsers(prev => prev.filter(u => u.id !== deleteTarget))
    setDelete(null); setDelErr('')
  }

  function roleName(roleId) { return roles.find(r => r.id === roleId)?.name || '—' }
  function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const newUser = () => setEditing({ id: `new${Date.now()}`, name: '', username: '', email: '', phone: '', password: '', roleId: '', source: 'admin' })

  return (
    <>
      <div className="admin-header">
        <h1>{s.title}</h1>
        <button className="admin-btn admin-btn--primary" onClick={newUser}>{s.addBtn}</button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: '#ef4444', fontSize: '.88rem' }}>
          {error}
        </div>
      )}

      {!loading && users.length === 0 && (
        <EmptyState title={s.emptyTitle} description={s.emptyDesc} actionLabel={s.emptyAction} onAction={newUser} />
      )}
      {(loading || users.length > 0) && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{s.colName}</th><th>{s.colEmail}</th><th>{s.colPhone}</th>
                <th>{s.colRole}</th><th>{s.colSource}</th><th>{s.colJoined}</th><th>{s.colActions}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? <AdminTableSkeleton cols={7} rows={6} /> : users.map(user => (
                <tr key={user.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{user.name || '—'}</div>
                    {user.username && <div style={{ fontSize: '.78rem', color: 'var(--text-60)' }}>@{user.username}</div>}
                  </td>
                  <td style={{ fontSize: '.88rem' }}>{user.email}</td>
                  <td style={{ fontSize: '.88rem', color: 'var(--text-60)' }}>{user.phone || '—'}</td>
                  <td>
                    {user.roleId
                      ? <span style={{ background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.2)', color: 'var(--gold)', borderRadius: 4, fontSize: '.78rem', padding: '2px 8px' }}>{roleName(user.roleId)}</span>
                      : <span style={{ color: 'var(--text-40)', fontSize: '.82rem' }}>{s.unassigned}</span>}
                  </td>
                  <td>
                    <span style={{
                      background: user.source === 'website' ? 'rgba(74,222,128,.1)' : 'rgba(96,165,250,.1)',
                      border: `1px solid ${user.source === 'website' ? 'rgba(74,222,128,.3)' : 'rgba(96,165,250,.3)'}`,
                      color: user.source === 'website' ? '#4ade80' : '#60a5fa',
                      borderRadius: 4, fontSize: '.75rem', padding: '2px 7px',
                    }}>
                      {user.source === 'website' ? s.srcWebsite : s.srcAdmin}
                    </span>
                  </td>
                  <td style={{ fontSize: '.82rem', color: 'var(--text-60)' }}>{formatDate(user.createdAt)}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="admin-btn" onClick={() => setEditing({ ...user, password: '' })}>{s.edit}</button>
                    <button className="admin-btn admin-btn--danger" onClick={() => { setDelete(user.id); setDelErr('') }}>{s.delete}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && <UserModal user={editing} roles={roles} onSave={save} onClose={() => { setEditing(null); setError('') }} s={s} />}

      <Modal open={!!deleteTarget} onClose={() => { setDelete(null); setDelErr('') }} onConfirm={confirmDelete}
        variant="delete" title={s.deleteTitle} message={deleteError || s.deleteMsg} confirmText={s.deleteBtn} cancelText={s.cancel} />
    </>
  )
}

/* ── Copy field with clipboard button ───────────────────────────────── */
function CopyField({ label, value, isDark }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    const text = String(value)
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => fallback(text))
    } else {
      fallback(text)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  function fallback(text) {
    const el = document.createElement('textarea')
    el.value = text
    el.style.position = 'fixed'; el.style.opacity = '0'
    document.body.appendChild(el); el.select()
    try { document.execCommand('copy') } catch {}
    document.body.removeChild(el)
  }
  return (
    <div style={{ background: isDark ? 'rgba(255,255,255,.03)' : '#f8fafc', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontSize: '.68rem', fontWeight: 700, letterSpacing: '.1em', color: 'var(--gold)', textTransform: 'uppercase', marginBottom: 5 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <code style={{ flex: 1, fontSize: '.9rem', fontFamily: "'Courier New',monospace", color: 'var(--text)', wordBreak: 'break-all' }}>{value}</code>
        <button
          type="button"
          onClick={copy}
          style={{
            flexShrink: 0, width: 32, height: 32, borderRadius: 6,
            background: copied ? 'rgba(16,185,129,.1)' : 'var(--accent-dim)',
            border: `1px solid ${copied ? 'rgba(16,185,129,.3)' : 'var(--border-gold)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', transition: 'all .15s',
          }}
        >
          {copied
            ? <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" width="14" height="14"><polyline points="20 6 9 17 4 12"/></svg>
            : <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" width="14" height="14"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          }
        </button>
      </div>
    </div>
  )
}

function UserModal({ user, roles, onSave, onClose, s }) {
  const { lang } = useLang()
  const { theme } = useTheme()
  const isAr  = lang === 'ar'
  const isDark = theme === 'dark'
  const [form, setForm] = useState(user)
  const [saving, setSaving] = useState(false)
  const [creds, setCreds] = useState(null) // null | { email, username, password }
  const isNew = user.id.startsWith('new')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const parsed = parsePhone(user.phone)
  const [phoneCountry, setPhoneCountry] = useState(parsed.country)
  const [phoneNumber,  setPhoneNumber]  = useState(parsed.number)

  async function handleSave() {
    if (saving) return
    setSaving(true)
    const phone = phoneNumber.trim()
      ? `${phoneCountry.dial} ${phoneNumber.trim()}`
      : ''
    const ok = await onSave({ ...form, phone })
    if (!ok) { setSaving(false); return }
    if (isNew) setCreds({ email: form.email, username: form.username, password: form.password })
  }

  /* ── Success / credentials screen ── */
  if (creds) {
    return (
      <div className="admin-modal">
        <div className="admin-modal__box">
          <div className="admin-modal__header">
            <h2 className="admin-modal__title">{isAr ? 'تم إنشاء الحساب!' : 'Account Created!'}</h2>
            <button className="admin-modal__close" onClick={onClose} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(16,185,129,.1)', border: '2px solid rgba(16,185,129,.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" width="24" height="24"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <p style={{ fontSize: '.85rem', color: 'var(--text-60)', lineHeight: 1.6 }}>
              {isAr
                ? `تم إنشاء الحساب وإرسال بريد الترحيب إلى ${creds.email}`
                : `Account created — welcome email sent to ${creds.email}`}
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            <CopyField label={isAr ? 'البريد الإلكتروني' : 'Email'} value={creds.email} isDark={isDark} />
            <CopyField label={isAr ? 'اسم المستخدم' : 'Username'} value={creds.username} isDark={isDark} />
            <CopyField label={isAr ? 'كلمة المرور المؤقتة' : 'Temporary Password'} value={creds.password} isDark={isDark} />
          </div>

          <div className="admin-actions">
            <button className="admin-btn admin-btn--primary" onClick={onClose}>
              {isAr ? 'تم' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  /* ── Form ── */
  return (
    <div className="admin-modal">
      <div className="admin-modal__box">
        <div className="admin-modal__header">
          <h2 className="admin-modal__title">{isNew ? s.modalAdd : s.modalEdit}</h2>
          <button className="admin-modal__close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <div className="admin-field">
            <label>{s.fldName}</label>
            <input value={form.name} onChange={e => set('name', e.target.value)} placeholder={s.phName} />
          </div>
          <div className="admin-field">
            <label>{s.fldUsername} {isNew && <span style={{ color: '#ef4444' }}>{s.required}</span>}</label>
            <input value={form.username} onChange={e => set('username', e.target.value)} placeholder={s.phUsername} disabled={!isNew} style={!isNew ? { opacity: .55 } : {}} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <div className="admin-field">
            <label>{s.fldEmail} {isNew && <span style={{ color: '#ef4444' }}>{s.required}</span>}</label>
            <input type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder={s.phEmail} />
          </div>
          <div className="admin-field">
            <label>{s.fldPhone}</label>
            <PhoneInput
              country={phoneCountry}
              number={phoneNumber}
              onCountryChange={setPhoneCountry}
              onNumberChange={setPhoneNumber}
              isAr={isAr}
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          <div className="admin-field">
            <label>{isNew ? <>{s.fldPassword} <span style={{ color: '#ef4444' }}>{s.required}</span></> : s.fldPasswordEdit}</label>
            <input type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder={isNew ? s.phPass : s.phPassEdit} />
          </div>
          <div className="admin-field">
            <label>{s.fldRole}</label>
            <Select
              value={form.roleId || ''}
              onChange={v => set('roleId', v || null)}
              options={[
                { value: '', label: s.noRole, labelAr: s.noRole },
                ...roles.map(r => ({ value: r.id, label: r.name, labelAr: r.name })),
              ]}
              isAr={isAr} isDark={isDark}
            />
          </div>
        </div>

        <div className="admin-actions">
          <button className="admin-btn" onClick={onClose} disabled={saving}>{s.cancel}</button>
          <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving}>
            {saving
              ? <>{isAr ? 'جارٍ الحفظ…' : 'Saving…'}</>
              : isNew ? s.create : s.saveChanges}
          </button>
        </div>
      </div>
    </div>
  )
}
