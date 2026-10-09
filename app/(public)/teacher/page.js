'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useLang } from '@/context/LangContext'
import { useTheme } from '@/context/ThemeContext'
import PortalTopbar from '@/components/portal/PortalTopbar'
import Breadcrumb from '@/components/ui/Breadcrumb'
import CourseCatalog from '@/components/shared/CourseCatalog'
import TeacherOnboardingOverlay from '@/components/teacher/TeacherOnboardingOverlay'
import TeacherWeeklySchedule from '@/components/teacher/TeacherWeeklySchedule'
import TeacherSlotRequests from '@/components/teacher/TeacherSlotRequests'
import NotificationBell from '@/components/ui/NotificationBell'

/* ─── Assigned Courses tab (gamified) ──────────────────────────── */
const LEVEL_META = {
  A1: { color: '#10b981', label: 'Beginner',       labelAr: 'مبتدئ',       emoji: '🌱' },
  A2: { color: '#06b6d4', label: 'Elementary',     labelAr: 'ابتدائي',     emoji: '💧' },
  B1: { color: '#3b82f6', label: 'Intermediate',   labelAr: 'متوسط',       emoji: '⚡' },
  B2: { color: '#6366f1', label: 'Upper-Inter.',   labelAr: 'فوق المتوسط', emoji: '🔮' },
  C1: { color: '#8b5cf6', label: 'Advanced',       labelAr: 'متقدم',       emoji: '🏆' },
  C2: { color: '#c9932c', label: 'Mastery',        labelAr: 'إتقان',       emoji: '👑' },
}

