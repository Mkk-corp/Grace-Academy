'use client'

import { useState, useEffect, useMemo } from 'react'
import AdminTableSkeleton from '@/components/admin/AdminTableSkeleton'
import EmptyState from '@/components/ui/EmptyState'
import { useLang } from '@/context/LangContext'
import { PERMISSION_GROUPS, ALL_PERMISSION_IDS, SYSTEM_ROLE_IDS, permLabel } from '@/lib/permissions'

/* ─── Inline icons ────────────────────────────────────────────────── */
function Ic({ children, size = 16, color = 'currentColor' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8"
      strokeLinecap="round" strokeLinejoin="round" width={size} height={size} style={{ flexShrink: 0 }}>
      {children}
    </svg>
  )
}
const IcShield  = p => <Ic {...p}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></Ic>
const IcUsers   = p => <Ic {...p}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></Ic>
const IcEdit    = p => <Ic {...p}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></Ic>
const IcTrash   = p => <Ic {...p}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></Ic>
const IcPlus    = p => <Ic {...p}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></Ic>
const IcX       = p => <Ic {...p}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></Ic>
const IcChevron = p => <Ic {...p}><polyline points="9 18 15 12 9 6"/></Ic>
const IcLock    = p => <Ic {...p}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></Ic>
const IcCheck   = p => <Ic {...p}><polyline points="20 6 9 17 4 12"/></Ic>

function groupIcon(iconId, color, size = 15) {
  const p = { size, color }
  switch (iconId) {
    case 'door':      return <Ic size={size} color={color}><path d="M3 9v6a2 2 0 0 0 2 2h4"/><rect x="9" y="3" width="12" height="18" rx="2"/><line x1="15" y1="12" x2="15.01" y2="12"/></Ic>
    case 'clipboard': return <Ic size={size} color={color}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></Ic>
    case 'book':      return <Ic size={size} color={color}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></Ic>
    case 'users':     return <IcUsers {...p} />
    case 'file':      return <Ic size={size} color={color}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></Ic>
    case 'mail':      return <Ic size={size} color={color}><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></Ic>
    case 'dollar':    return <Ic size={size} color={color}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></Ic>
    case 'globe':     return <Ic size={size} color={color}><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></Ic>
    case 'shield':    return <IcShield {...p} />
    default:          return <IcShield {...p} />
  }
}

const GROUP_COLORS = {
  portal_access:   '#3b82f6',
  placement:       '#8b5cf6',
  courses:         '#c9932c',
  users:           '#10b981',
  blog:            '#f97316',
  website_content: '#06b6d4',
  communications:  '#f59e0b',
  payroll:         '#ec4899',
  administration:  '#ef4444',
}

