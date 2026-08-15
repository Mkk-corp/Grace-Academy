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
    tabStudents: 'Students', tabStaff: 'Academy Staff',
    colName: 'Name', colEmail: 'Email', colPhone: 'Phone', colRole: 'Role',
    colSource: 'Source', colJoinedAt: 'Joined At', colActions: 'Actions',
    emptyStudents: 'No students yet', emptyStudentsDesc: 'Students who register from the website will appear here.',
    emptyStaff: 'No staff yet', emptyStaffDesc: 'Add assessors, teachers, and admin users here.',
    emptyAction: 'Add User',
    unassigned: 'Unassigned', srcWebsite: 'Website', srcAdmin: 'Admin',
    edit: 'Edit', delete: 'Delete',
    modalAdd: 'Add User', modalEdit: 'Edit User',
    fldName: 'Full Name', fldUsername: 'Username', fldEmail: 'Email', fldPhone: 'Phone',
    fldPassword: 'Password', fldPasswordEdit: 'New Password (leave blank to keep)',
    fldRole: 'Role', noRole: '— No Role —',
    phName: 'Full name', phUsername: 'username', phEmail: 'email@example.com', phPhone: '+966 5xx xxx xxxx',
    phPass: 'Password', phPassEdit: 'Leave blank to keep current',
    cancel: 'Cancel', create: 'Create User', saveChanges: 'Save Changes',
    deleteTitle: 'Delete User', deleteBtn: 'Yes, Delete',
    deleteChecking: 'Checking related data…',
    deleteWillRemove: 'Deleting this user will permanently remove:',
    deleteSessions: 'placement session(s)',
    deleteSchedule: 'Assessor schedule & availability slots',
    deleteRequests: 'Pending schedule change requests',
    deleteOther: 'Login sessions & notifications',
    deleteCannotUndo: 'This cannot be undone.',
    required: '*',
  },
  ar: {
    title: 'المستخدمون', addBtn: '+ إضافة مستخدم',
    tabStudents: 'الطلاب', tabStaff: 'فريق الأكاديمية',
    colName: 'الاسم', colEmail: 'البريد الإلكتروني', colPhone: 'الهاتف', colRole: 'الدور',
    colSource: 'المصدر', colJoinedAt: 'تاريخ الانضمام', colActions: 'الإجراءات',
    emptyStudents: 'لا يوجد طلاب بعد', emptyStudentsDesc: 'الطلاب الذين يسجلون من الموقع سيظهرون هنا.',
    emptyStaff: 'لا يوجد فريق بعد', emptyStaffDesc: 'أضف المقيّمين والمعلمين والمسؤولين من هنا.',
    emptyAction: 'إضافة مستخدم',
    unassigned: 'غير معيَّن', srcWebsite: 'الموقع', srcAdmin: 'الإدارة',
    edit: 'تعديل', delete: 'حذف',
    modalAdd: 'إضافة مستخدم', modalEdit: 'تعديل المستخدم',
    fldName: 'الاسم الكامل', fldUsername: 'اسم المستخدم', fldEmail: 'البريد الإلكتروني', fldPhone: 'رقم الهاتف',
    fldPassword: 'كلمة المرور', fldPasswordEdit: 'كلمة مرور جديدة (اتركه فارغاً للإبقاء على الحالية)',
    fldRole: 'الدور', noRole: '— بدون دور —',
    phName: 'الاسم الكامل', phUsername: 'اسم_المستخدم', phEmail: 'بريدك@example.com', phPhone: '+966 5xx xxx xxxx',
    phPass: 'كلمة المرور', phPassEdit: 'اتركه فارغاً للإبقاء على الحالية',
    cancel: 'إلغاء', create: 'إنشاء مستخدم', saveChanges: 'حفظ التغييرات',
    deleteTitle: 'حذف المستخدم', deleteBtn: 'نعم، احذف',
    deleteChecking: 'جارٍ التحقق من البيانات المرتبطة…',
    deleteWillRemove: 'حذف هذا المستخدم سيزيل نهائياً:',
    deleteSessions: 'جلسة/جلسات تحديد المستوى',
    deleteSchedule: 'جدول المقيّم والمواعيد المتاحة',
    deleteRequests: 'طلبات تغيير الجدول المعلّقة',
    deleteOther: 'جلسات تسجيل الدخول والإشعارات',
    deleteCannotUndo: 'لا يمكن التراجع عن هذا الإجراء.',
    required: '*',
  },
}

