'use client'

import { useState, useEffect } from 'react'
import AdminTableSkeleton from '@/components/admin/AdminTableSkeleton'
import Modal from '@/components/ui/Modal'
import EmptyState from '@/components/ui/EmptyState'
import { useLang } from '@/context/LangContext'

const ALL_PERMISSIONS = [
  { id: 'manage_users',           labelEn: 'Manage Users',         labelAr: 'إدارة المستخدمين'     },
  { id: 'manage_roles',           labelEn: 'Manage Roles',         labelAr: 'إدارة الأدوار'         },
  { id: 'manage_content',         labelEn: 'Manage Content',       labelAr: 'إدارة المحتوى'         },
  { id: 'manage_blog',            labelEn: 'Manage Blog',          labelAr: 'إدارة المدونة'         },
  { id: 'manage_services',        labelEn: 'Manage Services',      labelAr: 'إدارة الخدمات'         },
  { id: 'manage_portfolio',       labelEn: 'Manage Portfolio',     labelAr: 'إدارة الأعمال'         },
  { id: 'manage_faq',             labelEn: 'Manage FAQ',           labelAr: 'إدارة الأسئلة الشائعة' },
  { id: 'manage_pricing',         labelEn: 'Manage Pricing',       labelAr: 'إدارة الأسعار'         },
  { id: 'manage_stats',           labelEn: 'Manage Stats',         labelAr: 'إدارة الإحصائيات'      },
  { id: 'view_messages',          labelEn: 'View Messages',        labelAr: 'عرض الرسائل'           },
  { id: 'access_student_portal',  labelEn: 'Access Student Portal',labelAr: 'الوصول لبوابة الطالب'  },
]

const S = {
  en: {
    title: 'Roles', addBtn: '+ Add Role',
    colName: 'Role Name', colDesc: 'Description', colPerms: 'Permissions', colUsers: 'Users', colActions: 'Actions',
    emptyTitle: 'No roles defined yet', emptyDesc: 'Create roles to control what each user type can access in the system.', emptyAction: 'Add Role',
    none: 'None',
    modalAdd: 'Add Role', modalEdit: 'Edit Role',
    fldName: 'Role Name', fldDesc: 'Description', fldPerms: 'Permissions',
    phName: 'e.g. Content Manager', phDesc: 'Short description of this role',
    selectAll: 'Select all', clearAll: 'Clear',
    cancel: 'Cancel', create: 'Create Role', saveChanges: 'Save Changes',
    deleteTitle: 'Delete role', deleteMsg: 'Are you sure you want to delete this role? Users assigned to it will lose their permissions.', deleteBtn: 'Delete',
  },
  ar: {
    title: 'الأدوار', addBtn: '+ إضافة دور',
    colName: 'اسم الدور', colDesc: 'الوصف', colPerms: 'الصلاحيات', colUsers: 'المستخدمون', colActions: 'الإجراءات',
    emptyTitle: 'لا توجد أدوار بعد', emptyDesc: 'أنشئ أدواراً للتحكم في ما يمكن لكل نوع من المستخدمين الوصول إليه.', emptyAction: 'إضافة دور',
    none: 'لا شيء',
    modalAdd: 'إضافة دور', modalEdit: 'تعديل الدور',
    fldName: 'اسم الدور', fldDesc: 'الوصف', fldPerms: 'الصلاحيات',
    phName: 'مثال: مدير المحتوى', phDesc: 'وصف مختصر لهذا الدور',
    selectAll: 'تحديد الكل', clearAll: 'إلغاء الكل',
    cancel: 'إلغاء', create: 'إنشاء الدور', saveChanges: 'حفظ التغييرات',
    deleteTitle: 'حذف الدور', deleteMsg: 'هل أنت متأكد من حذف هذا الدور؟ سيفقد المستخدمون المعيَّنون إليه صلاحياتهم.', deleteBtn: 'حذف',
  },
}