/* ─── Strings ─────────────────────────────────────────────────────── */
const S = {
  en: {
    title: 'Roles & Permissions',
    addBtn: '+ New Custom Role',
    systemSection: 'System Roles',
    systemDesc: 'Built-in roles managed by the platform — cannot be edited or deleted.',
    customSection: 'Custom Roles',
    customDesc: 'Roles you have created for specific permission sets.',
    noCustom: 'No custom roles yet',
    noCustomDesc: 'Create custom roles to define specific permission sets for your team.',
    colName: 'Role', colPerms: 'Permissions', colUsers: 'Users', colActions: 'Actions',
    systemBadge: 'SYSTEM', customBadge: 'CUSTOM',
    permCount: n => `${n} permission${n !== 1 ? 's' : ''}`,
    editTitle: 'Edit Custom Role', addTitle: 'New Custom Role',
    detailTitle: 'Role Permissions',
    fldName: 'Role Name', fldDesc: 'Description', fldPerms: 'Permissions',
    phName: 'e.g. Content Manager', phDesc: 'Brief description of this role',
    selectAll: 'Select all', clearAll: 'Clear all',
    cancel: 'Cancel', create: 'Create Role', save: 'Save Changes', delete: 'Delete',
    deleteTitle: 'Delete custom role',
    deleteMsg: 'Are you sure you want to delete this role? Users assigned to it will lose their permissions.',
    protected: 'System roles are protected and cannot be modified.',
    forceLogoutNote: 'Saving changes will force all users with this role to sign in again.',
    noPerms: 'No permissions assigned',
  },
  ar: {
    title: 'الأدوار والصلاحيات',
    addBtn: '+ دور مخصص جديد',
    systemSection: 'أدوار النظام',
    systemDesc: 'أدوار مدمجة تديرها المنصة — لا يمكن تعديلها أو حذفها.',
    customSection: 'الأدوار المخصصة',
    customDesc: 'الأدوار التي أنشأتها لمجموعات صلاحيات محددة.',
    noCustom: 'لا توجد أدوار مخصصة بعد',
    noCustomDesc: 'أنشئ أدواراً مخصصة لتحديد مجموعات صلاحيات لفريقك.',
    colName: 'الدور', colPerms: 'الصلاحيات', colUsers: 'المستخدمون', colActions: 'الإجراءات',
    systemBadge: 'نظام', customBadge: 'مخصص',
    permCount: n => `${n} صلاحية`,
    editTitle: 'تعديل الدور المخصص', addTitle: 'دور مخصص جديد',
    detailTitle: 'صلاحيات الدور',
    fldName: 'اسم الدور', fldDesc: 'الوصف', fldPerms: 'الصلاحيات',
    phName: 'مثال: مدير المحتوى', phDesc: 'وصف مختصر لهذا الدور',
    selectAll: 'تحديد الكل', clearAll: 'إلغاء الكل',
    cancel: 'إلغاء', create: 'إنشاء الدور', save: 'حفظ التغييرات', delete: 'حذف',
    deleteTitle: 'حذف الدور المخصص',
    deleteMsg: 'هل أنت متأكد من حذف هذا الدور؟ سيفقد المستخدمون المعيَّنون إليه صلاحياتهم.',
    protected: 'أدوار النظام محمية ولا يمكن تعديلها.',
    forceLogoutNote: 'سيؤدي حفظ التغييرات إلى تسجيل خروج جميع مستخدمي هذا الدور.',
    noPerms: 'لا توجد صلاحيات مضافة',
  },
}

