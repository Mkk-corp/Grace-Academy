'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useLang } from '@/context/LangContext'
import PageHero from '@/components/sections/PageHero'

/* ── SVG icons ─────────────────────────────────────────────────────── */
const ICON_BOOK     = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
const ICON_CLOCK    = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const ICON_USERS    = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const ICON_MIC      = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
const ICON_LIBRARY  = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
const ICON_ARROW    = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>

/* ── gradient placeholders when no image ──────────────────────────── */
const GRADIENTS = [
  'linear-gradient(135deg,#1a3040 0%,#0d1b24 100%)',
  'linear-gradient(135deg,#1c2a1a 0%,#0d1b10 100%)',
  'linear-gradient(135deg,#2a1a10 0%,#1a0d05 100%)',
  'linear-gradient(135deg,#1a1040 0%,#0d0820 100%)',
  'linear-gradient(135deg,#2a1a2a 0%,#180d18 100%)',
  'linear-gradient(135deg,#102a2a 0%,#061818 100%)',
]

export default function CoursesClient() {
  const { t, lang } = useLang()
  const isAr = lang === 'ar'

  const [courses,   setCourses]   = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState('')
  const [activecat, setActivecat] = useState('all')
  const sectionRef = useRef(null)

  /* fetch courses */
  useEffect(() => {
    setLoading(true)
    setError('')
    fetch('/api/courses')
      .then(r => r.json())
      .then(d => setCourses(d.courses || []))
      .catch(() => setError(t('coursesPageError')))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  /* re-observe [data-reveal] after async render */
  useEffect(() => {
    if (loading) return
    const raf = requestAnimationFrame(() => {
      const root = sectionRef.current
      if (!root) return
      const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return
          e.target.classList.add('revealed')
          obs.unobserve(e.target)
        })
      }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' })
      root.querySelectorAll('[data-reveal]:not(.revealed)').forEach(el => obs.observe(el))
      return () => obs.disconnect()
    })
    return () => cancelAnimationFrame(raf)
  }, [loading, courses])

  /* build category list */
  const categories = useMemo(() => {
    const seen = new Map()
    courses.forEach(c => {
      if (c.category && !seen.has(c.category.id)) {
        seen.set(c.category.id, {
          id:   c.category.id,
          name: isAr ? (c.category.nameAr || c.category.nameEn) : c.category.nameEn,
        })
      }
    })
    return [...seen.values()]
  }, [courses, isAr])

  /* filter */
  const filtered = useMemo(() => {
    if (activecat === 'all') return courses
    return courses.filter(c => c.category?.id === activecat)
  }, [courses, activecat])

  return (
    <>
      <PageHero
        titleKey="coursesPageHeroTitle"
        subKey="coursesPageHeroSub"
        breadcrumbKey="coursesPageBreadCurrent"
      />

      <section className="courses-pub-section" ref={sectionRef}>
        <div className="container">

          {/* header */}
          <div data-reveal>
            <span className="label">{t('coursesPageLabel')}</span>
            <h2 className="section-title">{t('coursesPageTitle')}</h2>
          </div>

          {/* category filter */}
          {!loading && !error && categories.length > 0 && (
            <div className="courses-pub-filter" data-reveal>
              <button
                className={`courses-pub-chip${activecat === 'all' ? ' active' : ''}`}
                onClick={() => setActivecat('all')}
              >
                {t('coursesPageAll')}
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`courses-pub-chip${activecat === cat.id ? ' active' : ''}`}
                  onClick={() => setActivecat(cat.id)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* loading */}
          {loading && (
            <div className="courses-pub-state">
              <div className="courses-pub-spinner" />
            </div>
          )}

          {/* error */}
          {!loading && error && (
            <div className="courses-pub-state">
              <p className="courses-pub-msg">{error}</p>
            </div>
          )}

          {/* empty */}
          {!loading && !error && filtered.length === 0 && (
            <div className="courses-pub-state">
              <p className="courses-pub-msg">{t('coursesPageEmpty')}</p>
            </div>
          )}

          {/* grid */}
          {!loading && !error && filtered.length > 0 && (
            <div className="courses-pub-grid">
              {filtered.map((course, i) => {
                const name = isAr ? (course.nameAr || course.nameEn) : course.nameEn
                const desc = isAr ? (course.descAr || course.descEn) : course.descEn
                const catName = course.category
                  ? (isAr ? (course.category.nameAr || course.category.nameEn) : course.category.nameEn)
                  : null
                const gradient = GRADIENTS[i % GRADIENTS.length]

                const href = `/courses/${course.encId}`

                return (
                  <div
                    key={course.id}
                    className="courses-pub-card"
                    data-reveal
                    style={{ transitionDelay: `${(i % 6) * 60}ms` }}
                  >
                    {/* image / placeholder — links to detail */}
                    <Link href={href} className="courses-pub-card__img-link" style={{ background: course.image ? undefined : gradient }}>
                      {course.image
                        ? <img src={course.image} alt={name} />
                        : (
                          <div className="courses-pub-card__img-placeholder">
                            <div className="courses-pub-card__img-icon">{ICON_BOOK}</div>
                            <span className="courses-pub-card__img-initial">{name.charAt(0)}</span>
                          </div>
                        )
                      }
                      {course.level && (
                        <span className="courses-pub-card__level">{course.level}</span>
                      )}
                      {catName && (
                        <span className="courses-pub-card__cat">{catName}</span>
                      )}
                    </Link>

                    {/* body */}
                    <div className="courses-pub-card__body">
                      <Link href={href} className="courses-pub-card__title-link">
                        <h3 className="courses-pub-card__title">{name}</h3>
                      </Link>
                      <p className="courses-pub-card__desc">{desc}</p>

                      {/* meta row */}
                      <div className="courses-pub-card__meta">
                        {course.durationMonths > 0 && (
                          <span className="courses-pub-card__meta-item">
                            <span className="courses-pub-card__meta-icon">{ICON_CLOCK}</span>
                            {course.durationMonths} {t('coursesPageMonths')}
                          </span>
                        )}
                        {course.durationSessions > 0 && (
                          <span className="courses-pub-card__meta-item">
                            <span className="courses-pub-card__meta-icon">{ICON_BOOK}</span>
                            {course.durationSessions} {t('coursesPageSessions')}
                          </span>
                        )}
                        {course.studentCount > 0 && (
                          <span className="courses-pub-card__meta-item">
                            <span className="courses-pub-card__meta-icon">{ICON_USERS}</span>
                            {course.studentCount}+ {t('coursesPageStudents')}
                          </span>
                        )}
                        {course.needsSpeaking && (
                          <span className="courses-pub-card__meta-item courses-pub-card__meta-item--gold">
                            <span className="courses-pub-card__meta-icon">{ICON_MIC}</span>
                            {isAr ? 'محادثة' : 'Speaking'}
                          </span>
                        )}
                        {course.needsLibrary && (
                          <span className="courses-pub-card__meta-item courses-pub-card__meta-item--gold">
                            <span className="courses-pub-card__meta-icon">{ICON_LIBRARY}</span>
                            {isAr ? 'مكتبة' : 'Library'}
                          </span>
                        )}
                      </div>

                      {/* CTA */}
                      <Link href={href} className="courses-pub-card__cta">
                        {t('coursesPageView')}
                        <span className="courses-pub-card__cta-arrow">{ICON_ARROW}</span>
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* bottom CTA strip */}
      {!loading && !error && filtered.length > 0 && (
        <section className="courses-pub-cta">
          <div className="container">
            <div className="courses-pub-cta__inner" data-reveal>
              <h2 className="courses-pub-cta__title">
                {isAr ? 'لم تجد ما تبحث عنه؟' : "Don't see what you're looking for?"}
              </h2>
              <p className="courses-pub-cta__sub">
                {isAr
                  ? 'تواصل معنا وسنبني برنامجاً مخصصاً يناسب أهدافك تماماً.'
                  : "Contact us and we'll build a custom programme perfectly matched to your goals."}
              </p>
              <Link href="/contact" className="courses-pub-cta__btn">
                {t('coursesPageContact')}
                <span>{ICON_ARROW}</span>
              </Link>
            </div>
          </div>
        </section>
      )}

      <style>{`
        /* ── Courses public page ──────────────────────────────── */
        .courses-pub-section { padding: 100px 0 60px; }

        /* filter chips */
        .courses-pub-filter {
          display: flex; flex-wrap: wrap; gap: .6rem;
          margin: 2rem 0 2.5rem;
        }
        .courses-pub-chip {
          padding: .45rem 1.2rem; border-radius: 999px;
          border: 1px solid var(--border);
          background: transparent; color: var(--text-60);
          font-size: .8rem; font-weight: 600;
          letter-spacing: .04em; cursor: pointer;
          font-family: inherit;
          transition: all .2s;
        }
        .courses-pub-chip:hover { border-color: var(--gold); color: var(--gold); }
        .courses-pub-chip.active {
          background: var(--gold); border-color: var(--gold);
          color: var(--azure, #fff);
        }

        /* state (loading / empty / error) */
        .courses-pub-state {
          display: flex; align-items: center; justify-content: center;
          min-height: 260px;
        }
        .courses-pub-msg { color: var(--text-40); font-size: .95rem; text-align: center; }
        .courses-pub-spinner {
          width: 40px; height: 40px; border-radius: 50%;
          border: 3px solid var(--border);
          border-top-color: var(--gold);
          animation: courseSpin .8s linear infinite;
        }
        @keyframes courseSpin { to { transform: rotate(360deg); } }

        /* grid */
        .courses-pub-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.8rem;
          margin-top: 1rem;
        }

        /* card */
        .courses-pub-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: var(--r-lg, 16px);
          overflow: hidden;
          display: flex; flex-direction: column;
          transition: transform .28s ease, box-shadow .28s ease, opacity .4s ease;
          opacity: 0; transform: translateY(24px);
          position: relative;
        }
        .courses-pub-card.revealed { opacity: 1; transform: translateY(0); }
        .courses-pub-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 40px rgba(201,147,44,.12);
          border-color: var(--border-gold, rgba(201,147,44,.4));
        }

        /* image link wrapper */
        .courses-pub-card__img-link {
          display: block; width: 100%; height: 200px;
          position: relative; overflow: hidden; flex-shrink: 0; text-decoration: none;
        }
        .courses-pub-card__img-link img {
          width: 100%; height: 100%; object-fit: cover;
          transition: transform .4s ease;
        }
        .courses-pub-card:hover .courses-pub-card__img-link img { transform: scale(1.04); }
        /* title link */
        .courses-pub-card__title-link { text-decoration: none; display: block; }
        .courses-pub-card__img-placeholder {
          width: 100%; height: 100%;
          display: flex; align-items: center; justify-content: center; gap: .8rem;
          position: relative;
        }
        .courses-pub-card__img-icon { opacity: .18; }
        .courses-pub-card__img-icon svg { width: 36px; height: 36px; stroke: #c9932c; }
        .courses-pub-card__img-initial {
          position: absolute; font-size: 6rem; font-weight: 900;
          color: rgba(201,147,44,.08); letter-spacing: -.02em;
          user-select: none; pointer-events: none;
        }
        .courses-pub-card__level {
          position: absolute; top: 12px; inset-inline-start: 12px;
          background: var(--gold); color: var(--azure, #fff);
          font-size: .65rem; font-weight: 700; letter-spacing: .1em;
          text-transform: uppercase; padding: 3px 10px; border-radius: 999px;
        }
        .courses-pub-card__cat {
          position: absolute; bottom: 12px; inset-inline-end: 12px;
          background: rgba(0,0,0,.55); backdrop-filter: blur(6px);
          color: #fff; font-size: .7rem; font-weight: 600;
          padding: 3px 10px; border-radius: 999px;
        }

        /* body */
        .courses-pub-card__body {
          padding: 1.5rem; display: flex; flex-direction: column; flex: 1;
        }
        .courses-pub-card__title {
          font-size: 1.1rem; font-weight: 700; color: var(--text);
          line-height: 1.3; margin-bottom: .55rem;
          font-family: var(--font-en);
          transition: color .2s;
        }
        .courses-pub-card__title-link:hover .courses-pub-card__title { color: var(--gold); }
        .courses-pub-card__desc {
          font-size: .88rem; color: var(--text-60);
          line-height: 1.65; margin-bottom: 1.1rem;
          display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* meta row */
        .courses-pub-card__meta {
          display: flex; flex-wrap: wrap; gap: .5rem .8rem;
          margin-bottom: 1.2rem; margin-top: auto; padding-top: .8rem;
          border-top: 1px solid var(--border);
        }
        .courses-pub-card__meta-item {
          display: flex; align-items: center; gap: .3rem;
          font-size: .76rem; color: var(--text-40);
        }
        .courses-pub-card__meta-item--gold { color: var(--gold); }
        .courses-pub-card__meta-icon { display: flex; align-items: center; }
        .courses-pub-card__meta-icon svg { width: 12px; height: 12px; }

        /* CTA button */
        .courses-pub-card__cta {
          display: inline-flex; align-items: center; gap: .4rem;
          font-size: .82rem; font-weight: 700; color: var(--gold);
          text-decoration: none; letter-spacing: .03em;
          transition: gap .2s;
        }
        .courses-pub-card__cta:hover { gap: .7rem; }
        .courses-pub-card__cta-arrow { display: flex; align-items: center; }
        .courses-pub-card__cta-arrow svg { width: 14px; height: 14px; stroke: var(--gold); }

        /* bottom CTA strip */
        .courses-pub-cta {
          padding: 80px 0;
          background: var(--surface);
          border-top: 1px solid var(--border);
        }
        .courses-pub-cta__inner {
          text-align: center; max-width: 560px; margin: 0 auto;
          opacity: 0; transform: translateY(20px);
          transition: opacity .5s ease, transform .5s ease;
        }
        .courses-pub-cta__inner.revealed { opacity: 1; transform: translateY(0); }
        .courses-pub-cta__title {
          font-size: clamp(1.4rem,3vw,2rem); font-weight: 700;
          color: var(--text); margin-bottom: .8rem;
          font-family: var(--font-en);
        }
        .courses-pub-cta__sub {
          font-size: .95rem; color: var(--text-60);
          line-height: 1.7; margin-bottom: 1.8rem;
        }
        .courses-pub-cta__btn {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .9rem 2rem; border-radius: 999px;
          background: linear-gradient(135deg,#c9932c,#e8b84b);
          color: var(--azure, #fff); font-weight: 700; font-size: .9rem;
          text-decoration: none; letter-spacing: .04em;
          box-shadow: 0 4px 20px rgba(201,147,44,.35);
          transition: transform .2s, box-shadow .2s;
        }
        .courses-pub-cta__btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 28px rgba(201,147,44,.45);
        }
        .courses-pub-cta__btn svg { width: 16px; height: 16px; }

        /* responsive */
        @media(max-width:1024px) {
          .courses-pub-grid { grid-template-columns: repeat(2,1fr); }
        }
        @media(max-width:600px) {
          .courses-pub-grid { grid-template-columns: 1fr; gap: 1.4rem; }
          .courses-pub-section { padding: 60px 0 40px; }
          .courses-pub-cta { padding: 60px 0; }
        }
      `}</style>
    </>
  )
}