export default function AdminRolesPage() {
  const { lang } = useLang()
  const s = S[lang] || S.en
  const isAr = lang === 'ar'
  const [roles, setRoles]         = useState([])
  const [users, setUsers]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [editing, setEditing]     = useState(null)
  const [error, setError]         = useState('')
  const [deleteTarget, setDelete] = useState(null)
  const [deleteError, setDelErr]  = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/roles').then(r => r.json()),
      fetch('/api/admin/users').then(r => r.json()),
    ]).then(([r, u]) => { setRoles(r); setUsers(u); setLoading(false) })
  }, [])

  async function save(role) {
    const isNew = role.id.startsWith('new')
    const res = await fetch('/api/admin/roles', {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(role),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || (isAr ? 'فشل الحفظ' : 'Save failed')); return }
    setError('')
    setRoles(await fetch('/api/admin/roles').then(r => r.json()))
    setEditing(null)
  }

  async function confirmDelete() {
    if (!deleteTarget) return
    const res = await fetch('/api/admin/roles', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deleteTarget }),
    })
    const data = await res.json()
    if (!res.ok) { setDelErr(data.error || (isAr ? 'فشل الحذف' : 'Delete failed')); return }
    setRoles(prev => prev.filter(r => r.id !== deleteTarget))
    setDelete(null); setDelErr('')
  }

  function usersWithRole(roleId) { return users.filter(u => u.roleId === roleId).length }
  const newRole = () => setEditing({ id: `new${Date.now()}`, name: '', description: '', permissions: [] })

  return (
    <>
      <div className="admin-header">
        <h1>{s.title}</h1>
        <button className="admin-btn admin-btn--primary" onClick={newRole}>{s.addBtn}</button>
      </div>

      {error && (
        <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid rgba(239,68,68,.3)', borderRadius: 8, padding: '10px 16px', marginBottom: 16, color: '#ef4444', fontSize: '.88rem' }}>
          {error}
        </div>
      )}

      {!loading && roles.length === 0 && (
        <EmptyState title={s.emptyTitle} description={s.emptyDesc} actionLabel={s.emptyAction} onAction={newRole} />
      )}
      {(loading || roles.length > 0) && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>{s.colName}</th><th>{s.colDesc}</th><th>{s.colPerms}</th><th>{s.colUsers}</th><th>{s.colActions}</th></tr>
            </thead>
            <tbody>
              {loading ? <AdminTableSkeleton cols={5} rows={4} /> : roles.map(role => (
                <tr key={role.id}>
                  <td style={{ fontWeight: 600 }}>{role.name}</td>
                  <td style={{ color: 'var(--text-60)', fontSize: '.88rem' }}>{role.description || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {role.permissions.length === 0
                        ? <span style={{ color: 'var(--text-40)', fontSize: '.82rem' }}>{s.none}</span>
                        : role.permissions.map(p => {
                          const perm = ALL_PERMISSIONS.find(x => x.id === p)
                          return (
                            <span key={p} style={{ background: 'rgba(201,147,44,.1)', border: '1px solid rgba(201,147,44,.2)', color: 'var(--gold)', borderRadius: 4, fontSize: '.75rem', padding: '2px 7px', whiteSpace: 'nowrap' }}>
                              {isAr ? perm?.labelAr : perm?.labelEn || p}
                            </span>
                          )
                        })}
                    </div>
                  </td>
                  <td>{usersWithRole(role.id)}</td>
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button className="admin-btn" onClick={() => setEditing({ ...role })}>{isAr ? 'تعديل' : 'Edit'}</button>
                    <button className="admin-btn admin-btn--danger" onClick={() => { setDelete(role.id); setDelErr('') }}>{isAr ? 'حذف' : 'Delete'}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && <RoleModal role={editing} onSave={save} onClose={() => { setEditing(null); setError('') }} s={s} isAr={isAr} />}

      <Modal open={!!deleteTarget} onClose={() => { setDelete(null); setDelErr('') }} onConfirm={confirmDelete}
        variant="delete" title={s.deleteTitle} message={deleteError || s.deleteMsg} confirmText={s.deleteBtn} cancelText={s.cancel} />
    </>
  )
}

function RoleModal({ role, onSave, onClose, s, isAr }) {
  const [form, setForm] = useState(role)
  const isNew = role.id.startsWith('new')

  function togglePerm(id) {
    setForm(f => ({
      ...f,
      permissions: f.permissions.includes(id)
        ? f.permissions.filter(p => p !== id)
        : [...f.permissions, id],
    }))
  }

  return (
    <div className="admin-modal">
      <div className="admin-modal__box" style={{ maxWidth: 560 }}>
        <div className="admin-modal__header">
          <h2 className="admin-modal__title">{isNew ? s.modalAdd : s.modalEdit}</h2>
          <button className="admin-modal__close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div className="admin-field">
          <label>{s.fldName}</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={s.phName} />
        </div>
        <div className="admin-field">
          <label>{s.fldDesc}</label>
          <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder={s.phDesc} />
        </div>

        <div className="admin-field">
          <label>
            {s.fldPerms}
            <span style={{ fontWeight: 400, marginInlineStart: 12, fontSize: '.8rem', color: 'var(--text-60)' }}>
              <button type="button" onClick={() => setForm(f => ({ ...f, permissions: ALL_PERMISSIONS.map(p => p.id) }))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold)', fontSize: '.8rem', padding: 0 }}>
                {s.selectAll}
              </button>
              {' · '}
              <button type="button" onClick={() => setForm(f => ({ ...f, permissions: [] }))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-60)', fontSize: '.8rem', padding: 0 }}>
                {s.clearAll}
              </button>
            </span>
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 8, border: '1px solid var(--border)' }}>
            {ALL_PERMISSIONS.map(({ id, labelEn, labelAr }) => (
              <label key={id} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: '.88rem', color: 'var(--text)', fontWeight: 400 }}>
                <input type="checkbox" checked={form.permissions.includes(id)} onChange={() => togglePerm(id)}
                  style={{ width: 15, height: 15, accentColor: 'var(--gold)', cursor: 'pointer' }} />
                {isAr ? labelAr : labelEn}
              </label>
            ))}
          </div>
        </div>

        <div className="admin-actions">
          <button className="admin-btn" onClick={onClose}>{s.cancel}</button>
          <button className="admin-btn admin-btn--primary" onClick={() => onSave(form)}>
            {isNew ? s.create : s.saveChanges}
          </button>
        </div>
      </div>
    </div>
  )
}