function AssignedCoursesTab({ isAr, isDark }) {
  const [courses,    setCourses]    = useState([])
  const [loading,    setLoading]    = useState(true)
  const [expanded,   setExpanded]   = useState(null)
  const [newCourse,  setNewCourse]  = useState(null) // course to show in popup
  const [popupDone,  setPopupDone]  = useState(false)

  useEffect(() => {
    fetch('/api/teacher/assigned-courses')
      .then(r => r.json())
      .then(d => {
        const list = d.courses || []
        setCourses(list)
        setLoading(false)

        /* One-time new-assignment popup logic */
        if (list.length === 0) return
        try {
          const seenTs = localStorage.getItem('ga_teacher_last_assignment_seen') || '0'
          const seenDate = new Date(seenTs === '0' ? 0 : seenTs)
          /* Find courses assigned after the last-seen timestamp */
          const fresh = list
            .filter(c => new Date(c.assignedAt) > seenDate)
            .sort((a, b) => new Date(b.assignedAt) - new Date(a.assignedAt))
          if (fresh.length > 0 && !popupDone) {
            setNewCourse(fresh[0])
          }
        } catch {}
      })
      .catch(() => setLoading(false))
  }, [])

  function dismissPopup() {
    try {
      /* Mark all currently-assigned courses as seen */
      const latest = courses.reduce((max, c) => {
        const t = new Date(c.assignedAt)
        return t > max ? t : max
      }, new Date(0))
      localStorage.setItem('ga_teacher_last_assignment_seen', latest.toISOString())
    } catch {}
    setNewCourse(null)
    setPopupDone(true)
  }

  const totalSessions = courses.reduce((s, c) => s + (c.durationSessions || 0), 0)
  const totalMonths   = courses.reduce((s, c) => s + (c.durationMonths   || 0), 0)
  const uniqueLevels  = [...new Set(courses.map(c => c.level).filter(Boolean))]

  if (loading) return (
    <div style={{ padding: '80px 24px', textAlign: 'center', color: 'var(--tc-muted)' }}>
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'tcSpin .7s linear infinite', display:'inline-block' }}>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
      </svg>
    </div>
  )

  return (
    <>
      <style>{`
        @keyframes tcSpin{to{transform:rotate(360deg)}}
        @keyframes acFadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        @keyframes acCardIn{from{opacity:0;transform:translateY(24px) scale(.96)}to{opacity:1;transform:none}}
        @keyframes acPop{0%{transform:scale(.5) rotate(-15deg)}70%{transform:scale(1.08) rotate(3deg)}100%{transform:scale(1) rotate(0deg)}}
        @keyframes acFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes acStar{0%,100%{transform:scale(1) rotate(0)}50%{transform:scale(1.18) rotate(10deg)}}
        @keyframes acConfetti0{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(-90px,180px) rotate(540deg);opacity:0}}
        @keyframes acConfetti1{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(60px,200px) rotate(-480deg);opacity:0}}
        @keyframes acConfetti2{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(110px,160px) rotate(600deg);opacity:0}}
        @keyframes acConfetti3{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(-50px,220px) rotate(-360deg);opacity:0}}
        @keyframes acConfetti4{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(80px,240px) rotate(420deg);opacity:0}}
        @keyframes acConfetti5{0%{transform:translate(0,0) rotate(0);opacity:1}100%{transform:translate(-120px,190px) rotate(-540deg);opacity:0}}
        @keyframes acBounceIn{0%{opacity:0;transform:scale(.4)}60%{transform:scale(1.1)}80%{transform:scale(.95)}100%{opacity:1;transform:scale(1)}}
        @keyframes acShimmer{0%{background-position:-200% center}100%{background-position:200% center}}

        .ac-card{transition:transform .22s ease,box-shadow .22s ease;cursor:pointer}
        .ac-card:hover{transform:translateY(-4px) scale(1.015);box-shadow:0 12px 40px rgba(0,0,0,.16) !important}

        .ac-stat-chip{transition:transform .18s,box-shadow .18s}
        .ac-stat-chip:hover{transform:scale(1.04);box-shadow:0 6px 20px rgba(0,0,0,.14)}

        .ac-lvl-badge{
          background-size:200% auto;
          animation:acShimmer 2.5s linear infinite;
        }
      `}</style>

      {/* ── One-time new assignment popup ── */}
      {newCourse && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.7)', backdropFilter: 'blur(8px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => e.target === e.currentTarget && dismissPopup()}
        >
          {/* Confetti pieces */}
          {['#c9932c','#10b981','#6366f1','#ef4444','#06b6d4','#f59e0b'].map((col, i) => (
            <div key={i} style={{ position: 'fixed', top: '35%', left: '50%', width: i % 2 === 0 ? 10 : 8, height: i % 2 === 0 ? 10 : 14, borderRadius: i % 3 === 0 ? 2 : '50%', background: col, animation: `acConfetti${i} ${1.6 + i * 0.18}s ease-out ${0.3 + i * 0.12}s both`, pointerEvents: 'none', zIndex: 1001 }} />
          ))}

          <div style={{ background: isDark ? '#10222b' : '#fff', borderRadius: 24, maxWidth: 460, width: '100%', padding: '36px 32px', textAlign: 'center', boxShadow: '0 32px 80px rgba(0,0,0,.45)', animation: 'acBounceIn .5s cubic-bezier(.34,1.56,.64,1)', position: 'relative', overflow: 'hidden' }}>
            {/* Background glow */}
            <div style={{ position: 'absolute', top: -60, left: '50%', transform: 'translateX(-50%)', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,147,44,.14) 0%, transparent 65%)', pointerEvents: 'none' }} />

            {/* Illustration */}
            <div style={{ animation: 'acFloat 3s ease-in-out infinite', marginBottom: 20 }}>
              <img src="/images/assign-course.svg" alt="" width="150" style={{ display: 'inline-block', filter: isDark ? 'none' : 'drop-shadow(0 8px 24px rgba(201,147,44,.25))' }} />
            </div>

            {/* Stars */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 12 }}>
              {[0, 0.15, 0.3].map((d, i) => (
                <svg key={i} viewBox="0 0 24 24" width="20" height="20" fill="#f59e0b" style={{ animation: `acStar 1.8s ease-in-out ${d}s infinite` }}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              ))}
            </div>

            <div style={{ fontSize: '.78rem', fontWeight: 800, letterSpacing: '.16em', textTransform: 'uppercase', color: '#c9932c', marginBottom: 10 }}>
              {isAr ? '🎉 تعيين جديد' : '🎉 New Assignment'}
            </div>
            <h2 style={{ fontSize: 'clamp(1.1rem, 3vw, 1.5rem)', fontWeight: 900, color: isDark ? '#f1f5f9' : '#111827', lineHeight: 1.25, marginBottom: 8 }}>
              {isAr ? 'مبروك! تم تعيينك لدورة جديدة' : "Congratulations! You've been assigned a new course"}
            </h2>

            {/* Course name pill */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 100, background: 'rgba(201,147,44,.1)', border: '1.5px solid rgba(201,147,44,.35)', marginBottom: 16, maxWidth: '100%' }}>
              {newCourse.level && (() => {
                const lm = LEVEL_META[newCourse.level]
                return lm ? (
                  <span style={{ fontSize: '.72rem', fontWeight: 800, padding: '2px 8px', borderRadius: 100, background: `${lm.color}20`, border: `1px solid ${lm.color}40`, color: lm.color, flexShrink: 0 }}>{newCourse.level}</span>
                ) : null
              })()}
              <span style={{ fontWeight: 700, fontSize: '.9rem', color: '#c9932c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {isAr ? (newCourse.nameAr || newCourse.nameEn) : newCourse.nameEn}
              </span>
            </div>

            <p style={{ fontSize: '.84rem', color: isDark ? 'rgba(255,255,255,.5)' : '#6b7280', lineHeight: 1.65, marginBottom: 24, maxWidth: 340, margin: '0 auto 24px' }}>
              {isAr
                ? 'أنت الآن مسؤول عن تدريس هذه الدورة. استكشفها من تبويب الدورات المعيّنة.'
                : "You're now responsible for teaching this course. Explore it in your Assigned Courses tab."}
            </p>

            <button
              onClick={dismissPopup}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 40px', borderRadius: 100, background: 'linear-gradient(135deg, #c9932c, #e8b455)', border: 'none', color: '#fff', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 28px rgba(201,147,44,.45)', transition: 'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(201,147,44,.55)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(201,147,44,.45)' }}
            >
              {isAr ? "هيا نبدأ! 🚀" : "Let's Go! 🚀"}
            </button>
          </div>
        </div>
      )}

      {/* ── Main tab content ── */}
      <div style={{ padding: '28px 24px', maxWidth: 980, margin: '0 auto' }}>

        {/* Hero header */}
        <div style={{ background: 'linear-gradient(135deg, #0a1822 0%, #10222b 100%)', borderRadius: 18, padding: '28px 32px', marginBottom: 26, position: 'relative', overflow: 'hidden', animation: 'acFadeUp .3s ease' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,147,44,.2) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: -30, left: '20%', width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,.15) 0%, transparent 65%)', pointerEvents: 'none' }} />
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontSize: '.7rem', fontWeight: 800, letterSpacing: '.18em', color: 'rgba(201,147,44,.7)', marginBottom: 6 }}>
                {isAr ? 'بوابة المعلم' : 'TEACHER PORTAL'}
              </div>
              <h2 style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 6, margin: 0 }}>
                {isAr ? 'الدورات المعيّنة' : 'Assigned Courses'}
              </h2>
              <p style={{ margin: '6px 0 0', fontSize: '.82rem', color: 'rgba(255,255,255,.4)' }}>
                {courses.length === 0
                  ? (isAr ? 'لم يتم تعيين أي دورات بعد' : 'No courses assigned yet')
                  : isAr
                    ? `${courses.length} دورة معيّنة لك`
                    : `${courses.length} course${courses.length !== 1 ? 's' : ''} assigned to you`}
              </p>
            </div>
            {courses.length > 0 && (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {[
                  { val: courses.length, label: isAr ? 'دورة' : 'Courses', color: '#c9932c' },
                  { val: totalSessions || '—', label: isAr ? 'جلسة' : 'Sessions', color: '#6366f1' },
                  { val: totalMonths   || '—', label: isAr ? 'شهر' : 'Months',   color: '#10b981' },
                ].map(s => (
                  <div key={s.label} className="ac-stat-chip" style={{ background: `${s.color}14`, border: `1px solid ${s.color}30`, borderRadius: 12, padding: '10px 16px', textAlign: 'center', minWidth: 72, cursor: 'default' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.val}</div>
                    <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.45)', marginTop: 3 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Level coverage badges */}
        {uniqueLevels.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 22, flexWrap: 'wrap', animation: 'acFadeUp .35s ease' }}>
            <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'var(--tc-muted)', letterSpacing: '.08em' }}>
              {isAr ? 'المستويات:' : 'LEVELS:'}
            </span>
            {uniqueLevels.sort().map(lvl => {
              const lm = LEVEL_META[lvl]
              if (!lm) return null
              return (
                <span key={lvl} className="ac-lvl-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: '.72rem', fontWeight: 800, padding: '4px 12px', borderRadius: 100, background: `linear-gradient(90deg, ${lm.color}22, ${lm.color}10, ${lm.color}22)`, border: `1.5px solid ${lm.color}45`, color: lm.color, letterSpacing: '.05em', animation: 'acShimmer 2.5s linear infinite', backgroundSize: '200% auto' }}>
                  {lm.emoji} {lvl} <span style={{ fontWeight: 600, opacity: .75 }}>· {isAr ? lm.labelAr : lm.label}</span>
                </span>
              )
            })}
          </div>
        )}

        {/* Empty state */}
        {courses.length === 0 && (
          <div style={{ background: 'var(--tc-surface)', border: '1.5px dashed var(--tc-border)', borderRadius: 20, padding: '64px 32px', textAlign: 'center', animation: 'acFadeUp .3s ease' }}>
            <div style={{ animation: 'acFloat 3.5s ease-in-out infinite', marginBottom: 24 }}>
              <img src="/images/assign-course.svg" alt="" width="140" style={{ opacity: .65 }} />
            </div>
            <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--tc-text)', marginBottom: 10 }}>
              {isAr ? 'لا توجد دورات معيّنة بعد' : 'No courses assigned yet'}
            </div>
            <div style={{ fontSize: '.84rem', color: 'var(--tc-muted)', maxWidth: 380, margin: '0 auto', lineHeight: 1.65 }}>
              {isAr ? 'سيقوم الإدارة بتعيين الدورات لك قريباً. ستصلك رسالة بريد إلكتروني وإشعار عند التعيين.' : "The admin will assign courses to you soon. You'll receive an email and in-app notification when that happens."}
            </div>
          </div>
        )}

        {/* Course cards grid */}
        {courses.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(295px, 1fr))', gap: 18 }}>
            {courses.map((course, idx) => {
              const name     = isAr ? (course.nameAr || course.nameEn) : course.nameEn
              const catName  = isAr ? (course.category?.nameAr || course.category?.nameEn) : course.category?.nameEn
              const lm       = LEVEL_META[course.level] || null
              const isOpen   = expanded === course.id

              return (
                <div
                  key={course.id}
                  className="ac-card"
                  onClick={() => setExpanded(isOpen ? null : course.id)}
                  style={{ background: 'var(--tc-surface)', border: `1px solid ${isOpen ? (lm?.color + '50' || 'var(--tc-border)') : 'var(--tc-border)'}`, borderRadius: 16, overflow: 'hidden', display: 'flex', flexDirection: 'column', animation: `acCardIn .35s ease ${idx * 0.06}s both`, boxShadow: isOpen ? `0 8px 30px ${lm?.color || '#c9932c'}22` : 'var(--tc-shadow)', position: 'relative' }}
                >
                  {/* Level-colored header strip */}
                  <div style={{ height: 5, background: lm ? `linear-gradient(90deg, ${lm.color}, ${lm.color}88)` : 'var(--tc-gold)', flexShrink: 0 }} />

                  {/* Course image or gradient placeholder */}
                  {course.image ? (
                    <div style={{ height: 128, overflow: 'hidden', background: 'var(--tc-hover)', flexShrink: 0 }}>
                      <img src={course.image} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform .35s ease' }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                        onError={e => { e.currentTarget.parentElement.style.display = 'none' }} />
                    </div>
                  ) : (
                    <div style={{ height: 100, background: lm ? `linear-gradient(135deg, ${lm.color}14, ${lm.color}06)` : 'linear-gradient(135deg,rgba(201,147,44,.1),rgba(201,147,44,.03))', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '2.5rem', animation: 'acStar 3s ease-in-out infinite' }}>{lm?.emoji || '📘'}</span>
                    </div>
                  )}

                  <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Title + level badge */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ fontSize: '.92rem', fontWeight: 800, color: 'var(--tc-text)', lineHeight: 1.35, flex: 1 }}>{name}</div>
                      {lm && (
                        <span style={{ fontSize: '.62rem', fontWeight: 800, padding: '3px 9px', borderRadius: 100, background: `${lm.color}18`, border: `1.5px solid ${lm.color}45`, color: lm.color, flexShrink: 0, letterSpacing: '.06em', whiteSpace: 'nowrap' }}>
                          {course.level}
                        </span>
                      )}
                    </div>

                    {/* Category chip */}
                    {catName && (
                      <span style={{ fontSize: '.71rem', fontWeight: 600, color: 'var(--tc-gold)', background: 'var(--tc-gold-bg)', border: '1px solid var(--tc-gold-bd)', padding: '3px 10px', borderRadius: 100, alignSelf: 'flex-start' }}>{catName}</span>
                    )}

                    {/* Duration chips */}
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {course.durationSessions > 0 && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '.71rem', color: 'var(--tc-muted)', background: isDark ? 'rgba(255,255,255,.04)' : '#f3f4f6', padding: '3px 10px', borderRadius: 100, border: '1px solid var(--tc-border)' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          {course.durationSessions} {isAr ? 'جلسة' : 'sessions'}
                        </span>
                      )}
                      {course.durationMonths > 0 && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '.71rem', color: 'var(--tc-muted)', background: isDark ? 'rgba(255,255,255,.04)' : '#f3f4f6', padding: '3px 10px', borderRadius: 100, border: '1px solid var(--tc-border)' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                          {course.durationMonths} {isAr ? 'شهر' : 'months'}
                        </span>
                      )}
                    </div>

                    {/* Level label row */}
                    {lm && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8, background: `${lm.color}0c`, border: `1px solid ${lm.color}20` }}>
                        <span style={{ fontSize: '.78rem', fontWeight: 700, color: lm.color }}>{lm.emoji} {isAr ? 'المستوى المطلوب:' : 'Required level:'}</span>
                        <span style={{ fontSize: '.78rem', fontWeight: 800, color: lm.color }}>{course.level} — {isAr ? lm.labelAr : lm.label}</span>
                      </div>
                    )}

                    {/* Expandable detail section */}
                    {isOpen && (
                      <div style={{ borderTop: '1px solid var(--tc-border)', paddingTop: 12, animation: 'acFadeUp .18s ease' }}>
                        {(course.descEn || course.descAr) && (
                          <p style={{ fontSize: '.82rem', color: 'var(--tc-muted)', lineHeight: 1.65, margin: '0 0 10px' }}>
                            {isAr ? (course.descAr || course.descEn) : (course.descEn || course.descAr)}
                          </p>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '.72rem', color: 'var(--tc-xmuted)' }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="11" height="11"><polyline points="20 6 9 17 4 12"/></svg>
                          {isAr ? 'تاريخ التعيين:' : 'Assigned on:'} {new Date(course.assignedAt).toLocaleDateString(isAr ? 'ar' : 'en', { year:'numeric', month:'long', day:'numeric' })}
                        </div>
                      </div>
                    )}

                    {/* Footer: expand hint + date */}
                    <div style={{ marginTop: 'auto', paddingTop: 8, borderTop: isOpen ? 'none' : '1px solid var(--tc-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ fontSize: '.7rem', color: 'var(--tc-xmuted)', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="10" height="10"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                        {new Date(course.assignedAt).toLocaleDateString(isAr ? 'ar' : 'en', { month:'short', day:'numeric', year:'numeric' })}
                      </div>
                      <span style={{ fontSize: '.7rem', color: lm?.color || 'var(--tc-gold)', fontWeight: 700 }}>
                        {isOpen ? (isAr ? 'إخفاء ▲' : 'Less ▲') : (isAr ? 'التفاصيل ▼' : 'Details ▼')}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

function isProfileComplete(p) {
  if (!p) return false
  return !!(
    p.name?.trim() &&
    p.phone?.trim() &&
    p.country?.trim() &&
    p.dob &&
    p.gender?.trim() &&
    p.educationLevel?.trim() &&
    p.englishLevel?.trim() &&
    p.teachingExperience !== null && p.teachingExperience !== undefined && p.teachingExperience !== ''
  )
}

/* ─── Sidebar icons ───────────────────────────────────────────────── */
function Icon({ name, size = 17, color = 'currentColor' }) {
  const s = { stroke: color, fill: 'none', strokeWidth: '1.8', width: size, height: size, style: { flexShrink: 0 } }
  switch (name) {
    case 'dashboard':  return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
    case 'classes':    return <svg viewBox="0 0 24 24" {...s}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
    case 'students':   return <svg viewBox="0 0 24 24" {...s}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
    case 'assign':     return <svg viewBox="0 0 24 24" {...s}><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>
    case 'attend':     return <svg viewBox="0 0 24 24" {...s}><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
    case 'grades':     return <svg viewBox="0 0 24 24" {...s}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
    case 'schedule':   return <svg viewBox="0 0 24 24" {...s}><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
    case 'resources':  return <svg viewBox="0 0 24 24" {...s}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
    case 'messages':   return <svg viewBox="0 0 24 24" {...s}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
    case 'settings':   return <svg viewBox="0 0 24 24" {...s}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
    case 'user':       return <svg viewBox="0 0 24 24" {...s}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
    case 'logout':     return <svg viewBox="0 0 24 24" {...s}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
    case 'book':       return <svg viewBox="0 0 24 24" {...s}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
    default:           return null
  }
}


/* ─── Dashboard tab ───────────────────────────────────────────────── */
function DashboardTab({ user, isAr }) {
  const h = new Date().getHours()
  const greeting = isAr
    ? (h < 12 ? 'صباح الخير' : h < 17 ? 'مساء الخير' : 'مساء النور')
    : (h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening')
  const firstName = user?.name?.split(' ')[0] || (isAr ? 'معلّم' : 'Teacher')

  const STATS = [
    { icon: 'classes',  en: 'Active Classes',    ar: 'الصفوف النشطة',    value: '—', color: '#c9932c' },
    { icon: 'students', en: 'Total Students',    ar: 'إجمالي الطلاب',    value: '—', color: '#ae6d0c' },
    { icon: 'assign',   en: 'Pending Reviews',   ar: 'مراجعات معلّقة',   value: '—', color: '#c9932c' },
    { icon: 'attend',   en: 'Today\'s Sessions', ar: 'جلسات اليوم',      value: '—', color: '#10b981' },
  ]

  return (
    <div style={{ padding: '28px 24px', maxWidth: 980, margin: '0 auto' }}>
      {/* Welcome banner */}
      <div style={{ background: 'linear-gradient(135deg, #0a1822 0%, #10222b 100%)', borderRadius: 16, padding: '28px 32px', marginBottom: 28, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(201,147,44,.18) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: -40, left: '30%', width: 160, height: 160, borderRadius: '50%', background: 'radial-gradient(circle, rgba(174,109,12,.12) 0%, transparent 65%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: '.72rem', fontWeight: 700, letterSpacing: isAr ? 0 : '.14em', color: 'rgba(201,147,44,.7)', marginBottom: 6 }}>
            {isAr ? 'بوابة المعلم' : 'TEACHER PORTAL'}
          </div>
          <h1 style={{ fontSize: 'clamp(1.2rem, 2.5vw, 1.7rem)', fontWeight: 900, color: '#fff', lineHeight: 1.2, marginBottom: 8 }}>
            {greeting}, <span style={{ color: '#c9932c' }}>{firstName}</span>
          </h1>
          <p style={{ fontSize: '.88rem', color: 'rgba(255,255,255,.45)', maxWidth: 420 }}>
            {isAr ? 'مرحباً بك في بوابة التدريس. إليك ملخص يومك.' : "Welcome to your teaching portal. Here's your day at a glance."}
          </p>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        {STATS.map(s => (
          <div key={s.en} style={{ background: 'var(--tc-surface)', border: '1px solid var(--tc-border)', borderRadius: 14, padding: '18px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}18`, border: `1px solid ${s.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={s.icon} size={17} color={s.color} />
            </div>
            <div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--tc-text)', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '.74rem', color: 'var(--tc-muted)', marginTop: 4 }}>{isAr ? s.ar : s.en}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Placeholder sections */}
      {[
        { en: "Today's Classes", ar: 'صفوف اليوم', icon: 'classes' },
        { en: 'Pending Assignments', ar: 'الواجبات المعلّقة', icon: 'assign' },
      ].map(sec => (
        <div key={sec.en} style={{ background: 'var(--tc-surface)', border: '1px solid var(--tc-border)', borderRadius: 14, padding: '20px 22px', marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <Icon name={sec.icon} size={16} color="var(--tc-gold)" />
            <span style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--tc-text)' }}>{isAr ? sec.ar : sec.en}</span>
          </div>
          <div style={{ padding: '28px 0', textAlign: 'center', color: 'var(--tc-xmuted)', fontSize: '.84rem' }}>
            {isAr ? 'لا يوجد محتوى بعد.' : 'No content yet — data will appear here soon.'}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Main component ──────────────────────────────────────────────── */
export default function TeacherPage() {
  const router = useRouter()
  const { lang, dir, toggleLang } = useLang()
  const { theme, toggleTheme } = useTheme()
  const isAr  = lang === 'ar'
  const isDark = theme === 'dark'

  const [user,            setUser]            = useState(null)
  const [loading,         setLoading]         = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)
  const [sidebarOpen,     setSidebarOpen]     = useState(true)
  const [search,          setSearch]          = useState('')
  const [activeTab,       setActiveTab]       = useState('dashboard')

  useEffect(() => {
    if (window.innerWidth < 768) setSidebarOpen(false)
  }, [])

  useEffect(() => {
    async function init() {
      const res  = await fetch('/api/auth/me')
      const data = await res.json()
      if (!data.user)                                            { router.replace('/login');  return }
      if (!data.user.isTeacher && !data.user.hasAdminAccess)    { router.replace('/portal'); return }
      setUser(data.user)

      const [profileRes, schedRes] = await Promise.all([
        fetch('/api/profile'),
        fetch('/api/teacher/schedule'),
      ])
      const profileData = profileRes.ok ? await profileRes.json() : null
      const schedData   = schedRes.ok  ? await schedRes.json()  : null
      const profileComplete = isProfileComplete(profileData)
      const hasSchedule     = !!(schedData?.schedule)

      if (!profileComplete) {
        setNeedsOnboarding(true)
      } else if (!hasSchedule) {
        try { localStorage.setItem('ga_teacher_onboard_slide', '2') } catch {}
        setNeedsOnboarding(true)
      } else {
        setNeedsOnboarding(false)
      }

      setLoading(false)
    }
    init()
  }, [router])

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
  }

  const SW = sidebarOpen ? 264 : 68
  const ff = isAr ? "var(--font-tajawal,'Tajawal',sans-serif)" : "var(--font-gotham,'Gotham',sans-serif)"

  /* — loading — */
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: isDark ? '#0d1b24' : '#f8fafc', padding: '40px 24px' }}>
        <style>{`@keyframes ldFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-22px) scale(1.03)}}@keyframes ldFadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}`}</style>
        <img src="/images/loading.svg" alt="" style={{ width: 'min(500px,82vw)', height: 'min(500px,82vw)', objectFit: 'contain', animation: 'ldFloat 2.8s ease-in-out infinite' }} />
        <div style={{ textAlign: 'center', marginTop: 4, animation: 'ldFadeUp .55s ease both' }}>
          <div style={{ fontSize: 'clamp(1.7rem,4vw,2.5rem)', fontWeight: 900, color: '#c9932c', letterSpacing: isAr ? 0 : '-.02em', lineHeight: 1.1, fontFamily: isAr ? "'Tajawal',sans-serif" : "'Gotham',sans-serif", direction: dir }}>
            {isAr ? 'الصبر ... بيحمل' : 'Hold your horses'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {needsOnboarding && (
        <TeacherOnboardingOverlay
          isAr={isAr}
          isDark={isDark}
          onGoToSchedule={() => { setNeedsOnboarding(false); setActiveTab('schedule') }}
        />
      )}
      <style>{`
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
        @keyframes tcFadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

        :root{
          --tc-bg:#f8fafc; --tc-surface:#ffffff; --tc-sidebar:#ffffff;
          --tc-border:#e5e7eb; --tc-text:#111827; --tc-muted:#6b7280; --tc-xmuted:#9ca3af;
          --tc-shadow:0 1px 3px rgba(0,0,0,.07); --tc-shadow-md:0 4px 20px rgba(0,0,0,.09);
          --tc-hover:#f3f4f6; --tc-gold:#c9932c;
          --tc-gold-bg:rgba(201,147,44,.08); --tc-gold-bd:rgba(201,147,44,.22);
        }
        [data-theme="dark"]{
          --tc-bg:#0d1b24; --tc-surface:#10222b; --tc-sidebar:#0a1b22;
          --tc-border:rgba(255,255,255,.07); --tc-text:#f1f5f9;
          --tc-muted:rgba(255,255,255,.45); --tc-xmuted:rgba(255,255,255,.22);
          --tc-shadow:0 1px 4px rgba(0,0,0,.35); --tc-shadow-md:0 4px 20px rgba(0,0,0,.4);
          --tc-hover:rgba(255,255,255,.04);
          --tc-gold-bg:rgba(201,147,44,.1); --tc-gold-bd:rgba(201,147,44,.28);
        }

        .tc-root{display:flex;min-height:100vh;background:var(--tc-bg);color:var(--tc-text);font-family:${ff};direction:${dir}}

        /* ── SIDEBAR ── */
        .tc-sb{
          position:fixed;top:0;${isAr ? 'right' : 'left'}:0;
          width:${SW}px;height:100vh;background:var(--tc-sidebar);
          border-${isAr ? 'left' : 'right'}:1px solid var(--tc-border);
          display:flex;flex-direction:column;
          transition:width .22s cubic-bezier(.4,0,.2,1);
          z-index:100;overflow:hidden;box-shadow:var(--tc-shadow);
        }
        .tc-sb-brand{
          height:64px;flex-shrink:0;display:flex;align-items:center;
          padding:0 ${sidebarOpen ? 18 : 0}px;gap:${sidebarOpen ? 10 : 0}px;
          border-bottom:1px solid var(--tc-border);
          justify-content:${sidebarOpen ? 'flex-start' : 'center'};
          overflow:hidden;white-space:nowrap;
        }
        .tc-sb-logo{
          width:34px;height:34px;flex-shrink:0;border-radius:10px;
          background:var(--tc-gold-bg);border:1px solid var(--tc-gold-bd);
          display:flex;align-items:center;justify-content:center;
        }
        .tc-sb-lbl{opacity:${sidebarOpen ? 1 : 0};transition:opacity .12s}
        .tc-sb-name{font-size:.68rem;font-weight:800;letter-spacing:${isAr ? 0 : '.15em'};color:var(--tc-gold)}
        .tc-sb-tag{font-size:.54rem;letter-spacing:${isAr ? 0 : '.1em'};color:var(--tc-xmuted);margin-top:2px}

        .tc-sb-nav{flex:1;overflow-y:auto;overflow-x:hidden;padding:10px 0;scrollbar-width:thin;scrollbar-color:var(--tc-border) transparent}

        .tc-ni{
          display:flex;align-items:center;
          gap:${sidebarOpen ? 10 : 0}px;
          padding:9px ${sidebarOpen ? 14 : 0}px;
          margin:1px ${sidebarOpen ? 8 : 6}px;
          border-radius:10px;cursor:pointer;
          transition:all .15s;white-space:nowrap;overflow:hidden;
          justify-content:${sidebarOpen ? 'flex-start' : 'center'};
          color:var(--tc-muted);font-size:.84rem;font-weight:500;border:none;
          background:none;width:calc(100% - ${sidebarOpen ? 16 : 12}px);
          font-family:inherit;text-align:${isAr ? 'right' : 'left'};
        }
        .tc-ni:hover{background:var(--tc-hover);color:var(--tc-text)}
        .tc-ni.active{background:var(--tc-gold-bg);color:var(--tc-gold);font-weight:600}
        .tc-ni-lbl{opacity:${sidebarOpen ? 1 : 0};transition:opacity .12s;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis}

        .tc-sb-divider{height:1px;background:var(--tc-border);margin:6px 12px}
        .tc-sb-bot{padding:10px 0;border-top:1px solid var(--tc-border);flex-shrink:0}
        .tc-ni-logout{color:#ef4444 !important}
        .tc-ni-logout:hover{background:rgba(239,68,68,.07) !important}

        /* ── MAIN ── */
        .tc-main{
          ${isAr ? 'margin-right' : 'margin-left'}:${SW}px;
          flex:1;min-height:100vh;display:flex;flex-direction:column;
          transition:${isAr ? 'margin-right' : 'margin-left'} .22s cubic-bezier(.4,0,.2,1);
        }
        .tc-content{flex:1;animation:tcFadeUp .25s ease}

        .tc-backdrop{display:none;position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:99}
        @media(max-width:768px){
          .tc-backdrop{display:block}
          .tc-sb{
            width:min(80vw,280px) !important;
            transition:transform .22s cubic-bezier(.4,0,.2,1) !important;
            transform:${sidebarOpen ? 'none' : (isAr ? 'translateX(100%)' : 'translateX(-100%)')};
          }
          .tc-main{margin-left:0 !important;margin-right:0 !important}
        }
        @media(max-width:480px){
          .tc-content>div{padding-left:16px !important;padding-right:16px !important}
          .tc-content>div>div{grid-template-columns:repeat(2,1fr) !important}
        }
      `}</style>

      <div className="tc-root">

        {/* Mobile backdrop */}
        {sidebarOpen && <div className="tc-backdrop" onClick={() => setSidebarOpen(false)} />}

        {/* ── SIDEBAR ── */}
        <aside className="tc-sb">
          <div className="tc-sb-brand">
            <div className="tc-sb-logo">
              <Image src="/images/logo.png" alt="" width={20} height={20} style={{ objectFit: 'contain' }} />
            </div>
            <div className="tc-sb-lbl">
              <div className="tc-sb-name">GRACE ACADEMY</div>
              <div className="tc-sb-tag">{isAr ? 'بوابة المعلم' : 'TEACHER PORTAL'}</div>
            </div>
          </div>

          <nav className="tc-sb-nav">
            <button
              className={`tc-ni${activeTab === 'dashboard' ? ' active' : ''}`}
              onClick={() => setActiveTab('dashboard')}
              title={sidebarOpen ? undefined : (isAr ? 'الرئيسية' : 'Dashboard')}
            >
              <Icon name="dashboard" size={17} color={activeTab === 'dashboard' ? 'var(--tc-gold)' : 'currentColor'} />
              <span className="tc-ni-lbl">{isAr ? 'الرئيسية' : 'Dashboard'}</span>
            </button>
            <button
              className={`tc-ni${activeTab === 'courses' ? ' active' : ''}`}
              onClick={() => setActiveTab('courses')}
              title={sidebarOpen ? undefined : (isAr ? 'كتالوج الدورات' : 'Course Catalog')}
            >
              <Icon name="book" size={17} color={activeTab === 'courses' ? 'var(--tc-gold)' : 'currentColor'} />
              <span className="tc-ni-lbl">{isAr ? 'كتالوج الدورات' : 'Course Catalog'}</span>
            </button>
            <button
              className={`tc-ni${activeTab === 'assigned' ? ' active' : ''}`}
              onClick={() => setActiveTab('assigned')}
              title={sidebarOpen ? undefined : (isAr ? 'دوراتي' : 'My Courses')}
            >
              <Icon name="assign" size={17} color={activeTab === 'assigned' ? 'var(--tc-gold)' : 'currentColor'} />
              <span className="tc-ni-lbl">{isAr ? 'الدورات المعيّنة' : 'Assigned Courses'}</span>
            </button>
            <button
              className={`tc-ni${activeTab === 'schedule' ? ' active' : ''}`}
              onClick={() => setActiveTab('schedule')}
              title={sidebarOpen ? undefined : (isAr ? 'جدولي' : 'My Schedule')}
            >
              <Icon name="schedule" size={17} color={activeTab === 'schedule' ? 'var(--tc-gold)' : 'currentColor'} />
              <span className="tc-ni-lbl">{isAr ? 'جدولي الأسبوعي' : 'My Schedule'}</span>
            </button>
            <button
              className={`tc-ni${activeTab === 'requests' ? ' active' : ''}`}
              onClick={() => setActiveTab('requests')}
              title={sidebarOpen ? undefined : (isAr ? 'طلباتي' : 'My Requests')}
            >
              <Icon name="messages" size={17} color={activeTab === 'requests' ? 'var(--tc-gold)' : 'currentColor'} />
              <span className="tc-ni-lbl">{isAr ? 'طلبات التغيير' : 'My Requests'}</span>
            </button>
          </nav>

          <div className="tc-sb-bot">
            <div className="tc-sb-divider" />
            <Link href="/profile" style={{ textDecoration: 'none' }}>
              <button className="tc-ni" title={sidebarOpen ? undefined : (isAr ? 'ملفي الشخصي' : 'My Profile')}>
                <Icon name="user" size={17} color="currentColor" />
                <span className="tc-ni-lbl">{isAr ? 'ملفي الشخصي' : 'My Profile'}</span>
              </button>
            </Link>
            <button className="tc-ni tc-ni-logout" onClick={handleLogout}>
              <Icon name="logout" size={17} color="currentColor" />
              <span className="tc-ni-lbl">{isAr ? 'تسجيل الخروج' : 'Log Out'}</span>
            </button>
          </div>
        </aside>

        {/* ── MAIN ── */}
        <div className="tc-main">

          <PortalTopbar
            user={user} isAr={isAr} isDark={isDark}
            toggleLang={toggleLang} toggleTheme={toggleTheme}
            sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(o => !o)}
            search={search} onSearchChange={setSearch}
            onLogout={handleLogout}
            notificationBell={<NotificationBell isDark={isDark} isAr={isAr} userId={user?.id} portalPath="/teacher" />}
          />

          {/* ── BREADCRUMB ── */}
          <Breadcrumb
            isAr={isAr}
            isDark={isDark}
            crumbs={[
              { label: isAr ? 'بوابة المعلم' : 'Teacher Portal', onClick: activeTab !== 'dashboard' ? () => setActiveTab('dashboard') : undefined },
              {
                label: activeTab === 'courses'  ? (isAr ? 'كتالوج الدورات' : 'Course Catalog')
                      : activeTab === 'assigned' ? (isAr ? 'الدورات المعيّنة' : 'Assigned Courses')
                      : activeTab === 'schedule' ? (isAr ? 'جدولي الأسبوعي' : 'My Schedule')
                      : activeTab === 'requests' ? (isAr ? 'طلبات التغيير' : 'My Requests')
                      : (isAr ? 'الرئيسية' : 'Dashboard')
              },
            ]}
          />

          <main className="tc-content">
            {activeTab === 'courses'
              ? <div style={{ padding: '24px' }}><CourseCatalog basePath="/teacher/courses" isAr={isAr} isDark={isDark} /></div>
              : activeTab === 'assigned'
              ? <AssignedCoursesTab isAr={isAr} isDark={isDark} />
              : activeTab === 'schedule'
              ? <TeacherWeeklySchedule isAr={isAr} isDark={isDark} onScheduleSaved={() => setNeedsOnboarding(false)} />
              : activeTab === 'requests'
              ? <TeacherSlotRequests user={user} isAr={isAr} isDark={isDark} />
              : <DashboardTab user={user} isAr={isAr} />
            }
          </main>
        </div>
      </div>
    </>
  )
}
