'use client'

import { useState, useEffect } from 'react'
import { useLang } from '@/context/LangContext'
import PageHero from '@/components/sections/PageHero'

const WHY_ICONS = [
  <svg key="1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  <svg key="2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  <svg key="3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  <svg key="4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,
  <svg key="5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  <svg key="6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
  <svg key="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  <svg key="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>,
]

const LABELS = {
  en: {
    storyLabel:   'Our History',
    storyTitle:   'Our Story',
    mvLabel:      'Core Principles',
    missionTitle: 'Our Mission',
    visionTitle:  'Our Vision',
    goalsLabel:   'What We Stand For',
    goalsTitle:   'Our Goals',
    whyLabel:     'Why Choose Us',
    whyTitle:     'The Grace Difference',
    teamLabel:    'The People Behind Grace',
    teamTitle:    'Our Team',
  },
  ar: {
    storyLabel:   'تاريخنا',
    storyTitle:   'قصتنا',
    mvLabel:      'مبادئنا الأساسية',
    missionTitle: 'مهمتنا',
    visionTitle:  'رؤيتنا',
    goalsLabel:   'ما نؤمن به',
    goalsTitle:   'أهدافنا',
    whyLabel:     'لماذا تختارنا',
    whyTitle:     'ما يميّز جريس',
    teamLabel:    'من يقف وراء جريس',
    teamTitle:    'فريقنا',
  },
}