export default function AdminUsersPage() {
  const { lang } = useLang()
  const s = S[lang] || S.en
  const isAr = lang === 'ar'

  const [users, setUsers]           = useState([])
  const [roles, setRoles]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [activeTab, setActiveTab]   = useState('students')
  const [editing, setEditing]       = useState(null)
  const [error, setError]           = useState('')
  const [deleteTarget, setDelete]   = useState(null)
  const [deleteError, setDelErr]    = useState('')
  const [deleteChecking, setDelCheck] = useState(false)
  const [relatedData, setRelatedData] = useState(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/admin/roles').then(r => r.json()),
    ]).then(([u, r]) => { setUsers(u); setRoles(r); setLoading(false) })
  }, [])

  // A user is staff if their role has any permission besides access_student_portal
  function isStaffUser(user) {
    if (!user.roleId) return false
    const role = roles.find(r => r.id === user.roleId)
    if (!role) return false
    return (role.permissions || []).some(p => p !== 'access_student_portal')
  }

  const staffUsers   = users.filter(u =>  isStaffUser(u))
  const studentUsers = users.filter(u => !isStaffUser(u))
  const visibleUsers = activeTab === 'staff' ? staffUsers : studentUsers

  async function save(user) {
    const isNew = user.id.startsWith('new')
    const res = await fetch('/api/admin/users', {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || (isAr ? 'فشل الحفظ' : 'Save failed')); return false }
    setError('')
    setUsers(await fetch('/api/admin/users').then(r => r.json()))
    if (!isNew) setEditing(null)
    return true
  }

  async function handleDeleteClick(user) {
    setDelete({ id: user.id, name: user.name || user.email })
    setRelatedData(null); setDelErr(''); setDelCheck(true)
    try {
      const res = await fetch(`/api/admin/users/${user.id}`)
      if (res.ok) setRelatedData(await res.json())
    } catch {}
    setDelCheck(false)
  }

  function closeDeleteModal() {
    setDelete(null); setRelatedData(null); setDelErr(''); setDelCheck(false)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    const res = await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deleteTarget.id }),
    })
    if (!res.ok) { setDelErr(isAr ? 'فشل الحذف. حاول مرة أخرى.' : 'Delete failed. Please try again.'); return }
    setUsers(prev => prev.filter(u => u.id !== deleteTarget.id))
    closeDeleteModal()
  }

  function roleName(roleId) { return roles.find(r => r.id === roleId)?.name || '—' }
  function formatDate(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  const newUser = () => setEditing({ id: `new${Date.now()}`, name: '', username: '', email: '', phone: '', password: '', roleId: '', source: 'admin' })

  const tabStyle = (tab) => ({
    padding: '8px 20px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontSize: '.88rem',
    fontWeight: 600,
    transition: 'all .15s',
    background: activeTab === tab ? 'var(--gold)' : 'transparent',
    color: activeTab === tab ? '#fff' : 'var(--text-60)',
  })

  const tabCount = (count) => (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 20, height: 20, borderRadius: 10, fontSize: '.72rem', fontWeight: 700,
      padding: '0 5px', marginInlineStart: 6,
      background: 'rgba(255,255,255,.2)',
    }}>
      {count}
    </span>
  )

  return (
    <>
      <div className="admin-header">
        <h1>{s.title}</h1>
        <button className="admin-btn admin-btn--primary" onClick={newUser}>{s.addBtn}</button>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'inline-flex', gap: 4, background: 'var(--surface-2, rgba(255,255,255,.04))',
        border: '1px solid var(--border)', borderRadius: 10, padding: 4, marginBottom: 20,
      }}>
        <button style={tabStyle('students')} onClick={() => setActiveTab('students')}>
          {s.tabStudents}
          {!loading && tabCount(studentUsers.length)}
        </button>
        <button style={tabStyle('staff')} onClick={() => setActiveTab('staff')}>
          {s.tabStaff}
          {!loading && tabCount(staffUsers.length)}
        </button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: '#ef4444', fontSize: '.88rem' }}>
          {error}
        </div>
      )}

      {/* Students tab */}
      {activeTab === 'students' && (
        <>
          {!loading && studentUsers.length === 0 && (
            <EmptyState title={s.emptyStudents} description={s.emptyStudentsDesc} actionLabel={s.emptyAction} onAction={newUser} />
          )}
          {(loading || studentUsers.length > 0) && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{s.colName}</th>
                    <th>{s.colEmail}</th>
                    <th>{s.colPhone}</th>
                    <th>{s.colSource}</th>
                    <th>{s.colActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? <AdminTableSkeleton cols={5} rows={6} /> : studentUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{user.name || '—'}</div>
                        {user.username && <div style={{ fontSize: '.78rem', color: 'var(--text-60)' }}>@{user.username}</div>}
                      </td>
                      <td style={{ fontSize: '.88rem' }}>{user.email}</td>
                      <td style={{ fontSize: '.88rem', color: 'var(--text-60)' }}>{user.phone || '—'}</td>
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
                      <td style={{ display: 'flex', gap: 8 }}>
                        <button className="admin-btn" onClick={() => setEditing({ ...user, password: '' })}>{s.edit}</button>
                        <button className="admin-btn admin-btn--danger" onClick={() => handleDeleteClick(user)}>{s.delete}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* Staff tab */}
      {activeTab === 'staff' && (
        <>
          {!loading && staffUsers.length === 0 && (
            <EmptyState title={s.emptyStaff} description={s.emptyStaffDesc} actionLabel={s.emptyAction} onAction={newUser} />
          )}
          {(loading || staffUsers.length > 0) && (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{s.colName}</th>
                    <th>{s.colEmail}</th>
                    <th>{s.colPhone}</th>
                    <th>{s.colRole}</th>
                    <th>{s.colJoinedAt}</th>
                    <th>{s.colActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? <AdminTableSkeleton cols={6} rows={6} /> : staffUsers.map(user => (
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
                      <td style={{ fontSize: '.82rem', color: 'var(--text-60)', whiteSpace: 'nowrap' }}>
                        {formatDate(user.createdAt)}
                      </td>
                      <td style={{ display: 'flex', gap: 8 }}>
                        <button className="admin-btn" onClick={() => setEditing({ ...user, password: '' })}>{s.edit}</button>
                        <button className="admin-btn admin-btn--danger" onClick={() => handleDeleteClick(user)}>{s.delete}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {editing && <UserModal user={editing} roles={roles} onSave={save} onClose={() => { setEditing(null); setError('') }} s={s} />}

      <Modal
        open={!!deleteTarget}
        onClose={closeDeleteModal}
        onConfirm={deleteChecking ? undefined : confirmDelete}
        variant="delete"
        confirmText={s.deleteBtn}
        cancelText={s.cancel}
      >
        <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(220,38,38,.1)', border: '1px solid rgba(220,38,38,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" width="24" height="24">
            <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text)', marginBottom: 12, paddingRight: 24 }}>
          {s.deleteTitle} — <span style={{ color: '#dc2626' }}>{deleteTarget?.name}</span>
        </h3>
        {deleteChecking ? (
          <p style={{ fontSize: '.875rem', color: 'var(--text-60)', lineHeight: 1.65 }}>{s.deleteChecking}</p>
        ) : (
          <>
            <p style={{ fontSize: '.875rem', color: 'var(--text-60)', marginBottom: 10 }}>{s.deleteWillRemove}</p>
            <ul style={{ margin: '0 0 10px', padding: isAr ? '0 18px 0 0' : '0 0 0 18px', fontSize: '.85rem', color: 'var(--text-70)', lineHeight: 2 }}>
              {relatedData?.bookingCount > 0 && (
                <li style={{ color: '#dc2626', fontWeight: 600 }}>{relatedData.bookingCount} {s.deleteSessions}</li>
              )}
              {relatedData?.hasSchedule && <li>{s.deleteSchedule}</li>}
              {relatedData?.hasSlotRequests && <li>{s.deleteRequests}</li>}
              <li>{s.deleteOther}</li>
            </ul>
            <p style={{ fontSize: '.8rem', color: '#dc2626', fontWeight: 700 }}>{s.deleteCannotUndo}</p>
          </>
        )}
        {deleteError && (
          <p style={{ fontSize: '.82rem', color: '#ef4444', marginTop: 8, fontWeight: 500 }}>{deleteError}</p>
        )}
      </Modal>
    </>
  )
}

/* ── Copy field with clipboard button ──────────────────────────────────── */
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

/* ── User create / edit modal ──────────────────────────────────────────── */
function UserModal({ user, roles, onSave, onClose, s }) {
  const { lang } = useLang()
  const { theme } = useTheme()
  const isAr  = lang === 'ar'
  const isDark = theme === 'dark'
  const [form, setForm] = useState(user)
  const [saving, setSaving] = useState(false)
  const [creds, setCreds] = useState(null)
  const isNew = user.id.startsWith('new')
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const parsed = parsePhone(user.phone)
  const [phoneCountry, setPhoneCountry] = useState(parsed.country)
  const [phoneNumber,  setPhoneNumber]  = useState(parsed.number)

  async function handleSave() {
    if (saving) return
    setSaving(true)
    const phone = phoneNumber.trim() ? `${phoneCountry.dial} ${phoneNumber.trim()}` : ''
    const ok = await onSave({ ...form, phone })
    if (!ok) { setSaving(false); return }
    if (isNew) setCreds({ email: form.email, username: form.username, password: form.password })
  }

  /* Credentials screen shown after successful creation */
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
            <CopyField label={isAr ? 'البريد الإلكتروني' : 'Email'}             value={creds.email}    isDark={isDark} />
            <CopyField label={isAr ? 'اسم المستخدم'      : 'Username'}          value={creds.username} isDark={isDark} />
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

  /* Form */
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
            {saving ? (isAr ? 'جارٍ الحفظ…' : 'Saving…') : isNew ? s.create : s.saveChanges}
          </button>
        </div>
      </div>
    </div>
  )
}
