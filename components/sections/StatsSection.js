'use client'

import { useLang } from '@/context/LangContext'
import AnimatedCounter from '@/components/ui/AnimatedCounter'

const ICONS = {
  reviews: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
  ),
  students: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
  ),
  courses: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
  ),
  instructors: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/></svg>
  ),
}

export default function StatsSection({ stats }) {
  const { t } = useLang()
  const items = [
    { key: 'reviews',     labelKey: 'statsReviews',     ...stats.reviews },
    { key: 'students',    labelKey: 'statsStudents',    ...stats.students },
    { key: 'courses',     labelKey: 'statsCourses',     ...stats.courses },
    { key: 'instructors', labelKey: 'statsInstructors', ...stats.instructors },
  ]

  return (
    <section className="stats-section">
      <div className="container">
        <div className="stats-section__header">
          <span className="label">{t('statsTitle')}</span>
          <p className="section-sub">{t('statsSub')}</p>
        </div>
        <div className="stats-grid">
          {items.map(({ key, labelKey, value, suffix }, i) => (
            <div
              key={key}
              className="stat-card revealed"
              style={{ transitionDelay: `${i * 80}ms` }}
            >
              <div className="stat-card__icon">{ICONS[key]}</div>
              <div className="stat-card__value">
                <span className="stat-card__num">
                  <AnimatedCounter target={value} />
                </span>
                <span className="stat-card__plus">{suffix}</span>
              </div>
              <div className="stat-card__label">{t(labelKey)}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