export default function AboutClient() {
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const L    = LABELS[isAr ? 'ar' : 'en']

  const [about,   setAbout]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/about').then(r => r.json()).then(d => {
      setAbout(d)
      setLoading(false)
      requestAnimationFrame(() => {
        const obs = new IntersectionObserver(entries => {
          entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); obs.unobserve(e.target) } })
        }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' })
        document.querySelectorAll('[data-reveal]').forEach(el => obs.observe(el))
      })
    })
  }, [])

  const hasItems = (arr) => Array.isArray(arr) && arr.length > 0
  const hasText  = (obj) => obj?.en?.trim() || obj?.ar?.trim()

  if (loading) {
    return (
      <>
        <PageHero titleKey="aboutHeroTitle" subKey="aboutHeroSub" breadcrumbKey="aboutBreadCurrent" />
        <div style={{ padding: '80px 0', textAlign: 'center', color: 'var(--text-60)' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" width="22" height="22" style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>
            <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
          </svg>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </>
    )
  }

  const kpis   = about?.kpis    || []
  const story  = about?.story   || []
  const vision = about?.vision  || {}
  const mission= about?.mission || {}
  const goals  = about?.goals   || []
  const whyUs  = about?.whyUs   || []
  const team   = about?.team    || []

  return (
    <>
      <PageHero titleKey="aboutHeroTitle" subKey="aboutHeroSub" breadcrumbKey="aboutBreadCurrent" />

      <style>{`
        /* ── KPIs ── */
        .ab-kpis { padding: 56px 0; border-bottom: 1px solid var(--border); }
        .ab-kpis__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 20px; }
        .ab-kpi { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 28px 20px; text-align: center; }
        .ab-kpi__value { font-size: clamp(2rem, 5vw, 3rem); font-weight: 900; color: var(--gold); line-height: 1; margin-bottom: 8px; font-variant-numeric: tabular-nums; }
        .ab-kpi__label { font-size: .82rem; color: var(--text-60); font-weight: 600; letter-spacing: .05em; text-transform: uppercase; }

        /* ── Story ── */
        .ab-story { padding: 80px 0; }
        .ab-story__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; }
        .ab-story__content p { font-size: .96rem; color: var(--text-60); line-height: 1.85; margin-bottom: 1.1rem; }
        .ab-story__content p:last-child { margin-bottom: 0; }
        .ab-story__visual { background: var(--surface); border: 1px solid var(--border); border-radius: 24px; aspect-ratio: 4/3; display: flex; align-items: center; justify-content: center; }
        .ab-story__emblem { font-size: 5rem; font-weight: 900; color: var(--gold); opacity: .3; letter-spacing: -.04em; }
        @media(max-width:768px){ .ab-story__grid { grid-template-columns: 1fr; gap: 32px; } .ab-story__visual { display: none; } }

        /* ── Mission & Vision ── */
        .ab-mv { padding: 80px 0; background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .ab-mv__grid { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; margin-top: 40px; }
        .ab-mv__card { background: var(--bg); border: 1px solid var(--border); border-radius: 20px; padding: 36px 32px; position: relative; overflow: hidden; }
        .ab-mv__card::before { content: ''; position: absolute; inset: 0; pointer-events: none; background: radial-gradient(ellipse 60% 80% at 0% 0%, rgba(201,147,44,.06) 0%, transparent 70%); }
        .ab-mv__icon { width: 52px; height: 52px; border-radius: 14px; background: rgba(201,147,44,.1); border: 1px solid rgba(201,147,44,.2); display: flex; align-items: center; justify-content: center; color: var(--gold); margin-bottom: 20px; }
        .ab-mv__title { font-size: 1.1rem; font-weight: 800; color: var(--text); margin-bottom: 12px; }
        .ab-mv__body { font-size: .9rem; color: var(--text-60); line-height: 1.8; }
        @media(max-width:640px){ .ab-mv__grid { grid-template-columns: 1fr; } }

        /* ── Goals ── */
        .ab-goals { padding: 80px 0; }
        .ab-goals__list { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .ab-goal { display: flex; align-items: flex-start; gap: 14px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 18px 20px; }
        .ab-goal__dot { width: 10px; height: 10px; border-radius: 50%; background: var(--gold); flex-shrink: 0; margin-top: 6px; }
        .ab-goal__text { font-size: .92rem; color: var(--text-60); line-height: 1.65; }
        @media(max-width:640px){ .ab-goals__list { grid-template-columns: 1fr; } }

        /* ── Why Us ── */
        .ab-why { padding: 80px 0; background: var(--surface); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
        .ab-why__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; margin-top: 40px; }
        .ab-why__card { background: var(--bg); border: 1px solid var(--border); border-radius: 16px; padding: 28px 24px; }
        .ab-why__icon { width: 48px; height: 48px; border-radius: 12px; background: rgba(201,147,44,.1); border: 1px solid rgba(201,147,44,.2); display: flex; align-items: center; justify-content: center; color: var(--gold); margin-bottom: 16px; }
        .ab-why__title { font-size: .96rem; font-weight: 700; color: var(--text); margin-bottom: 8px; }
        .ab-why__body { font-size: .86rem; color: var(--text-60); line-height: 1.7; }

        /* ── Team ── */
        .ab-team { padding: 80px 0; }
        .ab-team__grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 20px; margin-top: 40px; }
        .ab-team__card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 28px 20px; text-align: center; }
        .ab-team__avatar { width: 64px; height: 64px; border-radius: 50%; background: rgba(201,147,44,.12); border: 2px solid rgba(201,147,44,.3); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 900; color: var(--gold); margin: 0 auto 16px; }
        .ab-team__name { font-size: .96rem; font-weight: 700; color: var(--text); margin-bottom: 4px; }
        .ab-team__role { font-size: .8rem; color: var(--text-60); font-weight: 600; }

        /* ── shared ── */
        .ab-label { font-size: .72rem; font-weight: 700; letter-spacing: .14em; color: var(--gold); text-transform: uppercase; margin-bottom: 10px; }
        .ab-title { font-size: clamp(1.6rem, 3vw, 2.4rem); font-weight: 900; color: var(--text); line-height: 1.2; }

        [data-reveal] { opacity: 0; transform: translateY(18px); transition: opacity .5s ease, transform .5s ease; }
        [data-reveal].revealed { opacity: 1; transform: none; }
      `}</style>

      {/* ── KPIs ── */}
      {hasItems(kpis) && (
        <section className="ab-kpis">
          <div className="container">
            <div className="ab-kpis__grid">
              {kpis.map(k => (
                <div key={k.id} className="ab-kpi" data-reveal>
                  <div className="ab-kpi__value">{k.value}</div>
                  <div className="ab-kpi__label">{isAr ? k.labelAr : k.labelEn}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Story ── */}
      {hasItems(story) && (
        <section className="ab-story">
          <div className="container">
            <div className="ab-story__grid">
              <div className="ab-story__content" data-reveal>
                <p className="ab-label">{L.storyLabel}</p>
                <h2 className="ab-title" style={{ marginBottom: 28 }}>{L.storyTitle}</h2>
                {story.map(p => (
                  <p key={p.id}>{isAr ? p.ar : p.en}</p>
                ))}
              </div>
              <div className="ab-story__visual" data-reveal="right">
                <span className="ab-story__emblem">GA</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Mission & Vision ── */}
      {(hasText(mission) || hasText(vision)) && (
        <section className="ab-mv">
          <div className="container">
            <div data-reveal>
              <p className="ab-label">{L.mvLabel}</p>
            </div>
            <div className="ab-mv__grid">
              {hasText(mission) && (
                <div className="ab-mv__card" data-reveal>
                  <div className="ab-mv__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                      <polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <h3 className="ab-mv__title">{L.missionTitle}</h3>
                  <p className="ab-mv__body">{isAr ? mission.ar : mission.en}</p>
                </div>
              )}
              {hasText(vision) && (
                <div className="ab-mv__card" data-reveal>
                  <div className="ab-mv__icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="22" height="22">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </div>
                  <h3 className="ab-mv__title">{L.visionTitle}</h3>
                  <p className="ab-mv__body">{isAr ? vision.ar : vision.en}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ── Goals ── */}
      {hasItems(goals) && (
        <section className="ab-goals">
          <div className="container">
            <div data-reveal>
              <p className="ab-label">{L.goalsLabel}</p>
              <h2 className="ab-title">{L.goalsTitle}</h2>
            </div>
            <ul className="ab-goals__list" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {goals.map(g => (
                <li key={g.id} className="ab-goal" data-reveal>
                  <span className="ab-goal__dot" />
                  <span className="ab-goal__text">{isAr ? g.ar : g.en}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Why Us ── */}
      {hasItems(whyUs) && (
        <section className="ab-why">
          <div className="container">
            <div data-reveal>
              <p className="ab-label">{L.whyLabel}</p>
              <h2 className="ab-title">{L.whyTitle}</h2>
            </div>
            <div className="ab-why__grid">
              {whyUs.map((w, i) => (
                <div key={w.id} className="ab-why__card" data-reveal>
                  <div className="ab-why__icon">{WHY_ICONS[i % WHY_ICONS.length]}</div>
                  <h3 className="ab-why__title">{isAr ? w.titleAr : w.titleEn}</h3>
                  <p className="ab-why__body">{isAr ? w.bodyAr : w.bodyEn}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Team ── */}
      {hasItems(team) && (
        <section className="ab-team">
          <div className="container">
            <div data-reveal>
              <p className="ab-label">{L.teamLabel}</p>
              <h2 className="ab-title">{L.teamTitle}</h2>
            </div>
            <div className="ab-team__grid">
              {team.map(m => (
                <div key={m.id} className="ab-team__card" data-reveal>
                  <div className="ab-team__avatar">{(m.name || '?').charAt(0).toUpperCase()}</div>
                  <div className="ab-team__name">{m.name}</div>
                  <div className="ab-team__role">{isAr ? m.roleAr : m.roleEn}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
