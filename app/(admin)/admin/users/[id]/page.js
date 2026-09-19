'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'

const GOLD  = '#c9932c'
const GREEN = '#10b981'
const BLUE  = '#3b82f6'
const RED   = '#ef4444'

/* ── Avatar initials ──────────────────────────────────────────────────── */
function Avatar({ name, avatar, size = 72 }) {
  const initials = (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
  if (avatar) {
    return <img src={avatar} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', border: '3px solid rgba(201,147,44,.3)' }} />
  }
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg,rgba(201,147,44,.25),rgba(201,147,44,.08))',
      border: '2px solid rgba(201,147,44,.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.32, fontWeight: 700, color: GOLD, letterSpacing: '.02em',
      flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

/* ── Info row ─────────────────────────────────────────────────────────── */
function InfoRow({ label, value, mono, color }) {
  if (!value && value !== false && value !== 0) return null
  const display = value === true ? '✓' : value === false ? '✗' : value
  return (
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: 'var(--text-40)', minWidth: 160, flexShrink: 0 }}>
        {label}
      </span>
      <span style={{ fontSize: '.88rem', color: color || 'var(--text)', fontFamily: mono ? "'Courier New',monospace" : 'inherit', wordBreak: 'break-all' }}>
        {display}
      </span>
    </div>
  )
}

/* ── Section card ─────────────────────────────────────────────────────── */
function Section({ title, icon, accent = GOLD, children, isDark }) {
  return (
    <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px', borderBottom: '1px solid var(--border)', background: isDark ? `${accent}0d` : `${accent}08` }}>
        <span style={{ color: accent, display: 'flex', alignItems: 'center' }}>{icon}</span>
        <span style={{ fontWeight: 700, fontSize: '.84rem', color: accent }}>{title}</span>
      </div>
      <div style={{ padding: '4px 18px 12px' }}>{children}</div>
    </div>
  )
}

/* ── Stat badge ───────────────────────────────────────────────────────── */
function Stat({ label, value, color = GOLD }) {
  return (
    <div style={{ textAlign: 'center', padding: '16px 12px', background: `${color}08`, border: `1px solid ${color}20`, borderRadius: 12, flex: 1 }}>
      <div style={{ fontSize: '1.8rem', fontWeight: 800, color, lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontSize: '.72rem', color: 'var(--text-40)', fontWeight: 600, letterSpacing: '.06em', textTransform: 'uppercase' }}>{label}</div>
    </div>
  )
}

/* ── Badge ────────────────────────────────────────────────────────────── */
function Badge({ label, color, bg }) {
  return (
    <span style={{ display: 'inline-block', padding: '3px 10px', borderRadius: 6, fontSize: '.75rem', fontWeight: 700, background: bg || `${color}14`, color, border: `1px solid ${color}30`, marginInlineEnd: 6, marginBottom: 4 }}>
      {label}
    </span>
  )
}

/* ── Icons ────────────────────────────────────────────────────────────── */
const IconUser    = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
const IconShield  = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
const IconBook    = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const IconBriefcase = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
const IconActivity = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
const IconSettings = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="15" height="15"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>

