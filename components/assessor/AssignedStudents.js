'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'

function slotMinToTime(slotMin) {
  const h    = Math.floor(slotMin / 60)
  const m    = slotMin % 60
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12  = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`
}

export default function AssignedStudents({ isAr, isDark }) {
  const [students, setStudents] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [expanded, setExpanded] = useState(null)

  useEffect(() => {
    fetch('/api/assessor/assigned-students')
      .then(r => r.ok ? r.json() : { students: [] })
      .then(d => { setStudents(d.students || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const border = isDark ? 'rgba(255,255,255,.07)' : '#e5e7eb'
  const surface = isDark ? '#10222b' : '#fff'
  const muted = isDark ? 'rgba(255,255,255,.45)' : '#6b7280'
  const text  = isDark ? '#f1f5f9' : '#111827'
  const gold  = '#c9932c'

  if (loading) return (
    <div style={{ padding: 60, textAlign: 'center', color: muted }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%', margin: '0 auto 14px',
        border: `3px solid ${isDark ? 'rgba(255,255,255,.1)' : '#e5e7eb'}`,
        borderTopColor: gold, animation: 'asSpin .7s linear infinite',
      }}/>
      <style>{`@keyframes asSpin{to{transform:rotate(360deg)}}`}</style>
      {isAr ? 'جارٍ التحميل...' : 'Loading...'}
    </div>
  )

  if (students.length === 0) return (
    <div style={{ padding: '60px 24px', textAlign: 'center' }}>
      <div style={{
        width: 56, height: 56, borderRadius: '50%', margin: '0 auto 14px',
        background: 'rgba(201,147,44,.08)', border: '1.5px dashed rgba(201,147,44,.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke={gold} strokeWidth="1.8">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>
      </div>
      <div style={{ fontWeight: 700, color: text, marginBottom: 6 }}>
        {isAr ? 'لا يوجد طلاب معيّنون بعد' : 'No assigned students yet'}
      </div>
      <div style={{ fontSize: '.82rem', color: muted }}>
        {isAr ? 'ستظهر بيانات الطلاب هنا بعد حجز الجلسات' : 'Student data will appear here once sessions are booked'}
      </div>
    </div>
  )

  return (
    <div style={{ padding: '28px 24px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, color: text, margin: '0 0 4px' }}>
          {isAr ? 'الطلاب المعيّنون' : 'Assigned Students'}
        </h2>
        <p style={{ fontSize: '.82rem', color: muted, margin: 0 }}>
          {students.length} {isAr ? 'طالب' : students.length === 1 ? 'student' : 'students'}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {students.map(s => {
          const isOpen = expanded === s.id
          return (
            <div key={s.id} style={{
              background: surface, border: `1px solid ${border}`,
              borderRadius: 14, overflow: 'hidden',
              boxShadow: isDark ? '0 1px 4px rgba(0,0,0,.35)' : '0 1px 3px rgba(0,0,0,.07)',
            }}>
              {/* Row header — always visible */}
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px',
                  cursor: 'pointer',
                }}
                onClick={() => setExpanded(isOpen ? null : s.id)}
              >
                <Image
                  src={`/images/avatar-${s.avatar || 'user1'}.svg`}
                  alt={s.name}
                  width={40} height={40}
                  style={{ borderRadius: '50%', border: `2px solid rgba(201,147,44,.3)`, flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '.9rem', color: text }}>{s.name}</div>
                  <div style={{ fontSize: '.75rem', color: muted }}>{s.email}</div>
                </div>
                {s.sessionDate && (
                  <div style={{ textAlign: isAr ? 'left' : 'right', flexShrink: 0 }}>
                    <div style={{ fontSize: '.7rem', fontWeight: 700, color: gold, letterSpacing: '.06em' }}>
                      {isAr ? 'الجلسة' : 'SESSION'}
                    </div>
                    <div style={{ fontSize: '.8rem', color: text, fontWeight: 600 }}>
                      {s.sessionDate} — {slotMinToTime(s.sessionSlotMin)}
                    </div>
                  </div>
                )}
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none"
                  stroke={muted} strokeWidth="2"
                  style={{ transition: 'transform .18s', transform: isOpen ? 'rotate(90deg)' : 'none', flexShrink: 0 }}>
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </div>

              {/* Expanded details */}
              {isOpen && (
                <div style={{
                  borderTop: `1px solid ${border}`,
                  padding: '20px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 16,
                }}>
                  {[
                    { label: isAr ? 'الهاتف' : 'Phone',               val: s.phone || '—' },
                    { label: isAr ? 'تاريخ الميلاد' : 'Date of Birth', val: s.dob || '—' },
                    { label: isAr ? 'الجنس' : 'Gender',               val: s.gender || '—' },
                    { label: isAr ? 'البلد' : 'Country',              val: s.country || '—' },
                    { label: isAr ? 'المستوى التعليمي' : 'Education Level',  val: s.educationLevel || '—' },
                    { label: isAr ? 'دورات سابقة' : 'Prior Courses',        val: s.coursesTaken || '—' },
                    { label: isAr ? 'المستوى المتوقع' : 'Expected Level',    val: s.expectedLevel || '—' },
                    { label: isAr ? 'موظف؟' : 'Employed',
                      val: s.isEmployed === true ? (isAr ? 'نعم' : 'Yes') : s.isEmployed === false ? (isAr ? 'لا' : 'No') : '—' },
                    { label: isAr ? 'المسمى الوظيفي' : 'Job Title',    val: s.jobTitle || '—' },
                    { label: isAr ? 'جهة العمل' : 'Employer',         val: s.employer || '—' },
                  ].map(({ label, val }) => (
                    <div key={label}>
                      <div style={{ fontSize: '.67rem', fontWeight: 700, letterSpacing: '.1em', color: muted, textTransform: 'uppercase', marginBottom: 3 }}>
                        {label}
                      </div>
                      <div style={{ fontSize: '.85rem', color: text, fontWeight: 500 }}>{val}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