/* ─── Permission groups display ───────────────────────────────────── */
function PermGroupsView({ permissions, isAr }) {
  const active = new Set(permissions)
  const groups = PERMISSION_GROUPS.filter(g => g.permissions.some(p => active.has(p.id)))
  if (groups.length === 0) return <span style={{ color: 'var(--text-40)', fontSize: '.83rem' }}>{isAr ? 'لا توجد صلاحيات' : 'No permissions'}</span>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {groups.map(g => {
        const color = GROUP_COLORS[g.id] || '#6b7280'
        const activePerms = g.permissions.filter(p => active.has(p.id))
        return (
          <div key={g.id}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {groupIcon(g.icon, color, 11)}
              </div>
              <span style={{ fontSize: '.72rem', fontWeight: 700, color, letterSpacing: '.06em', textTransform: 'uppercase' }}>
                {isAr ? g.labelAr : g.labelEn}
              </span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, paddingInlineStart: 28 }}>
              {activePerms.map(p => (
                <span key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: `${color}0f`, border: `1px solid ${color}28`, color, borderRadius: 5, fontSize: '.72rem', padding: '2px 8px', fontWeight: 500 }}>
                  <IcCheck size={9} color={color} />
                  {isAr ? p.labelAr : p.labelEn}
                </span>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* ─── Role detail drawer ──────────────────────────────────────────── */
function RoleDetailDrawer({ role, userCount, onClose, onEdit, onDelete, s, isAr }) {
  const isSystem = role.isSystem || SYSTEM_ROLE_IDS.includes(role.id)
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', justifyContent: 'flex-end' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.35)' }} />
      <div style={{
        position: 'relative', width: 'min(520px,100vw)', height: '100vh',
        background: 'var(--surface)', borderInlineStart: '1px solid var(--border)',
        display: 'flex', flexDirection: 'column', overflowY: 'auto',
        animation: 'slideIn .22s ease',
      }}>
        <style>{`@keyframes slideIn{from{transform:translateX(100%)}to{transform:none}}`}</style>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <div style={{ width: 40, height: 40, borderRadius: 11, background: isSystem ? 'rgba(59,130,246,.1)' : 'rgba(201,147,44,.08)', border: `1.5px solid ${isSystem ? 'rgba(59,130,246,.3)' : 'rgba(201,147,44,.25)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {isSystem ? <IcShield size={18} color="#3b82f6" /> : <IcUsers size={18} color="var(--gold)" />}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text)' }}>{role.name}</span>
              <span style={{ fontSize: '.6rem', fontWeight: 800, padding: '2px 7px', borderRadius: 4, letterSpacing: '.08em',
                background: isSystem ? 'rgba(59,130,246,.1)' : 'rgba(201,147,44,.1)',
                color: isSystem ? '#3b82f6' : 'var(--gold)',
                border: `1px solid ${isSystem ? 'rgba(59,130,246,.25)' : 'rgba(201,147,44,.25)'}`,
              }}>
                {isSystem ? s.systemBadge : s.customBadge}
              </span>
            </div>
            {role.description && <div style={{ fontSize: '.8rem', color: 'var(--text-60)', marginTop: 2 }}>{role.description}</div>}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-40)', padding: 4 }}><IcX size={18} /></button>
        </div>

        {/* Stats */}
        <div style={{ padding: '14px 24px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 20, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <IcUsers size={14} color="var(--text-40)" />
            <span style={{ fontSize: '.82rem', color: 'var(--text-60)' }}>{userCount} {isAr ? 'مستخدم' : 'user(s)'}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
            <IcCheck size={14} color="var(--text-40)" />
            <span style={{ fontSize: '.82rem', color: 'var(--text-60)' }}>{s.permCount(role.permissions.length)}</span>
          </div>
        </div>

        {/* System lock notice */}
        {isSystem && (
          <div style={{ margin: '16px 24px 0', padding: '10px 14px', background: 'rgba(59,130,246,.07)', border: '1px solid rgba(59,130,246,.2)', borderRadius: 9, display: 'flex', gap: 9, alignItems: 'flex-start' }}>
            <IcLock size={14} color="#3b82f6" style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: '.8rem', color: '#3b82f6' }}>{s.protected}</span>
          </div>
        )}

        {/* Permissions */}
        <div style={{ padding: '20px 24px', flex: 1 }}>
          <div style={{ fontWeight: 700, fontSize: '.82rem', letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-40)', marginBottom: 16 }}>
            {s.detailTitle}
          </div>
          <PermGroupsView permissions={role.permissions} isAr={isAr} />
        </div>

        {/* Actions */}
        {!isSystem && (
          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', gap: 10, flexShrink: 0 }}>
            <button className="admin-btn admin-btn--primary" style={{ flex: 1 }} onClick={onEdit}>
              <IcEdit size={14} /> {isAr ? 'تعديل' : 'Edit Role'}
            </button>
            <button className="admin-btn admin-btn--danger" onClick={onDelete}>
              <IcTrash size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ─── Role form modal ─────────────────────────────────────────────── */
function RoleModal({ role, onSave, onClose, s, isAr }) {
  const [form, setForm] = useState(role)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const isNew = role.id?.startsWith('new')

  const activeSet = useMemo(() => new Set(form.permissions), [form.permissions])

  function togglePerm(id) {
    setForm(f => ({
      ...f,
      permissions: activeSet.has(id) ? f.permissions.filter(p => p !== id) : [...f.permissions, id],
    }))
  }

  function toggleGroup(groupId) {
    const group = PERMISSION_GROUPS.find(g => g.id === groupId)
    if (!group) return
    const ids = group.permissions.map(p => p.id)
    const allActive = ids.every(id => activeSet.has(id))
    if (allActive) {
      setForm(f => ({ ...f, permissions: f.permissions.filter(p => !ids.includes(p)) }))
    } else {
      setForm(f => ({ ...f, permissions: [...new Set([...f.permissions, ...ids])] }))
    }
  }

  async function handleSave() {
    setSaving(true); setError('')
    await onSave(form, setError)
    setSaving(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.45)', padding: 16 }}>
      <div style={{ background: 'var(--surface)', borderRadius: 16, border: '1px solid var(--border)', width: '100%', maxWidth: 680, maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--text)' }}>
            {isNew ? s.addTitle : s.editTitle}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-40)' }}><IcX size={18} /></button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          {error && (
            <div style={{ background: 'rgba(239,68,68,.09)', border: '1px solid rgba(239,68,68,.25)', borderRadius: 8, padding: '9px 14px', marginBottom: 16, color: '#ef4444', fontSize: '.85rem' }}>
              {error}
            </div>
          )}

          <div className="admin-field">
            <label>{s.fldName} <span style={{ color: '#ef4444' }}>*</span></label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder={s.phName} />
          </div>
          <div className="admin-field">
            <label>{s.fldDesc}</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder={s.phDesc} />
          </div>

          {/* Permissions grouped */}
          <div className="admin-field" style={{ marginBottom: 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>{s.fldPerms}</span>
              <span style={{ display: 'flex', gap: 8 }}>
                <button type="button" onClick={() => setForm(f => ({ ...f, permissions: ALL_PERMISSION_IDS }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gold)', fontSize: '.78rem', fontWeight: 600, padding: 0 }}>{s.selectAll}</button>
                <span style={{ color: 'var(--text-40)' }}>·</span>
                <button type="button" onClick={() => setForm(f => ({ ...f, permissions: [] }))}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-60)', fontSize: '.78rem', padding: 0 }}>{s.clearAll}</button>
              </span>
            </label>

            {!isNew && (
              <div style={{ padding: '9px 12px', background: 'rgba(201,147,44,.06)', border: '1px solid rgba(201,147,44,.2)', borderRadius: 8, marginBottom: 14, fontSize: '.78rem', color: 'var(--gold)', display: 'flex', gap: 7, alignItems: 'center' }}>
                <IcShield size={13} color="var(--gold)" /> {s.forceLogoutNote}
              </div>
            )}

            <div style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              {PERMISSION_GROUPS.map((group, gi) => {
                const color = GROUP_COLORS[group.id] || '#6b7280'
                const groupPerms = group.permissions.map(p => p.id)
                const activeCount = groupPerms.filter(id => activeSet.has(id)).length
                const allChecked = activeCount === groupPerms.length

                return (
                  <div key={group.id} style={{ borderBottom: gi < PERMISSION_GROUPS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    {/* Group header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 16px', background: `${color}07`, cursor: 'pointer' }}
                      onClick={() => toggleGroup(group.id)}>
                      <div style={{ width: 26, height: 26, borderRadius: 7, background: `${color}15`, border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {groupIcon(group.icon, color, 13)}
                      </div>
                      <span style={{ fontWeight: 700, fontSize: '.82rem', color, flex: 1 }}>{isAr ? group.labelAr : group.labelEn}</span>
                      <span style={{ fontSize: '.72rem', color: activeCount > 0 ? color : 'var(--text-40)', fontWeight: 600 }}>
                        {activeCount}/{groupPerms.length}
                      </span>
                      <div style={{ width: 18, height: 18, borderRadius: 5, border: `2px solid ${allChecked ? color : 'var(--border)'}`, background: allChecked ? color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {allChecked && <IcCheck size={10} color="#fff" />}
                      </div>
                    </div>
                    {/* Permissions */}
                    <div style={{ padding: '8px 16px 12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px' }}>
                      {group.permissions.map(perm => {
                        const on = activeSet.has(perm.id)
                        return (
                          <label key={perm.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', fontSize: '.83rem', color: 'var(--text)', lineHeight: 1.4 }}>
                            <div onClick={() => togglePerm(perm.id)} style={{ marginTop: 2, width: 16, height: 16, borderRadius: 4, border: `2px solid ${on ? color : 'var(--border)'}`, background: on ? color : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer', transition: 'all .12s' }}>
                              {on && <IcCheck size={9} color="#fff" />}
                            </div>
                            <span onClick={() => togglePerm(perm.id)}>{isAr ? perm.labelAr : perm.labelEn}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
          <button className="admin-btn" onClick={onClose}>{s.cancel}</button>
          <button className="admin-btn admin-btn--primary" onClick={handleSave} disabled={saving || !form.name.trim()}>
            {saving ? '…' : isNew ? s.create : s.save}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─── Delete confirm ──────────────────────────────────────────────── */
function DeleteModal({ name, error, onConfirm, onClose, s, isAr }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,.45)', padding: 16 }}>
      <div style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)', width: '100%', maxWidth: 400, padding: 24 }}>
        <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 10, color: 'var(--text)' }}>{s.deleteTitle}</div>
        <div style={{ fontSize: '.88rem', color: 'var(--text-60)', marginBottom: error ? 12 : 20, lineHeight: 1.6 }}>{s.deleteMsg}</div>
        {error && <div style={{ color: '#ef4444', fontSize: '.83rem', marginBottom: 14 }}>{error}</div>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button className="admin-btn" onClick={onClose}>{s.cancel}</button>
          <button className="admin-btn admin-btn--danger" onClick={onConfirm}>{s.delete}</button>
        </div>
      </div>
    </div>
  )
}

/* ─── Role row ────────────────────────────────────────────────────── */
function RoleRow({ role, userCount, onView, onEdit, onDelete, s, isAr }) {
  const isSystem = role.isSystem || SYSTEM_ROLE_IDS.includes(role.id)
  const color = isSystem ? '#3b82f6' : 'var(--gold)'
  const activeGroups = PERMISSION_GROUPS.filter(g => g.permissions.some(p => role.permissions.includes(p.id)))

  return (
    <tr style={{ cursor: 'pointer' }} onClick={onView}>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: isSystem ? 'rgba(59,130,246,.09)' : 'rgba(201,147,44,.08)', border: `1.5px solid ${isSystem ? 'rgba(59,130,246,.25)' : 'rgba(201,147,44,.22)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {isSystem ? <IcShield size={14} color="#3b82f6" /> : <IcUsers size={14} color="var(--gold)" />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span style={{ fontWeight: 600, fontSize: '.9rem', color: 'var(--text)' }}>{role.name}</span>
              <span style={{ fontSize: '.58rem', fontWeight: 800, padding: '2px 6px', borderRadius: 4, letterSpacing: '.07em',
                background: isSystem ? 'rgba(59,130,246,.09)' : 'rgba(201,147,44,.09)',
                color, border: `1px solid ${isSystem ? 'rgba(59,130,246,.22)' : 'rgba(201,147,44,.22)'}`,
              }}>
                {isSystem ? s.systemBadge : s.customBadge}
              </span>
            </div>
            {role.description && <div style={{ fontSize: '.75rem', color: 'var(--text-40)', marginTop: 1 }}>{role.description}</div>}
          </div>
        </div>
      </td>
      <td>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {activeGroups.slice(0, 4).map(g => {
            const gc = GROUP_COLORS[g.id] || '#6b7280'
            const cnt = g.permissions.filter(p => role.permissions.includes(p.id)).length
            return (
              <span key={g.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: `${gc}0f`, border: `1px solid ${gc}28`, color: gc, borderRadius: 5, fontSize: '.7rem', padding: '2px 7px', fontWeight: 600 }}>
                {groupIcon(g.icon, gc, 10)} {isAr ? g.labelAr : g.labelEn} ({cnt})
              </span>
            )
          })}
          {activeGroups.length > 4 && (
            <span style={{ fontSize: '.7rem', color: 'var(--text-40)', padding: '2px 4px' }}>+{activeGroups.length - 4} {isAr ? 'مزيد' : 'more'}</span>
          )}
          {role.permissions.length === 0 && <span style={{ color: 'var(--text-40)', fontSize: '.82rem' }}>{s.noPerms}</span>}
        </div>
      </td>
      <td>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 6, background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
          <IcUsers size={12} color="var(--text-40)" />
          <span style={{ fontSize: '.82rem', fontWeight: 600, color: 'var(--text-60)' }}>{userCount}</span>
        </div>
      </td>
      <td onClick={e => e.stopPropagation()}>
        {isSystem ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.75rem', color: 'var(--text-40)' }}>
            <IcLock size={12} /> {isAr ? 'محمي' : 'Protected'}
          </span>
        ) : (
          <div style={{ display: 'flex', gap: 7 }}>
            <button className="admin-btn" onClick={onEdit}><IcEdit size={13} /> {isAr ? 'تعديل' : 'Edit'}</button>
            <button className="admin-btn admin-btn--danger" onClick={onDelete}><IcTrash size={13} /></button>
          </div>
        )}
      </td>
    </tr>
  )
}

/* ─── Main page ───────────────────────────────────────────────────── */
export default function AdminRolesPage() {
  const { lang } = useLang()
  const s = S[lang] || S.en
  const isAr = lang === 'ar'

  const [roles,   setRoles]   = useState([])
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)

  const [viewRole,   setViewRole]   = useState(null)  // role being viewed in drawer
  const [editRole,   setEditRole]   = useState(null)  // role being edited in modal
  const [deleteRole, setDeleteRole] = useState(null)  // role pending deletion
  const [deleteErr,  setDeleteErr]  = useState('')

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/roles').then(r => r.json()),
      fetch('/api/admin/users').then(r => r.json()),
    ]).then(([r, u]) => { setRoles(Array.isArray(r) ? r : []); setUsers(Array.isArray(u) ? u : []); setLoading(false) })
  }, [])

  const systemRoles = roles.filter(r => r.isSystem || SYSTEM_ROLE_IDS.includes(r.id))
  const customRoles = roles.filter(r => !r.isSystem && !SYSTEM_ROLE_IDS.includes(r.id))

  function userCount(roleId) { return users.filter(u => u.roleId === roleId).length }

  async function handleSave(form, setError) {
    const isNew = form.id?.startsWith('new')
    const res = await fetch('/api/admin/roles', {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error || (isAr ? 'فشل الحفظ' : 'Save failed')); return }
    const fresh = await fetch('/api/admin/roles').then(r => r.json())
    setRoles(Array.isArray(fresh) ? fresh : [])
    setEditRole(null)
    setViewRole(null)
  }

  async function handleDelete() {
    if (!deleteRole) return
    const res = await fetch('/api/admin/roles', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: deleteRole.id }),
    })
    const data = await res.json()
    if (!res.ok) { setDeleteErr(data.error || (isAr ? 'فشل الحذف' : 'Delete failed')); return }
    setRoles(prev => prev.filter(r => r.id !== deleteRole.id))
    setDeleteRole(null); setDeleteErr(''); setViewRole(null)
  }

  function newRole() {
    setEditRole({ id: `new${Date.now()}`, name: '', description: '', permissions: [], isSystem: false })
  }

  function RoleTable({ list, empty }) {
    if (list.length === 0 && empty) return empty
    return (
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{s.colName}</th>
              <th>{s.colPerms}</th>
              <th>{s.colUsers}</th>
              <th>{s.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <AdminTableSkeleton cols={4} rows={3} />
              : list.map(role => (
                <RoleRow
                  key={role.id}
                  role={role}
                  userCount={userCount(role.id)}
                  s={s} isAr={isAr}
                  onView={() => setViewRole(role)}
                  onEdit={() => { setViewRole(null); setEditRole({ ...role }) }}
                  onDelete={() => { setViewRole(null); setDeleteRole(role); setDeleteErr('') }}
                />
              ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <>
      <div className="admin-header">
        <h1>{s.title}</h1>
        <button className="admin-btn admin-btn--primary" onClick={newRole}>
          <IcPlus size={14} /> {s.addBtn}
        </button>
      </div>

      {/* System Roles */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
          <IcShield size={15} color="#3b82f6" />
          <span style={{ fontWeight: 700, fontSize: '.82rem', color: '#3b82f6', letterSpacing: '.07em', textTransform: 'uppercase' }}>{s.systemSection}</span>
        </div>
        <div style={{ fontSize: '.83rem', color: 'var(--text-60)', marginBottom: 14 }}>{s.systemDesc}</div>
        <RoleTable list={loading ? [{id:'_'}] : systemRoles} />
      </div>

      {/* Custom Roles */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 8 }}>
          <IcUsers size={15} color="var(--gold)" />
          <span style={{ fontWeight: 700, fontSize: '.82rem', color: 'var(--gold)', letterSpacing: '.07em', textTransform: 'uppercase' }}>{s.customSection}</span>
        </div>
        <div style={{ fontSize: '.83rem', color: 'var(--text-60)', marginBottom: 14 }}>{s.customDesc}</div>
        <RoleTable
          list={loading ? [] : customRoles}
          empty={!loading && customRoles.length === 0 && (
            <EmptyState title={s.noCustom} description={s.noCustomDesc} actionLabel={s.addBtn} onAction={newRole} />
          )}
        />
      </div>

      {/* Role detail drawer */}
      {viewRole && (
        <RoleDetailDrawer
          role={viewRole}
          userCount={userCount(viewRole.id)}
          s={s} isAr={isAr}
          onClose={() => setViewRole(null)}
          onEdit={() => { setViewRole(null); setEditRole({ ...viewRole }) }}
          onDelete={() => { setViewRole(null); setDeleteRole(viewRole); setDeleteErr('') }}
        />
      )}

      {/* Edit / Create modal */}
      {editRole && (
        <RoleModal role={editRole} onSave={handleSave} onClose={() => setEditRole(null)} s={s} isAr={isAr} />
      )}

      {/* Delete confirm */}
      {deleteRole && (
        <DeleteModal
          name={deleteRole.name}
          error={deleteErr}
          s={s} isAr={isAr}
          onConfirm={handleDelete}
          onClose={() => { setDeleteRole(null); setDeleteErr('') }}
        />
      )}
    </>
  )
}