export default function UserDetailPage() {
  const { id } = useParams()
  const router = useRouter()
  const { lang } = useLang()
  const { theme } = useTheme()
  const isAr  = lang === 'ar'
  const isDark = theme === 'dark'

  const [user, setUser]     = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    fetch(`/api/admin/users/${id}?profile=1`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setUser(d.user)
      })
      .catch(() => setError('Failed to load user'))
      .finally(() => setLoading(false))
  }, [id])

  function fmt(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
  }
  function fmtTime(iso) {
    if (!iso) return '—'
    return new Date(iso).toLocaleString(isAr ? 'ar-SA' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }
  const yesNo = (v) => v ? (isAr ? 'نعم' : 'Yes') : (isAr ? 'لا' : 'No')

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: 'var(--text-40)', fontSize: '.9rem' }}>
        {isAr ? 'جارٍ التحميل…' : 'Loading…'}
      </div>
    )
  }

  if (error || !user) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: 12 }}>
        <p style={{ color: RED, fontSize: '.9rem' }}>{error || 'User not found'}</p>
        <button className="admin-btn" onClick={() => router.back()}>← {isAr ? 'رجوع' : 'Go Back'}</button>
      </div>
    )
  }

  const cnt = user._count || {}

  return (
    <>
      {/* Back button + Edit */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
        <button
          className="admin-btn"
          onClick={() => router.push('/admin/users')}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="14" height="14">
            {isAr ? <polyline points="9 18 15 12 9 6"/> : <polyline points="15 18 9 12 15 6"/>}
          </svg>
          {isAr ? 'العودة إلى المستخدمين' : 'Back to Users'}
        </button>
      </div>

      {/* Hero card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 28px 24px', marginBottom: 20, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, insetInlineStart: 0, width: '100%', height: 4, background: 'linear-gradient(90deg,var(--gold-dark),var(--gold))' }} />

        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <Avatar name={user.name} avatar={user.avatar} size={80} />

          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ margin: 0, fontSize: '1.35rem', fontWeight: 800, color: 'var(--text)', lineHeight: 1.2 }}>
              {user.name || '—'}
            </h1>
            {user.username && (
              <div style={{ fontSize: '.82rem', color: 'var(--text-40)', marginTop: 3 }}>@{user.username}</div>
            )}
            <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              {user.role && <Badge label={user.role.name} color={GOLD} />}
              <Badge
                label={user.source === 'website' ? (isAr ? 'الموقع' : 'Website') : (isAr ? 'الإدارة' : 'Admin')}
                color={user.source === 'website' ? GREEN : BLUE}
              />
              {user.googleId && <Badge label={isAr ? 'Google' : 'Google Login'} color="#4285f4" />}
              {user.forcePasswordReset && <Badge label={isAr ? 'يستلزم تغيير كلمة المرور' : 'Must Reset Password'} color={RED} />}
            </div>
            <div style={{ marginTop: 10, fontSize: '.82rem', color: 'var(--text-60)', display: 'flex', flexWrap: 'wrap', gap: 16 }}>
              <span>{user.email}</span>
              {user.phone && <span>{user.phone}</span>}
              <span style={{ color: 'var(--text-40)' }}>{isAr ? 'انضم' : 'Joined'} {fmt(user.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Activity stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <Stat label={isAr ? 'جلسات الطالب' : 'Student Sessions'} value={cnt.bookingsAsStudent ?? 0} color={BLUE} />
        <Stat label={isAr ? 'جلسات المقيّم' : 'Assessor Sessions'} value={cnt.bookingsAsAssessor ?? 0} color={GOLD} />
        <Stat label={isAr ? 'الإشعارات' : 'Notifications'} value={cnt.notifications ?? 0} color={GREEN} />
        <Stat label={isAr ? 'طلبات المواعيد' : 'Slot Requests'} value={cnt.slotRequests ?? 0} color="#8b5cf6" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(420px,1fr))', gap: 16 }}>

        {/* Personal info */}
        <Section title={isAr ? 'المعلومات الشخصية' : 'Personal Information'} icon={IconUser} isDark={isDark}>
          <InfoRow label={isAr ? 'الاسم الكامل'         : 'Full Name'}          value={user.name} />
          <InfoRow label={isAr ? 'اسم المستخدم'         : 'Username'}           value={user.username} mono />
          <InfoRow label={isAr ? 'البريد الإلكتروني'    : 'Email'}              value={user.email} mono />
          <InfoRow label={isAr ? 'رقم الهاتف'           : 'Phone'}              value={user.phone} />
          <InfoRow label={isAr ? 'تاريخ الميلاد'        : 'Date of Birth'}      value={user.dob} />
          <InfoRow label={isAr ? 'الجنس'                : 'Gender'}             value={user.gender} />
          <InfoRow label={isAr ? 'الدولة'               : 'Country'}            value={user.country} />
          <InfoRow label={isAr ? 'المدينة'              : 'City'}               value={user.city} />
          <InfoRow label={isAr ? 'رقم الهوية الوطنية'  : 'National ID'}        value={user.nationalId} />
          <InfoRow label={isAr ? 'جهة الاتصال في حالات الطوارئ' : 'Emergency Contact'} value={user.emergencyContact} />
          {user.bio && <InfoRow label={isAr ? 'نبذة'   : 'Bio'}                value={user.bio} />}
        </Section>

        {/* Education */}
        <Section title={isAr ? 'الخلفية التعليمية' : 'Education & Background'} icon={IconBook} accent={BLUE} isDark={isDark}>
          <InfoRow label={isAr ? 'المستوى التعليمي'   : 'Education Level'}     value={user.educationLevel} />
          <InfoRow label={isAr ? 'الكلية / الجامعة'  : 'Faculty / University'} value={[user.faculty, user.university].filter(Boolean).join(', ')} />
          <InfoRow label={isAr ? 'الدورات المكتملة'  : 'Courses Taken'}        value={user.coursesTaken} />
          <InfoRow label={isAr ? 'المستوى المتوقع'   : 'Expected Level'}       value={user.expectedLevel} />
          <InfoRow label={isAr ? 'مستوى الإنجليزية' : 'English Level'}         value={user.englishLevel} />
        </Section>

        {/* Employment */}
        <Section title={isAr ? 'بيانات العمل' : 'Employment'} icon={IconBriefcase} accent={GREEN} isDark={isDark}>
          <InfoRow label={isAr ? 'موظّف حالياً'       : 'Currently Employed'}  value={user.isEmployed !== null && user.isEmployed !== undefined ? yesNo(user.isEmployed) : null} />
          <InfoRow label={isAr ? 'المسمى الوظيفي'     : 'Job Title'}           value={user.jobTitle} />
          <InfoRow label={isAr ? 'جهة العمل'          : 'Employer'}            value={user.employer} />
          <InfoRow label={isAr ? 'خبرة في التدريس'    : 'Teaching Experience'} value={user.teachingExperience !== null && user.teachingExperience !== undefined ? yesNo(user.teachingExperience) : null} />
          <InfoRow label={isAr ? 'مكان التدريس'       : 'Teaching Where'}      value={user.teachingWhere} />
        </Section>

        {/* Account & Security */}
        <Section title={isAr ? 'الحساب والأمان' : 'Account & Security'} icon={IconShield} accent="#8b5cf6" isDark={isDark}>
          <InfoRow label={isAr ? 'الدور'               : 'Role'}               value={user.role?.name} />
          <InfoRow label={isAr ? 'المصدر'              : 'Source'}             value={user.source === 'website' ? (isAr ? 'الموقع' : 'Website') : (isAr ? 'الإدارة' : 'Admin')} />
          <InfoRow label={isAr ? 'تسجيل دخول Google'  : 'Google Login'}       value={user.googleId ? (isAr ? 'مرتبط' : 'Connected') : (isAr ? 'غير مرتبط' : 'Not connected')} />
          <InfoRow label={isAr ? 'معرّف المستخدم'      : 'User ID'}            value={user.id} mono />
          <InfoRow label={isAr ? 'يستلزم تغيير كلمة المرور' : 'Force Password Reset'} value={yesNo(user.forcePasswordReset)} />
          <InfoRow label={isAr ? 'نسخة الجلسة'         : 'Session Version'}    value={user.sessionVersion} />
          <InfoRow label={isAr ? 'تاريخ الإنشاء'       : 'Created At'}         value={fmtTime(user.createdAt)} />
          <InfoRow label={isAr ? 'آخر تحديث'           : 'Updated At'}         value={fmtTime(user.updatedAt)} />
        </Section>

        {/* System / Activity */}
        <Section title={isAr ? 'النشاط والنظام' : 'Activity & System'} icon={IconActivity} accent={GOLD} isDark={isDark}>
          <InfoRow label={isAr ? 'جلسات كطالب'        : 'Sessions as Student'}  value={cnt.bookingsAsStudent ?? 0} />
          <InfoRow label={isAr ? 'جلسات كمقيّم'       : 'Sessions as Assessor'} value={cnt.bookingsAsAssessor ?? 0} />
          <InfoRow label={isAr ? 'إجمالي الجلسات'     : 'Total Sessions'}       value={(cnt.bookingsAsStudent ?? 0) + (cnt.bookingsAsAssessor ?? 0)} />
          <InfoRow label={isAr ? 'الإشعارات'           : 'Notifications'}        value={cnt.notifications ?? 0} />
          <InfoRow label={isAr ? 'طلبات المواعيد'     : 'Slot Requests'}         value={cnt.slotRequests ?? 0} />
          <InfoRow label={isAr ? 'جدول المقيّم'        : 'Assessor Schedule'}    value={user.scheduleTemplate ? (isAr ? 'موجود' : 'Configured') : (isAr ? 'غير موجود' : 'Not set')} />
          {user.assessorPreference && (
            <>
              <InfoRow label={isAr ? 'اللهجة المفضّلة' : 'Accent Preference'}   value={user.assessorPreference.accent} />
              <InfoRow label={isAr ? 'المواضيع المفضّلة' : 'Topic Preferences'} value={(user.assessorPreference.topics || []).join(', ')} />
            </>
          )}
        </Section>

        {/* Role permissions */}
        {user.role?.permissions?.length > 0 && (
          <Section title={isAr ? 'صلاحيات الدور' : 'Role Permissions'} icon={IconSettings} accent={BLUE} isDark={isDark}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingTop: 8 }}>
              {user.role.permissions.map(p => (
                <Badge key={p} label={p} color={BLUE} />
              ))}
            </div>
          </Section>
        )}

      </div>
    </>
  )
}
